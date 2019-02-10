const expr_types = {
    BinaryExpr: 1,
    UnaryExpr: 2
}

const binary_operators = {
    "NOT": 1, "~": 1,
    "AND": 2, "∧": 2, "^": 2,
    "OR": 3, "∨": 3,
    "IMP": 4, "→": 4,
    "IFF": 5, "↔": 5
}


class ExpressionParser {

    constructor() {
        this.scanner = new Scanner();
    }

    parse(text, until) {
        this.scanner.setSource(text);
        return this._parseUntil(until);
    }

    _parseUntil(until) {
        var nodes = [];
        var untilReached = false;
        while (true) {
            this.scanner.peekState();
            this.token = this.scanner.scan();
            this.scanner.seekState();

            if (!this.token.text ||
                this.token.type == this.scanner.token_types.EOL
            ) {
                this.token = this.scanner.scan();
                untilReached = false;
                break;
            }

            else if (this.token.text == until) {
                this.token = this.scanner.scan();
                untilReached = true
                break;
            }

            else {
                if (nodes.length > 0) {
                    throw `Unexpected token ${this.token.text}`;
                }

                var node = this._binaryParser();
                nodes.push(node);
            }
        }
        if (nodes.length == 1)
            return nodes[0]
        return nodes;
    }

    _readToken() {
        this.token = this.scanner.scan();

        // Uniary Operators
        if (this._isUniaryOp(this.token.text)) {
            var op = this.token;
            var argument = this._readToken();
            if (!argument) throw `Expected expression after "${op.text}" at ${this.scanner.pos}`;
            return new UniaryExpression(op.text, argument);
        }

        // Parentheses
        else if (this.token.text == '(') {
            return this._parseUntil(')');
        }

        // Variable
        else if (this.token.type == this.scanner.token_types.Variable)
            return new Variable(this.token.text);

        // Bool
        else if (this.token.type == this.scanner.token_types.Bool)
            throw `Booleans not supported yet`;
    }

    _readBinaryToken() {
        this.scanner.peekState();
        this.token = this.scanner.scan();

        if (this.token.type == this.scanner.token_types.Unknown) {
            throw `Unexpected "${this.token.text}" at ${this.scanner.pos}`
        }

        if (this.token.type == this.scanner.token_types.Operator) {
            return new BinaryOperator(this.token.text)
        }

        this.scanner.seekState();
        return false;
    }

    _isUniaryOp(text) {
        var operators = ['~', 'NOT'];
        return operators.indexOf(text) > -1;
    }

    _isEndOfInput(token) {
        var x = [this.scanner.token_types.EOF, this.scanner.token_types.EOL]
        return x.indexOf(token.type) > -1
    }

    _binaryParser() {
        var left = this._readToken();
        var operator = this._readBinaryToken();

        if (!operator) return left;

        var right = this._readToken();
        if (!right || this._isEndOfInput(right)) {
            throw `Expected expression after "${operator.text}" at ${this.scanner.pos}`
        }

        var stack = [left, operator, right];
        while (operator = this._readBinaryToken()) {
            if (operator.prec == 0) break;

            while (stack.length > 2 && operator.prec <= stack[stack.length - 2].prec) {
                right = stack.pop();
                var op = stack.pop();
                left = stack.pop();
                var node = new BinaryExpression(op, left, right);
                stack.push(node);
            }

            var node = this._readToken();
            if (!node) {
                throw `Expected expression after "${operator}" at ${this.scanner.pos}`
            }
            stack.push(operator, node);
        }

        var i = stack.length - 1;
        node = stack[i];
        while (i > 1) {
            node = new BinaryExpression(stack[i - 1], stack[i - 2], node);
            i -= 2;
        }
        return node;
    }
}

class BinaryExpression {
    constructor(operator, left, right) {
        this.left = left;
        this.right = right;
        this.operator = operator;
        this.is_binary = true;
        this.has_op = true;
    }

    getExp() {
        return `(${this.left.getExp()} ${this.operator.operator} ${this.right.getExp()})`;
    }

    getSubExps() {
        var exps = this.left.getSubExps();
        exps = exps.concat(this.right.getSubExps());
        exps.push(this);
        return exps;
    }

    getVariables() {
        return this.left.getVariables().concat(this.right.getVariables());
    }

    solve(values) {
        var left = this.left.solve(values);
        var right = this.right.solve(values);
        return this.operator.operate(left, right);
    }
}

class UniaryExpression {
    constructor(operator, argument) {
        this.operator = new UniaryOperator(operator);
        this.argument = argument;
        this.has_op = true;
        this.is_binary = false;
    }

    getExp() {
        return `${this.operator.operator}${this.argument.getExp()}`;
    }

    getSubExps() {
        var exps = this.argument.getSubExps();
        exps.push(this);
        return exps;
    }

    getVariables() {
        return this.argument.getVariables();
    }

    solve(values) {
        var arg = this.argument.solve(values);
        return this.operator.operate(arg);
    }
}

function getOp(op) {
    var ops = {
        "NOT": "¬", "~": "¬", "¬": "¬", "!": "¬",
        "AND": "∧", "∧": "∧", "&": "∧",
        "OR": "∨", "|": "∨", "∨": "∨",
        "XOR": "⊕", "⊕": "⊕",
        "IMP": "→", "->": "→", "=>": "→", ">": "→", "→": "→",
        "IFF": "↔", "<>": "↔", "↔": "↔", "<->": "↔", "<=>": "↔"
    }

    var operator = ops[op]
    if (operator) return operator;
    throw `Invalid operator "${op}"`
}

class BinaryOperator {
    constructor(op, prec) {
        this.text = op;
        this.operator = getOp(op);
        this.prec = binary_operators[op] || 0;
    }

    toString() {
        return this.text;
    }

    operate(a, b) {
        switch (this.operator) {
            case "∧": return a && b;
            case "∨": return a || b;
            case "⊕": return (a || b) && !(a && b);
            case "→": return a ? b : true;
            case "↔": return (a ? b : true) && (b ? a : true);
        }
    }
}

class UniaryOperator {
    constructor(op) {
        this.text = op,
            this.operator = getOp(op);
    }

    toString() {
        return this.text;
    }

    operate(arg) {
        switch (this.operator) {
            case "¬": return !arg;
        }
    }
}

class Variable {
    constructor(text) {
        this.text = text;
        this.length = text.length;
    }

    getExp() {
        return this.text.toLowerCase();
    }

    getSubExps() {
        return [];
    }

    solve(values) {
        return !!values[this.text.toLowerCase()];
    }

    getVariables() {
        return [this.text.toLowerCase()]
    }
}