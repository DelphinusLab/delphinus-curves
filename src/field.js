"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
class Field {
    constructor(v) {
        if (!(v instanceof bn_js_1.default)) {
            v = new bn_js_1.default(v);
        }
        this.v = v.umod(this.modulus);
    }
    get modulus() {
        return new bn_js_1.default("21888242871839275222246405745257275088548364400416034343698204186575808495617", 10);
    }
    add(f) {
        return new Field(this.v.add(f.v));
    }
    mul(f) {
        return new Field(this.v.mul(f.v));
    }
    sub(f) {
        return new Field(this.v.sub(f.v));
    }
    neg() {
        return new Field(this.v.neg());
    }
    div(f) {
        return new Field(this.v.mul(f.inv().v));
    }
    //see, https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Polynomial_extended_Euclidean_algorithm
    inv() {
        if (this.v.eqn(0)) {
            return this;
        }
        let newt = new bn_js_1.default(1);
        let t = new bn_js_1.default(0);
        let newr = this.v;
        let r = this.modulus;
        let op = (x, newx, q) => {
            return [newx, x.sub(q.mul(newx))];
        };
        while (!newr.eqn(0)) {
            let q = r.div(newr);
            let t_newt = op(t, newt, q);
            t = t_newt[0];
            newt = t_newt[1];
            let r_newr = op(r, newr, q);
            r = r_newr[0];
            newr = r_newr[1];
        }
        return new Field(t);
    }
}
exports.Field = Field;
//# sourceMappingURL=field.js.map