import { Deployed as DeployedEvent } from "../../generated/IndexFactoryV2/IndexFactoryV2"
import { createOrLoadChainIDToAssetMappingEntity, createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "../EntityCreation"
import { Governance as GovernanceTemplate, IndexTokenV2 as indexTemplate } from "../../generated/templates"
import { BigInt, Bytes, DataSourceContext, dataSource } from "@graphprotocol/graph-ts"
import { IndexTokenV2 } from "../../generated/IndexFactoryV2/IndexTokenV2"
import { ERC20 } from "../../generated/IndexFactoryV2/ERC20"


export function handleIndexDeployed(event: DeployedEvent): void {
    let chainID = dataSource.context().getBigInt('chainID')
    let context = new DataSourceContext()
    context.setBytes('reserveAsset', event.params.reserve)
    indexTemplate.createWithContext(event.params.index, context)
    context.setBytes('indexAddress', event.params.index)
    GovernanceTemplate.createWithContext(event.params.governance, context)

    let index = createOrLoadIndexEntity(event.params.index)
    let indexContract = IndexTokenV2.bind(event.params.index)
    index.name = event.params.name
    index.symbol = event.params.symbol
    index.decimals = indexContract.decimals()
    index.chainID = chainID
    index.version = "v2"
    index.creationDate = event.block.timestamp
    index.k = BigInt.fromI64(1e18)
    let reserveContract = ERC20.bind(event.params.reserve)
    let indexAssetEntity = createOrLoadIndexAssetEntity(event.params.index,event.params.reserve,chainID)
    indexAssetEntity.name = reserveContract.name()
    indexAssetEntity.symbol = reserveContract.symbol()
    indexAssetEntity.decimals = reserveContract.decimals()
    indexAssetEntity.chainID = chainID
    indexAssetEntity.currencyID = BigInt.fromI32(0)

    let chainIDAssetArray: string[] = []
    let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(event.params.index,chainID)
    chainIDAssetArray.push(indexAssetEntity.id)
    chainIDToAssetMappingEntity.assets = chainIDAssetArray
    

    let indexAssetArray : string[] = []
    indexAssetArray.push(chainIDToAssetMappingEntity.id)
    index.assets = indexAssetArray
    chainIDToAssetMappingEntity.save()
    indexAssetEntity.save()
    index.save()
}