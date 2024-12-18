import { Field } from "./field.js";
import { poseidon } from "./poseidon.js";

const hash = poseidon;
export const MaxHeight = 16;

export interface Node {
  value: Field;
  children: (Node | undefined) [];
}

export interface PathInfo {
  root: Field;
  index: number;
  pathDigests: Field[][];
}

export class MerkleTree {
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

  root: Node = MerkleTree.emptyNode(MaxHeight);

  getPath(index: number): PathInfo {
    const ret = {
      root: this.root.value,
      index: index,
      pathDigests: [] as Field[][]
    };

    let curr = this.root;
    for (let level = MaxHeight; level >= 1; level--) {
      ret.pathDigests.push(curr.children.map(n => n?.value ?? MerkleTree.emptyNodeHash(level - 1)));
      const offset = (index >> ((level - 1) * 2)) & 3;
      curr = curr.children[offset] ?? MerkleTree.emptyNode(level);
    }

    return ret;
  }

  _fillPath(index: number) {
    const path = [];

    let curr: Node  = this.root;
    path.push(curr);

    for (let level = MaxHeight - 1; level >= 0; level--) {
      const offset = (index >> (level * 2)) & 3;
      const next = curr.children[offset] ?? MerkleTree.emptyNode(level);
      curr.children[offset] = next;
      curr = next;
      path.push(curr);
    }

    return path;
  }

  getLeave(index: number) {
    const path = this._fillPath(index);
    return path[path.length - 1]?.value ?? new Field(0);
  }

  getLeaves(index: number) {
    const path = this._fillPath(index);
    path.pop()
    return path[path.length - 1]?.children.map(child => child?.value ?? new Field(0));
  }

  _updateHash(path: Node[]) {
    for (let level = 1; level <= MaxHeight; level++) {
      const _curr = path.pop()!;
      const _childrenValues = _curr.children.map(n => n?.value ?? MerkleTree.emptyNodeHash(level - 1));
      _curr.value = hash(_childrenValues);

      //console.log(`level ${level}`);
      //console.log(`children ${_childrenValues.map(v => v.v.toString(10)).join(", ")}`);
      //console.log(`hash ${_curr.value.v.toString(10)}`);
    }
  }

  setLeave(index: number, value: Field) {
    const path = this._fillPath(index);
    const leaf = path.pop();

    leaf!.value = value;
    //console.log('set value ' + value.v.toString(10));
    this._updateHash(path);
    //console.log('root hash is ' + this.root.value.v.toString(10));
  }

  setLeaves(index: number, values: Field[]) {
    if (values.length != 4) {
      throw new Error(`Invalid leaves length: ${values.length}`);
    }

    const path = this._fillPath(index);
    const _leaf = path.pop();

    //console.log('set values ' + values.map(value => value.v.toString(10)).join(" "));
    path[path.length - 1].children = values.map(value => ({ value, children: [] }));
    this._updateHash(path);
    //console.log('root hash is ' + this.root.value.v.toString(10));
  }

  getRoot() {
    return this.root.value;
  }
}