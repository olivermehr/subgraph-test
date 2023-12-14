import { Address, BigDecimal, BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts"
import {
  VTokenTransfer as VTokenTransferEvent, Vault
} from "../../generated/templates/Vault/Vault"
import { createOrLoadHistoricalIndexAsset, createOrLoadHistoricalIndexBalance, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, loadIndexAssetEntity } from "../EntityCreation"
import { ERC20 } from "../../generated/IndexFactoryV1/ERC20"

export function handleVTokenTransfer(event: VTokenTransferEvent): void {
  let assetAddress = dataSource.context().getBytes('assetAddress')
  let indexAddress = dataSource.context().getBytes('indexAddress')
  let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetAddress)
  let tokenContract = ERC20.bind(assetAddress)
  let decimals = tokenContract.decimals()
  indexAssetEntity.name = tokenContract.name()
  indexAssetEntity.symbol = tokenContract.symbol()
  indexAssetEntity.decimals = decimals


  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(decimals)))
  let vaultContract = Vault.bind(event.address)
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


