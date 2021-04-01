import Interpreter from "./Interpreter.ts";
import LoxCallable from "./LoxCallable.ts";
import LoxFunction from "./LoxFunction.ts";
import LoxInstance from "./LoxInstance.ts";

export default class LoxClass implements LoxCallable {
  constructor(
    private _name: string,
    private _methods: Map<string, LoxFunction>
  ) {}

  findMethod(name: string): LoxFunction | undefined {
    if (this._methods.has(name)) {
      return this._methods.get(name);
    }
  }

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
