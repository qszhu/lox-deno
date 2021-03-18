import Token from "./Token.ts";

export default class RuntimeError extends Error {
  constructor(private _token: Token, message: string) {
    super(message);
  }

  get token(): Token {
    return this._token
  }
}
