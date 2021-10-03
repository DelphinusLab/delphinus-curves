"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bn_js_1 = require("bn.js");
var sha256_1 = __importDefault(require("sha256"));
var babyjubjub_1 = require("../src/babyjubjub");
var prik = babyjubjub_1.PrivateKey.random();
console.log(prik.key.v.toString("hex"));
var pubk = prik.publicKey;
console.log(pubk.key.x.v.toString("hex"), pubk.key.y.v.toString("hex"));
var sign = prik.sign(new bn_js_1.BN(0).toArray('be', 64));
console.log(sign[0][0].toString(10), sign[0][1].toString(10), sign[1].toString(10), pubk.key.x.v.toString(10), pubk.key.y.v.toString(10), Array(16).fill("0").join(" "));
var l = babyjubjub_1.Point.base.mul(sign[1]);
var r = new babyjubjub_1.Point(sign[0][0], sign[0][1]).add(pubk.key.mul(new bn_js_1.BN((0, sha256_1.default)(sign[0][0].toArray('be', 32)
    .concat(pubk.key.x.v.toArray('be', 32))
    .concat(new bn_js_1.BN(0).toArray('be', 64))), "hex")));
console.log(l);
console.log(r);
