import { 
  Server, 
  Contract, 
  Address, 
  nativeToScVal, 
  TransactionBuilder,
  Transaction
} from "soroban-client";
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
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const sourceAccount = await server.getAccount(wallet.address);
    
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
          nativeToScVal(BigInt(formData.triggerPrice), { type: "i128" })
        )
      )
      .setTimeout(30)
      .build();

    // Sign transaction and get the result object
    const signResult = await wallet.kit.signTransaction(transaction.toXDR());
    
    // Parse signed XDR back to Transaction object
    const signedTransaction = new Transaction(signResult.signedTxXdr, NETWORK_PASSPHRASE);
    
    // Send the transaction object
    const sendTxResponse = await server.sendTransaction(signedTransaction);
    
    return sendTxResponse;
  } catch (error) {
    console.error("Error creating mission:", error);
    throw error;
  }
}

export async function handleEnlist(missionId: string | number, amount: string | number, wallet: WalletInterface) {
  try {
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const sourceAccount = await server.getAccount(wallet.address);
    
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
  } catch (error) {
    console.error("Error enlisting in mission:", error);
    throw error;
  }
}

export async function handleContribute(missionId: string | number, amount: string | number, wallet: WalletInterface) {
  try {
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const sourceAccount = await server.getAccount(wallet.address);
    
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
  } catch (error) {
    console.error("Error contributing to mission:", error);
    throw error;
  }
}

export async function handleClaimRewards(missionId: string | number, wallet: WalletInterface) {
  try {
    const contract = new Contract(CONTRACT_ADDRESSES.MISSION_CONTROLLER);
    const sourceAccount = await server.getAccount(wallet.address);
    
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
  } catch (error) {
    console.error("Error claiming rewards:", error);
    throw error;
  }
}
