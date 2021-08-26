import { Field } from "./field";
import { poseidon } from "./poseidon";

const hash = poseidon;
export const MaxHeight = 16;

export interface Node {
  value: Field;
  children: (Node | undefined) [];
}

export interface PathInfo {
  index: number;
  pathDigests: Field[][];
}

export class MarkleTree {
  static emptyHashes: Field[] = [];

  static emptyNodeHash(height: number) {
    if (this.emptyHashes.length === 0) {
      this.emptyHashes.push(new Field(0));
      for (let i = 0; i < MaxHeight; i++) {
        const last = this.emptyHashes[i];
        this.emptyHashes.push(hash([last, last, last, last]));
      }
    }

    return this.emptyHashes[height];
  }

  static emptyNode(height: number): Node {
    return {
      value: this.emptyNodeHash(height),
      children: height === 0 ? [] : [undefined, undefined, undefined, undefined]
    };
  }

  root: Node = MarkleTree.emptyNode(MaxHeight);

  getPath(index: number): PathInfo {
    const ret = {
      index,
      pathDigests: [] as Field[][]
    };

    let curr = this.root;
    for (let level = MaxHeight; level >= 1; level--) {
      ret.pathDigests.push(curr.children.map(n => n?.value ?? MarkleTree.emptyNodeHash(level - 1)));
      const offset = (index >> ((level - 1) * 2)) & 3;
      curr = curr.children[offset] ?? MarkleTree.emptyNode(level);
    }

    return ret;
  }

  _fillPath(index: number) {
    const path = [];

    let curr: Node  = this.root;
    path.push(curr);

    for (let level = MaxHeight - 1; level > 0; level--) {
      const offset = (index >> (level * 2)) & 3;
      const next = curr.children[offset] ?? MarkleTree.emptyNode(level);
      curr.children[offset] = next;
      curr = next;
      path.push(curr);
    }

    return path;
  }

  get(index: number) {
    const path = this._fillPath(index);
    return path[path.length - 1].children[index & 3]?.value ?? new Field(0);
  }

  set(index: number, value: Field) {
    const path = this._fillPath(index);
    const leaf = path[path.length - 1].children[index & 3];

    if (leaf) {
      leaf.value = value;
    }

    for (let level = 0; level <= MaxHeight; level++) {
      const _curr = path.pop();
      _curr && this.updateNodeHash(_curr, level);
    }
  }

  setLeaves(index: number, values: Field[]) {
    if (values.length != 4) {
      throw new Error(`Invalid leaves length: ${values.length}`);
    }

    const path = this._fillPath(index);
    path[path.length - 1].children = values.map(value => ({ value, children: [] }));

    for (let level = 0; level <= MaxHeight; level++) {
      const _curr = path.pop();
      _curr && this.updateNodeHash(_curr, level);
    }
  }

  updateNodeHash(node: Node, level: number) {
    node.value = hash(node.children.map(n => n?.value ?? MarkleTree.emptyNodeHash(level)));
  }
}