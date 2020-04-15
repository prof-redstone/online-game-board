
var namespace = "/privateroom";
var roomSocket = io.connect(location.protocol+"//" + url + namespace); 
console.log("privateroom.js chargé")
var roomjoined = false

if(roomcode == "false"){
	roomSocket.emit('roomcodeopen', randomstring(6));
}else{
	console.log(roomcode);
	roomSocket.emit("join_room", roomcode, pseudo);
}

roomSocket.on('roomcodeopen', function(data) {
    console.log(data);
    if(data.etat == true){
		console.log("code bon")
		console.log(data.code)
		roomcode = data.code;
		roomSocket.emit("join_room", roomcode, pseudo);
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
})












function randomstring(length){
	var result = "";
	var characters = "0123456789";
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}