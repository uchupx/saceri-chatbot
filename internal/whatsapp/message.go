package whatsapp

import (
	"context"
	"fmt"
	"time"

	"github.com/uchupx/saceri-chatbot/internal/ai"
	"github.com/uchupx/saceri-chatbot/internal/config"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
)

const (
	conversationKey = "conversation"
)

func (wa *WhatsApp) ItIsHasConversation(ctx context.Context, id string) ([]ai.HistoryJSON, error) {
	message, err := wa.redis.Get(ctx, wa.generateKey(conversationKey, stripDeviceIdentifier(id)))
	if err != nil {
		wa.log.Errorf("failed to get redis key err: %+v", err)
		return nil, err
	}

	if message == "" {
		return nil, nil
	}

	histories, err := ai.UnmarshalHistoryJSONArray([]byte(message))
	if err != nil {
		wa.log.log.Errorf("failed to unmarshal history: %s, error: %+v", message, err)
	}

	return histories, nil
}

func (wa *WhatsApp) SetConversation(ctx context.Context, id string, conversation string) error {
	id = stripDeviceIdentifier(id)

	err := wa.redis.Put(ctx, wa.generateKey(conversationKey, id), conversation, time.Minute*5)
	if err != nil {
		wa.log.Errorf("failed to set redis key err: %+v", err)
		return err
	}

	return nil
}

func (wa *WhatsApp) getMessage(msg *events.Message) string {
	messageText := msg.Message.GetConversation()
	if messageText == "" {
		if textMsg := msg.Message.GetExtendedTextMessage(); textMsg != nil {
			messageText = textMsg.GetText()
		}
	}

	// Check if this message is a reply
	// if quote := msg.Message.GetExtendedTextMessage().GetContextInfo().GetQuotedMessage(); quote != nil {
	// 	// Get the text of the quoted (replied to) message
	// 	messageText = getQuotedMessageText(quote)
	// }

	return messageText
}

func (wa *WhatsApp) sendMessage(ctx context.Context, id types.JID, message string) error {
	messageWa := &waE2E.Message{
		Conversation: &message,
	}
	noDeviceID, err := types.ParseJID(stripDeviceIdentifier(id.String()))
	if err != nil {
		return err
	}

	_, err = wa.client.SendMessage(ctx, noDeviceID, messageWa)
	if err != nil {
		wa.log.Errorf("failed to send message to chat ID %s: %v", id, err)
		return err
	}
	return nil
}

func (wa *WhatsApp) isOwnMessage(msg *events.Message) bool {
	ownID := wa.GetID()
	senderID := msg.Info.Sender.String()

	ownIDStripped := stripDeviceIdentifier(ownID)
	senderIDStripped := stripDeviceIdentifier(senderID)

	return senderIDStripped == ownIDStripped && ownIDStripped != ""
}

func (wa WhatsApp) EventMessage(evt *events.Message) {
	if wa.isOwnMessage(evt) {
		return
	}
	ctx := context.Background()

	histories, err := wa.ItIsHasConversation(ctx, evt.Info.Sender.String())
	if err != nil {
		wa.log.Errorf("error: %+v", err)

		return
	}

	senderID := evt.Info.Sender
	if histories == nil {
		wa.log.Infof("start new conversation with %s", evt.Info.Sender.String())

		wa.sendMessage(ctx, senderID, wa.GetIntroduceMessage())

		if err := wa.SetConversation(ctx, senderID.String(), "[]"); err != nil {
			wa.log.Errorf("failed to set conversation key: %+v", err)

			return
		}

		return
	}

	message := wa.getMessage(evt)

	ownMessage, updatedHistories, err := wa.ai.Chat(wa.GetPromptContext(), message, wa.ai.BuildHistory(histories))
	if err != nil {
		wa.log.Errorf("failed to get response from gemini: %+v", err)

		return
	}

	tokens, err := wa.ai.CountToken(updatedHistories)
	if err != nil {
		wa.log.log.Errorf("failed to marshal history: %+v, err: %+v", histories, err)

		return
	}

	wa.log.log.Infof("total tokens :%d", tokens)

	histories = wa.ai.History(updatedHistories)

	wa.sendMessage(ctx, senderID, *ownMessage)

	marshalHistory, err := ai.MarshalHistoryJSONArray(histories)
	if err != nil {
		wa.log.log.Errorf("failed to marshal history: %+v, err: %+v", histories, err)

		return
	}

	if err := wa.SetConversation(ctx, senderID.String(), string(marshalHistory)); err != nil {
		wa.log.Errorf("failed to set conversation key: %+v", err)

		return
	}
}

func (wa WhatsApp) generateKey(key string, id string) string {
	return fmt.Sprintf("%s:%s", key, id)
}

func (wa WhatsApp) GetPromptContext() string {
	prompt, err := wa.redis.Get(context.Background(), "prompts_context")
	if err != nil {
		wa.log.Errorf("failed to get redis key: prompt_context err: %+v", err)
		return config.GetConfig().Default.Context
	}

	return prompt
}

func (wa WhatsApp) GetIntroduceMessage() string {
	intro, err := wa.redis.Get(context.Background(), "introduce_message")
	if err != nil {
		wa.log.Errorf("failed to get redis key: introduce_message err: %+v", err)
		return config.GetConfig().Default.IntroduceMessage
	}

	return intro
}
