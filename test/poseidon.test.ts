import BN from "bn.js";
import { Field } from "../src/field";
import { poseidon, Poseidon } from "../src/pse_poseidon";
import { config } from "./config-basic";


let hasher = new Poseidon(config);
hasher.update([new Field(1)]);
let hash = hasher.squeeze();
console.log("correct", "0afa3191039d9a905e211dc264763967c25b6564b9628ad64d002e43d42912f5");
console.log(hash.v.toString(16, 64));
if(hash.v.toString(16, 64) == "0afa3191039d9a905e211dc264763967c25b6564b9628ad64d002e43d42912f5"){
  console.log("Test passed");
} else {
  console.log("Test failed");
  throw new Error("Test failed");
}

let input = Array(config.t).fill(new Field(1));
hasher = new Poseidon(config);
hasher.update(input);
hash = hasher.squeeze();
console.log("correct", "2f4b60f564113a7f93ee3ea3f94ad27ee649a3ccadc11746da2abbf4b09bf2d0");
console.log(hash.v.toString(16, 64));
if(hash.v.toString(16, 64) == "2f4b60f564113a7f93ee3ea3f94ad27ee649a3ccadc11746da2abbf4b09bf2d0"){
  console.log("Test passed");
} else {
  console.log("Test failed");
  throw new Error("Test failed");
}
  