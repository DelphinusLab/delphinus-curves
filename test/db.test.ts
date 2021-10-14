import { Field } from "../src/field";
import { MarkleTree } from "../src/markle-tree-large";

var assert = require('assert');

async function main() {
    const merkle_tree = new MarkleTree();

    await merkle_tree.loadSnapshot("0");

    await merkle_tree.startSnapshot("1");
    await merkle_tree.setNode("0001", new Field(1));
    await merkle_tree.setNode("0002", new Field(2));
    await merkle_tree.setNode("0003", new Field(3));

    await merkle_tree.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(new Field(1).v))
    });

    await merkle_tree.startSnapshot("2");
    await merkle_tree.setNode("0001", new Field(19));
    await merkle_tree.endSnapshot();

    await merkle_tree.lastestSnapshot().then((node) => {
        assert.equal(node, "2");
    });

    await merkle_tree.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(new Field(19).v))
    });

    await merkle_tree.loadSnapshot("1");
    await merkle_tree.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(new Field(1).v))
    });

    await merkle_tree.loadSnapshot("0");
    await merkle_tree.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(MarkleTree.emptyNodeHash(4).v));
    });

    await merkle_tree.startSnapshot("1");
    await merkle_tree.setNode("0001", new Field(1));
    await merkle_tree.setNode("0001", new Field(2));
    await merkle_tree.setNode("0001", new Field(3));
    await merkle_tree.endSnapshot();
    await merkle_tree.loadSnapshot("0");
    await merkle_tree.getNode("0001").then((node) => {
        assert.ok(node!.v.eq(MarkleTree.emptyNodeHash(4).v));
    });

    await merkle_tree.closeDb();
}

main().then(() => console.log("done"))