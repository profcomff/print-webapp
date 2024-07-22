build:
	docker compose --file ./cicd/docker-compose.yml build

up: start
run: start
start: stop
	docker compose --file ./cicd/docker-compose.yml up --detach

stop:
	docker compose --file ./cicd/docker-compose.yml down

configure:
	npm install

format:
	npm run lint
	npm run format
	npm run stylelint
