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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
// Default snapshot_id when MarkleTree.currentSnapshotIdx is undefined.
// We use -1 so that all valid snapshot id (>= 0) within logging db can
// restore it to initial value.
exports.default_snapshot_id = -1;
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
                            var live_collection, log_collection;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        live_collection = database.collection(merkle_tree_collection);
                                        return [4 /*yield*/, live_collection.replaceOne(query, doc, { upsert: true })];
                                    case 1:
                                        _a.sent();
                                        log_collection = database.collection(logging_collection);
                                        return [4 /*yield*/, log_collection.insertOne(logging)];
                                    case 2:
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
    /*
     * Update merkly tree with logging
     */
    MerkleTreeDb.prototype.updatePathLogging = function (k, old_value, new_value, old_ss, ss) {
        var query = {
            path: k
        };
        var doc = {
            path: k,
            field: new_value.v.toString(16),
            snapshot: ss
        };
        var log = {
            path: k,
            old_field: old_value.v.toString(16),
            field: new_value.v.toString(16),
            old_snapshot: old_ss,
            snapshot: ss
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
    MerkleTreeDb.prototype.updateLatestSnapshotId = function (id) {
        var doc = {
            snapshot_id: id
        };
        return this.updateOne({}, doc, snapshot_id_collection);
    };
    MerkleTreeDb.prototype.queryLatestSnapshotId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({}, snapshot_id_collection)];
                    case 1:
                        id = _a.sent();
                        if (id === undefined) {
                            return [2 /*return*/, exports.default_snapshot_id];
                        }
                        else {
                            return [2 /*return*/, id.snapshot_id];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MerkleTreeDb.prototype.restoreMerkleTree = function (snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cb_on_db_tx(function (database) { return __awaiter(_this, void 0, void 0, function () {
                            var live_collection, log_collection, _a, _b, doc, query, _c, _d, log, rollback_doc, e_1_1, e_2_1;
                            var e_2, _e, e_1, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        live_collection = database.collection(merkle_tree_collection);
                                        log_collection = database.collection(logging_collection);
                                        _g.label = 1;
                                    case 1:
                                        _g.trys.push([1, 20, 21, 26]);
                                        _a = __asyncValues(live_collection.find());
                                        _g.label = 2;
                                    case 2: return [4 /*yield*/, _a.next()];
                                    case 3:
                                        if (!(_b = _g.sent(), !_b.done)) return [3 /*break*/, 19];
                                        doc = _b.value;
                                        if (!(doc.snapshot > snapshot)) return [3 /*break*/, 18];
                                        query = {
                                            path: doc.path,
                                            snapshot: { $gt: snapshot },
                                        };
                                        _g.label = 4;
                                    case 4:
                                        _g.trys.push([4, 10, 11, 16]);
                                        _c = (e_1 = void 0, __asyncValues(log_collection
                                            .find(query)
                                            .sort({ snapshot: 1 })
                                            .limit(1)));
                                        _g.label = 5;
                                    case 5: return [4 /*yield*/, _c.next()];
                                    case 6:
                                        if (!(_d = _g.sent(), !_d.done)) return [3 /*break*/, 9];
                                        log = _d.value;
                                        rollback_doc = {
                                            path: doc.path,
                                            field: log.old_field,
                                            snapshot: log.old_snapshot,
                                        };
                                        return [4 /*yield*/, live_collection.replaceOne(doc, rollback_doc)];
                                    case 7:
                                        _g.sent();
                                        _g.label = 8;
                                    case 8: return [3 /*break*/, 5];
                                    case 9: return [3 /*break*/, 16];
                                    case 10:
                                        e_1_1 = _g.sent();
                                        e_1 = { error: e_1_1 };
                                        return [3 /*break*/, 16];
                                    case 11:
                                        _g.trys.push([11, , 14, 15]);
                                        if (!(_d && !_d.done && (_f = _c.return))) return [3 /*break*/, 13];
                                        return [4 /*yield*/, _f.call(_c)];
                                    case 12:
                                        _g.sent();
                                        _g.label = 13;
                                    case 13: return [3 /*break*/, 15];
                                    case 14:
                                        if (e_1) throw e_1.error;
                                        return [7 /*endfinally*/];
                                    case 15: return [7 /*endfinally*/];
                                    case 16: return [4 /*yield*/, log_collection.deleteMany(query)];
                                    case 17:
                                        _g.sent();
                                        _g.label = 18;
                                    case 18: return [3 /*break*/, 2];
                                    case 19: return [3 /*break*/, 26];
                                    case 20:
                                        e_2_1 = _g.sent();
                                        e_2 = { error: e_2_1 };
                                        return [3 /*break*/, 26];
                                    case 21:
                                        _g.trys.push([21, , 24, 25]);
                                        if (!(_b && !_b.done && (_e = _a.return))) return [3 /*break*/, 23];
                                        return [4 /*yield*/, _e.call(_a)];
                                    case 22:
                                        _g.sent();
                                        _g.label = 23;
                                    case 23: return [3 /*break*/, 25];
                                    case 24:
                                        if (e_2) throw e_2.error;
                                        return [7 /*endfinally*/];
                                    case 25: return [7 /*endfinally*/];
                                    case 26: return [2 /*return*/];
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
