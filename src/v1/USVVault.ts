import { Address, BigDecimal, BigInt, Bytes, dataSource, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  FCashMinted as FCashMintedEvent,
  Upgraded as UpgradedEvent,
  Withdraw as WithdrawEvent,
  SavingsVault
} from "../../generated/USVVault/SavingsVault"
import { createOrLoadHistoricalPriceEntity, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, createOrLoadChainIDToAssetMappingEntity } from "../EntityCreation"
import { ChainlinkFeedRegistry } from "../../generated/USVVault/ChainlinkFeedRegistry"
export { handleTransfer } from "./IndexToken"
import { convertAUMFeeRate } from "./FeePool"
import { SavingsVaultViews } from "../../generated/USVVault/SavingsVaultViews"
import { saveHistoricalData } from "../v2/ConfigBuilder"

export function handleDeposit(event: DepositEvent): void {
  updateBalances(event)
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
  indexAssetEntity.weight = 255
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
  updateBalances(event)
}

export function handleFCashMinted(event: FCashMintedEvent): void {
  updateBalances(event)

}

export function updateBalances(event: ethereum.Event): void {
  let vaultContract = SavingsVault.bind(event.address)
  let indexEntity = createOrLoadIndexEntity(event.address)
  let vaultAsset = dataSource.context().getBytes('vaultAsset')
  let totalAssets = vaultContract.totalAssets()
  let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, vaultAsset, indexEntity.chainID)
  let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexAssetEntity.decimals)))
  indexAssetEntity.balance = new BigDecimal(totalAssets).div(scalar)
  indexAssetEntity.save()
  saveHistoricalData(event.address, event)
}

export function usvBlockHandler(block: ethereum.Block): void {
  log.debug('Block handler being called at {}', [block.number.toString()])
  let vaultAddress = dataSource.address()
  let usdcAddress = dataSource.context().getBytes("vaultAsset")
  let usdDenom = '0x0000000000000000000000000000000000000348'
  let chainlinkFeedRegistryAddress = dataSource.context().getBytes("chainlinkFeedRegistryAddress")
  let usvViewAddress = dataSource.context().getBytes("usvViewAddress")
  let vaultContract = SavingsVault.bind(vaultAddress)
  let totalAssetsCall = vaultContract.try_totalAssets()
  let totalAssetsValue = BigDecimal.zero()
  if (!totalAssetsCall.reverted) {
    totalAssetsValue = new BigDecimal(totalAssetsCall.value.times(BigInt.fromI32(10).pow(12)))
  }
  let totalSupplyCall = vaultContract.try_totalSupply()
  let totalSupplyValue = BigDecimal.zero()
  if (!totalSupplyCall.reverted) {
    totalSupplyValue = new BigDecimal(totalSupplyCall.value)
  }
  if (totalSupplyValue > BigDecimal.zero()) {
    let historicalPriceEntity = createOrLoadHistoricalPriceEntity(vaultAddress, block.timestamp)
    let usdcPriceCall = ChainlinkFeedRegistry.bind(chainlinkFeedRegistryAddress).try_latestAnswer(usdcAddress, Address.fromString(usdDenom))
    if (!usdcPriceCall.reverted) {
      let scalar = new BigDecimal(BigInt.fromI32(10).pow(8))
      let usdcPrice = new BigDecimal(usdcPriceCall.value).div(scalar)
      if (totalAssetsValue == BigDecimal.zero()) {
        let previousDayTimestamp = block.timestamp.minus(block.timestamp.mod(BigInt.fromI32(86400))).minus(BigInt.fromI32(86400))
        let previousDayPrice = createOrLoadHistoricalPriceEntity(vaultAddress, previousDayTimestamp).price
        historicalPriceEntity.price = previousDayPrice
        log.debug("Call for total assets returned 0 so previous day's price was used. Current timestamp: {}. Previous timestamp {}", [block.timestamp.toString(), previousDayTimestamp.toString()])
      }
      else {
        historicalPriceEntity.price = totalAssetsValue.div(totalSupplyValue).times(usdcPrice)
      }
    }
    else {
      log.debug("USDC price reverted at block number {}", [block.number.toString()])
    }
    let usvViewsContract = SavingsVaultViews.bind(usvViewAddress)
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
