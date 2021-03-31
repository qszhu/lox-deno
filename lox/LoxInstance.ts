import LoxClass from "./LoxClass.ts";

export default class LoxInstance {
  constructor(private _klass: LoxClass) {}

  toString(): string {
    return `${this._klass.name} instance`;
  }
}
