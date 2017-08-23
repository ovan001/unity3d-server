var clc = require('cli-color');
var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.green;

var io = require('socket.io')({
	transports: ['websocket'],
})

var mysql = require('mysql');
var portNumber = 8080;
var db;

function setupServer() {
	connectDatabase();
}

setupServer();

function connectDatabase() {
		db = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'unity_server'
	})

	db.connect(function(err) {
		if (err) {
	    	console.error('error connecting: ' + err.stack);
				process.exit(1);
	    	return;
		}
		console.log(notice('Database connection established'));
		startSockets();
	})

}

function startSockets() {
	io.attach(portNumber);
	console.log(notice('Server started on port: ' + portNumber));
}

var position = [0, 0, 0];
var clients = [];
var usersOnline = [];
var charactersOnline = [];

var debug = true;

io.on('connection', function(socket){
	var playersLoaded = false;
	var characters = [];
	if(socket){
		log('Client connected!');
	}

	socket.on('user register', function (data) {
		console.log('user register request');
		var error = "";
		db.query('SELECT * FROM users WHERE login = ? LIMIT 1', [data.login])
			.on('error', function (err) {
				console.log(err);
			})
			.on('result', function (result) {
				console.log(data.login + ':' + result.login)
				if(data.login == result.login) // Check if we already have such login in database
				{
					error = "user already exist";
					console.log(error);
				}
			})
			.on('end', function() {
				if(error != "") socket.emit('registration failed', {reason: 'user already exists'});
				if(error != "") return;

				// If no errors, proceed

				console.log("No such user exists, proceed.");
				db.query('INSERT INTO users(login, password, email) VALUES ( ? , ? , ? )', [data.login, data.password, data.email])
					.on('error', function (err) {
						console.log(err);
						error = "registration failed";
					})
					.on('result', function (registration_result) {
						console.log('Registration result: ', registration_result);
					})
					.on('end', function () {
						if(error == "")socket.emit('registration success');
					})
			})
	})

	socket.on('user login', function (data) {
		// console.log(notice('Got user login request!' + data));
		var userFound = false;
		// console.log(data.login);
		db.query('SELECT * FROM users WHERE login = ? LIMIT 1', [data.login])
			.on('error', function (err) {
				console.log(err);
			})
			.on('fields', function(fields) {
				// console.log(fields);
			})
			.on('result', function (result) {
				console.log('Result: ' + result.login + ":" + result.password)
				if(data.password == result.password && data.login == result.login) userFound = true;
			})
			.on('end', function() {
				if(!userFound)
					socket.emit('login failed', {code: '401'});
				else {
						console.log('emit login success');
						socket.emit('login success');
						clients.push(socket);
						usersOnline[socket.id] = data.login;
					}
			})
	})

	socket.on('character enter', function () {
		//io.sockets.emit('players online', {online: clients.length}); // Emit players count to all sockets
		Object.keys(io.sockets.sockets).forEach(function (id){
			if(id != socket.id) socket.emit('players instantiate', {name: usersOnline[id]});
			else io.sockets.emit('players instantiate', {name: usersOnline[id]});
		})
	})

	socket.on('characters request', function () {
		console.log('Start character request');
		characters = [];

		db.query('SELECT characters.name FROM characters, users WHERE characters.i_user = users.i_user AND users.login = ?', [usersOnline[socket.id]])
			.on('error', function (err) {
				console.log(err)
			})
			.on('result', function (result) {
				characters.push(result.name);
			})

			.on('end', function () {
				socket.emit('characters response', {characters: characters})
				console.log(characters)
				console.log('End character request')
			})
	})

	socket.on('disconnect', function(){
		log('Client disconnected!');
		var i = clients.indexOf(socket);
		clients.splice(i, 1);
		delete(usersOnline[socket.id]);
		io.sockets.emit('players online', {online: clients.length}); // Emit players count to all sockets
		log('Client removed! Players left: ' + clients.length);
	})
})

function log(params) {
	if(debug)
		console.log(params);
}
