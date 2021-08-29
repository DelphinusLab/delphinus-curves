"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommand = void 0;
var command_1 = require("./command");
var addpool_1 = require("./ops/addpool");
var deposit_1 = require("./ops/deposit");
var supply_1 = require("./ops/supply");
var withdraw_1 = require("./ops/withdraw");
function createCommand(op, args) {
    if (op.v.eqn(command_1.CommandOp.Deposit)) {
        return new deposit_1.DepositCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.Withdraw)) {
        return new withdraw_1.WithdrawCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.Supply)) {
        return new supply_1.SupplyCommand(args);
    }
    if (op.v.eqn(command_1.CommandOp.AddPool)) {
        return new addpool_1.AddPoolCommand(args);
    }
    throw new Error('Not implemented yet');
}
exports.createCommand = createCommand;
