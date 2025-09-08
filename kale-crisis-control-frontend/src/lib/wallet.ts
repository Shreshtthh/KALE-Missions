import { useState, useEffect } from "react";
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules 
} from "@creit.tech/stellar-wallets-kit";
import { Horizon } from "@stellar/stellar-sdk";
import { NETWORK } from "../config/contracts";

export interface WalletState {
  connected: boolean;
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

// Key for localStorage
const WALLET_STORAGE_KEY = 'kale-wallet-session';

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

      return { xlm: xlmBalance, kale: 0 };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { xlm: 0, kale: 0 };
    }
  };
  
  // Function to update and persist wallet state
  const updateWalletState = (newState: Partial<WalletState>) => {
    setWallet(prevState => {
      const updatedState = { ...prevState, ...newState };
      if (updatedState.connected && updatedState.address && updatedState.walletType) {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
          address: updatedState.address,
          walletType: updatedState.walletType,
        }));
      }
      return updatedState;
    });
  };

  const connectWallet = async (walletType: 'freighter' | 'xbull') => {
    try {
      await kit.setWallet(walletType);
      const { address } = await kit.getAddress();
      const balance = await fetchBalance(address);

      updateWalletState({
        connected: true,
        address,
        walletType,
        balance,
      });
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error);
      throw new Error(`Failed to connect to ${walletType} wallet`);
    }
  };

  const connectFreighter = () => connectWallet('freighter');
  const connectXBull = () => connectWallet('xbull');

  const disconnect = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
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

  // useEffect to restore session on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedSession) {
      const { address, walletType } = JSON.parse(savedSession);
      if (address && walletType) {
        // Restore state without re-prompting for connection
        (async () => {
          const balance = await fetchBalance(address);
          setWallet({
            connected: true,
            address,
            walletType,
            balance
          });
          // Silently set the wallet in the kit for subsequent actions
          await kit.setWallet(walletType);
        })();
      }
    }
  }, [kit]); // Add kit to dependency array

  return {
    wallet,
    connectFreighter,
    connectXBull,
    disconnect,
    signTransaction,
    kit,
  };
}