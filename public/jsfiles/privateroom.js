
var namespace = "/privateroom";
var roomSocket = io.connect(location.protocol+"//" + url + namespace); 
console.log("privateroom.js chargé")
var roomjoined = false
var playerinroom = [];

if(roomcode == "false"){
	roomSocket.emit('roomcodeopen', randomstring(6));
}else{
	console.log(roomcode);
	roomSocket.emit("join_room", roomcode, pseudo, colorpseudo);
}

roomSocket.on('roomcodeopen', function(data) {
    console.log(data);
    if(data.etat == true){
		console.log("code bon")
		console.log(data.code)
		roomcode = data.code;
		roomSocket.emit("join_room", roomcode, pseudo, colorpseudo);
    }else{
		console.log("code pas bon");
		roomSocket.emit('roomcodeopen', randomstring(6));
    }
});

roomSocket.on('log', function(message) {
    console.log(message);
})

roomSocket.on("roomjoin", function(room){
	roomjoined = true;
	roomSocket.emit("getClientConnected1", room);
})

roomSocket.on("getClientConnected2", function(id, data){
	console.log("bienreçu !")
	console.log(2);
	playerinroom.push([id, data.pseudo, data.colorpseudo]);
	console.log(playerinroom);
	roomSocket.emit("getClientConnected3", id, {pseudo: pseudo, colorpseudo: colorpseudo})
	PlayerInRoom();
})

roomSocket.on("getClientConnected4", function(id, data){
	console.log(4)
	console.log("bienreçu !2 ")
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

function PlayerInRoom(){
	$(".listplayer").html('')
	for(var i = 0; i < playerinroom.length; i++ ){
		$(".listplayer").append("<h4 class='playername " + playerinroom[i][2] +  "'>" + playerinroom[i][1] + "<h4>")
	}
}





function randomstring(length){
	var result = "";
	var characters = "0123456789";
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}