import { useState } from 'react';
import { Transaction, TransactionArgument } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

interface UseDidManagerProps {
  packageId: string;
  moduleName: string;
  chain?: `${string}:${string}`;
}

// Helper to format arguments for Sui Move calls
// https://sdk.mystenlabs.com/typescript/transaction-building/basics#pure-valuess
function formatArg(tx: Transaction, arg: any): TransactionArgument {
  // Null / undefined → Option::None
  if (arg === null || arg === undefined) return tx.pure(null);

  // Object id → object reference
  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) {
    return tx.object(arg);
  }

  // Arrays → recursively map each item
  if (Array.isArray(arg)) {
    // flatten nested arrays by encoding each element
    return tx.pure(arg.map((item) => {
      const formatted = formatArg(tx, item);
      // If formatted is array, spread it
      return Array.isArray(formatted) ? formatted : formatted;
    }).flat());
  }

  // Objects → assume already encoded tuple
  if (typeof arg === 'object') {
    return tx.pure(arg);
  }

  // Scalars → pure
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