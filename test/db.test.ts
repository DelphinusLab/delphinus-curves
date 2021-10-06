import { BN } from "bn.js";
import { Field } from "../src/field";
import { MarkleTree } from "../src/markle-tree-large";

var assert = require('assert');

async function main() {
    await MarkleTree.prototype.setNode("0001", new Field(1));
    await MarkleTree.prototype.setNode("0002", new Field(2));
    await MarkleTree.prototype.setNode("0003", new Field(3));

    MarkleTree.prototype.getNode("0001").then((node) => {
        assert.ok(node.v.eq(new Field(1).v))
    });

    MarkleTree.prototype.getNode("0002").then((node) => {
        assert.ok(node.v.eq(new Field(2).v))
    });

    MarkleTree.prototype.getNode("0003").then((node) => {
        assert.ok(node.v.eq(new Field(3).v))
    });

    MarkleTree.prototype.startSnapshot(1);
    await MarkleTree.prototype.setNode("0001", new Field(9));
    MarkleTree.prototype.endSnapshot();

    MarkleTree.prototype.getNode("0001").then((node) => {
        assert.ok(node.v.eq(new Field(9).v))
    });

    await MarkleTree.prototype.loadSnapshot(0);
    console.log("load snapshot");

    MarkleTree.prototype.getNode("0001").then((node) => {
        assert.ok(node.v.eq(new Field(1).v))
    });
}

main().then(() => console.log("done"))