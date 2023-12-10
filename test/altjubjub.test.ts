import { BN } from "bn.js";
import sha256 from "sha256";
import { Point, PrivateKey, bnToHexLe } from "../src/altjubjub";

const prik = PrivateKey.random();
console.log(prik.key.v.toString("hex"));

const pubk = prik.publicKey;
console.log("generated pubkey is:");
console.log(pubk.key.x.v.toString("hex"), pubk.key.y.v.toString("hex"));

const sign = prik.sign(new BN(0).toArray('be', 64));
console.log(
    "r_x:",
    sign[0][0].toString("hex", 64),
    bnToHexLe(sign[0][0]),
    "r_y:",
    sign[0][1].toString("hex", 64),
    bnToHexLe(sign[0][1]),
    "r_s:",
    sign[1].toString("hex", 64),
    bnToHexLe(sign[1]),
    "pub_x:",
    pubk.key.x.v.toString("hex", 64),
    bnToHexLe(pubk.key.x.v),
    "pub_y:",
    pubk.key.y.v.toString("hex", 64),
    bnToHexLe(pubk.key.y.v),
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
