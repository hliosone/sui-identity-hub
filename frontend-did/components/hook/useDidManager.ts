import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { bcs } from '@mysten/bcs';

interface AuthenticationMethod {
  id: string;
  atype: string;
  controller: string; // Sui address
  publicKeyMultibase: string;
}

interface ServiceEndpoint {
  id: string;
  type: string;
  url: string;
}

interface UseDidManagerProps {
  packageId: string;
  moduleName: string;
  chain?: `${string}:${string}`;
}

// -------------------- Encoders --------------------
function encodeAuthenticationMethod(m: AuthenticationMethod) {
  return bcs.Tuple([bcs.String, bcs.String, bcs.Address, bcs.String]).serialize([
    m.id,
    m.atype,
    m.controller,
    m.publicKeyMultibase,
  ]);
}

function encodeServiceEndpoint(e: ServiceEndpoint) {
  return bcs.Tuple([bcs.String, bcs.String, bcs.String]).serialize([e.id, e.type, e.url]);
}

function encodeOptionString(s?: string) {
  return s === null || s === undefined ? undefined : bcs.String.serialize(s);
}

function encodeVectorAddress(addrs: string[]) {
  return bcs.vector(bcs.Address).serialize(addrs);
}

// -------------------- Argument Formatter --------------------
function formatArg(tx: Transaction, arg: any): any {
  if (arg === null || arg === undefined) return undefined; // Option::None

  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) {
    return tx.object(arg); // Object ID
  }

  if (arg instanceof Uint8Array) return arg; // pre-encoded BCS tuple

  if (Array.isArray(arg)) return arg.map((item) => formatArg(tx, item)); // recursively

  return arg; // already serialized scalar
}

// -------------------- Hook --------------------
export function useDidManager({ packageId, moduleName, chain = 'sui:devnet' }: UseDidManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  async function callMoveFunction(functionName: string, args: any[], typeArgs: string[] = []) {
    setLoading(true);
    setError(null);

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${moduleName}::${functionName}`,
      arguments: args.map((arg) => formatArg(tx, arg)),
      typeArguments: typeArgs,
    });

    return new Promise((resolve, reject) => {
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
    create: (
      //authMethods: AuthenticationMethod[],
      controllersDid: string[],
      //endpoints: ServiceEndpoint[],
      cid: string | null,
      clockId: string
    ) =>
      callMoveFunction('create', [
        //authMethods.map(encodeAuthenticationMethod),
        encodeVectorAddress(controllersDid),
        //endpoints.map(encodeServiceEndpoint),
        encodeOptionString(cid),
        tx.object(clockId),
      ]),

    addController: (didId: string, newController: string, clockId: string) =>
      callMoveFunction('add_controller', [tx.object(didId), tx.pure.address(newController), tx.object(clockId)]),

    updateCid: (didId: string, newCid: string, clockId: string) =>
      callMoveFunction('update_cid', [tx.object(didId), encodeOptionString(newCid), tx.object(clockId)]),

    revoke: (didId: string, clockId: string) =>
      callMoveFunction('revoke', [tx.object(didId), tx.object(clockId)]),

    reactivate: (didId: string, clockId: string) =>
      callMoveFunction('reactivate', [tx.object(didId), tx.object(clockId)]),
  };
}