package whatsapp
import (
    "github.com/sirupsen/logrus"
    waLog "go.mau.fi/whatsmeow/util/log"
)

type LogrusLogger struct {
    log *logrus.Logger
}

func NewLogrusLogger(log *logrus.Logger) *LogrusLogger {
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
