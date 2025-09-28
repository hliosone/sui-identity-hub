import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { bcs, fromHex, toHex } from '@mysten/bcs';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isSuiWallet } from '@dynamic-labs/sui';

// Types
interface UseDidManagerProps {
  packageId: string;
  moduleName: string;
  chain?: `${string}:${string}`;
  gasApiEndpoint?: string;
}

interface GasSponsorshipResponse {
  sponsoredBytes: number[];
  sponsorSignature: string;
  feePayerAddress: string;
}

interface TransactionResult {
  digest: string;
  effects?: any;
  events?: any[];
}

// BCS serializers
const Address = bcs.bytes(32).transform({
  input: (val: string) => fromHex(val),
  output: (val: Uint8Array) => toHex(val),
});

const OptionString = bcs.option(bcs.string());
const VectorAddress = bcs.vector(Address);

// Utility functions
const encodeOptionString = (s?: string | null): Uint8Array => 
  OptionString.serialize(s ?? null).toBytes();

const encodeVectorAddress = (addresses: string[]): Uint8Array => 
  VectorAddress.serialize(addresses).toBytes();

const encodeAddress = (address: string): Uint8Array => 
  Address.serialize(address).toBytes();

const formatTransactionArg = (tx: Transaction, arg: any): any => {
  if (arg === null || arg === undefined) return undefined;
  
  // Handle Sui objects (addresses starting with 0x and proper length)
  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) {
    return tx.object(arg);
  }
  
  // Handle pure data (Uint8Array)
  if (arg instanceof Uint8Array) {
    return tx.pure(arg);
  }
  
  // Handle arrays recursively
  if (Array.isArray(arg)) {
    return arg.map(item => formatTransactionArg(tx, item));
  }
  
  // Handle primitives
  return arg;
};

export function useDidManager({ 
  packageId, 
  moduleName,
  gasApiEndpoint = '/api/gas'
}: UseDidManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { primaryWallet } = useDynamicContext();

  const currentAccountAddress = primaryWallet?.address;

  // Core transaction execution with gas sponsorship
  const executeTransaction = async (
    functionName: string, 
    args: any[], 
    typeArgs: string[] = []
  ): Promise<TransactionResult> => {
    if (!currentAccountAddress) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    setLoading(true);
    setError(null);

    try {
      // Build the transaction
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${moduleName}::${functionName}`,
        arguments: args.map(arg => formatTransactionArg(tx, arg)),
        typeArguments: typeArgs,
      });

      // Get the wallet client before building the transaction
      const walletClient = await primaryWallet.getSuiClient();

      // Build transaction to get bytes for sponsorship
      const unsignedBytes = await tx.build({ client: walletClient as any });

      // Request gas sponsorship
      const sponsorshipResponse = await fetch(gasApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txBytes: Array.from(unsignedBytes),
          senderAddress: currentAccountAddress,
        }),
      });

      if (!sponsorshipResponse.ok) {
        const errorData = await sponsorshipResponse.json();
        throw new Error(errorData.error || 'Gas sponsorship request failed');
      }

      const sponsorshipData: GasSponsorshipResponse = await sponsorshipResponse.json();

      // Convert sponsored bytes back to Uint8Array
      const sponsoredTxBytes = new Uint8Array(sponsorshipData.sponsoredBytes);

      const sponsoredTx = Transaction.fromKind(sponsoredTxBytes);

      if (!primaryWallet || !isSuiWallet(primaryWallet)) {
        throw new Error('Connected wallet is not a Sui wallet');
      }

      // Get the wallet client again in case it changed
      const walletClientAgain = await primaryWallet.getSuiClient();

      // Ensure wallet client is available
      if (!walletClientAgain) {
        throw new Error('Failed to get Sui wallet client');
      }

      // Sign the transaction with the primary wallet
      // Note: Depending on the wallet SDK, you might need to adjust how signing is done
      // Sign the sponsored transaction
      const signedTx = await primaryWallet.signTransaction(sponsoredTx); // Use 'transaction' as required by the type

      // Execute the transaction
      const executionResult = await walletClient?.executeTransactionBlock({
        transactionBlock: signedTx.bytes,
        signature: [signedTx.signature, sponsorshipData.sponsorSignature],
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      setLoading(false);
      
      if (executionResult) {
        return executionResult as TransactionResult;
      } else {
        throw new Error('Transaction execution failed');
      }

    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  };

  // Function to read data from the blockchain (no transaction needed)
  const queryBlockchain = async (
    functionName: string,
    args: any[],
    typeArgs: string[] = []
  ) => {
    if (!currentAccountAddress) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    setError(null);

    try {
      const walletClient = await primaryWallet.getSuiClient();
      
      // Use devInspectTransactionBlock for read-only operations
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${moduleName}::${functionName}`,
        arguments: args.map(arg => formatTransactionArg(tx, arg)),
        typeArguments: typeArgs,
      });

      const unsignedTx = await tx.build({ client: walletClient as any });

      const result = await walletClient?.devInspectTransactionBlock({
        transactionBlock: unsignedTx,
        sender: currentAccountAddress,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  };

  // DID management functions
  const didOperations = {
    /**
     * Create a new DID with optional content identifier
     * @param cid - Optional content identifier (IPFS hash, etc.)
     * @param clockId - Clock object ID for timestamp management
     */
    create: async (cid: string | null, clockId: string): Promise<TransactionResult> => {
      return executeTransaction('create', [
        encodeOptionString(cid),
        clockId
      ]);
    },

    /**
     * Get DID string for a given address
     * @param registryId - The Registry object ID
     * @param address - The address to look up
     * @returns Promise<string> - The DID string or empty string if not found
     */
    getDidString: async (registryId: string, address: string): Promise<string> => {
      try {
        const result = await queryBlockchain('get_did_string', [
          registryId,
          encodeAddress(address)
        ]);

        // Parse the result to extract the DID string
        if (result?.results?.[0]?.returnValues?.[0]) {
          const returnValue = result.results[0].returnValues[0];
          // Convert bytes to string if needed
          if (returnValue[1] && Array.isArray(returnValue[1])) {
            return new TextDecoder().decode(new Uint8Array(returnValue[1]));
          }
        }
        
        return '';
      } catch (error) {
        console.error('Error fetching DID string:', error);
        return '';
      }
    },

    /**
     * Add a controller to an existing DID
     * @param didId - The DID object ID
     * @param newController - Address of the new controller
     * @param clockId - Clock object ID
     */
    addController: async (
      didId: string, 
      newController: string, 
      clockId: string
    ): Promise<TransactionResult> => {
      return executeTransaction('add_controller', [
        didId,
        encodeAddress(newController),
        clockId
      ]);
    },

    /**
     * Update the content identifier of a DID
     * @param didId - The DID object ID
     * @param newCid - New content identifier
     * @param clockId - Clock object ID
     */
    updateCid: async (
      didId: string, 
      newCid: string, 
      clockId: string
    ): Promise<TransactionResult> => {
      return executeTransaction('update_cid', [
        didId,
        encodeOptionString(newCid),
        clockId
      ]);
    },

    /**
     * Revoke/deactivate a DID
     * @param didId - The DID object ID
     * @param clockId - Clock object ID
     */
    revoke: async (didId: string, clockId: string): Promise<TransactionResult> => {
      return executeTransaction('revoke', [didId, clockId]);
    },

    /**
     * Reactivate a previously revoked DID
     * @param didId - The DID object ID
     * @param clockId - Clock object ID
     */
    reactivate: async (didId: string, clockId: string): Promise<TransactionResult> => {
      return executeTransaction('reactivate', [didId, clockId]);
    },

    /**
     * Remove a controller from a DID (if your Move module supports it)
     * @param didId - The DID object ID
     * @param controllerToRemove - Address of the controller to remove
     * @param clockId - Clock object ID
     */
    removeController: async (
      didId: string, 
      controllerToRemove: string, 
      clockId: string
    ): Promise<TransactionResult> => {
      return executeTransaction('remove_controller', [
        didId,
        encodeAddress(controllerToRemove),
        clockId
      ]);
    }
  };

  // Utility functions
  const clearError = () => setError(null);
  
  const isConnected = Boolean(currentAccountAddress);

  return {
    // State
    loading,
    error,
    isConnected,
    currentAccountAddress,

    // Operations
    ...didOperations,

    // Utilities
    clearError,
    
    // Raw execution for custom operations
    executeCustom: executeTransaction,
    queryCustom: queryBlockchain,
  };
}

// Export utility functions for external use
export {
  encodeOptionString,
  encodeVectorAddress,
  encodeAddress,
  Address,
  OptionString,
  VectorAddress,
};