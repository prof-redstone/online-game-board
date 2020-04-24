
var namespace = "/privateroom";
var roomSocket = io.connect(location.protocol+"//" + url + namespace); 
console.log("privateroom.js chargé")
var roomjoined = false
var playerinroom = [];

PlayerInRoom();//pour afficher son pseudo

if(roomcode == "false"){ //si le coderoom n'est pas dans l'url on le créé
	roomSocket.emit('roomcodeopen', randomstring(6));
}else{//sinon on se connect
	roomSocket.emit("join_room", roomcode, pseudo, colorpseudo);
}

roomSocket.on('roomcodeopen', function(data) {
    if(data.etat == true){
		console.log("code bon")
		roomcode = data.code;
		roomSocket.emit("join_room", roomcode, pseudo, colorpseudo);
		history.pushState(null, "board-game-online", window.location + "&room=" + data.code);
    }else{
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
	PositionChat2();//pour mettre à jour la taille de zone chat
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

roomSocket.on("getClientConnected2", function(id, data){
	playerinroom.push([id, data.pseudo, data.colorpseudo]);
	console.log(playerinroom);
	roomSocket.emit("getClientConnected3", id, {pseudo: pseudo, colorpseudo: colorpseudo})
	PlayerInRoom();
})

roomSocket.on("getClientConnected4", function(id, data){
	playerinroom.push([id, data.pseudo, data.colorpseudo]);
	console.log(playerinroom);
	PlayerInRoom();
})

roomSocket.on("client_leftID", function(id){
	console.log("hehe la " + id)
	for(var i = 0 ; i <= playerinroom.length; i++){
		console.log(playerinroom[i][0])
		if(playerinroom[i][0] == id){
			playerinroom.splice(i, 1)
			console.log("il est bien parti c'est bon")
		}
	}
	PlayerInRoom(); //pour mettre à jour la liste des joueur dans le DOM
})

function PlayerInRoom(){ //met à jour la dis avec tous les joueurs
	$(".listplayer").html('');
	$(".listplayer").append("<h4 class='playername " + colorpseudo +  "'>" + pseudo + "<h4>")
	for(var i = 0; i < playerinroom.length; i++ ){
		$(".listplayer").append("<h4 class='playername " + playerinroom[i][2] +  "'>" + playerinroom[i][1] + "<h4>")
	}
	PositionChat2();//function déclaré dans un autre fichier plus tard.
}

function PositionChat2(){ //fonction n2 pour mettre à jour la taille du chat, elle est déja déclarer dans un autre fichier.
    if($("#zone_chat").css("position") == "absolute"){//si la fennettre est en format mobile on chage la taille
        console.log($("#parentzonechat").css("width").replace(/[^-\d\.]/g, '')); //replace 200px → 200
        var temp = $("#parentzonechat").css("width").replace(/[^-\d\.]/g, '') - 18;
        $("#zone_chat").css("width", temp + "px");
    }
}

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