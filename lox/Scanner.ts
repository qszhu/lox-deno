import ErrorReporter from "./ErrorReporter.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

const KEYWORDS = new Map<string, TokenType>([
  ["and", TokenType.AND],
  ["class", TokenType.CLASS],
  ["else", TokenType.ELSE],
  ["false", TokenType.FALSE],
  ["for", TokenType.FOR],
  ["fun", TokenType.FUN],
  ["if", TokenType.IF],
  ["nil", TokenType.NIL],
  ["or", TokenType.OR],
  ["print", TokenType.PRINT],
  ["return", TokenType.RETURN],
  ["super", TokenType.SUPER],
  ["this", TokenType.THIS],
  ["true", TokenType.TRUE],
  ["var", TokenType.VAR],
  ["while", TokenType.WHILE],
]);

export class Scanner {
  private _tokens: Token[] = [];
  private _start: number = 0;
  private _current: number = 0;
  private _line: number = 1;

  constructor(private _source: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this._start = this._current;
      this.scanToken();
    }
    this._tokens.push(new Token(TokenType.EOF, "", null, this._line));
    return this._tokens;
  }

  private isAtEnd(): boolean {
    return this._current >= this._source.length;
  }

  private advance(): string {
    return this._source[this._current++];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this._source[this._current] !== expected) return false;

    this._current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this._source[this._current];
  }

  private peekNext(): string {
    if (this._current + 1 >= this._source.length) return "\0";
    return this._source[this._current + 1];
  }

  private isDigit(c: string): boolean {
    return /\d/.test(c);
  }

  private isAlpha(c: string): boolean {
    return /[A-Za-z_]/.test(c);
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this._source.substring(this._start, this._current);
    this._tokens.push(new Token(type, text, literal, this._line));
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          // comment
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this._line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          ErrorReporter.error(this._line, "Unexpected character.");
        }
        break;
    }
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this._line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      ErrorReporter.error(this._line, "Unterminated string.");
      return;
    }

    // closing '"'
    this.advance();

    const value = this._source.substring(this._start + 1, this._current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this._source.substring(this._start, this._current))
    );
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this._source.substring(this._start, this._current);
    const type = KEYWORDS.get(text) || TokenType.IDENTIFIER;
    this.addToken(type);
  }
}
