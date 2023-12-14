import { Deposit as DepositEvent, ReserveChange as ReserveChangeEvent, Transfer as TransferEvent, Withdraw as WithdrawEvent } from "../../generated/templates/IndexTokenV2/IndexTokenV2"
import { createOrLoadIndexEntity, createOrLoadAccountEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalance, createOrLoadIndexAssetEntity } from "../EntityCreation"
import { BigDecimal, Bytes, Address, BigInt, dataSource } from "@graphprotocol/graph-ts"


export function handleTransfer(event: TransferEvent): void {
    let index = createOrLoadIndexEntity(event.address)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(index.decimals)))
    if (event.params.from != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
        let fromAccount = createOrLoadIndexAccountEntity(event.address, event.params.from)
        createOrLoadAccountEntity(event.params.from)
        fromAccount.balance = fromAccount.balance.minus(new BigDecimal(event.params.value).div(scalar))
        if (fromAccount.balance == BigDecimal.zero()) {
            index.holders = index.holders.minus(BigInt.fromI32(1))
        }
        fromAccount.save()
        let historicalAccountBalanceEntity = createOrLoadHistoricalAccountBalance(event.address, event.params.from, event)
        historicalAccountBalanceEntity.balance = fromAccount.balance
        historicalAccountBalanceEntity.save()
    }
    if (event.params.to != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
        let toAccount = createOrLoadIndexAccountEntity(event.address, event.params.to)
        createOrLoadAccountEntity(event.params.to)
        if (toAccount.balance == BigDecimal.zero()) {
            index.holders = index.holders.plus(BigInt.fromI32(1))
        }
        toAccount.balance = toAccount.balance.plus(new BigDecimal(event.params.value).div(scalar))
        toAccount.save()

        let historicalAccountBalanceEntity = createOrLoadHistoricalAccountBalance(event.address, event.params.to, event)
        historicalAccountBalanceEntity.balance = toAccount.balance
        historicalAccountBalanceEntity.save()
    }
    index.save()
}

export function handleDeposit(event: DepositEvent): void {
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let reserveAssetEntity = createOrLoadIndexAssetEntity(event.address, reserveAsset)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadIndexAssetEntity(event.address,reserveAsset).decimals)))
    let amount = new BigDecimal(event.params.reserve).div(scalar)
    reserveAssetEntity.balance = reserveAssetEntity.balance.plus(amount)
    reserveAssetEntity.save()
}

export function handleReserveChange(event: ReserveChangeEvent): void {
    let reserveAsset = dataSource.context().getBytes('reserveAsset')
    let reserveAssetEntity = createOrLoadIndexAssetEntity(event.address, reserveAsset)
    let scalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadIndexAssetEntity(event.address,reserveAsset).decimals)))
    let amount = new BigDecimal(event.params.amount).div(scalar)
    if (event.params.isPositive == true) {
        reserveAssetEntity.balance = reserveAssetEntity.balance.plus(amount)
    }
    else {
        reserveAssetEntity.balance = reserveAssetEntity.balance.minus(amount)
    }
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
