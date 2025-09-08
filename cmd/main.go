package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	_ "github.com/lib/pq"
	"github.com/mdp/qrterminal/v3"
	"github.com/sirupsen/logrus"
	"github.com/uchupx/saceri-chatbot/helper"
	"github.com/uchupx/saceri-chatbot/internal/ai/gemini"
	"github.com/uchupx/saceri-chatbot/internal/config"
	"github.com/uchupx/saceri-chatbot/internal/redis"
	"github.com/uchupx/saceri-chatbot/internal/whatsapp"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"
)

func main() {
	log := logrus.New()
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.DebugLevel)
	conf := config.GetConfig()

	waLogger := whatsapp.NewLogrusLogger(log, conf.Log.File, conf.Log.Level, conf.App.Name, conf.App.Version)

	waRedis, err := redis.GetConnection(redis.RedisConfig{
		Host: fmt.Sprintf("%s:%d", conf.Redis.Host, conf.Redis.Port),
		// Password:     conf.Redis.Password,
		Database:     helper.StringToInt(conf.Redis.DatabasePrimary),
		PoolSize:     helper.StringToInt(conf.Redis.PoolSize),
		MinIdleConns: helper.StringToInt(conf.Redis.MinIdleConn),
	})

	if err != nil {
		log.Fatal(err)
	}

	dbLog := waLogger.Sub("Database")
	ctx := context.Background()

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", conf.Database.Host, conf.Database.Port, conf.Database.Username, conf.Database.Password, conf.Database.Name)
	container, err := sqlstore.New(ctx, "postgres", connStr, dbLog)
	if err != nil {
		log.Fatal(err)
	}

	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		log.Fatal(err)
	}

	ai := gemini.NewGemini(gemini.GeminiParams{
		Model:       conf.Gemini.Model,
		Key:         conf.Gemini.Key,
		BaseContext: conf.Default.Context,
	})

	wa := whatsapp.NewWhatsApp(waRedis, ai)
	clientLog := waLog.Stdout("Client", "ERROR", true)
	client := whatsmeow.NewClient(deviceStore, clientLog)
	wa.AddClient(client)
	client.AddEventHandler(wa.EventHandler)

	if client.Store.ID == nil {
		qrChan, _ := client.GetQRChannel(context.Background())
		err = client.Connect()
		if err != nil {
			panic(err)
		}
		for evt := range qrChan {
			if evt.Event == "code" {
				waLogger.Infof("Scan QR code on terminal")
				qrterminal.Generate(evt.Code, qrterminal.M, os.Stdout)
			} else {
				waLogger.Infof("Connected to WhatsApp!")
			}
		}
	} else {
		err = client.Connect()
		if err != nil {
			panic(err)
		}
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	client.Disconnect()
}
