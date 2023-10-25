import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  FCashMinted as FCashMintedEvent,
  Upgraded as UpgradedEvent,
  Withdraw as WithdrawEvent,
  usvVault
} from "../generated/usvVault/usvVault"
import { createOrLoadAssetEntity, createOrLoadHistoricalIndexBalance, createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "./entityCreation"
export { handleTransfer } from "./indexToken"

export function handleDeposit(event: DepositEvent): void {
  let vaultContract = usvVault.bind(event.address)
  let vaultAsset = vaultContract.asset()
  let totalAssets = vaultContract.totalAssets()
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(vaultAsset).decimals)))
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset)
  indexAssetEntity.balance = new BigDecimal(totalAssets).div(scalar)
  indexAssetEntity.save()

  let historicalIndexBalanceEntity = createOrLoadHistoricalIndexBalance(event.address, event)
  let indexEntity = createOrLoadIndexEntity(event.address)
  historicalIndexBalanceEntity.assets = indexEntity.assets
  historicalIndexBalanceEntity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.address)
  let usvContract = usvVault.bind(event.address)
  indexEntity.decimals = usvContract.decimals()
  indexEntity.mintingFee = new BigDecimal(usvContract.MINTING_FEE_IN_BP()).div(new BigDecimal(BigInt.fromI32(10000)))
  indexEntity.redemptionFee = new BigDecimal(usvContract.BURNING_FEE_IN_BP()).div(new BigDecimal(BigInt.fromI32(10000)))

  let vaultAsset = usvContract.asset()
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset)
  if (indexEntity.assets.indexOf(indexAssetEntity.id) == -1) {
    let assetArray = [indexAssetEntity.id]
    indexEntity.assets = assetArray
  }
  createOrLoadAssetEntity(vaultAsset)
  indexEntity.save()

}

export function handleWithdraw(event: WithdrawEvent): void {
  let vaultContract = usvVault.bind(event.address)
  let vaultAsset = vaultContract.asset()
  let totalAssets = vaultContract.totalAssets()
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(vaultAsset).decimals)))
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset)
  indexAssetEntity.balance = new BigDecimal(totalAssets).div(scalar)
  indexAssetEntity.save()

  let historicalIndexBalanceEntity = createOrLoadHistoricalIndexBalance(event.address, event)
  let indexEntity = createOrLoadIndexEntity(event.address)
  historicalIndexBalanceEntity.assets = indexEntity.assets
  historicalIndexBalanceEntity.save()
}

export function handleFCashMinted(event: FCashMintedEvent): void {
  let vaultContract = usvVault.bind(event.address)
  let vaultAsset = vaultContract.asset()
  let totalAssets = vaultContract.totalAssets()
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(vaultAsset).decimals)))
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset)
  indexAssetEntity.balance = new BigDecimal(totalAssets).div(scalar)
  indexAssetEntity.save()

  let historicalIndexBalanceEntity = createOrLoadHistoricalIndexBalance(event.address, event)
  let indexEntity = createOrLoadIndexEntity(event.address)
  historicalIndexBalanceEntity.assets = indexEntity.assets
  historicalIndexBalanceEntity.save()

}
