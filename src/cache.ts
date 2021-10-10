import { Field } from "./field";

export class Cache {
  private data: Map<string, Field>;
  private readonly capability: number;;
  private count: number;
  // FIFO cache
  private queue: string[];

  constructor(cap: number) {
    this.capability = cap;
    this.data = new Map();
    this.count = 0;
    this.queue = [];
  }

  invalidate() {
    this.data.clear();
    this.count == 0;
    this.queue = [];
  }

  private try_shrink() {
    if (this.count == this.capability) {
      let k = this.queue.shift();
      this.data.delete(k!);
      this.count--;
    }
  }

  add(k: string, v: Field) {
    if (!this.data.has(k)) {
      this.count++;
      this.queue.push(k);
      this.try_shrink();
    }
    this.data.set(k, v);
  }

  find(k: string) {
    return this.data.get(k)
  }
}