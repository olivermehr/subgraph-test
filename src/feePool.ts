import {
  SetAUMScaledPerSecondsRate as SetAUMScaledPerSecondsRateEvent,
  SetBurningFeeInBP as SetBurningFeeInBPEvent,
  SetMintingFeeInBP as SetMintingFeeInBPEvent,
} from "../generated/templates/feePool/feePool"
import { createOrLoadIndexEntity } from "./entityCreation"
import { BigDecimal } from "@graphprotocol/graph-ts"

export function handleSetAUMScaledPerSecondsRate(
  event: SetAUMScaledPerSecondsRateEvent
): void {
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBPEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.params.index)
  let fee = BigDecimal.fromString((event.params.burningFeeInPB/100).toString())
  indexEntity.redemptionFee = fee
  indexEntity.save()
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBPEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.params.index)
  let fee = BigDecimal.fromString((event.params.mintingFeeInBP/100).toString())
  indexEntity.mintingFee = fee
  indexEntity.save()
}