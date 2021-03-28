import Environment from "./Environment.ts";
import Interpreter from "./Interpreter.ts";
import LoxCallable from "./LoxCallable.ts";
import { FunctionStmt } from "./Stmt.ts";

export default class LoxFunction implements LoxCallable {
  constructor(
    private _declaration: FunctionStmt,
    private _closure: Environment
  ) {}

  get arity(): number {
    return this._declaration.params.length;
  }

  call(interpreter: Interpreter, args: any[]): any {
    const environment = new Environment(this._closure);
    for (let i = 0; i < this._declaration.params.length; i++) {
      environment.define(this._declaration.params[i].lexeme, args[i]);
    }
    try {
      interpreter.executeBlock(this._declaration.body, environment);
    } catch (returnValue) {
      return returnValue.value;
    }
    return null;
  }

  toString(): string {
    return `<fn ${this._declaration.name.lexeme}>`;
  }
}
