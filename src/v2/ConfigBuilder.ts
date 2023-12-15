import { Bytes, BigInt, Address, ethereum, DataSourceContext, dataSource, BigDecimal, log } from "@graphprotocol/graph-ts";
import {createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "../EntityCreation";
import { ConfigUpdated as ConfigUpdatedEvent, CurrencyRegistered as CurrencyRegisteredEvent } from "../../generated/templates/ConfigBuilder/ConfigBuilder"
import { convertAUMFeeRate } from "../v1/FeePool";

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

// export function handleRebalancingCompletion(event: FinishRebalancingEvent): void {}