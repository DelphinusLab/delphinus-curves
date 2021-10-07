import { BN } from "bn.js";
import { closeMongoClient } from "../src/db";
import { Field } from "../src/field";
import { MarkleTree } from "../src/markle-tree-large";

var assert = require('assert');

async function main() {
    await MarkleTree.prototype.loadSnapshot(0);
    await MarkleTree.prototype.startSnapshot(1);
    await MarkleTree.prototype.setNode("0002", new Field(2));
    await MarkleTree.prototype.setNode("0003", new Field(3));

    await MarkleTree.prototype.getNode("0002").then((node) => {
        assert.ok(node!.v.eq(new Field(2).v))
    });

    await MarkleTree.prototype.getNode("0003").then((node) => {
        assert.ok(node!.v.eq(new Field(3).v))
    });

    await MarkleTree.prototype.startSnapshot(2);
    await MarkleTree.prototype.setNode("0001", new Field(19));
    await MarkleTree.prototype.endSnapshot();

    await MarkleTree.prototype.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(new Field(19).v))
    });

    await MarkleTree.prototype.loadSnapshot(0);

    await MarkleTree.prototype.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(MarkleTree.emptyNodeHash(4).v));
    });

    await closeMongoClient();
}

main().then(() => console.log("done"))