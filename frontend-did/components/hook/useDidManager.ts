import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';

interface UseDidManagerProps {
  packageId: string;
  moduleName: string;
  chain?: string;
}

export function useDidManager({ packageId, moduleName, chain = 'sui:devnet' }: UseDidManagerProps) {
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
      arguments: args,
      typeArguments: typeArgs,
    });

    return new Promise((resolve, reject) => {
	 // https://sdk.mystenlabs.com/typescript/sui-client#signandexecutetransaction
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