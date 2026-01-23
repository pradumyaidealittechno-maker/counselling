import axios from 'axios';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  candidateName?: string;
  interviewLink?: string;
  interviewCode?: string;
}

export interface InterviewQuestionsPayload {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceLevel: string;
  jobDNA?: any;
}

export interface InterviewResultPayload {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewData: any;
  transcript: any[];
  duration: number;
  recordingUrl?: string;
}

class N8nService {
  constructor() { }

  private get questionsWebhook(): string {
    return process.env.N8N_WEBHOOK_INTERVIEW_QUESTIONS || '';
  }

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    try {
      const emailWebhook = process.env.N8N_WEBHOOK_EMAIL;

      if (!emailWebhook) {
        console.warn('⚠️  N8N_WEBHOOK_EMAIL not configured in .env');
        return false;
      }

      console.log('📧 Sending email via N8N webhook:', emailWebhook);
      console.log('   To:', payload.to);
      console.log('   Subject:', payload.subject);

      const response = await axios.post(emailWebhook, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      console.log('✅ Email sent via n8n:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send email via n8n:');
      console.error('   Error:', error.message);
      console.error('   Response:', error.response?.data);
      return false;
    }
  }

  async generateInterviewQuestions(payload: InterviewQuestionsPayload): Promise<any> {
    try {
      const questionsWebhook = process.env.N8N_WEBHOOK_INTERVIEW_QUESTIONS;

      if (!questionsWebhook) {
        throw new Error('N8N_WEBHOOK_INTERVIEW_QUESTIONS not configured in .env');
      }

      const response = await axios.post(questionsWebhook, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      console.log('✅ Interview questions generated via n8n');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to generate questions via n8n:', error.message);
      throw error;
    }
  }

  async syncInterviewQuestions(payload: {
    jobTitle: string;
    jobDescription?: string;
    jobDNA?: any;
    questions: any[];
    questionsText?: string;
  }): Promise<{ success: true }> {
    try {
      console.log('🔄 Attempting to sync questions to n8n');
      console.log('Webhook configured:', !!this.questionsWebhook);
      console.log('Payload size:', JSON.stringify(payload).length, 'bytes');

      if (!this.questionsWebhook) {
        console.error('❌ N8N questions webhook is missing/empty');
        throw new Error('N8N questions webhook not configured');
      }

      console.log('Sending to:', this.questionsWebhook);

      const response = await axios.post(this.questionsWebhook, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      console.log('✅ Interview questions synced to n8n. Status:', response.status);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to sync questions to n8n detailed error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async sendInterviewResult(payload: InterviewResultPayload): Promise<any> {
    try {
      const resultWebhook = process.env.N8N_WEBHOOK_INTERVIEW_RESULT;

      if (!resultWebhook) {
        console.warn('N8N_WEBHOOK_INTERVIEW_RESULT not configured');
        return null;
      }

      const response = await axios.post(resultWebhook, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      });

      console.log('✅ Interview result sent to n8n for processing');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to send interview result to n8n:', error.message);
      throw error;
    }
  }

  async sendInvitationEmail(
    candidateEmail: string,
    candidateName: string,
    interviewLink: string,
    interviewCode: string,
    jobTitle: string,
    customSubject?: string,
    customBody?: string
  ): Promise<boolean> {
    const emailBody = customBody || `
      <h2>Interview Invitation</h2>
      <p>Dear ${candidateName},</p>
      <p>You have been invited to participate in an AI-powered interview for the position of <strong>${jobTitle}</strong>.</p>
      <p><strong>Your Interview Code:</strong> ${interviewCode}</p>
      <p><strong>Interview Link:</strong> <a href="${interviewLink}">${interviewLink}</a></p>
      <p>Please click the link above to start your interview. Make sure you have:</p>
      <ul>
        <li>A working camera and microphone</li>
        <li>A quiet environment</li>
        <li>Stable internet connection</li>
      </ul>
      <p>The interview will be conducted by our AI interviewer and typically takes 30-45 minutes.</p>
      <p>Good luck!</p>
    `;

    return await this.sendEmail({
      to: candidateEmail,
      subject: customSubject || `Interview Invitation - ${jobTitle}`,
      body: emailBody,
      candidateName,
      interviewLink,
      interviewCode,
    });
  }
}

export default new N8nService();
