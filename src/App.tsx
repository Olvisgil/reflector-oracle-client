import React, { useState } from 'react';
import { SorobanRpc, Address, xdr} from '@stellar/stellar-sdk';
import './App.css';

function App() {
  const [contractId, setContractId] = useState('');
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [error, setError] = useState('');

  const getLedgerKeyScVal = (contractId: string, symbolText: xdr.ScVal) => {
    return xdr.LedgerKey.contractData({
      contract: Address.fromString(contractId).toScAddress(),
      key: symbolText,
      durability: xdr.ContractDataDurability.persistent()
    });
  };

  const fetchContractData = async () => {
    try {
      const server = new SorobanRpc.Server('https://mainnet.sorobanrpc.com');
      
      // Create ledger key for contract instance
      const keys = getLedgerKeyScVal(
        contractId,
        xdr.ScVal.scvLedgerKeyContractInstance()
      );

      // Fetch ledger entries
      const { entries } = await server.getLedgerEntries([keys]);
      if (!entries || entries.length === 0) {
        throw new Error('No contract data found');
      }

      const ledgerData = xdr.LedgerEntryData.fromXDR(entries[0].xdr, 'base64');
      // Process the data similar to the Python example
      // ... 

      setTimeSeriesData(/* processed data */);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Time Series Data Viewer</h1>
      <div className="input-container">
        <input
          type="text"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="Enter Contract ID"
          className="input-field"
        />
        <button className="btn fetch-btn" onClick={fetchContractData}>
          Fetch Data
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {timeSeriesData.length > 0 && (
        <div className="data-container">
          {/* Add visualization component here (e.g., chart.js) */}
          <pre>{JSON.stringify(timeSeriesData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
