import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  AssetRemoved as AssetRemovedEvent,
  Transfer as TransferEvent,
  UpdateAnatomy as UpdateAnatomyEvent
} from "../../generated/templates/IndexTokenV1/IndexTokenV1"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalanceEntity, createOrLoadAccountEntity, createOrLoadChainIDToAssetMappingEntity } from "../EntityCreation"
import { ERC20 } from "../../generated/IndexFactoryV1/ERC20"
import { MakerERC20 } from "../../generated/IndexFactoryV1/MakerERC20"


export function handleTransfer(event: TransferEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(index.decimals)))
  if (event.params.from != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
    let fromAccount = createOrLoadIndexAccountEntity(event.address, event.params.from)
    createOrLoadAccountEntity(event.params.from)
    fromAccount.balance = fromAccount.balance.minus(new BigDecimal(event.params.value).div(scalar))
    if (fromAccount.balance == BigDecimal.zero()) {
      index.holders = index.holders.minus(BigInt.fromI32(1))
    }
    fromAccount.save()
    let historicalAccountBalanceEntity = createOrLoadHistoricalAccountBalanceEntity(event.address, event.params.from, event)
    historicalAccountBalanceEntity.balance = fromAccount.balance
    historicalAccountBalanceEntity.save()
  }
  if (event.params.from == Address.fromString('0x0000000000000000000000000000000000000000') && event.params.to != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
    index.totalSupply = index.totalSupply.plus(new BigDecimal(event.params.value).div(scalar))
  }
  if (event.params.to != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
    let toAccount = createOrLoadIndexAccountEntity(event.address, event.params.to)
    createOrLoadAccountEntity(event.params.to)
    if (toAccount.balance == BigDecimal.zero()) {
      index.holders = index.holders.plus(BigInt.fromI32(1))
    }
    toAccount.balance = toAccount.balance.plus(new BigDecimal(event.params.value).div(scalar))
    toAccount.save()

    let historicalAccountBalanceEntity = createOrLoadHistoricalAccountBalanceEntity(event.address, event.params.to, event)
    historicalAccountBalanceEntity.balance = toAccount.balance
    historicalAccountBalanceEntity.save()
  }
  if (event.params.to == Address.fromString('0x0000000000000000000000000000000000000000') && event.params.from != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
    index.totalSupply = index.totalSupply.minus(new BigDecimal(event.params.value).div(scalar))
  }

  index.save()
}

export function handleAssetRemoved(event: AssetRemovedEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(event.address, index.chainID)
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, event.params.asset, index.chainID)
  let assets = chainIDToAssetMappingEntity.assets
  let idx = assets.indexOf(indexAssetEntity.id)
  assets.splice(idx, 1)
  chainIDToAssetMappingEntity.assets = assets
  indexAssetEntity.weight = BigInt.fromI32(0)
  indexAssetEntity.save()
  chainIDToAssetMappingEntity.save()
}

export function handleUpdateAnatomy(event: UpdateAnatomyEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(event.address, index.chainID)
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, event.params.asset, index.chainID)
  if (indexAssetEntity.decimals == 0) {
    let tokenContract = ERC20.bind(event.params.asset)
    let tokenName = tokenContract.try_name()
      if (tokenName.reverted) {
        let makerTokenName = MakerERC20.bind(event.params.asset).name().toString()
        indexAssetEntity.name = makerTokenName
      }
      else {
        indexAssetEntity.name = tokenName.value
      }
      let tokenSymbol = tokenContract.try_symbol()
      if (tokenSymbol.reverted) {
        let makerTokenSymbol = MakerERC20.bind(event.params.asset).symbol().toString()
        indexAssetEntity.symbol = makerTokenSymbol
      }
      else {
        indexAssetEntity.symbol = tokenSymbol.value
      }
    indexAssetEntity.decimals = tokenContract.decimals()
  }
  indexAssetEntity.weight = BigInt.fromI32(event.params.weight)
  let assets = chainIDToAssetMappingEntity.assets
  let idx = assets.indexOf(indexAssetEntity.id)
  if (idx == -1) {
    assets.push(indexAssetEntity.id)
  }
  chainIDToAssetMappingEntity.assets = assets
  indexAssetEntity.save()
  chainIDToAssetMappingEntity.save()
}
