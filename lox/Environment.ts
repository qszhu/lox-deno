import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";

export default class Environment {
  private _values: Map<string, any>;

  constructor(private _enclosing?: Environment) {
    this._values = new Map();
  }

  get enclosing(): Environment | undefined {
    return this._enclosing;
  }

  define(name: string, value: any): void {
    this._values.set(name, value);
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      environment = environment._enclosing as Environment;
    }
    return environment;
  }

  getAt(distance: number, name: string): any {
    return this.ancestor(distance)._values.get(name);
  }

  assignAt(distance: number, name: Token, value: any): void {
    this.ancestor(distance)._values.set(name.lexeme, value);
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
