import { Bytes, DataSourceContext } from "@graphprotocol/graph-ts"
import {
  ManagedIndexCreated as ManagedIndexCreatedEvent
} from "../generated/indexFactory/indexFactory"
import { indexToken, vaultFactory } from "../generated/templates"
import { indexToken as indexTokenContract } from "../generated/templates/indexToken/indexToken"
import { createOrLoadAccountEntity,createOrLoadIndexAssetEntity, createOrLoadIndexEntity } from "./entityCreation"

export function handleManagedIndexCreated(
  event: ManagedIndexCreatedEvent
): void {
  indexToken.create(event.params.index)
  let indexContract = indexTokenContract.bind(event.params.index)
  let vTokenFactory = indexContract.vTokenFactory()
  let context = new DataSourceContext()
  context.setBytes('indexAddress', event.params.index)
  vaultFactory.createWithContext(vTokenFactory, context)

  let indexEntity = createOrLoadIndexEntity(event.params.index)
  let indexAssetArray: Bytes[] = []

  for (let i = 0; i < event.params._assets.length; i++) {
    let token = event.params._assets[i]
    let weight = event.params._weights[i]
    createOrLoadAccountEntity(token)
    let indexAssetEntity = createOrLoadIndexAssetEntity(event.params.index,token)
    indexAssetEntity.weight = weight
    indexAssetEntity.save()
    indexAssetArray.push(indexAssetEntity.id)
  }
  indexEntity.assets = indexAssetArray
  indexEntity.save()
}
