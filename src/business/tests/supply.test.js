"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("../../field");
var command_1 = require("../command");
var main_1 = require("../main");
var child_process_1 = require("child_process");
var storage = new command_1.L2Storage();
var _0 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.AddPool), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(5)
], storage);
var _1 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Deposit), [
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(100)
], storage);
var _2 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Deposit), [
    new field_1.Field(0),
    new field_1.Field(5),
    new field_1.Field(100)
], storage);
var data = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Supply), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(10),
    new field_1.Field(10),
    new field_1.Field(0)
], storage);
console.log("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "));
child_process_1.exec("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "), {
    cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
}, function (error, stdout, stderr) {
    console.log('error\n', error);
    console.log('stdout\n', stdout);
    console.log('stderr\n', stderr);
});
