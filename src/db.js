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
exports.restoreMerklyTree = exports.queryLatestSnapshotId = exports.queryPathOne = exports.updateLatestSnapshotId = exports.updatePathLogging = exports.updatePath = exports.closeMongoClient = exports.default_snapshot_id = void 0;
var mongodb_1 = require("mongodb");
var uri = "mongodb://localhost:27017/";
var db_name = "delphinus";
var merkle_tree_collection = "merkle_tree";
var logging_collection = "merkle_tree_logging";
var snapshot_id_collection = "merkle_tree_snapshot_id";
// Default snapshot_id when MarkleTree.currentSnapshotIdx is undefined.
// We use -1 so that all valid snapshot id (>= 0) within logging db can
// restore it to initial value.
exports.default_snapshot_id = -1;
;
var _client;
function getMongoClient() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!_client) return [3 /*break*/, 2];
                    _client = new mongodb_1.MongoClient(uri);
                    return [4 /*yield*/, _client.connect()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, _client];
            }
        });
    });
}
function closeMongoClient() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_client) return [3 /*break*/, 2];
                    return [4 /*yield*/, _client.close()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.closeMongoClient = closeMongoClient;
function findOne(query, collection) {
    return __awaiter(this, void 0, void 0, function () {
        var client, database, coll, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMongoClient()];
                case 1:
                    client = _a.sent();
                    database = client.db(db_name);
                    coll = database.collection(collection);
                    return [4 /*yield*/, coll.findOne(query)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function updateOne(query, doc, collection) {
    return __awaiter(this, void 0, void 0, function () {
        var client, database, coll;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMongoClient()];
                case 1:
                    client = _a.sent();
                    database = client.db(db_name);
                    coll = database.collection(collection);
                    return [4 /*yield*/, coll.replaceOne(query, doc, { upsert: true })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function updateWithLogging(query, doc, logging) {
    return __awaiter(this, void 0, void 0, function () {
        var client, database, session, live_collection, log_collection, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMongoClient()];
                case 1:
                    client = _a.sent();
                    database = client.db(db_name);
                    session = client.startSession();
                    session.startTransaction();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, 8, 10]);
                    live_collection = database.collection(merkle_tree_collection);
                    return [4 /*yield*/, live_collection.replaceOne(query, doc, { upsert: true })];
                case 3:
                    _a.sent();
                    log_collection = database.collection(logging_collection);
                    return [4 /*yield*/, log_collection.insertOne(logging)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, session.commitTransaction()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 6:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [4 /*yield*/, session.abortTransaction()];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, session.endSession()];
                case 9:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function updatePath(k, new_value) {
    var query = {
        path: k
    };
    var doc = {
        path: k,
        field: new_value.v.toString(16),
        snapshot: exports.default_snapshot_id,
    };
    return updateOne(query, doc, merkle_tree_collection);
}
exports.updatePath = updatePath;
function updatePathLogging(k, old_value, new_value, old_ss, ss) {
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
    return updateWithLogging(query, doc, log);
}
exports.updatePathLogging = updatePathLogging;
function updateLatestSnapshotId(id) {
    var doc = {
        snapshot_id: id
    };
    return updateOne({}, doc, snapshot_id_collection);
}
exports.updateLatestSnapshotId = updateLatestSnapshotId;
function queryPathOne(k) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            query = {
                path: k
            };
            return [2 /*return*/, findOne(query, merkle_tree_collection)];
        });
    });
}
exports.queryPathOne = queryPathOne;
function queryLatestSnapshotId() {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findOne({}, snapshot_id_collection)];
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
}
exports.queryLatestSnapshotId = queryLatestSnapshotId;
function restoreMerklyTree(snapshot) {
    var e_1, _a, e_2, _b;
    return __awaiter(this, void 0, void 0, function () {
        var client, database, session, live_collection, log_collection, _c, _d, doc, query, _e, _f, log, rollback_doc, e_2_1, e_1_1, error_2;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, getMongoClient()];
                case 1:
                    client = _g.sent();
                    database = client.db(db_name);
                    session = client.startSession();
                    session.startTransaction();
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 28, 30, 32]);
                    live_collection = database.collection(merkle_tree_collection);
                    log_collection = database.collection(logging_collection);
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 20, 21, 26]);
                    _c = __asyncValues(live_collection.find());
                    _g.label = 4;
                case 4: return [4 /*yield*/, _c.next()];
                case 5:
                    if (!(_d = _g.sent(), !_d.done)) return [3 /*break*/, 19];
                    doc = _d.value;
                    if (!(doc.snapshot > snapshot)) return [3 /*break*/, 18];
                    query = {
                        path: doc.path,
                        snapshot: { $gt: snapshot },
                    };
                    _g.label = 6;
                case 6:
                    _g.trys.push([6, 12, 13, 18]);
                    _e = (e_2 = void 0, __asyncValues(log_collection
                        .find(query)
                        .sort({ snapshot: 1 })
                        .limit(1)));
                    _g.label = 7;
                case 7: return [4 /*yield*/, _e.next()];
                case 8:
                    if (!(_f = _g.sent(), !_f.done)) return [3 /*break*/, 11];
                    log = _f.value;
                    rollback_doc = {
                        path: doc.path,
                        field: log.old_field,
                        snapshot: log.old_snapshot,
                    };
                    return [4 /*yield*/, live_collection.replaceOne(doc, rollback_doc)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 7];
                case 11: return [3 /*break*/, 18];
                case 12:
                    e_2_1 = _g.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 18];
                case 13:
                    _g.trys.push([13, , 16, 17]);
                    if (!(_f && !_f.done && (_b = _e.return))) return [3 /*break*/, 15];
                    return [4 /*yield*/, _b.call(_e)];
                case 14:
                    _g.sent();
                    _g.label = 15;
                case 15: return [3 /*break*/, 17];
                case 16:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 17: return [7 /*endfinally*/];
                case 18: return [3 /*break*/, 4];
                case 19: return [3 /*break*/, 26];
                case 20:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 26];
                case 21:
                    _g.trys.push([21, , 24, 25]);
                    if (!(_d && !_d.done && (_a = _c.return))) return [3 /*break*/, 23];
                    return [4 /*yield*/, _a.call(_c)];
                case 22:
                    _g.sent();
                    _g.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 25: return [7 /*endfinally*/];
                case 26:
                    ;
                    return [4 /*yield*/, session.commitTransaction()];
                case 27:
                    _g.sent();
                    return [3 /*break*/, 32];
                case 28:
                    error_2 = _g.sent();
                    return [4 /*yield*/, session.abortTransaction()];
                case 29:
                    _g.sent();
                    return [3 /*break*/, 32];
                case 30: return [4 /*yield*/, session.endSession()];
                case 31:
                    _g.sent();
                    return [7 /*endfinally*/];
                case 32: return [2 /*return*/];
            }
        });
    });
}
exports.restoreMerklyTree = restoreMerklyTree;
