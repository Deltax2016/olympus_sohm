import { Address, BigDecimal, BigInt, log, Bytes } from '@graphprotocol/graph-ts'
import {
  Transfer,
} from "../generated/sOHM2/sOHM2"
//import { ExampleEntity } from "../generated/schema"
import { Transfer as TransferOHM } from '../generated/schema'
import { createWallet, createTotals } from './utils/wallets'


export function handleTransfer(event: Transfer): void {

  let entity = TransferOHM.load(event.transaction.hash.toHex())
  createWallet(event.params.to, event.block.timestamp, event.transaction.hash,event.block.number)
  createWallet(event.params.from, event.block.timestamp, event.transaction.hash, event.block.number)

  if (!entity) {
    entity = new TransferOHM(event.transaction.hash.toHex())
  }

  entity.from = event.params.from
  entity.to = event.params.to
  entity.amount = toDecimal(event.params.value, 9)
  entity.timestamp = event.block.timestamp
  entity.save()

}

function toDecimal(
  value: BigInt,
  decimals: number = DEFAULT_DECIMALS,
): BigDecimal {
  let precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();

  return value.divDecimal(precision);
}
