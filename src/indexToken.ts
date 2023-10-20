import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts"
import {
  AssetRemoved as AssetRemovedEvent,
  Transfer as TransferEvent,
  UpdateAnatomy as UpdateAnatomyEvent
} from "../generated/templates/indexToken/indexToken"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalances, createOrLoadAssetEntity } from "./entityCreation"

export function handleTransfer(event: TransferEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  if (event.params.from != Address.fromString('0x0000000000000000000000000000000000000000')) {
    let fromAccount = createOrLoadIndexAccountEntity(event.address, event.params.from)
    fromAccount.balance = fromAccount.balance.minus(event.params.value)
    if (fromAccount.balance == BigInt.fromI32(0)) {
      index.holders = index.holders.minus(BigInt.fromI32(1))
    }
    fromAccount.save()

    let historicalAccountBalancesEntity = createOrLoadHistoricalAccountBalances(event.address, event.params.from, event)
    historicalAccountBalancesEntity.balance = fromAccount.balance
    historicalAccountBalancesEntity.save()
  }
  if (event.params.to != Address.fromString('0x0000000000000000000000000000000000000000')) {
    let toAccount = createOrLoadIndexAccountEntity(event.address, event.params.to)
    if (toAccount.balance == BigInt.fromI32(0)) {
      index.holders = index.holders.plus(BigInt.fromI32(1))
    }
    toAccount.balance = toAccount.balance.plus(event.params.value)
    toAccount.save()

    let historicalAccountBalancesEntity = createOrLoadHistoricalAccountBalances(event.address, event.params.to, event)
    historicalAccountBalancesEntity.balance = toAccount.balance
    historicalAccountBalancesEntity.save()
  }
  index.save()
}

export function handleAssetRemoved(event: AssetRemovedEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, event.params.asset)
  let assets = index.assets
  let idx = assets.indexOf(event.params.asset)
  assets.splice(idx, 1)
  index.assets = assets
  indexAssetEntity.weight = 0
  indexAssetEntity.save()
  index.save()
}

export function handleUpdateAnatomy(event: UpdateAnatomyEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  createOrLoadAssetEntity(event.params.asset)
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, event.params.asset)
  let assets = index.assets
  let idx = assets.indexOf(event.params.asset)
  if (idx == -1) {
    assets.push(indexAssetEntity.id)
  }
  indexAssetEntity.weight = event.params.weight
  index.assets = assets
  indexAssetEntity.save()
  index.save()
}
