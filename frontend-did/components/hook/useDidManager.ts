import { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

interface AuthenticationMethod {
  id: string;
  atype: string;
  controller: string;         // address as string
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
  chain?: string;
}

// Manual struct encoders
function encodeAuthenticationMethod(m: AuthenticationMethod) {
  return [m.id, m.atype, m.controller, m.publicKeyMultibase];
}

function encodeServiceEndpoint(e: ServiceEndpoint) {
  return [e.id, e.type, e.url];
}

// Helper to format arguments for Sui Move calls
function formatArg(tx: Transaction, arg: any) {
  // If it's an object id (string of 66 chars, starts with '0x'), treat as object
  if (typeof arg === 'string' && arg.startsWith('0x') && arg.length >= 66) {
    return tx.object(arg);
  }
  // If it's a vector of AuthenticationMethod
  if (Array.isArray(arg) && arg.length > 0 && typeof arg[0] === 'object' && 'publicKeyMultibase' in arg[0]) {
    return arg.map((item) => encodeAuthenticationMethod(item));
  }
  // If it's a vector of ServiceEndpoint
  if (Array.isArray(arg) && arg.length > 0 && typeof arg[0] === 'object' && 'url' in arg[0]) {
    return arg.map((item) => encodeServiceEndpoint(item));
  }
  // If it's a vector, recursively format
  if (Array.isArray(arg)) {
    return arg.map((item) => formatArg(tx, item));
  }
  // For option::Option<T>, pass as null or value
  if (arg === null || arg === undefined) {
    return tx.pure(null);
  }
  // For everything else, treat as pure
  return tx.pure(arg);
}

export function useDidManager({ packageId, moduleName, chain }: UseDidManagerProps) {
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
    // create(auth_methods: vector<AuthenticationMethod>, controllers_did: vector<address>, endpoints: vector<ServiceEndpoint>, _cid: option::Option<String>, clock: &Clock, ctx: &mut TxContext) : DID
    create: (
      //authMethods: AuthenticationMethod[], // array of AuthenticationMethod
      controllersDid: string[],           // array of address (string)
      //endpoints: ServiceEndpoint[],       // array of ServiceEndpoint
      cid: string | null,                 // Option<String>
      clockId: string                     // object id of Clock
    ) =>
      callMoveFunction('create', [
        //authMethods,
        controllersDid,
        //endpoints,
        cid,
        clockId,
      ]),

    // add_controller(did: &mut DID, new_controller: address, clock: &Clock)
    addController: (
      didId: string, // object id of DID
      newController: string, // address
      clockId: string // object id of Clock
    ) =>
      callMoveFunction('add_controller', [didId, newController, clockId]),

    // update_cid(did: &mut DID, new_cid: String, clock: &Clock)
    updateCid: (
      didId: string, // object id of DID
      newCid: string,
      clockId: string // object id of Clock
    ) =>
      callMoveFunction('update_cid', [didId, newCid, clockId]),

    // revoke(did: &mut DID, clock: &Clock)
    revoke: (
      didId: string, // object id of DID
      clockId: string // object id of Clock
    ) =>
      callMoveFunction('revoke', [didId, clockId]),

    // reactivate(did: &mut DID, clock: &Clock)
    reactivate: (
      didId: string, // object id of DID
      clockId: string // object id of Clock
    ) =>
      callMoveFunction('reactivate', [didId, clockId]),
  };
}