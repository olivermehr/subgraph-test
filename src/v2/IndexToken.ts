import { Deposit as DepositEvent, FeeAccrued, Withdraw as WithdrawEvent } from "../../generated/templates/IndexTokenV2/IndexTokenV2"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, loadIndexAssetEntity, loadChainIDToAssetMappingEntity } from "../EntityCreation"
import { BigDecimal, Bytes, Address, BigInt, dataSource, log } from "@graphprotocol/graph-ts"
export { handleTransfer } from "../v1/IndexToken"
import { saveHistoricalData } from "./ConfigBuilder"

export function handleDeposit(event: DepositEvent): void {
    let indexEntity = createOrLoadIndexEntity(event.address)
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let reserveAssetEntity = createOrLoadIndexAssetEntity(event.address, reserveAsset, indexEntity.chainID)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(reserveAssetEntity.decimals)))
    let amount = new BigDecimal(event.params.reserve).div(scalar)
    reserveAssetEntity.balance = reserveAssetEntity.balance.plus(amount)
    reserveAssetEntity.save()
    saveHistoricalData(event.address, event.block.timestamp)
}

export function handleWithdraw(event: WithdrawEvent): void {
    let indexEntity = createOrLoadIndexEntity(event.address)
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let reserveAssetEntity = createOrLoadIndexAssetEntity(event.address, reserveAsset, indexEntity.chainID)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(reserveAssetEntity.decimals)))
    let amount = new BigDecimal(event.params.reserve).div(scalar)
    log.debug("Withdrawn amount = {}, reserve balance before = {}, withdrawn k",[amount.toString(),reserveAssetEntity.balance.toString(),event.params.k.toString()])
    reserveAssetEntity.balance = reserveAssetEntity.balance.minus(amount)
    log.debug("Reserve balance after subtracting withdrawn reserve {}",[reserveAssetEntity.balance.toString()])
    reserveAssetEntity.save()
    let k = indexEntity.k!
    if (event.params.k > BigInt.zero()) {
        let assetScalar = BigDecimal.fromString("1").minus(new BigDecimal(event.params.k).div(new BigDecimal(k)))
        log.debug("Asset scalar {}",[assetScalar.toString()])
        let indexAssets = indexEntity.assets
        for (let i = 0; i < indexAssets.length; i++) {
            let chainIDToAssetMappingEntity = loadChainIDToAssetMappingEntity(indexAssets[i])
            log.debug("block number = {}. Inside indexAsset loop {}",[event.block.number.toString(),chainIDToAssetMappingEntity.id.toString()])
            let chainIDAssetArray = chainIDToAssetMappingEntity.assets
            for (let y = 0; y < chainIDAssetArray.length; y++) {
                let indexAssetEntity = loadIndexAssetEntity(chainIDAssetArray[y])
                log.debug("Block number =  {}. Inside chainIDmapping loop {}",[event.block.number.toString(),indexAssetEntity.asset.toHexString()])
                log.debug("Asset address is {} and balance before scaling {}",[indexAssetEntity.asset.toHexString(),indexAssetEntity.balance.toString()])
                indexAssetEntity.balance = indexAssetEntity.balance.times(assetScalar)
                log.debug("Asset address is {} and balance before scaling {}",[indexAssetEntity.asset.toHexString(),indexAssetEntity.balance.toString()])
                indexAssetEntity.save()
            }
        }
        indexEntity.k = k.minus(event.params.k)
        
        indexEntity.save()
    }
    saveHistoricalData(event.address, event.block.timestamp)
}

export function handleFeeAccrued(event: FeeAccrued): void {
    let indexEntity = createOrLoadIndexEntity(event.address)
    let fees = new BigDecimal(event.params.AUMFee.plus(event.params.depositFee).plus(event.params.redemptionFee))
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexEntity.decimals)))
    fees = fees.div(scalar)
    indexEntity.totalFees = indexEntity.totalFees!.plus(fees)
    indexEntity.save()
}
