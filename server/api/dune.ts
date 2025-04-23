/**
 * Dune Analytics API Integration for Warplet Traders
 * Fetches real trading data based on wallet addresses
 */

import axios from 'axios';

interface DuneQueryParams {
  timeframe: string;
  walletAddresses: string[];
}

/**
 * Fetch trading data from Dune Analytics
 * @param params Query parameters (timeframe and wallet addresses)
 * @param apiKey Dune API key
 * @returns Trading data for the specified wallets
 */
export async function fetchTradingData(params: DuneQueryParams, apiKey: string) {
  try {
    const { timeframe, walletAddresses } = params;
    
    console.log(`Fetching trading data for ${walletAddresses.length} addresses with timeframe ${timeframe}`);
    
    // Prepare the wallet addresses for the Dune API
    // Convert all to lowercase for consistent matching
    const addresses = walletAddresses.map(addr => addr.toLowerCase());
    
    // Determine which query ID to use based on the timeframe
    // These are pre-created queries in Dune Analytics for Warplet traders
    const queryId = timeframe === '24h' ? '2786632' : '2786637';
    
    console.log(`Using Dune query ID: ${queryId}`);
    
    // First, execute the query
    const executeResponse = await axios.post(
      `https://api.dune.com/api/v1/query/${queryId}/execute`,
      { 
        parameters: {
          address_list: `{${addresses.join(',')}}` 
        }
      },
      {
        headers: {
          'x-dune-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Check if the execution was started successfully
    if (!executeResponse.data?.execution_id) {
      console.error('Failed to start Dune query execution:', executeResponse.data);
      throw new Error('Failed to start Dune query execution');
    }
    
    const executionId = executeResponse.data.execution_id;
    console.log(`Dune query execution started with ID: ${executionId}`);
    
    // Poll for the query results
    let statusResponse;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      // Wait to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check execution status
      statusResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        {
          headers: {
            'x-dune-api-key': apiKey
          }
        }
      );
      
      attempts++;
      console.log(`Checking Dune query status (${attempts}/${maxAttempts}): ${statusResponse.data?.state}`);
      
    } while (
      statusResponse.data?.state !== 'QUERY_STATE_COMPLETED' && 
      statusResponse.data?.state !== 'QUERY_STATE_FAILED' &&
      attempts < maxAttempts
    );
    
    // If the query failed or timed out
    if (statusResponse.data?.state !== 'QUERY_STATE_COMPLETED') {
      console.error('Dune query execution failed or timed out:', statusResponse.data);
      throw new Error('Dune query execution failed or timed out');
    }
    
    // Get the query results
    const resultsResponse = await axios.get(
      `https://api.dune.com/api/v1/execution/${executionId}/results`,
      {
        headers: {
          'x-dune-api-key': apiKey
        }
      }
    );
    
    // Check if the results contain rows
    if (!resultsResponse.data?.result?.rows) {
      console.error('No rows in Dune query results:', resultsResponse.data);
      return { rows: [] };
    }
    
    console.log(`Retrieved ${resultsResponse.data.result.rows.length} rows of trading data from Dune`);
    
    // Process and format data from Dune
    const formattedRows = resultsResponse.data.result.rows.map((row: any) => ({
      wallet_address: row.wallet_address.toLowerCase(),
      earnings: parseFloat(row.profit_loss).toFixed(2),
      volume: parseFloat(row.volume).toFixed(2),
      top_token: row.top_token
    }));
    
    return { rows: formattedRows };
  } catch (error) {
    console.error('Error fetching data from Dune:', error);
    return { rows: [] };
  }
}