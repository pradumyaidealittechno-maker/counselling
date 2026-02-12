import toast from 'react-hot-toast';

interface ConfirmDeleteOptions {
  entityType: string; // e.g., "Student", "Course", "Candidate"
  entityName?: string; // e.g., "John Doe", "Advanced AI Course"
}

interface ConfirmUpdateOptions {
  entityType: string; // e.g., "Student", "Course", "Session"
}

export const confirmDelete = ({ entityType, entityName }: ConfirmDeleteOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    toast((t) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: '400px',
          maxWidth: '480px',
          padding: '28px',
          textAlign: 'center',
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Delete Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)' }}>
            Delete {entityType}?
          </h3>
          <p style={{ margin: 0, fontWeight: 400, fontSize: '14px', color: 'var(--gray-600)', lineHeight: 1.5 }}>
            Are you sure you want to delete {entityName ? <strong>{entityName}</strong> : `this ${entityType.toLowerCase()}`}? This action cannot be undone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            style={{
              padding: '11px 24px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--gray-300)',
              background: 'white',
              color: 'var(--gray-700)',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gray-50)';
              e.currentTarget.style.borderColor = 'var(--gray-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'var(--gray-300)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
              color: '#fff',
              cursor: 'pointer',
              flex: 1,
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.35)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(233, 30, 99, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 30, 99, 0.35)';
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      id: 'delete-confirm-modal',
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        boxShadow: 'none',
        marginTop: '20vh'
      }
    });
  });
};

export const confirmUpdate = ({ entityType }: ConfirmUpdateOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    toast((t) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: '400px',
          maxWidth: '480px',
          padding: '28px',
          textAlign: 'center',
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Update Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>

        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)' }}>
            Update {entityType}?
          </h3>
          <p style={{ margin: 0, fontWeight: 400, fontSize: '14px', color: 'var(--gray-600)', lineHeight: 1.5 }}>
            Are you sure you want to save these changes to {entityType.toLowerCase()}?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            style={{
              padding: '11px 24px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--gray-300)',
              background: 'white',
              color: 'var(--gray-700)',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gray-50)';
              e.currentTarget.style.borderColor = 'var(--gray-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'var(--gray-300)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#fff',
              cursor: 'pointer',
              flex: 1,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.25)';
            }}
          >
            Update
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      id: 'update-confirm-modal',
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        boxShadow: 'none',
        marginTop: '20vh'
      }
    });
  });
};

// Keep the old confirmToast for backward compatibility but mark as deprecated
/** @deprecated Use confirmDelete or confirmUpdate instead */
export const confirmToast = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast((t) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          minWidth: '360px',
          maxWidth: '450px',
          padding: '24px',
          textAlign: 'center',
          background: '#1F2937',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 700, color: '#fff' }}>Confirm Action</h3>
          <p style={{ margin: 0, fontWeight: 400, fontSize: '15px', color: '#9CA3AF', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid #374151',
              background: 'transparent',
              color: '#D1D5DB',
              cursor: 'pointer',
              fontWeight: 600,
              flex: 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = '#4B5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#374151';
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#E91E63',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              flex: 1,
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(233, 30, 99, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 30, 99, 0.3)';
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      id: 'confirm-modal',
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        boxShadow: 'none',
        marginTop: '25vh'
      }
    });
  });
};

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
};
