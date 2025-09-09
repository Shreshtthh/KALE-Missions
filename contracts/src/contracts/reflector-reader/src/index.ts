import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CB2JLA7X5TE7KUC2CHSWUU2QJO6Q3HLVTD3BIK65HNE2NPHTS434VDCJ",
  }
} as const

export type Asset = {tag: "Stellar", values: readonly [string]} | {tag: "Other", values: readonly [string]};


export interface PriceData {
  price: i128;
  timestamp: u64;
}

export type DataKey = {tag: "ReflectorOracle", values: void} | {tag: "LastPrice", values: void} | {tag: "PriceHistory", values: readonly [u64]};

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({reflector_oracle_address}: {reflector_oracle_address: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_btc_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_btc_price: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PriceData>>

  /**
   * Construct and simulate a get_xlm_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_xlm_price: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PriceData>>

  /**
   * Construct and simulate a get_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_price: ({asset_symbol}: {asset_symbol: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PriceData>>

  /**
   * Construct and simulate a check_price_drop_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  check_price_drop_threshold: ({asset_symbol, threshold_percent}: {asset_symbol: string, threshold_percent: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_gbp_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_gbp_price: ({forex_oracle_address}: {forex_oracle_address: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PriceData>>

  /**
   * Construct and simulate a get_cross_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_cross_price: ({base_asset_symbol, quote_asset_symbol}: {base_asset_symbol: string, quote_asset_symbol: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PriceData>>

  /**
   * Construct and simulate a chk_drop transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  chk_drop: ({threshold_percentage}: {threshold_percentage: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_oracle_decimals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_oracle_decimals: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_price_history transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_price_history: ({from_timestamp, to_timestamp}: {from_timestamp: u64, to_timestamp: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<readonly [u64, i128]>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR",
        "AAAAAQAAAAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAD1JlZmxlY3Rvck9yYWNsZQAAAAAAAAAAAAAAAAlMYXN0UHJpY2UAAAAAAAABAAAAAAAAAAxQcmljZUhpc3RvcnkAAAABAAAABg==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAYcmVmbGVjdG9yX29yYWNsZV9hZGRyZXNzAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAANZ2V0X2J0Y19wcmljZQAAAAAAAAAAAAABAAAH0AAAAAlQcmljZURhdGEAAAA=",
        "AAAAAAAAAAAAAAANZ2V0X3hsbV9wcmljZQAAAAAAAAAAAAABAAAH0AAAAAlQcmljZURhdGEAAAA=",
        "AAAAAAAAAAAAAAAJZ2V0X3ByaWNlAAAAAAAAAQAAAAAAAAAMYXNzZXRfc3ltYm9sAAAAEQAAAAEAAAfQAAAACVByaWNlRGF0YQAAAA==",
        "AAAAAAAAAAAAAAAaY2hlY2tfcHJpY2VfZHJvcF90aHJlc2hvbGQAAAAAAAIAAAAAAAAADGFzc2V0X3N5bWJvbAAAABEAAAAAAAAAEXRocmVzaG9sZF9wZXJjZW50AAAAAAAABAAAAAEAAAAB",
        "AAAAAAAAAAAAAAANZ2V0X2dicF9wcmljZQAAAAAAAAEAAAAAAAAAFGZvcmV4X29yYWNsZV9hZGRyZXNzAAAAEwAAAAEAAAfQAAAACVByaWNlRGF0YQAAAA==",
        "AAAAAAAAAAAAAAAPZ2V0X2Nyb3NzX3ByaWNlAAAAAAIAAAAAAAAAEWJhc2VfYXNzZXRfc3ltYm9sAAAAAAAAEQAAAAAAAAAScXVvdGVfYXNzZXRfc3ltYm9sAAAAAAARAAAAAQAAB9AAAAAJUHJpY2VEYXRhAAAA",
        "AAAAAAAAAAAAAAAIY2hrX2Ryb3AAAAABAAAAAAAAABR0aHJlc2hvbGRfcGVyY2VudGFnZQAAAAQAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAATZ2V0X29yYWNsZV9kZWNpbWFscwAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAARZ2V0X3ByaWNlX2hpc3RvcnkAAAAAAAACAAAAAAAAAA5mcm9tX3RpbWVzdGFtcAAAAAAABgAAAAAAAAAMdG9fdGltZXN0YW1wAAAABgAAAAEAAAPqAAAD7QAAAAIAAAAGAAAACw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        get_btc_price: this.txFromJSON<PriceData>,
        get_xlm_price: this.txFromJSON<PriceData>,
        get_price: this.txFromJSON<PriceData>,
        check_price_drop_threshold: this.txFromJSON<boolean>,
        get_gbp_price: this.txFromJSON<PriceData>,
        get_cross_price: this.txFromJSON<PriceData>,
        chk_drop: this.txFromJSON<boolean>,
        get_oracle_decimals: this.txFromJSON<u32>,
        get_price_history: this.txFromJSON<Array<readonly [u64, i128]>>
  }
}