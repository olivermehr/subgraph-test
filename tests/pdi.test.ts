import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Index ,Account } from "../generated/schema"
import { Transfer,UpdateAnatomy,AssetRemoved } from "../generated/pdi/pdi"
import { handleAssetRemoved,handleTransfer,handleUpdateAnatomy } from "../src/pdi"
import { createAssetRemovedEvent,createTransferEvent,createUpdateAnatomyEvent } from "./pdi-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let to = Address.fromString("0x0000000000000000000000000000000000000001")
    let from = Address.fromString(
      "0x0000000000000000000000000000000000000000"
    )
    let value = BigInt.fromI32(234)
    let newTransferEvent = createTransferEvent(from, to, value)
    handleTransfer(newTransferEvent)
    let newUpdateAnatomyEvent =  createUpdateAnatomyEvent(to,50)
    let test_address = Address.fromString('0x0000000000000000000000000000000000000002')
    let newUpdateAnatomyEvent_2 = createUpdateAnatomyEvent(test_address,76)
    handleUpdateAnatomy(newUpdateAnatomyEvent)
    handleUpdateAnatomy(newUpdateAnatomyEvent_2)

  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Check veracity of index and account entities", () => {
    assert.entityCount("Index", 1)
    assert.entityCount("Account",1)
    
    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Index",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "holders",
      "1"
    )
    assert.fieldEquals(
      "Account",
      "0x0000000000000000000000000000000000000001",
      "balance",
      "234"
    )
    assert.fieldEquals(
      "Index",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "assets",
      "[0x0000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000002]"
    )
    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })

  test('Adding another holder', () => {
    let transfer2 = createTransferEvent(Address.fromString('0x0000000000000000000000000000000000000001'),Address.fromString('0x0000000000000000000000000000000000000005'),BigInt.fromI32(100))
    handleTransfer(transfer2)
    assert.fieldEquals('Account','0x0000000000000000000000000000000000000005','balance','100')
    assert.fieldEquals('Account','0x0000000000000000000000000000000000000001','balance','134')
    assert.fieldEquals('Index','0xa16081f360e3847006db660bae1c6d1b2e17ec2a','holders','2')
  })
  
  test('Check removal of index holder',() => {
    let transfer3 = createTransferEvent(Address.fromString('0x0000000000000000000000000000000000000001'),Address.fromString('0x0000000000000000000000000000000000000000'),BigInt.fromI32(134))
    handleTransfer(transfer3)
    assert.fieldEquals('Account','0x0000000000000000000000000000000000000001','balance','0')
    assert.fieldEquals('Index','0xa16081f360e3847006db660bae1c6d1b2e17ec2a','holders','1')
  })

  test('Check removal of asset',() => {
    let removedAssetEvent = createAssetRemovedEvent(Address.fromString('0x0000000000000000000000000000000000000001'))
    handleAssetRemoved(removedAssetEvent)
    assert.fieldEquals('Index','0xa16081f360e3847006db660bae1c6d1b2e17ec2a','assets','[0x0000000000000000000000000000000000000002]')
    assert.fieldEquals('Index','0xa16081f360e3847006db660bae1c6d1b2e17ec2a','weights','[76]')
  })
  logStore()
})
