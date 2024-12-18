import BN from "bn.js";
import sha256 from "sha256";
import { Keccak } from "sha3";
import crypto from "crypto";
import { Field } from "./field.js";

export class CurveField {
  readonly v: BN;

  get modulus() {
    return new BN(
      "2736030358979909402780800718157159386076813972158567259200215660948447373041",
      10
    );
  }

  constructor(v: BN | number) {
    if (!(v instanceof BN)) {
      v = new BN(v);
    }
    this.v = v.umod(this.modulus);
  }

  add(f: CurveField) {
    return new CurveField(this.v.add(f.v));
  }

  mul(f: CurveField) {
    return new CurveField(this.v.mul(f.v));
  }

  sub(f: CurveField) {
    return new CurveField(this.v.sub(f.v));
  }

  neg() {
    return new CurveField(this.v.neg());
  }

  div(f: CurveField) {
    return new CurveField(this.v.mul(f.inv().v));
  }

  //see, https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Polynomial_extended_Euclidean_algorithm
  inv() {
    if (this.v.eqn(0)) {
      return this;
    }

    let newt = new BN(1);
    let t = new BN(0);
    let newr = this.v;
    let r = this.modulus;

    let op = (x: BN, newx: BN, q: BN) => {
      return [newx, x.sub(q.mul(newx))];
    };

    while (!newr.eqn(0)) {
      let q = r.div(newr);

      let t_newt = op(t, newt, q);
      t = t_newt[0];
      newt = t_newt[1];

      let r_newr = op(r, newr, q);
      r = r_newr[0];
      newr = r_newr[1];
    }

    return new CurveField(t);
  }
}

const constants = {
  c: new Field(0),
  a: new Field(new BN(
          "21888242871839275222246405745257275088548364400416034343698204186575808495616",
          10
    )
  ),
  d: new Field(new BN(
          "12181644023421730124874158521699555681764249180949974110617291017600649128846",
          10
    )
  ),
  gX: new Field(
    new BN(
      "21237458262955047976410108958495203094252581401952870797780751629344472264183",
      10
    )
  ),
  gY: new Field(
    new BN(
      "2544379904535866821506503524998632645451772693132171985463128613946158519479",
      10
    )
  ),
};

export class Point {
  readonly x: Field;
  readonly y: Field;

  constructor(x: Field | BN | number, y: Field | BN | number) {
    this.x = x instanceof Field ? x : new Field(x);
    this.y = y instanceof Field ? y : new Field(y);
  }

  get zero(): Point {
    return new Point(0, 1);
  }

  isZero(): boolean {
    return this.x.v.eqn(0) && this.y.v.eqn(1);
  }

  static get base(): Point {
    let gX = constants.gX;
    let gY = constants.gY;
    return new Point(gX, gY);
  }

  add(p: Point) {
    const u1 = this.x;
    const v1 = this.y;

    const u2 = p.x;
    const v2 = p.y;

    //u3 = (u1 * v2 + v1 * u2) / (1 + D * u1 * u2 * v1 * v2)
    let u3_m = u1.mul(v2).add(v1.mul(u2));
    let u3_d = constants.d.mul(u1).mul(u2).mul(v1).mul(v2).add(new Field(1));
    let u3 = u3_m.div(u3_d);

    //v3 = (v1 * v2 - A * u1 * u2) / (1 - D * u1 * u2 * v1 * v2)
    let v3_m = v1.mul(v2).sub(constants.a.mul(u1).mul(u2));
    let v3_d = new Field(1).sub(constants.d.mul(u1).mul(u2).mul(v1).mul(v2));
    let v3 = v3_m.div(v3_d);

    return new Point(u3, v3);
  }

  mul(p: CurveField | BN | number) {
    if (p instanceof CurveField) {
      p = p.v;
    } else if (!(p instanceof BN)) {
      p = new BN(p);
    }

    let t: BN = p;
    let sum: Point = this.zero;
    let acc: Point = this;

    while (!t.eqn(0)) {
      if (t.mod(new BN(2)).eqn(1)) {
        sum = sum.add(acc);
      }
      acc = acc.add(acc);
      t = t.shrn(1);
    }
    return sum;
  }
}

function u8ToHex(u8Array: Uint8Array): string {
    return Array.from(u8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export function bnToHexLe(n: BN): string {
    let bytes = n.toArray("le", 32);
    let v:Uint8Array = new Uint8Array(32);
    for (var i=0; i<32; i++) {
        v[i] = bytes[i]
    }
    return u8ToHex(v);
}

export class PrivateKey {
  readonly key: CurveField;
  private pubk?: PublicKey;

  private constructor(key: CurveField) {
    this.key = key;
  }

  // I don"t know why, but most implementation not follow standard
  // https://datatracker.ietf.org/doc/html/rfc8032#section-5.2.5
  static random() {
    return new PrivateKey(new CurveField(new BN(crypto.randomBytes(32))));
  }

  static fromString(str: string) {
    return new PrivateKey(new CurveField(new BN(str, "hex")));
  }

  toString() {
    return this.key.v.toString("hex");
  }

  r() {
    // TODO: refine later
    return new CurveField(new BN(crypto.randomBytes(32)));
  }

  get publicKey() {
    if (!this.pubk) {
      this.pubk = PublicKey.fromPrivateKey(this);
    }
    return this.pubk;
  }

  hashMessage(msg: Uint8Array): BN{
    const hash = sha256(Buffer.from(msg));
    return new BN(hash, "hex");
  }

  sign(message: Uint8Array): [[BN, BN], BN] {
    let r = this.r();
    let R = Point.base.mul(r);

    let H = this.hashMessage(message);
    let bytesPacked = H.toString("hex", 64);
    console.log("Signing messag:", bytesPacked);
    console.log(H.toArray());
    console.log("Message in little endian:");
    console.log(bnToHexLe(H));

    console.log("----------------------------------");

    let S = r.add(this.key.mul(new CurveField(H)));

    return [[R.x.v, R.y.v], S.v];
  }
}

export class PublicKey {
  key: Point;

  private constructor(key: Point) {
    this.key = key;
  }

  static fromPrivateKey(pk: PrivateKey) {
    return new PublicKey(Point.base.mul(pk.key));
  }
}
