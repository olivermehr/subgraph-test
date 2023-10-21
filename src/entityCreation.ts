import { Bytes, BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import { Index, Account, IndexAsset, IndexAccount, Asset, HistoricalAccountBalances, HistoricalIndexBalances } from "../generated/schema"
import { VTokenTransfer as VTokenTransferEvent } from "../generated/templates/vault/vault"
import { Transfer as TransferEvent } from "../generated/templates/indexToken/indexToken"

export function createOrLoadIndexEntity(id: Bytes): Index {
    let index = Index.loadInBlock(id)
    if (index == null) {
        index = Index.load(id)
        if (index == null) {
            index = new Index(id)
            index.mintingFee = BigDecimal.zero()
            index.redemptionFee = BigDecimal.zero()
            index.aumFee = BigDecimal.zero()
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

export function createOrLoadIndexAssetEntity(index: Bytes, asset: Bytes): IndexAsset {
    let id = index.concat(asset)
    let indexAsset = IndexAsset.loadInBlock(id)
    if (indexAsset == null) {
        indexAsset = IndexAsset.load(id)
        if (indexAsset == null) {
            indexAsset = new IndexAsset(id)
            indexAsset.index = index
            indexAsset.asset = asset
            indexAsset.balance = BigDecimal.zero()
            indexAsset.weight = 0
            indexAsset.save()
        }
    }
    return indexAsset
}

export function createOrLoadHistoricalIndexBalances(index: Bytes, event: VTokenTransferEvent): HistoricalIndexBalances {
    let timestamp = event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(timestamp.toString())
    let historicalIndexBalancesEntity = HistoricalIndexBalances.loadInBlock(id)
    if (historicalIndexBalancesEntity == null) {
        historicalIndexBalancesEntity = HistoricalIndexBalances.load(id)
        if (historicalIndexBalancesEntity == null) {
            historicalIndexBalancesEntity = new HistoricalIndexBalances(id)
            historicalIndexBalancesEntity.timestamp = timestamp
            historicalIndexBalancesEntity.index = index
            historicalIndexBalancesEntity.assets = []
            historicalIndexBalancesEntity.save()
        }
    }
    return historicalIndexBalancesEntity
}

export function createOrLoadAssetEntity(id: Bytes): Asset {
    let asset = Asset.loadInBlock(id)
    if (asset == null) {
        asset = Asset.load(id)
        if (asset == null) {
            asset = new Asset(id)
            asset.save()
        }
    }
    return asset
}

export function createOrLoadHistoricalAccountBalances(index : Bytes, account: Bytes, event: TransferEvent): HistoricalAccountBalances {
    let timestamp = event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(account.toHexString().concat(timestamp.toString()))
    let historicalAccountBalancesEntity = HistoricalAccountBalances.loadInBlock(id)
    if (historicalAccountBalancesEntity == null) {
        historicalAccountBalancesEntity = HistoricalAccountBalances.load(id)
        if (historicalAccountBalancesEntity == null) {
            historicalAccountBalancesEntity = new HistoricalAccountBalances(id)
            historicalAccountBalancesEntity.timestamp = timestamp
            historicalAccountBalancesEntity.index = index
            historicalAccountBalancesEntity.account = account
            historicalAccountBalancesEntity.balance = BigDecimal.zero()
            historicalAccountBalancesEntity.save()
        }
    }
    return historicalAccountBalancesEntity
}