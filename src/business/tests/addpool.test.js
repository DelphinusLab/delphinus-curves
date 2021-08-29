"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("../../field");
var command_1 = require("../command");
var main_1 = require("../main");
var child_process_1 = require("child_process");
var data = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.AddPool), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(5)
], new command_1.L2Storage());
console.log("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "));
child_process_1.exec("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "), {
    cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
}, function (error, stdout, stderr) {
    console.log('error\n', error);
    console.log('stdout\n', stdout);
    console.log('stderr\n', stderr);
});
