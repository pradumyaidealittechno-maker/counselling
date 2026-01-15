import axios from 'axios';

class RetellService {
  private baseUrl: string = 'https://api.retellai.com';

  async createWebCall(agentId?: string): Promise<{ access_token: string; call_id: string }> {
    try {
      // Read from process.env directly at runtime, not in constructor
      const apiKey = process.env.RETELL_API_KEY;
      const defaultAgentId = process.env.RETELL_AGENT_ID;
      
      console.log('🔑 Creating Retell web call with agent:', agentId || defaultAgentId);
      console.log('   API Key length:', apiKey?.length || 0);
      
      if (!apiKey) {
        throw new Error('RETELL_API_KEY not configured in .env file');
      }

      const response = await axios.post(
        `${this.baseUrl}/v2/create-web-call`,
        {
          agent_id: agentId || defaultAgentId,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Retell web call created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Retell API Error Details:');
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      console.error('   Full Response:', JSON.stringify(error.response?.data, null, 2));
      
      throw new Error(error.response?.data?.message || 'Failed to create interview session');
    }
  }

  async getCallDetails(callId: string): Promise<any> {
    try {
      const apiKey = process.env.RETELL_API_KEY;
      
      const response = await axios.get(`${this.baseUrl}/get-call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get call details:', error.response?.data || error.message);
      throw error;
    }
  }

  async listCalls(limit: number = 100): Promise<any> {
    try {
      const apiKey = process.env.RETELL_API_KEY;
      
      const response = await axios.get(`${this.baseUrl}/list-calls`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        params: { limit },
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to list calls:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new RetellService();
