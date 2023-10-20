import { Address, BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts"
import {
  VTokenTransfer as VTokenTransferEvent
} from "../generated/templates/vault/vault"
import { createOrLoadHistoricalIndexBalances, createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "./entityCreation"

export function handleVTokenTransfer(event: VTokenTransferEvent): void {
  let assetAddress = dataSource.context().getBytes('assetAddress')
  let indexAddress = dataSource.context().getBytes('indexAddress')
  let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetAddress)
  if (event.params.from == Address.fromString('0x0000000000000000000000000000000000000000') && event.params.to != Address.fromString('0x0000000000000000000000000000000000000000')) {
    indexAssetEntity.balance = indexAssetEntity.balance.plus(event.params.amount)
  }
  else if (event.params.from != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.to == Address.fromString('0x0000000000000000000000000000000000000000')) {
    indexAssetEntity.balance = indexAssetEntity.balance.minus(event.params.amount)
  }
  indexAssetEntity.save()

  let historicalIndexBalancesEntity = createOrLoadHistoricalIndexBalances(indexAddress, event)
  let indexEntity = createOrLoadIndexEntity(indexAddress)
  historicalIndexBalancesEntity.assets = indexEntity.assets
  historicalIndexBalancesEntity.save()


}


