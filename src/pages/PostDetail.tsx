import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Send,
  Heart,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft
} from 'lucide-react';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<AdminPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        setLoading(true);
        
        // Load post data
        const postData = await adminContentService.getPostById(postId);
        if (postData) {
          setPost(postData);
          
          // Increment views
          await adminContentService.incrementPostViews(postId);
          
          // Load comments only if user is authenticated
          if (currentUser) {
            setCommentsLoading(true);
            const unsubscribe = adminContentService.subscribeToPostComments(postId, (comments) => {
              setComments(comments);
              setCommentsLoading(false);
            });
            
            return unsubscribe;
          }
        } else {
          navigate('/posts');
        }
      } catch (error) {
        console.error('Error loading post:', error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, navigate, toast]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showShareMenu) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShareMenu]);

  const handleLikePost = async () => {
    if (!currentUser || !post) return;

    try {
      await adminContentService.togglePostLike(post.id, !isLiked);
      setIsLiked(!isLiked);
      
      // Update local post data
      setPost(prev => prev ? {
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1
      } : null);
      
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!currentUser || !post || !newComment.trim()) return;

    try {
      const userType = currentUser.email?.includes('admin') ? 'admin' : 
                      currentUser.email?.includes('dealer') ? 'dealer' : 'farmer';
      
      await adminContentService.addComment(
        post.id,
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

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="w-5 h-5" />;
      case 'guide': return <BookOpen className="w-5 h-5" />;
      case 'tip': return <Lightbulb className="w-5 h-5" />;
      case 'tutorial': return <Youtube className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const renderYouTubeEmbed = (videoId: string) => {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
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

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || 'Check out this post';
    const text = `${title} - ${post?.content.substring(0, 100)}...`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Success",
          description: "Link copied to clipboard!",
        });
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        setShowShareMenu(!showShareMenu);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Button onClick={() => navigate('/posts')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getPostTypeIcon(post.type)}
                <Badge variant="outline">{post.type}</Badge>
                <Badge variant="secondary">{post.category}</Badge>
                {post.isPinned && <Pin className="w-5 h-5 text-blue-600" />}
              </div>
              
              {/* Share Button */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare()}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                {showShareMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-48"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('copy')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('linkedin')}
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <CardTitle className="text-2xl mb-4">{post.title}</CardTitle>
            
            {/* Post Meta */}
            <div className="text-sm text-gray-600 mb-4">
              By {post.author} • {post.createdAt.toDate().toLocaleDateString()}
            </div>
          </CardHeader>

          <CardContent>
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-6">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto rounded-lg object-cover"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}

            {/* YouTube Video */}
            {post.youtubeVideoId && renderYouTubeEmbed(post.youtubeVideoId)}
            
            {/* Content */}
            <div className="prose max-w-none mb-6">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </div>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
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
                  {post.views} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} comments
                </span>
              </div>
              
              {currentUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLikePost}
                  className={isLiked ? 'text-red-600' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {!currentUser ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Login to Join the Discussion</h3>
                <p className="text-gray-600 mb-4">
                  Please log in to view and add comments to this post.
                </p>
                <Button onClick={() => navigate('/login')}>
                  Login to Comment
                </Button>
              </div>
            ) : (
              <>
                {/* Add Comment */}
                <div className="flex gap-2 mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
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
                
                {/* Comments List */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;
