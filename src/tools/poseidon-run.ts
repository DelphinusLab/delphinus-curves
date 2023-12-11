import { BN } from "bn.js";
import process from "process";
import { Field } from "../field.js";
import { poseidon } from "../poseidon.js";

let inputs = process.argv.slice(2, 6).map(x => { console.log(x); return new Field(new BN(x))});
console.log(poseidon(inputs).v.toString(10));

