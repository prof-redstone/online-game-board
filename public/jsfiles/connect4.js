console.log("connect 4 js in beta !")
var start = false //flag
var canvas = document.getElementById("canvas")
var DivInfo = document.getElementById("infoGame")
var ctx = canvas.getContext("2d");
var playerRole = undefined; //1 ou 2 en fonction de si on est leader ou pas
var gride = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
]
var joueur = 1; //1 and 2, joueur qui doit jouer
var etat = "" //win, lose, NULL or undefine

//chargement si problème 
ctx.fillStyle = "red";
ctx.textAlign = "center";
ctx.font = "100px sans-serif"; //pour précharger la font
ctx.font = "100px Roboto"; //pour précharger la font
ctx.font = "100px Varela Round"; //pour précharger la font
ctx.fillText("loading", 200 , 250)


function Start() {
    playerRole = 1 //leader 1 autre 2 (fixe durant la game)
    joueur = nb_random(1, 2) //pour savoir qui commence (change a chaque tour)
    console.log("joueur " + joueur + " commence ! (1 = leader)")


    Draw()
}


function Draw(){
    //ajouter fleche sur la colone ou se trouve la sourie


    ctx.clearRect(0,0,400,400)

    
    //background
    ctx.fillStyle = "#EEE"
    ctx.fillRect(0, 0, 400, 400)

    //line
    ctx.lineWidth = 8
    ctx.lineCap = "round";
    ctx.strokeStyle = "#88e3d1";
    for (let i = 1; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(400/7 * i, 65);
        ctx.lineTo(400/7 * i, 390);
        ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(10,400 - 400/7 * i);
        ctx.lineTo(390,400 - 400/7 * i);
        ctx.stroke();
    }

    //piece
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
            if (gride[i][j] == 1 || gride[i][j] == 2) {
                if (gride[i][j] == 1) {
                    ctx.strokeStyle = "#18BC9C";
                }else if(gride[i][j] == 2){
                    ctx.strokeStyle = "#2C3E50";
                }
                ctx.beginPath();
                ctx.arc(400/7*j + 400/14, 400/7*(i+1) + 400/14 , 18, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    //show result of the game
    if (etat != "") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.fillRect(0, 0, 400, 400)
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.font = "150px sans-serif";
        ctx.font = "150px Roboto";
        ctx.font = "150px Varela Round";
        ctx.fillText(etat, 200, 250);
    }
}

function UpdateGame(){//equivalent a loop 
    

    //check win or lose and null
    let g = gride; //to shorten
    let win = false;
    for (let i = 0; i < 4; i++) {//horisontal
        for (let j = 0; j < 6; j++) {
            if( g[j][i] == g[j][i+1] && g[j][i+2] == g[j][i+3] && g[j][i] == g[j][i+3] && g[j][i] != 0 ){
                win = true
            }
        }
    }
    for (let i = 0; i < 7; i++) {//vertical
        for (let j = 0; j < 3; j++) {
            if( g[j][i] == g[j+1][i] && g[j+2][i] == g[j+3][i] && g[j][i] == g[j+3][i] && g[j][i] != 0 ){
                win = true
            }
        }
    }
    for (let i = 0; i < 4; i++) {//botleft top rig
        for (let j = 0; j < 3; j++) {
            if( g[j][i] == g[j+1][i+1] && g[j+2][i+2] == g[j+3][i+3] && g[j][i] == g[j+3][i+3] && g[j][i] != 0 ){
                win = true
            }
        }
    }
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            if( g[j][i+3] == g[j+1][i+2] && g[j+2][i+2] == g[j+3][i] && g[j][i+3] == g[j+3][i] && g[j+3][i] != 0 ){
                win = true
            }
        }
    }
    if(win){
        if (joueur == 1) {
            etat = "WIN"
            console.log("c'est moi qui ai gagné")
            TransmitData({
                type: "message",
                content: "J1W"
            })
        }else{
            etat = "LOSE"
            console.log("c'est lui qui a gagnée")
            TransmitData({
                type: "message",
                content: "J2W"
            })
        }
        joueur = 0;//plus personne peut jouer
    }

    //check equality
    let equality = true
    for (let i = 0; i < 7; i++) {
        if (gride[0][i] == 0) equality = false
    }
    if (equality) {
        console.log("EGALITE");
        etat = "NULL";
        joueur = 0;
        TransmitData({
            type: "message",
            content: "EQ"
        })
    }

    //change player
    if (joueur!=0) joueur = (joueur == 1) ? 2 : 1

    //envoie de la nouvelle config
    TransmitData({
        type: "content",
        gride: gride,
        player: joueur
    })
    Draw()//show the changement
}

function Info(){

}

//input avec envent listener
function click(e) {
    let offset = getPosition(canvas) //postion du canvas dans toute la page
    let colonne = Math.floor((e.clientX - offset[0]) / (400/7))
    

    if (selfLeader) {
        Case(colonne, playerRole)
    } else {
        TransmitData({
            type: "case",
            x: colonne,
            playerRole: playerRole
        })
    }
}
canvas.addEventListener('click', click)

//check input correct
function Case(c, player){//colone
    if (joueur == player) {
        for (let i = 5; i >= 0; i--) {
            if (gride[i][c] == 0) { //check valid position
                gride[i][c] = player;
                i=0
            }
        }
        UpdateGame()
    }
}

//transmission des donné get et transmit, voir morpion.js
function TransmitData(value) { //fontion dans gameChat.js pour simplifier
    transmit({
        leader: selfLeader,//dans gameChat.js
        id: myID,//dans gameChat.js
        value: value
    })
}

function ReceiveData(data){
    if (data.value.type == "case") {//l'autre joueur nous a envoyé sa case
        //mettre la case de l'adversaire
        Case(data.value.x, data.value.playerRole)
    }
    if (data.value.type == "getContent") { //si on est leader on envoie la config a l'autre
       
        let GetplayerRole = (playerRole==1) ? 2 : 1 //pour l'adversaire
        let opEtat = "" //pour l'adversaire
        if (etat == "WIN") {
            opEtat = "LOSE"
        }
        if (etat == "LOSE") {
            opEtat = "WIN"
        }
        if (etat == "NULL") {
            opEtat = "NULL"
        }
        TransmitData({ //on renvois toutes les infos
            type: "content",
            gride: gride,
            player: joueur,
            playerRole: GetplayerRole,
            etat: opEtat
        })
    }
    if (data.value.type == "content") {//le leader nous a envoyé toutes les infos
        gride = data.value.gride;
        joueur = data.value.player;
        if (data.value.playerRole != undefined) {
            playerRole = data.value.playerRole;
        }
        if (data.value.etat != undefined) {
            etat = data.value.etat;
        }
        Draw()
        Info()
    }
    if (data.value.type == "message") {//leader nous a envoyé un messages
        let message = data.value.content;
        if (message == "J1W" || message == "J2W" || message == "EQ") {
            if (message == "J1W") {
                if (playerRole == 1) {
                    etat = "WIN"
                } else {
                    etat = "LOSE"
                }
                joueur = 0
            }
            if (message == "J2W") {
                if (playerRole == 2) {
                    etat = "WIN"
                } else {
                    etat = "LOSE"
                }
                joueur = 0
            }
            if (message == "EQ") {
                etat = "NULL";
                joueur = 0
            }
            Draw()
            Info()
        }
    }
    if (data.value.type == "restart") {//leader nous demande de reset
        gride = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        etat = "";
        joueur = data.value.joueur;
        Draw()
        Info();
    }
}

//function utile au dev

function nb_random(min, max) { //fonction générant un nombre aléatoire entier min et max inclue [min;max]
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPosition(element) //fonction pour avoir les coordonné x y d'un element dans la page
{
    var left = 0;
    var top = 0;
    var e = element;
    /*Tant que l'on a un élément parent*/
    while (e.offsetParent != undefined && e.offsetParent != null) {
        /*On ajoute la position de l'élément parent*/
        left += e.offsetLeft + (e.clientLeft != null ? e.clientLeft : 0);
        top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);

        e = e.offsetParent;
    }
    return new Array(left, top);
}



//pour démarrer le programme
//peut etre plus opti
setInterval(() => {
    if (!start) { //si n'a pas encore demarrer
        if (checkLeader) { //leader a etait choisi
            start = true
            if (selfLeader) { //si leader
                console.log("i'm leader")
                Start()
            } else { //si pas leader
                TransmitData({
                    
                    type: "getContent"
                })
            }
        }
    }
}, 100);