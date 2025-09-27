import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
interface UseDidManagerProps {
  packageId: string;
  moduleName: string;
  chain?: `${string}:${string}`;
}

// Helper to format arguments for Sui Move calls
// https://sdk.mystenlabs.com/typescript/transaction-building/basics#pure-values
function formatArg(tx: Transaction, arg: any) {
  // If it's an object id (string of 66 chars, starts with '0x'), treat as object
  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) {
    return tx.object(arg);
  }
  // If it's a vector, recursively format
  if (Array.isArray(arg)) {
    return arg.map((item) => formatArg(tx, item));
  }
  
  if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
    return tx.pure(Object.values(arg));
  }
  
  // For option::Option<T>, pass as null or value
  if (arg === null || arg === undefined) {
    return tx.pure(null);
  }
  // For everything else, treat as pure
  return tx.pure(arg);
}

export function useDidManager({ packageId, moduleName, chains }: UseDidManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  async function callMoveFunction(functionName: string, args: any[], typeArgs: string[] = []) {
    setLoading(true);
    setError(null);

    const tx = new Transaction();
	// https://sdk.mystenlabs.com/typescript/transaction-building/basics#transactions
    tx.moveCall({
      target: `${packageId}::${moduleName}::${functionName}`,
      arguments: args.map((arg) => formatArg(tx, arg)),
      typeArguments: typeArgs,
    });

    return new Promise((resolve, reject) => {
	 // https://sdk.mystenlabs.com/dapp-kit/wallet-hooks/useSignAndExecuteTransaction
      signAndExecuteTransaction(
        { transaction: tx, chain },
        {
          onSuccess: (result) => {
            setLoading(false);
            resolve(result);
          },
          onError: (err: any) => {
            setLoading(false);
            setError(err.message || 'Unknown error');
            reject(err);
          },
        }
      );
    });
  }

  return {
    loading,
    error,
    createDid: (authMethods: any[], controllersDid: string[], endpoints: any[], cid: string | null, clock: any, ctx: any) =>
      callMoveFunction('create', [authMethods, controllersDid, endpoints, cid, clock, ctx]),
    addController: (did: any, newController: string, clock: any) =>
      callMoveFunction('add_controller', [did, newController, clock]),
    updateCid: (did: any, newCid: string, clock: any) =>
      callMoveFunction('update_cid', [did, newCid, clock]),
    revokeDid: (did: any, clock: any) =>
      callMoveFunction('revoke', [did, clock]),
    reactivateDid: (did: any, clock: any) =>
      callMoveFunction('reactivate', [did, clock]),
  };
}