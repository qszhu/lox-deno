import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

export default class ErrorReporter {
  static hadError = false;
  static hadRuntimeError = false;

  static error(line: number, message: string): void {
    ErrorReporter.report(line, "", message);
  }

  static runtimeError(error: RuntimeError): void {
    console.log(`${error.message}\n[line ${error.token.line}]`);
    ErrorReporter.hadRuntimeError = true;
  }

  private static report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error${where}: ${message}`);
    ErrorReporter.hadError = true;
  }

  static parseError(token: Token, message: string): void {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end ", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }
}
