"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = require("../field");
var command_1 = require("./command");
var main_1 = require("./main");
var data = main_1.genZKPInput(new field_1.Field(5), [new field_1.Field(0), new field_1.Field(0), new field_1.Field(4), new field_1.Field(5)], new command_1.L2Storage());
console.log(data.map(function (f) { return f.v.toString(10); }));
