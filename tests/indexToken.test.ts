import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore
} from "matchstick-as/assembly/index"
import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import { handleAssetRemoved,handleTransfer,handleUpdateAnatomy } from "../src/indexToken"
import { createAssetRemovedEvent,createTransferEvent,createUpdateAnatomyEvent } from "./indexToken-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

  afterAll(() => {
    clearStore()
  })
  test("Adding asset to index", () => {
    let asset = Address.fromString('0x0000000000000000000000000000000000000002')
    let event = createUpdateAnatomyEvent(asset, 50)
    handleUpdateAnatomy(event)
    handleUpdateAnatomy(event)
    logStore()
    assert.entityCount("Index",1)
    assert.entityCount("IndexAsset",1)
    assert.entityCount("Asset",1)
    assert.fieldEquals("Index","0xa16081f360e3847006db660bae1c6d1b2e17ec2a","assets","[0xa16081f360e3847006db660bae1c6d1b2e17ec2a0000000000000000000000000000000000000002]")
  }
  )