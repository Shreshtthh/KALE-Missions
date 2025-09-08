import { useState, useEffect } from "react";
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules 
} from "@creit.tech/stellar-wallets-kit";
import { Horizon } from "@stellar/stellar-sdk";
import { NETWORK } from "../config/contracts";

export interface WalletState {
  connected: boolean

;
  address: string | null;
  walletType: "freighter" | "xbull" | null;
  balance: {
    xlm?: number;
    kale?: number;
  };
}

interface HorizonBalance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    walletType: null,
    balance: {},
  });

  const [kit] = useState(() => new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: '',
    modules: allowAllModules()
  }));

  // Use Horizon server for account data (not Soroban Server)
  const server = new Horizon.Server(NETWORK.rpcUrl);

  const fetchBalance = async (address: string) => {
    try {
      const account = await server.loadAccount(address);
      let xlmBalance = 0;
      
      account.balances.forEach((balance: HorizonBalance) => {
        if (balance.asset_type === 'native') {
          xlmBalance = parseFloat(balance.balance);
        }
      });

      return { xlm: xlmBalance, kale: 0 }; // Add KALE balance logic later
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { xlm: 0, kale: 0 };
    }
  };

  const connectFreighter = async () => {
    try {
      await kit.setWallet('freighter');
      // Use getAddress() instead of getPublicKey()
      const { address } = await kit.getAddress();
      const balance = await fetchBalance(address);
      
      setWallet({
        connected: true,
        address,
        walletType: 'freighter',
        balance,
      });
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      throw new Error('Failed to connect to Freighter wallet');
    }
  };

  const connectXBull = async () => {
    try {
      await kit.setWallet('xbull');
      // Use getAddress() instead of getPublicKey()
      const { address } = await kit.getAddress();
      const balance = await fetchBalance(address);
      
      setWallet({
        connected: true,
        address,
        walletType: 'xbull',
        balance,
      });
    } catch (error) {
      console.error('Error connecting to xBull:', error);
      throw new Error('Failed to connect to xBull wallet');
    }
  };

  const disconnect = () => {
    setWallet({
      connected: false,
      address: null,
      walletType: null,
      balance: {},
    });
    kit.disconnect();
  };

  const signTransaction = async (transactionXDR: string): Promise<string> => {
    try {
      if (!wallet.address) {
        throw new Error('No wallet connected');
      }
      
      const { signedTxXdr } = await kit.signTransaction(transactionXDR, {
        address: wallet.address,
        networkPassphrase: WalletNetwork.TESTNET
      });
      return signedTxXdr;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  };

  return {
    wallet,
    connectFreighter,
    connectXBull,
    disconnect,
    signTransaction,
    kit,
  };
}
