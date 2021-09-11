CREATE DATABASE hackathon;
USE hackathon;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  email varchar(320) NOT NULL,
  name varchar(256) NOT NULL,
  passwordSha256 varchar(64) NOT NULL,
  privateKey varchar(64) NOT NULL,
  PRIMARY KEY (email)
);

DROP TABLE IF EXISTS friends;
CREATE TABLE friends (
  fromEmail varchar(320) NOT NULL,
  toEmail varchar(320) NOT NULL,
  PRIMARY KEY (fromEmail, toEmail),
  FOREIGN KEY (fromEmail) REFERENCES users(email),
  FOREIGN KEY (toEmail) REFERENCES users(email)    
);
