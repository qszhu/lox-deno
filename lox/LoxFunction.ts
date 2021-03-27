import Environment from "./Environment.ts";
import Interpreter from "./Interpreter.ts";
import LoxCallable from "./LoxCallable.ts";
import { FunctionStmt } from "./Stmt.ts";

export default class LoxFunction implements LoxCallable {
  constructor(private _declaration: FunctionStmt) {}

  get arity(): number {
    return this._declaration.params.length;
  }

  call(interpreter: Interpreter, args: any[]): void {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this._declaration.params.length; i++) {
      environment.define(this._declaration.params[i].lexeme, args[i]);
    }
    interpreter.executeBlock(this._declaration.body, environment);
  }

  toString(): string {
    return `<fn ${this._declaration.name.lexeme}>`;
  }
}
