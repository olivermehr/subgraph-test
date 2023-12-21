import { Address, BigDecimal, BigInt, Bytes, dataSource, ethereum, log } from "@graphprotocol/graph-ts"
import {
    Transfer as TransferEvent, ERC20
} from "../generated/IndexFactoryV1/ERC20"
import { Emissions } from "../generated/ephtr/Emissions"
import { createOrLoadIndexEntity, createOrLoadIndexAssetEntity, createOrLoadIndexAccountEntity, createOrLoadHistoricalAccountBalanceEntity, createOrLoadAccountEntity, createOrLoadHistoricalPriceEntity, createOrLoadChainIDToAssetMappingEntity } from "./EntityCreation"
import { saveHistoricalData } from "./v2/ConfigBuilder"

export function handleTransfer(event: TransferEvent): void {
    let index = createOrLoadIndexEntity(event.address)
    let phtrAddress = dataSource.context().getBytes("phtrAddress")
    if (index.decimals == 0) {
        let ephtrContract = ERC20.bind(event.address)
        let decimals = ephtrContract.decimals()
        let chainID = dataSource.context().getBigInt('chainID')
        index.decimals = decimals
        index.name = ephtrContract.name()
        index.symbol = ephtrContract.symbol()
        index.chainID = chainID
        index.creationDate = event.block.timestamp
        index.version = 'v1'
        let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(event.address,chainID)
        let indexAssetEntity = createOrLoadIndexAssetEntity(event.address,phtrAddress,chainID)
        let phtrContract = ERC20.bind(Address.fromBytes(phtrAddress))
        indexAssetEntity.chainID = chainID
        indexAssetEntity.decimals = decimals
        indexAssetEntity.symbol = phtrContract.symbol()
        indexAssetEntity.name = phtrContract.name()
        indexAssetEntity.weight = BigInt.fromI32(255)
        indexAssetEntity.save()

        let chainIDAssetArray: string[] = []
        chainIDAssetArray.push(indexAssetEntity.id)
        chainIDToAssetMappingEntity.assets = chainIDAssetArray
        chainIDToAssetMappingEntity.save()
        index.assets = [chainIDToAssetMappingEntity.id]
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
        let historicalAccountBalanceEntity = createOrLoadHistoricalAccountBalanceEntity(event.address, event.params.from, event)
        historicalAccountBalanceEntity.balance = fromAccount.balance
        historicalAccountBalanceEntity.save()
    }
    if (event.params.from == Address.fromString('0x0000000000000000000000000000000000000000') && event.params.to != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
        index.totalSupply = index.totalSupply.plus(new BigDecimal(event.params.value).div(scalar))
    }
    if (event.params.to != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
        let toAccount = createOrLoadIndexAccountEntity(event.address, event.params.to)
        createOrLoadAccountEntity(event.params.to)
        if (toAccount.balance == BigDecimal.zero()) {
            index.holders = index.holders.plus(BigInt.fromI32(1))
        }
        toAccount.balance = toAccount.balance.plus(new BigDecimal(event.params.value).div(scalar))
        toAccount.save()
        let historicalAccountBalanceEntity = createOrLoadHistoricalAccountBalanceEntity(event.address, event.params.to, event)
        historicalAccountBalanceEntity.balance = toAccount.balance
        historicalAccountBalanceEntity.save()
    }
    if (event.params.to == Address.fromString('0x0000000000000000000000000000000000000000') && event.params.from != Address.fromString('0x0000000000000000000000000000000000000000') && event.params.value > BigInt.zero()) {
        index.totalSupply = index.totalSupply.minus(new BigDecimal(event.params.value).div(scalar))
    }
    index.save()
}

export function ephtrBlockHandler(block: ethereum.Block): void {
    let ephtrAddress = dataSource.address()
    let phtrAddress = dataSource.context().getBytes("phtrAddress")
    let emissionsAddress = dataSource.context().getBytes("emissionsAddress")
    let indexEntity = createOrLoadIndexEntity(ephtrAddress)
    let indexAssetEntity = createOrLoadIndexAssetEntity(ephtrAddress,phtrAddress,indexEntity.chainID)

    let historicalPriceEntity = createOrLoadHistoricalPriceEntity(ephtrAddress, block.timestamp)
    let phtrContract = ERC20.bind(Address.fromBytes(phtrAddress))
    let emissionsContract = Emissions.bind(Address.fromBytes(emissionsAddress))

    let phtrScalar = new BigDecimal(BigInt.fromI32(10).pow(u8(indexAssetEntity.decimals)))

    let phtrBalance = new BigDecimal(phtrContract.balanceOf(ephtrAddress))
    let totalSupply = indexEntity.totalSupply
    log.debug("balance :{} total supply : {}", [phtrBalance.toString(), totalSupply.toString()])

    if (phtrBalance > BigDecimal.zero() && totalSupply > BigDecimal.zero()) {
        let withdrawableAmount = new BigDecimal(emissionsContract.withdrawable())
        phtrBalance = phtrBalance.plus(withdrawableAmount).div(phtrScalar)
        indexAssetEntity.balance = phtrBalance
        totalSupply = totalSupply.div(phtrScalar)

        let price = phtrBalance.div(totalSupply)

        historicalPriceEntity.price = price
        historicalPriceEntity.save()
        indexAssetEntity.save()
        saveHistoricalData(ephtrAddress,block.timestamp)
    }
    else {
        historicalPriceEntity.price = BigDecimal.fromString("1.00")
        historicalPriceEntity.save()
    }
}