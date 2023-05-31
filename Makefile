SERVICE_NAME := example-hasura-projections-service
NOW := $(shell date +%m_%d_%Y_%H_%M)
LOCAL_DEV_CLUSTER ?= rancher-desktop

onboard: install

install:
	npm ci

dev:
	npm run dev

open:
	code .
