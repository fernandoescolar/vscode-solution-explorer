import * as fs from "@extensions/fs";
import * as path from "@extensions/path";

type TokenType = "LPAREN" | "RPAREN" | "AND" | "OR" | "NOT" | "EQ" | "NEQ" | "EXISTS" | "STRING";

interface Token {
    type: TokenType;
    value?: string;
}

// Evaluates the realistic subset of MSBuild Condition syntax seen in the wild
// (==, !=, And/Or/!, parentheses, Exists(), bare true/false). Anything it can't
// parse fails open (returns true), matching the previous "always include" behavior.
export async function evaluate(condition: string | undefined, properties: Record<string, string>, baseDir?: string): Promise<boolean> {
    if (!condition || !condition.trim()) {
        return true;
    }

    try {
        const expanded = expandProperties(condition, properties);
        const tokens = tokenize(expanded);
        const parser = new Parser(tokens, baseDir);
        const result = await parser.parseExpression();
        return parser.atEnd() ? result : true;
    } catch {
        return true;
    }
}

function expandProperties(condition: string, properties: Record<string, string>): string {
    let result = condition;
    Object.keys(properties).forEach(key => {
        result = result.split(`$(${key})`).join(properties[key] ?? "");
    });
    return result;
}

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
        const c = input[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === "(") { tokens.push({ type: "LPAREN" }); i++; continue; }
        if (c === ")") { tokens.push({ type: "RPAREN" }); i++; continue; }
        if (c === "'") {
            const end = input.indexOf("'", i + 1);
            if (end === -1) { throw new Error("Unterminated string literal"); }
            tokens.push({ type: "STRING", value: input.substring(i + 1, end) });
            i = end + 1;
            continue;
        }
        if (c === "=" && input[i + 1] === "=") { tokens.push({ type: "EQ" }); i += 2; continue; }
        if (c === "!" && input[i + 1] === "=") { tokens.push({ type: "NEQ" }); i += 2; continue; }
        if (c === "!") { tokens.push({ type: "NOT" }); i++; continue; }

        let j = i;
        while (j < input.length && !/[\s()!=']/.test(input[j])) { j++; }
        if (j === i) { throw new Error(`Unexpected character '${c}' in condition`); }
        const word = input.substring(i, j);
        i = j;

        const lower = word.toLowerCase();
        if (lower === "and") { tokens.push({ type: "AND" }); }
        else if (lower === "or") { tokens.push({ type: "OR" }); }
        else if (lower === "exists") { tokens.push({ type: "EXISTS" }); }
        else { tokens.push({ type: "STRING", value: word }); }
    }
    return tokens;
}

class Parser {
    private pos = 0;

    constructor(private readonly tokens: Token[], private readonly baseDir?: string) {}

    public atEnd(): boolean {
        return this.pos >= this.tokens.length;
    }

    public async parseExpression(): Promise<boolean> {
        return this.parseOr();
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private next(): Token {
        const token = this.tokens[this.pos];
        if (!token) { throw new Error("Unexpected end of condition"); }
        this.pos++;
        return token;
    }

    private async parseOr(): Promise<boolean> {
        let left = await this.parseAnd();
        while (this.peek()?.type === "OR") {
            this.next();
            const right = await this.parseAnd();
            left = left || right;
        }
        return left;
    }

    private async parseAnd(): Promise<boolean> {
        let left = await this.parseUnary();
        while (this.peek()?.type === "AND") {
            this.next();
            const right = await this.parseUnary();
            left = left && right;
        }
        return left;
    }

    private async parseUnary(): Promise<boolean> {
        if (this.peek()?.type === "NOT") {
            this.next();
            return !(await this.parseUnary());
        }
        return this.parsePrimary();
    }

    private async parsePrimary(): Promise<boolean> {
        const token = this.peek();
        if (!token) { throw new Error("Unexpected end of condition"); }

        if (token.type === "LPAREN") {
            this.next();
            const value = await this.parseExpression();
            if (this.peek()?.type !== "RPAREN") { throw new Error("Expected ')'"); }
            this.next();
            return value;
        }

        if (token.type === "EXISTS") {
            this.next();
            if (this.next().type !== "LPAREN") { throw new Error("Expected '(' after Exists"); }
            const arg = this.next();
            if (arg.type !== "STRING" || arg.value === undefined) { throw new Error("Expected string in Exists()"); }
            if (this.next().type !== "RPAREN") { throw new Error("Expected ')'"); }
            if (!this.baseDir) { return false; }
            return await fs.exists(path.join(this.baseDir, arg.value));
        }

        if (token.type === "STRING" && token.value !== undefined) {
            this.next();
            const left = token.value;
            const op = this.peek();
            if (op && (op.type === "EQ" || op.type === "NEQ")) {
                this.next();
                const right = this.next();
                if (right.type !== "STRING" || right.value === undefined) { throw new Error("Expected operand"); }
                const equal = left === right.value;
                return op.type === "EQ" ? equal : !equal;
            }

            const lower = left.toLowerCase();
            if (lower === "true") { return true; }
            if (lower === "false") { return false; }
            throw new Error(`Unsupported condition token '${left}'`);
        }

        throw new Error("Unexpected token in condition");
    }
}
