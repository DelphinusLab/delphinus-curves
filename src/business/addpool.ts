import { Field } from "../field";
import { PathInfo } from "../markle-tree";
import { Command, L2Storage, PoolStoreIndex } from "./command";

export class AddPoolCommand extends Command {
  run(storage: L2Storage): PathInfo[] {
    const path = [] as PathInfo[];

    const poolIndex = this.args[1];
    const tokenIndex0 = this.args[2];
    const tokenIndex1 = this.args[3];

    const index = new PoolStoreIndex(poolIndex.v.toNumber()).index;
    path.push(storage.getPath(index));

    const zero = new Field(0);
    storage.setLeaves(index, [tokenIndex0, tokenIndex1, zero, zero]);

    return path;
  }
}
