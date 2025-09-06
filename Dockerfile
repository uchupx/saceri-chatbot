FROM golang:1.24-alpine AS builder

LABEL authors="uchupx"

RUN apk add --no-cache make git

WORKDIR /app

COPY Makefile ./

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-s -w" -o /saceri-chatbot ./cmd/main.go


FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /saceri-chatbot .

CMD ["./saceri-chatbot"]

