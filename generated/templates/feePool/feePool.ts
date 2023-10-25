// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AdminChanged extends ethereum.Event {
  get params(): AdminChanged__Params {
    return new AdminChanged__Params(this);
  }
}

export class AdminChanged__Params {
  _event: AdminChanged;

  constructor(event: AdminChanged) {
    this._event = event;
  }

  get previousAdmin(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newAdmin(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class BeaconUpgraded extends ethereum.Event {
  get params(): BeaconUpgraded__Params {
    return new BeaconUpgraded__Params(this);
  }
}

export class BeaconUpgraded__Params {
  _event: BeaconUpgraded;

  constructor(event: BeaconUpgraded) {
    this._event = event;
  }

  get beacon(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Burn extends ethereum.Event {
  get params(): Burn__Params {
    return new Burn__Params(this);
  }
}

export class Burn__Params {
  _event: Burn;

  constructor(event: Burn) {
    this._event = event;
  }

  get index(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get recipient(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get share(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class Initialized extends ethereum.Event {
  get params(): Initialized__Params {
    return new Initialized__Params(this);
  }
}

export class Initialized__Params {
  _event: Initialized;

  constructor(event: Initialized) {
    this._event = event;
  }

  get version(): i32 {
    return this._event.parameters[0].value.toI32();
  }
}

export class Mint extends ethereum.Event {
  get params(): Mint__Params {
    return new Mint__Params(this);
  }
}

export class Mint__Params {
  _event: Mint;

  constructor(event: Mint) {
    this._event = event;
  }

  get index(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get recipient(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get share(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class SetAUMScaledPerSecondsRate extends ethereum.Event {
  get params(): SetAUMScaledPerSecondsRate__Params {
    return new SetAUMScaledPerSecondsRate__Params(this);
  }
}

export class SetAUMScaledPerSecondsRate__Params {
  _event: SetAUMScaledPerSecondsRate;

  constructor(event: SetAUMScaledPerSecondsRate) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get index(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get AUMScaledPerSecondsRate(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class SetBurningFeeInBP extends ethereum.Event {
  get params(): SetBurningFeeInBP__Params {
    return new SetBurningFeeInBP__Params(this);
  }
}

export class SetBurningFeeInBP__Params {
  _event: SetBurningFeeInBP;

  constructor(event: SetBurningFeeInBP) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get index(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get burningFeeInPB(): i32 {
    return this._event.parameters[2].value.toI32();
  }
}

export class SetMintingFeeInBP extends ethereum.Event {
  get params(): SetMintingFeeInBP__Params {
    return new SetMintingFeeInBP__Params(this);
  }
}

export class SetMintingFeeInBP__Params {
  _event: SetMintingFeeInBP;

  constructor(event: SetMintingFeeInBP) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get index(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get mintingFeeInBP(): i32 {
    return this._event.parameters[2].value.toI32();
  }
}

export class Upgraded extends ethereum.Event {
  get params(): Upgraded__Params {
    return new Upgraded__Params(this);
  }
}

export class Upgraded__Params {
  _event: Upgraded;

  constructor(event: Upgraded) {
    this._event = event;
  }

  get implementation(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class Withdraw extends ethereum.Event {
  get params(): Withdraw__Params {
    return new Withdraw__Params(this);
  }
}

export class Withdraw__Params {
  _event: Withdraw;

  constructor(event: Withdraw) {
    this._event = event;
  }

  get index(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get recipient(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class feePool extends ethereum.SmartContract {
  static bind(address: Address): feePool {
    return new feePool("feePool", address);
  }

  AUMScaledPerSecondsRateOf(param0: Address): BigInt {
    let result = super.call(
      "AUMScaledPerSecondsRateOf",
      "AUMScaledPerSecondsRateOf(address):(uint256)",
      [ethereum.Value.fromAddress(param0)]
    );

    return result[0].toBigInt();
  }

  try_AUMScaledPerSecondsRateOf(param0: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "AUMScaledPerSecondsRateOf",
      "AUMScaledPerSecondsRateOf(address):(uint256)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  MAX_AUM_FEE(): BigInt {
    let result = super.call("MAX_AUM_FEE", "MAX_AUM_FEE():(uint256)", []);

    return result[0].toBigInt();
  }

  try_MAX_AUM_FEE(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("MAX_AUM_FEE", "MAX_AUM_FEE():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  MAX_FEE_IN_BP(): BigInt {
    let result = super.call("MAX_FEE_IN_BP", "MAX_FEE_IN_BP():(uint256)", []);

    return result[0].toBigInt();
  }

  try_MAX_FEE_IN_BP(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "MAX_FEE_IN_BP",
      "MAX_FEE_IN_BP():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  burningFeeInBPOf(param0: Address): i32 {
    let result = super.call(
      "burningFeeInBPOf",
      "burningFeeInBPOf(address):(uint16)",
      [ethereum.Value.fromAddress(param0)]
    );

    return result[0].toI32();
  }

  try_burningFeeInBPOf(param0: Address): ethereum.CallResult<i32> {
    let result = super.tryCall(
      "burningFeeInBPOf",
      "burningFeeInBPOf(address):(uint16)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  mintingFeeInBPOf(param0: Address): i32 {
    let result = super.call(
      "mintingFeeInBPOf",
      "mintingFeeInBPOf(address):(uint16)",
      [ethereum.Value.fromAddress(param0)]
    );

    return result[0].toI32();
  }

  try_mintingFeeInBPOf(param0: Address): ethereum.CallResult<i32> {
    let result = super.tryCall(
      "mintingFeeInBPOf",
      "mintingFeeInBPOf(address):(uint16)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toI32());
  }

  proxiableUUID(): Bytes {
    let result = super.call("proxiableUUID", "proxiableUUID():(bytes32)", []);

    return result[0].toBytes();
  }

  try_proxiableUUID(): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "proxiableUUID",
      "proxiableUUID():(bytes32)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  shareOf(param0: Address, param1: Address): BigInt {
    let result = super.call("shareOf", "shareOf(address,address):(uint256)", [
      ethereum.Value.fromAddress(param0),
      ethereum.Value.fromAddress(param1)
    ]);

    return result[0].toBigInt();
  }

  try_shareOf(param0: Address, param1: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "shareOf",
      "shareOf(address,address):(uint256)",
      [ethereum.Value.fromAddress(param0), ethereum.Value.fromAddress(param1)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  supportsInterface(_interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(_interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(_interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(_interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  totalSharesOf(param0: Address): BigInt {
    let result = super.call(
      "totalSharesOf",
      "totalSharesOf(address):(uint256)",
      [ethereum.Value.fromAddress(param0)]
    );

    return result[0].toBigInt();
  }

  try_totalSharesOf(param0: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalSharesOf",
      "totalSharesOf(address):(uint256)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  withdrawableAmountOf(_index: Address, _account: Address): BigInt {
    let result = super.call(
      "withdrawableAmountOf",
      "withdrawableAmountOf(address,address):(uint256)",
      [ethereum.Value.fromAddress(_index), ethereum.Value.fromAddress(_account)]
    );

    return result[0].toBigInt();
  }

  try_withdrawableAmountOf(
    _index: Address,
    _account: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "withdrawableAmountOf",
      "withdrawableAmountOf(address,address):(uint256)",
      [ethereum.Value.fromAddress(_index), ethereum.Value.fromAddress(_account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class BurnCall extends ethereum.Call {
  get inputs(): BurnCall__Inputs {
    return new BurnCall__Inputs(this);
  }

  get outputs(): BurnCall__Outputs {
    return new BurnCall__Outputs(this);
  }
}

export class BurnCall__Inputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _burnInfo(): BurnCall_burnInfoStruct {
    return changetype<BurnCall_burnInfoStruct>(
      this._call.inputValues[1].value.toTuple()
    );
  }
}

export class BurnCall__Outputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }
}

export class BurnCall_burnInfoStruct extends ethereum.Tuple {
  get recipient(): Address {
    return this[0].toAddress();
  }

  get share(): BigInt {
    return this[1].toBigInt();
  }
}

export class BurnMultipleCall extends ethereum.Call {
  get inputs(): BurnMultipleCall__Inputs {
    return new BurnMultipleCall__Inputs(this);
  }

  get outputs(): BurnMultipleCall__Outputs {
    return new BurnMultipleCall__Outputs(this);
  }
}

export class BurnMultipleCall__Inputs {
  _call: BurnMultipleCall;

  constructor(call: BurnMultipleCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _burnInfo(): Array<BurnMultipleCall_burnInfoStruct> {
    return this._call.inputValues[1].value.toTupleArray<
      BurnMultipleCall_burnInfoStruct
    >();
  }
}

export class BurnMultipleCall__Outputs {
  _call: BurnMultipleCall;

  constructor(call: BurnMultipleCall) {
    this._call = call;
  }
}

export class BurnMultipleCall_burnInfoStruct extends ethereum.Tuple {
  get recipient(): Address {
    return this[0].toAddress();
  }

  get share(): BigInt {
    return this[1].toBigInt();
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get _registry(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class InitializeIndexCall extends ethereum.Call {
  get inputs(): InitializeIndexCall__Inputs {
    return new InitializeIndexCall__Inputs(this);
  }

  get outputs(): InitializeIndexCall__Outputs {
    return new InitializeIndexCall__Outputs(this);
  }
}

export class InitializeIndexCall__Inputs {
  _call: InitializeIndexCall;

  constructor(call: InitializeIndexCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _mintingFeeInBP(): i32 {
    return this._call.inputValues[1].value.toI32();
  }

  get _burningFeeInBP(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get _AUMScaledPerSecondsRate(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get _mintInfo(): Array<InitializeIndexCall_mintInfoStruct> {
    return this._call.inputValues[4].value.toTupleArray<
      InitializeIndexCall_mintInfoStruct
    >();
  }
}

export class InitializeIndexCall__Outputs {
  _call: InitializeIndexCall;

  constructor(call: InitializeIndexCall) {
    this._call = call;
  }
}

export class InitializeIndexCall_mintInfoStruct extends ethereum.Tuple {
  get recipient(): Address {
    return this[0].toAddress();
  }

  get share(): BigInt {
    return this[1].toBigInt();
  }
}

export class MintCall extends ethereum.Call {
  get inputs(): MintCall__Inputs {
    return new MintCall__Inputs(this);
  }

  get outputs(): MintCall__Outputs {
    return new MintCall__Outputs(this);
  }
}

export class MintCall__Inputs {
  _call: MintCall;

  constructor(call: MintCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _mintInfo(): MintCall_mintInfoStruct {
    return changetype<MintCall_mintInfoStruct>(
      this._call.inputValues[1].value.toTuple()
    );
  }
}

export class MintCall__Outputs {
  _call: MintCall;

  constructor(call: MintCall) {
    this._call = call;
  }
}

export class MintCall_mintInfoStruct extends ethereum.Tuple {
  get recipient(): Address {
    return this[0].toAddress();
  }

  get share(): BigInt {
    return this[1].toBigInt();
  }
}

export class MintMultipleCall extends ethereum.Call {
  get inputs(): MintMultipleCall__Inputs {
    return new MintMultipleCall__Inputs(this);
  }

  get outputs(): MintMultipleCall__Outputs {
    return new MintMultipleCall__Outputs(this);
  }
}

export class MintMultipleCall__Inputs {
  _call: MintMultipleCall;

  constructor(call: MintMultipleCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _mintInfo(): Array<MintMultipleCall_mintInfoStruct> {
    return this._call.inputValues[1].value.toTupleArray<
      MintMultipleCall_mintInfoStruct
    >();
  }
}

export class MintMultipleCall__Outputs {
  _call: MintMultipleCall;

  constructor(call: MintMultipleCall) {
    this._call = call;
  }
}

export class MintMultipleCall_mintInfoStruct extends ethereum.Tuple {
  get recipient(): Address {
    return this[0].toAddress();
  }

  get share(): BigInt {
    return this[1].toBigInt();
  }
}

export class SetAUMScaledPerSecondsRateCall extends ethereum.Call {
  get inputs(): SetAUMScaledPerSecondsRateCall__Inputs {
    return new SetAUMScaledPerSecondsRateCall__Inputs(this);
  }

  get outputs(): SetAUMScaledPerSecondsRateCall__Outputs {
    return new SetAUMScaledPerSecondsRateCall__Outputs(this);
  }
}

export class SetAUMScaledPerSecondsRateCall__Inputs {
  _call: SetAUMScaledPerSecondsRateCall;

  constructor(call: SetAUMScaledPerSecondsRateCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _AUMScaledPerSecondsRate(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetAUMScaledPerSecondsRateCall__Outputs {
  _call: SetAUMScaledPerSecondsRateCall;

  constructor(call: SetAUMScaledPerSecondsRateCall) {
    this._call = call;
  }
}

export class SetBurningFeeInBPCall extends ethereum.Call {
  get inputs(): SetBurningFeeInBPCall__Inputs {
    return new SetBurningFeeInBPCall__Inputs(this);
  }

  get outputs(): SetBurningFeeInBPCall__Outputs {
    return new SetBurningFeeInBPCall__Outputs(this);
  }
}

export class SetBurningFeeInBPCall__Inputs {
  _call: SetBurningFeeInBPCall;

  constructor(call: SetBurningFeeInBPCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _burningFeeInBP(): i32 {
    return this._call.inputValues[1].value.toI32();
  }
}

export class SetBurningFeeInBPCall__Outputs {
  _call: SetBurningFeeInBPCall;

  constructor(call: SetBurningFeeInBPCall) {
    this._call = call;
  }
}

export class SetMintingFeeInBPCall extends ethereum.Call {
  get inputs(): SetMintingFeeInBPCall__Inputs {
    return new SetMintingFeeInBPCall__Inputs(this);
  }

  get outputs(): SetMintingFeeInBPCall__Outputs {
    return new SetMintingFeeInBPCall__Outputs(this);
  }
}

export class SetMintingFeeInBPCall__Inputs {
  _call: SetMintingFeeInBPCall;

  constructor(call: SetMintingFeeInBPCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _mintingFeeInBP(): i32 {
    return this._call.inputValues[1].value.toI32();
  }
}

export class SetMintingFeeInBPCall__Outputs {
  _call: SetMintingFeeInBPCall;

  constructor(call: SetMintingFeeInBPCall) {
    this._call = call;
  }
}

export class UpgradeToCall extends ethereum.Call {
  get inputs(): UpgradeToCall__Inputs {
    return new UpgradeToCall__Inputs(this);
  }

  get outputs(): UpgradeToCall__Outputs {
    return new UpgradeToCall__Outputs(this);
  }
}

export class UpgradeToCall__Inputs {
  _call: UpgradeToCall;

  constructor(call: UpgradeToCall) {
    this._call = call;
  }

  get newImplementation(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class UpgradeToCall__Outputs {
  _call: UpgradeToCall;

  constructor(call: UpgradeToCall) {
    this._call = call;
  }
}

export class UpgradeToAndCallCall extends ethereum.Call {
  get inputs(): UpgradeToAndCallCall__Inputs {
    return new UpgradeToAndCallCall__Inputs(this);
  }

  get outputs(): UpgradeToAndCallCall__Outputs {
    return new UpgradeToAndCallCall__Outputs(this);
  }
}

export class UpgradeToAndCallCall__Inputs {
  _call: UpgradeToAndCallCall;

  constructor(call: UpgradeToAndCallCall) {
    this._call = call;
  }

  get newImplementation(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get data(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class UpgradeToAndCallCall__Outputs {
  _call: UpgradeToAndCallCall;

  constructor(call: UpgradeToAndCallCall) {
    this._call = call;
  }
}

export class WithdrawCall extends ethereum.Call {
  get inputs(): WithdrawCall__Inputs {
    return new WithdrawCall__Inputs(this);
  }

  get outputs(): WithdrawCall__Outputs {
    return new WithdrawCall__Outputs(this);
  }
}

export class WithdrawCall__Inputs {
  _call: WithdrawCall;

  constructor(call: WithdrawCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class WithdrawCall__Outputs {
  _call: WithdrawCall;

  constructor(call: WithdrawCall) {
    this._call = call;
  }
}

export class WithdrawPlatformFeeOfCall extends ethereum.Call {
  get inputs(): WithdrawPlatformFeeOfCall__Inputs {
    return new WithdrawPlatformFeeOfCall__Inputs(this);
  }

  get outputs(): WithdrawPlatformFeeOfCall__Outputs {
    return new WithdrawPlatformFeeOfCall__Outputs(this);
  }
}

export class WithdrawPlatformFeeOfCall__Inputs {
  _call: WithdrawPlatformFeeOfCall;

  constructor(call: WithdrawPlatformFeeOfCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _recipient(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class WithdrawPlatformFeeOfCall__Outputs {
  _call: WithdrawPlatformFeeOfCall;

  constructor(call: WithdrawPlatformFeeOfCall) {
    this._call = call;
  }
}