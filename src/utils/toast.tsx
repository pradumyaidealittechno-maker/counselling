import toast from 'react-hot-toast';

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
