package ai

import "encoding/json"

type HistoryJSON struct {
	Role     string `json:"role"`
	Question string `json:"question"`
}

func MarshalHistoryJSONArray(histories []HistoryJSON) ([]byte, error) {
	return json.Marshal(histories)
}

func UnmarshalHistoryJSONArray(data []byte) ([]HistoryJSON, error) {
	var histories []HistoryJSON
	err := json.Unmarshal(data, &histories)

	return histories, err
}
