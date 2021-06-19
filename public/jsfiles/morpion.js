var canvas = document.getElementById("canvas")
var DivInfo = document.getElementById("infoGame")
var ctx = canvas.getContext("2d");
var start = false //flague
var playerRole = undefined;
var gride = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]
var joueur = 1; //1 and 2, joueur qui doit jouer
var etat = "" //win, lose, NULL

function Start() {
    playerRole = 1
    joueur = nb_random(1, 2)
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

function Info(e) {
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
            if (gride[i][j] == 1) {
                ctx.strokeStyle = "#18BC9C";
                ctx.beginPath();
                ctx.moveTo(33 + i * 133, 33 + j * 133);
                ctx.lineTo(99 + i * 133, 99 + j * 133);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(33 + i * 133, 99 + j * 133);
                ctx.lineTo(99 + i * 133, 33 + j * 133);
                ctx.stroke();
            } else if (gride[i][j] == 2) {
                ctx.strokeStyle = "#2C3E50";
                ctx.beginPath();
                ctx.arc(66 * (i * 2 + 1), 66 * (j * 2 + 1), 33, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();

                /*ctx.clearRect(0,0,400,400)
                var path = new Path2D("M205.428,128.634c6.81-8.589,9.181-22.092,5.294-33.304c-3.91-11.281-13.395-17.998-25.371-17.998h-48.991c-0.162,0-0.33-0.019-0.497-0.302c-0.161-0.276-0.086-0.42-0.007-0.563c6.795-12.183,11.35-25.426,14.908-36.767c3.221-10.264,1.771-20.64-3.975-28.465C141.624,4.201,133.416,0,124.832,0c-10.059,0-19.409,5.563-25.652,15.264c-4.906,7.623-9.152,15.453-13.258,23.025C79.539,50.06,73.511,61.177,66.974,67.518c-5.227,5.066-20.685,15.003-29.922,20.939c-3.313,2.13-6.256,3.968-8.368,5.386c-3.799,2.55-8.61,5.723-8.61,12.43v79.825c0,8.241,5.996,15.127,14.142,16.373l27.227,4.158c26.337,17.039,51.792,26.036,73.664,26.036c6.078,0,11.935-0.691,17.388-2.056c12.962-3.24,22.223-9.323,27.514-18.08c3.309-5.476,4.446-11.006,4.613-15.684c4.776-2.615,8.59-6.74,11.017-12.013c3.602-7.825,3.639-16.661,1.9-23.703C206.552,152.76,208.235,138.778,205.428,128.634z M186.674,154.263c-2.15,1.156-3.165,3.743-2.108,5.944c3.784,7.878,3.233,24.127-8.71,27.308c-2.242,0.598-3.699,2.704-3.405,5.006c0.909,7.13-0.509,20.861-22.857,26.447c-4.491,1.123-9.322,1.697-14.467,1.697c-19.089,0-42.453-7.903-68.421-24.957c-0.544-0.357-1.162-0.598-1.806-0.696l-28.871-4.403c-2.228-0.341-3.956-2.257-3.956-4.511v-79.825c0-1.204,33.353-20.624,43.171-30.142c12.427-12.053,21.31-34.681,33.983-54.373c4.405-6.845,10.201-9.759,15.584-9.759c10.103,0,18.831,10.273,14.493,24.104c-4.018,12.804-8.195,24.237-13.934,34.529c-4.672,8.376,1.399,18.7,10.989,18.7h48.991c18.852,0,18.321,26.313,8.552,34.01c-1.676,1.32-2.182,3.682-1.175,5.563C196.246,135.477,195.588,149.471,186.674,154.263z");
                ctx.moveTo(400,400)
                ctx.stroke(path);*/
            }
        }
    }

    if (etat == "NULL") {
        ctx.font = "70px sans-serif";
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
    let offset = getPosition(canvas)
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

function GetData(data) {
    if (data.value.type == "case") {
        Loop(data.value.playerRole, data.value.x, data.value.y)
    }
    if (data.value.type == "getContent") {
        let GetplayerRole;
        if (playerRole == 1) {
            GetplayerRole = 2
        } else {
            GetplayerRole = 1
        }
        let opEtat = ""
        if (etat == "WIN") {
            opEtat = "LOSE"
        }
        if (etat == "LOSE") {
            opEtat = "WIN"
        }
        if (etat == "NULL") {
            opEtat = "NULL"
        }
        TransmitData({
            type: "content",
            gride: gride,
            player: joueur,
            playerRole: GetplayerRole,
            etat: opEtat
        })
    }
    if (data.value.type == "content") {
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
    if (data.value.type == "message") {
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
    if (data.value.type == "restart") {
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


setInterval(() => {
    if (!start) {
        if (checkLeader) {
            start = true
            if (selfLeader) {
                console.log("i'm leader")
                Start()
            } else {
                TransmitData({
                    type: "getContent"
                })
            }
        }
    }
}, 100);