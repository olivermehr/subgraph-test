import { Address, BigDecimal, BigInt, Bytes, dataSource, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  FCashMinted as FCashMintedEvent,
  Upgraded as UpgradedEvent,
  Withdraw as WithdrawEvent,
  SavingsVault
} from "../../generated/USVVault/SavingsVault"
import { createOrLoadHistoricalPriceEntity, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, createOrLoadChainIDToAssetMappingEntity, loadChainIDToAssetMappingEntity, loadIndexAssetEntity } from "../EntityCreation"
import { ChainlinkFeedRegistry } from "../../generated/USVVault/ChainlinkFeedRegistry"
export { handleTransfer } from "./IndexToken"
import { convertAUMFeeRate } from "./FeePool"
import { SavingsVaultViews } from "../../generated/USVVault/SavingsVaultViews"
import { saveHistoricalData } from "../v2/ConfigBuilder"

export function handleDeposit(event: DepositEvent): void {
  updateBalances(event.address, event.block.timestamp)
}

export function handleUpgraded(event: UpgradedEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.address)
  let usvContract = SavingsVault.bind(event.address)
  let name = usvContract.name()
  let symbol = usvContract.symbol()
  indexEntity.decimals = usvContract.decimals()
  indexEntity.name = name
  indexEntity.symbol = symbol
  indexEntity.mintingFee = new BigDecimal(usvContract.MINTING_FEE_IN_BP()).div(new BigDecimal(BigInt.fromI32(10000)))
  indexEntity.redemptionFee = new BigDecimal(usvContract.BURNING_FEE_IN_BP()).div(new BigDecimal(BigInt.fromI32(10000)))
  let aumFee = usvContract.AUM_SCALED_PER_SECONDS_RATE()
  convertAUMFeeRate(event.address, aumFee)
  let vaultAsset = usvContract.asset()
  let chainID = dataSource.context().getBigInt('chainID')
  let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(event.address, chainID)
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset, chainID)
  indexAssetEntity.weight = BigInt.fromI32(255)
  indexAssetEntity.save()

  if (chainIDToAssetMappingEntity.assets.indexOf(indexAssetEntity.id) == -1) {
    let assetArray = [indexAssetEntity.id]
    chainIDToAssetMappingEntity.assets = assetArray
  }
  chainIDToAssetMappingEntity.save()
  indexEntity.assets = [chainIDToAssetMappingEntity.id]
  indexEntity.save()

}

export function handleWithdraw(event: WithdrawEvent): void {
  updateBalances(event.address, event.block.timestamp)
}

export function handleFCashMinted(event: FCashMintedEvent): void {
  updateBalances(event.address, event.block.timestamp)

}

export function updateBalances(index: Bytes, timestamp: BigInt): void {
  let vaultContract = SavingsVault.bind(Address.fromBytes(index))
  let indexEntity = createOrLoadIndexEntity(index)
  let vaultAsset = dataSource.context().getBytes('vaultAsset')
  let totalAssets = new BigDecimal(vaultContract.totalAssets())
  if (totalAssets != BigDecimal.zero()) {
    let indexAssetEntity = createOrLoadIndexAssetEntity(index, vaultAsset, indexEntity.chainID)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexAssetEntity.decimals)))
    indexAssetEntity.balance = totalAssets.div(scalar)
    indexAssetEntity.save()
    saveHistoricalData(index, timestamp)
  }
}

export function SavingsVaultBlockHandler(block: ethereum.Block): void {
  log.debug('Block handler being called at {}', [block.number.toString()])
  let vaultAddress = dataSource.address()
  let vaultAsset = dataSource.context().getBytes("vaultAsset")
  let usdDenom = '0x0000000000000000000000000000000000000348'
  let chainlinkFeedRegistryAddress = dataSource.context().getBytes("chainlinkFeedRegistryAddress")
  let usvViewAddress = dataSource.context().getBytes("usvViewAddress")
  let vaultContract = SavingsVault.bind(vaultAddress)
  updateBalances(vaultAddress, block.timestamp)
  let totalSupply = new BigDecimal(vaultContract.totalSupply())
  let indexEntity = createOrLoadIndexEntity(vaultAddress)
  if (totalSupply > BigDecimal.zero()) {
    let totalAssets = loadIndexAssetEntity(loadChainIDToAssetMappingEntity(indexEntity.assets[0]).assets[0]).balance
    let historicalPriceEntity = createOrLoadHistoricalPriceEntity(vaultAddress, block.timestamp)
    let usdcPrice = new BigDecimal(ChainlinkFeedRegistry.bind(Address.fromBytes(chainlinkFeedRegistryAddress)).latestAnswer(Address.fromBytes(vaultAsset), Address.fromString(usdDenom)))
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(8))
    usdcPrice = usdcPrice.div(scalar)
    historicalPriceEntity.price = totalAssets.div(totalSupply).times(usdcPrice)
    let usvViewsContract = SavingsVaultViews.bind(Address.fromBytes(usvViewAddress))
    let apyCall = usvViewsContract.try_getAPY(vaultAddress)
    if (!apyCall.reverted && apyCall.value != BigInt.zero()) {
      let scalar = new BigDecimal(BigInt.fromI32(10).pow(9))
      let apy = new BigDecimal(apyCall.value).div(scalar)
      historicalPriceEntity.apy = apy
    }
    else {
      let apy = BigDecimal.fromString("0.031864313")
      historicalPriceEntity.apy = apy
    }
    historicalPriceEntity.save()
  }
}
