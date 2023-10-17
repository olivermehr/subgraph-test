import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AssetRemoved as AssetRemovedEvent,
  Transfer as TransferEvent,
  UpdateAnatomy as UpdateAnatomyEvent
} from "../generated/pdi/pdi"
import { Index, Account } from "../generated/schema"

export function createOrLoadIndexEntity(id: Bytes):Index {
  let index = Index.loadInBlock(id)
  if (index == null) {
    index = Index.load(id)
    if (index == null){
      index = new Index(id)
      index.holders = BigInt.fromI32(0)
      index.assets = []
      index.weights = []
      index.save()
    }
  }
  return index
}

export function createOrLoadAccountEntity(id: Bytes):Account {
  let account = Account.loadInBlock(id)
  if(account == null){
    account = Account.load(id)
    if(account==null){
      account = new Account(id)
      account.balance = BigInt.fromI32(0)
      account.save()
    }
  }
  return account
}

export function handleTransfer(event: TransferEvent): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let index = createOrLoadIndexEntity(event.address)
  if (event.params.from != Address.fromString('0x0000000000000000000000000000000000000000')) {
    let fromAccount = createOrLoadAccountEntity(event.params.from)
    fromAccount.balance = fromAccount.balance.minus(event.params.value)
    if (fromAccount.balance == BigInt.fromI32(0)) {
      index.holders = index.holders.minus(BigInt.fromI32(1))
    }
    fromAccount.save()
  }
  if(event.params.to != Address.fromString('0x0000000000000000000000000000000000000000')) {
    let toAccount = createOrLoadAccountEntity(event.params.to)
    if (toAccount.balance == BigInt.fromI32(0)) {
      index.holders = index.holders.plus(BigInt.fromI32(1))
    }
    toAccount.balance = toAccount.balance.plus(event.params.value)
    toAccount.save()
  }
  // Entities can be written to the store with `.save()`
  index.save()
}

// Note: If a handler doesn't require existing field values, it is faster
// _not_ to load the entity from the store. Instead, create it fresh with
// `new Entity(...)`, set the fields that should be updated and save the
// entity back to the store. Fields that were not set or unset remain
// unchanged, allowing for partial updates to be applied.

// It is also possible to access smart contracts from mappings. For
// example, the contract that has emitted the event can be connected to
// with:
//
// let contract = Contract.bind(event.address)
//
// The following functions can then be called on this contract to access
// state variables and other data:
//
// - contract.DOMAIN_SEPARATOR(...)
// - contract.allowance(...)
// - contract.anatomy(...)
// - contract.approve(...)
// - contract.balanceOf(...)
// - contract.decimals(...)
// - contract.decreaseAllowance(...)
// - contract.factory(...)
// - contract.inactiveAnatomy(...)
// - contract.increaseAllowance(...)
// - contract.name(...)
// - contract.nonces(...)
// - contract.registry(...)
// - contract.supportsInterface(...)
// - contract.symbol(...)
// - contract.totalSupply(...)
// - contract.transfer(...)
// - contract.transferFrom(...)
// - contract.vTokenFactory(...)

export function handleAssetRemoved(event: AssetRemovedEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let assets = index.assets
  let weights = index.weights
  let idx = assets.indexOf(event.params.asset)
  assets.splice(idx, 1)
  weights.splice(idx, 1)
  index.assets = assets
  index.weights = weights
  index.save()
}

export function handleUpdateAnatomy(event: UpdateAnatomyEvent): void {
  let index = createOrLoadIndexEntity(event.address)
  let assets = index.assets
  let weights = index.weights
  assets.push(event.params.asset)
  weights.push(event.params.weight)
  index.assets = assets
  index.weights = weights
  index.save()
}
