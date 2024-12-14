import React, { useState, useCallback } from 'react';
import { rpc, TransactionBuilder, Memo, BASE_FEE, Operation, Account } from '@stellar/stellar-sdk';


/**
 * Utility function to round values.
 */
function getFactorOfValue(n) {
  const exponent = Math.floor(Math.log10(n));
  return Math.pow(10, exponent);
}

function roundValue(value) {
  if (value === 0) return value;
  const factor = getFactorOfValue(value);
  return Math.floor(((value * 2) / factor)) * factor;
}

/**
 * Builds a restore transaction.
 */
function getRestoreTransaction(simulationResponse, source, txOptions) {
  let fee = parseInt(BASE_FEE, 10);
  fee += parseInt(simulationResponse.restorePreamble.minResourceFee, 10);
  txOptions.fee = roundValue(fee).toString();

  const restoreTx = new TransactionBuilder(source, txOptions)
    .setSorobanData(simulationResponse.restorePreamble.transactionData.build())
    .addOperation(Operation.restoreFootprint({}))
    .build();

  return restoreTx;
}

/**
 * Builds a transaction with simulation and fee adjustment.
 */
async function buildTransaction(client, source, operation, options) {
  if (!options) throw new Error('options are required');

  const txBuilderOptions = { ...options };
  txBuilderOptions.memo = options.memo ? Memo.text(options.memo) : null;
  txBuilderOptions.networkPassphrase = client.network;
  txBuilderOptions.timebounds = options.timebounds;

  const transaction = new TransactionBuilder(new Account(source.accountId(), source.sequence.toString()), txBuilderOptions)
    .addOperation(operation)
    .build();

  const request = async (server) => await server.simulateTransaction(transaction);

  const simulationResponse = await makeServerRequest(client.sorobanRpcUrl, request);
  if (simulationResponse.error) throw new Error(simulationResponse.error);
  if (rpc.Api.isSimulationRestore(simulationResponse)) {
    console.info(`Simulation response is restore preamble. Contract ${client.contractId}. Building restore transaction.`);
    return getRestoreTransaction(simulationResponse, new Account(source.accountId(), source.sequence.toString()), txBuilderOptions);
  }

  const rawFee = Number(simulationResponse.minResourceFee);
  if (isNaN(rawFee)) throw new Error('Failed to get resource fee from the simulation response.');
  let resourceFee = BigInt(roundValue(rawFee));
  if (resourceFee < 10000000n) resourceFee = 10000000n;

  const resources = simulationResponse.transactionData._data.resources();
  const [rawInstructions, rawReadBytes, rawWriteBytes] = [
    resources.instructions(),
    resources.readBytes(),
    resources.writeBytes(),
  ];
  const [instructions, readBytes, writeBytes] = [
    roundValue(rawInstructions),
    roundValue(rawReadBytes),
    roundValue(rawWriteBytes),
  ];

  simulationResponse.transactionData.setResourceFee(resourceFee);
  simulationResponse.minResourceFee = resourceFee.toString();
  simulationResponse.transactionData.setResources(instructions, readBytes, writeBytes);

  const tx = rpc.assembleTransaction(transaction, simulationResponse, client.network).build();
  console.debug(`Transaction ${tx.hash().toString('hex')} cost: {cpuInsns: ${rawInstructions}:${instructions}, readBytes: ${rawReadBytes}:${readBytes}, writeBytes: ${rawWriteBytes}:${writeBytes}, fee: ${rawFee}:${resourceFee.toString()}`);

  return tx;
}

function useTransactionBuilder(client) {
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const buildTx = useCallback(async (source, operation, options) => {
    setLoading(true);
    try {
      const tx = await buildTransaction(client, source, operation, options);
      setTransaction(tx);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error building transaction:', error);
    }
  }, [client]);

  return {
    loading,
    transaction,
    buildTx,
  };
}

/**
 * Example React component using useTransactionBuilder
 */
const TransactionComponent = ({ client, source, operation, options }) => {
  const { loading, transaction, buildTx } = useTransactionBuilder(client);

  const handleBuildTransaction = () => {
    buildTx(source, operation, options);
  };

  return (
    <div>
      <button onClick={handleBuildTransaction} disabled={loading}>
        {loading ? 'Building Transaction...' : 'Build Transaction'}
      </button>
      {transaction && (
        <div>
          <h4>Transaction Details:</h4>
          <p>{transaction.hash().toString('hex')}</p>
          {/* Additional transaction details */}
        </div>
      )}
    </div>
  );
};

export default TransactionComponent;
