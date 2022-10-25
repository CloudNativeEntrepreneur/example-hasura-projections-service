SERVICE_NAME := example-hasura-projections-service
NOW := $(shell date +%m_%d_%Y_%H_%M)
LOCAL_DEV_CLUSTER ?= rancher-desktop

install:
	npm ci

dev:
	npm run dev

onboard: deploy-to-local-cluster install

open:
	code .

connect-to-local-dev-cluster:
	kubectl ctx $(LOCAL_DEV_CLUSTER)
	kubectl port-forward --namespace knative-eventing svc/broker-ingress 8080:80 &

build-new-local-image:
	kubectl ctx $(LOCAL_DEV_CLUSTER)
	docker build -t $(SERVICE_NAME) .
	docker tag $(SERVICE_NAME):latest dev.local/$(SERVICE_NAME):$(NOW)

load-local-image-to-kind:
	kubectl ctx $(LOCAL_DEV_CLUSTER)
	kind --name kind-local-dev-cluster load docker-image dev.local/$(SERVICE_NAME):$(NOW)

deploy-to-local-cluster:
	kubectl ctx $(LOCAL_DEV_CLUSTER)
	helm template ./charts/$(SERVICE_NAME)/ \
		-f ./charts/$(SERVICE_NAME)/values.yaml \
		--set image.repository=dev.local/$(SERVICE_NAME),image.tag=$(NOW),knative.eventing.local=true,knative.eventing.subscriber=http://host.docker.internal:5010 \
		| kubectl apply -f -

delete-local-deployment:
	kubectl ctx $(LOCAL_DEV_CLUSTER)
	helm template ./charts/$(SERVICE_NAME)/ \
		-f ./charts/$(SERVICE_NAME)/values.yaml \
		--set image.repository=dev.local/$(SERVICE_NAME),image.tag=$(NOW) \
		| kubectl delete -f -

refresh-kind-image: build-new-local-image load-local-image-to-kind deploy-to-local-cluster
hard-refresh-kind-image: delete-local-deployment build-new-local-image load-local-image-to-kind deploy-to-local-cluster

localizer:
	localizer expose default/$(SERVICE_NAME) --map 80:3000

stop-localizer:
	localizer expose default/$(SERVICE_NAME) --stop
