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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkleTree = exports.BlockSize = exports.BlockShift = exports.MaxHeight = void 0;
var field_1 = require("./field");
var poseidon_1 = require("./poseidon");
var db_1 = require("./db");
var bn_js_1 = __importDefault(require("bn.js"));
var hash = poseidon_1.poseidon;
exports.MaxHeight = 16;
exports.BlockShift = 2;
exports.BlockSize = 1 << exports.BlockShift;
var MarkleTree = /** @class */ (function () {
    function MarkleTree() {
    }
    MarkleTree.emptyNodeHash = function (height) {
        if (this.emptyHashes.length === 0) {
            this.emptyHashes.push(new field_1.Field(0));
            for (var i = 0; i < exports.MaxHeight; i++) {
                var last = this.emptyHashes[i];
                this.emptyHashes.push(hash([last, last, last, last]));
            }
            this.emptyHashes = this.emptyHashes.reverse();
        }
        return this.emptyHashes[height];
    };
    MarkleTree.prototype.getRawNode = function (mtIndex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (mtIndex.startsWith("-")) {
                    throw new Error(mtIndex);
                }
                return [2 /*return*/, (0, db_1.queryPathOne)(mtIndex + "I")];
            });
        });
    };
    MarkleTree.prototype.getNode = function (mtIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRawNode(mtIndex)];
                    case 1:
                        node = _a.sent();
                        if (node === undefined) {
                            return [2 /*return*/, node];
                        }
                        else {
                            return [2 /*return*/, (new field_1.Field(new bn_js_1.default(node.field.v.words)))];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MarkleTree.prototype.setNode = function (mtIndex, value) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var oldDoc;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(MarkleTree.currentSnapshotIdx === undefined)) return [3 /*break*/, 1];
                        (0, db_1.updatePath)(mtIndex + "I", value);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getRawNode(mtIndex)];
                    case 2:
                        oldDoc = _c.sent();
                        (0, db_1.updatePathLogging)(mtIndex + "I", (_a = oldDoc === null || oldDoc === void 0 ? void 0 : oldDoc.field) !== null && _a !== void 0 ? _a : MarkleTree.emptyNodeHash(mtIndex.length), value, (_b = oldDoc === null || oldDoc === void 0 ? void 0 : oldDoc.snapshot) !== null && _b !== void 0 ? _b : db_1.default_snapshot_id, MarkleTree.currentSnapshotIdx);
                        _c.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MarkleTree.prototype.startSnapshot = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                MarkleTree.currentSnapshotIdx = id;
                return [2 /*return*/];
            });
        });
    };
    MarkleTree.prototype.endSnapshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, db_1.updateLatestSnapshotId)(MarkleTree.currentSnapshotIdx);
                MarkleTree.currentSnapshotIdx = undefined;
                return [2 /*return*/];
            });
        });
    };
    MarkleTree.prototype.lastestSnapshot = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, db_1.queryLatestSnapshotId)()];
            });
        });
    };
    MarkleTree.prototype.loadSnapshot = function (latest_snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, db_1.restoreMerklyTree)(latest_snapshot)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MarkleTree.prototype.getNodeOrDefault = function (mtIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNode(mtIndex)];
                    case 1:
                        value = _a.sent();
                        if (value === undefined) {
                            value = MarkleTree.emptyNodeHash(mtIndex.length);
                        }
                        return [2 /*return*/, value];
                }
            });
        });
    };
    MarkleTree.prototype.getNodeOrCreate = function (mtIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNode(mtIndex)];
                    case 1:
                        value = _a.sent();
                        if (!(value === undefined)) return [3 /*break*/, 3];
                        value = MarkleTree.emptyNodeHash(mtIndex.length);
                        return [4 /*yield*/, this.setNode(mtIndex, value)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, value];
                }
            });
        });
    };
    MarkleTree.prototype.convertToMtIndex = function (index) {
        // toString() may get negative value
        var ret = "";
        for (var i = 0; i < exports.MaxHeight; i++) {
            ret = ((index >> (i * 2)) & 3).toString() + ret;
        }
        return ret;
    };
    MarkleTree.prototype.fillPath = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var mtIndex, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mtIndex = this.convertToMtIndex(index);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < exports.MaxHeight)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getNodeOrCreate(mtIndex.slice(0, i))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MarkleTree.prototype.getPath = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var ret, mtIndex, _loop_1, i;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.getNodeOrDefault("")];
                    case 1:
                        ret = (_a.root = _b.sent(),
                            _a.index = index,
                            _a.pathDigests = [],
                            _a);
                        mtIndex = this.convertToMtIndex(index);
                        _loop_1 = function (i) {
                            var digests;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, Promise.all(
                                        // Used to generate [0, 1, ..., BlockSize]
                                        Array.from(Array(exports.BlockSize).keys()).map(function (v) {
                                            return _this.getNodeOrDefault(mtIndex.slice(0, i) + v);
                                        }))];
                                    case 1:
                                        digests = _c.sent();
                                        ret.pathDigests.push(digests);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < exports.MaxHeight)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(i)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, ret];
                }
            });
        });
    };
    MarkleTree.prototype.getLeave = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var mtIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mtIndex = this.convertToMtIndex(index);
                        return [4 /*yield*/, this.getNodeOrDefault(mtIndex)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MarkleTree.prototype.getChildren = function (mtIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(Array.from(Array(exports.BlockSize).keys()).map(function (v) {
                            return _this.getNodeOrDefault(mtIndex + v);
                        }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MarkleTree.prototype.getLeaves = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var mtIndex;
            return __generator(this, function (_a) {
                mtIndex = this.convertToMtIndex(index);
                return [2 /*return*/, this.getChildren(mtIndex.slice(0, exports.MaxHeight - 1))];
            });
        });
    };
    MarkleTree.prototype.updateHash = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var mtIndex, i, layer, layerIndex, children, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mtIndex = this.convertToMtIndex(index);
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < exports.MaxHeight)) return [3 /*break*/, 5];
                        layer = exports.MaxHeight - i - 1;
                        layerIndex = mtIndex.slice(0, layer);
                        return [4 /*yield*/, this.getChildren(layerIndex)];
                    case 2:
                        children = _a.sent();
                        value = hash(children);
                        return [4 /*yield*/, this.setNode(layerIndex, value)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MarkleTree.prototype.getRoot = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getNodeOrDefault("")];
            });
        });
    };
    MarkleTree.prototype.setLeave = function (index, value) {
        return __awaiter(this, void 0, void 0, function () {
            var mtIndex, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mtIndex = this.convertToMtIndex(index);
                        return [4 /*yield*/, this.fillPath(index)];
                    case 1:
                        path = _a.sent();
                        return [4 /*yield*/, this.setNode(mtIndex, value)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.updateHash(index)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, path];
                }
            });
        });
    };
    MarkleTree.prototype.setLeaves = function (index, values) {
        return __awaiter(this, void 0, void 0, function () {
            var mtIndex, path;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (values.length != exports.BlockSize) {
                            throw new Error("Invalid leaves length: " + values.length);
                        }
                        mtIndex = this.convertToMtIndex(index);
                        return [4 /*yield*/, this.fillPath(index)];
                    case 1:
                        path = _a.sent();
                        return [4 /*yield*/, Promise.all(
                            // Used to generate [0, 1, ..., BlockSize]
                            Array.from(Array(exports.BlockSize).keys()).map(function (v) {
                                return _this.setNode(mtIndex.slice(0, exports.MaxHeight - 1) + v, values[v]);
                            }))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.updateHash(index)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, path];
                }
            });
        });
    };
    MarkleTree.currentSnapshotIdx = undefined;
    MarkleTree.emptyHashes = [];
    return MarkleTree;
}());
exports.MarkleTree = MarkleTree;
