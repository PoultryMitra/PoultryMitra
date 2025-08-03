import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  adminContentService,
  type AdminPost,
  type Comment
} from '@/services/adminContentService';
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Pin,
  Youtube,
  FileText,
  Megaphone,
  BookOpen,
  Lightbulb,
  Search,
  Send,
  Heart,
  Reply
} from 'lucide-react';

const PostsAndGuides: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // State management
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<AdminPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Load published posts
  useEffect(() => {
    const unsubscribe = adminContentService.subscribeToAdminPosts((posts) => {
      setPosts(posts);
      setFilteredPosts(posts);
    });

    return unsubscribe;
  }, []);

  // Filter posts based on tab and search
  useEffect(() => {
    let filtered = posts;

    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(post => post.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [posts, activeTab, searchQuery]);

  // Handle post click
  const handlePostClick = async (post: AdminPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
    
    // Increment views
    await adminContentService.incrementPostViews(post.id);
    
    // Load comments
    const unsubscribe = adminContentService.subscribeToPostComments(post.id, (comments) => {
      setPostComments(comments);
    });
    
    return unsubscribe;
  };

  // Handle like post
  const handleLikePost = async (post: AdminPost) => {
    if (!currentUser) return;

    try {
      const isLiked = likedPosts.has(post.id);
      await adminContentService.togglePostLike(post.id, !isLiked);
      
      const newLikedPosts = new Set(likedPosts);
      if (isLiked) {
        newLikedPosts.delete(post.id);
      } else {
        newLikedPosts.add(post.id);
      }
      setLikedPosts(newLikedPosts);
      
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!currentUser || !selectedPost || !newComment.trim()) return;

    try {
      const userType = currentUser.email?.includes('admin') ? 'admin' : 
                      currentUser.email?.includes('dealer') ? 'dealer' : 'farmer';
      
      await adminContentService.addComment(
        selectedPost.id,
        currentUser.uid,
        currentUser.displayName || 'User',
        userType,
        newComment
      );
      
      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get post type icon
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      case 'tip': return <Lightbulb className="w-4 h-4" />;
      case 'tutorial': return <Youtube className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Render YouTube embed
  const renderYouTubeEmbed = (videoId: string) => {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          frameBorder="0"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts & Guides</h1>
        <p className="text-gray-600">
          Stay updated with announcements, guides, tips, and tutorials
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="announcement">News</TabsTrigger>
          <TabsTrigger value="guide">Guides</TabsTrigger>
          <TabsTrigger value="tip">Tips</TabsTrigger>
          <TabsTrigger value="tutorial">Videos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6 mt-8">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    post.isPinned ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => handlePostClick(post)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPostTypeIcon(post.type)}
                        <Badge variant="outline">{post.type}</Badge>
                        {post.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                      </div>
                      {post.youtubeVideoId && (
                        <Badge variant="outline" className="text-red-600">
                          <Youtube className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.commentsCount}
                        </span>
                      </div>
                      <span>{post.createdAt.toDate().toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Detail Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPostTypeIcon(selectedPost.type)}
                  <Badge variant="outline">{selectedPost.type}</Badge>
                  <Badge variant="secondary">{selectedPost.category}</Badge>
                  {selectedPost.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                </div>
                <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                <DialogDescription>
                  By {selectedPost.author} • {selectedPost.createdAt.toDate().toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* YouTube Video */}
                {selectedPost.youtubeVideoId && renderYouTubeEmbed(selectedPost.youtubeVideoId)}
                
                {/* Content */}
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
                
                {/* Tags */}
                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Post Stats & Actions */}
                <div className="flex items-center justify-between py-4 border-t border-b">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedPost.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {postComments.length} comments
                    </span>
                  </div>
                  
                  {currentUser && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(selectedPost);
                      }}
                      className={likedPosts.has(selectedPost.id) ? 'text-red-600' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${likedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
                      {selectedPost.likes}
                    </Button>
                  )}
                </div>
                
                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Comments</h3>
                  
                  {/* Add Comment */}
                  {currentUser ? (
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Please log in to leave a comment</p>
                  )}
                  
                  {/* Comments List */}
                  <div className="space-y-4">
                    {postComments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                    ) : (
                      postComments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comment.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                {comment.userType}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt.toDate().toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          
                          {/* Comment Replies */}
                          {comment.replies.length > 0 && (
                            <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{reply.userName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {reply.userType}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {reply.createdAt.toDate().toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-600">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostsAndGuides;
