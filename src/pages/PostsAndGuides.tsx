import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedTranslation } from '@/contexts/EnhancedTranslationContext';
import { TranslationStatus } from '@/components/TranslationComponents';
import { 
  adminContentService,
  type AdminPost
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
  Share2
} from 'lucide-react';

const PostsAndGuides: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useEnhancedTranslation();

  // Enhanced translation helper that prioritizes Google Translate
  const bt = (key: string): string => {
    // First try Enhanced Translation Context (Google Translate)
    const dynamicTranslation = t(key);
    if (dynamicTranslation && dynamicTranslation !== key) {
      console.log(`🌍 Google Translate used for PostsAndGuides: ${key} -> ${dynamicTranslation}`);
      return dynamicTranslation;
    }

    // Fallback to static translations
    const translations = {
      'posts.title': { hi: "पोस्ट्स और गाइड्स", en: "Posts & Guides" },
      'posts.subtitle': { hi: "घोषणाओं, गाइड्स, टिप्स और ट्यूटोरियल्स के साथ अपडेट रहें", en: "Stay updated with announcements, guides, tips, and tutorials" },
      'posts.searchPlaceholder': { hi: "पोस्ट्स खोजें...", en: "Search posts..." },
      'posts.all': { hi: "सभी", en: "All" },
      'posts.announcements': { hi: "घोषणाएं", en: "Announcements" },
      'posts.guides': { hi: "गाइड्स", en: "Guides" },
      'posts.tips': { hi: "टिप्स", en: "Tips" },
      'posts.tutorials': { hi: "ट्यूटोरियल्स", en: "Tutorials" },
      'posts.noPosts': { hi: "कोई पोस्ट उपलब्ध नहीं है", en: "No posts available" },
      'posts.readMore': { hi: "और पढ़ें", en: "Read More" },
      'posts.share': { hi: "शेयर करें", en: "Share" },
      'posts.back': { hi: "वापस", en: "Back" }
    };
    
    const translation = translations[key as keyof typeof translations];
    if (translation) {
      const staticTranslation = translation[language] || translation.en;
      console.log(`📚 Static content used for PostsAndGuides: ${key} -> ${staticTranslation}`);
      return staticTranslation;
    }
    
    console.log(`❌ No translation found for PostsAndGuides: ${key}`);
    return key;
  };

  // State management
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<AdminPost[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    // Navigate to individual post page
    const basePath = location.pathname.includes('/farmer/') ? '/farmer/posts' : 
                     location.pathname.includes('/dealer/') ? '/dealer/posts' : '/posts';
    navigate(`${basePath}/${post.id}`);
  };

  // Handle share post
  const handleSharePost = (post: AdminPost, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const basePath = location.pathname.includes('/farmer/') ? '/farmer/posts' : 
                     location.pathname.includes('/dealer/') ? '/dealer/posts' : '/posts';
    const url = `${window.location.origin}${basePath}/${post.id}`;
    
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Post link copied to clipboard!",
    });
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Translation Status */}
      <div className="flex justify-end mb-4">
        <TranslationStatus />
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{bt('posts.title')}</h1>
        <p className="text-gray-600">
          {bt('posts.subtitle')}
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={bt('posts.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{bt('posts.all')}</TabsTrigger>
          <TabsTrigger value="announcement">{bt('posts.announcements')}</TabsTrigger>
          <TabsTrigger value="guide">{bt('posts.guides')}</TabsTrigger>
          <TabsTrigger value="tip">{bt('posts.tips')}</TabsTrigger>
          <TabsTrigger value="tutorial">{bt('posts.tutorials')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6 mt-8">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{bt('posts.noPosts')}</h3>
                <p className="text-gray-600">
                  {searchQuery ? bt('posts.searchNoResults') || 'Try adjusting your search terms' : bt('posts.checkLater') || 'Check back later for new content'}
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
                    <div className="mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <CardDescription>
                      {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Featured Image */}
                    {post.featuredImage && (
                      <div className="mb-4">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
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
                      <div className="flex items-center gap-2">
                        <span>{post.createdAt.toDate().toLocaleDateString()}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleSharePost(post, e)}
                          className="h-8 w-8 p-0"
                        >
                          <Share2 className="w-4 h-4" />
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
    </div>
  );
};

export default PostsAndGuides;
