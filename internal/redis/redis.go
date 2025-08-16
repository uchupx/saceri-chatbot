package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisConfig struct {
	Host         string        `yaml:"host"`
	Password     string        `yaml:"password"`
	Database     int           `yaml:"database"`
	PoolSize     int           `yaml:"poolSize"`
	MinIdleConns int           `yaml:"minIdleConns"`
	IdleTimeout  time.Duration `yaml:"idleTimeout"`
}

type WaRedis struct {
	client *redis.Client
}

func GetConnection(c RedisConfig) (*WaRedis, error) {
	redisClient := redis.NewClient(&redis.Options{
		Addr:         c.Host,
		Password:     c.Password,
		DB:           c.Database,
		PoolSize:     c.PoolSize,
		MinIdleConns: c.MinIdleConns,
		// ConnMaxIdleTime: c.IdleTimeout,
	})

	if err := redisClient.Ping(context.TODO()).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping redis: %w", err)
	}

	return &WaRedis{
		client: redisClient,
	}, nil
}

func (wr *WaRedis) Get(ctx context.Context, key string) (string, error) {
	val, err := wr.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", nil // Key does not exist
	} else if err != nil {
		return "", fmt.Errorf("failed to get key %s: %w", key, err)
	}
	return val, nil
}

func (wr *WaRedis) Put(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	err := wr.client.Set(ctx, key, value, expiration).Err()
	if err != nil {
		return fmt.Errorf("failed to set key %s: %w", key, err)
	}
	return nil
}

func (wr *WaRedis) Del(ctx context.Context, key string) error {
	err := wr.client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete key %s: %w", key, err)
	}
	return nil
}
