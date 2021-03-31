import Interpreter from "./Interpreter.ts";
import LoxCallable from "./LoxCallable.ts";
import LoxInstance from "./LoxInstance.ts";

export default class LoxClass implements LoxCallable {
  constructor(private _name: string) {}

  get name(): string {
    return this._name;
  }

  toString(): string {
    return this.name;
  }

  call(interpreter: Interpreter, args: any[]): any {
    const instance = new LoxInstance(this);
    return instance;
  }

  get arity(): number {
    return 0;
  }
}
