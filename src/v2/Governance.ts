import { DataSourceContext, dataSource } from "@graphprotocol/graph-ts"
import { ConfigBuilder as ConfigBuilderTemplate } from "../../generated/templates"
import { SetConfigBuilder as SetConfigbuilderEvent } from "../../generated/templates/Governance/Governance"


export function handleSetConfigBuilder(event: SetConfigbuilderEvent): void {
    let indexAddress = dataSource.context().getBytes('indexAddress')
    let reserveAsset = dataSource.context().getBytes('reserveAsset')

    let context = new DataSourceContext()
    context.setBytes('indexAddress', indexAddress)
    context.setBytes('reserveAsset', reserveAsset)

    ConfigBuilderTemplate.createWithContext(event.params.param0, context)
}