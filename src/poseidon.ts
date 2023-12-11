import { BN } from "bn.js";
import { Field } from "./field.js";
import { C, M } from "./poseidon-constants.js"

const N_ROUNDS_F = 8;
const N_ROUNDS_P = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68];

const pow5 = (a: Field) => a.mul(a.mul(a.mul(a.mul(a))))

export function poseidon(inputs: Field[]): Field {
    if (inputs.length == 0 || inputs.length >= N_ROUNDS_P.length - 1) {
        throw new Error(`Invalid input size: ${inputs.length}.`);
    }

    const t = inputs.length + 1;
    const nRoundsF = N_ROUNDS_F;
    const nRoundsP = N_ROUNDS_P[t - 2];

    let state = [new Field(0), ...inputs];
    for (let r = 0; r < nRoundsF + nRoundsP; r++) {
        state = state.map((a, i) => a.add(new Field(new BN(C[t - 2][r * t + i], 'hex'))));

        if (r < nRoundsF / 2 || r >= nRoundsF / 2 + nRoundsP) {
            state = state.map(a => pow5(a));
        } else {
            state[0] = pow5(state[0]);
        }

        state = state.map((_, i) =>
            state.reduce((acc, a, j) => acc.add(a.mul(new Field(new BN(M[t - 2][i][j], 'hex')))), new Field(0))
        );
    }
    return state[0];
}