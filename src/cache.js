"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
var Cache = /** @class */ (function () {
    function Cache(cap) {
        this.capability = cap;
        this.data = new Map();
        this.count = 0;
        this.queue = [];
    }
    ;
    Cache.prototype.flush = function () {
        this.data.clear();
        this.count == 0;
        this.queue = [];
    };
    Cache.prototype.try_shrink = function () {
        if (this.count == this.capability) {
            var k = this.queue.shift();
            this.data.delete(k);
            this.count--;
        }
    };
    Cache.prototype.add = function (k, v) {
        console.log(this.data);
        if (!this.data.has(k)) {
            this.count++;
            this.queue.push(k);
            this.try_shrink();
        }
        this.data.set(k, v);
    };
    Cache.prototype.find = function (k) {
        return this.data.get(k);
    };
    return Cache;
}());
exports.Cache = Cache;
