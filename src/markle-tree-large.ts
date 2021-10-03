import { Field } from "./field";
import { poseidon } from "./poseidon";

const hash = poseidon;
export const MaxHeight = 16;
export const BlockSize = 4;

export interface PathInfo {
  root: Field;
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
      this.emptyHashes = this.emptyHashes.reverse();
    }
    return this.emptyHashes[height];
  }

  data: Map<string, Field> = new Map();

  private async getNode(mtIndex: string) {
    return this.data.get(mtIndex + "I");
  }

  private async getNodeOrDefault(mtIndex: string) {
    let value = await this.getNode(mtIndex + "I");
    if (value === undefined) {
      value = MarkleTree.emptyNodeHash(mtIndex.length);
    }
    return value;
  }

  private async getNodeOrCreate(mtIndex: string) {
    let value = await this.getNode(mtIndex + "I");
    if (value === undefined) {
      value = MarkleTree.emptyNodeHash(mtIndex.length);
      await this.setNode(mtIndex, value);
    }
    return value;
  }

  private async setNode(mtIndex: string, value: Field) {
    return this.data.set(mtIndex + "I", value);
  }

  private convertToMtIndex(index: number) {
    return index.toString(BlockSize);
  }

  private async fillPath(index: number) {
    const mtIndex = this.convertToMtIndex(index);
    for (let i = 0; i < MaxHeight; i++) {
      await this.getNodeOrCreate(mtIndex.slice(0, i));
    }
  }

  async getPath(index: number) {
    const ret = {
      root: await this.getNodeOrDefault(""),
      index: index,
      pathDigests: [] as Field[][],
    } as PathInfo;

    const mtIndex = this.convertToMtIndex(index);
    for (let i = 0; i < MaxHeight; i++) {
      const digests = await Promise.all(
        // Used to generate [0, 1, ..., BlockSize]
        Array.from(Array(BlockSize).keys()).map((v) =>
          this.getNodeOrDefault(mtIndex.slice(0, i) + v)
        )
      );
      ret.pathDigests.push(digests);
    }

    return ret;
  }

  async getLeave(index: number) {
    const mtIndex = this.convertToMtIndex(index);
    return await this.getNodeOrDefault(mtIndex);
  }

  private async getChildren(mtIndex: string) {
    return await Promise.all(
      Array.from(Array(BlockSize).keys()).map((v) =>
        this.getNodeOrDefault(mtIndex + v)
      )
    );
  }

  async getLeaves(index: number) {
    const mtIndex = this.convertToMtIndex(index);
    return this.getChildren(mtIndex.slice(0, MaxHeight - 1));
  }

  private async updateHash(index: number) {
    const mtIndex = this.convertToMtIndex(index);
    for (let i = 0; i < MaxHeight; i++) {
      const layer = MaxHeight - i - 1;
      const layerIndex = mtIndex.slice(0, layer);
      const children = await this.getChildren(layerIndex);
      const value = hash(children);
      await this.setNode(layerIndex, value);
    }
  }

  async getRoot() {
    return this.getNodeOrDefault("");
  }

  async setLeave(index: number, value: Field) {
    const mtIndex = this.convertToMtIndex(index);
    const path = await this.fillPath(index);
    await this.setNode(mtIndex, value);
    await this.updateHash(index);
    return path;
  }

  async setLeaves(index: number, values: Field[]) {
    if (values.length != BlockSize) {
      throw new Error(`Invalid leaves length: ${values.length}`);
    }

    const mtIndex = this.convertToMtIndex(index);
    const path = await this.fillPath(index);

    await Promise.all(
      // Used to generate [0, 1, ..., BlockSize]
      Array.from(Array(BlockSize).keys()).map((v) =>
        this.setNode(mtIndex.slice(0, MaxHeight - 1) + v, values[v])
      )
    );
    await this.updateHash(index);
    return path;
  }
}
