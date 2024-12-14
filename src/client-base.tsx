import React, { useState, useEffect } from 'react';
import { Contract, xdr, Operation } from '@stellar/stellar-sdk';
import { buildTransaction } from './rpc-helper';

/**
 * @typedef {import('soroban-client').Account} Account
 */

const ContractClientBase = ({ network, sorobanRpcUrl, contractId }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContract(new Contract(contractId));
  }, [contractId]);

  /**
   * Builds a transaction for updating the contract
   * @param {Account} source - Account object
   * @param {{admin: string, wasmHash: string}} updateContractData - Wasm hash
   * @param {TxOptions} options - Transaction options
   * @returns {Promise<Transaction>} Prepared transaction
   */
  const updateContract = async (source, updateContractData, options) => {
    setLoading(true);
    try {
      const invocation = Operation.invokeContractFunction({
        source: updateContractData.admin,
        contract: contractId,
        function: 'update_contract',
        args: [xdr.ScVal.scvBytes(Buffer.from(updateContractData.wasmHash, 'hex'))],
      });

      const transaction = await buildTransaction(
        { contractId, contract, network, sorobanRpcUrl },
        source,
        invocation,
        options
      );
      setLoading(false);
      return transaction;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * Builds a transaction to get admin
   * @param {Account} source - Account object
   * @param {TxOptions} options - Transaction options
   * @returns {Promise<Transaction>} Prepared transaction
   */
  const getAdmin = async (source, options) => {
    setLoading(true);
    try {
      const transaction = await buildTransaction(
        { contractId, contract, network, sorobanRpcUrl },
        source,
        contract.call('admin'),
        options
      );
      setLoading(false);
      return transaction;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * Builds a transaction to get contract major version
   * @param {Account} source - Account object
   * @param {TxOptions} options - Transaction options
   * @returns {Promise<Transaction>} Prepared transaction
   */
  const getVersion = async (source, options) => {
    setLoading(true);
    try {
      const transaction = await buildTransaction(
        { contractId, contract, network, sorobanRpcUrl },
        source,
        contract.call('version'),
        options
      );
      setLoading(false);
      return transaction;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Contract ID: {contractId}</h2>
      {/* Add UI for interacting with the contract */}
      {/* For example, buttons for updateContract, getAdmin, and getVersion */}
    </div>
  );
};

export default ContractClientBase;
