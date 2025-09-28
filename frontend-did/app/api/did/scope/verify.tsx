import React, { useState } from "react";

export default function VerifyDIDCredential() {
  const [didId, setDidId] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [scopeValues, setScopeValues] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!didId || !credentialId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch the DID object
      const res = await fetch(`/api/did/${didId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch DID");
        return;
      }

      const didObj = data.result.details.data.fields;

      // 2️⃣ Find the credential inside the DID
      const cred = didObj.credentials.find((c: any) => c.id === credentialId);
      if (!cred) {
        setError("Credential not found in DID");
        return;
      }

      // 3️⃣ Verify scopes
      let valid = true;
      for (let i = 0; i < scopes.length; i++) {
        const key = scopes[i];
        const expectedValue = scopeValues[i];
        const storedValue = cred.scope[key]; // assuming scope is an object { key: value }
        if (storedValue !== expectedValue) {
          valid = false;
          break;
        }
      }

      setResult(valid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">Verify DID Credential</h1>

      <input
        type="text"
        placeholder="DID ID"
        value={didId}
        onChange={(e) => setDidId(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        placeholder="Credential ID"
        value={credentialId}
        onChange={(e) => setCredentialId(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      {/* Simple scopes input, can be improved to dynamic array */}
      <input
        type="text"
        placeholder="Scopes (comma-separated)"
        onChange={(e) => setScopes(e.target.value.split(","))}
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        placeholder="Scope values (comma-separated)"
        onChange={(e) => setScopeValues(e.target.value.split(","))}
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {result !== null && (
        <p className={`mt-2 font-bold ${result ? "text-green-600" : "text-red-600"}`}>
          Credential is {result ? "valid ✅" : "invalid ❌"}
        </p>
      )}
    </div>
  );
}
