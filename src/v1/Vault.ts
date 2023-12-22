import { Address, BigDecimal, BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts"
import {
  VTokenTransfer as VTokenTransferEvent, Vault
} from "../../generated/templates/Vault/Vault"
import { createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "../EntityCreation"
import { saveHistoricalData } from "../v2/ConfigBuilder"
import { getTokenInfoV1 } from "./IndexFactory"

export function handleVTokenTransfer(event: VTokenTransferEvent): void {
  let assetAddress = dataSource.context().getBytes('assetAddress')
  let indexAddress = dataSource.context().getBytes('indexAddress')
  let indexEntity = createOrLoadIndexEntity(indexAddress)
  let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetAddress, indexEntity.chainID)
  if (indexAssetEntity.decimals == 0) {
    getTokenInfoV1(indexAssetEntity,assetAddress)
  }
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexAssetEntity.decimals)))
  let vaultContract = Vault.bind(event.address)
  let assetBalance = new BigDecimal(vaultContract.lastAssetBalanceOf(Address.fromBytes(indexAddress)))
  indexAssetEntity.balance = assetBalance.div(scalar)
  indexAssetEntity.save()
  saveHistoricalData(indexAddress, event.block.timestamp)
}


