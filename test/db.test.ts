import { Field } from "../src/field";
import { MerkleTree, PathInfo } from "../src/merkle-tree-large";

var assert = require('assert');

function convertToMtIndex(index: number): string {
    // toString() may get negative value
    let ret = "";
    for (let i = 0; i < 16; i++) {
      ret = ((index >> (i * 2)) & 3).toString() + ret;
    }
    return ret;
}

async function testDBMerkleTree() {
    const merkle_tree = new MerkleTree();

    await merkle_tree.loadSnapshot("0");

    await merkle_tree.startSnapshot("1");
    await merkle_tree.setNode("0001", new Field(1));
    await merkle_tree.setNode("0002", new Field(2));
    await merkle_tree.setNode("0003", new Field(3));

    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node!.v.eq(new Field(1).v))
    });

    await merkle_tree.startSnapshot("2");
    await merkle_tree.setNode("0001", new Field(19));
    await merkle_tree.endSnapshot();

    await merkle_tree.lastestSnapshot().then((node: any) => {
        assert.equal(node, "2");
    });

    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node!.v.eq(new Field(19).v))
    });

    await merkle_tree.loadSnapshot("1");
    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node!.v.eq(new Field(1).v))
    });

    await merkle_tree.loadSnapshot("0");
    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node!.v.eq(MerkleTree.emptyNodeHash(4).v));
    });

    await merkle_tree.startSnapshot("1");
    await merkle_tree.setNode("0001", new Field(1));
    await merkle_tree.setNode("0001", new Field(2));
    await merkle_tree.setNode("0001", new Field(3));
    await merkle_tree.endSnapshot();
    await merkle_tree.startSnapshot("2");
    await merkle_tree.setNode("0001", new Field(4));
    await merkle_tree.endSnapshot();
    await merkle_tree.loadSnapshot("0");
    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node!.v.eq(MerkleTree.emptyNodeHash(4).v));
    });

    await merkle_tree.loadSnapshot("0");
    await merkle_tree.startSnapshot("1");
    await merkle_tree.setNode("0", new Field(1));
    await merkle_tree.setLeave(0, new Field(2)).then(
        (path:PathInfo) => {
            assert.equal(path.pathDigests[0][0].v.toNumber(), 1);
        }
    );
    await merkle_tree.getNode(convertToMtIndex(0)).then(
        (node: any) => {
            assert.equal(node!.v.toNumber(), 2);
        }
    );
    await merkle_tree.endSnapshot();

    await merkle_tree.closeDb();
}

async function testInMemoryMerkleTree() {
    const merkle_tree = new MerkleTree(true);

    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node === undefined)
    });

    await merkle_tree.setNode("0001", new Field(1));
    await merkle_tree.getNode("0001").then((node: any) => {
        assert.ok(node!.v.eq(new Field(1).v))
    });

    // lastestSnapshot should always return string "0"
    await merkle_tree.lastestSnapshot().then((node: any) => {
        assert.equal(node, "0");
    });

    // should do nothing
    await merkle_tree.loadSnapshot("0");
    await merkle_tree.endSnapshot();
    await merkle_tree.closeDb();
}

async function main() {
    await testDBMerkleTree();
    await testInMemoryMerkleTree();
}

main().then(() => console.log("done"))
