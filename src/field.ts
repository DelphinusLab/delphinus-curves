import BN from "bn.js";

export class Field {
  readonly v: BN;
  get modulus() {
    return new BN(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617",
      10
    );
  }

  toString() {
    return this.v.toString(10);
  }

  constructor(v: BN | number) {
    if (!(v instanceof BN)) {
      v = new BN(v);
    }
    this.v = v.umod(this.modulus);
  }

  add(f: Field) {
    return new Field(this.v.add(f.v));
  }

  mul(f: Field) {
    return new Field(this.v.mul(f.v));
  }

  sub(f: Field) {
    return new Field(this.v.sub(f.v));
  }

  neg() {
    return new Field(this.v.neg());
  }

  div(f: Field) {
    return new Field(this.v.mul(f.inv().v));
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

    return new Field(t);
  }
}