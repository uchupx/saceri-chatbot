package whatsapp

import (
	"io"
	"os"

	"github.com/sirupsen/logrus"
	waLog "go.mau.fi/whatsmeow/util/log"
)

type LogrusLogger struct {
	log *logrus.Logger
}

var mapLevel = map[string]logrus.Level{
	"debug": logrus.DebugLevel,
	"info":  logrus.InfoLevel,
	"warn":  logrus.WarnLevel,
	"error": logrus.ErrorLevel,
}

func NewLogrusLogger(log *logrus.Logger, fileLog string, level string, appName string, ver string) *LogrusLogger {
	file, err := os.OpenFile(fileLog, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Failed to open log file:", err)
	}

	multiWriter := io.MultiWriter(os.Stdout, file)
	log.SetOutput(multiWriter)

	log.SetLevel(mapLevel[level])

	log.SetFormatter(&logrus.JSONFormatter{
		FieldMap: logrus.FieldMap{
			logrus.FieldKeyTime:  "timestamp",
			logrus.FieldKeyLevel: "level",
			logrus.FieldKeyMsg:   "message",
		},
	})

	log = log.WithFields(logrus.Fields{"app_name": appName, "app_version": ver}).Logger

	return &LogrusLogger{log: log}
}

func (l *LogrusLogger) Debugf(msg string, args ...interface{}) {
	l.log.Debugf(msg, args...)
}

func (l *LogrusLogger) Infof(msg string, args ...interface{}) {
	l.log.Infof(msg, args...)
}

func (l *LogrusLogger) Warnf(msg string, args ...interface{}) {
	l.log.Warnf(msg, args...)
}

func (l *LogrusLogger) Errorf(msg string, args ...interface{}) {
	l.log.Errorf(msg, args...)
}

func (l *LogrusLogger) Sub(module string) waLog.Logger {
	return &LogrusLogger{log: l.log.WithField("module", module).Logger}
}
