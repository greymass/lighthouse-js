SHELL := /bin/bash
TEST_FILES := $(shell find src -name '*.ts')
BIN := ./node_modules/.bin

.PHONY: dev
dev:
	bun dev

.PHONY: build
build: node_modules
	bun run build

.PHONY: test
test: build node_modules
	MOCK_DIR="tests/data/requests" bun test

.PHONY: check
check: node_modules
	@${BIN}/eslint src tests --max-warnings 0 --format unix && echo "Ok"

.PHONY: format
format: node_modules
	@${BIN}/eslint src tests --ext .ts --fix

.PHONY: distclean
distclean: clean
	rm -rf node_modules/

node_modules:
	bun install