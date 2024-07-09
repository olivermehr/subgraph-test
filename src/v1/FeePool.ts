import {
  SetAUMScaledPerSecondsRate as SetAUMScaledPerSecondsRateEvent,
  SetBurningFeeInBP as SetBurningFeeInBPEvent,
  SetMintingFeeInBP as SetMintingFeeInBPEvent,
} from "../../generated/templates/FeePool/FeePool";
import { createOrLoadIndexEntity } from "../EntityCreation";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";

const RATE_SCALE_BASE = BigDecimal.fromString("1000000000000000000000000000");
const WAD = BigDecimal.fromString("1000000000000000000");
const EPS = BigDecimal.fromString("0.000000001");

const MOD = BigDecimal.fromString("10000000");

const ONE = BigDecimal.fromString("1");
const TWO = BigDecimal.fromString("2");

function exp(x: BigDecimal): BigDecimal {
  let result = ONE;
  let term = ONE;

  const iters = BigDecimal.fromString("20");
  for (let i = ONE; i.lt(iters); i = i.plus(ONE)) {
    term = term.times(x).div(i);
    result = result.plus(term);
    if (term.lt(EPS)) break;
  }

  return result;
}

function ln(x: BigDecimal): BigDecimal {
  if (x.le(BigDecimal.zero()))
    throw new Error("ln(x) is only defined for x > 0");

  let y = x.minus(ONE).div(x.plus(ONE));
  let y2 = y.times(y);
  let result = BigDecimal.zero();
  let term = y;

  const iters = BigDecimal.fromString("50");
  for (let i = ONE; i.lt(iters); i = i.plus(TWO)) {
    result = result.plus(term.div(i));
    term = term.times(y2);
    if (term.lt(EPS)) break;
  }

  return result.times(TWO);
}

export function calculateAUMRate(secondsPerYear: BigDecimal, AUMDilutionPerSecond: BigDecimal): BigDecimal {
  const x = AUMDilutionPerSecond.div(RATE_SCALE_BASE);

  const res = exp(ln(x).times(secondsPerYear)).minus(ONE);

  const resBigInt = BigInt.fromString(res.times(WAD).truncate(0).toString());
  const mod = resBigInt.mod(BigInt.fromString(MOD.toString()));

  if (mod.ge(BigInt.fromString(MOD.toString()).div(BigInt.fromI32(2)))) {
    return BigDecimal.fromString(
      resBigInt.plus(BigInt.fromString(MOD.toString())).toString(),
    )
      .div(WAD)
      .truncate(4);
  }

  return BigDecimal.fromString(resBigInt.toString()).div(WAD).truncate(4);
}

export function convertAUMFeeRate(index: Bytes, aumFee: BigInt): void {
  let indexEntity = createOrLoadIndexEntity(index);
  let scaledPerSecondRate = new BigDecimal(aumFee);

  const secondsPerYear = BigDecimal.fromString(indexEntity.version == "v2" ? "31556952" : "31536000");

  indexEntity.aumFee = calculateAUMRate(secondsPerYear, scaledPerSecondRate);
  indexEntity.save();
}

export function handleSetAUMScaledPerSecondsRate(
  event: SetAUMScaledPerSecondsRateEvent,
): void {
  convertAUMFeeRate(event.params.index, event.params.AUMScaledPerSecondsRate);
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBPEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.params.index);
  let scalar = new BigDecimal(BigInt.fromI32(10000));
  let fee = new BigDecimal(BigInt.fromI32(event.params.burningFeeInPB)).div(
    scalar,
  );
  indexEntity.redemptionFee = fee;
  indexEntity.save();
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBPEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.params.index);
  let scalar = new BigDecimal(BigInt.fromI32(10000));
  let fee = new BigDecimal(BigInt.fromI32(event.params.mintingFeeInBP)).div(
    scalar,
  );
  indexEntity.mintingFee = fee;
  indexEntity.save();
}
