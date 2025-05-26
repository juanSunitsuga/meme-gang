import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from '../FetchEndpoint';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../Components/PostCard';
import NoContentPlaceholder from '../Components/NoContentPlaceholder';

interface SavedPost {
  post_id: string;
  saved_at: string;
}

interface Post {
  id: string;
  title: string;
  image_url: string;
  user: {
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  commentsCount: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  saved_at?: string; // From join with saved posts
}

const SavedPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Fetch saved posts
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }
    
    fetchSavedPosts();
  }, [isAuthenticated, token]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      
      const response = await fetchEndpoint('/save/saved-posts-with-details', 'GET', token);
      
      let savedPosts = response.data || response;
      
      if (!Array.isArray(savedPosts)) {
        console.error('Expected array of saved posts, got:', savedPosts);
        savedPosts = [];
      }
      
      savedPosts.sort((a: Post, b: Post) => {
        return new Date(b.saved_at || '').getTime() - new Date(a.saved_at || '').getTime();
      });
      
      setPosts(savedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setError('Failed to load saved posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      // Find the post to toggle its saved status
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1) return;

      // Always unsave since we're in saved posts view
      const endpoint = `/save/save-post/${postId}`;
      const method = 'DELETE';
      
      await fetchEndpoint(endpoint, method, token);
      
      // Remove post from the list
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error unsaving post:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
  
    if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    
    const diffMonth = Math.round(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
    
    const diffYear = Math.round(diffMonth / 12);
    return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Saved Posts
        </Typography>
        <Divider sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      </Box>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: '#aaa' }}>Loading saved posts...</Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : posts.length === 0 ? (
        <NoContentPlaceholder
          icon="fas fa-bookmark"
          title="No saved posts"
          message="Posts you save will appear here"
          actionText="Browse Posts"
          onAction={() => navigate('/')}
        />
      ) : (
        <Stack spacing={3}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              postId={post.id}
              imageUrl={post.image_url}
              title={post.title}
              username={post.user?.name || 'Anonymous'}
              timeAgo={formatTimeAgo(post.createdAt)}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={post.commentsCount}
              onCommentClick={() => navigate(`/post/${post.id}`)}
              onSaveClick={() => handleSavePost(post.id)}
              isSaved={true} // Always true since these are saved posts
              tags={post.tags || []}
            />
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default SavedPosts;