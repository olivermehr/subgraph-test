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

export class SetVaultController extends ethereum.Event {
  get params(): SetVaultController__Params {
    return new SetVaultController__Params(this);
  }
}

export class SetVaultController__Params {
  _event: SetVaultController;

  constructor(event: SetVaultController) {
    this._event = event;
  }

  get vaultController(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class UpdateDeposit extends ethereum.Event {
  get params(): UpdateDeposit__Params {
    return new UpdateDeposit__Params(this);
  }
}

export class UpdateDeposit__Params {
  _event: UpdateDeposit;

  constructor(event: UpdateDeposit) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get depositedAmount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class VTokenTransfer extends ethereum.Event {
  get params(): VTokenTransfer__Params {
    return new VTokenTransfer__Params(this);
  }
}

export class VTokenTransfer__Params {
  _event: VTokenTransfer;

  constructor(event: VTokenTransfer) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class vault__assetDataOfResultValue0Struct extends ethereum.Tuple {
  get maxShares(): BigInt {
    return this[0].toBigInt();
  }

  get amountInAsset(): BigInt {
    return this[1].toBigInt();
  }
}

export class vault__shareChangeResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getNewShares(): BigInt {
    return this.value0;
  }

  getOldShares(): BigInt {
    return this.value1;
  }
}

export class vault extends ethereum.SmartContract {
  static bind(address: Address): vault {
    return new vault("vault", address);
  }

  asset(): Address {
    let result = super.call("asset", "asset():(address)", []);

    return result[0].toAddress();
  }

  try_asset(): ethereum.CallResult<Address> {
    let result = super.tryCall("asset", "asset():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  assetBalanceForShares(_shares: BigInt): BigInt {
    let result = super.call(
      "assetBalanceForShares",
      "assetBalanceForShares(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(_shares)]
    );

    return result[0].toBigInt();
  }

  try_assetBalanceForShares(_shares: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "assetBalanceForShares",
      "assetBalanceForShares(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(_shares)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  assetBalanceOf(_account: Address): BigInt {
    let result = super.call(
      "assetBalanceOf",
      "assetBalanceOf(address):(uint256)",
      [ethereum.Value.fromAddress(_account)]
    );

    return result[0].toBigInt();
  }

  try_assetBalanceOf(_account: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "assetBalanceOf",
      "assetBalanceOf(address):(uint256)",
      [ethereum.Value.fromAddress(_account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  assetDataOf(
    _account: Address,
    _shares: BigInt
  ): vault__assetDataOfResultValue0Struct {
    let result = super.call(
      "assetDataOf",
      "assetDataOf(address,uint256):((uint256,uint256))",
      [
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromUnsignedBigInt(_shares)
      ]
    );

    return changetype<vault__assetDataOfResultValue0Struct>(
      result[0].toTuple()
    );
  }

  try_assetDataOf(
    _account: Address,
    _shares: BigInt
  ): ethereum.CallResult<vault__assetDataOfResultValue0Struct> {
    let result = super.tryCall(
      "assetDataOf",
      "assetDataOf(address,uint256):((uint256,uint256))",
      [
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromUnsignedBigInt(_shares)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<vault__assetDataOfResultValue0Struct>(value[0].toTuple())
    );
  }

  balanceOf(_account: Address): BigInt {
    let result = super.call("balanceOf", "balanceOf(address):(uint256)", [
      ethereum.Value.fromAddress(_account)
    ]);

    return result[0].toBigInt();
  }

  try_balanceOf(_account: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("balanceOf", "balanceOf(address):(uint256)", [
      ethereum.Value.fromAddress(_account)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  burn(_recipient: Address): BigInt {
    let result = super.call("burn", "burn(address):(uint256)", [
      ethereum.Value.fromAddress(_recipient)
    ]);

    return result[0].toBigInt();
  }

  try_burn(_recipient: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("burn", "burn(address):(uint256)", [
      ethereum.Value.fromAddress(_recipient)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  burnFor(_recipient: Address): BigInt {
    let result = super.call("burnFor", "burnFor(address):(uint256)", [
      ethereum.Value.fromAddress(_recipient)
    ]);

    return result[0].toBigInt();
  }

  try_burnFor(_recipient: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("burnFor", "burnFor(address):(uint256)", [
      ethereum.Value.fromAddress(_recipient)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  currentDepositedPercentageInBP(): BigInt {
    let result = super.call(
      "currentDepositedPercentageInBP",
      "currentDepositedPercentageInBP():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_currentDepositedPercentageInBP(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "currentDepositedPercentageInBP",
      "currentDepositedPercentageInBP():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  deposited(): BigInt {
    let result = super.call("deposited", "deposited():(uint256)", []);

    return result[0].toBigInt();
  }

  try_deposited(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("deposited", "deposited():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  lastAssetBalance(): BigInt {
    let result = super.call(
      "lastAssetBalance",
      "lastAssetBalance():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_lastAssetBalance(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "lastAssetBalance",
      "lastAssetBalance():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  lastAssetBalanceOf(_account: Address): BigInt {
    let result = super.call(
      "lastAssetBalanceOf",
      "lastAssetBalanceOf(address):(uint256)",
      [ethereum.Value.fromAddress(_account)]
    );

    return result[0].toBigInt();
  }

  try_lastAssetBalanceOf(_account: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "lastAssetBalanceOf",
      "lastAssetBalanceOf(address):(uint256)",
      [ethereum.Value.fromAddress(_account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  mint(): BigInt {
    let result = super.call("mint", "mint():(uint256)", []);

    return result[0].toBigInt();
  }

  try_mint(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("mint", "mint():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  mintFor(_recipient: Address): BigInt {
    let result = super.call("mintFor", "mintFor(address):(uint256)", [
      ethereum.Value.fromAddress(_recipient)
    ]);

    return result[0].toBigInt();
  }

  try_mintFor(_recipient: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall("mintFor", "mintFor(address):(uint256)", [
      ethereum.Value.fromAddress(_recipient)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  mintableShares(_amount: BigInt): BigInt {
    let result = super.call(
      "mintableShares",
      "mintableShares(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(_amount)]
    );

    return result[0].toBigInt();
  }

  try_mintableShares(_amount: BigInt): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "mintableShares",
      "mintableShares(uint256):(uint256)",
      [ethereum.Value.fromUnsignedBigInt(_amount)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  registry(): Address {
    let result = super.call("registry", "registry():(address)", []);

    return result[0].toAddress();
  }

  try_registry(): ethereum.CallResult<Address> {
    let result = super.tryCall("registry", "registry():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  shareChange(
    _account: Address,
    _amountInAsset: BigInt
  ): vault__shareChangeResult {
    let result = super.call(
      "shareChange",
      "shareChange(address,uint256):(uint256,uint256)",
      [
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromUnsignedBigInt(_amountInAsset)
      ]
    );

    return new vault__shareChangeResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try_shareChange(
    _account: Address,
    _amountInAsset: BigInt
  ): ethereum.CallResult<vault__shareChangeResult> {
    let result = super.tryCall(
      "shareChange",
      "shareChange(address,uint256):(uint256,uint256)",
      [
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromUnsignedBigInt(_amountInAsset)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new vault__shareChangeResult(value[0].toBigInt(), value[1].toBigInt())
    );
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

  totalAssetSupply(): BigInt {
    let result = super.call(
      "totalAssetSupply",
      "totalAssetSupply():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_totalAssetSupply(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalAssetSupply",
      "totalAssetSupply():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalSupply(): BigInt {
    let result = super.call("totalSupply", "totalSupply():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalSupply(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("totalSupply", "totalSupply():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  vaultController(): Address {
    let result = super.call(
      "vaultController",
      "vaultController():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_vaultController(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "vaultController",
      "vaultController():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  virtualTotalAssetSupply(): BigInt {
    let result = super.call(
      "virtualTotalAssetSupply",
      "virtualTotalAssetSupply():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_virtualTotalAssetSupply(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "virtualTotalAssetSupply",
      "virtualTotalAssetSupply():(uint256)",
      []
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

  get _recipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class BurnCall__Outputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }

  get amount(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class BurnForCall extends ethereum.Call {
  get inputs(): BurnForCall__Inputs {
    return new BurnForCall__Inputs(this);
  }

  get outputs(): BurnForCall__Outputs {
    return new BurnForCall__Outputs(this);
  }
}

export class BurnForCall__Inputs {
  _call: BurnForCall;

  constructor(call: BurnForCall) {
    this._call = call;
  }

  get _recipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class BurnForCall__Outputs {
  _call: BurnForCall;

  constructor(call: BurnForCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class DepositCall extends ethereum.Call {
  get inputs(): DepositCall__Inputs {
    return new DepositCall__Inputs(this);
  }

  get outputs(): DepositCall__Outputs {
    return new DepositCall__Outputs(this);
  }
}

export class DepositCall__Inputs {
  _call: DepositCall;

  constructor(call: DepositCall) {
    this._call = call;
  }
}

export class DepositCall__Outputs {
  _call: DepositCall;

  constructor(call: DepositCall) {
    this._call = call;
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

  get _asset(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _registry(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
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
}

export class MintCall__Outputs {
  _call: MintCall;

  constructor(call: MintCall) {
    this._call = call;
  }

  get shares(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class MintForCall extends ethereum.Call {
  get inputs(): MintForCall__Inputs {
    return new MintForCall__Inputs(this);
  }

  get outputs(): MintForCall__Outputs {
    return new MintForCall__Outputs(this);
  }
}

export class MintForCall__Inputs {
  _call: MintForCall;

  constructor(call: MintForCall) {
    this._call = call;
  }

  get _recipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class MintForCall__Outputs {
  _call: MintForCall;

  constructor(call: MintForCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class SetControllerCall extends ethereum.Call {
  get inputs(): SetControllerCall__Inputs {
    return new SetControllerCall__Inputs(this);
  }

  get outputs(): SetControllerCall__Outputs {
    return new SetControllerCall__Outputs(this);
  }
}

export class SetControllerCall__Inputs {
  _call: SetControllerCall;

  constructor(call: SetControllerCall) {
    this._call = call;
  }

  get _vaultController(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetControllerCall__Outputs {
  _call: SetControllerCall;

  constructor(call: SetControllerCall) {
    this._call = call;
  }
}

export class SyncCall extends ethereum.Call {
  get inputs(): SyncCall__Inputs {
    return new SyncCall__Inputs(this);
  }

  get outputs(): SyncCall__Outputs {
    return new SyncCall__Outputs(this);
  }
}

export class SyncCall__Inputs {
  _call: SyncCall;

  constructor(call: SyncCall) {
    this._call = call;
  }
}

export class SyncCall__Outputs {
  _call: SyncCall;

  constructor(call: SyncCall) {
    this._call = call;
  }
}

export class TransferCall extends ethereum.Call {
  get inputs(): TransferCall__Inputs {
    return new TransferCall__Inputs(this);
  }

  get outputs(): TransferCall__Outputs {
    return new TransferCall__Outputs(this);
  }
}

export class TransferCall__Inputs {
  _call: TransferCall;

  constructor(call: TransferCall) {
    this._call = call;
  }

  get _recipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class TransferCall__Outputs {
  _call: TransferCall;

  constructor(call: TransferCall) {
    this._call = call;
  }
}

export class TransferAssetCall extends ethereum.Call {
  get inputs(): TransferAssetCall__Inputs {
    return new TransferAssetCall__Inputs(this);
  }

  get outputs(): TransferAssetCall__Outputs {
    return new TransferAssetCall__Outputs(this);
  }
}

export class TransferAssetCall__Inputs {
  _call: TransferAssetCall;

  constructor(call: TransferAssetCall) {
    this._call = call;
  }

  get _recipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class TransferAssetCall__Outputs {
  _call: TransferAssetCall;

  constructor(call: TransferAssetCall) {
    this._call = call;
  }
}

export class TransferFromCall extends ethereum.Call {
  get inputs(): TransferFromCall__Inputs {
    return new TransferFromCall__Inputs(this);
  }

  get outputs(): TransferFromCall__Outputs {
    return new TransferFromCall__Outputs(this);
  }
}

export class TransferFromCall__Inputs {
  _call: TransferFromCall;

  constructor(call: TransferFromCall) {
    this._call = call;
  }

  get _from(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _to(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _shares(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class TransferFromCall__Outputs {
  _call: TransferFromCall;

  constructor(call: TransferFromCall) {
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
}

export class WithdrawCall__Outputs {
  _call: WithdrawCall;

  constructor(call: WithdrawCall) {
    this._call = call;
  }
}
