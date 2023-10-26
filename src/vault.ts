import { Address, BigDecimal, BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts"
import {
  VTokenTransfer as VTokenTransferEvent, vault
} from "../generated/templates/vault/vault"
import { createOrLoadAssetEntity, createOrLoadHistoricalIndexAsset, createOrLoadHistoricalIndexBalance, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, loadIndexAssetEntity } from "./entityCreation"

export function handleVTokenTransfer(event: VTokenTransferEvent): void {
  let assetAddress = dataSource.context().getBytes('assetAddress')
  let indexAddress = dataSource.context().getBytes('indexAddress')
  let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetAddress)
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(assetAddress).decimals)))
  let vaultContract = vault.bind(event.address)
  let assetBalance = new BigDecimal(vaultContract.lastAssetBalanceOf(Address.fromBytes(indexAddress)))
  indexAssetEntity.balance = assetBalance.div(scalar)
  indexAssetEntity.save()

  createOrLoadHistoricalIndexBalance(indexAddress, event)
  let indexEntity = createOrLoadIndexEntity(indexAddress)
  for (let i = 0; i < indexEntity.assets.length; i++){
    let tempIndexAssetEntity = loadIndexAssetEntity(indexEntity.assets[i])
    let historicalIndexAssetEntity = createOrLoadHistoricalIndexAsset(indexAddress, tempIndexAssetEntity.asset, event)
    historicalIndexAssetEntity.balance = tempIndexAssetEntity.balance
    historicalIndexAssetEntity.weight = tempIndexAssetEntity.weight
    historicalIndexAssetEntity.save()
  } 
}


