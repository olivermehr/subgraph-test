import { Address, BigDecimal, BigInt, Bytes, dataSource, log } from "@graphprotocol/graph-ts"
import {
  VTokenTransfer as VTokenTransferEvent, Vault
} from "../../generated/templates/Vault/Vault"
import { createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "../EntityCreation"
import { ERC20 } from "../../generated/IndexFactoryV1/ERC20"
import { saveHistoricalData } from "../v2/ConfigBuilder"
import { MakerERC20 } from "../../generated/IndexFactoryV1/MakerERC20"

export function handleVTokenTransfer(event: VTokenTransferEvent): void {
  let assetAddress = dataSource.context().getBytes('assetAddress')
  let indexAddress = dataSource.context().getBytes('indexAddress')
  let indexEntity = createOrLoadIndexEntity(indexAddress)
  let indexAssetEntity = createOrLoadIndexAssetEntity(indexAddress, assetAddress, indexEntity.chainID)
  if (indexAssetEntity.decimals == 0) {
    let tokenContract = ERC20.bind(Address.fromBytes(assetAddress))
    let tokenName = tokenContract.try_name()
    if (tokenName.reverted) {
      let makerTokenName = MakerERC20.bind(Address.fromBytes(assetAddress)).name().toString()
      indexAssetEntity.name = makerTokenName
    }
    else {
      indexAssetEntity.name = tokenName.value
    }
    let tokenSymbol = tokenContract.try_symbol()
    if (tokenSymbol.reverted) {
      let makerTokenSymbol = MakerERC20.bind(Address.fromBytes(assetAddress)).symbol().toString()
      indexAssetEntity.symbol = makerTokenSymbol
    }
    else {
      indexAssetEntity.symbol = tokenSymbol.value
    }
    indexAssetEntity.decimals = tokenContract.decimals()
    indexAssetEntity.save()
  }
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexAssetEntity.decimals)))
  let vaultContract = Vault.bind(event.address)
  let assetBalance = new BigDecimal(vaultContract.lastAssetBalanceOf(Address.fromBytes(indexAddress)))
  indexAssetEntity.balance = assetBalance.div(scalar)
  indexAssetEntity.save()
  saveHistoricalData(indexAddress, event.block.timestamp)
}


