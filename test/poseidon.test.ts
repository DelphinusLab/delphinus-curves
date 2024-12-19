import BN from "bn.js";
import { Field } from "../src/field";
import { Poseidon } from "../src/poseidon";
import { config } from "../src/config";

let hasher = new Poseidon(config);
hasher.update([new Field(1)]);
let hash = hasher.squeeze();
console.log("correct", "25a772a3da5e4f74f8cc2eecfb7686d5cd4c626efe52a29862516e70e98a2df3");
console.log(hash.v.toString(16, 64));
if(hash.v.toString(16, 64) == "25a772a3da5e4f74f8cc2eecfb7686d5cd4c626efe52a29862516e70e98a2df3"){
  console.log("Test passed");
} else {
  console.log("Test failed");
  throw new Error("Test failed");
}

let input = Array(config.t).fill(new Field(1));
hasher = new Poseidon(config);
hasher.update(input);
hash = hasher.squeeze();
console.log("correct", "0f201517a7f47e158acbfa431dea4bb7a166d7dddf2a8a5e27cc99e0b9c2d6c8");
console.log(hash.v.toString(16, 64));
if(hash.v.toString(16, 64) == "0f201517a7f47e158acbfa431dea4bb7a166d7dddf2a8a5e27cc99e0b9c2d6c8"){
  console.log("Test passed");
} else {
  console.log("Test failed");
  throw new Error("Test failed");
}

{
  let input = Array(config.rate).fill(new Field(1));
  let hasher = new Poseidon(config);
  let hash = hasher.update_exact(input);
  console.log(hash.v.toString(16, 64));
  if(hash.v.toString(16, 64) == "2998d3b7b2d5a959f531c143de78a3df6084ae2e7aced894610d1c4447f55483"){
    console.log("Test passed");
  } else {
    console.log("Test failed");
    throw new Error("Test failed");
  } 
}