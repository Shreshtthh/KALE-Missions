import { 
  Server, 
  Contract, 
  Address, 
  nativeToScVal, 
  TransactionBuilder,
  Transaction
} from "soroban-client";
import { Horizon } from "@stellar/stellar-sdk";
import { CONTRACT_ADDRESSES, NETWORK_PASSPHRASE, RPC_URL } from "../config/contracts";

const server = new Server(RPC_URL);

interface WalletInterface {
  kit: {
    signTransaction: (xdr: string) => Promise<{
      signedTxXdr: string;
      signerAddress?: string;
    }>;
  };
  address: string;
}

interface FormData {
  targetLiquidity: string | number;
  rewardPool: string | number;
  duration: string | number;
  triggerPrice: string | number;
}

export async function handleCreateMission(formData: FormData, wallet: WalletInterface) {
  try {
    console.log("1. Starting handleCreateMission");
    
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
    const sourceAccount = await horizon.loadAccount(wallet.address);
    
    console.log("2. Building transaction");
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "create_mission",
          new Address(wallet.address).toScVal(),
          nativeToScVal(BigInt(formData.targetLiquidity), { type: "i128" }),
          nativeToScVal(BigInt(formData.rewardPool), { type: "i128" }),
          nativeToScVal(BigInt(formData.duration), { type: "u64" }),
          nativeToScVal(BigInt(Math.round(Number(formData.triggerPrice) * 10**7)), { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();

    console.log("3. About to sign transaction");
    
    // Sign transaction (prompts Freighter - this works!)
    const signResult = await wallet.kit.signTransaction(transaction.toXDR());
    
    console.log("4. Transaction signed successfully");
    
    // Create signed transaction
    const signedTransaction = new Transaction(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    
    console.log("5. About to prepare transaction");
    
    try {
      // Send the prepared transaction directly with detailed error handling
      const sendTxResponse = await server.sendTransaction(
        await server.prepareTransaction(signedTransaction)
      );
      
      console.log("6. Transaction sent successfully:", sendTxResponse);
      return sendTxResponse;
      
    } catch (prepareError: unknown) {
      console.error("5. Prepare/Send error details:", {
        error: prepareError,
        message: prepareError instanceof Error ? prepareError.message : 'Unknown prepare error',
        stack: prepareError instanceof Error ? prepareError.stack : undefined
      });
      
      // Try sending without preparation as fallback
      console.log("6. Trying to send without preparation...");
      const sendTxResponse = await server.sendTransaction(signedTransaction);
      return sendTxResponse;
    }
    
  } catch (error: unknown) {
    console.error("Main error details:", {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      details: error && typeof error === 'object' && 'response' in error ? error.response : undefined
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Mission creation failed: ${errorMessage}`);
  }
}



export async function handleEnlist(missionId: string | number, amount: string | number, wallet: WalletInterface) {
  try {
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
    const sourceAccount = await horizon.loadAccount(wallet.address);
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "enlist",
          new Address(wallet.address).toScVal(),
          nativeToScVal(BigInt(missionId), { type: "u64" }),
          nativeToScVal(BigInt(amount), { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();
      
    const signResult = await wallet.kit.signTransaction(transaction.toXDR());
    const signedTransaction = new Transaction(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const sendTxResponse = await server.sendTransaction(signedTransaction);
    
    return sendTxResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error enlisting in mission:", errorMessage);
    throw new Error(`Enlistment failed: ${errorMessage}`);
  }
}

export async function handleContribute(missionId: string | number, amount: string | number, wallet: WalletInterface) {
  try {
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
    const sourceAccount = await horizon.loadAccount(wallet.address);
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "contribute",
          new Address(wallet.address).toScVal(),
          nativeToScVal(BigInt(missionId), { type: "u64" }),
          nativeToScVal(BigInt(amount), { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();
      
    const signResult = await wallet.kit.signTransaction(transaction.toXDR());
    const signedTransaction = new Transaction(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const sendTxResponse = await server.sendTransaction(signedTransaction);
    
    return sendTxResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error contributing to mission:", errorMessage);
    throw new Error(`Contribution failed: ${errorMessage}`);
  }
}

export async function handleClaimRewards(missionId: string | number, wallet: WalletInterface) {
  try {
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
    const sourceAccount = await horizon.loadAccount(wallet.address);
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          "claim_rewards",
          new Address(wallet.address).toScVal(),
          nativeToScVal(BigInt(missionId), { type: "u64" })
        )
      )
      .setTimeout(30)
      .build();
      
    const signResult = await wallet.kit.signTransaction(transaction.toXDR());
    const signedTransaction = new Transaction(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    const sendTxResponse = await server.sendTransaction(signedTransaction);
    
    return sendTxResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error claiming rewards:", errorMessage);
    throw new Error(`Reward claim failed: ${errorMessage}`);
  }
}
