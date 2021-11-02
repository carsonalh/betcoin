# Getting Started

To be able to run the backend for this application:

- Install the node dependencies using `npm install`
- Install and run a MySQL server
- Create a `.env` file, using the following as a template:
  ```
  DB_HOST=localhost
  DB_USER=<your MySQL username>
  DB_PASSWORD=<your MySQL password>
  DB_DATABASE_NAME=betcoin
  ```
- Initialise the database with `npm run db:init`
- Start the application with `npm start`
