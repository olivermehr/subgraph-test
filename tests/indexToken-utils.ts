import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  AssetRemoved,
  Transfer,
  UpdateAnatomy
} from "../generated/templates/indexToken/indexToken"

export function createAssetRemovedEvent(asset: Address): AssetRemoved {
  let assetRemovedEvent = changetype<AssetRemoved>(newMockEvent())

  assetRemovedEvent.parameters = new Array()

  assetRemovedEvent.parameters.push(
    new ethereum.EventParam("asset", ethereum.Value.fromAddress(asset))
  )

  return assetRemovedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}

export function createUpdateAnatomyEvent(
  asset: Address,
  weight: i32
): UpdateAnatomy {
  let updateAnatomyEvent = changetype<UpdateAnatomy>(newMockEvent())

  updateAnatomyEvent.parameters = new Array()

  updateAnatomyEvent.parameters.push(
    new ethereum.EventParam("asset", ethereum.Value.fromAddress(asset))
  )
  updateAnatomyEvent.parameters.push(
    new ethereum.EventParam(
      "weight",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(weight))
    )
  )

  return updateAnatomyEvent
}
