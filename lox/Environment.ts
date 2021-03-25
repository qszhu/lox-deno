import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";

export default class Environment {
  private _values: Map<string, any>;

  constructor(private _enclosing?: Environment) {
    this._values = new Map();
  }

  define(name: string, value: any): void {
    this._values.set(name, value);
  }

  get(name: Token): any {
    if (this._values.has(name.lexeme)) {
      return this._values.get(name.lexeme);
    }

    if (this._enclosing) return this._enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: any): void {
    if (this._values.has(name.lexeme)) {
      this._values.set(name.lexeme, value);
      return;
    }

    if (this._enclosing) {
      this._enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
