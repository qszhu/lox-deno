import Lox from "./Lox.ts";
import Token from "./Token.ts";
import {
  BinaryExpr,
  Expr,
  GroupingExpr,
  LiteralExpr,
  UnaryExpr,
} from "./Expr.ts";
import TokenType from "./TokenType.ts";

class ParseError extends Error {}

export default class Parser {
  private _current: number = 0;

  constructor(private _tokens: Token[]) {}

  parse(): Expr | null {
    try {
      return this.expression();
    } catch (e) {
      return null;
    }
  }

  private peek(): Token {
    return this._tokens[this._current];
  }

  private previous(): Token {
    return this._tokens[this._current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this._current++;
    return this.previous();
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private expression(): Expr {
    return this.equality();
  }

  private binaryExpr(match: () => Expr, ...types: TokenType[]): Expr {
    let expr = match();

    while (this.match(...types)) {
      const operator = this.previous();
      const right = match();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    return this.binaryExpr(
      this.comparison.bind(this),
      TokenType.BANG_EQUAL,
      TokenType.EQUAL_EQUAL
    );
  }

  private comparison(): Expr {
    return this.binaryExpr(
      this.term.bind(this),
      TokenType.GREATER,
      TokenType.GREATER_EQUAL,
      TokenType.LESS,
      TokenType.LESS_EQUAL
    );
  }

  private term(): Expr {
    return this.binaryExpr(
      this.factor.bind(this),
      TokenType.MINUS,
      TokenType.PLUS
    );
  }

  private factor(): Expr {
    return this.binaryExpr(
      this.unary.bind(this),
      TokenType.SLASH,
      TokenType.STAR
    );
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpr(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new LiteralExpr(false);
    if (this.match(TokenType.TRUE)) return new LiteralExpr(true);
    if (this.match(TokenType.NIL)) return new LiteralExpr(null);
    if (this.match(TokenType.NUMBER, TokenType.STRING))
      return new LiteralExpr(this.previous().literal);
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new GroupingExpr(expr);
    }

    throw this.error(this.peek(), "Expect expression");
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.parseError(token, message);
    return new ParseError();
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}
