import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Briefcase, FileText, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

interface Notification {
  _id: string;
  type: 'interview_complete' | 'candidate_applied' | 'job_posted' | 'report_ready' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.notifications.getAll(1, 20);
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.notifications.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await api.notifications.delete(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if it was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 20, className: 'flex-shrink-0' };
    
    switch (type) {
      case 'interview_complete':
        return <CheckCircle {...iconProps} color="#10B981" />;
      case 'candidate_applied':
        return <Briefcase {...iconProps} color="#6366F1" />;
      case 'report_ready':
        return <FileText {...iconProps} color="#F59E0B" />;
      default:
        return <Bell {...iconProps} color="#6B7280" />;
    }
  };

  // Get link for notification
  const getNotificationLink = (notification: Notification) => {
    // For interview completion, redirect to the candidate's report
    if (notification.type === 'interview_complete' && notification.relatedId) {
      return `/dashboard/reports?candidateId=${notification.relatedId}`;
    }
    
    // For other candidate-related notifications, go to candidates page
    if (notification.relatedModel === 'Candidate' && notification.relatedId) {
      return `/dashboard/candidates`;
    }
    
    return '/dashboard';
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--gray-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            background: '#E91E63',
            borderRadius: '50%',
            fontSize: '0.625rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            padding: '0 4px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.75rem)',
          right: 0,
          width: '380px',
          maxHeight: '500px',
          background: 'var(--white)',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--gray-200)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--gray-900)',
              margin: 0,
            }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#E91E63',
                  fontWeight: 500,
                }}>
                  ({unreadCount})
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div style={{
            overflowY: 'auto',
            maxHeight: '400px',
          }}>
            {loading ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--gray-500)',
              }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--gray-500)',
              }}>
                <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification._id);
                    }
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--gray-100)',
                    background: notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.isRead 
                      ? 'var(--gray-50)' 
                      : 'rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.isRead 
                      ? 'transparent' 
                      : 'rgba(99, 102, 241, 0.05)';
                  }}
                >
                  {/* Icon */}
                  <div style={{ paddingTop: '0.125rem' }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: notification.isRead ? 500 : 600,
                      color: 'var(--gray-900)',
                      margin: '0 0 0.25rem 0',
                    }}>
                      {notification.title}
                    </p>
                    <p style={{
                      fontSize: '0.8125rem',
                      color: 'var(--gray-600)',
                      margin: '0 0 0.5rem 0',
                      lineHeight: 1.4,
                    }}>
                      {notification.message}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)',
                      margin: 0,
                    }}>
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(notification._id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-400)',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      height: 'fit-content',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--gray-400)';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
