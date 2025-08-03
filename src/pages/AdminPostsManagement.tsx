import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  adminContentService,
  type AdminPost,
  type Comment
} from '@/services/adminContentService';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Pin,
  Youtube,
  FileText,
  Megaphone,
  BookOpen,
  Lightbulb
} from 'lucide-react';

const AdminPostsManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // State management
  const [adminPosts, setAdminPosts] = useState<AdminPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Post form state
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'guide' | 'tip' | 'tutorial',
    category: 'General',
    youtubeUrl: '',
    tags: '',
    isPublished: true,
    isPinned: false
  });

  // Load all admin posts
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = adminContentService.subscribeToAllAdminPosts((posts) => {
      setAdminPosts(posts);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  // Handle create/edit post
  const handleSavePost = async () => {
    if (!currentUser?.uid || !postForm.title || !postForm.content) return;

    try {
      const tags = postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      if (isEditing && selectedPost) {
        await adminContentService.updateAdminPost(selectedPost.id, {
          title: postForm.title,
          content: postForm.content,
          type: postForm.type,
          category: postForm.category as 'General' | 'Feed' | 'Medicine' | 'Disease' | 'FCR' | 'Weather' | 'Marketing' | 'Other',
          youtubeUrl: postForm.youtubeUrl,
          tags,
          isPublished: postForm.isPublished,
          isPinned: postForm.isPinned
        });
        
        toast({
          title: "Success",
          description: "Post updated successfully!",
        });
      } else {
        await adminContentService.createAdminPost(
          currentUser.uid,
          currentUser.displayName || 'Admin',
          {
            title: postForm.title,
            content: postForm.content,
            type: postForm.type,
            category: postForm.category as 'General' | 'Feed' | 'Medicine' | 'Disease' | 'FCR' | 'Weather' | 'Marketing' | 'Other',
            youtubeUrl: postForm.youtubeUrl,
            tags,
            isPublished: postForm.isPublished,
            isPinned: postForm.isPinned
          }
        );

        toast({
          title: "Success",
          description: "Post created successfully!",
        });
      }

      // Reset form
      setPostForm({
        title: '',
        content: '',
        type: 'announcement',
        category: 'General',
        youtubeUrl: '',
        tags: '',
        isPublished: true,
        isPinned: false
      });
      setSelectedPost(null);
      setIsEditing(false);
      setShowPostModal(false);

    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit post
  const handleEditPost = (post: AdminPost) => {
    setSelectedPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      type: post.type,
      category: post.category,
      youtubeUrl: post.youtubeUrl || '',
      tags: post.tags.join(', '),
      isPublished: post.isPublished,
      isPinned: post.isPinned
    });
    setIsEditing(true);
    setShowPostModal(true);
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await adminContentService.deleteAdminPost(postId);
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle post publish status
  const togglePublishStatus = async (post: AdminPost) => {
    try {
      await adminContentService.updateAdminPost(post.id, {
        isPublished: !post.isPublished
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  // Toggle pin status
  const togglePinStatus = async (post: AdminPost) => {
    try {
      await adminContentService.updateAdminPost(post.id, {
        isPinned: !post.isPinned
      });
    } catch (error) {
      console.error('Error toggling pin status:', error);
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

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Render YouTube embed preview
  const renderYouTubePreview = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    return (
      <div className="mt-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Video Preview:</p>
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video preview"
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  };

  // Filter posts by type
  const filteredPosts = adminPosts.filter(post => {
    if (activeTab === 'all') return true;
    return post.type === activeTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts & Guides Management</h1>
          <p className="text-gray-600 mt-1">
            Create announcements, guides, tips, and tutorials for your users
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setSelectedPost(null);
            setIsEditing(false);
            setPostForm({
              title: '',
              content: '',
              type: 'announcement',
              category: 'General',
              youtubeUrl: '',
              tags: '',
              isPublished: true,
              isPinned: false
            });
            setShowPostModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminPosts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminPosts.filter(p => p.isPublished).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminPosts.reduce((sum, p) => sum + p.views, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminPosts.reduce((sum, p) => sum + p.likes, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="guide">Guides</TabsTrigger>
          <TabsTrigger value="tip">Tips</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Create your first post to get started.</p>
                <Button onClick={() => setShowPostModal(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className={post.isPinned ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPostTypeIcon(post.type)}
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          {post.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{post.type}</Badge>
                          <Badge variant="outline">{post.category}</Badge>
                          <Badge variant={post.isPublished ? 'default' : 'secondary'}>
                            {post.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          {post.youtubeUrl && (
                            <Badge variant="outline" className="text-red-600">
                              <Youtube className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                        
                        {/* YouTube Video Embed */}
                        {post.youtubeVideoId && (
                          <div className="mb-3">
                            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden max-w-md">
                              <iframe
                                src={`https://www.youtube.com/embed/${post.youtubeVideoId}`}
                                title="YouTube video preview"
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
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
                          <span>
                            {post.createdAt.toDate().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePinStatus(post)}
                        >
                          <Pin className={`w-4 h-4 ${post.isPinned ? 'text-blue-600' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublishStatus(post)}
                        >
                          <Eye className={`w-4 h-4 ${post.isPublished ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Post Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update your post details' : 'Create a new post, guide, or announcement for your users'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={postForm.title}
                onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                placeholder="Enter post title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={postForm.type} onValueChange={(value) => setPostForm({...postForm, type: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={postForm.category} onValueChange={(value) => setPostForm({...postForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Feed">Feed</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Disease">Disease</SelectItem>
                    <SelectItem value="FCR">FCR</SelectItem>
                    <SelectItem value="Weather">Weather</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={postForm.content}
                onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                placeholder="Write your post content here..."
                rows={6}
              />
            </div>
            
            <div>
              <Label htmlFor="youtube">YouTube Video URL (Optional)</Label>
              <Input
                id="youtube"
                value={postForm.youtubeUrl}
                onChange={(e) => setPostForm({...postForm, youtubeUrl: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a YouTube URL to embed the video in your post
              </p>
              
              {/* YouTube Video Preview */}
              {postForm.youtubeUrl && renderYouTubePreview(postForm.youtubeUrl)}
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={postForm.tags}
                onChange={(e) => setPostForm({...postForm, tags: e.target.value})}
                placeholder="farming, tips, broiler, feed"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={postForm.isPublished}
                  onCheckedChange={(checked) => setPostForm({...postForm, isPublished: checked})}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="pinned"
                  checked={postForm.isPinned}
                  onCheckedChange={(checked) => setPostForm({...postForm, isPinned: checked})}
                />
                <Label htmlFor="pinned">Pin to top</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowPostModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePost}
              disabled={!postForm.title || !postForm.content}
            >
              {isEditing ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPostsManagement;
