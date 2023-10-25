import { Bytes, BigInt, BigDecimal,log, Address, ethereum } from "@graphprotocol/graph-ts"
import { Index, Account, IndexAsset, IndexAccount, Asset, HistoricalAccountBalance, HistoricalIndexBalance } from "../generated/schema"
import { VTokenTransfer as VTokenTransferEvent } from "../generated/templates/vault/vault"
import { Transfer as TransferEvent } from "../generated/templates/indexToken/indexToken"
import { erc20 as erc20Contract}  from "../generated/indexFactory/erc20"

export function createOrLoadIndexEntity(id: Bytes): Index {
    let index = Index.loadInBlock(id)
    if (index == null) {
        index = Index.load(id)
        if (index == null) {
            index = new Index(id)
            index.decimals = 0
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

export function createOrLoadHistoricalIndexBalance(index: Bytes, event: ethereum.Event): HistoricalIndexBalance {
    let timestamp = event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(timestamp.toString())
    let historicalIndexBalanceEntity = HistoricalIndexBalance.loadInBlock(id)
    if (historicalIndexBalanceEntity == null) {
        historicalIndexBalanceEntity = HistoricalIndexBalance.load(id)
        if (historicalIndexBalanceEntity == null) {
            historicalIndexBalanceEntity = new HistoricalIndexBalance(id)
            historicalIndexBalanceEntity.timestamp = timestamp
            historicalIndexBalanceEntity.index = index
            historicalIndexBalanceEntity.assets = []
            historicalIndexBalanceEntity.save()
        }
    }
    return historicalIndexBalanceEntity
}

export function createOrLoadAssetEntity(id: Bytes): Asset {
    let asset = Asset.loadInBlock(id)
    if (asset == null) {
        asset = Asset.load(id)
        if (asset == null) {
            asset = new Asset(id)
            let callResult = erc20Contract.bind(Address.fromBytes(id)).try_decimals()
            if(callResult.reverted){
                asset.decimals = 18
                log.info("Get decimals reverted for {}",[id.toHexString()])
            }
            else{
                asset.decimals = callResult.value
            }
            asset.save()
        }
    }
    return asset
}

export function createOrLoadHistoricalAccountBalance(index : Bytes, account: Bytes, event: TransferEvent): HistoricalAccountBalance {
    let timestamp = event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(86400)))
    let id = index.toHexString().concat(account.toHexString().concat(timestamp.toString()))
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