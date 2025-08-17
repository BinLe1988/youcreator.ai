package config

import (
	"os"
	"strconv"
)

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	Redis     RedisConfig
	AI        AIConfig
	JWT       JWTConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	MySQL      MySQLConfig
	MongoDB    MongoDBConfig
	OpenSearch OpenSearchConfig
}

type MySQLConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
}

type MongoDBConfig struct {
	URI      string
	Database string
}

type OpenSearchConfig struct {
	Addresses []string
	Username  string
	Password  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type AIConfig struct {
	ServiceURL string
	APIKey     string
}

type JWTConfig struct {
	Secret     string
	ExpireHour int
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			MySQL: MySQLConfig{
				Host:     getEnv("MYSQL_HOST", "localhost"),
				Port:     getEnv("MYSQL_PORT", "3306"),
				User:     getEnv("MYSQL_USER", "root"),
				Password: getEnv("MYSQL_PASSWORD", ""),
				Database: getEnv("MYSQL_DATABASE", "youcreator"),
			},
			MongoDB: MongoDBConfig{
				URI:      getEnv("MONGODB_URI", "mongodb://localhost:27017"),
				Database: getEnv("MONGODB_DATABASE", "youcreator"),
			},
			OpenSearch: OpenSearchConfig{
				Addresses: []string{getEnv("OPENSEARCH_URL", "http://localhost:9200")},
				Username:  getEnv("OPENSEARCH_USERNAME", "admin"),
				Password:  getEnv("OPENSEARCH_PASSWORD", "admin"),
			},
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		AI: AIConfig{
			ServiceURL: getEnv("AI_SERVICE_URL", "http://localhost:8000"),
			APIKey:     getEnv("AI_API_KEY", ""),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key"),
			ExpireHour: getEnvAsInt("JWT_EXPIRE_HOUR", 24),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
