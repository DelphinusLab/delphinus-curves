import BN from "bn.js";
import { Field } from "./field";
import {Poseidon } from "./pse_poseidon";
import { config } from "./config";

var one = new Field(1);

var hasher = new Poseidon(config);
hasher.update([one]);
var hash = hasher.squeeze();
console.log("correct", "25a772a3da5e4f74f8cc2eecfb7686d5cd4c626efe52a29862516e70e98a2df3");
console.log("actual ", hash.v.toString(16, 64));