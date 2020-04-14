var namespace = "/privateroom";
var roomSocket = io.connect(location.protocol+"//" + url + namespace); 
var roomcode;
var roomcreate = false;
console.log("privateroom.js chargé")


roomSocket.emit('roomcodeopen', "111" /*randomstring(6)*/);

roomSocket.on('roomcodeopen', function(data) {
    console.log(data);
    if(data.etat == true){
		console.log("putain le code est bon les gas !")
		console.log(data.code)
		roomcode = data.code;
    }else{
        console.log("merde le code n'est pas bon !")
    }
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