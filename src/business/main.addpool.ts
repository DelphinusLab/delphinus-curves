import { Field } from "../field";
import { CommandOp, L2Storage } from "./command";
import { genZKPInput } from "./main";
import { exec } from "child_process";

const data = genZKPInput(
  new Field(CommandOp.AddPool),
  [
    new Field(0),
    new Field(0),
    new Field(4),
    new Field(5)
  ],
  new L2Storage()
);

console.log(`zokrates compute-witness -a ${data.map(f => f.v.toString(10)).join(" ")}`);

exec(
  `zokrates compute-witness -a ${data.map(f => f.v.toString(10)).join(" ")}`,
  {
    cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
  },
  (error, stdout, stderr) => {
    console.log('error\n', error);
    console.log('stdout\n', stdout);
    console.log('stderr\n', stderr);
  }
);