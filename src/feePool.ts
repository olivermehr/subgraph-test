import {
  SetAUMScaledPerSecondsRate as SetAUMScaledPerSecondsRateEvent,
  SetBurningFeeInBP as SetBurningFeeInBPEvent,
  SetMintingFeeInBP as SetMintingFeeInBPEvent,
} from "../generated/templates/feePool/feePool"
import { createOrLoadIndexEntity } from "./entityCreation"
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"

export function handleSetAUMScaledPerSecondsRate(
  event: SetAUMScaledPerSecondsRateEvent
): void {
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBPEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.params.index)
  let scalar = new BigDecimal(BigInt.fromI32(10000))
  let fee = new BigDecimal(BigInt.fromI32(event.params.burningFeeInPB)).div(scalar)
  indexEntity.redemptionFee = fee
  indexEntity.save()
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBPEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.params.index)
  let scalar = new BigDecimal(BigInt.fromI32(10000))
  let fee = new BigDecimal(BigInt.fromI32(event.params.mintingFeeInBP)).div(scalar)
  indexEntity.mintingFee = fee
  indexEntity.save()
}