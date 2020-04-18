console.log(location.protocol+"//" + url);
var chatSocket = io.connect(location.protocol+"//" + url + "/chat"); 
var pseudo;
var colorpseudo = "black";
var servEtatPing = 0;
var date = new Date();

if(name == "undefined"){ //si le pseudo ne se trouve pas dans l'url
    pseudo = prompt('Quel est votre pseudo ?');
    if(pseudo == null){
        pseudo = "anonymous";
    }
    chatSocket.emit('nouveauPseudo', pseudo);
}else{
    pseudo = name;
    chatSocket.emit('nouveauPseudo', pseudo);
}
$('#inputpseudo').attr('placeholder', pseudo);//on met le pseudo dans l'input

chatSocket.on('PseudoUnvalide', function(Npseudo) { //le serveur renvoie le nouveaux pseudo, à changer
    pseudo = Npseudo;
    chatSocket.emit('nouveauPseudo', pseudo);
    $('#inputpseudo').attr('placeholder', pseudo);
})

// Quand on reçoit un message, on l'insère dans la page
chatSocket.on('message', function(data) {
    insereMessage(data.pseudo, data.message, data.color);
    servEtatPing = 2;//valeur abstraite
})


// Quand un nouveau client se connecte, on affiche l'information
chatSocket.on('nouveau_client', function(pseudo) {
    $('#zone_chat').append('<p class="chatmessNewClient messChat"><em>' + pseudo + ' join the game !</em></p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
})

chatSocket.on('client_left', function(pseudo) {
    $('#zone_chat').append('<p class="chatmessNewClient messChat"><em>' + pseudo + ' left the game !</em></p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
})

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat').submit(function () {
    var message = $('#message').val();
    if(messvalide(message)){
        chatSocket.emit('message', {pseudo: pseudo, message: message, color: colorpseudo}); // Transmet le message aux autres
        insereMessage(pseudo, message, colorpseudo); // Affiche le message aussi sur notre page
    }
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

function messvalide(message){
    if(message == ""){
        return false;
    }
    return true
}

function insereMessage(pseudo, message, color) {
    $('#zone_chat').append('<p class="messChat fontMessage">'+ date.getHours() + ":"+ date.getMinutes()+ " " +'<strong class="' + color + '" >' + pseudo + " :" + '</strong> ' + message + '</p>');
    element = document.getElementById('zone_chat');
    element.scrollTop = element.scrollHeight;
}

if($("#zone_chat").css("position") == "absolute"){//si la fennettre est en format mobile on chage la taille
    console.log($("#parentzonechat").css("width").replace(/[^-\d\.]/g, '')); //200px → 200
    var temp = $("#parentzonechat").css("width").replace(/[^-\d\.]/g, '') - 18;
    $("#zone_chat").css("width", temp + "px");
}

setInterval(() => { //function qui détecte la perte de connection et averti l'utilisateur.
    servEtatPing --
    chatSocket.emit("CientPing");
    if(servEtatPing < 0){
        console.log("problème de connection au serveur, vérifier votre connection a internet.")
        $("#message").css("background-color", "#FCC")
    }else{
        $("#message").css("background-color", "#EEE")
    }
}, 5000);

setInterval(() => { //function qui détecte la perte de connection et averti l'utilisateur.
    date = new Date();
}, 5000);

chatSocket.on("serveurPing", function(NBusers){
    servEtatPing = 2;
    $("#message").attr("placeholder", NBusers + " users are connected")
});