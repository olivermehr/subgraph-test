import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  FCashMinted as FCashMintedEvent,
  Upgraded as UpgradedEvent,
  Withdraw as WithdrawEvent,
  usvVault
} from "../generated/usvVault/usvVault"
import { createOrLoadAssetEntity, createOrLoadHistoricalIndexBalance, createOrLoadHistoricalPrice, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, createOrLoadHistoricalIndexAsset, loadIndexAssetEntity } from "./entityCreation"
import { IndexAsset } from "../generated/schema"
export { handleTransfer } from "./indexToken"

export function handleDeposit(event: DepositEvent): void {
  updateBalances(event)
}

export function handleUpgraded(event: UpgradedEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.address)
  let usvContract = usvVault.bind(event.address)
  indexEntity.decimals = usvContract.decimals()
  indexEntity.mintingFee = new BigDecimal(usvContract.MINTING_FEE_IN_BP()).div(new BigDecimal(BigInt.fromI32(10000)))
  indexEntity.redemptionFee = new BigDecimal(usvContract.BURNING_FEE_IN_BP()).div(new BigDecimal(BigInt.fromI32(10000)))

  let vaultAsset = usvContract.asset()
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset)
  indexAssetEntity.weight = 255
  indexAssetEntity.save()

  if (indexEntity.assets.indexOf(indexAssetEntity.id) == -1) {
    let assetArray = [indexAssetEntity.id]
    indexEntity.assets = assetArray
  }
  createOrLoadAssetEntity(vaultAsset)

  indexEntity.save()

}

export function handleWithdraw(event: WithdrawEvent): void {
  updateBalances(event)
}

export function handleFCashMinted(event: FCashMintedEvent): void {
  updateBalances(event)

}

export function updateBalances(event: ethereum.Event): void {
  let vaultContract = usvVault.bind(event.address)
  let vaultAsset = vaultContract.asset()
  let totalAssets = vaultContract.totalAssets()
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(vaultAsset).decimals)))
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset)
  indexAssetEntity.balance = new BigDecimal(totalAssets).div(scalar)
  indexAssetEntity.save()

  createOrLoadHistoricalIndexBalance(event.address, event)
  let indexEntity = createOrLoadIndexEntity(event.address)
  for (let i = 0; i < indexEntity.assets.length; i++) {
    let tempIndexAssetEntity = loadIndexAssetEntity(indexEntity.assets[i])
    let historicalIndexAssetEntity = createOrLoadHistoricalIndexAsset(event.address, tempIndexAssetEntity.asset, event)
    historicalIndexAssetEntity.balance = tempIndexAssetEntity.balance
    historicalIndexAssetEntity.weight = tempIndexAssetEntity.weight
    historicalIndexAssetEntity.save()

  }
}

export function usvBlockHandler(block: ethereum.Block): void {
  log.debug('Block handler being called at {}',[block.number.toString()])
  let vaultAddress = '0x6bAD6A9BcFdA3fd60Da6834aCe5F93B8cFed9598'
  let vaultContract = usvVault.bind(Address.fromString(vaultAddress))
  let totalAssetsCall = vaultContract.try_totalAssets()
  let totalAssetsValue = BigDecimal.zero()
  if(!totalAssetsCall.reverted){
    totalAssetsValue = new BigDecimal(totalAssetsCall.value.times(BigInt.fromI32(10).pow(12)))
  }
  let totalSupplyCall = vaultContract.try_totalSupply()
  let totalSupplyValue = BigDecimal.zero()
  if(!totalSupplyCall.reverted){
    totalSupplyValue = new BigDecimal(totalSupplyCall.value)
  }
  if(totalSupplyValue > BigDecimal.zero()){
    let historicalPriceEntity = createOrLoadHistoricalPrice(Bytes.fromHexString(vaultAddress), block)
    historicalPriceEntity.price = totalAssetsValue.div(totalSupplyValue)
    historicalPriceEntity.save()
  }
}
