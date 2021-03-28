export default class Return extends Error {
  constructor(private _value: any) {
    super();
  }

  get value(): any {
    return this._value;
  }
}
