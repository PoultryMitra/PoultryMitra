import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  where,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AdminPost {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'guide' | 'tip' | 'tutorial';
  category: 'General' | 'Feed' | 'Medicine' | 'Disease' | 'FCR' | 'Weather' | 'Marketing' | 'Other';
  youtubeUrl?: string;
  youtubeVideoId?: string;
  featuredImage?: string;
  author: string;
  authorId: string;
  isPublished: boolean;
  isPinned: boolean;
  tags: string[];
  views: number;
  likes: number;
  commentsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userType: 'farmer' | 'dealer' | 'admin';
  content: string;
  likes: number;
  replies: Reply[];
  createdAt: Timestamp;
  isHidden: boolean;
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userType: 'farmer' | 'dealer' | 'admin';
  content: string;
  likes: number;
  createdAt: Timestamp;
}

// Extract YouTube video ID from URL
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Create a new post (Admin only)
export const createAdminPost = async (
  adminId: string,
  adminName: string,
  postData: {
    title: string;
    content: string;
    type: 'announcement' | 'guide' | 'tip' | 'tutorial';
    category: string;
    youtubeUrl?: string;
    tags: string[];
    isPublished: boolean;
    isPinned: boolean;
  }
): Promise<void> => {
  try {
    const postsRef = collection(db, 'adminPosts');
    
    const youtubeVideoId = postData.youtubeUrl ? extractYouTubeVideoId(postData.youtubeUrl) : null;
    
    await addDoc(postsRef, {
      ...postData,
      youtubeVideoId,
      author: adminName,
      authorId: adminId,
      views: 0,
      likes: 0,
      commentsCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating admin post:', error);
    throw error;
  }
};

// Get all published posts with real-time updates
export const subscribeToAdminPosts = (
  callback: (posts: AdminPost[]) => void,
  type?: 'announcement' | 'guide' | 'tip' | 'tutorial'
): (() => void) => {
  let q = query(
    collection(db, 'adminPosts'),
    where('isPublished', '==', true),
    orderBy('isPinned', 'desc'),
    orderBy('createdAt', 'desc')
  );

  if (type) {
    q = query(
      collection(db, 'adminPosts'),
      where('isPublished', '==', true),
      where('type', '==', type),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc')
    );
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts: AdminPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as AdminPost);
    });
    callback(posts);
  });

  return unsubscribe;
};

// Get all posts for admin (including drafts)
export const subscribeToAllAdminPosts = (
  callback: (posts: AdminPost[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'adminPosts'),
    orderBy('isPinned', 'desc'),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts: AdminPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as AdminPost);
    });
    callback(posts);
  });

  return unsubscribe;
};

// Update post views
export const incrementPostViews = async (postId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'adminPosts', postId);
    await updateDoc(postRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing post views:', error);
  }
};

// Like/Unlike post
export const togglePostLike = async (postId: string, shouldIncrement: boolean): Promise<void> => {
  try {
    const postRef = doc(db, 'adminPosts', postId);
    await updateDoc(postRef, {
      likes: shouldIncrement ? increment(1) : increment(-1)
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Update post (Admin only)
export const updateAdminPost = async (
  postId: string,
  updates: Partial<AdminPost>
): Promise<void> => {
  try {
    const postRef = doc(db, 'adminPosts', postId);
    
    if (updates.youtubeUrl) {
      updates.youtubeVideoId = extractYouTubeVideoId(updates.youtubeUrl);
    }
    
    await updateDoc(postRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating admin post:', error);
    throw error;
  }
};

// Delete post (Admin only)
export const deleteAdminPost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'adminPosts', postId));
  } catch (error) {
    console.error('Error deleting admin post:', error);
    throw error;
  }
};

// Add comment to post
export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  userType: 'farmer' | 'dealer' | 'admin',
  content: string
): Promise<void> => {
  try {
    const commentsRef = collection(db, 'postComments');
    
    await addDoc(commentsRef, {
      postId,
      userId,
      userName,
      userType,
      content,
      likes: 0,
      replies: [],
      createdAt: Timestamp.now(),
      isHidden: false
    });

    // Increment post comments count
    const postRef = doc(db, 'adminPosts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get comments for a post
export const subscribeToPostComments = (
  postId: string,
  callback: (comments: Comment[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'postComments'),
    where('postId', '==', postId),
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const comments: Comment[] = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    callback(comments);
  });

  return unsubscribe;
};

// Add reply to comment
export const addReplyToComment = async (
  commentId: string,
  userId: string,
  userName: string,
  userType: 'farmer' | 'dealer' | 'admin',
  content: string
): Promise<void> => {
  try {
    const commentRef = doc(db, 'postComments', commentId);
    
    const newReply: Reply = {
      id: Date.now().toString(), // Simple ID for replies
      userId,
      userName,
      userType,
      content,
      likes: 0,
      createdAt: Timestamp.now()
    };

    await updateDoc(commentRef, {
      replies: [...[], newReply] // Add to existing replies array
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

// Export service object
export const adminContentService = {
  createAdminPost,
  subscribeToAdminPosts,
  subscribeToAllAdminPosts,
  incrementPostViews,
  togglePostLike,
  updateAdminPost,
  deleteAdminPost,
  addComment,
  subscribeToPostComments,
  addReplyToComment,
  extractYouTubeVideoId
};
