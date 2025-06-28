export interface User {
  uid?: string;
  email: string;
  password: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  profilePicture?: string;
}

export interface Post {
  id?: string;
  uid: string;
  text: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPosts {
  posts: Post[];
}

export interface Friend {
  uid: string;
  fullName: string;
  profilePicture?: string;
}

export interface UserFriends {
  friends: Friend[];
}

export interface Group {
  id?: string;
  name: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  adminId: string;
  members: string[];
  createdAt?: any;
  updatedAt?: any;
  pendingRequests?: string[];
}

export interface UserResponse {
  uid: string;
  email: string;
  profile?: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    profilePicture?: string;
  };
}

export interface AuthResponse {
  message: string;
  user: UserResponse;
  token?: string;
}

export interface ErrorResponse {
  message: string;
}

export interface Notification {
  id?: string;
  recipientId: string;
  senderId: string;
  type: 'friend_request' | 'group_join_request' | 'group_join_approved' | 'group_join_rejected' | 'post_like';
  message: string;
  isRead: boolean;
  createdAt?: any;
  groupId?: string;
  postId?: string;
} 

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  createdAt: any;
  isRead: boolean;
}

export interface Chat {
  id?: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: any;
  };
  createdAt: any;
  updatedAt: any;
}