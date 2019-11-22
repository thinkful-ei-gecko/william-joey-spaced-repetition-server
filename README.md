# Wortjäger (Spaced repetition) API

## Authors
* William Bae | Github: wbae912
* Joey Romo | Github: joeyjr95

## Description
Wortjäger API is the server responsible for handling API requests for the Wortjäger (spaced repetition) application. The application is a learning app that helps users
learn German through spaced repetition.

Client:
* Live Link to application: 
* Link to application repository: https://github.com/thinkful-ei-gecko/william-joey-spaced-repetition-client

Server:
* Live Link to server: https://glacial-sands-91061.herokuapp.com
* Linke to server repository: https://github.com/thinkful-ei-gecko/william-joey-spaced-repetition-server

## Endpoints
#### Public Routes
* ```POST /api/user``` : Endpoint for user to register and create their own account for the application. Credentials are stored in the user table in the database. Field options include:
  * name (required): User's name
  * username (required): User's desired username
  * password (required): User's desired password
* ```POST /api/auth/token``` : Endpoint used to validate a user's username and password. Returns a JWT token to authorize additional requests to the API upon successful login. Field options include:
  * username (required): User's username
  * password (required): User's password


#### Private Routes
* ```GET /api/language``` : Returns the words associated with a user from the database
* ```GET /api/language/head``` : Returns the current head word/data from the database corresponding to the language.head
* ```POST /api/language/guess``` : Endpoint for user to submit their English answer/translation for the German word shown on the client. Field option includes:
  * guess (required): English translation (string) of the German word
* ```PUT /api/auth``` : Endpoint that replaces existing JWT tokens with a new token 


#### Technologies
* NodeJS
* Express
* PostgreSQL


## Local dev setup

If using user `dunder-mifflin`:

```bash
mv example.env .env
createdb -U dunder-mifflin spaced-repetition
createdb -U dunder-mifflin spaced-repetition-test
```

If your `dunder-mifflin` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DB_NAME=spaced-repetition-test npm run migrate
```

And `npm test` should work at this point

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
   3. E.g  on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`

Understanding Back-End code: https://gist.github.com/wbae912/4be13b55e29ed8e5ac56a2e2c9734271
Understanding Client-End code: https://gist.github.com/wbae912/e31f71f84134cc1a80fdacab34edaadd
