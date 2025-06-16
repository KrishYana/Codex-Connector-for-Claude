import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Eye, Clock, User } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

interface ModuleContent {
  id: string;
  title: string;
  description: string;
  content: string;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  author: string;
  created_at: string;
  updated_at: string;
}

// Mock module data
const mockModule: ModuleContent = {
  id: 'module-1',
  title: 'Introduction to React Hooks',
  description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks.',
  content: `
# Introduction to React Hooks

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 and have revolutionized how we write React applications.

## What are Hooks?

Hooks are JavaScript functions that:
- Let you use state and other React features without writing a class
- Always start with the word "use"
- Can only be called at the top level of React functions

## Basic Hooks

### useState
The useState Hook lets you add state to function components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect
The useEffect Hook lets you perform side effects in function components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Rules of Hooks

1. **Only call Hooks at the top level** - Don't call Hooks inside loops, conditions, or nested functions
2. **Only call Hooks from React functions** - Call them from React function components or custom Hooks

## Custom Hooks

You can create your own Hooks to reuse stateful logic between components:

\`\`\`javascript
import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
\`\`\`

## Conclusion

React Hooks provide a more direct API to the React concepts you already know. They give you access to escape hatches and don't require you to learn complex functional or reactive programming techniques.
  `,
  attachments: [
    {
      id: 'att-1',
      name: 'React Hooks Cheat Sheet.pdf',
      url: '/files/react-hooks-cheat-sheet.pdf',
      type: 'application/pdf',
      size: 2048576 // 2MB
    },
    {
      id: 'att-2',
      name: 'Hook Examples.pdf',
      url: '/files/hook-examples.pdf',
      type: 'application/pdf',
      size: 1536000 // 1.5MB
    }
  ],
  author: 'Dr. Jane Smith',
  created_at: '2024-01-10T09:00:00Z',
  updated_at: '2024-01-15T14:30:00Z'
};

export const ModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { isOnline } = useOfflineStatus();
  const [module, setModule] = useState<ModuleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineContent, setIsOfflineContent] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from API (this will be cached by service worker)
        const response = await fetch(`/api/modules/${moduleId}`);
        
        if (response.ok) {
          const data = await response.json();
          setModule(data);
          setIsOfflineContent(false);
        } else if (response.status === 503) {
          // Offline fallback
          const offlineData = await response.json();
          if (offlineData.offline) {
            // This would normally come from the service worker cache
            setModule(mockModule);
            setIsOfflineContent(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch module:', error);
        // Fallback to mock data for demo
        setModule(mockModule);
        setIsOfflineContent(!isOnline);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId, isOnline]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async (attachment: ModuleContent['attachments'][0]) => {
    try {
      // This will be handled by the service worker for caching
      const response = await fetch(attachment.url);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-space-6">
        <div className="space-y-space-4">
          <div className="h-8 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
          <div className="h-64 bg-neutral-200 rounded-radius-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="text-center py-space-12">
        <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-space-4" />
        <h2 className="heading-2">Module Not Found</h2>
        <p className="body-text">The module you're looking for doesn't exist or isn't available offline.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-space-6">
      {/* Offline Content Notice */}
      {isOfflineContent && (
        <div className="bg-warning-50 border border-warning-200 rounded-radius-lg p-space-4">
          <div className="flex items-center space-x-space-2">
            <Eye className="w-5 h-5 text-warning-600" />
            <span className="font-weight-medium text-warning-800">
              Viewing cached content
            </span>
          </div>
          <p className="text-scale-sm text-warning-700 mt-space-1">
            This content was previously downloaded and is available offline. Some features may be limited.
          </p>
        </div>
      )}

      {/* Module Header */}
      <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 p-space-6">
        <h1 className="heading-1 mb-space-4">{module.title}</h1>
        <p className="body-text mb-space-4">{module.description}</p>
        
        <div className="flex items-center space-x-space-6 text-scale-sm text-neutral-500">
          <div className="flex items-center space-x-space-1">
            <User className="w-4 h-4" />
            <span>{module.author}</span>
          </div>
          <div className="flex items-center space-x-space-1">
            <Clock className="w-4 h-4" />
            <span>Updated {formatDate(module.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 p-space-6">
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: module.content.replace(/\n/g, '<br>') }} />
        </div>
      </div>

      {/* Attachments */}
      {module.attachments.length > 0 && (
        <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 p-space-6">
          <h3 className="heading-3 mb-space-4">Attachments</h3>
          <div className="space-y-space-3">
            {module.attachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center justify-between p-space-4 bg-neutral-50 rounded-radius-lg border border-neutral-200"
              >
                <div className="flex items-center space-x-space-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <h4 className="font-weight-medium text-neutral-900">{attachment.name}</h4>
                    <p className="text-scale-sm text-neutral-500">
                      {attachment.type} • {formatBytes(attachment.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownload(attachment)}
                  className="btn-primary flex items-center space-x-space-2"
                  disabled={!isOnline && isOfflineContent}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
          
          {!isOnline && (
            <div className="mt-space-4 p-space-3 bg-warning-50 border border-warning-200 rounded-radius-md">
              <p className="text-scale-sm text-warning-700">
                Downloads are not available while offline. Connect to the internet to download attachments.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};