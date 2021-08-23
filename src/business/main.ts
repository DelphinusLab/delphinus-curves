import { Field } from "../field";
import { MaxHeight, PathInfo } from "../markle-tree";
import { AddPoolCommand } from "./addpool";
import { Command, L2Storage } from "./command";

class ZKPInputBuilder {
  inputs: Field[] = [];

  push(data: Field | Field[]) {
    if (data instanceof Field) {
      this.inputs.push(data);
    } else {
      this.inputs = this.inputs.concat(data);
    }
  }

  _pushPathInfo(pathInfo: PathInfo) {
    for (let i = 0; i < 32; i++) {
      this.push(new Field((pathInfo.index >> (31 - i)) & 1));
    }
    for (let i = 0; i < MaxHeight; i++) {
      this.push(pathInfo.pathDigests[i].slice(0, 4));
    }
  }

  pushPathInfo(pathInfoList: PathInfo[]) {
    for (const pathInfo of pathInfoList) {
      this._pushPathInfo(pathInfo);
    }

    for (let i = 0; i < 5 - pathInfoList.length; i++) {
      this._pushEmptyPathInfo();
    }
  }

  _pushEmptyPathInfo() {
    for (let i = 0; i < 32; i++) {
      this.push(new Field(0));
    }
    for (let i = 0; i < MaxHeight; i++) {
      this.push(new Array(4).map(_ => new Field(0)));
    }
  }

  pushCommand(op: Field, command: Command) {
    this.push(op);
    this.push(command.args);
  }

  pushRootHash(storage: L2Storage) {
    this.push(storage.root.value);
  }
}

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(5)) {
    return new AddPoolCommand(args);
  }

  throw new Error('Not implemented yet');
}

export function genZKPInput(op: Field, args: Field[], storage: L2Storage): Field[] {
  const builder = new ZKPInputBuilder();

  const command = createCommand(op, args);
  builder.pushCommand(op, command);
  builder.pushRootHash(storage);

  const pathInfo = command.run(storage);
  builder.pushPathInfo(pathInfo);

  return builder.inputs;
}