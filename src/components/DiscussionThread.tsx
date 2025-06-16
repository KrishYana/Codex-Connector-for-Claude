import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  User, 
  Clock, 
  ThumbsUp, 
  Reply, 
  BookOpen,
  Pin,
  Lock,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DiscussionPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'teacher';
  };
  content: string;
  created_at: string;
  likes: number;
  isLiked: boolean;
  replies?: DiscussionPost[];
}

interface DiscussionThread {
  id: string;
  title: string;
  course?: {
    id: string;
    title: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'teacher';
  };
  created_at: string;
  updated_at: string;
  posts: DiscussionPost[];
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  participants: number;
}

// Mock data - in real app this would come from API
const mockThread: DiscussionThread = {
  id: 'thread-1',
  title: 'Understanding React Hooks - useEffect Dependencies',
  course: {
    id: 'course-1',
    title: 'React Fundamentals'
  },
  author: {
    id: 'student-1',
    name: 'Alex Johnson',
    role: 'student'
  },
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T14:45:00Z',
  isPinned: false,
  isLocked: false,
  views: 127,
  participants: 8,
  posts: [
    {
      id: 'post-1',
      author: {
        id: 'student-1',
        name: 'Alex Johnson',
        role: 'student'
      },
      content: 'I\'m having trouble understanding when to include dependencies in the useEffect hook. Sometimes my component re-renders infinitely, and I\'m not sure why. Can someone explain the best practices?',
      created_at: '2024-01-15T10:30:00Z',
      likes: 5,
      isLiked: false,
      replies: []
    },
    {
      id: 'post-2',
      author: {
        id: 'teacher-1',
        name: 'Dr. Jane Smith',
        role: 'teacher'
      },
      content: 'Great question! The dependency array in useEffect is crucial for controlling when the effect runs. Here are the key rules:\n\n1. Include all values from component scope that are used inside the effect\n2. If you want the effect to run only once, use an empty array []\n3. If you omit the dependency array, the effect runs after every render\n\nThe infinite re-render usually happens when you forget to include a dependency or when you create new objects/functions inside the component.',
      created_at: '2024-01-15T11:15:00Z',
      likes: 12,
      isLiked: true,
      replies: [
        {
          id: 'post-3',
          author: {
            id: 'student-2',
            name: 'Sarah Chen',
            role: 'student'
          },
          content: 'This is really helpful! I was making the mistake of creating objects inside my component. Moving them outside fixed the infinite loop.',
          created_at: '2024-01-15T12:00:00Z',
          likes: 3,
          isLiked: false
        }
      ]
    }
  ]
};

const CanonicalLink: React.FC<{ href: string }> = ({ href }) => {
  useEffect(() => {
    // Add canonical link to document head
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.setAttribute('href', href);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = href;
      document.head.appendChild(link);
    }

    // Cleanup on unmount
    return () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    };
  }, [href]);

  return null;
};

const PostComponent: React.FC<{ 
  post: DiscussionPost; 
  isReply?: boolean;
  onReply?: (postId: string) => void;
}> = ({ post, isReply = false, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
    onReply?.(post.id);
  };

  return (
    <div className={`${isReply ? 'ml-space-8 border-l-2 border-neutral-200 pl-space-4' : ''}`}>
      <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 p-space-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-space-4">
          <div className="flex items-center space-x-space-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-neutral-0" />
            </div>
            <div>
              <div className="flex items-center space-x-space-2">
                <h4 className="font-weight-medium text-neutral-900">{post.author.name}</h4>
                <span className={`badge ${
                  post.author.role === 'teacher' ? 'badge-secondary' : 'badge-primary'
                }`}>
                  {post.author.role}
                </span>
              </div>
              <div className="flex items-center space-x-space-1 text-scale-sm text-neutral-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-sm max-w-none mb-space-4">
          <p className="text-neutral-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-space-4 border-t border-neutral-100">
          <div className="flex items-center space-x-space-4">
            <button className={`flex items-center space-x-space-1 text-scale-sm transition-colors ${
              post.isLiked ? 'text-primary-600' : 'text-neutral-500 hover:text-primary-600'
            }`}>
              <ThumbsUp className="w-4 h-4" />
              <span>{post.likes}</span>
            </button>
            
            {!isReply && (
              <button 
                onClick={handleReply}
                className="flex items-center space-x-space-1 text-scale-sm text-neutral-500 hover:text-primary-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-space-4 pt-space-4 border-t border-neutral-100">
            <textarea
              placeholder="Write your reply..."
              className="form-input w-full h-24 resize-none"
            />
            <div className="flex items-center justify-end space-x-space-3 mt-space-3">
              <button 
                onClick={() => setShowReplyForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button className="btn-primary">
                Post Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-space-4 space-y-space-4">
          {post.replies.map((reply) => (
            <PostComponent 
              key={reply.id} 
              post={reply} 
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DiscussionThread: React.FC = () => {
  const { threadId, courseId } = useParams<{ threadId: string; courseId?: string }>();
  const location = useLocation();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine if this is a contextual route (within a course)
  const isContextual = Boolean(courseId);
  
  // Generate canonical URL (prefer global route)
  const canonicalUrl = `${window.location.origin}/discussions/${threadId}`;

  useEffect(() => {
    // Simulate API call to fetch thread data
    const fetchThread = async () => {
      setLoading(true);
      
      // In real app, this would be an API call
      // const response = await fetch(`/api/discussions/${threadId}${courseId ? `?course=${courseId}` : ''}`);
      
      setTimeout(() => {
        setThread(mockThread);
        setLoading(false);
      }, 500);
    };

    if (threadId) {
      fetchThread();
    }
  }, [threadId, courseId]);

  if (loading) {
    return (
      <div className="space-y-space-6">
        <div className="space-y-space-4">
          <div className="h-8 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
          <div className="h-20 bg-neutral-200 rounded-radius-lg animate-pulse" />
          <div className="h-32 bg-neutral-200 rounded-radius-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-space-12">
        <MessageSquare className="w-16 h-16 text-neutral-400 mx-auto mb-space-4" />
        <h2 className="heading-2">Discussion Not Found</h2>
        <p className="body-text">The discussion thread you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Canonical Link */}
      <CanonicalLink href={canonicalUrl} />

      {/* Thread Header */}
      <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 p-space-6 mb-space-6">
        <div className="flex items-start justify-between mb-space-4">
          <div className="flex-1">
            <div className="flex items-center space-x-space-2 mb-space-2">
              {thread.isPinned && (
                <Pin className="w-4 h-4 text-warning-600" />
              )}
              {thread.isLocked && (
                <Lock className="w-4 h-4 text-error-600" />
              )}
              <h1 className="heading-1 mb-0">{thread.title}</h1>
            </div>
            
            {/* Course Context (only show if not in contextual route) */}
            {!isContextual && thread.course && (
              <div className="flex items-center space-x-space-2 mb-space-3">
                <BookOpen className="w-4 h-4 text-primary-600" />
                <Link 
                  to={`/courses/${thread.course.id}`}
                  className="text-primary-600 hover:text-primary-700 font-weight-medium"
                >
                  {thread.course.title}
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-space-6 text-scale-sm text-neutral-500">
              <div className="flex items-center space-x-space-1">
                <User className="w-4 h-4" />
                <span>Started by {thread.author.name}</span>
              </div>
              <div className="flex items-center space-x-space-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-space-1">
                <Eye className="w-4 h-4" />
                <span>{thread.views} views</span>
              </div>
              <div className="flex items-center space-x-space-1">
                <MessageSquare className="w-4 h-4" />
                <span>{thread.participants} participants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Posts */}
      <div className="space-y-space-6">
        {thread.posts.map((post) => (
          <PostComponent 
            key={post.id} 
            post={post}
            onReply={(postId) => console.log('Reply to post:', postId)}
          />
        ))}
      </div>

      {/* New Post Form */}
      {!thread.isLocked && (
        <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 p-space-6 mt-space-6">
          <h3 className="heading-3 mb-space-4">Add to Discussion</h3>
          <textarea
            placeholder="Share your thoughts..."
            className="form-input w-full h-32 resize-none mb-space-4"
          />
          <div className="flex items-center justify-end">
            <button className="btn-primary">
              Post Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};