class Scanner {

    constructor() {
        this.source = '';
        this.pos = 0;
        this.token = null;
        this.scanners = [
            this.EOFScanner.bind(this),
            this.EOLScanner.bind(this),
            this.operatorScanner.bind(this),
            this.boolScanner.bind(this),
            this.variableScanner.bind(this),
            this.bracketsScanner.bind(this),
            this.unknownScanner.bind(this),
        ];
        this.states = [];
        this.token_types = {
            Operator: 0,
            UniaryOperator: 1,
            Variable: 2,
            Bool: 3,
            Brackets: 4,
            EOF: 5,
            EOL: 6,
            Unknown: 7
        }
    }


    _regexScanner(text, regex, type) {
        var m = text.match(regex);
        if (m) return {
            length: m[0].length,
            type: type,
            text: m[0].toUpperCase()
        }
    }

    operatorScanner(text) {
        return this._regexScanner(text, /^(AND|OR|IMP|XOR|IFF|∨|\||∧|\^|~|→|>|↔|¬|(<>)|->|=>|<->|<=>|XOR)/i, this.token_types.Operator);
    }

    variableScanner(text) {
        return this._regexScanner(text, /^[a-z](\w+)?/i, this.token_types.Variable);
    }

    boolScanner(text) {
        return this._regexScanner(text, /^(True|False)/i, this.token_types.Bool);
    }

    bracketsScanner(text) {
        return this._regexScanner(text, /^(\(|\))/i, this.token_types.Brackets);
    }

    unknownScanner(text) {
        return this._regexScanner(text, /^(\d+|.)/i, this.token_types.Unknown);
    }

    EOFScanner(text) {
        if (!text[0]) return {
            length: 0,
            type: this.token_types.EOF,
            text: text[0]
        }
    }

    EOLScanner(text) {
        return this._regexScanner(text, /^(\r\n|\r|\n)/, this.token_types.EOL)
    }


    setSource(text) {
        this.source = text;
        this.pos = 0;
        this.token = null;
    }

    skipBlank() {
        var m = this.source.slice(this.pos).match(/^[ \t\f]+/);
        if (m) this.pos += m[0].length;
    }

    peekState() {
        this.states.push({
            'pos': this.pos,
            'token': this.token
        })
    }

    seekState() {
        var state = this.states.pop();
        if (state) {
            this.pos = state.pos;
            this.token = state.token;
        }
    }

    scan() {
        this.skipBlank();
        for (var scanner of this.scanners) {
            this.token = scanner(this.source.slice(this.pos));

            if (this.token) {
                this.pos += this.token.length;
                return this.token;
            }
        }
    }
}