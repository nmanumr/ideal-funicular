var cnvBtn = document.getElementById('convert-btn');
var numInp = document.getElementById('num-inp');
var stepsInp = document.getElementById('steps');
var fromBase = document.getElementById('from-base');
var toBase = document.getElementById('to-base');
var msg = document.getElementsByClassName('msg')[0];

// append bases list
for (var i = 2; i <= 36; i++) {
    fromBase.innerHTML += `<option>${i}</option>`;
    toBase.innerHTML += `<option>${i}</option>`;
}

// validate input
function hasCharInBase(char, base){
    var hasChar = false;
    for(var i=0; i<base; i++){
        if(char.toString().toUpperCase() == map[i]){
            return true
        }
    }
    return false;
}

function validateNum(num, base) {
    for(var char of num.toString()){
        if(!hasCharInBase(char, base))
            return false;
    }
    return true;
}

function getBaseChars(base){
    var chars = [];
    for(var i=0; i<base; i++){
        chars.push(map[i]);
    }
    return chars;
}

function validateInput(){
    var isValid = validateNum(numInp.value, fromBase.value);
    if(!isValid){
        var chars = getBaseChars(fromBase.value);
        numInp.classList.add('error');
        msg.innerText = `Number should be in range of [${chars[0]} - ${chars[chars.length-1]}]`;
    }
    else{
        numInp.classList.remove('error');
    }
}

numInp.oninput = validateInput;
fromBase.onchange = validateInput;


// handle conversion
cnvBtn.onclick = function () {
    var val = numInp.value.replace(/\s+/g, '');

    logger.clear();
    convert(val, parseInt(fromBase.value), parseInt(toBase.value), stepsInp.checked);
}