.PHONY: vendor 



vendor:
		@echo "Installing dependencies..."
		@go mod tidy
		@go mod vendor

.DEFAULT_GOAL := build
