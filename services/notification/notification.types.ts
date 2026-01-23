/**
 * Types pour le système de notifications
 */

export type NotificationType =
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_CANCELED"
  | "QUOTA_WARNING"
  | "QUOTA_EXCEEDED"
  | "AI_SUCCESS"
  | "AI_ERROR"
  | "QUIZ_GENERATED"
  | "COURSE_PROCESSED"
  | "INFO";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
