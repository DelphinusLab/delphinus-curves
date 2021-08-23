import BN from "bn.js";
import { Field } from "../field";
import { MarkleTree, PathInfo } from "../markle-tree";

export class Command {
  args: Field[];

  constructor(args: Field[]) {
    this.args = args.concat(new Array(8).map(_ => new Field(0))).slice(0, 8);
  }

  run(storage: L2Storage): PathInfo[] {
    throw new Error('Not Implemented yet');
  }
}

export enum StoreNameSpace {
  BalanceStore = 0,
  PoolStore = 1,
  ShareStore = 2,
}

export class PoolStoreIndex {
  poolIndex: number;

  get index() {
    return (StoreNameSpace.PoolStore << 30) | (this.poolIndex << 20);
  }

  constructor(poolIndex: number) {
    if (poolIndex < 0 || poolIndex >= 1024) {
      throw new Error(`Bad pool index: ${poolIndex}`);
    }
    this.poolIndex = poolIndex;
  }
}

export class L2Storage extends MarkleTree {
  getPoolToken0Info(index: number) {
    return this.get(index + 0);
  }

  getPoolToken1Info(index: number) {
    return this.get(index + 1);
  }

  getPoolToken0Amount(index: number) {
    return this.get(index + 2);
  }

  getPoolToken1Amount(index: number) {
    return this.get(index + 3);
  }
}
