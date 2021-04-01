import LoxClass from "./LoxClass.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";

export default class LoxInstance {
  private _fields = new Map<string, any>();

  constructor(private _klass: LoxClass) {}

  get(name: Token): any {
    if (this._fields.has(name.lexeme)) {
      return this._fields.get(name.lexeme);
    }

    const method = this._klass.findMethod(name.lexeme);
    if (method) return method;

    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  set(name: Token, value: any) {
    this._fields.set(name.lexeme, value);
  }

  toString(): string {
    return `${this._klass.name} instance`;
  }
}
