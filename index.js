var express = require('express');
var app = express();
var http = require('http');
var url = require("url");
var querystring  =require("querystring");
var favicon = require('serve-favicon');
var path = require('path')

var localPort = 8080
var PORT = process.env.PORT || localPort;
console.log("le port de connection impossé est :" + process.env.PORT + " sinon le port par defaut est " + localPort);

var server = http.createServer(app);


app.get('/', function(req, res){
	console.log(req.headers.host)
	res.render('pages/accueil.ejs', {url: req.headers.host, name: "anonymous#" + Math.floor(Math.random() * Math.floor(1000))});
});

app.get('/socket.io', function(req, res){
	var param = querystring.parse(url.parse(req.url).query);
	var name;
	if("name" in param){
		name = param["name"]
	}else{
		name = "undefined";
	}
	res.render("pages/socket.io.ejs", {url: "test-1-tom.herokuapp.com", name: name});
});

app.use(express.static('public'));//pour tout les fichier public

app.use(favicon(path.join(__dirname, 'public/imgfiles', 'favicon.ico')))//pour la requete de la favicon

app.use(function(req, res, next){ //a mettre juste avant app.listen
	res.setHeader("Content-Type", 'text/plain');
	res.status(404).send('Page introuvable ! Votre clavier a fourché. ');
})


// Chargement de socket.io

//partie de gestion d'envoie et de resception de message du chat.

var io = require('socket.io')(server);
var allClients = []; //liste de tout les clients connecté.

var chat = io.of("/chat");
chat.on('connection', function (socket) {
	console.log('Un client se connecte !');

	allClients.push(socket);

	socket.on('disconnect', function() {
		console.log("un client s'est déconnecté :" + socket.pseudo);
		chat.emit("client_left", socket.pseudo);
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
			socket.emit("message", {pseudo: "serveur", message:"tu es bien connecté au serveur !"})
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
		socket.broadcast.emit("message", {pseudo: data.pseudo, message: data.message})
	});

	socket.on("CientPing", function(){
		socket.emit("serveurPing", allClients.length); //200 is ok !
	})

});

server.listen(PORT);