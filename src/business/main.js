"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genZKPInput = exports.createCommand = void 0;
var field_1 = require("../field");
var markle_tree_1 = require("../markle-tree");
var addpool_1 = require("./addpool");
var ZKPInputBuilder = /** @class */ (function () {
    function ZKPInputBuilder() {
        this.inputs = [];
    }
    ZKPInputBuilder.prototype.push = function (data) {
        if (data instanceof field_1.Field) {
            this.inputs.push(data);
        }
        else {
            this.inputs = this.inputs.concat(data);
        }
    };
    ZKPInputBuilder.prototype._pushPathInfo = function (pathInfo) {
        for (var i = 0; i < 32; i++) {
            this.push(new field_1.Field((pathInfo.index >> (31 - i)) & 1));
        }
        for (var i = 0; i < markle_tree_1.MaxHeight; i++) {
            this.push(pathInfo.pathDigests[i].slice(0, 4));
        }
    };
    ZKPInputBuilder.prototype.pushPathInfo = function (pathInfoList) {
        for (var _i = 0, pathInfoList_1 = pathInfoList; _i < pathInfoList_1.length; _i++) {
            var pathInfo = pathInfoList_1[_i];
            this._pushPathInfo(pathInfo);
        }
        for (var i = 0; i < 5 - pathInfoList.length; i++) {
            this._pushEmptyPathInfo();
        }
    };
    ZKPInputBuilder.prototype._pushEmptyPathInfo = function () {
        for (var i = 0; i < 32; i++) {
            this.push(new field_1.Field(0));
        }
        for (var i = 0; i < markle_tree_1.MaxHeight; i++) {
            this.push(new Array(4).map(function (_) { return new field_1.Field(0); }));
        }
    };
    ZKPInputBuilder.prototype.pushCommand = function (op, command) {
        this.push(op);
        this.push(command.args);
    };
    ZKPInputBuilder.prototype.pushRootHash = function (storage) {
        this.push(storage.root.value);
    };
    return ZKPInputBuilder;
}());
function createCommand(op, args) {
    if (op.v.eqn(5)) {
        return new addpool_1.AddPoolCommand(args);
    }
    throw new Error('Not implemented yet');
}
exports.createCommand = createCommand;
function genZKPInput(op, args, storage) {
    var builder = new ZKPInputBuilder();
    var command = createCommand(op, args);
    builder.pushCommand(op, command);
    builder.pushRootHash(storage);
    var pathInfo = command.run(storage);
    builder.pushPathInfo(pathInfo);
    return builder.inputs;
}
exports.genZKPInput = genZKPInput;
