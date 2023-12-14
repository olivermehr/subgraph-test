import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  FCashMinted as FCashMintedEvent,
  Upgraded as UpgradedEvent,
  Withdraw as WithdrawEvent,
  USVVault
} from "../../generated/USVVault/USVVault"
import { createOrLoadAssetEntity, createOrLoadHistoricalIndexBalance, createOrLoadHistoricalPrice, createOrLoadIndexAssetEntity, createOrLoadIndexEntity, createOrLoadHistoricalIndexAsset, loadIndexAssetEntity } from "../EntityCreation"
import { ChainlinkFeedRegistry } from "../../generated/USVVault/ChainlinkFeedRegistry"
export { handleTransfer } from "./IndexToken"
import { convertAUMFeeRate } from "./FeePool"
import { USVViews } from "../../generated/USVVault/USVViews"

export function handleDeposit(event: DepositEvent): void {
  updateBalances(event)
}

export function handleUpgraded(event: UpgradedEvent): void {
  let indexEntity = createOrLoadIndexEntity(event.address)
  let usvContract = USVVault.bind(event.address)
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
  let vaultContract = USVVault.bind(event.address)
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
  log.debug('Block handler being called at {}', [block.number.toString()])
  let vaultAddress = '0x6bAD6A9BcFdA3fd60Da6834aCe5F93B8cFed9598'
  let usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  let usdDenom = '0x0000000000000000000000000000000000000348'
  let chainlinkFeedRegistryAddress = '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'
  let usvViewAddress = '0xE574beBdDB460e3E0588F1001D24441102339429'
  let vaultContract = USVVault.bind(Address.fromString(vaultAddress))
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
    let historicalPriceEntity = createOrLoadHistoricalPrice(Bytes.fromHexString(vaultAddress), block.timestamp)
    let usdcPriceCall = ChainlinkFeedRegistry.bind(Address.fromString(chainlinkFeedRegistryAddress)).try_latestAnswer(Address.fromString(usdcAddress), Address.fromString(usdDenom))
    if (!usdcPriceCall.reverted) {
      let scalar = new BigDecimal(BigInt.fromI32(10).pow(8))
      let usdcPrice = new BigDecimal(usdcPriceCall.value).div(scalar)
      if (totalAssetsValue == BigDecimal.zero()) {
        let previousDayTimestamp = block.timestamp.minus(block.timestamp.mod(BigInt.fromI32(86400))).minus(BigInt.fromI32(86400))
        let previousDayPrice = createOrLoadHistoricalPrice(Bytes.fromHexString(vaultAddress), previousDayTimestamp).price
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
    let usvViewsContract = USVViews.bind(Address.fromString(usvViewAddress))
    let apyCall = usvViewsContract.try_getAPY(Address.fromString(vaultAddress))
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
