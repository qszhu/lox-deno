import { readStringDelim } from "https://deno.land/std@0.88.0/io/mod.ts";
import ErrorReporter from "./ErrorReporter.ts";
import Interpreter from "./Interpreter.ts";
import Parser from "./Parser.ts";
import Resolver from "./Resolver.ts";
import { Scanner } from "./Scanner.ts";

export default class Lox {
  private static _interpreter = new Interpreter();

  static runFile(path: string) {
    const text = Deno.readTextFileSync(path);
    Lox.run(text);
    if (ErrorReporter.hadError) Deno.exit(65);
    if (ErrorReporter.hadRuntimeError) Deno.exit(70);
  }

  static async runPrompt() {
    await Deno.stdout.write(new TextEncoder().encode("> "));
    for await (const line of readStringDelim(Deno.stdin, "\n")) {
      if (!line) break;
      Lox.run(line);
      ErrorReporter.hadError = false;
      await Deno.stdout.write(new TextEncoder().encode("> "));
    }
  }

  private static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    if (ErrorReporter.hadError) return;

    const resolver = new Resolver(this._interpreter);
    resolver.resolveStatements(statements);

    if (ErrorReporter.hadError) return;

    this._interpreter.interpret(statements);
  }
}

if (import.meta.main) {
  if (Deno.args.length > 1) {
    console.log("Usage: lox [script]");
    Deno.exit(64);
  } else if (Deno.args.length === 1) {
    Lox.runFile(Deno.args[0]);
  } else {
    Lox.runPrompt();
  }
}
