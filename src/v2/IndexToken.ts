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
    reserveAssetEntity.balance = reserveAssetEntity.balance.minus(amount)
    reserveAssetEntity.save()
    let k = indexEntity.k!
    if (event.params.k > BigInt.zero()) {
        let assetScalar = new BigDecimal(BigInt.fromI32(1).minus(event.params.k.div(k)))
        log.debug('asset scalar :{},redeemed k: {},saved k: {}',[assetScalar.toString(),event.params.k.toString(),k.toString()])
        let indexAssets = indexEntity.assets
        for (let i = 0; i < indexAssets.length; i++) {
            let chainIDToAssetMappingEntity = loadChainIDToAssetMappingEntity(indexAssets[i])
            let chainIDAssetArray = chainIDToAssetMappingEntity.assets
            for (let y = 0; y < chainIDAssetArray.length; y++) {
                let indexAssetEntity = loadIndexAssetEntity(chainIDAssetArray[y])
                indexAssetEntity.balance = indexAssetEntity.balance.times(assetScalar)
                indexAssetEntity.save()
            }
        }
        indexEntity.k = k.minus(event.params.k)
        indexEntity.save()
    }
    saveHistoricalData(event.address, event.block.timestamp)
}

export function handleFeeAccrued(event:FeeAccrued):void {
    let indexEntity = createOrLoadIndexEntity(event.address)
    let fees = new BigDecimal(event.params.AUMFee.plus(event.params.baseFee))
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexEntity.decimals)))
    fees = fees.div(scalar)
    indexEntity.totalFees = indexEntity.totalFees!.plus(fees)
    indexEntity.save()
}
