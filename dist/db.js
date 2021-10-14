"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTreeDb = exports.default_snapshot_id = exports.local_uri = void 0;
var mongodb_1 = require("mongodb");
var field_1 = require("./field");
var bn_js_1 = require("bn.js");
exports.local_uri = "mongodb://localhost:27017/";
var merkle_tree_collection = "merkle_tree";
var logging_collection = "merkle_tree_logging";
var snapshot_id_collection = "merkle_tree_snapshot_id";
function normalize_to_string(arg) {
    var ret;
    switch (typeof arg) {
        case 'string':
            ret = arg;
            break;
        default:
            ret = arg.toString();
    }
    return ret;
}
function normalize_to_long(arg) {
    var ret;
    switch (typeof arg) {
        case 'string':
            ret = mongodb_1.Long.fromString(arg);
            break;
        default:
            ret = arg;
    }
    return ret;
}
// Default snapshot_id when MarkleTree.currentSnapshotIdx is undefined.
// We use -1 so that all valid snapshot id (>= 0) within logging db can
// restore it to initial value.
exports.default_snapshot_id = "0";
;
var MerkleTreeDb = /** @class */ (function () {
    function MerkleTreeDb(uri, db_name) {
        this.client = new mongodb_1.MongoClient(uri);
        this.db_name = db_name;
        this.connected = false;
    }
    MerkleTreeDb.prototype.getMongoClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.connected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        this.connected = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.client];
                }
            });
        });
    };
    MerkleTreeDb.prototype.closeMongoClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.close()];
                    case 1:
                        _a.sent();
                        this.connected = false;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    MerkleTreeDb.prototype.cb_on_db = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var client, database;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMongoClient()];
                    case 1:
                        client = _a.sent();
                        database = client.db(this.db_name);
                        return [4 /*yield*/, cb(database)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MerkleTreeDb.prototype.cb_on_db_tx = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var client, database, session;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMongoClient()];
                    case 1:
                        client = _a.sent();
                        database = client.db(this.db_name);
                        session = client.startSession();
                        return [4 /*yield*/, session.withTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, cb(database)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, session.endSession()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MerkleTreeDb.prototype.cb_on_collection = function (collection, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cb_on_db(function (database) { return __awaiter(_this, void 0, void 0, function () {
                            var coll;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        coll = database.collection(collection);
                                        return [4 /*yield*/, cb(coll)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MerkleTreeDb.prototype.findOne = function (query, collection) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cb_on_collection(collection, function (coll) { return coll.findOne(query); })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result === null ? undefined : result];
                }
            });
        });
    };
    /* update a doc, if not found then insert one */
    MerkleTreeDb.prototype.updateOne = function (query, doc, collection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cb_on_collection(collection, function (coll) { coll.replaceOne(query, doc, { upsert: true }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MerkleTreeDb.prototype.updateWithLogging = function (query, doc, logging) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cb_on_db_tx(function (database) { return __awaiter(_this, void 0, void 0, function () {
                            var live_collection, log_collection, query_old_log, old_logging;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        live_collection = database.collection(merkle_tree_collection);
                                        return [4 /*yield*/, live_collection.replaceOne(query, doc, { upsert: true })];
                                    case 1:
                                        _a.sent();
                                        log_collection = database.collection(logging_collection);
                                        query_old_log = {
                                            path: doc.path,
                                            snapshot: logging.snapshot
                                        };
                                        return [4 /*yield*/, log_collection.findOne(query_old_log)];
                                    case 2:
                                        old_logging = _a.sent();
                                        if (!(old_logging === null)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, log_collection.insertOne(logging)];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 6];
                                    case 4:
                                        logging.old_field = old_logging.old_field;
                                        logging.old_snapshot = old_logging.old_snapshot;
                                        return [4 /*yield*/, log_collection.replaceOne(old_logging, logging)];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Update merkly tree with logging
     */
    MerkleTreeDb.prototype.updatePathLogging = function (k, old_value, new_value, _old_ss, _ss) {
        var old_ss = normalize_to_string(_old_ss);
        var ss = normalize_to_string(_ss);
        var query = {
            path: k
        };
        var doc = {
            path: k,
            field: new_value.v.toString(16),
            snapshot: mongodb_1.Long.fromString(ss)
        };
        var log = {
            path: k,
            old_field: old_value.v.toString(16),
            field: new_value.v.toString(16),
            old_snapshot: mongodb_1.Long.fromString(old_ss),
            snapshot: mongodb_1.Long.fromString(ss)
        };
        return this.updateWithLogging(query, doc, log);
    };
    /*
     * query merkle tree node
     */
    MerkleTreeDb.prototype.queryMerkleTreeNodeFromPath = function (k) {
        return __awaiter(this, void 0, void 0, function () {
            var query, doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = {
                            path: k
                        };
                        return [4 /*yield*/, this.findOne(query, merkle_tree_collection)];
                    case 1:
                        doc = _a.sent();
                        return [2 /*return*/, doc === undefined ? undefined :
                                {
                                    path: k,
                                    field: new field_1.Field(new bn_js_1.BN(doc.field, 16)),
                                    snapshot: doc.snapshot
                                }];
                }
            });
        });
    };
    /*
     * Snapshot
     */
    MerkleTreeDb.prototype.updateLatestSnapshotId = function (_id) {
        var id = normalize_to_string(_id);
        var doc = {
            snapshot_id: mongodb_1.Long.fromString(id)
        };
        return this.updateOne({}, doc, snapshot_id_collection);
    };
    MerkleTreeDb.prototype.queryLatestSnapshotId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var node, id, id_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({}, snapshot_id_collection)];
                    case 1:
                        node = _a.sent();
                        id = node.snapshot_id;
                        if (node === undefined) {
                            return [2 /*return*/, exports.default_snapshot_id];
                        }
                        else {
                            id_1 = node.snapshot_id;
                            return [2 /*return*/, id_1.toString()];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MerkleTreeDb.prototype.restoreMerkleTree = function (_snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var snapshot;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snapshot = normalize_to_long(_snapshot);
                        return [4 /*yield*/, this.cb_on_db_tx(function (database) { return __awaiter(_this, void 0, void 0, function () {
                                var live_collection, log_collection, path_should_revert, _i, path_should_revert_1, _path, path, closest_log, live_node, rollback_doc;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            live_collection = database.collection(merkle_tree_collection);
                                            log_collection = database.collection(logging_collection);
                                            return [4 /*yield*/, log_collection.aggregate([
                                                    { $match: { snapshot: { $gt: snapshot } } },
                                                    { $group: { _id: "$path" } },
                                                ]).toArray()];
                                        case 1:
                                            path_should_revert = _a.sent();
                                            _i = 0, path_should_revert_1 = path_should_revert;
                                            _a.label = 2;
                                        case 2:
                                            if (!(_i < path_should_revert_1.length)) return [3 /*break*/, 7];
                                            _path = path_should_revert_1[_i];
                                            path = _path._id;
                                            return [4 /*yield*/, log_collection
                                                    .find({
                                                    snapshot: { $gt: snapshot },
                                                    path: path,
                                                })
                                                    .sort({ snapshot: 1 })
                                                    .limit(1)
                                                    .toArray()];
                                        case 3:
                                            closest_log = _a.sent();
                                            return [4 /*yield*/, live_collection.findOne({ path: path })];
                                        case 4:
                                            live_node = _a.sent();
                                            rollback_doc = {
                                                path: path,
                                                field: closest_log[0].old_field,
                                                snapshot: closest_log[0].old_snapshot,
                                            };
                                            return [4 /*yield*/, live_collection.replaceOne(live_node, rollback_doc)];
                                        case 5:
                                            _a.sent();
                                            _a.label = 6;
                                        case 6:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 7: return [4 /*yield*/, log_collection.deleteMany({ snapshot: { $gt: snapshot } })];
                                        case 8:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MerkleTreeDb;
}());
exports.MerkleTreeDb = MerkleTreeDb;
