"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.L2Storage = exports.PoolStoreIndex = exports.StoreNameSpace = exports.Command = void 0;
var field_1 = require("../field");
var markle_tree_1 = require("../markle-tree");
var Command = /** @class */ (function () {
    function Command(args) {
        this.args = args.concat(new Array(8).map(function (_) { return new field_1.Field(0); })).slice(0, 8);
    }
    Command.prototype.run = function (storage) {
        throw new Error('Not Implemented yet');
    };
    return Command;
}());
exports.Command = Command;
var StoreNameSpace;
(function (StoreNameSpace) {
    StoreNameSpace[StoreNameSpace["BalanceStore"] = 0] = "BalanceStore";
    StoreNameSpace[StoreNameSpace["PoolStore"] = 1] = "PoolStore";
    StoreNameSpace[StoreNameSpace["ShareStore"] = 2] = "ShareStore";
})(StoreNameSpace = exports.StoreNameSpace || (exports.StoreNameSpace = {}));
var PoolStoreIndex = /** @class */ (function () {
    function PoolStoreIndex(poolIndex) {
        if (poolIndex < 0 || poolIndex >= 1024) {
            throw new Error("Bad pool index: " + poolIndex);
        }
        this.poolIndex = poolIndex;
    }
    Object.defineProperty(PoolStoreIndex.prototype, "index", {
        get: function () {
            return (StoreNameSpace.PoolStore << 30) | (this.poolIndex << 20);
        },
        enumerable: false,
        configurable: true
    });
    return PoolStoreIndex;
}());
exports.PoolStoreIndex = PoolStoreIndex;
var L2Storage = /** @class */ (function (_super) {
    __extends(L2Storage, _super);
    function L2Storage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    L2Storage.prototype.getPoolToken0Info = function (index) {
        return this.get(index + 0);
    };
    L2Storage.prototype.getPoolToken1Info = function (index) {
        return this.get(index + 1);
    };
    L2Storage.prototype.getPoolToken0Amount = function (index) {
        return this.get(index + 2);
    };
    L2Storage.prototype.getPoolToken1Amount = function (index) {
        return this.get(index + 3);
    };
    return L2Storage;
}(markle_tree_1.MarkleTree));
exports.L2Storage = L2Storage;
