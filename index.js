var express = require('express');
var app = express();
var http = require('http');
var url = require("url");
var querystring = require("querystring");
var favicon = require('serve-favicon');
var path = require('path')

var localPort = 80;
var PORT = process.env.PORT || localPort;
console.log("le port de connection impossé est :" + process.env.PORT + " sinon le port par defaut est " + localPort);

var server = http.createServer(app);


app.get('/', function(req, res) {
    var param = querystring.parse(url.parse(req.url).query);
    res.render('pages/accueil.ejs', {
        url: req.headers.host,
        name: "anonymous" + Math.floor(Math.random() * Math.floor(1000))
    });
});

app.get('/pr', function(req, res) {
    var param = querystring.parse(url.parse(req.url).query);
    var pseudo;
    var colorpseudo;
    var room = false;
    if ("ps" in param) { //pseudo
        pseudo = param["ps"]
    } else {
        pseudo = "anonymous#" + Math.floor(Math.random() * Math.floor(1000));
    }

    if ("co" in param) { //color of pseudo
        colorpseudo = param["co"]
    } else {
        colorpseudo = "black";
    }

    if ("room" in param) {
        room = param["room"];
    } else {
        room = false
    }

    res.render('pages/privateroom.ejs', {
        url: req.headers.host,
        pseudo: pseudo,
        colorpseudo: colorpseudo,
        roomcode: room,
		namespace: "/privateroom"
    });
});

app.get('/join', function(req, res) {
    var param = querystring.parse(url.parse(req.url).query);
    var room = false;

    if ("room" in param) {
        room = param["room"];
    } else {
        room = false;
    }

    res.render('pages/joinroom.ejs', {
        url: req.headers.host,
        roomcode: room,
        pseudo: "anonymous" + Math.floor(Math.random() * Math.floor(1000))
    });
});

app.get('/morpion', function(req, res) {
	var param = querystring.parse(url.parse(req.url).query);
    var pseudo;
    var colorpseudo;
    var room = false;
	var LB;
	var returnLB
    if ("ps" in param) { //pseudo
        pseudo = param["ps"]
    } else {
        pseudo = "anonymous#" + Math.floor(Math.random() * Math.floor(1000));
    }

    if ("co" in param) { //color of pseudo
        colorpseudo = param["co"]
    } else {
        colorpseudo = "black";
    }

	if ("LB" in param) {
        LB = param["LB"];
    } else {
        LB = false
    }

    if ("room" in param) {
        room = param["room"];
    } else {
        room = false
    }

	if(room!=false){
		res.render('pages/morpion.ejs', {
			url: req.headers.host,
			pseudo: pseudo,
			colorpseudo: colorpseudo,
			roomcode: room,
			LB: LB,
			namespace: "/gameChat"
		});
	}else if(room==false){
		res.render('pages/accueil.ejs', {
			url: req.headers.host,
			name: "anonymous" + Math.floor(Math.random() * Math.floor(1000))
		});
	}

    
});

app.use(express.static('public')); //pour tout les fichiers publics

app.use(favicon(path.join(__dirname, 'public/imgfiles', 'favicon.ico'))) //pour la requete de la favicon

app.use(function(req, res, next) { //a mettre juste avant app.listen
    var param = querystring.parse(url.parse(req.url).query);
    res.render('pages/accueil.ejs', {
        url: req.headers.host,
        name: "anonymous" + Math.floor(Math.random() * Math.floor(1000))
    });
})

server.listen(PORT);

// Chargement de socket.io

//partie de gestion d'envoie et de resception de message du chat.

var io = require('socket.io')(server);

var allClients = []; //liste de tout les clients connecté.

var chat = io.of("/chat");
chat.on('connection', function(socket) {
    allClients.push(socket);

    socket.on('disconnect', function() {
        if (socket.pseudo != null) {
            console.log("un client s'est déconnecté :" + socket.pseudo);
            chat.emit("client_left", socket.pseudo);
        }
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
    });

    socket.on('nouveauPseudo', function(pseudo) { //fonction qui regarde si le pseudo de l'utilisateur est valide.
        var validePseudo = 1;
        for (var i = 0; i < allClients.length; i++) { //chec si le pseudo est déja pris.
            if (pseudo == allClients[i].pseudo) {
                validePseudo = 0;
            }
        }
        if (validePseudo == 1) { //le pseudo est bon.
            console.log("le pseudo du client est : " + pseudo);
            socket.pseudo = pseudo;
            socket.broadcast.emit("nouveau_client", socket.pseudo);
            socket.emit("message", {
                pseudo: "serveur",
                message: "Welcome to Board Game online !"
            }) //message afficher dans le chat quand le client est connecté
        } else { //le pseudo n'est pas bon, a modifier pour laisser le client choisire.
            var num = Math.floor(Math.random() * Math.floor(100));
            num = num.toString();
            pseudo = pseudo + "-" + num;
            console.log(pseudo);
            socket.emit("PseudoUnvalide", pseudo); //renvoi le nouveau pseudo avec un hastag
        }
    });

    socket.on('message', function(data) {
        console.log(socket.pseudo + " : " + data.message);
        socket.broadcast.emit("message", {
            pseudo: data.pseudo,
            message: data.message,
            color: data.color
        })
    });

    socket.on("ClientPing", function() {
        socket.emit("serveurPing", allClients.length); //200 is ok !
    })
});


//private room page and socket

var pr = io.of("/privateroom");

pr.on('connection', function(socket) {
    socket.emit("message", {
        pseudo: "serveur",
        message: "You are in private room !",
        color: "black"
    }) //pour indiquer la connection dans le chat de la room

    socket.on('disconnect', function() { //pour avertire les autre client que qq est parti
        if (socket.pseudo != null) {
            console.log("un client s'est déconnecté :" + socket.pseudo);
            socket.to(socket.room).emit('client_left', socket.pseudo); //pour chat
            socket.to(socket.room).emit('client_leftID', socket.id);  //pour privateroom
        }
    });

    socket.on("join_room", function(room, pseudo, colorpseudo) { //pour rejoindre une room, rentrer sa room et sont pseudo et avertire les autre clients
        socket.join(room.toString());
        socket.pseudo = pseudo;
        socket.colorpseudo = colorpseudo;
        socket.room = room;
        socket.emit("log", "tu as rejoins la room " + room);
        socket.emit("roomjoin", room);
        socket.to(room).emit('nouveau_client', pseudo);
    });

    socket.on('message', function(data, room) { //message a afficher dans le chat
        console.log(data.pseudo + " : " + data.message + " room code " + room);
        socket.to(room).broadcast.emit("message", {
            pseudo: data.pseudo,
            message: data.message,
            color: data.color
        });
    });

    socket.on("ClientPing", function() { //fonction de ping pour vérifier que la connection avec le client est toujours bonne
        socket.emit("serveurPing", {
            oui: true
        });
    })

    socket.on('roomcodeopen', function(roomcode) { //pour vérifier si la room est vide et accessible
        console.log(roomcode);
        if (NumClientsInRoom("/privateroom", roomcode) == 0) {
            socket.emit("roomcodeopen", {
                code: roomcode,
                etat: true
            })
        } else {
            socket.emit("roomcodeopen", {
                code: roomcode,
                etat: false
            })
        }
    });

    socket.on("getClientConnected1", function(room) { //nouveau client envoie son nom et son id a tout le monde
        let id = socket.id;
        socket.to(room).broadcast.emit("getClientConnected2", id, {
            pseudo: socket.pseudo,
            colorpseudo: socket.colorpseudo
        });
    })

    socket.on("getClientConnected3", function(id, data) { //les données de tout le monde son revoyé au nouveau client
        pr.to(id).emit("getClientConnected4", socket.id, data);
        io.to(id).emit("getClientConnected4", socket.id, data);
    })

    socket.on("startMorpion", (roomcode) => {
        console.log("démarrage du morpion dans le room : " + roomcode)
        let roomCode = GenerateString(6)
        socket.emit("startMorpion", roomCode)
        socket.to(roomcode).emit("startMorpion", roomCode)
    })

});


//gameChat socket
var gameChat = io.of("/gameChat")

gameChat.on("connection", (socket)=>{
    socket.emit("message", {
        pseudo: "serveur",
        message: "Welcome to chat",
        color: "black"
    }) //pour indiquer la connection dans le chat de la room

	socket.on("join_room", function(room, pseudo, colorpseudo) { //pour rejoindre une room, rentrer sa room et sont pseudo et avertire les autre clients
        socket.join(room.toString());
        socket.pseudo = pseudo;
        socket.colorpseudo = colorpseudo;
        socket.room = room;
        let first = false
        if(NumClientsInRoom("/gameChat", socket.room) == 1){
            first =true
        }
        socket.emit("roomjoin", room, socket.id, first);
        socket.to(room).emit('nouveau_client', pseudo);
    });

	socket.on('message', function(data, room) { //message a afficher dans le chat
        console.log(data.pseudo + " : " + data.message + " room code " + room);
        socket.to(room).broadcast.emit("message", {
            pseudo: data.pseudo,
            message: data.message,
            color: data.color
        });
    });

	socket.on("getClientConnected1", function(room) { //nouveau client envoie son nom et son id a tout le monde
        let id = socket.id;
        socket.to(room).broadcast.emit("getClientConnected2", id, {
            pseudo: socket.pseudo,
            colorpseudo: socket.colorpseudo
        });
    })

    socket.on("getClientConnected3", function(id, data) { //les données de tout le monde son revoyé au nouveau client
        io.to(id).emit("getClientConnected4", socket.id, data);
        gameChat.to(id).emit("getClientConnected4", socket.id, data);
    })

    socket.on("getNBplayer", (room)=>{
        socket.emit("getNBplayer", NumClientsInRoom("/gameChat", room))
    })  

    socket.on("currentLeader", function() { 
        socket.to(socket.room).broadcast.emit("getCurrentLeader", socket.id);
    })

    socket.on("getCurrentLeader", function(id, currentLeader) { 
        console.log("get current leader")
        gameChat.to(id).emit("currentLeader", currentLeader);
    })

	socket.on("ClientPing", function() { //fonction de ping pour vérifier que la connection avec le client est toujours bonne
        socket.emit("serveurPing", {
            oui: true
        }); 
    })

	socket.on('disconnect', function() { //pour avertire les autre client que qq est parti
        if (socket.pseudo != null) {
            console.log("un client s'est déconnecté :" + socket.pseudo);
            socket.to(socket.room).emit('client_left', socket.pseudo); //pour chat
            socket.to(socket.room).emit('client_leftID', socket.id);  //pour privateroom
        }
    });

	socket.on('data', function(data) { //message a afficher dans le chat
        socket.to(socket.room).emit("data", data);
    });
})


function GenerateString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function NumClientsInRoom(namespace, room) {
    var clients = io.nsps[namespace].adapter.rooms[room];
    if (clients == undefined) {
        return 0
    } else {
        return clients.length;
    }
}