import { Collection, MongoClient, Db } from 'mongodb';
import { Field } from "./field";
import { BN } from 'bn.js';

export const local_uri = "mongodb://localhost:27017/";
const merkle_tree_collection = "merkle_tree";
const logging_collection = "merkle_tree_logging";
const snapshot_id_collection = "merkle_tree_snapshot_id";

// Default snapshot_id when MarkleTree.currentSnapshotIdx is undefined.
// We use -1 so that all valid snapshot id (>= 0) within logging db can
// restore it to initial value.
export const default_snapshot_id = -1;

export interface PathDoc {
  path: string;
  field: string;
  snapshot: number;
}

export interface SnapshotLog {
  path: string,
  old_field: string,
  field: string,
  old_snapshot: number,
  snapshot: number
};

export class MerkleTreeDb {
  private readonly client: MongoClient;
  private readonly db_name: string;
  private connected: boolean;

  constructor(uri: string, db_name: string) {
    this.client = new MongoClient(uri);
    this.db_name = db_name;
    this.connected = false;
  }

  private async getMongoClient() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }

    return this.client;
  }

  async closeMongoClient() {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }

  private async cb_on_db(cb: any) {
    const client = await this.getMongoClient();
    const database = client.db(this.db_name);
    return await cb(database);
  }

  private async cb_on_db_tx(cb: any) {
    const client = await this.getMongoClient();
    const database = client.db(this.db_name);
    const session = client.startSession();
    await session.withTransaction(async () => {
      await cb(database);
    })
    await session.endSession();
  }

  private async cb_on_collection(collection: string, cb: any) {
    return await this.cb_on_db(async (database: Db) => {
      const coll = database.collection(collection);
      return await cb(coll)
    })
  }

  private async findOne(query: any, collection: string) {
    const result = await this.cb_on_collection(collection, (coll: Collection<Document>) => { return coll.findOne(query) });
    return result === null ? undefined : result;
  }

  /* update a doc, if not found then insert one */
  private async updateOne(query: any, doc: any, collection: string) {
    await this.cb_on_collection(collection, (coll: Collection<Document>) => { coll.replaceOne(query, doc, { upsert: true }) })
  }

  private async updateWithLogging(query: any, doc: PathDoc, logging: SnapshotLog) {
    await this.cb_on_db_tx(async (database: Db) => {
      const live_collection = database.collection(merkle_tree_collection);
      await live_collection.replaceOne(query, doc, { upsert: true });
      const log_collection = database.collection(logging_collection);
      await log_collection.insertOne(logging);
    });
  }

  /*
   * Update merkly tree with logging
   */
  updatePathLogging(k: string, old_value: Field, new_value: Field, old_ss: number, ss: number) {
    const query = {
      path: k
    };

    const doc: PathDoc = {
      path: k,
      field: new_value.v.toString(16),
      snapshot: ss
    };

    const log: SnapshotLog = {
      path: k,
      old_field: old_value.v.toString(16),
      field: new_value.v.toString(16),
      old_snapshot: old_ss,
      snapshot: ss
    };

    return this.updateWithLogging(query, doc, log)
  }

  /*
   * query merkle tree node
   */
  async queryMerkleTreeNodeFromPath(k: string) {
    const query = {
      path: k
    };

    const doc = await this.findOne(query, merkle_tree_collection);
    return doc === undefined ? undefined :
      {
        path: k,
        field: new Field(new BN(doc.field, 16)),
        snapshot: doc.snapshot
      };
  }

  /*
   * Snapshot
   */
  updateLatestSnapshotId(id: number) {
    const doc = {
      snapshot_id: id
    };

    return this.updateOne({}, doc, snapshot_id_collection)
  }

  async queryLatestSnapshotId() {
    let id = await this.findOne({}, snapshot_id_collection);
    if (id === undefined) {
      return default_snapshot_id
    } else {
      return id.snapshot_id
    }
  }

  async restoreMerkleTree(snapshot: number) {
    await this.cb_on_db_tx(async (database: Db) => {
      const live_collection = database.collection(merkle_tree_collection);
      const log_collection = database.collection(logging_collection);

      for await (const doc of live_collection.find()) {
        if (doc.snapshot > snapshot) {
          let query = {
            path: doc.path,
            snapshot: { $gt: snapshot },
          };

          // get the most closed snapshot and overwrite with its old_field
          for await (const log of log_collection
            .find(query)
            .sort({ snapshot: 1 })
            .limit(1)) {
            const rollback_doc = {
              path: doc.path,
              field: log.old_field,
              snapshot: log.old_snapshot,
            };
            await live_collection.replaceOne(doc, rollback_doc)
          }

          await log_collection.deleteMany(query);
        }
      }
    });
  }
}