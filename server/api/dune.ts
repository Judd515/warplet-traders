import axios from 'axios';

interface DuneQueryParameters {
  timeframe: string;
  walletAddresses: string[];
}

interface DuneQueryResult {
  rows: Array<{
    wallet_address: string;
    username: string;
    top_token: string;
    pnl: number;
  }>;
}

// Function to fetch trading data from Dune Analytics
export async function fetchTradingData(
  params: DuneQueryParameters, 
  duneApiKey: string
): Promise<DuneQueryResult> {
  try {
    // Step 1: Execute the query with parameters
    const executeResponse = await axios.post(
      'https://api.dune.com/api/v1/query/execution',
      {
        query_parameters: {
          timeframe: params.timeframe,
          wallets: params.walletAddresses.join(',')
        }
      },
      {
        headers: {
          'x-dune-api-key': duneApiKey
        }
      }
    );
    
    const executionId = executeResponse.data.execution_id;
    
    // Step 2: Poll for the query results
    let status = 'pending';
    let results: DuneQueryResult = { rows: [] };
    
    while (status === 'pending') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
      
      const statusResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        {
          headers: {
            'x-dune-api-key': duneApiKey
          }
        }
      );
      
      status = statusResponse.data.state;
      
      if (status === 'completed') {
        const resultsResponse = await axios.get(
          `https://api.dune.com/api/v1/execution/${executionId}/results`,
          {
            headers: {
              'x-dune-api-key': duneApiKey
            }
          }
        );
        
        results = resultsResponse.data;
      } else if (status === 'failed') {
        throw new Error('Dune query execution failed');
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching data from Dune Analytics:', error);
    throw new Error('Failed to fetch trading data from Dune Analytics');
  }
}

// For cases where real API can't be used, fallback to mock data
export function processTradingData(addresses: Record<string, string>, timeframe: string): any[] {
  // This would normally process the Dune results, but for now just return
  // empty array that would be populated by real data from Dune
  return [];
}
