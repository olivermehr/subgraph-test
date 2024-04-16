import { Bytes, BigInt, Address, ethereum, dataSource, BigDecimal, log, ByteArray, TypedMap } from "@graphprotocol/graph-ts";
import { createOrLoadAnatomyEntity, createOrLoadChainIDToAssetMappingEntity, createOrLoadConfigEntity, createOrLoadHistoricalIndexAssetEntity, createOrLoadHistoricalIndexBalanceEntity, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, loadChainIDToAssetMappingEntity, loadIndexAssetEntity } from "../EntityCreation";
import { ConfigUpdated as ConfigUpdatedEvent, CurrencyRegistered as CurrencyRegisteredEvent, FinishChainRebalancing as FinishChainRebalancingEvent, RegisterChain as RegisterChainEvent, FinishRebalancing as FinishRebalancingEvent } from "../../generated/templates/ConfigBuilder/ConfigBuilder"
import { convertAUMFeeRate } from "../v1/FeePool";

export function handleConfigUpdate(event: ConfigUpdatedEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let indexEntity = createOrLoadIndexEntity(indexAddress)
    let configEntity = createOrLoadConfigEntity(indexAddress)
    let decoded = ethereum.decode('((uint256,bool,address),(uint16,bool),(uint16,bool))', event.params.param0)!.toTuple()
    configEntity.AUMDilutionPerSecond = decoded[0].toTuple()[0].toBigInt()
    configEntity.useCustomAUMFee = decoded[0].toTuple()[1].toBoolean()
    configEntity.metadata = decoded[0].toTuple()[2].toAddress()
    configEntity.depositFeeInBP = decoded[1].toTuple()[0].toBigInt()
    configEntity.depositCustomCallback = decoded[1].toTuple()[1].toBoolean()
    configEntity.redemptionFeeInBP = decoded[2].toTuple()[0].toBigInt()
    configEntity.redemptionCustomCallback = decoded[2].toTuple()[1].toBoolean()
    let aumFee = decoded[0].toTuple()[0].toBigInt()
    convertAUMFeeRate(indexAddress, aumFee)
    let scalar = new BigDecimal(BigInt.fromI32(10000))
    let mintingFee = new BigDecimal(decoded[1].toTuple()[0].toBigInt()).div(scalar)
    let redemptionFee = new BigDecimal(decoded[2].toTuple()[0].toBigInt()).div(scalar)
    indexEntity.mintingFee = mintingFee
    indexEntity.redemptionFee = redemptionFee
    indexEntity.save()
    configEntity.save()
}

export function handleCurrencyRegistered(event: CurrencyRegisteredEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    log.debug("Currency registered event: {} {} {} {} {}", [event.params.name, event.params.symbol, event.params.decimals.toString(), event.params.currency.toHexString(), event.params.chainId.toString()])
    let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, event.params.currency, event.params.chainId)
    let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(indexAddress, event.params.chainId)
    indexAssetEntity.name = event.params.name
    indexAssetEntity.symbol = event.params.symbol
    indexAssetEntity.decimals = event.params.decimals
    indexAssetEntity.currencyID = chainIDToAssetMappingEntity.registeredAssets

    chainIDToAssetMappingEntity.registeredAssets = chainIDToAssetMappingEntity.registeredAssets!.plus(BigInt.fromI32(1))

    chainIDToAssetMappingEntity.save()
    indexAssetEntity.save()
}

export function handleFinishChainRebalancing(event: FinishChainRebalancingEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let indexEntity = createOrLoadIndexEntity(indexAddress)
    let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(indexAddress, event.params.chainId)
    chainIDToAssetMappingEntity.latestSnapshot = event.params.snapshot
    if (event.params.currencies.length == 0) {
        for (let i = 0; i < chainIDToAssetMappingEntity.assets.length; i++) {
            let indexAssetEntity = loadIndexAssetEntity(chainIDToAssetMappingEntity.assets[i])
            indexAssetEntity.balance = BigDecimal.zero()
            indexAssetEntity.weight = BigInt.zero()
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
            let asset = event.params.currencies[i].bitAnd(BigInt.fromI32(2).pow(160).minus(BigInt.fromI32(1))).toHex()
            log.debug("{}", [asset])
            let assetConverted: Bytes
            log.debug("{} length = {}", [asset, asset.length.toString()])
            if (asset.length == 3) {
                assetConverted = Address.fromString("0x0000000000000000000000000000000000000000")
            }
            else {
                assetConverted = Address.fromHexString('0x'.concat("0".repeat(42 - asset.length)).concat(asset.slice(2)))
            }
            log.debug("decoded asset = {}, decoded balance {}, chainID {}", [assetConverted.toHexString(), balance.toString(), event.params.chainId.toString()])
            let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetConverted, event.params.chainId)
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
                indexAssetEntity.weight = BigInt.zero()
                indexAssetEntity.save()
            }
        }
        chainIDToAssetMappingEntity.assets = chainIDAssetArray


        if (!indexEntity.assets.includes(chainIDToAssetMappingEntity.id)) {
            let indexAssetArray = indexEntity.assets
            indexAssetArray.push(chainIDToAssetMappingEntity.id)
            indexEntity.assets = indexAssetArray
            indexEntity.save()
        }
    }
    saveHistoricalData(indexAddress, event.block.timestamp)
    indexEntity.k = BigInt.fromI32(1).times(BigInt.fromI32(10).pow(18))
    chainIDToAssetMappingEntity.save()
    indexEntity.save()

}

export function handleRegisterChain(event: RegisterChainEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(indexAddress, event.params.chainId)
    chainIDToAssetMappingEntity.chainIndex = event.params.chainIndex
    chainIDToAssetMappingEntity.latestSnapshot = BigInt.zero()
    chainIDToAssetMappingEntity.registeredAssets = BigInt.zero()
    chainIDToAssetMappingEntity.save()

}

export function saveHistoricalData(index: Bytes, timestamp: BigInt): void {
    let indexEntity = createOrLoadIndexEntity(index)
    let historicalIndexBalanceEntity = createOrLoadHistoricalIndexBalanceEntity(index, timestamp)
    historicalIndexBalanceEntity.totalSupply = indexEntity.totalSupply
    historicalIndexBalanceEntity.save()
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

export function handleFinishRebalancing(event: FinishRebalancingEvent): void {
    log.debug("weights {}", [event.params.weights.toString()])
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let indexEntity = createOrLoadIndexEntity(indexAddress)
    let chainIndexArray = convertBitSetToIDs(convertBigIntsToBitArray(event.params.newAnatomy.chainIdSet))
    log.debug(" chain index array {}", [chainIndexArray.toString()])
    let count = 0
    for (let i = 0; i < chainIndexArray.length; i++) {
        let currencyIndexArray = convertBitSetToIDs(convertBigIntsToBitArray(event.params.newAnatomy.currencyIdSets[i]))
        log.debug("Currency index array output {} for chain index {}", [currencyIndexArray.toString(), chainIndexArray[i].toString()])
        for (let y = 0; y < indexEntity.assets.length; y++) {
            let chainIDToAssetMappingEntity = loadChainIDToAssetMappingEntity(indexEntity.assets[y])
            let chainIndex = chainIDToAssetMappingEntity.chainIndex
            if (chainIndex && chainIndex == chainIndexArray[i]) {
                while (currencyIndexArray.length > 0) {
                    for (let x = 0; x < chainIDToAssetMappingEntity.assets.length; x++) {
                        let indexAssetEntity = loadIndexAssetEntity(chainIDToAssetMappingEntity.assets[x])
                        let currencyID = indexAssetEntity.currencyID
                        if (currencyIndexArray.length == 0) {
                            break
                        }
                        if (currencyID && currencyID == currencyIndexArray[0]) {
                            indexAssetEntity.weight = event.params.weights[count]
                            currencyIndexArray.splice(0, 1)
                            indexAssetEntity.save()
                            count++
                            log.debug("currency array length {}", [currencyIndexArray.length.toString()])
                            log.debug("count {}", [count.toString()])
                        }
                    }
                }
                break
            }
        }
    }
    let anatomyEntity = createOrLoadAnatomyEntity(indexAddress)
    anatomyEntity.chainIdSet = event.params.newAnatomy.chainIdSet
    anatomyEntity.currencyIdSets = event.params.newAnatomy.currencyIdSets
    anatomyEntity.save()
}

export function convertBitSetToIDs(array: BigInt[]): BigInt[] {
    let IDArray: BigInt[] = []
    for (let i = 0; i < array.length; i++) {
        if (array[i] == BigInt.fromI32(1)) {
            IDArray.push(BigInt.fromI32(i))
        }
    }
    return IDArray
}

export function convertBigIntsToBitArray(array: BigInt[]): BigInt[] {
    let expandedBitArray: BigInt[] = []
    for (let i = 0; i < array.length; i++) {
        let bitArray: BigInt[] = []
        let chainBitSet = array[i]
        while (chainBitSet > BigInt.zero()) {
            bitArray.push(chainBitSet.bitAnd(BigInt.fromI32(1)))
            chainBitSet = chainBitSet.rightShift(1)
        }
        expandedBitArray = expandedBitArray.concat(bitArray)
    }
    return expandedBitArray
}



export function selectNativeAsset(chainID: BigInt): Array<string> | null {
    let chainIDMap = new TypedMap<BigInt, Array<string>>()
    chainIDMap.set(BigInt.fromI32(43114), ["Avalanche", "AVAX", "18"])
    chainIDMap.set(BigInt.fromI32(43113), ["Avalanche", "AVAX", "18"])
    chainIDMap.set(BigInt.fromI32(80001), ["Matic", "MATIC", "18"])
    chainIDMap.set(BigInt.fromI32(137), ["Matic", "MATIC", "18"])
    chainIDMap.set(BigInt.fromI32(97), ["Binance Coin", "BNB", "18"])
    chainIDMap.set(BigInt.fromI32(56), ["Binance Coin", "BNB", "18"])
    chainIDMap.set(BigInt.fromI32(1), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(42161), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(10), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(8453), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(100), ["XDAI", "XDAI", "18"])
    chainIDMap.set(BigInt.fromI32(10200), ["XDAI", "XDAI", "18"])
    chainIDMap.set(BigInt.fromI32(5000), ["Mantle", "MNT", "18"])
    chainIDMap.set(BigInt.fromI32(250), ["Fantom", "FTM", "18"])
    chainIDMap.set(BigInt.fromI32(4002), ["Fantom", "FTM", "18"])
    chainIDMap.set(BigInt.fromI32(1088), ["Metis", "METIS", "18"])
    chainIDMap.set(BigInt.fromI32(59144), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(40), ["Telos", "TLOS", "18"])
    chainIDMap.set(BigInt.fromI32(1313161554), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(204), ["Binance Coin", "BNB", "18"])
    chainIDMap.set(BigInt.fromI32(41), ["Telos", "TLOS", "18"])
    chainIDMap.set(BigInt.fromI32(5003), ["Mantle", "MNT", "18"])
    chainIDMap.set(BigInt.fromI32(84532), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(421614), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(11155111), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(11155420), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(7700), ["Canto", "CANTO", "18"])
    chainIDMap.set(BigInt.fromI32(59140), ["Ethereum", "ETH", "18"])
    chainIDMap.set(BigInt.fromI32(5611), ["Binance Coin", "tBNB", "18"])

    let data = chainIDMap.get(chainID)

    if (data != null) {
        return data
    }
    else {
        return null
    }
}