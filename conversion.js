var logger = new Logger('console');

var map = {};
function initMap() {
    for (var i = 0; i < 10; i++) map[i] = i;
    for (var i = 0; i < 26; i++) {
        map[i + 10] = String.fromCharCode(i + 65);
        map[String.fromCharCode(i + 65)] = i + 10;
    }
}

function padNum(num, len) {
    num = num.toString()
    return (num.length >= len) ? num : "0".repeat(len - num.length) + num;
}

class Base10toX {
    static convert(number, base, verbose) {
        if (base < 2 || base > 36)
            throw `Range Error: radix argument must be between 2 and 36`;

        var newNum = '';
        var steps = [{ 'num': number }];

        while (number >= base) {
            var temp = [Math.floor(number / base), number % base];
            var mod = temp[1];
            number = temp[0];
            steps.push({ 'num': number, 'mod': map[mod] });
            newNum += map[mod];
        }
        newNum += map[number];
        newNum = newNum.split("").reverse().join("");
        this.print(steps, base, newNum, verbose);
        return newNum;
    }

    static print(steps, base, num, showSteps) {
        if (showSteps) {
            var lineLen = steps[0].num.toString().length + 8;
            for (var i = 1; i <= steps.length; i++) {
                this.logStep(steps[i - 1], base, i == steps.length);
            }
        }
        logger.log(`\n\n(${steps[0].num})<sub>10</sub> → (${num})<sub>${base}</sub>`)
    }

    static logStep(step, base, isLast) {
        if (step.mod != undefined)
            logger.log(`${base} | ${step.num} - ${step.mod}`);
        else
            logger.log(`${base} | ${step.num}`);

        !isLast && logger.log(
            '─'.repeat(base.toString().length + 1) + '┼'
            + '─'.repeat(step.num.toString().length + 6)
        )
    }
}

class BaseXto10 {
    static convert(number, base, verbose) {
        var newNum = parseInt(number, base);
        if (verbose) this.print(number.toUpperCase(), newNum, base);
        return newNum;
    }

    static getStep1(num) {
        var str = '', i = num.length - 1;
        for (var char of num) {
            str += `(${map[char]} × 16<sup>${i--}</sup>) + `;
        }
        return str.slice(0, -3);
    }

    static getStep2(num) {
        var str = '', i = num.length - 1;
        for (var char of num) {
            str += `(${map[char]} × ${Math.pow(16, i--)}) + `;
        }
        return str.slice(0, -3);
    }

    static getStep3(num) {
        var str = '', i = num.length - 1;
        for (var char of num) {
            str += `${map[char] * Math.pow(16, i--)} + `;
        }
        return str.slice(0, -3);
    }

    static print(num, newNum, base) {
        logger.log(`= ${this.getStep1(num)}`);
        logger.log(`= ${this.getStep2(num)}`);
        logger.log(`= ${this.getStep3(num)}`);
        logger.log(`= ${newNum}`);
        logger.log(`\n\n(${num})<sub>${base}</sub> → (${newNum})<sub>10</sub>`)
    }
}

class Base8or16to2 {
    static convert(num, base, verbose) {
        var out = "";
        if (verbose) {
            Base8or16to2.printTable(base)
            logger.log("\nFrom above table\n");
        }
        for (var ch of num) {
            out += padNum(parseInt(ch, base).toString(2), base==8?3:4);
            if (verbose)
                logger.log(`${ch} → ${padNum(parseInt(ch, base).toString(2), base==8?3:4)}`)
        }

        logger.log(`\n\n(${num})<sub>${base}</sub> → (${out})<sub>2</sub>`)
        return out;
    }

    static printTable(base) {
        logger.log('┌───────┬────────┐')
        logger.log(`│ ${base==8?'Octal':'Hexa '} │ Binary │`)
        logger.log('├───────┼────────┤')
        for (var i = 0; i < base; i++) {
            logger.log(`│   ${i.toString(16).toUpperCase()}   │  ${
                padNum(i.toString(2), base==8?3:4)+(base==8?'   ':'  ')
            }│`)
        }
        logger.log('└───────┴────────┘')
    }
}

function convert(num, from, to, verbose) {
    logger.clear();
    if (from == 10) {
        Base10toX.convert(parseInt(num), to, verbose)
    } else if (to == 10) {
        BaseXto10.convert(num, from, verbose)
    } else if ((from == 8 || from == 16) && to == 2) {
        Base8or16to2.convert(num, from, verbose);
    }
}

initMap();
