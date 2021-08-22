"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicKey = exports.PrivateKey = exports.Point = exports.CurveField = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var sha256_1 = __importDefault(require("sha256"));
var crypto_1 = __importDefault(require("crypto"));
var field_1 = require("./field");
var CurveField = /** @class */ (function () {
    function CurveField(v) {
        if (!(v instanceof bn_js_1.default)) {
            v = new bn_js_1.default(v);
        }
        this.v = v.umod(this.modulus);
    }
    Object.defineProperty(CurveField.prototype, "modulus", {
        get: function () {
            return new bn_js_1.default("21888242871839275222246405745257275088614511777268538073601725287587578984328", 10);
        },
        enumerable: false,
        configurable: true
    });
    CurveField.prototype.add = function (f) {
        return new CurveField(this.v.add(f.v));
    };
    CurveField.prototype.mul = function (f) {
        return new CurveField(this.v.mul(f.v));
    };
    CurveField.prototype.sub = function (f) {
        return new CurveField(this.v.sub(f.v));
    };
    CurveField.prototype.neg = function () {
        return new CurveField(this.v.neg());
    };
    CurveField.prototype.div = function (f) {
        return new CurveField(this.v.mul(f.inv().v));
    };
    //see, https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Polynomial_extended_Euclidean_algorithm
    CurveField.prototype.inv = function () {
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
        return new CurveField(t);
    };
    return CurveField;
}());
exports.CurveField = CurveField;
var constants = {
    c: new field_1.Field(8),
    a: new field_1.Field(168700),
    d: new field_1.Field(168696),
    gX: new field_1.Field(new bn_js_1.default("16540640123574156134436876038791482806971768689494387082833631921987005038935", 10)),
    gY: new field_1.Field(new bn_js_1.default("20819045374670962167435360035096875258406992893633759881276124905556507972311", 10)),
};
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x instanceof field_1.Field ? x : new field_1.Field(x);
        this.y = y instanceof field_1.Field ? y : new field_1.Field(y);
    }
    Object.defineProperty(Point.prototype, "zero", {
        get: function () {
            return new Point(0, 1);
        },
        enumerable: false,
        configurable: true
    });
    Point.prototype.isZero = function () {
        return this.x.v.eqn(0) && this.y.v.eqn(1);
    };
    Object.defineProperty(Point, "base", {
        get: function () {
            var gX = constants.gX;
            var gY = constants.gY;
            return new Point(gX, gY);
        },
        enumerable: false,
        configurable: true
    });
    Point.prototype.add = function (p) {
        var u1 = this.x;
        var v1 = this.y;
        var u2 = p.x;
        var v2 = p.y;
        //u3 = (u1 * v2 + v1 * u2) / (1 + D * u1 * u2 * v1 * v2)
        var u3_m = u1.mul(v2).add(v1.mul(u2));
        var u3_d = constants.d.mul(u1).mul(u2).mul(v1).mul(v2).add(new field_1.Field(1));
        var u3 = u3_m.div(u3_d);
        //v3 = (v1 * v2 - A * u1 * u2) / (1 - D * u1 * u2 * v1 * v2)
        var v3_m = v1.mul(v2).sub(constants.a.mul(u1).mul(u2));
        var v3_d = new field_1.Field(1).sub(constants.d.mul(u1).mul(u2).mul(v1).mul(v2));
        var v3 = v3_m.div(v3_d);
        return new Point(u3, v3);
    };
    Point.prototype.mul = function (p) {
        if (p instanceof CurveField) {
            p = p.v;
        }
        else if (!(p instanceof bn_js_1.default)) {
            p = new bn_js_1.default(p);
        }
        var t = p;
        var sum = this.zero;
        var acc = this;
        while (!t.eqn(0)) {
            if (t.mod(new bn_js_1.default(2)).eqn(1)) {
                sum = sum.add(acc);
            }
            acc = acc.add(acc);
            t = t.shrn(1);
        }
        return sum;
    };
    return Point;
}());
exports.Point = Point;
var PrivateKey = /** @class */ (function () {
    function PrivateKey(key) {
        this.key = key;
    }
    // I don"t know why, but most implementation not follow standard
    // https://datatracker.ietf.org/doc/html/rfc8032#section-5.2.5
    PrivateKey.random = function () {
        return new PrivateKey(new CurveField(new bn_js_1.default(crypto_1.default.randomBytes(32))));
    };
    PrivateKey.fromString = function (str) {
        new PrivateKey(new CurveField(new bn_js_1.default(str, "hex")));
    };
    PrivateKey.prototype.toString = function () {
        return this.key.v.toString("hex");
    };
    PrivateKey.prototype.r = function () {
        // TODO: refine later
        return new CurveField(new bn_js_1.default(crypto_1.default.randomBytes(32)));
    };
    Object.defineProperty(PrivateKey.prototype, "publicKey", {
        get: function () {
            if (!this.pubk) {
                this.pubk = PublicKey.fromPrivateKey(this);
            }
            return this.pubk;
        },
        enumerable: false,
        configurable: true
    });
    PrivateKey.prototype.sign = function (message) {
        var Ax = this.publicKey.key.x;
        var r = this.r();
        var R = Point.base.mul(r);
        var Rx = R.x;
        var content = [];
        content = content.concat(Rx.v.toArray("be", 32));
        content = content.concat(Ax.v.toArray("be", 32));
        content = content.concat(message);
        var H = new bn_js_1.default(sha256_1.default(content), "hex");
        console.log(H.toArray());
        var S = r.add(this.key.mul(new CurveField(H)));
        return [[R.x.v, R.y.v], S.v];
    };
    return PrivateKey;
}());
exports.PrivateKey = PrivateKey;
var PublicKey = /** @class */ (function () {
    function PublicKey(key) {
        this.key = key;
    }
    PublicKey.fromPrivateKey = function (pk) {
        return new PublicKey(Point.base.mul(pk.key));
    };
    return PublicKey;
}());
exports.PublicKey = PublicKey;
