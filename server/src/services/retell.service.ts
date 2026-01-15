import axios from 'axios';

class RetellService {
  private apiKey: string;
  private agentId: string;
  private baseUrl: string = 'https://api.retellai.com';

  constructor() {
    this.apiKey = process.env.RETELL_API_KEY || '';
    this.agentId = process.env.RETELL_AGENT_ID || '';
  }

  async createWebCall(agentId?: string): Promise<{ access_token: string; call_id: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/create-web-call`,
        {
          agent_id: agentId || this.agentId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to create Retell web call:', error.response?.data || error.message);
      throw new Error('Failed to create interview session');
    }
  }

  async getCallDetails(callId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/get-call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
      const response = await axios.get(`${this.baseUrl}/list-calls`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
