import { ByteArray, Bytes, BigInt, DataSourceContext, dataSource, log } from "@graphprotocol/graph-ts"
import {
  VTokenCreated as VTokenCreatedEvent
} from "../../generated/templates/VaultFactory/VaultFactory"

import { Vault } from "../../generated/templates"

export function handleVTokenCreated(event: VTokenCreatedEvent): void {
  let index = dataSource.context().getBytes('indexAddress')
  let context = new DataSourceContext()
  context.setBytes('assetAddress', event.params.asset)
  context.setBytes('indexAddress', index)
  Vault.createWithContext(event.params.vToken, context)
}
