name = readCookiePseudo()


$('#formulaire_name').submit(function() { //valide l'entrer du nom
    $('#inputpseudo').blur();
    return false;
});
$('#formulaire_name').focusout(function() { //valide l'entrer du nom quand on perd le focus
    if ($('#inputpseudo').val().replace(/\s/g, '') == '') { //chek if inpute contain nothing or juste space
    } else {
        pseudo = ""
        for (let i = 0; i < $('#inputpseudo').val().length; i++) {
            let a = $('#inputpseudo').val()[i]
            let invalideChar = ["<", ">", "&", "=", "!", "/", "\\", "\"", "\'"]
            if (a == "<" || a == ">" || a == "&" || a == "=" || a == "!" || a == "/" || a == "\\" || a == "\"" || a == "\'" || a == ":" || a == ";" || a == "$") {
                pseudo += ""
            } else {
                pseudo += $('#inputpseudo').val()[i]
            }
        }
        $('#inputpseudo').val(pseudo)
        $('#inputpseudo').attr('placeholder', pseudo);
        console.log(pseudo)
        createCookiePseudo(pseudo)
        return false;
    }
});

function changeColorPseudo(color) { //colorpseudo présent dans chat.js
    var colorrectcolor;
    switch (color) {
        case 1:
            colorrectcolor = "black";
            colorpseudo = "black"
            break;
        case 2:
            colorrectcolor = "rgb(255, 98, 195)";
            colorpseudo = "pink"
            break;
        case 3:
            colorrectcolor = "brown";
            colorpseudo = "brown"
            break;
        case 4:
            colorrectcolor = "red";
            colorpseudo = "red"
            break;
        case 5:
            colorrectcolor = "green";
            colorpseudo = "green"
            break;
        case 6:
            colorrectcolor = "blue";
            colorpseudo = "blue"
            break;
        case 7:
            colorrectcolor = "purple";
            colorpseudo = "purple"
            break;
        case 8:
            colorrectcolor = "cyan";
            colorpseudo = "cyan"
            break;
        case 9:
            colorrectcolor = "rgb(255, 136, 0)";
            colorpseudo = "orange"
            break;
    }
    $('.colorrect').css("background-color", colorrectcolor);
    createCookieColor(color)
    return colorpseudo
}


$('#joinprform').submit(function() { //pour rejoindre une room
    var room = $('#inproompass').val();
    if (room.length > 5) {
        document.location.href = "/pr" + "?" + "room=" + room + "&" + "ps=" + pseudo + "&" + "co=" + colorpseudo;
    }
    return false;
});

$('#btnjoinroom').click(function() {
    var room = $('#inproompass').val();
    if (room.length > 5) {
        document.location.href = "/pr" + "?" + "room=" + room + "&" + "ps=" + pseudo + "&" + "co=" + colorpseudo;
    }
});

$('#btncreatroom').click(function() {
    document.location.href = "/pr" + "?" + "ps=" + pseudo + "&" + "co=" + colorpseudo;
});

function createCookiePseudo(pseudo) {
    document.cookie = "pseudo=" + pseudo + "; path=/; max-age=31536000"
}

function readCookiePseudo() {
    pseudo = name
    try {pseudo = document.cookie.split('; ').find(row => row.startsWith('pseudo=')).split('=')[1];} catch (error) {}
    return pseudo
}

function createCookieColor(color) {
    document.cookie = "color=" + color + "; path=/; max-age=31536000"
}

function readCookieColor() {
    let color 
    try {color = document.cookie.split('; ').find(row => row.startsWith('color=')).split('=')[1];} catch (error) {color = 1}
    return color
}

changeColorPseudo(parseInt(readCookieColor()))