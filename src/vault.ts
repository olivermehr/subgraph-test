import { Address, BigDecimal, BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts"
import {
  VTokenTransfer as VTokenTransferEvent, vault
} from "../generated/templates/vault/vault"
import { createOrLoadAssetEntity, createOrLoadHistoricalIndexBalance, createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "./entityCreation"

export function handleVTokenTransfer(event: VTokenTransferEvent): void {
  let assetAddress = dataSource.context().getBytes('assetAddress')
  let indexAddress = dataSource.context().getBytes('indexAddress')
  let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetAddress)
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(assetAddress).decimals)))
  let vaultContract = vault.bind(event.address)
  let indexBalance = vaultContract.lastAssetBalanceOf(Address.fromBytes(indexAddress))

  indexAssetEntity.balance = new BigDecimal(indexBalance).div(scalar)
  indexAssetEntity.save()

  let historicalIndexBalanceEntity = createOrLoadHistoricalIndexBalance(indexAddress, event)
  let indexEntity = createOrLoadIndexEntity(indexAddress)
  historicalIndexBalanceEntity.assets = indexEntity.assets
  historicalIndexBalanceEntity.save()


}


