import { Address, BigDecimal, BigInt, ByteArray, Bytes, dataSource } from "@graphprotocol/graph-ts"
import {
  AssetRemoved as AssetRemovedEvent,
  Transfer as TransferEvent,
  UpdateAnatomy as UpdateAnatomyEvent
} from "../generated/templates/indexToken/indexToken"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalances, createOrLoadAssetEntity } from "./entityCreation"

export function handleTransfer(event: TransferEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let scalar = 10 ** dataSource.context().getI32('decimals')
  if (event.params.from != Address.fromString('0x0000000000000000000000000000000000000000')) {
    let fromAccount = createOrLoadIndexAccountEntity(event.address, event.params.from)
    fromAccount.balance = fromAccount.balance.minus(event.params.value.div(BigInt.fromI32(scalar)).toBigDecimal())
    if (fromAccount.balance == BigDecimal.zero()) {
      index.holders = index.holders.minus(BigInt.fromI32(1))
    }
    fromAccount.save()

    let historicalAccountBalancesEntity = createOrLoadHistoricalAccountBalances(event.address, event.params.from, event)
    historicalAccountBalancesEntity.balance = fromAccount.balance
    historicalAccountBalancesEntity.save()
  }
  if (event.params.to != Address.fromString('0x0000000000000000000000000000000000000000')) {
    let toAccount = createOrLoadIndexAccountEntity(event.address, event.params.to)
    if (toAccount.balance == BigDecimal.zero()) {
      index.holders = index.holders.plus(BigInt.fromI32(1))
    }
    toAccount.balance = toAccount.balance.plus(event.params.value.div(BigInt.fromI32(scalar)).toBigDecimal())
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
  let idx = assets.indexOf(indexAssetEntity.id)
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
  let idx = assets.indexOf(indexAssetEntity.id)
  if (idx == -1) {
    assets.push(indexAssetEntity.id)
  }
  indexAssetEntity.weight = event.params.weight
  index.assets = assets
  indexAssetEntity.save()
  index.save()
}
