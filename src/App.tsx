import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Time Series Data',
        data: [10, 20, 15, 30, 25],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  });

  const [deployStatus, setDeployStatus] = useState('');
  const [interactStatus, setInteractStatus] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleDeployContract = async () => {
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractName: 'MyContract',
          bytecode: '0x...contract bytecode...', // Replace with actual bytecode
          params: [], // Include any constructor params if necessary
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy contract');
      }

      const data = await response.json();
      setDeployStatus(`Deployment successful: Contract address is ${data.contractAddress}`);
    } catch (err: any) {
      setDeployStatus(`Error deploying contract: ${err.message}`);
    }
  };

  const handleInteractContract = async () => {
    try {
      const response = await fetch('/api/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: '0x...contract address...', // Replace with actual contract address
          method: 'setValue', // Example method name
          params: [42], // Example parameters for the method
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to interact with contract');
      }

      const data = await response.json();
      setInteractStatus(`Interaction successful: ${data.result}`);
    } catch (err: any) {
      setInteractStatus(`Error interacting with contract: ${err.message}`);
    }
  };

  const handleGenerateChart = () => {
    try {
      const parsedData = JSON.parse(inputValue);

      // Validate parsedData
      if (
        !Array.isArray(parsedData.labels) ||
        !Array.isArray(parsedData.datasets) ||
        parsedData.datasets.some((dataset: any) => !Array.isArray(dataset.data))
      ) {
        throw new Error('Invalid data format. Ensure it contains "labels" and "datasets" with "data".');
      }

      setChartData(parsedData);
      setError('');
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Reflector Time Series Data Viewer</h1>

      <div className="input-container">
        <textarea
          className="input"
          placeholder="Enter JSON data here"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button className="generate-button" onClick={handleGenerateChart}>
          Generate Chart
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="chart-container">
        <Line data={chartData} />
      </div>

      <div className="contract-actions">
        <button className="deploy-button" onClick={handleDeployContract}>
          Deploy Contract
        </button>
        <p>{deployStatus}</p>

        <button className="interact-button" onClick={handleInteractContract}>
          Interact with Contract
        </button>
        <p>{interactStatus}</p>
      </div>
    </div>
  );
}

export default App;
