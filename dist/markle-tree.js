"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkleTree = exports.MaxHeight = void 0;
var field_1 = require("./field");
var poseidon_1 = require("./poseidon");
var hash = poseidon_1.poseidon;
exports.MaxHeight = 16;
var MarkleTree = /** @class */ (function () {
    function MarkleTree() {
        this.root = MarkleTree.emptyNode(exports.MaxHeight);
    }
    MarkleTree.emptyNodeHash = function (height) {
        if (this.emptyHashes.length === 0) {
            this.emptyHashes.push(new field_1.Field(0));
            for (var i = 0; i < exports.MaxHeight; i++) {
                var last = this.emptyHashes[i];
                this.emptyHashes.push(hash([last, last, last, last]));
            }
        }
        return this.emptyHashes[height];
    };
    MarkleTree.emptyNode = function (height) {
        return {
            value: this.emptyNodeHash(height),
            children: height === 0 ? [] : [undefined, undefined, undefined, undefined]
        };
    };
    MarkleTree.prototype.getPath = function (index) {
        var _a;
        var ret = {
            root: this.root.value,
            index: index,
            pathDigests: []
        };
        var curr = this.root;
        var _loop_1 = function (level) {
            ret.pathDigests.push(curr.children.map(function (n) { var _a; return (_a = n === null || n === void 0 ? void 0 : n.value) !== null && _a !== void 0 ? _a : MarkleTree.emptyNodeHash(level - 1); }));
            var offset = (index >> ((level - 1) * 2)) & 3;
            curr = (_a = curr.children[offset]) !== null && _a !== void 0 ? _a : MarkleTree.emptyNode(level);
        };
        for (var level = exports.MaxHeight; level >= 1; level--) {
            _loop_1(level);
        }
        return ret;
    };
    MarkleTree.prototype._fillPath = function (index) {
        var _a;
        var path = [];
        var curr = this.root;
        path.push(curr);
        for (var level = exports.MaxHeight - 1; level >= 0; level--) {
            var offset = (index >> (level * 2)) & 3;
            var next = (_a = curr.children[offset]) !== null && _a !== void 0 ? _a : MarkleTree.emptyNode(level);
            curr.children[offset] = next;
            curr = next;
            path.push(curr);
        }
        return path;
    };
    MarkleTree.prototype.getLeave = function (index) {
        var _a, _b;
        var path = this._fillPath(index);
        return (_b = (_a = path[path.length - 1]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : new field_1.Field(0);
    };
    MarkleTree.prototype.getLeaves = function (index) {
        var _a;
        var path = this._fillPath(index);
        path.pop();
        return (_a = path[path.length - 1]) === null || _a === void 0 ? void 0 : _a.children.map(function (child) { var _a; return (_a = child === null || child === void 0 ? void 0 : child.value) !== null && _a !== void 0 ? _a : new field_1.Field(0); });
    };
    MarkleTree.prototype._updateHash = function (path) {
        var _loop_2 = function (level) {
            var _curr = path.pop();
            var _childrenValues = _curr.children.map(function (n) { var _a; return (_a = n === null || n === void 0 ? void 0 : n.value) !== null && _a !== void 0 ? _a : MarkleTree.emptyNodeHash(level - 1); });
            _curr.value = hash(_childrenValues);
        };
        for (var level = 1; level <= exports.MaxHeight; level++) {
            _loop_2(level);
        }
    };
    MarkleTree.prototype.setLeave = function (index, value) {
        var path = this._fillPath(index);
        var leaf = path.pop();
        leaf.value = value;
        //console.log('set value ' + value.v.toString(10));
        this._updateHash(path);
        //console.log('root hash is ' + this.root.value.v.toString(10));
    };
    MarkleTree.prototype.setLeaves = function (index, values) {
        if (values.length != 4) {
            throw new Error("Invalid leaves length: " + values.length);
        }
        var path = this._fillPath(index);
        var _leaf = path.pop();
        //console.log('set values ' + values.map(value => value.v.toString(10)).join(" "));
        path[path.length - 1].children = values.map(function (value) { return ({ value: value, children: [] }); });
        this._updateHash(path);
        //console.log('root hash is ' + this.root.value.v.toString(10));
    };
    MarkleTree.prototype.getRoot = function () {
        return this.root.value;
    };
    MarkleTree.emptyHashes = [];
    return MarkleTree;
}());
exports.MarkleTree = MarkleTree;
