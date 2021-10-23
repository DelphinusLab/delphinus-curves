import { Field } from "./field";
import { poseidon } from "./poseidon";
import { default_snapshot_id, local_uri, MerkleTreeDb } from "./db";
import LRUCache = require("lru-cache");

const hash = poseidon;
export const MaxHeight = 16;
export const BlockShift = 2;
export const BlockSize = 1 << BlockShift;

export interface PathInfo {
  root: Field;
  index: number;
  pathDigests: Field[][];
}

const cacheOptions: any = {};
cacheOptions.max = 100;
cacheOptions.maxAge = 60 * 1000;

interface MerkleTreeStorage {
  getNode(mtIndex: string): Promise<Field | undefined>;
  setNode(mtIndex: string, value: Field): void;
  startSnapshot(id: string): void;
  endSnapshot(): void;
  lastestSnapshot(): Promise<string>;
  loadSnapshot(latestSnapshot: string): void;
  close(): void;
}

class MerkleTreeMemory implements MerkleTreeStorage {
  private inMemoryMerkleTree: Map<string, Field>;

  constructor() {
    this.inMemoryMerkleTree = new Map();
  }

  async getNode(mtIndex: string) {
    return this.inMemoryMerkleTree.get(mtIndex + "I");
  }

  setNode(mtIndex: string, value: Field) {
    return this.inMemoryMerkleTree.set(mtIndex + "I", value);
  }

  startSnapshot(id: string) {
    return;
  }

  endSnapshot() {
    return;
  }

  async lastestSnapshot() {
    return "0";
  }

  loadSnapshot(_latestSnapshot: string) {
    return;
  }

  close() {
    return;
  }
}

class MerkleTreeDB implements MerkleTreeStorage {
  private cache: LRUCache<string, Field>;
  private db: MerkleTreeDb;
  private currentSnapshotIdx: string | undefined = undefined;

  constructor(dbName: string, cacheSize: number) {
    this.cache = new LRUCache<string, Field>(cacheSize);
    this.db = new MerkleTreeDb(local_uri, dbName);
  }

  private async getRawNode(mtIndex: string) {
    return await this.db.queryMerkleTreeNodeFromPath(mtIndex + "I");
  }

  async getNode(mtIndex: string) {
    let field = this.cache.get(mtIndex);
    if (field !== undefined) {
      return field;
    } else {
      let node = await this.getRawNode(mtIndex);
      return node === undefined ? undefined : node.field;
    }
  }

  async setNode(mtIndex: string, value: Field) {
    if (this.currentSnapshotIdx === undefined) {
      throw new Error("snapshot not set");
    } else {
      let oldDoc = (await this.getRawNode(mtIndex)) || undefined;
      await this.db.updatePathLogging(
        mtIndex + "I",
        oldDoc?.field !== undefined
          ? oldDoc.field
          : MerkleTree.emptyNodeHash(mtIndex.length),
        value,
        oldDoc?.snapshot ?? default_snapshot_id,
        this.currentSnapshotIdx
      );
    }

    this.cache.set(mtIndex, value);
  }

  startSnapshot(id: string) {
    this.currentSnapshotIdx = id;
  }

  async endSnapshot() {
    if (this.currentSnapshotIdx === undefined) {
      throw new Error("snapshot not set");
    }

    await this.db.updateLatestSnapshotId(this.currentSnapshotIdx);
    this.currentSnapshotIdx = undefined;
  }

  async lastestSnapshot() {
    return this.db.queryLatestSnapshotId();
  }

  async loadSnapshot(latestSnapshot: string) {
    await this.db.restoreMerkleTree(latestSnapshot);
    this.cache.reset();
  }

  async close() {
    await this.db.closeMongoClient();
  }
}

export class MerkleTree {
  private storage: MerkleTreeStorage;

  constructor(isMemData = false) {
    if (isMemData) {
      this.storage = new MerkleTreeMemory();
    } else {
      this.storage = new MerkleTreeDB("delphinus", 10000);
    }
  }

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

  async getNode(mtIndex: string) {
    if (mtIndex.startsWith("-")) {
      throw new Error(mtIndex);
    }

    return await this.storage.getNode(mtIndex);
  }

  async setNode(mtIndex: string, value: Field) {
    await this.storage.setNode(mtIndex, value);
  }

  async startSnapshot(id: string) {
    this.storage.startSnapshot(id);
  }

  async endSnapshot() {
    await this.storage.endSnapshot();
  }

  async lastestSnapshot() {
    return await this.storage.lastestSnapshot();
  }

  async loadSnapshot(latestSnapshot: string) {
    await this.storage.loadSnapshot(latestSnapshot);
  }

  async closeDb() {
    await this.storage.close();
  }

  private async getNodeOrDefault(mtIndex: string) {
    let value = await this.getNode(mtIndex);
    if (value === undefined) {
      value = MerkleTree.emptyNodeHash(mtIndex.length);
    }
    return value;
  }

  private async getNodeOrCreate(mtIndex: string) {
    let value = await this.getNode(mtIndex);
    if (value === undefined) {
      value = MerkleTree.emptyNodeHash(mtIndex.length);
      await this.setNode(mtIndex, value);
    }
    return value;
  }

  private convertToMtIndex(index: number) {
    // toString() may get negative value
    let ret = "";
    for (let i = 0; i < MaxHeight; i++) {
      ret = ((index >> (i * 2)) & 3).toString() + ret;
    }
    return ret;
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
