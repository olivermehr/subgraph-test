import { Bytes, BigInt, Address, ethereum, dataSource, BigDecimal, log } from "@graphprotocol/graph-ts";
import { createOrLoadChainIDToAssetMappingEntity, createOrLoadHistoricalIndexAssetEntity, createOrLoadHistoricalIndexBalanceEntity, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, loadChainIDToAssetMappingEntity, loadIndexAssetEntity } from "../EntityCreation";
import { ConfigUpdated as ConfigUpdatedEvent, CurrencyRegistered as CurrencyRegisteredEvent, FinishChainRebalancing as FinishChainRebalancingEvent, RegisterChain as RegisterChainEvent } from "../../generated/templates/ConfigBuilder/ConfigBuilder"
import { convertAUMFeeRate } from "../v1/FeePool";

export function handleConfigUpdate(event: ConfigUpdatedEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let indexEntity = createOrLoadIndexEntity(indexAddress)
    let decoded = ethereum.decode('((uint256,bool,address),(uint16,bool),(address,uint16,bool))', event.params.param0)!.toTuple()
    let aumFee = decoded[0].toTuple()[0].toBigInt()
    convertAUMFeeRate(indexAddress, aumFee)
    let scalar = new BigDecimal(BigInt.fromI32(10000))
    let mintingFee = new BigDecimal(decoded[1].toTuple()[0].toBigInt()).div(scalar)
    let redemptionFee = new BigDecimal(decoded[2].toTuple()[1].toBigInt()).div(scalar)
    indexEntity.mintingFee = mintingFee
    indexEntity.redemptionFee = redemptionFee
    indexEntity.save()
}

export function handleCurrencyRegistered(event: CurrencyRegisteredEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, event.params.currency, event.params.chainId)
    indexAssetEntity.name = event.params.name
    indexAssetEntity.symbol = event.params.symbol
    indexAssetEntity.decimals = event.params.decimals
    indexAssetEntity.currencyID = event.params.currencyId
    indexAssetEntity.save()
}

export function handleFinishChainRebalancing(event: FinishChainRebalancingEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let indexEntity = createOrLoadIndexEntity(indexAddress)
    let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(indexAddress, event.params.chainId)
    if (event.params.currencies.length == 0) {
        for (let i = 0; i < chainIDToAssetMappingEntity.assets.length; i++) {
            let indexAssetEntity = loadIndexAssetEntity(chainIDToAssetMappingEntity.assets[i])
            indexAssetEntity.balance = BigDecimal.zero()
            indexAssetEntity.save()
        }
        let emptyAssetArray: string[] = []
        if (event.params.chainId == indexEntity.chainID) {
            emptyAssetArray.push(createOrLoadIndexAssetEntity(indexAddress, reserveAsset, indexEntity.chainID).id)
        }
        chainIDToAssetMappingEntity.assets = emptyAssetArray
        chainIDToAssetMappingEntity.save()

        if (event.params.chainId != indexEntity.chainID) {
            let indexAssets = indexEntity.assets
            let idx = indexAssets.indexOf(chainIDToAssetMappingEntity.id)
            indexAssets.splice(idx, 1)
            indexEntity.assets = indexAssets
            indexEntity.save()
        }

    } else {
        let chainIDAssetArray: string[] = []
        if (event.params.chainId == indexEntity.chainID) {
            let reserveAssetEntity = createOrLoadIndexAssetEntity(indexAddress, reserveAsset, indexEntity.chainID)
            reserveAssetEntity.balance = BigDecimal.zero()
            reserveAssetEntity.save()
            chainIDAssetArray.push(reserveAssetEntity.id)
        }
        for (let i = 0; i < event.params.currencies.length; i++) {
            let balance = new BigDecimal(event.params.currencies[i].rightShift(160))
            let asset = Address.fromBytes(Bytes.fromHexString(event.params.currencies[i].bitAnd(BigInt.fromI32(2).pow(160).minus(BigInt.fromI32(1))).toHexString()))
            log.debug("decoded asset = {}, decoded balance {}, chainID {}", [asset.toHexString(), balance.toString(), event.params.chainId.toString()])
            let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, asset, event.params.chainId)
            let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexAssetEntity.decimals)))
            indexAssetEntity.balance = balance.div(scalar)
            indexAssetEntity.save()
            chainIDAssetArray.push(indexAssetEntity.id)
        }
        for (let i = 0; i < chainIDToAssetMappingEntity.assets.length; i++) {
            let id = chainIDToAssetMappingEntity.assets[i]
            if (!chainIDAssetArray.includes(id)) {
                let indexAssetEntity = loadIndexAssetEntity(id)
                indexAssetEntity.balance = BigDecimal.zero()
                indexAssetEntity.save()
            }
        }
        chainIDToAssetMappingEntity.assets = chainIDAssetArray
        chainIDToAssetMappingEntity.save()

        if (!indexEntity.assets.includes(chainIDToAssetMappingEntity.id)) {
            let indexAssetArray = indexEntity.assets
            indexAssetArray.push(chainIDToAssetMappingEntity.id)
            indexEntity.assets = indexAssetArray
            indexEntity.save()
        }
    }
    saveHistoricalData(indexAddress, event.block.timestamp)
    indexEntity.k = BigInt.fromI32(1).times(BigInt.fromI32(10).pow(18))
    indexEntity.latestSnapshot = event.params.snapshot
    indexEntity.save()

}

export function handleRegisterChain(event: RegisterChainEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(indexAddress,event.params.chainId)
    chainIDToAssetMappingEntity.chainIndex = event.params.chainIndex
    chainIDToAssetMappingEntity.save()
    
}

export function saveHistoricalData(index: Bytes, timestamp: BigInt): void {
    let indexEntity = createOrLoadIndexEntity(index)
    createOrLoadHistoricalIndexBalanceEntity(index, timestamp)
    for (let i = 0; i < indexEntity.assets.length; i++) {
        let chainIDToAssetMappingEntity = loadChainIDToAssetMappingEntity(indexEntity.assets[i])
        let chainID = chainIDToAssetMappingEntity.chainID
        for (let y = 0; y < chainIDToAssetMappingEntity.assets.length; y++) {
            let indexAssetEntity = loadIndexAssetEntity(chainIDToAssetMappingEntity.assets[y])
            let historicalIndexAssetEntity = createOrLoadHistoricalIndexAssetEntity(index, indexAssetEntity.asset, chainID, timestamp)
            historicalIndexAssetEntity.balance = indexAssetEntity.balance
            if (indexAssetEntity.weight) {
                historicalIndexAssetEntity.weight = indexAssetEntity.weight
            }
            historicalIndexAssetEntity.save()
        }
    }
}