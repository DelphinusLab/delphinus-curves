import { MongoClient, MongoDBNamespace } from 'mongodb';
import { Field } from "./field";

const uri ="mongodb://localhost:27017/";
const db_name = "delphinus";
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

let _client: MongoClient;

async function getMongoClient() {
  if (!_client) {
    _client = new MongoClient(uri);
    await _client.connect();
  }
  return _client;
}

export async function closeMongoClient() {
  if (_client) {
    await _client.close();
  }
}

async function findOne(query: any, collection: string): Promise<any | undefined> {
  const client = await getMongoClient();
  const database = client.db(db_name)
  const coll = database.collection(collection);
  const result = await coll.findOne(query);
  return result
}

async function updateOne(query: any, doc: any, collection: string) {
  const client = await getMongoClient();
  const database = client.db(db_name)
  const coll = database.collection(collection);
  await coll.replaceOne(query, doc, { upsert: true });
}

async function updateWithLogging(query: any, doc: PathDoc, logging: SnapshotLog) {
  const client = await getMongoClient();
  const database = client.db(db_name)

  const session = client.startSession();
  session.startTransaction();

  try {
    const live_collection = database.collection(merkle_tree_collection);
    await live_collection.replaceOne(query, doc, { upsert: true });
    const log_collection = database.collection(logging_collection);
    await log_collection.insertOne(logging);

    await session.commitTransaction();
  } catch(error) {
    console.log(error);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
}

export function updatePath(k: string, new_value: Field) {
  const query = {
    path: k
  };

  const doc = {
    path: k,
    field: new_value.v.toString(16),
    snapshot: default_snapshot_id,
  };

  return updateOne(query, doc, merkle_tree_collection)
}

export function updatePathLogging(k: string, old_value: Field, new_value: Field, old_ss:number, ss: number) {
  const query = {
    path: k
  };

  const doc = {
    path: k,
    field: new_value.v.toString(16),
    snapshot: ss
  };

  const log = {
    path: k,
    old_field: old_value.v.toString(16),
    field: new_value.v.toString(16),
    old_snapshot: old_ss,
    snapshot: ss
  };

  return updateWithLogging(query, doc, log)
}

export function updateLatestSnapshotId(id: number) {
  const doc = {
    snapshot_id: id
  };

  return updateOne({}, doc, snapshot_id_collection)
}

export async function queryPathOne(k: string) {
  const query = {
    path: k
  };

  return findOne(query, merkle_tree_collection)
}

export async function queryLatestSnapshotId() {
  let id = await findOne({}, snapshot_id_collection);
  if (id === undefined) {
    return default_snapshot_id
  } else {
    return id.snapshot_id
  }

}

export async function restoreMerklyTree(snapshot: number) {
  const client = await getMongoClient();
  const database = client.db(db_name)

  const session = client.startSession();
  session.startTransaction();

  try {
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
          .sort({snapshot: 1})
          .limit(1)) {
          const rollback_doc = {
            path: doc.path,
            field: log.old_field,
            snapshot: log.old_snapshot,
          };
          await live_collection.replaceOne(doc, rollback_doc)
        }

        //await log_collection.deleteMany(query);
      }
    };

    await session.commitTransaction();
  } catch(error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
}