"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkleTree = void 0;
var field_1 = require("./field");
var poseidon_1 = require("./poseidon");
var hash = poseidon_1.poseidon;
var MaxHeight = 16;
var MarkleTree = /** @class */ (function () {
    function MarkleTree() {
    }
    MarkleTree.emptyNodeHash = function (height) {
        if (this.emptyHashes.length === 0) {
            this.emptyHashes.push(new field_1.Field(0));
            for (var i = 0; i < MaxHeight; i++) {
                var last = this.emptyHashes[0];
                this.emptyHashes.push(hash([last, last, last, last]));
            }
        }
        return this.emptyHashes[height];
    };
    MarkleTree.emptyNode = function (height) {
        return {
            value: this.emptyNodeHash(height),
            children: [undefined, undefined, undefined, undefined]
        };
    };
    MarkleTree.prototype.getPath = function (index) {
        var ret = {
            index: index,
            pathDigests: []
        };
        var curr = this.root;
        var _loop_1 = function (i) {
            var level = MaxHeight - i;
            curr = curr !== null && curr !== void 0 ? curr : MarkleTree.emptyNode(level + 1);
            ret.pathDigests.push(curr.children.map(function (n) { var _a; return (_a = n === null || n === void 0 ? void 0 : n.value) !== null && _a !== void 0 ? _a : MarkleTree.emptyNodeHash(level); }));
            var offset = (index >> (level * 2)) & 3;
            curr = curr.children[offset];
        };
        for (var i = 1; i <= MaxHeight; i++) {
            _loop_1(i);
        }
        return ret;
    };
    return MarkleTree;
}());
exports.MarkleTree = MarkleTree;
