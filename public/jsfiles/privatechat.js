console.log(location.protocol+"//" + url);
var namespace = "/privateroom";
//var roomSocket = io.connect(location.protocol+"//" + url + namespace); 
var servEtatPing = 1;
var date = new Date(); //pour l'heure sur les messages


// Quand on reçoit un message, on l'insère dans la page
roomSocket.on('message', function(data) {
    console.log("oiu")
    insereMessage(data.pseudo, data.message, data.color);
    servEtatPing = 2;//valeur abstraite
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
    servEtatPing --
    roomSocket.emit("CientPing");
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

function insereMessage(pseudo, message, color) { //insert le message dans le DOM
    $('#zone_chat').append('<p class="messChat fontMessage">'+ date.getHours() + ":"+ date.getMinutes()+ " " +'<strong class="' + color + '" >' + pseudo + " :" + '</strong> ' + message + '</p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
    PositionChat();//pour mettre à jour la taille de la div
}

function PositionChat(){
    if($("#zone_chat").css("position") == "absolute"){//si la fennettre est en format mobile on chage la taille
        console.log($("#parentzonechat").css("width").replace(/[^-\d\.]/g, '')); //replace 200px → 200
        var temp = $("#parentzonechat").css("width").replace(/[^-\d\.]/g, '') - 18;
        $("#zone_chat").css("width", temp + "px");
    }
}

PositionChat();


