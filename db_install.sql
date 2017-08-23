DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS updates;

CREATE TABLE users (
	i_user INT(10) AUTO_INCREMENT,
	login VARCHAR(20) NOT NULL,
	password VARCHAR(100) NOT NULL,
	email VARCHAR(20) NOT NULL,
	PRIMARY KEY (i_user)
);

CREATE TABLE characters (
	i_character INT(10) AUTO_INCREMENT,
	i_user INT(10) NOT NULL,
	name VARCHAR(16) NOT NULL,
	PRIMARY KEY (i_character),
	FOREIGN KEY (i_user) REFERENCES users (i_user)
);

CREATE TABLE updates (
	i_update INT(10) AUTO_INCREMENT,
	name VARCHAR(16) NOT NULL,
	url VARCHAR(100) NOT NULL,
	PRIMARY KEY (i_update)
);

INSERT INTO users(login, password, email) VALUES ('123', 'zYwpuN7tMj/hU4z720b8Ki6mHP1ngH8GKXCOoqbhOikZ3vPIN8Tn8sjgBnVo4yNoJ977Bck0bkdrbpVEQKkIpw==', 'blah@blah.blah');
INSERT INTO characters(i_user, name) VALUES ('1', 'BEGEMOTH');
INSERT INTO characters(i_user, name) VALUES ('1', 'Tyrant');
INSERT INTO characters(i_user, name) VALUES ('1', 'Calipso');
