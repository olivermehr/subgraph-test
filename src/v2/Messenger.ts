import { dataSource } from "@graphprotocol/graph-ts"
import { SetLZConfig as SetLZConfigEvent } from "../../generated/templates/Messenger/Messenger"
import { createOrLoadLZConfigEntity } from "../EntityCreation"


export function handleSetLZConfig(event: SetLZConfigEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let LZConfigEntity = createOrLoadLZConfigEntity(indexAddress)
    LZConfigEntity.eIds = event.params.param0.eIds
    LZConfigEntity.minGas = event.params.param0.minGas
    LZConfigEntity.save()
}