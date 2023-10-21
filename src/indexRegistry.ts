import { feePool } from "../generated/templates"
import {
  SetFeePool as SetFeePoolEvent
} from "../generated/templates/indexRegistry/indexRegistry"

export function handleSetFeePool(event: SetFeePoolEvent): void {
  feePool.create(event.params.feePool)
}

