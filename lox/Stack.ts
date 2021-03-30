export default class Stack<T> {
  private _data: T[] = [];

  get size(): number {
    return this._data.length;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  push(v: T) {
    this._data.push(v);
  }

  pop(): T | undefined {
    return this._data.pop();
  }

  peek(): T {
    return this._data[this.size - 1];
  }

  get(i: number): T {
    return this._data[i];
  }
}
