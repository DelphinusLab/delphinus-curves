"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poseidon = void 0;
var bn_js_1 = require("bn.js");
var field_1 = require("./field");
var poseidon_constants_1 = require("./poseidon-constants");
var N_ROUNDS_F = 8;
var N_ROUNDS_P = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68];
var pow5 = function (a) { return a.mul(a.mul(a.mul(a.mul(a)))); };
function poseidon(inputs) {
    if (inputs.length == 0 || inputs.length >= N_ROUNDS_P.length - 1) {
        throw new Error("Invalid input size: " + inputs.length + ".");
    }
    var t = inputs.length + 1;
    var nRoundsF = N_ROUNDS_F;
    var nRoundsP = N_ROUNDS_P[t - 2];
    var state = __spreadArray([new field_1.Field(0)], inputs);
    var _loop_1 = function (r) {
        state = state.map(function (a, i) { return a.add(new field_1.Field(new bn_js_1.BN(poseidon_constants_1.C[t - 2][r * t + i], 'hex'))); });
        if (r < nRoundsF / 2 || r >= nRoundsF / 2 + nRoundsP) {
            state = state.map(function (a) { return pow5(a); });
        }
        else {
            state[0] = pow5(state[0]);
        }
        state = state.map(function (_, i) {
            return state.reduce(function (acc, a, j) { return acc.add(a.mul(new field_1.Field(new bn_js_1.BN(poseidon_constants_1.M[t - 2][i][j], 'hex')))); }, new field_1.Field(0));
        });
    };
    for (var r = 0; r < nRoundsF + nRoundsP; r++) {
        _loop_1(r);
    }
    return state[0];
}
exports.poseidon = poseidon;
module.exports = poseidon;
