var parser = new ExpressionParser();
var genBtn = document.getElementById("gen-btn");
var expInp = document.getElementById("exp-inp");
var expErr = document.getElementById("exp-err");
var logger = new Logger(document.getElementById('console'));

expInp.oninput = function (e) {
    var text = expInp.value;
    expInp.classList.remove('error');
    expInp.classList.remove('normal');
    if (!text) return;

    try {
        var exp = parser.parse(text);
        expInp.classList.add('normal');
        expErr.innerText = exp.getExp();
    }
    catch (e) {
        expInp.classList.add('error');
        expErr.innerText = e;
    }
}

genBtn.onclick = function () {
    var text = expInp.value;
    var exp = parser.parse(text);
    document.getElementById("console").innerHTML = printTruthTable(genTruthTable(exp))
}

function removeDupsExps(exps) {
    let unique = {};
    exps.forEach((exp) => {
        unique[exp.getExp()] = exp
    })

    var arr = [];
    for (var key in unique) {
        arr.push(unique[key]);
    }
    return arr;
}

function genTruthTable(exp) {
    var exps = removeDupsExps(exp.getSubExps());
    var variables = [...new Set(exp.getVariables())]
    var table = [];

    for (var i = 2 ** variables.length - 1; i >= 0; i--) {
        table[i] = {};

        var vals = i.toString(2).padStart(variables.length, "0")
        var valsArry = {}

        for (var j = 0; j < variables.length; j++) {
            var val = vals[j] == "1" ? true : false;
            table[i][variables[j]] = val;
            valsArry[variables[j]] = val;
        }

        for (var subExp of exps) {
            table[i][subExp.getExp()] = subExp.solve(valsArry);
        }
    }
    return table.reverse();
}

function printTruthTable(tt) {
    var html = "<table><thead><tr>"
    for(var key in tt[0]){
        html += `<th>${key}</th>`;
    }
    html += "</tr></thead><tbody>"
    for(var row of tt){
        html += "<tr>"
        for(var key in row){
            html += `<td>${row[key]? "T": "F"}</td>`;
        }
        html += "</tr>"
    }
    html += "</tbody></table>"

    return html;
}