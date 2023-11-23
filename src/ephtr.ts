import { Address, BigDecimal, BigInt, ByteArray, Bytes, dataSource, ethereum } from "@graphprotocol/graph-ts"
import {
    Transfer as TransferEvent, erc20
} from "../generated/indexFactory/erc20"
import { emissions } from "../generated/ephtr/emissions"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalance, createOrLoadAssetEntity, createOrLoadAccountEntity, createOrLoadHistoricalPrice } from "./entityCreation"

export function handleTransfer(event: TransferEvent): void {
    let index = createOrLoadIndexEntity(event.address)
    let phtrAddress = '0x3b9805E163b3750e7f13a26B06F030f2d3b799F5'
    if (index.decimals == 0) {
        let ephtrContract = erc20.bind(event.address)
        let decimals = ephtrContract.decimals()
        let name = ephtrContract.name()
        let symbol = ephtrContract.symbol()
        index.decimals = decimals
        index.name = name 
        index.symbol = symbol
        createOrLoadAssetEntity(Bytes.fromHexString(phtrAddress))
        let indexAssetEntity = createOrLoadIndexAssetEntity(event.address, Bytes.fromHexString(phtrAddress))
        indexAssetEntity.weight = 255
        let indexAssetArray: Bytes[] = []
        indexAssetArray.push(indexAssetEntity.id)
        index.assets = indexAssetArray
        indexAssetEntity.save()
        index.save()
    }
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

export function ephtrBlockHandler(block: ethereum.Block): void {
    let ephtrAddress = '0x3b9805E163b3750e7f13a26B06F030f2d3b799F5'
    let phtrAddress = '0x3b9805E163b3750e7f13a26B06F030f2d3b799F5'
    let emissionsAddress = '0x4819CecF672177F37e5450Fa6DC78d9BaAfa74be'
    let indexAssetEntity = createOrLoadIndexAssetEntity(Bytes.fromHexString(ephtrAddress), Bytes.fromHexString(phtrAddress))
    let historicalPriceEntity = createOrLoadHistoricalPrice(Bytes.fromHexString(ephtrAddress), block.timestamp)
    let phtrContract = erc20.bind(Address.fromString(phtrAddress))
    let emissionsContract = emissions.bind(Address.fromString(emissionsAddress))

    let phtrScalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadAssetEntity(Bytes.fromHexString(phtrAddress)).decimals)))
    let ephtrScalar = new BigDecimal(BigInt.fromI32(10).pow(u8(createOrLoadIndexEntity(Bytes.fromHexString(phtrAddress)).decimals)))

    
    let phtrBalance = new BigDecimal(phtrContract.balanceOf(Address.fromString(ephtrAddress)))

    if (phtrBalance > BigDecimal.zero()){
        let withdrawableAmount = new BigDecimal(emissionsContract.withdrawable())
        phtrBalance = phtrBalance.plus(withdrawableAmount).div(phtrScalar)
    
        indexAssetEntity.balance = phtrBalance
    
        let totalSupply = new BigDecimal(erc20.bind(Address.fromString(ephtrAddress)).totalSupply()).minus(new BigDecimal(BigInt.fromI32(10000)))
        totalSupply = totalSupply.div(ephtrScalar)
    
        let price = phtrBalance.div(totalSupply)
        
        historicalPriceEntity.price = price
        historicalPriceEntity.save()
        indexAssetEntity.save()
    }
  
}