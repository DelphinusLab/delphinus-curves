import { Collection, MongoClient, Db, Long } from 'mongodb';
import { Field } from "./field";
import { BN } from 'bn.js';

export const local_uri = "mongodb://localhost:27017/";
const merkle_tree_collection = "merkle_tree";
const logging_collection = "merkle_tree_logging";
const snapshot_id_collection = "merkle_tree_snapshot_id";

function normalize_to_string(arg: string | Long): string {
  var ret;

  switch (typeof arg) {
    case 'string':
      ret = arg;
      break;
    default:
      ret = arg.toString()
  }

  return ret;
}

function normalize_to_long(arg: string | Long): Long {
  var ret;

  switch (typeof arg) {
    case 'string':
      ret = Long.fromString(arg);
      break;
    default:
      ret = arg;
  }

  return ret;
}

// Default snapshot_id when MarkleTree.currentSnapshotIdx is undefined.
// We use -1 so that all valid snapshot id (>= 0) within logging db can
// restore it to initial value.
export const default_snapshot_id = "0";

export interface PathDoc {
  path: string;
  field: string;
  snapshot: Long;
}

export interface SnapshotLog {
  path: string,
  old_field: string,
  field: string,
  old_snapshot: Long,
  snapshot: Long
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
  updatePathLogging(k: string, old_value: Field, new_value: Field, _old_ss: string | Long, _ss: string | Long) {
    const old_ss = normalize_to_string(_old_ss);
    const ss = normalize_to_string(_ss);

    const query = {
      path: k
    };

    const doc: PathDoc = {
      path: k,
      field: new_value.v.toString(16),
      snapshot: Long.fromString(ss)
    };

    const log: SnapshotLog = {
      path: k,
      old_field: old_value.v.toString(16),
      field: new_value.v.toString(16),
      old_snapshot: Long.fromString(old_ss),
      snapshot: Long.fromString(ss)
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
  updateLatestSnapshotId(_id: string | Long) {
    const id = normalize_to_string(_id);

    const doc = {
      snapshot_id: Long.fromString(id)
    };

    return this.updateOne({}, doc, snapshot_id_collection)
  }

  async queryLatestSnapshotId(): Promise<string> {
    let node = await this.findOne({}, snapshot_id_collection);
    let id = node.snapshot_id;
    if (node === undefined) {
      return default_snapshot_id
    } else {
      let id: Long = node.snapshot_id;
      return id.toString()
    }
  }

  async restoreMerkleTree(_snapshot: string | Long) {
    const snapshot = normalize_to_long(_snapshot);

    await this.cb_on_db_tx(async (database: Db) => {
      const live_collection = database.collection(merkle_tree_collection);
      const log_collection = database.collection(logging_collection);
      const path_should_revert = await log_collection.aggregate(
        [
          { $match: { snapshot: { $gt: snapshot } } },
          { $group: { _id: "$path" } },
        ]
      ).toArray();

      for (const _path of path_should_revert) {
        const path = _path._id;
        let closest_log = await log_collection
          .find({
            snapshot: { $gt: snapshot },
            path: path,
          })
          .sort({ snapshot: 1 })
          .limit(1)
          .toArray();
        let live_node = await live_collection.findOne({ path: path });
        let rollback_doc = {
          path: path,
          field: closest_log[0].old_field,
          snapshot: closest_log[0].old_snapshot,
        };

        await live_collection.replaceOne(live_node!, rollback_doc);
      }

      await log_collection.deleteMany({ snapshot: { $gt: snapshot } });
    });
  }
}