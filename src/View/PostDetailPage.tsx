import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from './Components/PostCard';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import ErrorBoundary from './ErrorBoundary';
import FetchComment from './Components/FetchComments';
import { fetchEndpoint } from './FetchEndpoint';

interface PostDetail {
  id: string;
  title: string;
  name: string | null;
  image_url: string | null;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  isSaved?: boolean;
  tags?: string[];
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const endpoint = `/post/${postId}`;
        const data = await fetchEndpoint(endpoint, 'GET');
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post detail', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId, refresh]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token tidak ditemukan. Pengguna belum login.');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = `/post/${postId}/comments`;
      
      await fetchEndpoint(endpoint, 'POST', token, {content: trimmedComment});

      setCommentText('');
      setRefresh((prev) => prev + 1);
      
    } catch (error) {
      console.error('Terjadi kesalahan saat submit komentar:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
      <Paper 
        sx={{ 
          bgcolor: "#1a1a1a", 
          color: "#fff", 
          borderRadius: 4, 
          overflow: "hidden",
          border: "1px solid #333"
        }}
      >
        {/* PostCard Section */}
        <Box sx={{ p: 2, pb: 0 }}>
          <PostCard
            postId={post.id}
            imageUrl={post.image_url || ''}
            title={post.title}
            username={post.name || 'Unknown User'}
            timeAgo={post.updatedAt}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            comments={post.commentsCount}
            isSaved={post.isSaved ?? false}
            tags={post.tags ?? []}
          />
        </Box>
        
        {/* Subtle Divider */}
        <Divider sx={{ borderColor: '#333', mx: 2, my: 1 }} />
        
        {/* Comments Section */}
        <Box sx={{ p: 2, pt: 1 }}>
          {/* Comments List */}
          <Box sx={{ mb: 3 }}>
            <ErrorBoundary>
              <FetchComment postId={postId || ''} />
            </ErrorBoundary>
          </Box>
          
          {/* Add Comment Form - Moved to bottom */}
          <form
            onSubmit={handleCommentSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a comment..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #333',
                backgroundColor: '#23272f',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#333';
              }}
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              style={{
                padding: '12px 20px',
                backgroundColor: submitting || !commentText.trim() ? '#555' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: submitting || !commentText.trim() ? 'not-allowed' : 'pointer',
                fontSize: 14,
                transition: 'background-color 0.2s ease',
                minWidth: 80,
              }}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default PostDetailPage;