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
var field_1 = require("../field");
var markle_tree_large_1 = require("../markle-tree-large");
var assert = require('assert');
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var merkle_tree;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    merkle_tree = new markle_tree_large_1.MarkleTree();
                    return [4 /*yield*/, merkle_tree.loadSnapshot("0")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.startSnapshot("1")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0001", new field_1.Field(1))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0002", new field_1.Field(2))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0003", new field_1.Field(3))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.getNode("0001").then(function (node) {
                            assert.ok(node.v.eq(new field_1.Field(1).v));
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.startSnapshot("2")];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0001", new field_1.Field(19))];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.endSnapshot()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.lastestSnapshot().then(function (node) {
                            assert.equal(node, "2");
                        })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.getNode("0001").then(function (node) {
                            assert.ok(node.v.eq(new field_1.Field(19).v));
                        })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.loadSnapshot("1")];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.getNode("0001").then(function (node) {
                            assert.ok(node.v.eq(new field_1.Field(1).v));
                        })];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.loadSnapshot("0")];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.getNode("0001").then(function (node) {
                            assert.ok(node.v.eq(markle_tree_large_1.MarkleTree.emptyNodeHash(4).v));
                        })];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.startSnapshot("1")];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0001", new field_1.Field(1))];
                case 17:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0001", new field_1.Field(2))];
                case 18:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.setNode("0001", new field_1.Field(3))];
                case 19:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.endSnapshot()];
                case 20:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.loadSnapshot("0")];
                case 21:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.getNode("0001").then(function (node) {
                            assert.ok(node.v.eq(markle_tree_large_1.MarkleTree.emptyNodeHash(4).v));
                        })];
                case 22:
                    _a.sent();
                    return [4 /*yield*/, merkle_tree.closeDb()];
                case 23:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main().then(function () { return console.log("done"); });
