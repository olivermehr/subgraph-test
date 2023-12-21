import { Deposit as DepositEvent, Withdraw as WithdrawEvent } from "../../generated/templates/IndexTokenV2/IndexTokenV2"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, loadIndexAssetEntity, loadChainIDToAssetMappingEntity } from "../EntityCreation"
import { BigDecimal, Bytes, Address, BigInt, dataSource } from "@graphprotocol/graph-ts"
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
        let assetScalar = new BigDecimal(k.minus(event.params.k).div(k))
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
        indexEntity.k = indexEntity.k!.minus(event.params.k)
        indexEntity.save()
    }
    saveHistoricalData(event.address, event.block.timestamp)
}
