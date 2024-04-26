import { Bytes, BigInt, BigDecimal, log, Address, ethereum } from "@graphprotocol/graph-ts"
import { Index, Account, IndexAsset, IndexAccount, HistoricalAccountBalance, HistoricalIndexBalance, HistoricalPrice, HistoricalIndexAsset, ChainIDToAssetMapping, Config, LZConfig, Anatomy, CurrencySet } from "../generated/schema"

export function createOrLoadIndexEntity(id: Bytes): Index {
    let index = Index.loadInBlock(id)
    if (index == null) {
        index = Index.load(id)
        if (index == null) {
            index = new Index(id)
            index.decimals = 0
            index.name = ""
            index.symbol = ""
            index.version = "Undefined"
            index.creationDate = BigInt.zero()
            index.chainID = BigInt.zero()
            index.mintingFee = BigDecimal.zero()
            index.redemptionFee = BigDecimal.zero()
            index.aumFee = BigDecimal.zero()
            index.totalSupply = BigDecimal.zero()
            index.holders = BigInt.zero()
            index.assets = []
            index.save()
        }
    }
    return index
}

export function createOrLoadAccountEntity(id: Bytes): Account {
    let account = Account.loadInBlock(id)
    if (account == null) {
        account = Account.load(id)
        if (account == null) {
            account = new Account(id)
            account.save()
        }
    }
    return account
}

export function createOrLoadIndexAccountEntity(index: Bytes, account: Bytes): IndexAccount {
    let id = index.concat(account)
    let indexAccount = IndexAccount.loadInBlock(id)
    if (indexAccount == null) {
        indexAccount = IndexAccount.load(id)
        if (indexAccount == null) {
            indexAccount = new IndexAccount(id)
            indexAccount.index = index
            indexAccount.account = account
            indexAccount.balance = BigDecimal.zero()
            indexAccount.save()
        }
    }
    return indexAccount
}

export function createOrLoadIndexAssetEntity(index: Bytes, asset: Bytes, chainID: BigInt): IndexAsset {
    let id = index.toHexString().concat(chainID.toString()).concat(asset.toHexString())
    let indexAsset = IndexAsset.loadInBlock(id)
    if (indexAsset == null) {
        indexAsset = IndexAsset.load(id)
        if (indexAsset == null) {
            indexAsset = new IndexAsset(id)
            indexAsset.index = index
            indexAsset.asset = asset
            indexAsset.chainID = chainID
            indexAsset.name = ""
            indexAsset.symbol = ""
            indexAsset.decimals = 0
            indexAsset.balance = BigDecimal.zero()
            indexAsset.save()
        }
    }
    return indexAsset
}

export function loadIndexAssetEntity(id: string): IndexAsset {
    let indexAsset = IndexAsset.loadInBlock(id)
    if (indexAsset == null) {
        indexAsset = IndexAsset.load(id)
        if (indexAsset == null) {
            log.debug("Should never enter this logic block of loadIndexAssetEntity function", [])
            indexAsset = new IndexAsset(id)
            indexAsset.index = Bytes.empty()
            indexAsset.asset = Bytes.empty()
            indexAsset.chainID = BigInt.zero()
            indexAsset.name = ""
            indexAsset.symbol = ""
            indexAsset.decimals = 0
            indexAsset.balance = BigDecimal.zero()
            indexAsset.save()
        }
    }
    return indexAsset

}


export function createOrLoadHistoricalIndexBalanceEntity(index: Bytes, blockTimestamp: BigInt): HistoricalIndexBalance {
    let timestamp = blockTimestamp.minus(blockTimestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(timestamp.toString())
    let historicalIndexBalanceEntity = HistoricalIndexBalance.loadInBlock(id)
    if (historicalIndexBalanceEntity == null) {
        historicalIndexBalanceEntity = HistoricalIndexBalance.load(id)
        if (historicalIndexBalanceEntity == null) {
            historicalIndexBalanceEntity = new HistoricalIndexBalance(id)
            historicalIndexBalanceEntity.timestamp = timestamp
            historicalIndexBalanceEntity.index = index
            historicalIndexBalanceEntity.totalSupply = BigDecimal.zero()
            historicalIndexBalanceEntity.assets = []
            historicalIndexBalanceEntity.save()
        }
    }
    return historicalIndexBalanceEntity
}

export function createOrLoadHistoricalAccountBalanceEntity(index: Bytes, account: Bytes, event: ethereum.Event): HistoricalAccountBalance {
    let timestamp = event.block.timestamp
    let id = index.toHexString().concat(account.toHexString()).concat(timestamp.toString())
    let historicalAccountBalanceEntity = HistoricalAccountBalance.loadInBlock(id)
    if (historicalAccountBalanceEntity == null) {
        historicalAccountBalanceEntity = HistoricalAccountBalance.load(id)
        if (historicalAccountBalanceEntity == null) {
            historicalAccountBalanceEntity = new HistoricalAccountBalance(id)
            historicalAccountBalanceEntity.timestamp = timestamp
            historicalAccountBalanceEntity.index = index
            historicalAccountBalanceEntity.account = account
            historicalAccountBalanceEntity.balance = BigDecimal.zero()
            historicalAccountBalanceEntity.save()
        }
    }
    return historicalAccountBalanceEntity
}

export function createOrLoadHistoricalPriceEntity(index: Bytes, blockTimestamp: BigInt): HistoricalPrice {
    let timestamp = blockTimestamp.minus(blockTimestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(timestamp.toString())
    let historicalPriceEntity = HistoricalPrice.loadInBlock(id)
    if (historicalPriceEntity == null) {
        historicalPriceEntity = HistoricalPrice.load(id)
        if (historicalPriceEntity == null) {
            historicalPriceEntity = new HistoricalPrice(id)
            historicalPriceEntity.index = index
            historicalPriceEntity.timestamp = timestamp
            historicalPriceEntity.price = BigDecimal.zero()
            historicalPriceEntity.apy = BigDecimal.zero()
            historicalPriceEntity.save()
        }
    }
    return historicalPriceEntity
}

export function createOrLoadHistoricalIndexAssetEntity(index: Bytes, asset: Bytes, chainID: BigInt, blockTimestamp: BigInt): HistoricalIndexAsset {
    let timestamp = blockTimestamp.minus(blockTimestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(chainID.toString()).concat(asset.toHexString()).concat(timestamp.toString())
    let historicalIndexAssetEntity = HistoricalIndexAsset.loadInBlock(id)
    if (historicalIndexAssetEntity == null) {
        historicalIndexAssetEntity = HistoricalIndexAsset.load(id)
        if (historicalIndexAssetEntity == null) {
            historicalIndexAssetEntity = new HistoricalIndexAsset(id)
            historicalIndexAssetEntity.indexTimestamp = index.toHexString().concat(timestamp.toString())
            historicalIndexAssetEntity.index = index
            historicalIndexAssetEntity.asset = asset
            historicalIndexAssetEntity.chainID = chainID
            historicalIndexAssetEntity.timestamp = timestamp
            historicalIndexAssetEntity.balance = BigDecimal.zero()
            historicalIndexAssetEntity.save()
        }
    }
    return historicalIndexAssetEntity
}

export function createOrLoadChainIDToAssetMappingEntity(index: Bytes, chainID: BigInt): ChainIDToAssetMapping {
    let id = index.toHexString().concat(chainID.toString())
    let chainIDToAssetMappingEntity = ChainIDToAssetMapping.loadInBlock(id)
    if (chainIDToAssetMappingEntity == null) {
        chainIDToAssetMappingEntity = ChainIDToAssetMapping.load(id)
        if (chainIDToAssetMappingEntity == null) {
            chainIDToAssetMappingEntity = new ChainIDToAssetMapping(id)
            chainIDToAssetMappingEntity.index = index
            chainIDToAssetMappingEntity.chainID = chainID
            chainIDToAssetMappingEntity.assets = []
            chainIDToAssetMappingEntity.save()
        }
    }
    return chainIDToAssetMappingEntity

}

export function loadChainIDToAssetMappingEntity(id: string): ChainIDToAssetMapping {
    let chainIDToAssetMappingEntity = ChainIDToAssetMapping.loadInBlock(id)
    if (chainIDToAssetMappingEntity == null) {
        chainIDToAssetMappingEntity = ChainIDToAssetMapping.load(id)
        if (chainIDToAssetMappingEntity == null) {
            log.debug("Should never enter this logic block of loadChainIDToAssetMappingEntity function", [])
            chainIDToAssetMappingEntity = new ChainIDToAssetMapping(id)
            chainIDToAssetMappingEntity.index = Bytes.empty()
            chainIDToAssetMappingEntity.chainID = BigInt.zero()
            chainIDToAssetMappingEntity.assets = []
            chainIDToAssetMappingEntity.save()
        }
    }
    return chainIDToAssetMappingEntity

}

export function createOrLoadConfigEntity(index: Bytes): Config {
    let id = index
    let configEntity = Config.loadInBlock(id)
    if (configEntity == null) {
        configEntity = Config.load(id)
        if (configEntity == null) {
            configEntity = new Config(id)
            configEntity.index = index
            configEntity.AUMDilutionPerSecond = BigInt.zero()
            configEntity.useCustomAUMFee = false
            configEntity.metadata = Bytes.empty()
            configEntity.depositFeeInBP = BigInt.zero()
            configEntity.depositCustomCallback = false
            configEntity.redemptionFeeInBP = BigInt.zero()
            configEntity.redemptionCustomCallback = false
            configEntity.save()
        }
    }
    return configEntity

}


export function createOrLoadLZConfigEntity(index: Bytes): LZConfig {
    let id = index
    let configEntity = LZConfig.loadInBlock(id)
    if (configEntity == null) {
        configEntity = LZConfig.load(id)
        if (configEntity == null) {
            configEntity = new LZConfig(id)
            configEntity.index = index
            configEntity.eIds = BigInt.zero()
            configEntity.minGas = []
            configEntity.save()
        }
    }
    return configEntity

}

export function createOrLoadAnatomyEntity(index: Bytes): Anatomy {
    let id = index
    let anatomyEntity = Anatomy.loadInBlock(id)
    if (anatomyEntity == null) {
        anatomyEntity = Anatomy.load(id)
        if (anatomyEntity == null) {
            anatomyEntity = new Anatomy(id)
            anatomyEntity.index = index
            anatomyEntity.chainIdSet = []
            anatomyEntity.currencyIdSets = []
            anatomyEntity.save()
        }
    }
    return anatomyEntity

}

export function createOrLoadCurrencySetEntity(index: Bytes, chainIndex: BigInt): CurrencySet {
    let id = index.toHexString().concat(chainIndex.toString())
    let currencySetEntity = CurrencySet.loadInBlock(id)
    if (currencySetEntity == null) {
        currencySetEntity = CurrencySet.load(id)
        if (currencySetEntity == null) {
            currencySetEntity = new CurrencySet(id)
            currencySetEntity.index = index
            currencySetEntity.chainIndex = chainIndex
            currencySetEntity.sets = []
            currencySetEntity.save()
        }
    }
    return currencySetEntity

}

