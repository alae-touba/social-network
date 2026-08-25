#!/bin/sh
# Runs automatically when the mongodb container initializes (docker-entrypoint-initdb.d).
set -e
for collection in users topics questions answers; do
	mongoimport --db "${MONGO_INITDB_DATABASE:-social_network_db}" \
		--authenticationDatabase admin \
		-u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
		--collection "$collection" --drop --jsonArray \
		--file "/docker-entrypoint-initdb.d/$collection.json"
done
