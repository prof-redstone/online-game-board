var roomSocket = io.connect(location.protocol + "//" + url + namespace);
var roomjoined = false;
var playerinroom = [];
var NBplayer = undefined; //nombre de player dans la salle en tout 
var connecting = false; //getclientconnected flague
var myID = undefined;
var checkLeader = false; //flague to full start game and communication  
var currentLeader = undefined;
var selfLeader = false;
var servEtatPing = 1;
var date = new Date(); //pour l'heure sur les messages

/*
1 join room, recup mon ID
2 get total client connect in room
3 envoie de nos données à tout le monde, recuperation des autres
4 si tout les joueurs ont envoyé leur coordonnées, on chercher si un leader existe
*/

roomSocket.emit("join_room", roomcode, pseudo, colorpseudo); //demande de connection a la room

roomSocket.on("roomjoin", function(room, id, first) { //connection a la room reussi 
    myID = id;
    roomjoined = true;
    if (first) {
        currentLeader = myID;
        selfLeader = true;
        checkLeader = true;
    }
    //etape 2
    roomSocket.emit("getNBplayer", room); //avoir le nombre de joueur totale dans la game
    PositionChat(); //pour mettre à jour la taille de zone chat
})

roomSocket.on("getNBplayer", (nb)=>{ //recupe le nb total de joueur
    NBplayer = nb;
    //etap 3
    if (!connecting) {
        roomSocket.emit("getClientConnected1", roomcode); //signiale a tout le monde notre arriver, et récupe les nom et id des autres
    }
})

roomSocket.on("getClientConnected2", function(id, data) { //nouveau client arrive, tout le monde recois les coordonné du nouveau client

    //sinon y'a des doublons
    let flague = false 
    for (let i = 0; i < playerinroom.length; i++) {
        if(playerinroom[i][0] == id){
            flague = true
        }
    }
    if (! flague) {playerinroom.push([id, data.pseudo, data.colorpseudo]);}

    roomSocket.emit("getClientConnected3", id, {
        pseudo: pseudo,
        colorpseudo: colorpseudo
    }) //on renvoie nos coordonées au nouveau client
    roomSocket.emit("getNBplayer", roomcode); //actualiser
})

roomSocket.on("getClientConnected4", function(id, data) { //je suis le nouveau client, les autres envoie leur infos
    
    //sinon y'a des doublons
    let flague = false 
    for (let i = 0; i < playerinroom.length; i++) {
        if(playerinroom[i][0] == id){
            flague = true
        }
    }
    if (! flague) {playerinroom.push([id, data.pseudo, data.colorpseudo]);}

    //etape 4
    if (playerinroom.length+1 == NBplayer) { //tous les joueur ont envoyé leur données
        roomSocket.emit("currentLeader") //start cherching leaderGame
    }

    connecting = true
})


roomSocket.on("client_leftID", function(id) { //un client part, on le retire de la liste
    for (var i = 0; i < playerinroom.length; i++) {
        if (playerinroom[i][0] == id) {
            playerinroom.splice(i, 1);
        }
    }
    roomSocket.emit("getNBplayer", roomcode);//actualiser

    //si c'est le leader on fait un nouveau leader
    if(id == currentLeader){
        SetLeaderByID()
    }
})


roomSocket.on("getCurrentLeader", (id)=>{  //autre client demande le leader on revoie la val actuelle
    if (checkLeader) {
        roomSocket.emit("getCurrentLeader", id, currentLeader);
    }else{
        roomSocket.emit("getCurrentLeader", id, "nobody"); 
    }
})

roomSocket.on("currentLeader", (CL)=>{ //recception de la demande de leader
    if (CL == null || CL == undefined || CL == "nobody") {
        SetLeaderByID()
    }
    currentLeader = CL;
    checkLeader = true;
})

function SetLeaderByID(){
    let best = myID
    for (let i = 0; i < playerinroom.length; i++) {
        if (playerinroom[i][0] > myID) {
            best = playerinroom[i][0]
        }
    }
    currentLeader = best;
    if(currentLeader == myID){
        selfLeader = true;
    }
    checkLeader = true;
}

//chat

// Quand on reçoit un message, on l'insère dans la page
roomSocket.on('message', function(data) {
    insereMessage(data.pseudo, data.message, data.color);
    servEtatPing = 2; //valeur abstraite
})

// Quand un nouveau client se connecte, on affiche l'information
roomSocket.on('nouveau_client', function(pseudo) {
    $('#zone_chat').append('<p class="chatmessNewClient messChat"><em>' + pseudo + ' join the room !</em></p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
})

//quand un client part 
roomSocket.on('client_left', function(pseudo) {
    $('#zone_chat').append('<p class="chatmessNewClient messChat"><em>' + pseudo + ' left the room !</em></p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
})

setInterval(() => { //function qui détecte la perte de connection internet et averti l'utilisateur.
    servEtatPing--
    roomSocket.emit("ClientPing");
    if (servEtatPing < 0) {
        console.log("problème de connection au serveur, vérifier votre connection a internet.")
        $("#message").css("background-color", "#FCC")
    } else {
        $("#message").css("background-color", "#EEE")
    }
}, 5000);

setInterval(() => { //function qui met a jours l'heure
    date = new Date();
}, 5000);

roomSocket.on("serveurPing", function( /*NBusers*/ ) { //fonction qui permet de vérifier que le client est toujours connecté au server
    servEtatPing = 2;
});

// Lorsqu'on envoie un message, on transmet le message et on l'affiche sur la page
$('#formulaire_chat').submit(function() {
    var message = $('#message').val();
    if (messvalide(message)) {
        roomSocket.emit('message', {
            pseudo: pseudo,
            message: message,
            color: colorpseudo
        }, roomcode); // Transmet le message aux autres
        insereMessage(pseudo, message, colorpseudo); // Affiche le message aussi sur notre page
    }
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

function messvalide(message) { //a compléter plus tard pour éviter les messages inutiles
    if (message == "") {
        return false;
    }
    return true
}

//to write correctly hours
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    };
    return i;
};
function insereMessage(pseudo, message, color) { //insert le message dans le DOM
    $('#zone_chat').append('<p class="messChat fontMessage">' + addZero(date.getHours()) + ":"+ addZero(date.getMinutes()) + " " + '<strong class="' + color + '" >' + pseudo + " :" + '</strong> ' + message + '</p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
    PositionChat(); //pour mettre à jour la taille de la div
}

function PositionChat() { //pour mettre à jour la taille du chat
    if ($("#zone_chat").css("position") == "absolute") { //si la fennettre est en format mobile on chage la taille
        //console.log($("#parentzonechat").css("width").replace(/[^-\d\.]/g, '')); //replace 200px → 200
        var temp = $("#parentzonechat").css("width").replace(/[^-\d\.]/g, '') - 18;
        $("#zone_chat").css("width", temp + "px");
    }
}

window.onresize = function(){ 
    PositionChat();
}

PositionChat(); //pour mettre à jour la taille de la div

roomSocket.on('log', function(message) { //fonction qui affiche un message du server
    console.log(message);
})

//transfert data

function transmit(data){
    roomSocket.emit("data", data) 
}

roomSocket.on("data", function(data) {
    GetData(data);
})