import { Collection, Document, MongoClient, Db, Long, Filter } from "mongodb";
import { Field } from "./field.js";
import { BN } from "bn.js";

export const local_uri = "mongodb://localhost:27017/";
export const merkle_tree_collection = "merkle_tree";
export const logging_collection = "merkle_tree_logging";
export const snapshot_id_collection = "merkle_tree_snapshot_id";
export const all_collections = [
  merkle_tree_collection,
  logging_collection,
  snapshot_id_collection
]

function normalize_to_string(arg: string | Long): string {
  return arg.toString();
}

function normalize_to_long(arg: string | Long): Long {
  return typeof arg === "string" ? Long.fromString(arg) : arg;
}

// Default snapshot_id when MerkleTree.currentSnapshotIdx is undefined.
// We use 0 so that all valid snapshot id (>= 0) within logging db can
// restore it to initial value.
export const default_snapshot_id = "0";

export interface PathDoc {
  path: string;
  field: string;
  snapshot: Long;
}

export interface SnapshotLog {
  path: string;
  old_field: string;
  field: string;
  old_snapshot: Long;
  snapshot: Long;
}

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

  async cb_on_db<T>(cb: (database: Db) => T | Promise<T>) {
    const client = await this.getMongoClient();
    const database = client.db(this.db_name);
    return await cb(database);
  }

  private async cb_on_db_tx<T>(cb: (database: Db) => T | Promise<T>) {
    const client = await this.getMongoClient();
    const database = client.db(this.db_name);
    return await client.withSession(
      async (session) =>
        await session.withTransaction(async () => await cb(database))
    );
  }

  private async cb_on_collection<T>(
    collection: string,
    cb: (coll: Collection<Document>) => T | Promise<T>
  ) {
    return await this.cb_on_db(async (database) => {
      const coll = database.collection(collection);
      return await cb(coll);
    });
  }

  private async findOne<TSchema extends Document>(filter: Filter<Document>, collection: string) {
    const result = await this.cb_on_collection(collection, async (coll) => {
      return await coll.findOne<TSchema>(filter);
    });
    return result === null ? undefined : result;
  }

  /* update a doc, if not found then insert one */
  private async updateOne(
    filter: Filter<Document>,
    doc: Document,
    collection: string
  ) {
    return await this.cb_on_collection(collection, async (coll) => {
      return await coll.replaceOne(filter, doc, { upsert: true });
    });
  }

  private async updateWithLogging(
    filter: Filter<Document>,
    doc: PathDoc,
    logging: SnapshotLog
  ) {
    const query_old_log = {
      path: doc.path,
      snapshot: logging.snapshot,
    };

    await this.cb_on_db_tx(async (database) => {
      const live_collection = database.collection(merkle_tree_collection);
      await live_collection.replaceOne(filter, doc, { upsert: true });

      const log_collection = database.collection(logging_collection);
      const old_logging = await log_collection.findOne(query_old_log);

      if (old_logging === null) {
        await log_collection.insertOne(logging);
      } else {
        logging.old_field = old_logging.old_field;
        logging.old_snapshot = old_logging.old_snapshot;
        await log_collection.replaceOne(old_logging, logging);
      }
    });
  }

  /*
   * Update merkly tree with logging
   */
  updatePathLogging(
    k: string,
    old_value: Field,
    new_value: Field,
    _old_ss: string | Long,
    _ss: string | Long
  ) {
    const old_ss = normalize_to_string(_old_ss);
    const ss = normalize_to_string(_ss);

    const query = {
      path: k,
    };

    const doc: PathDoc = {
      path: k,
      field: new_value.v.toString(16),
      snapshot: normalize_to_long(ss),
    };

    const log: SnapshotLog = {
      path: k,
      old_field: old_value.v.toString(16),
      field: new_value.v.toString(16),
      old_snapshot: normalize_to_long(old_ss),
      snapshot: normalize_to_long(ss),
    };

    return this.updateWithLogging(query, doc, log);
  }

  /*
   * query merkle tree node
   */
  async queryMerkleTreeNodeFromPath(k: string) {
    const query = {
      path: k,
    };

    const doc = await this.findOne(query, merkle_tree_collection);
    return (
      doc && {
        path: k,
        field: new Field(new BN(doc.field, 16)),
        snapshot: doc.snapshot,
      }
    );
  }

  /*
   * Snapshot
   */
  updateLatestSnapshotId(_id: string | Long) {
    const doc = {
      snapshot_id: normalize_to_long(_id),
    };

    return this.updateOne({}, doc, snapshot_id_collection);
  }

  async queryLatestSnapshotId() {
    let node = await this.findOne({}, snapshot_id_collection);
    return node === undefined
      ? default_snapshot_id
      : node.snapshot_id.toString();
  }

  async restoreMerkleTree(_snapshot: string | Long) {
    const snapshot = normalize_to_long(_snapshot);

    await this.cb_on_db_tx(async (database: Db) => {
      const live_collection = database.collection(merkle_tree_collection);
      const log_collection = database.collection(logging_collection);

      const path_should_revert = await log_collection
        .aggregate([
          { $match: { snapshot: { $gt: snapshot } } },
          { $sort: { snapshot: 1 } },
          { $group: { _id: "$path", firstLog: { $first: "$$ROOT" } } },
        ])
        .toArray();

      for (const path of path_should_revert) {
        const log = path.firstLog;
        let live_node = await live_collection.findOne({ path: log.path });

        let rollback_doc = {
          path: log.path,
          field: log.old_field,
          snapshot: log.old_snapshot,
        };

        await live_collection.replaceOne(live_node!, rollback_doc);
      }

      await log_collection.deleteMany({ snapshot: { $gt: snapshot } });
    });
  }
}
