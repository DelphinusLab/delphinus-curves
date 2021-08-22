import { Field } from "./field";
import { poseidon } from "./poseidon";

const hash = poseidon;
const MaxHeight = 16;

export interface Node {
  value: Field;
  children: (Node | undefined) [];
}

export interface PathInfo {
  index: number;
  pathDigests: Field[][];
}

export class MarkleTree {
  root?: Node;
  static emptyHashes: Field[];

  static emptyNodeHash(height: number) {
    if (this.emptyHashes.length === 0) {
      this.emptyHashes.push(new Field(0));
      for (let i = 0; i < MaxHeight; i++) {
        const last = this.emptyHashes[0];
        this.emptyHashes.push(hash([last, last, last, last]));
      }
    }

    return this.emptyHashes[height];
  }

  static emptyNode(height: number): Node {
    return {
      value: this.emptyNodeHash(height),
      children: [undefined, undefined, undefined, undefined]
    };
  }

  getPath(index: number): PathInfo {
    const ret = {
      index,
      pathDigests: [] as Field[][]
    };

    let curr = this.root;
    for (let level = MaxHeight; level >= 1; level--) {
      curr = curr ?? MarkleTree.emptyNode(level);
      ret.pathDigests.push(curr.children.map(n => n?.value ?? MarkleTree.emptyNodeHash(level - 1)));
      const offset = (index >> ((level - 1) * 2)) & 3;
      curr = curr.children[offset];
    }

    return ret;
  }

  set(index: number, value: Field) {
    const path = [];

    this.root ??= MarkleTree.emptyNode(MaxHeight);
    let curr: Node  = this.root;
    path.push(curr);

    for (let level = MaxHeight - 1; level >= 1; level--) {
      const offset = (index >> (level * 2)) & 3;
      const next = curr.children[offset] ?? MarkleTree.emptyNode(level);
      curr.children[offset] = next;
      curr = next;
      path.push(curr);
    }

    curr.children[index & 3] = { value, children: [] };

    for (let level = 0; level <= MaxHeight; level++) {
      const _curr = path.pop();
      _curr && this.updateNodeHash(_curr, level);
    }
  }

  updateNodeHash(node: Node, level: number) {
    node.value = hash(node.children.map(n => n?.value ?? MarkleTree.emptyNodeHash(level)));
  }
}