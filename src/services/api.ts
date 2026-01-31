const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Debug mode - set to true for detailed logging
const DEBUG = true;

// Logger utility
const logger = {
  info: (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`%c📡 API: ${message}`, 'color: #3B82F6; font-weight: bold;', data || '');
    }
  },
  success: (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`%c✅ API: ${message}`, 'color: #10B981; font-weight: bold;', data || '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`%c❌ API: ${message}`, 'color: #EF4444; font-weight: bold;', error || '');
  },
  request: (method: string, url: string, body?: any) => {
    if (DEBUG) {
      console.group(`%c🔄 ${method} ${url}`, 'color: #8B5CF6; font-weight: bold;');
      if (body) {
        const sanitized = { ...body };
        if (sanitized.password) sanitized.password = '***';
        console.log('Request Body:', sanitized);
      }
      console.groupEnd();
    }
  },
  response: (status: number, data: any) => {
    if (DEBUG) {
      const color = status >= 400 ? '#EF4444' : '#10B981';
      console.log(`%c📥 Response [${status}]:`, `color: ${color}; font-weight: bold;`, data);
    }
  }
};

// Log API configuration on load
console.log('%c🔧 API Configuration', 'color: #F59E0B; font-weight: bold; font-size: 14px;');
console.log(`   API URL: ${API_URL}`);
console.log(`   Debug Mode: ${DEBUG ? 'ON' : 'OFF'}`);

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('auth_token');
  if (DEBUG && token) {
    logger.info('Auth token found in localStorage');
  }
  return token;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));

  logger.response(response.status, data);

  if (!response.ok) {
    logger.error(`Request failed with status ${response.status}`, data);
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
};

// Helper function for authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const fullUrl = `${API_URL}${url}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  logger.request(options.method || 'GET', fullUrl, options.body ? JSON.parse(options.body as string) : undefined);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    return handleResponse(response);
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      logger.error('Network error - Is the backend running?', { url: fullUrl });
      throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    throw error;
  }
};

export const api = {
  // Auth APIs
  auth: {
    register: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      company: string;
      jobTitle?: string;
    }) => {
      logger.info('Initiating registration...', { email: data.email });

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      return handleResponse(response);
    },

    verifyOtp: async (email: string, otp: string) => {
      logger.info('Verifying OTP...', { email });

      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const result = await handleResponse(response);

      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        logger.success('Verification successful', { userId: result.user.id });
      }

      return result;
    },

    resendOtp: async (email: string) => {
      logger.info('Resending OTP...', { email });

      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      return handleResponse(response);
    },

    login: async (email: string, password: string) => {
      logger.info('Logging in...', { email });

      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await handleResponse(response);

        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          logger.success('Login successful', { userId: result.user.id, email: result.user.email });
        }

        return result;
      } catch (error: any) {
        logger.error('Login failed', error.message);
        throw error;
      }
    },

    logout: () => {
      logger.info('Logging out...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      logger.success('Logged out successfully');
    },

    getCurrentUser: () => {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        logger.info('Current user from localStorage', { email: user.email });
      }
      return user;
    },

    getMe: async () => {
      logger.info('Fetching current user from API...');
      return authFetch('/api/auth/me');
    },
  },

  // Reports APIs
  reports: {
    getAll: async () => {
      return authFetch('/api/reports');
    },

    getById: async (id: string) => {
      return authFetch(`/api/reports/${id}`);
    },

    getByCandidateId: async (candidateId: string) => {
      return authFetch(`/api/reports/candidate/${candidateId}`);
    },

    updateDecision: async (id: string, decision: string, notes?: string) => {
      return authFetch(`/api/reports/${id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ finalDecision: decision, notes }),
      });
    },
  },

  // Job APIs
  jobs: {
    getAll: async () => {
      return authFetch('/api/jobs');
    },

    getById: async (id: string) => {
      return authFetch(`/api/jobs/${id}`);
    },

    create: async (data: any) => {
      return authFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return authFetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return authFetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });
    },

    generateDNA: async (id: string) => {
      return authFetch(`/api/jobs/${id}/generate-dna`, {
        method: 'POST',
      });
    },

    generateQuestions: async (id: string, options?: { count?: number, customPrompt?: string }) => {
      return authFetch(`/api/jobs/${id}/generate-questions`, {
        method: 'POST',
        body: JSON.stringify(options || {}),
      });
    },

    syncQuestions: async (id: string, count?: number) => {
      return authFetch(`/api/jobs/${id}/sync-questions`, {
        method: 'POST',
        body: JSON.stringify({ count }),
      });
    },

    getQuestions: async (id: string) => {
      return authFetch(`/api/jobs/${id}/questions`);
    },

    addQuestion: async (id: string, question: any) => {
      return authFetch(`/api/jobs/${id}/questions`, {
        method: 'POST',
        body: JSON.stringify(question),
      });
    },

    updateQuestion: async (id: string, questionId: string, question: any) => {
      return authFetch(`/api/jobs/${id}/questions/${questionId}`, {
        method: 'PATCH',
        body: JSON.stringify(question),
      });
    },

    deleteQuestion: async (id: string, questionId: string) => {
      return authFetch(`/api/jobs/${id}/questions/${questionId}`, {
        method: 'DELETE',
      });
    },

    parseDescription: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/jobs/parse-jd`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return handleResponse(response);
    },
  },

  // Candidate APIs
  candidates: {
    getAll: async () => {
      return authFetch('/api/candidates');
    },

    getById: async (id: string) => {
      return authFetch(`/api/candidates/${id}`);
    },

    create: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      jobId: string;
      linkedInUrl?: string;
      experience?: string;
      skipInvite?: boolean;
    }) => {
      return authFetch('/api/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    uploadResume: async (formData: FormData) => {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/candidates/upload-resume`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return handleResponse(response);
    },

    uploadResumeForCandidate: async (id: string, file: File) => {
      const formData = new FormData();
      formData.append('resume', file);

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/candidates/${id}/resume`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return handleResponse(response);
    },

    updateDecision: async (id: string, decision: string, notes?: string) => {
      return authFetch(`/api/candidates/${id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ finalDecision: decision, notes }),
      });
    },

    resendInvitation: async (id: string) => {
      return authFetch(`/api/candidates/${id}/resend-invitation`, {
        method: 'POST',
      });
    },

    sendFeedback: async (id: string, data: any) => {
      return authFetch(`/api/candidates/${id}/send-feedback`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any) => {
      return authFetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return authFetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Interview APIs (Public)
  interviews: {
    validateCode: async (code: string) => {
      const response = await fetch(`${API_URL}/api/interviews/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      return handleResponse(response);
    },

    createWebCall: async (agentId: string) => {
      const response = await fetch(`${API_URL}/api/interviews/create-web-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      return handleResponse(response);
    },

    saveRecording: async (file: Blob, candidateName: string, uid: string) => {
      const formData = new FormData();
      formData.append('file', file, `interview_${uid}_${Date.now()}.webm`);
      formData.append('candidate_name', candidateName);
      formData.append('uid', uid);

      const response = await fetch(`${API_URL}/api/interviews/save-recording`, {
        method: 'POST',
        body: formData,
      });

      return handleResponse(response);
    },

    submitResult: async (data: {
      candidateId: string;
      transcript: any[];
      duration: number;
      metadata?: any;
    }) => {
      const response = await fetch(`${API_URL}/api/interviews/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },

  // Notification APIs
  notifications: {
    getAll: async (page: number = 1, limit: number = 20) => {
      return authFetch(`/api/notifications?page=${page}&limit=${limit}`);
    },

    getUnreadCount: async () => {
      return authFetch('/api/notifications/unread-count');
    },

    markAsRead: async (id: string) => {
      return authFetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    markAllAsRead: async () => {
      return authFetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
    },

    delete: async (id: string) => {
      return authFetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Upload APIs
  upload: {
    file: async (file: File, folder?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      return handleResponse(response);
    },
  },

  // Admin APIs
  admin: {
    getUsers: async () => {
      return authFetch('/api/admin/users');
    },

    toggleUserStatus: async (userId: string, isActive: boolean) => {
      return authFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
  },
};

export default api;
