import React, { useState } from 'react';
import './App.css';

function App() {
  const [contractId, setContractId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');

  const deployContract = async () => {
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });
      const result = await response.json();
      setTransactionStatus(`Deployed Successfully: ${result.txHash}`);
    } catch (error) {
      if (error instanceof Error) {
        setTransactionStatus(`Error: ${error.message}`);
      } else {
        setTransactionStatus('An unexpected error occurred.');
      }
    }
  };

  const interactWithContract = async () => {
    try {
      const response = await fetch('/api/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });
      const result = await response.json();
      setTransactionStatus(`Interaction Successful: ${result.message}`);
    } catch (error) {
      if (error instanceof Error) {
        setTransactionStatus(`Error: ${error.message}`);
      } else {
        setTransactionStatus('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Reflector Contract Manager</h1>
      <div className="input-container">
        <input
          type="text"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="Enter Contract ID"
          className="input-field"
        />
        <button className="btn deploy-btn" onClick={deployContract}>
          Deploy Contract
        </button>
        <button className="btn interact-btn" onClick={interactWithContract}>
          Interact with Contract
        </button>
      </div>
      {transactionStatus && <p className="status">{transactionStatus}</p>}
    </div>
  );
}

export default App;
