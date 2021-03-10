import { readStringDelim } from "https://deno.land/std@0.88.0/io/mod.ts";
import { Scanner } from "./Scanner.ts";

export default class Lox {
  private static hadError = false;

  static runFile(path: string) {
    const text = Deno.readTextFileSync(path);
    Lox.run(text);
    if (Lox.hadError) Deno.exit(65);
  }

  static async runPrompt() {
    await Deno.stdout.write(new TextEncoder().encode("> "));
    for await (const line of readStringDelim(Deno.stdin, "\n")) {
      if (!line) break;
      Lox.run(line);
      Lox.hadError = false;
      await Deno.stdout.write(new TextEncoder().encode("> "));
    }
  }

  private static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    for (const token of tokens) {
      console.log(token);
    }
  }

  static error(line: number, message: string): void {
    Lox.report(line, "", message);
  }

  private static report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
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
