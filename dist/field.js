"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var Field = /** @class */ (function () {
    function Field(v) {
        if (!(v instanceof bn_js_1.default)) {
            v = new bn_js_1.default(v);
        }
        this.v = v.umod(this.modulus);
    }
    Object.defineProperty(Field.prototype, "modulus", {
        get: function () {
            return new bn_js_1.default("21888242871839275222246405745257275088548364400416034343698204186575808495617", 10);
        },
        enumerable: false,
        configurable: true
    });
    Field.prototype.add = function (f) {
        return new Field(this.v.add(f.v));
    };
    Field.prototype.mul = function (f) {
        return new Field(this.v.mul(f.v));
    };
    Field.prototype.sub = function (f) {
        return new Field(this.v.sub(f.v));
    };
    Field.prototype.neg = function () {
        return new Field(this.v.neg());
    };
    Field.prototype.div = function (f) {
        return new Field(this.v.mul(f.inv().v));
    };
    //see, https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Polynomial_extended_Euclidean_algorithm
    Field.prototype.inv = function () {
        if (this.v.eqn(0)) {
            return this;
        }
        var newt = new bn_js_1.default(1);
        var t = new bn_js_1.default(0);
        var newr = this.v;
        var r = this.modulus;
        var op = function (x, newx, q) {
            return [newx, x.sub(q.mul(newx))];
        };
        while (!newr.eqn(0)) {
            var q = r.div(newr);
            var t_newt = op(t, newt, q);
            t = t_newt[0];
            newt = t_newt[1];
            var r_newr = op(r, newr, q);
            r = r_newr[0];
            newr = r_newr[1];
        }
        return new Field(t);
    };
    return Field;
}());
exports.Field = Field;
