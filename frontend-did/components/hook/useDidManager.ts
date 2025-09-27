import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { bcs, BcsType, fromHex, toHex } from '@mysten/bcs';

interface AuthenticationMethod {
  id: string;
  atype: string;
  controller: string; // Sui address as hex string
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

// -------------------- BCS Encoders --------------------

// Transform for Sui addresses (hex string <-> 32-byte array)
const Address = bcs.bytes(32).transform({
  input: (val: string) => fromHex(val),
  output: (val: Uint8Array) => toHex(val),
});

// Encode AuthenticationMethod as a BCS struct
const AuthenticationMethodBCS = bcs.struct('AuthenticationMethod', {
  id: bcs.string(),
  atype: bcs.string(),
  controller: Address,
  publicKeyMultibase: bcs.string(),
});

// Encode ServiceEndpoint as a BCS struct
const ServiceEndpointBCS = bcs.struct('ServiceEndpoint', {
  id: bcs.string(),
  type: bcs.string(),
  url: bcs.string(),
});

// Encode optional string (Option<String>)
function encodeOptionString(s?: string | null): Uint8Array | undefined {
  return bcs.option(bcs.string()).serialize(s ?? null).toBytes();
}

// Encode vector of addresses
function encodeVectorAddress(addrs: string[]): Uint8Array {
  return bcs.vector(Address).serialize(addrs).toBytes();
}

// Encode arrays of structs
function encodeStructArray<T>(arr: T[], structType: BcsType<T>): Uint8Array[] {
  return arr.map((item) => structType.serialize(item).toBytes());
}

// -------------------- Argument Formatter --------------------
function formatArg(tx: Transaction, arg: any): any {
  if (arg === null || arg === undefined) return undefined; // Option::None
  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) return tx.object(arg);
  if (arg instanceof Uint8Array) return tx.pure(arg);
  if (Array.isArray(arg)) return arg.map((item) => formatArg(tx, item));
  return arg;
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

    // -------------------- Move calls --------------------
    create: (
      controllersDid: string[],
      cid: string | null,
      clockId: string
    ) =>
      callMoveFunction('create', [
        encodeVectorAddress(controllersDid),
        encodeOptionString(cid),
        clockId, // pass clockId as string; tx.object() is handled in formatArg
      ]),

    addController: (didId: string, newController: string, clockId: string) =>
      callMoveFunction('add_controller', [
        didId,
        Address.serialize(newController).toBytes(),
        clockId,
      ]),

    updateCid: (didId: string, newCid: string, clockId: string) =>
      callMoveFunction('update_cid', [
        didId,
        encodeOptionString(newCid),
        clockId,
      ]),

    revoke: (didId: string, clockId: string) =>
      callMoveFunction('revoke', [didId, clockId]),

    reactivate: (didId: string, clockId: string) =>
      callMoveFunction('reactivate', [didId, clockId]),
  };
}