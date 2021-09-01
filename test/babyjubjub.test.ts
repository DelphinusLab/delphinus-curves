import { BN } from "bn.js";
import sha256 from "sha256";
import { Point, PrivateKey } from "../src/babyjubjub";

const prik = PrivateKey.random();
console.log(prik.key.v.toString("hex"));

const pubk = prik.publicKey;
console.log(pubk.key.x.v.toString("hex"), pubk.key.y.v.toString("hex"));

const sign = prik.sign(new BN(0).toArray('be', 64));
console.log(
    sign[0][0].toString(10),
    sign[0][1].toString(10),
    sign[1].toString(10),
    pubk.key.x.v.toString(10),
    pubk.key.y.v.toString(10),
    Array(16).fill("0").join(" ")
);

let l = Point.base.mul(sign[1]);
let r = new Point(sign[0][0], sign[0][1]).add(
    pubk.key.mul(
        new BN(sha256(
            sign[0][0].toArray('be', 32)
            .concat(pubk.key.x.v.toArray('be', 32))
            .concat(new BN(0).toArray('be', 64))
        ), "hex")
    )
)

console.log(l);
console.log(r);
