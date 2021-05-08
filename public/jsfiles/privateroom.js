var roomSocket = io.connect(location.protocol+"//" + url + namespace); 
var roomjoined = false
var playerinroom = [];
var gameMode = document.getElementById("gameSelection").value
var servEtatPing = 1;
var date = new Date(); //pour l'heure sur les messages
//sound
const joinAudio = new Audio("audio/join.ogg");
const leaveAudio = new Audio("audio/leave.ogg");

PlayerInRoom();//pour afficher son pseudo

if(roomcode == "false"){ //si le coderoom n'est pas dans l'url on le créé
	roomSocket.emit('roomcodeopen', randomstring(6));
}else{//sinon on se connect
	roomSocket.emit("join_room", roomcode, pseudo, colorpseudo);
}

roomSocket.on('roomcodeopen', function(data) {
    if(data.etat == true){//connection a la room
		roomcode = data.code;
		roomSocket.emit("join_room", roomcode, pseudo, colorpseudo);
		history.pushState(null, "board-game-online", window.location + "&room=" + data.code);//change url to save at reload
    }else{//cherche un nouveau code
		console.log("code pas bon");
		roomSocket.emit('roomcodeopen', randomstring(6));
    }
});

roomSocket.on('log', function(message) { //fonction qui affiche un message du server
    console.log(message);
})

roomSocket.on("roomjoin", function(room){
	roomjoined = true;
	$(".textID").html("HOVER ") //$(".textID").html(room)
	PositionChat();//pour mettre à jour la taille de zone chat
	roomSocket.emit("getClientConnected1", room);
})

$(".textID").hover(//pour afficher le code de la room quand la souris est dessus
	function(){
		$(".textID").html(roomcode)
	}
)

$(".textID").mouseleave(//pour chacher le code
	function(){
		$(".textID").html("HOVER")
	}
)

roomSocket.on("getClientConnected2", function(id, data){  //tout le monde recois les coordonné du nouveau client
	playerinroom.push([id, data.pseudo, data.colorpseudo]);
	roomSocket.emit("getClientConnected3", id, {pseudo: pseudo, colorpseudo: colorpseudo}) //on renvoie les coordonées au nouveau client
	PlayerInRoom();
})

roomSocket.on("getClientConnected4", function(id, data){
	playerinroom.push([id, data.pseudo, data.colorpseudo]);
	PlayerInRoom();
})

roomSocket.on("client_leftID", function(id){
	for(var i = 0 ; i <= playerinroom.length; i++){
		if(playerinroom[i][0] == id){
			playerinroom.splice(i, 1)
		}
	}
	PlayerInRoom(); //pour mettre à jour la liste des joueur dans le DOM
})

function PlayerInRoom(){ //met à jour la list avec tous les joueurs
	$(".listplayer").html('');
	$(".listplayer").append("<h4 class='playername " + colorpseudo +  "'>" + TextToHtml(pseudo) + "</h4>") //nous meme
	for(var i = 0; i < playerinroom.length; i++ ){
		$(".listplayer").append("<h4 class='playername " + playerinroom[i][2] +  "'>" + TextToHtml(playerinroom[i][1]) + "</h4>")
	}
	PositionChat();//function déclaré dans un autre fichier plus tard.
}

// Quand on reçoit un message, on l'insère dans la page
roomSocket.on('message', function(data) {
    insereMessage(data.pseudo, data.message, data.color);
    servEtatPing = 2;//valeur abstraite
})

// Quand un nouveau client se connecte, on affiche l'information
roomSocket.on('nouveau_client', function(pseudo) {
    $('#zone_chat').append('<p class="chatmessNewClient messChat"><em>' + TextToHtml(pseudo) + ' join the room !</em></p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
	joinAudio.play()
})

//quand un client part 
roomSocket.on('client_left', function(pseudo) {
    $('#zone_chat').append('<p class="chatmessNewClient messChat"><em>' + TextToHtml(pseudo) + ' left the room !</em></p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
	leaveAudio.play()
})

setInterval(() => { //function qui détecte la perte de connection internet et averti l'utilisateur.
    servEtatPing --
    roomSocket.emit("ClientPing");
    if(servEtatPing < 0){
        console.log("problème de connection au serveur, vérifier votre connection a internet.")
        $("#message").css("background-color", "#FCC")
    }else{
        $("#message").css("background-color", "#EEE")
    }
}, 5000);

setInterval(() => { //function qui met a jours l'heure
    date = new Date();
}, 5000);

roomSocket.on("serveurPing", function(/*NBusers*/){ //fonction qui permet de vérifier que le client est toujours connecté au server
    servEtatPing = 2;
});

// Lorsqu'on envoie un message, on transmet le message et on l'affiche sur la page
$('#formulaire_chat').submit(function () {
    var message = $('#message').val();
    if(messvalide(message)){
        roomSocket.emit('message', {pseudo: pseudo, message: message, color: colorpseudo}, roomcode); // Transmet le message aux autres
        insereMessage(pseudo, message, colorpseudo); // Affiche le message aussi sur notre page
    }
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

function messvalide(message){ //a compléter plus tard pour éviter les messages inutiles
    if(message == ""){
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

function TextToHtml(t) { //pour eviter les failles de type xss
    let c = ""
    for (let i = 0; i < t.length; i++) {
        switch (t[i]) {
            case "<":
                c += "&lt;"
                break;
            case ">":
                c += "&gt;"
                break;
            case "\"":
                c += "&quot;"
                break;

            default:
                c += t[i]
        }
    }
    return c
}


function insereMessage(pseudo, message, color) { //insert le message dans le DOM
    $('#zone_chat').append('<p class="messChat fontMessage">'+ addZero(date.getHours()) + ":"+ addZero(date.getMinutes())+ " " +'<strong class="' + color + '" >' + TextToHtml(pseudo) + " :" + '</strong> ' + TextToHtml(message) + '</p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
    PositionChat();//pour mettre à jour la taille de la div
}

function PositionChat(){ //fonction n2 pour mettre à jour la taille du chat, elle est déja déclarer dans un autre fichier.
    if($("#zone_chat").css("position") == "absolute"){//si la fennettre est en format mobile on chage la taille
        //console.log($("#parentzonechat").css("width").replace(/[^-\d\.]/g, '')); //replace 200px → 200
        var temp = $("#parentzonechat").css("width").replace(/[^-\d\.]/g, '') - 18;
        $("#zone_chat").css("width", temp + "px");
    }
}

window.onresize = function(){ 
    PositionChat();
}

//lien pour inviter 


$("#invite-link").hover( //afficher le lien quand on passe la souris 
	function(){
		$("#invite-link").val(location.protocol+"//" + url + "/join" + "?room=" + roomcode)
	}
)

$("#invite-link").mouseleave(  //affiche Hover to reveal quand la souris part
	function(){
		$("#invite-link").val("Hover to reveal")
	}
)

function copyToClipboard(id){ //copi le text 
	var element = document.getElementById(id)
	element.value = location.protocol+"//" + url + "/join" + "?room=" + roomcode;
	element.select();
	element.setSelectionRange(0, 99999);
	document.execCommand("copy");
	element.value = "Hover to reveal"
}


function randomstring(length){//créé une chaine aléatoire
	var result = "";
	var characters = "0123456789";
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


//bouton start gamee :
let startgamebt = document.getElementById("startgamebt")
startgamebt.onclick = ()=>{
	if(gameMode == "morpion"){
		if(playerinroom.length == 1){ //1 + client == 2 
			roomSocket.emit("startMorpion", roomcode);
		}else if(playerinroom.length < 1){
			alert("You need 2 player to start the game !")
		}else if(playerinroom.length > 1){
			alert("You need only 2 player to start the game !")
		}
	}
}


//start Morpion game
roomSocket.on("startMorpion", function(NewroomCode){
	document.location.href = "/morpion" + "?"+ "room=" + NewroomCode + "&" + "LB=" + roomcode + "&" + "ps=" + pseudo + "&" + "co=" + colorpseudo;
})
