import TokenType from "./TokenType.ts";

export default class Token {
  constructor(
    private _type: TokenType,
    private _lexeme: string,
    private _literal: any,
    private _line: number
  ) {}

  get type(): TokenType {
    return this._type;
  }

  get lexeme(): string {
    return this._lexeme;
  }

  get literal(): any {
    return this._literal;
  }

  get line(): number {
    return this._line;
  }

  toString(): string {
    return `${this._type} ${this._lexeme} ${this._literal}`;
  }
}
