package config

import (
	"log"
	"os"

	"github.com/subosito/gotenv"
	"github.com/uchupx/saceri-chatbot/helper"
)

var configPath = []string{
	"./",
	"./config/",
}

type Config struct {
	Gemini struct {
		Model string
		Key   string
	}

	Default struct {
		Context          string
		IntroduceMessage string
	}
	Redis struct {
		Host              string
		Port              int
		DatabasePrimary   string
		DatabaseSecondary string
		PoolSize          string
		MinIdleConn       string
	}

	Database struct {
		Host     string
		Port     string
		Password string
		Name     string
		Username string
	}
}

var config *Config

// NewConfig is a constructor for Config
func new() *Config {
	var err error
	for _, c := range configPath {
		err = gotenv.Load(c + ".env")
		if err != nil {
			log.Printf("failed to laod config from path %s.env", c)
			continue
		}
		break
	}
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	config = &Config{}

	config.Gemini.Model = os.Getenv("GEMINI_MODEL")
	config.Gemini.Key = os.Getenv("GEMINI_KEY")

	config.Database.Host = os.Getenv("DATABASE_HOST")
	config.Database.Username = os.Getenv("DATABASE_USERNAME")
	config.Database.Password = os.Getenv("DATABASE_PASSWORD")
	config.Database.Port = os.Getenv("DATABASE_PORT")
	config.Database.Name = os.Getenv("DATABASE_NAME")

	config.Redis.Host = os.Getenv("REDIS_HOST")
	config.Redis.Port = helper.StringToInt(os.Getenv("REDIS_PORT"))
	config.Redis.DatabasePrimary = os.Getenv("REDIS_PRIMARY_DB")
	config.Redis.DatabaseSecondary = os.Getenv("REDIS_SECONDARY_DB")
	config.Redis.PoolSize = os.Getenv("REDIS_POOL_SIZE")
	config.Redis.MinIdleConn = os.Getenv("REDIS_MIN_IDLE_CONN")

	config.Default.Context = os.Getenv("DEFAULT_CONTEXT")
	config.Default.IntroduceMessage = os.Getenv("DEFAULT_INTRODUCE_MESSAGE")
	return config
}

func GetConfig() *Config {
	if config == nil {
		config = new()
	}

	return config
}
