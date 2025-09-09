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
    contractId: "CAYN6HSE7E6MH2PYKQ6VPRLOUUQVX735UUMM45Y76IJETJUWU6K67IOA",
  }
} as const


export interface Mission {
  active: boolean;
  current_progress: i128;
  deadline: u64;
  id: u64;
  participants_count: u32;
  reward_pool: i128;
  target_liquidity: i128;
  trigger_price: i128;
}


export interface UserStake {
  contribution: i128;
  enlisted_at: u64;
  kale_staked: i128;
  mission_id: u64;
  user: string;
}


export interface PriceData {
  price: i128;
  timestamp: u64;
}

export type DataKey = {tag: "Admin", values: void} | {tag: "MissionCounter", values: void} | {tag: "Mission", values: readonly [u64]} | {tag: "UserStake", values: readonly [string, u64]} | {tag: "ReflectorReader", values: void} | {tag: "PriceThreshold", values: void} | {tag: "KaleToken", values: void};

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, reflector_reader, kale_token}: {admin: string, reflector_reader: string, kale_token: string}, options?: {
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
   * Construct and simulate a check_and_create_mission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  check_and_create_mission: ({caller}: {caller: string}, options?: {
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
  }) => Promise<AssembledTransaction<Option<u64>>>

  /**
   * Construct and simulate a create_mission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_mission: ({caller, target_liquidity, reward_pool, duration_hours, trigger_price}: {caller: string, target_liquidity: i128, reward_pool: i128, duration_hours: u64, trigger_price: i128}, options?: {
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
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a enlist transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  enlist: ({user, mission_id, kale_amount}: {user: string, mission_id: u64, kale_amount: i128}, options?: {
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
   * Construct and simulate a add_contribution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_contribution: ({user, mission_id, amount, proof}: {user: string, mission_id: u64, amount: i128, proof: Buffer}, options?: {
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
   * Construct and simulate a get_mission transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_mission: ({mission_id}: {mission_id: u64}, options?: {
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
  }) => Promise<AssembledTransaction<Mission>>

  /**
   * Construct and simulate a get_user_stake transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_stake: ({user, mission_id}: {user: string, mission_id: u64}, options?: {
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
  }) => Promise<AssembledTransaction<UserStake>>

  /**
   * Construct and simulate a get_current_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_current_price: (options?: {
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
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAB01pc3Npb24AAAAACAAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAABBjdXJyZW50X3Byb2dyZXNzAAAACwAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAScGFydGljaXBhbnRzX2NvdW50AAAAAAAEAAAAAAAAAAtyZXdhcmRfcG9vbAAAAAALAAAAAAAAABB0YXJnZXRfbGlxdWlkaXR5AAAACwAAAAAAAAANdHJpZ2dlcl9wcmljZQAAAAAAAAs=",
        "AAAAAQAAAAAAAAAAAAAACVVzZXJTdGFrZQAAAAAAAAUAAAAAAAAADGNvbnRyaWJ1dGlvbgAAAAsAAAAAAAAAC2VubGlzdGVkX2F0AAAAAAYAAAAAAAAAC2thbGVfc3Rha2VkAAAAAAsAAAAAAAAACm1pc3Npb25faWQAAAAAAAYAAAAAAAAABHVzZXIAAAAT",
        "AAAAAQAAAAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAOTWlzc2lvbkNvdW50ZXIAAAAAAAEAAAAAAAAAB01pc3Npb24AAAAAAQAAAAYAAAABAAAAAAAAAAlVc2VyU3Rha2UAAAAAAAACAAAAEwAAAAYAAAAAAAAAAAAAAA9SZWZsZWN0b3JSZWFkZXIAAAAAAAAAAAAAAAAOUHJpY2VUaHJlc2hvbGQAAAAAAAAAAAAAAAAACUthbGVUb2tlbgAAAA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABByZWZsZWN0b3JfcmVhZGVyAAAAEwAAAAAAAAAKa2FsZV90b2tlbgAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAYY2hlY2tfYW5kX2NyZWF0ZV9taXNzaW9uAAAAAQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAQAAA+gAAAAG",
        "AAAAAAAAAAAAAAAOY3JlYXRlX21pc3Npb24AAAAAAAUAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAQdGFyZ2V0X2xpcXVpZGl0eQAAAAsAAAAAAAAAC3Jld2FyZF9wb29sAAAAAAsAAAAAAAAADmR1cmF0aW9uX2hvdXJzAAAAAAAGAAAAAAAAAA10cmlnZ2VyX3ByaWNlAAAAAAAACwAAAAEAAAAG",
        "AAAAAAAAAAAAAAAGZW5saXN0AAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAKbWlzc2lvbl9pZAAAAAAABgAAAAAAAAALa2FsZV9hbW91bnQAAAAACwAAAAA=",
        "AAAAAAAAAAAAAAAQYWRkX2NvbnRyaWJ1dGlvbgAAAAQAAAAAAAAABHVzZXIAAAATAAAAAAAAAAptaXNzaW9uX2lkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABXByb29mAAAAAAAADgAAAAA=",
        "AAAAAAAAAAAAAAALZ2V0X21pc3Npb24AAAAAAQAAAAAAAAAKbWlzc2lvbl9pZAAAAAAABgAAAAEAAAfQAAAAB01pc3Npb24A",
        "AAAAAAAAAAAAAAAOZ2V0X3VzZXJfc3Rha2UAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAptaXNzaW9uX2lkAAAAAAAGAAAAAQAAB9AAAAAJVXNlclN0YWtlAAAA",
        "AAAAAAAAAAAAAAARZ2V0X2N1cnJlbnRfcHJpY2UAAAAAAAAAAAAAAQAAB9AAAAAJUHJpY2VEYXRhAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        check_and_create_mission: this.txFromJSON<Option<u64>>,
        create_mission: this.txFromJSON<u64>,
        enlist: this.txFromJSON<null>,
        add_contribution: this.txFromJSON<null>,
        get_mission: this.txFromJSON<Mission>,
        get_user_stake: this.txFromJSON<UserStake>,
        get_current_price: this.txFromJSON<PriceData>
  }
}