import { FeePool } from "../../generated/templates"
import {
  SetFeePool as SetFeePoolEvent
} from "../../generated/templates/IndexRegistry/IndexRegistry"

export function handleSetFeePool(event: SetFeePoolEvent): void {
  FeePool.create(event.params.feePool)
}

