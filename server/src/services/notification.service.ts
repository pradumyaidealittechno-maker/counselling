import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

class NotificationService {
  /**
   * Create a generic notification
   */
  async createNotification(
    userId: string | mongoose.Types.ObjectId,
    type: 'interview_complete' | 'candidate_applied' | 'job_posted' | 'report_ready' | 'system',
    title: string,
    message: string,
    relatedId?: string | mongoose.Types.ObjectId,
    relatedModel?: string,
    metadata?: Record<string, any>
  ) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedId,
        relatedModel,
        metadata,
        isRead: false,
      });

      console.log(`✅ Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Create interview completion notification
   */
  async createInterviewCompleteNotification(
    userId: string | mongoose.Types.ObjectId,
    candidateId: string | mongoose.Types.ObjectId,
    candidateName: string,
    jobTitle: string
  ) {
    const title = 'Interview Completed';
    const message = `${candidateName} has completed the interview for ${jobTitle}`;
    
    return this.createNotification(
      userId,
      'interview_complete',
      title,
      message,
      candidateId,
      'Candidate',
      { candidateName, jobTitle }
    );
  }

  /**
   * Create candidate applied notification
   */
  async createCandidateAppliedNotification(
    userId: string | mongoose.Types.ObjectId,
    candidateId: string | mongoose.Types.ObjectId,
    candidateName: string,
    jobTitle: string
  ) {
    const title = 'New Candidate Applied';
    const message = `${candidateName} has applied for ${jobTitle}`;
    
    return this.createNotification(
      userId,
      'candidate_applied',
      title,
      message,
      candidateId,
      'Candidate',
      { candidateName, jobTitle }
    );
  }

  /**
   * Create report ready notification
   */
  async createReportReadyNotification(
    userId: string | mongoose.Types.ObjectId,
    candidateId: string | mongoose.Types.ObjectId,
    candidateName: string
  ) {
    const title = 'Analysis Report Ready';
    const message = `AI analysis report is ready for ${candidateName}`;
    
    return this.createNotification(
      userId,
      'report_ready',
      title,
      message,
      candidateId,
      'Candidate',
      { candidateName }
    );
  }

  /**
   * Get notifications for a user with pagination
   */
  async getNotificationsForUser(
    userId: string | mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId }),
    ]);

    return {
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string | mongoose.Types.ObjectId) {
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });
    return count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found or unauthorized');
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string | mongoose.Types.ObjectId) {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return result;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new Error('Notification not found or unauthorized');
    }

    return notification;
  }
}

export default new NotificationService();
