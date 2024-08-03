IMAGE_NAME=node-typescript
IMAGE_VERSION=latest
CONTAINER_NAME=node-typescript
CURRENT_DIR=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

build-image:
	docker build -t $(IMAGE_NAME) .

run-container:
	docker run -p 8080:3000 -it --rm --name $(CONTAINER_NAME) -v "$(CURRENT_DIR):/app" $(IMAGE_NAME)
