#!/bin/sh
mongoimport --db social_network_db --collection users --drop --file /docker-entrypoint-initdb.d/users.json --jsonArray;
mongoimport --db social_network_db --collection questions --drop --file /docker-entrypoint-initdb.d/questions.json --jsonArray;
mongoimport --db social_network_db --collection answers --drop --file /docker-entrypoint-initdb.d/answers.json --jsonArray;
mongoimport --db social_network_db --collection topics --drop --file /docker-entrypoint-initdb.d/topics.json --jsonArray;