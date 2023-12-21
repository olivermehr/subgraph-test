import { Address, BigDecimal, Bytes, DataSourceContext, log, BigInt, dataSource } from "@graphprotocol/graph-ts"
import {
  ManagedIndexCreated as ManagedIndexCreatedEvent
} from "../../generated/IndexFactoryV1/IndexFactoryV1"
import { FeePool, IndexRegistry, IndexTokenV1, Vault, VaultFactory } from "../../generated/templates"
import { IndexTokenV1 as indexTokenContract } from "../../generated/templates/IndexTokenV1/IndexTokenV1"
import { IndexRegistry as indexRegistryContract } from "../../generated/templates/IndexRegistry/IndexRegistry"
import { VaultFactory as vaultFactoryContract } from "../../generated/templates/VaultFactory/VaultFactory"
import { createOrLoadChainIDToAssetMappingEntity, createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "../EntityCreation"
import { ERC20 } from "../../generated/IndexFactoryV1/ERC20"

export function handleManagedIndexCreated(
  event: ManagedIndexCreatedEvent
): void {
  let indexContract = indexTokenContract.bind(event.params.index)
  let vTokenFactory = indexContract.vTokenFactory()
  let registry = indexContract.registry()

  IndexTokenV1.create(event.params.index)

  let vTokenContext = new DataSourceContext()
  vTokenContext.setBytes('indexAddress', event.params.index)
  VaultFactory.createWithContext(vTokenFactory, vTokenContext)

  let registryContext = new DataSourceContext()
  registryContext.setBytes('indexAddress', event.params.index)
  IndexRegistry.createWithContext(registry, registryContext)

  let feePoolAddress = indexRegistryContract.bind(registry).feePool()
  FeePool.create(feePoolAddress)
  let chainID = dataSource.context().getBigInt('chainID')
  let indexEntity = createOrLoadIndexEntity(event.params.index)
  indexEntity.decimals = indexContract.decimals()
  indexEntity.name = indexContract.name()
  indexEntity.symbol = indexContract.symbol()
  indexEntity.chainID = chainID
  indexEntity.creationDate = event.block.timestamp
  indexEntity.version = "v1"
  let chainIDToAssetMappingEntity = createOrLoadChainIDToAssetMappingEntity(event.params.index, chainID)
  let chainIDAssetArray: string[] = []

  for (let i = 0; i < event.params._assets.length; i++) {
    let token = event.params._assets[i]
    let weight = event.params._weights[i]
    let vtokenAddress = vaultFactoryContract.bind(vTokenFactory).vTokenOf(token)
    if (vtokenAddress != Address.fromString("0x0000000000000000000000000000000000000000")) {
      let context = new DataSourceContext()
      context.setBytes('assetAddress', token)
      context.setBytes('indexAddress', event.params.index)
      Vault.createWithContext(vtokenAddress, context)
      let indexAssetEntity = createOrLoadIndexAssetEntity(event.params.index, token,chainID)
      let tokenContract = ERC20.bind(token)
      indexAssetEntity.name = tokenContract.name()
      indexAssetEntity.symbol = tokenContract.symbol()
      indexAssetEntity.decimals = tokenContract.decimals()
      indexAssetEntity.weight = weight
      indexAssetEntity.save()
      chainIDAssetArray.push(indexAssetEntity.id)
    }
  }
  chainIDToAssetMappingEntity.assets = chainIDAssetArray
  chainIDToAssetMappingEntity.save()
  indexEntity.assets = [chainIDToAssetMappingEntity.id]
  indexEntity.save()
}
