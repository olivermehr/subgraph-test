import { ByteArray, Bytes, BigInt, DataSourceContext, dataSource } from "@graphprotocol/graph-ts"
import {
  VTokenCreated as VTokenCreatedEvent
} from "../generated/templates/vaultFactory/vaultFactory"
import {
  Asset, Index, IndexAsset
} from "../generated/schema"

import { createOrLoadIndexAssetEntity } from "./entityCreation"

import { vault } from "../generated/templates"

export function handleVTokenCreated(event: VTokenCreatedEvent): void {
  let index = dataSource.context().getBytes('indexAddress')
  let context = new DataSourceContext()
  context.setBytes('assetAddress', event.params.asset)
  context.setBytes('indexAddress',index)
  

  vault.createWithContext(event.params.vToken, context)
}
