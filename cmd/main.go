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
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
)

func eventHandler(evt interface{}) {
	fmt.Printf("Handling event type: %T \n", evt)
	switch v := evt.(type) {
	case *events.Message:
		fmt.Println("Received a message!", v.Message.GetConversation())
		fmt.Println("Received a message!", v.Message.GetReactionMessage())
	}
}

func main() {

	log := logrus.New()
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.DebugLevel)
	conf := config.GetConfig()

	waLogger := whatsapp.NewLogrusLogger(log)

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
		Model: conf.Gemini.Model,
		Key:   conf.Gemini.Key,
		BaseContext: `Nama anda adalah minceri dari santunan ceria yang akan membantu menjawab seputar kegiatan amal yang ada di organisasi santunan ceria, berikut jadwal kegiatan amal yang akan datang: 1. 10 September 2025 Santunan anak yatim di yayasan baiturahman dengan target donasi Rp 10.000.000, 2. 10 Desember 2025 Santunan anak yatim di yayasan baiturahman dengan target donasi Rp 50.000.000. 


		Untuk Donasi bisa ke rekening ini BCA 123123123123123 a/n Minceri Saceri.

		Fokuskan jawaban Anda pada topik ini jika tidak sesuai topik makan hanya menjawab Maaf, pertanyaan anda tidak sesuai topik`,
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
				qrterminal.Generate(evt.Code, qrterminal.M, os.Stdout)
			} else {
				fmt.Println("Login event:", evt.Event)
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
