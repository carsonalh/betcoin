CREATE TABLE IF NOT EXISTS users (
  `email` VARCHAR(320) NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `passwordSha256` VARCHAR(64) NOT NULL,
  `privateKey` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`email`)
);

CREATE TABLE IF NOT EXISTS friends (
  `fromEmail` VARCHAR(320) NOT NULL,
  `toEmail` VARCHAR(320) NOT NULL,
  PRIMARY KEY (`fromEmail`, `toEmail`),
  FOREIGN KEY (`fromEmail`) REFERENCES users (`email`),
  FOREIGN KEY (`toEmail`) REFERENCES users (`email`)
);
