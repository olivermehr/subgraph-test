import { Bytes, BigInt, Address, ethereum, DataSourceContext, dataSource, BigDecimal, log } from "@graphprotocol/graph-ts";
import {createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "../EntityCreation";
import { ConfigUpdated as ConfigUpdatedEvent, CurrencyRegistered as CurrencyRegisteredEvent } from "../../generated/templates/ConfigBuilder/ConfigBuilder"


export function handleConfigUpdate(event: ConfigUpdatedEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let indexEntity = createOrLoadIndexEntity(indexAddress)
    let decoded = ethereum.decode('((uint256,bool,address),(uint16,bool),(address,uint16,bool))', event.params.param0)?.toTuple()
    if (decoded != null) {
        log.debug("Decoded message: {}", [decoded.toString()])
        let aumFee = decoded[0].toTuple()[0].toArray()[0].toBigInt()
        convertAUMFeeRate(indexAddress, aumFee)
        let scalar = new BigDecimal(BigInt.fromI32(10000))
        let mintingFee = new BigDecimal(decoded[1].toTuple()[0].toArray()[0].toBigInt()).div(scalar)
        let redemptionFee = new BigDecimal(decoded[2].toTuple()[0].toArray()[1].toBigInt()).div(scalar)
        indexEntity.mintingFee = mintingFee
        indexEntity.redemptionFee = redemptionFee
        indexEntity.save()
    }
    else {
        log.debug("Config was not successfully decoded.", [])
    }
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


export function handleCurrencyRegistered(event: CurrencyRegisteredEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress,event.params.currency)
    indexAssetEntity.chainID = event.params.chainId
    indexAssetEntity.name = event.params.name
    indexAssetEntity.symbol = event.params.symbol
    indexAssetEntity.decimals = event.params.decimals
    indexAssetEntity.currencyID = event.params.currencyId
    indexAssetEntity.save()
}

export function handleRebalancingCompletion(event: FinishRebalancingEvent): void {

}