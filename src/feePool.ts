import {
  SetAUMScaledPerSecondsRate as SetAUMScaledPerSecondsRateEvent,
  SetBurningFeeInBP as SetBurningFeeInBPEvent,
  SetMintingFeeInBP as SetMintingFeeInBPEvent,
} from "../generated/templates/feePool/feePool"
import { createOrLoadIndexEntity } from "./entityCreation"
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts"

export function handleSetAUMScaledPerSecondsRate(
  event: SetAUMScaledPerSecondsRateEvent
): void {
  convertAUMFeeRate(event.params.index, event.params.AUMScaledPerSecondsRate)
}

export function convertAUMFeeRate(index: Bytes, aumFee: BigInt): void {
  let indexEntity = createOrLoadIndexEntity(index)
  let scaledPerSecondRate = new BigDecimal(aumFee)
  let constant = BigDecimal.fromString('1000000000000000000000000000');
  let seconds_per_year = new BigDecimal(BigInt.fromI32(31536000))
  let q = constant.div(scaledPerSecondRate);
  let one = new BigDecimal(BigInt.fromI32(1))
  let two = new BigDecimal(BigInt.fromI32(2))
  let scalar = BigInt.fromI64(1000000000000000000).toBigDecimal()
  let roundingPrecision = BigInt.fromString(scalar.times(BigDecimal.fromString('0.001')).toString())

  // e = 1 - C / s = 1 - q
  let e = one.minus(q)

  // p1 = e*(N+1)/2
  let p1 = e.times(seconds_per_year.plus(one)).div(two)

  // e*e*(N+1)*(N+2)/6
  let p2 = e
    .times(e)
    .times(seconds_per_year.plus(one))
    .times(seconds_per_year.plus(two))
    .div(new BigDecimal(BigInt.fromI32(6)));

  // x4 = N * e * (1 - p1 + p2)
  let x4 = seconds_per_year.times(e).times(one.minus(p1).plus(p2)).times(scalar).truncate(0);
  let x4_big = BigInt.fromString(x4.toString())
  let mod = x4_big.mod(roundingPrecision)
  let wholeNumber = x4_big.minus(mod)
  if (mod >= roundingPrecision.div(BigInt.fromI32(2))) {
    let fee = new BigDecimal(wholeNumber.plus(roundingPrecision)).div(scalar)
    indexEntity.aumFee = fee
  }
  else {
    let fee = new BigDecimal(wholeNumber).div(scalar)
    indexEntity.aumFee = fee
  }
  indexEntity.save()


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