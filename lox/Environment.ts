import Token from "./Token.ts";
import RuntimeError from "./RuntimeError.ts";

export default class Environment {
  private _values: Map<string, any>;

  constructor() {
    this._values = new Map();
  }

  define(name: string, value: any): void {
    this._values.set(name, value);
  }

  get(name: Token): any {
    if (this._values.has(name.lexeme)) {
      return this._values.get(name.lexeme);
    }
    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: any): void {
    if (this._values.has(name.lexeme)) {
      this._values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
