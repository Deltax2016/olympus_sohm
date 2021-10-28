import { Address, BigDecimal, BigInt, log, Bytes } from '@graphprotocol/graph-ts'
import { Wallet, totalSupply, DailyBalance, HourBalance, MinuteBalance } from '../../generated/schema'
import {SOHM_ERC20_CONTRACT, SOHM_ERC20_CONTRACTV2, SOHM_ERC20_CONTRACTV2_BLOCK} from './Constants'
import {
  sOHM
} from "../../generated/sOHM/sOHM"
import {
  sOHM2
} from "../../generated/sOHM2/sOHM2"


export function createDailyBalance(address: Bytes, timestamp: BigInt, blockNumber: BigInt): DailyBalance {

  let number:i64 =Number.parseInt(timestamp.toString(),10) as i64;
  number*=1000;
  const date: Date = new Date(number);

  let entity = DailyBalance.load(`${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date)}`)

  if (!entity) {
    entity = new DailyBalance(`${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date)}`)
  }

  if(blockNumber.lt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract = sOHM.bind(Address.fromString(SOHM_ERC20_CONTRACT))
    entity.sohmBalance = ohmContract.balanceOf(Address.fromString(address.toHex()))
    
  }

  entity.wallet = address.toHex()

  if(blockNumber.gt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract2 = sOHM2.bind(Address.fromString(SOHM_ERC20_CONTRACTV2))
    entity.sohmBalance = ohmContract2.balanceOf(Address.fromString(address.toHex()))

  }

  entity.timestamp = timestamp
  entity.address = address
  entity.day = BigInt.fromString(getNumberDayFromDate(date).toString())
  entity.save()
  let hourBalance = createHourBalance(address, timestamp, blockNumber)
  return entity as DailyBalance

}

export function createHourBalance(address: Bytes, timestamp: BigInt, blockNumber: BigInt): HourBalance {

  let number:i64 =Number.parseInt(timestamp.toString(),10) as i64;
  number*=1000;
  const date: Date = new Date( number);

  let entity = HourBalance.load(`${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date).toString()}-${date.getUTCHours().toString()}`)

  if (!entity) {
    entity = new HourBalance(`${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date).toString()}-${date.getUTCHours().toString()}`)
  }

  if(blockNumber.lt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract = sOHM.bind(Address.fromString(SOHM_ERC20_CONTRACT))
    entity.sohmBalance = ohmContract.balanceOf(Address.fromString(address.toHex()))
    
  }

  entity.dailyBalance = `${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date).toString()}`

  if(blockNumber.gt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract2 = sOHM2.bind(Address.fromString(SOHM_ERC20_CONTRACTV2))
    entity.sohmBalance = ohmContract2.balanceOf(Address.fromString(address.toHex()))

  }

  entity.timestamp = timestamp
  entity.address = address
  entity.hour = BigInt.fromI32(date.getUTCHours())
  entity.save()
  let minuteBalance = createMinuteBalance(address, timestamp, blockNumber)

  return entity as HourBalance

}

export function createMinuteBalance(address: Bytes, timestamp: BigInt, blockNumber: BigInt): MinuteBalance {

  let number:i64 =Number.parseInt(timestamp.toString(),10) as i64;
  number*=1000;
  const date: Date = new Date(number);

  let entity = MinuteBalance.load(`${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date).toString()}-${date.getUTCHours().toString()}-${date.getUTCMinutes().toString()}`)

  if (!entity) {
    entity = new MinuteBalance(`${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date).toString()}-${date.getUTCHours().toString()}-${date.getUTCMinutes().toString()}`)
  }

  entity.hourBalance = `${address.toHex()}-${date.getUTCFullYear()}-${getNumberDayFromDate(date).toString()}-${date.getUTCHours().toString()}`
  
  if(blockNumber.lt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract = sOHM.bind(Address.fromString(SOHM_ERC20_CONTRACT))
    entity.sohmBalance = ohmContract.balanceOf(Address.fromString(address.toHex()))
    
  }

  if(blockNumber.gt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract2 = sOHM2.bind(Address.fromString(SOHM_ERC20_CONTRACTV2))
    entity.sohmBalance = ohmContract2.balanceOf(Address.fromString(address.toHex()))

  }

  entity.timestamp = timestamp
  entity.address = address
  entity.minute = BigInt.fromI32(date.getUTCMinutes())
  entity.save()

  return entity as MinuteBalance

}

export function createTotals(timestamp: BigInt): totalSupply {

  let number:i64 =Number.parseInt(timestamp.toString(),10) as i64;
  number*=1000;
  const date: Date = new Date( number);

  let total = totalSupply.load(`${date.getUTCFullYear()}-${getNumberDayFromDate(date)}`)
  if (!total) {
    total = new totalSupply(`${date.getUTCFullYear()}-${getNumberDayFromDate(date)}`)
    total.totalWallets = BigInt.fromI32(0)
  }
  let currentTotal = total.totalWallets
  total.day = BigInt.fromString(getNumberDayFromDate(date).toString())
  total.timestamp = timestamp
  total.totalWallets = currentTotal + BigInt.fromI32(1)
  total.save()

  return total as totalSupply

}

export function createWallet(address: Bytes, timestamp: BigInt, id: Bytes, blockNumber: BigInt): void {

  let entity = Wallet.load(address.toHex())

  if (!entity) {
    entity = new Wallet(address.toHex())
    entity.birth = timestamp
    createTotals(timestamp)
  }

  if(blockNumber.lt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract = sOHM.bind(Address.fromString(SOHM_ERC20_CONTRACT))
    entity.sohmBalance = ohmContract.balanceOf(Address.fromString(address.toHex()))

  }

  if(blockNumber.gt(BigInt.fromString(SOHM_ERC20_CONTRACTV2_BLOCK))){

    let ohmContract2 = sOHM2.bind(Address.fromString(SOHM_ERC20_CONTRACTV2))
    entity.sohmBalance = ohmContract2.balanceOf(Address.fromString(address.toHex()))

  }
  
  entity.address = address
  entity.save()

  //let balance = createBalance(address, timestamp, id)
  let DailyBalance = createDailyBalance(address, timestamp, blockNumber)

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

function getNumberDayFromDate(date:Date): i64 {
  const oneDay:number = 1000 * 60 * 60 * 24;
  let supported=new Date(0);
  supported.setUTCFullYear(date.getUTCFullYear());
  return  Math.floor( Number.parseInt((date.getTime() -  supported.getTime()).toString()) /( oneDay )) as i64;
}
