import { Field } from "../field";
import { CommandOp } from "./command";
import { AddPoolCommand } from "./ops/addpool";
import { DepositCommand } from "./ops/deposit";
import { WithdrawCommand } from "./ops/withdraw";

export function createCommand(op: Field, args: Field[]) {
  if (op.v.eqn(CommandOp.Deposit)) {
    return new DepositCommand(args);
  }

  if (op.v.eqn(CommandOp.Withdraw)) {
    return new WithdrawCommand(args);
  }

  if (op.v.eqn(CommandOp.AddPool)) {
    return new AddPoolCommand(args);
  }

  throw new Error('Not implemented yet');
}