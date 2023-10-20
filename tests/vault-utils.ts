import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Initialized,
  SetVaultController,
  UpdateDeposit,
  VTokenTransfer
} from "../generated/vault/vault"

export function createVTokenTransferEvent(
  from: Address,
  to: Address,
  amount: BigInt
): VTokenTransfer {
  let vTokenTransferEvent = changetype<VTokenTransfer>(newMockEvent())

  vTokenTransferEvent.parameters = new Array()

  vTokenTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  vTokenTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  vTokenTransferEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return vTokenTransferEvent
}
