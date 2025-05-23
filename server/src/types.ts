export interface Group {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  adminId: string;
  members: string[];
  pendingRequests?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id?: string;
  recipientId: string;
  type: 'friend_request' | 'group_join_request' | 'post_like';
  senderId: string;
  groupId?: string;
  postId?: string;
  message: string;
  isRead: boolean;
  createdAt: any;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ErrorResponse {
  message: string;
} 