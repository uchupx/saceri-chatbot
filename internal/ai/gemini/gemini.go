package gemini

import (
	"context"
	"fmt"
	"log"

	"github.com/google/generative-ai-go/genai"
	"github.com/uchupx/saceri-chatbot/internal/ai"
	"google.golang.org/api/option"
)

type GeminiParams struct {
	Model       string
	Key         string
	BaseContext string
}

type Gemini struct {
	model       string
	key         string
	baseContext string
}

func (g Gemini) Call(userInput string) (string, error) {

	prompt := fmt.Sprintf("%s\n\nPertanyaan: %s", g.baseContext, userInput)

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(g.key))

	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	model := client.GenerativeModel(g.model)
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		if text, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
			return string(text), nil
		}
	}

	return "Maaf, saya tidak dapat memproses permintaan Anda.", nil
}

func NewGemini(params GeminiParams) *Gemini {
	return &Gemini{
		model:       params.Model,
		key:         params.Key,
		baseContext: params.BaseContext,
	}
}

func (g Gemini) Chat(prompt string, userInput string, history []*genai.Content) (*string, []*genai.Content, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(g.key))

	if err != nil {
		log.Fatal(err)
	}

	defer client.Close()

	model := client.GenerativeModel(g.model)
	chat := model.StartChat()

	if len(history) == 0 {
		fmt.Println(prompt)
		history = append(history, &genai.Content{
			Role:  "model",
			Parts: []genai.Part{genai.Text(prompt)},
		})
	}

	chat.History = history

	resp, err := chat.SendMessage(ctx, genai.Text(userInput))
	if err != nil {
		return nil, nil, nil
	}

	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		if text, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
			history = append(history, &genai.Content{
				Role:  "user",
				Parts: []genai.Part{genai.Text(userInput)},
			})

			history = append(history, resp.Candidates[0].Content)

			responseText := string(text)
			return &responseText, history, nil
		}
	}

	defaultResponse := "Maaf, saya tidak dapat memproses permintaan Anda."
	return &defaultResponse, nil, nil
}

func (g Gemini) BuildHistory(histories []ai.HistoryJSON) []*genai.Content {
	contents := make([]*genai.Content, 0)

	for _, history := range histories {
		content := &genai.Content{
			Role:  history.Role,
			Parts: []genai.Part{genai.Text(history.Question)},
		}

		contents = append(contents, content)
	}

	return contents
}

func (g Gemini) History(contents []*genai.Content) []ai.HistoryJSON {
	histories := make([]ai.HistoryJSON, 0)

	for _, content := range contents {
		txt := content.Parts[0].(genai.Text)
		history := ai.HistoryJSON{
			Role:     content.Role,
			Question: string(txt),
		}

		histories = append(histories, history)
	}

	return histories
}

func (g Gemini) CountToken(contents []*genai.Content) (int32, error) {

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(g.key))

	if err != nil {
		log.Fatal(err)
	}

	defer client.Close()

	model := client.GenerativeModel(g.model)

	var parts []genai.Part
	for _, c := range contents {
		parts = append(parts, c.Parts...)
	}

	resp, err := model.CountTokens(ctx, parts...)
	if err != nil {
		return 0, err
	}

	return resp.TotalTokens, nil
}
