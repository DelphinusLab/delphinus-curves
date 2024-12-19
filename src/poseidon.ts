import { Field } from './field.js';
import BN from 'bn.js';
import { config } from "./config.js";

const pow5 = (a: Field) => a.mul(a.mul(a.mul(a.mul(a))));

function sbox_full(state: Field[]): Field[] {
    for (let i = 0; i < state.length; i++) {
        const tmp = state[i].mul(state[i]);
        state[i] = state[i].mul(tmp);
        state[i] = state[i].mul(tmp);
    }
    return state;
}

function addConstants(a: Field[], b: Field[]): Field[] {
    // console.log("addConstants", a, b);
    return a.map((value, index) => value.add(b[index]));
}

function apply(matrix: Field[][], vector: Field[]): Field[] {
    const result: Field[] = new Array(matrix.length).fill(new Field(0));
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            result[i] = result[i].add(matrix[i][j].mul(vector[j]));
        }
    }
    return result;
}

function applySparseMatrix(matrix: any, state: Field[]) {
    const words = state.map((value) => new Field(value.v));
    let state0 = new Field(0);
    for (let i = 0; i < words.length; i++) {
        // console.log("applySparseMatrix", i, trimHex(matrix.row[i]));
        const f = new Field(new BN(trimHex(matrix.row[i]), 'hex'));
        state0 = state0.add(f.mul(words[i]));
    }
    state[0] = state0;
    for (let i = 1; i < words.length; i++) {
        const hat = new Field(new BN(trimHex(matrix.col_hat[i-1]), 'hex'));
        state[i] = hat.mul(words[0]).add(words[i]);
    }
    return state;
}

function trimHex(s: string): string {
    return s.replace(/^0x/, '');
}

function toFieldArray(arr: string[]): Field[] {
    return arr.map((value) => new Field(new BN(trimHex(value), 'hex')));
}

function toFieldMatrix(arr: string[][]): Field[][] {
    return arr.map((row) => toFieldArray(row));
}

function logState(tag: string, state: Field[]) {
    // for (let i = 0; i < state.length; i++) {
    //     console.log(tag, ":", "i", i, "state", state[i].v.toString(16, 64));
    // }
}

export class Poseidon {
    private state: Field[];
    private absortbing: Field[];
    private squeezed: boolean;

    constructor(private config: any) {
        this.state = Array(this.config.t).fill(new Field(0));
        this.state[0] = new Field(new BN('0000000000000000000000000000000000000000000000010000000000000000', 16));
        this.absortbing = [];
        this.squeezed = false;
    }

    public getState(): Field[] {
        return this.state;
    }

    private permute(): void {
        const rf = this.config.r_f/2;

        // First half of full rounds
        {
            logState('state 0', this.state);
            this.state = addConstants(this.state, toFieldArray(this.config.constants.start[0]));
            logState('state 1', this.state);
            for (let i = 1; i < rf; i++) {
                this.state = sbox_full(this.state);
                this.state = addConstants(this.state, toFieldArray(this.config.constants.start[i]));
                this.state = apply(toFieldMatrix(this.config.mds_matrices.mds), this.state);
            }
            logState('state 1.1', this.state);
            this.state = sbox_full(this.state);
            logState('state 1.2', this.state);
            this.state = addConstants(this.state, toFieldArray(this.config.constants.start[this.config.constants.start.length - 1]));
            logState('state 1.3', this.state);
            this.state = apply(toFieldMatrix(this.config.mds_matrices.pre_sparse_mds), this.state);
            logState('state 2', this.state);
        }

        // Partial rounds
        {
            for (let i = 0; i < this.config.constants.partial.length && i < this.config.mds_matrices.sparse_matrices.length; i++) {
                this.state[0] = pow5(this.state[0]);
                this.state[0] = this.state[0].add(new Field(new BN(trimHex(this.config.constants.partial[i]), 'hex')));
                applySparseMatrix(this.config.mds_matrices.sparse_matrices[i], this.state);
            }
        }
        logState('state after parial', this.state);

        // Second half of the full rounds
        {
            for(const constants of this.config.constants.end) {
                this.state = sbox_full(this.state);
                this.state = addConstants(this.state, toFieldArray(constants));
                this.state = apply(toFieldMatrix(this.config.mds_matrices.mds), this.state);
            }
            logState('state 3 loop end', this.state);
            this.state = sbox_full(this.state);
            this.state = apply(toFieldMatrix(this.config.mds_matrices.mds), this.state);
        }
        logState('return from permute', this.state);
        return;
    }

    public update_exact(elements: Field[]): Field {
        if (this.squeezed) {
            throw new Error("Cannot update after squeeze");
        }
        if (elements.length != this.config.rate) {
            throw new Error(`Invalid input size: ${elements.length}.`);
        }
        
        const chunk = elements;
        for(let j = 0; j < this.config.rate; j++) {
            this.state[j+1] = this.state[j+1].add(chunk[j]);
        }
        this.permute();
        logState('return from update', this.state);
        return this.state[1];
    }

    public update(elements: Field[]): void {
        if (this.squeezed) {
            throw new Error("Cannot update after squeeze");
        }
        for (let i = 0; i < elements.length; i+= this.config.rate) {
            if (i + this.config.rate > elements.length) {
                this.absortbing = elements.slice(i);
            } else {
                const chunk = elements.slice(i, i + this.config.rate);
                for(let j = 0; j < this.config.rate; j++) {
                    this.state[j+1] = this.state[j+1].add(chunk[j]);
                }
                this.permute();
                this.absortbing = [];
            }
        }
        logState('return from update', this.state);
        return;
    }

    public squeeze(): Field {
        const lastChunk = this.absortbing;
        logState('state before squeeze', this.state);
        lastChunk.push(new Field(1));
        for(let i = 0; i < lastChunk.length && i < this.state.length - 1; i++) {
            this.state[i+1] = this.state[i+1].add(lastChunk[i]);
        }
        this.permute();
        this.absortbing = [];
        logState('return from squeeze', this.state);
        return this.state[1];
    }
}

export function poseidon(inputs: Field[]): Field {
    if (inputs.length == 0) {
        throw new Error(`Invalid input size: ${inputs.length}.`);
    }
    const hasher = new Poseidon(config);
    hasher.update(inputs);
    const hash = hasher.squeeze();
    return hash
}
