import { Field } from "../field";
import { L2Storage } from "./command";
import { genZKPInput } from "./main";

const data = genZKPInput(new Field(5), [new Field(0), new Field(0), new Field(4), new Field(5)], new L2Storage());
console.log(data.map(f => f.v.toString(10)));