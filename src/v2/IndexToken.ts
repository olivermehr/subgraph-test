import { Deposit as DepositEvent, Transfer as TransferEvent, Withdraw as WithdrawEvent } from "../../generated/templates/IndexTokenV2/IndexTokenV2"
import { createOrLoadIndexEntity, createOrLoadAccountEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalance, createOrLoadIndexAssetEntity } from "../EntityCreation"
import { BigDecimal, Bytes, Address, BigInt, dataSource } from "@graphprotocol/graph-ts"
export { handleTransfer } from "../v1/IndexToken"

export function handleDeposit(event: DepositEvent): void {
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let reserveAssetEntity = createOrLoadIndexAssetEntity(event.address, reserveAsset)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadIndexAssetEntity(event.address,reserveAsset).decimals)))
    let amount = new BigDecimal(event.params.reserve).div(scalar)
    reserveAssetEntity.balance = reserveAssetEntity.balance.plus(amount)
    reserveAssetEntity.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let reserveAssetEntity = createOrLoadIndexAssetEntity(event.address, reserveAsset)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadIndexAssetEntity(event.address,reserveAsset).decimals)))
    let amount = new BigDecimal(event.params.reserve).div(scalar)

    reserveAssetEntity.balance = reserveAssetEntity.balance.minus(amount)
    reserveAssetEntity.save()
}
