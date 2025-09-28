import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { bcs, fromHex, toHex } from '@mysten/bcs';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface UseDidManagerProps {
  packageId: string;
  moduleName: string;
  chain?: `${string}:${string}`;
}

const Address = bcs.bytes(32).transform({
  input: (val: string) => fromHex(val),
  output: (val: Uint8Array) => toHex(val),
});

const encodeOptionString = (s?: string | null) =>
  bcs.option(bcs.string()).serialize(s ?? null).toBytes();
const encodeVectorAddress = (a: string[]) =>
  bcs.vector(Address).serialize(a).toBytes();

function formatArg(tx: Transaction, arg: any): any {
  if (arg === null || arg === undefined) return undefined;
  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) return tx.object(arg);
  if (arg instanceof Uint8Array) return tx.pure(arg);
  if (Array.isArray(arg)) return arg.map((i) => formatArg(tx, i));
  return arg;
}

export function useDidManager({ packageId, moduleName, chain = 'sui:testnet' }: UseDidManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { primaryWallet } = useDynamicContext();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const currentAccountAddress = primaryWallet?.address;

  async function callMoveFunction(functionName: string, args: any[], typeArgs: string[] = []) {
    if (!currentAccountAddress) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${moduleName}::${functionName}`,
        arguments: args.map((arg) => formatArg(tx, arg)),
        typeArguments: typeArgs,
      });

      // Step 1: Build unsigned bytes
      const unsignedBytes = await tx.build({ client: undefined as any });

      // Step 2: Request gas sponsorship
      const res = await fetch('/api/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txBytes: Array.from(unsignedBytes),
          senderAddress: currentAccountAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gas sponsorship failed');

      // Step 3: Co-sign and execute
      return await new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: Buffer.from(Object.values(data.sponsoredBytes)).toString('base64'),
            chain,
            // signature: data.sponsorSignature, // sponsor's signature
          },
          {
            onSuccess: (result) => {
              setLoading(false);
              resolve(result);
            },
            onError: (err) => {
              setLoading(false);
              setError(err.message);
              reject(err);
            },
          }
        );
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }

  return {
    loading,
    error,
    create: (cid: string | null, /* controllersDid: string[], */ clockId: string) =>
      callMoveFunction('create', [encodeOptionString(cid), clockId]),
    addController: (didId: string, newController: string, clockId: string) =>
      callMoveFunction('add_controller', [didId, Address.serialize(newController).toBytes(), clockId]),
    updateCid: (didId: string, newCid: string, clockId: string) =>
      callMoveFunction('update_cid', [didId, encodeOptionString(newCid), clockId]),
    revoke: (didId: string, clockId: string) =>
      callMoveFunction('revoke', [didId, clockId]),
    reactivate: (didId: string, clockId: string) =>
      callMoveFunction('reactivate', [didId, clockId]),
  };
}
