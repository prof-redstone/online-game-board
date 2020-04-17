var express = require('express');
var app = express();
var http = require('http');
var url = require("url");
var querystring  =require("querystring");
var favicon = require('serve-favicon');
var path = require('path')

var localPort = 8080;
var PORT = process.env.PORT || localPort;
console.log("le port de connection impossé est :" + process.env.PORT + " sinon le port par defaut est " + localPort);

var server = http.createServer(app);


app.get('/', function(req, res){
	var param = querystring.parse(url.parse(req.url).query);
	res.render('pages/accueil.ejs', {url: req.headers.host, name: "anonymous"+Math.floor(Math.random() * Math.floor(1000))});
});

app.get('/pr', function(req, res){
	var param = querystring.parse(url.parse(req.url).query);
	var pseudo;
	var colorpseudo;
	var room = false;
	//var roomname;
	if("ps" in param){ //pseudo
		pseudo = param["ps"]
	}else{
		pseudo = "anonymous#"+Math.floor(Math.random() * Math.floor(1000));
	}

	if("co" in param){//color of pseudo
		colorpseudo = param["co"]
	}else{
		colorpseudo = "black";
	}

	if("room" in param){
		room = param["room"];
	}else{
		room = false
	}

	/*if("room" in param){
		roomname = param["room"];
	}else{
		roomname = "undefined";
	}*/
	//console.log("room "+roomname+" are created");
	res.render('pages/privateroom.ejs', {url: req.headers.host, pseudo: pseudo, colorpseudo: colorpseudo, roomcode: room});
});

app.use(express.static('public'));//pour tout les fichiers publics

app.use(favicon(path.join(__dirname, 'public/imgfiles', 'favicon.ico')))//pour la requete de la favicon

app.use(function(req, res, next){ //a mettre juste avant app.listen
	res.setHeader("Content-Type", 'text/plain');
	res.status(404).send('Page introuvable ! Votre clavier a fourché. ');
})

server.listen(PORT);

// Chargement de socket.io

//partie de gestion d'envoie et de resception de message du chat.

var io = require('socket.io')(server);

var allClients = []; //liste de tout les clients connecté.

var chat = io.of("/chat");
chat.on('connection', function (socket){
	allClients.push(socket);

	socket.on('disconnect', function() {
		if(socket.pseudo != null){
			console.log("un client s'est déconnecté :" + socket.pseudo);
			chat.emit("client_left", socket.pseudo);
		}
		var i = allClients.indexOf(socket);
		allClients.splice(i, 1);
	});

	socket.on('nouveauPseudo', function(pseudo){ //fonction qui regarde si le pseudo de l'utilisateur est valide.
		var validePseudo = 1;
		for(var i = 0; i < allClients.length; i++){//chec si le pseudo est déja pris.
			if(pseudo == allClients[i].pseudo){
				validePseudo = 0;
			}
		}
		if(validePseudo == 1){ //le pseudo est bon.
			console.log("le pseudo du client est : " + pseudo);
			socket.pseudo = pseudo;
			socket.broadcast.emit("nouveau_client", socket.pseudo);
			socket.emit("message", {pseudo: "serveur", message:"you are connected to the server !"})
		}else{//le pseudo n'est pas bon, a modifier pour laisser le client choisire.
			var num = Math.floor(Math.random() * Math.floor(100));
			num = num.toString();
			pseudo = pseudo + "#" + num;
			console.log(pseudo);
			socket.emit("PseudoUnvalide", pseudo); //renvoi le nouveau pseudo avec un hastag
		}
	});

	socket.on('message', function(data){
		console.log(socket.pseudo + " : " + data.message);
		socket.broadcast.emit("message", {pseudo: data.pseudo, message: data.message, color: data.color})
	});

	socket.on("CientPing", function(){
		socket.emit("serveurPing", allClients.length); //200 is ok !
	})
});




var pr = io.of("/privateroom");
var clientPrivateRoom = {};
clientPrivateRoom.room = []

pr.on('connection', function (socket){

	socket.emit("message", {pseudo: "serveur", message:"you are connected to the server !", color: "black"})//pour indiquer la connection

	socket.on('disconnect', function() { //pour avertire les autre client que qq est parti
		if(socket.pseudo != null){
			console.log("un client s'est déconnecté :" + socket.pseudo);
			socket.to(socket.room).emit('client_left', socket.pseudo);
			socket.to(socket.room).emit('client_leftID', socket.id);
		}
	 });

	socket.on("join_room", function(room, pseudo, colorpseudo){ //pour rjoindre une room, rentrer sa room et sont pseudo et avertire les autre clients
		socket.join(room.toString());
		socket.pseudo = pseudo;
		socket.colorpseudo = colorpseudo;
		socket.room = room;
		clientPrivateRoom.room[room] = 1;
		//console.log(clientPrivateRoom);
		socket.emit("log", "tu as rejoins la room " + room);
		socket.emit("roomjoin", room);
		socket.to(room).emit('nouveau_client', pseudo);
	});

	socket.on('message', function(data, room){
		console.log(data.pseudo + " : " + data.message + " room code "+ room);
		socket.to(room).broadcast.emit("message", {pseudo: data.pseudo, message: data.message, color: data.color});
	});

	socket.on("CientPing", function(){
		socket.emit("serveurPing", {oui: true}); //200 is ok !
	})

	socket.on('roomcodeopen', function(roomcode){//pour vérifier si la room est vide et accessible
		console.log(roomcode);
		if(NumClientsInRoom("/privateroom", roomcode) == 0){
			//socket.join(roomcode);
			socket.emit("roomcodeopen", {code: roomcode, etat: true})
		}else{
			socket.emit("roomcodeopen", {code: roomcode, etat: false})
		}
		//socket.join(roomcode);
		
		//console.log(NumClientsInRoom("/privateroom", roomcode))
	});

	socket.on("getClientConnected1", function(room){
		var id = socket.id;
		console.log(id)
		console.log(1)
		socket.to(room).broadcast.emit("getClientConnected2", id, {pseudo: socket.pseudo, colorpseudo: socket.colorpseudo});
	})

	socket.on("getClientConnected3", function(id, data){
		console.log(3)
		console.log(id)
		pr.to(id).emit("getClientConnected4", id, data);
		io.to(socket.client.id).emit("getClientConnected4", id, data);
	})

});



function NumClientsInRoom(namespace, room) {
	var clients = io.nsps[namespace].adapter.rooms[room];
	//console.log(clients);
	if(clients == undefined){
		//console.log(0)
		return 0
	}else{
		//console.log(clients.length)
		return clients.length;
	}
}







