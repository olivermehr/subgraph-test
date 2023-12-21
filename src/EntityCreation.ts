import { Bytes, BigInt, BigDecimal, log, Address, ethereum } from "@graphprotocol/graph-ts"
import { Index, Account, IndexAsset, IndexAccount, HistoricalAccountBalance, HistoricalIndexBalance, HistoricalPrice, HistoricalIndexAsset, ChainIDToAssetMapping } from "../generated/schema"

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
    let id = index.toString().concat(chainID.toString()).concat(asset.toString())
    let indexAsset = IndexAsset.loadInBlock(id)
    if (indexAsset == null) {
        indexAsset = IndexAsset.load(id)
        if (indexAsset == null) {
            indexAsset = new IndexAsset(id)
            indexAsset.index = index
            indexAsset.asset = asset
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

export function loadIndexAssetEntity(id: string): IndexAsset {
    let indexAsset = IndexAsset.loadInBlock(id)
    if (indexAsset == null) {
        indexAsset = IndexAsset.load(id)
        if (indexAsset == null) {
            log.debug("Should never enter this logic block of loadIndexAssetEntity function", [])
            indexAsset = new IndexAsset(id)
            indexAsset.index = Bytes.fromHexString('0x')
            indexAsset.asset = Bytes.fromHexString('0x')
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
            historicalIndexBalanceEntity.save()
        }
    }
    return historicalIndexBalanceEntity
}

export function createOrLoadHistoricalAccountBalanceEntity(index: Bytes, account: Bytes, event: ethereum.Event): HistoricalAccountBalance {
    let timestamp = event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(86400)))
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
    let id = index.toString().concat(chainID.toString())
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
            chainIDToAssetMappingEntity.index = Bytes.fromHexString("0x")
            chainIDToAssetMappingEntity.chainID = BigInt.zero()
            chainIDToAssetMappingEntity.assets = []
            chainIDToAssetMappingEntity.save()
        }
    }
    return chainIDToAssetMappingEntity

}