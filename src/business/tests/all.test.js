"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var _3 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Supply), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(10),
    new field_1.Field(10),
    new field_1.Field(0)
], storage);
var _4 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Swap), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(5),
    new field_1.Field(0),
    new field_1.Field(1)
], storage);
var _5 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Retrieve), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(15),
    new field_1.Field(5),
    new field_1.Field(2)
], storage);
var _6 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Withdraw), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(4),
    new field_1.Field(100),
    new field_1.Field(3)
], storage);
var _7 = main_1.genZKPInput(new field_1.Field(command_1.CommandOp.Withdraw), [
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(0),
    new field_1.Field(5),
    new field_1.Field(100),
    new field_1.Field(4)
], storage);
function testInput(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "));
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    return child_process_1.exec("zokrates compute-witness -a " + data.map(function (f) { return f.v.toString(10); }).join(" "), {
                        cwd: "/home/shindar/Projects/delphinus/delphinus-zkp"
                    }, function (error, stdout, stderr) {
                        console.log('stdout\n', stdout);
                        if (error) {
                            console.log(error);
                            reject(error);
                            return;
                        }
                        //console.log('error\n', error);
                        //console.log('stderr\n', stderr);
                        resolve(undefined);
                    });
                })];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testInput(_0)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testInput(_1)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testInput(_2)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testInput(_3)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testInput(_4)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, testInput(_5)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, testInput(_6)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, testInput(_7)];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
