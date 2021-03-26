import Interpreter from "./Interpreter.ts";

export default interface LoxCallable {
  arity: number
  call(interpreter: Interpreter, args: any[]): any;
}
