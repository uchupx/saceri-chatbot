package whatsapp

import (
	"strings"

	"github.com/sirupsen/logrus"
	"github.com/uchupx/saceri-chatbot/internal/ai/gemini"
	"github.com/uchupx/saceri-chatbot/internal/config"
	"github.com/uchupx/saceri-chatbot/internal/redis"
	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/types/events"
)

type WhatsApp struct {
	client *whatsmeow.Client
	id     string
	redis  *redis.WaRedis
	log    *LogrusLogger
	ai     *gemini.Gemini
}

func (wa *WhatsApp) AddClient(client *whatsmeow.Client) {
	wa.client = client
	if client.Store.ID != nil {
		wa.SetID(client.Store.ID.String())
	}
}

func NewWhatsApp(redis *redis.WaRedis, ai *gemini.Gemini) *WhatsApp {
	conf := config.GetConfig()
	log := NewLogrusLogger(logrus.New(), conf.Log.File, conf.Log.Level, conf.App.Name, conf.App.Version)
	return &WhatsApp{
		redis: redis,
		log:   log,
		ai:    ai,
	}
}

func (wa *WhatsApp) SetID(id string) {
	wa.id = id

	wa.log.Debugf("Set WhatsApp ID to: %s", id)
}

func (wa *WhatsApp) GetID() string {
	return wa.id
}

func (wa *WhatsApp) EventHandler(evt any) {
	switch v := evt.(type) {
	case *events.Message:
		wa.log.Infof("Received a message from: %s", stripDeviceIdentifier(v.Info.Sender.String()))

		wa.EventMessage(v)
	}
}

func getQuotedMessageText(quote *waProto.Message) string {
	if quote.GetConversation() != "" {
		return quote.GetConversation()
	}
	if extendedText := quote.GetExtendedTextMessage(); extendedText != nil {
		return extendedText.GetText()
	}
	return ""
}

func stripDeviceIdentifier(id string) string {
	parts := strings.Split(id, "@")
	if len(parts) != 2 {
		return id // Return original if not in expected format
	}
	userPart := strings.Split(parts[0], ":")
	return userPart[0] + "@" + parts[1]
}
