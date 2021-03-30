import { readStringDelim } from "https://deno.land/std@0.88.0/io/mod.ts";
import Interpreter from "./Interpreter.ts";
import Parser from "./Parser.ts";
import Resolver from "./Resolver.ts";
import RuntimeError from "./RuntimeError.ts";
import { Scanner } from "./Scanner.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

export default class Lox {
  private static _hadError = false;
  private static _hadRuntimeError = false;
  private static _interpreter = new Interpreter();

  static runFile(path: string) {
    const text = Deno.readTextFileSync(path);
    Lox.run(text);
    if (Lox._hadError) Deno.exit(65);
    if (Lox._hadRuntimeError) Deno.exit(70);
  }

  static async runPrompt() {
    await Deno.stdout.write(new TextEncoder().encode("> "));
    for await (const line of readStringDelim(Deno.stdin, "\n")) {
      if (!line) break;
      Lox.run(line);
      Lox._hadError = false;
      await Deno.stdout.write(new TextEncoder().encode("> "));
    }
  }

  private static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    if (Lox._hadError) return;

    const resolver = new Resolver(this._interpreter);
    resolver.resolveStatements(statements);

    if (Lox._hadError) return;

    this._interpreter.interpret(statements);
  }

  static error(line: number, message: string): void {
    Lox.report(line, "", message);
  }

  static runtimeError(error: RuntimeError): void {
    console.log(`${error.message}\n[line ${error.token.line}]`);
    Lox._hadRuntimeError = true;
  }

  private static report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error${where}: ${message}`);
    Lox._hadError = true;
  }

  static parseError(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end ", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }
}

if (Deno.args.length > 1) {
  console.log("Usage: lox [script]");
  Deno.exit(64);
} else if (Deno.args.length === 1) {
  Lox.runFile(Deno.args[0]);
} else {
  Lox.runPrompt();
}
