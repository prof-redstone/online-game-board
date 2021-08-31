var canvas = document.getElementById("canvas")
var DivInfo = document.getElementById("infoGame")
var ctx = canvas.getContext("2d");
ctx.font = "150px sans-serif"; //pour précharger la font
ctx.font = "150px Roboto"; //pour précharger la font
ctx.font = "150px Varela Round"; //pour précharger la font
var start = false //flag
var playerRole = undefined; //en fonction de si on est leader ou pas
var gride = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]
var joueur = 1; //1 and 2, joueur qui doit jouer
var etat = "" //win, lose, NULL

function Start() {
    playerRole = 1 //leader 1 autre 2
    joueur = nb_random(1, 2) //pour savoir qui commence
    console.log("joueur " + joueur + " commence !")

    TransmitData({
        type: "content",
        gride: gride,
        player: joueur
    })

    Draw()
    Info()
}

function Loop(p, x, y) {
    if (p == joueur) {
        if (gride[x][y] == 0) {
            gride[x][y] = p

            if (joueur == 1) {
                joueur = 2
            } else {
                joueur = 1
            } //change player

            TransmitData({
                type: "content",
                gride: gride,
                player: joueur
            })
        }

        //check if win
        if ( /*h*/ (gride[0][0] == 1 && gride[1][0] == 1 && gride[2][0] == 1) || (gride[0][1] == 1 && gride[1][1] == 1 && gride[2][1] == 1) || (gride[0][2] == 1 && gride[1][2] == 1 && gride[2][2] == 1) || ( /*v*/ gride[0][0] == 1 && gride[0][1] == 1 && gride[0][2] == 1) || (gride[1][0] == 1 && gride[1][1] == 1 && gride[1][2] == 1) || (gride[2][0] == 1 && gride[2][1] == 1 && gride[2][2] == 1) || ( /*d*/ gride[0][0] == 1 && gride[1][1] == 1 && gride[2][2] == 1) || (gride[2][0] == 1 && gride[1][1] == 1 && gride[0][2] == 1)) {
            console.log("joueur 1 gagne")
            if (playerRole == 1) {
                etat = "WIN"
            } else {
                etat = "LOSE"
            }
            joueur = 0
            TransmitData({
                type: "message",
                content: "J1W"
            })
        } else if ( /*h*/ (gride[0][0] == 2 && gride[1][0] == 2 && gride[2][0] == 2) || (gride[0][1] == 2 && gride[1][1] == 2 && gride[2][1] == 2) || (gride[0][2] == 2 && gride[1][2] == 2 && gride[2][2] == 2) || ( /*v*/ gride[0][0] == 2 && gride[0][1] == 2 && gride[0][2] == 2) || (gride[1][0] == 2 && gride[1][1] == 2 && gride[1][2] == 2) || (gride[2][0] == 2 && gride[2][1] == 2 && gride[2][2] == 2) || ( /*d*/ gride[0][0] == 2 && gride[1][1] == 2 && gride[2][2] == 2) || (gride[2][0] == 2 && gride[1][1] == 2 && gride[0][2] == 2)) {
            console.log("joueur 2 gagne")
            if (playerRole == 2) {
                etat = "WIN"
            } else {
                etat = "LOSE"
            }
            joueur = 0
            TransmitData({
                type: "message",
                content: "J2W"
            })
        } else if (gride[0][0] != 0 && gride[0][1] != 0 && gride[0][2] != 0 && gride[1][0] != 0 && gride[1][1] != 0 && gride[1][2] != 0 && gride[2][0] != 0 && gride[2][1] != 0 && gride[2][2] != 0) {
            console.log(" Egalité !")
            etat = "NULL"
            joueur = 0
            TransmitData({
                type: "message",
                content: "EQ"
            })
        }


    }

    Draw()
    Info()
}

function Info() { //update info bar on bottom of canvas
    let symb = "X"
    if (playerRole == 2) {
        symb = "O"
    }
    if ((playerRole == 1 && joueur == 1) || (playerRole == 2 && joueur == 2)) {
        DivInfo.innerHTML = "You are : " + symb + " <br> your turn <br>"
    } else {
        if (playerinroom.length != 0) {
            DivInfo.innerHTML = "You are : " + symb + " <br>  " + playerinroom[0][1] + " turn <br>"
        } else {
            DivInfo.innerHTML = "You are : " + symb + " <br> opponent turn <br>"
        }
    }
    if (etat != "") {
        if (etat == "LOSE" || etat == "WIN") {
            DivInfo.appendChild(document.createTextNode(" YOU " + etat))
        } else {
            DivInfo.appendChild(document.createTextNode(" " + etat))
        }
    }


    if (etat != "") {
        var btn = document.createElement("BUTTON")
        btn.innerHTML = "RESTART";
        btn.onclick = () => {
            console.log("restart")
            gride = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
            etat = "";
            joueur = nb_random(1, 2)
            TransmitData({
                type: "restart",
                joueur: joueur
            })
            Draw()
            Info()
        }
        btn.style.color = "black";
        btn.style.border = "none";
        btn.style.backgroundColor = "#4CAF50";
        btn.style.padding = "5px 10px";
        btn.style.marginLeft = "5px";
        btn.style.textDecoration = "none";
        btn.style.textAlign = "center";
        btn.style.fontSize = "16px";
        btn.style.fontFamily = "Roboto";
        btn.style.fontWeight = "bold";
        btn.style.borderRadius = "5px";
        


        DivInfo.appendChild(btn)

    }
}

function Draw() {
    ctx.clearRect(0, 0, 400, 400)

    //background
    ctx.fillStyle = "#EEE"
    ctx.fillRect(0, 0, 400, 400)

    //ligne
    ctx.lineWidth = 15
    ctx.lineCap = "round";
    ctx.strokeStyle = "#88e3d1";
    ctx.beginPath();
    ctx.moveTo(133, 10);
    ctx.lineTo(133, 390);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(266, 10);
    ctx.lineTo(266, 390);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 133);
    ctx.lineTo(390, 133);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 266);
    ctx.lineTo(390, 266);
    ctx.stroke();

    //dessin
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gride[i][j] == 1) {//crois
                ctx.strokeStyle = "#18BC9C";
                ctx.beginPath();
                ctx.moveTo(33 + i * 133, 33 + j * 133);
                ctx.lineTo(99 + i * 133, 99 + j * 133);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(33 + i * 133, 99 + j * 133);
                ctx.lineTo(99 + i * 133, 33 + j * 133);
                ctx.stroke();
            } else if (gride[i][j] == 2) {//cercle
                ctx.strokeStyle = "#2C3E50";
                ctx.beginPath();
                ctx.arc(66 * (i * 2 + 1), 66 * (j * 2 + 1), 33, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();

            }
        }
    }


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

function click(e) {
    let offset = getPosition(canvas) //postion du canvas dans toute la page
    Case(Math.floor((e.clientX - offset[0]) / 133), Math.floor((e.clientY - offset[1]) / 133))
    console.log(Math.floor((e.clientX - offset[0]) / 133), Math.floor((e.clientY - offset[1]) / 133))
}
canvas.addEventListener('click', click)

function Case(x, y) {
    if (selfLeader == false) {
        TransmitData({
            type: "case",
            x: x,
            y: y,
            playerRole: playerRole
        })
    } else {
        Loop(playerRole, x, y)
    }
}


function TransmitData(value) {
    transmit({
        leader: selfLeader,
        id: myID,
        value: value
    })
}

function ReceiveData(data) {
    if (data.value.type == "case") {//l'autre joueur nous a envoyé sa case
        Loop(data.value.playerRole, data.value.x, data.value.y)
    }
    if (data.value.type == "getContent") { //si on est leader on envoie la config a l'autre
        let GetplayerRole; //pour l'adversaire
        if (playerRole == 1) {
            GetplayerRole = 2
        } else {
            GetplayerRole = 1
        }
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