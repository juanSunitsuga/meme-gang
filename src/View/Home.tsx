import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';
import { 
  Box, 
  Typography, 
  Card, 
  CardHeader, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Avatar, 
  Button, 
  IconButton, 
  CircularProgress,
  Alert,
  styled,
  alpha
} from '@mui/material';
import FAIcon from '../components/FAIcon';

// Interfaces
interface Post {
  id: string;
  title: string;
  content?: string;
  imageUrl: string;
  userId: string;
  user: {
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

// Styled components
const HomeContainer = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  padding: theme.spacing(2.5),
}));

const HomeHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2.5),
}));

const SortButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  marginLeft: theme.spacing(1.25),
  fontWeight: 500,
  color: '#555',
  borderRadius: '20px',
  fontFamily: '"Poppins", sans-serif',
  '&.active': {
    backgroundColor: '#f3f3f3',
    color: '#000',
    fontWeight: 600,
  },
  '&:hover': {
    backgroundColor: alpha('#f3f3f3', 0.7),
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: theme.spacing(5, 0),
}));

const PostsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
}));

const PostCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  fontWeight: 600,
  fontSize: '18px',
}));

const PostContent = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0, 2, 2),
  color: '#333',
}));

const PostImage = styled(CardMedia)(({ theme }) => ({
  width: '100%',
  maxHeight: '500px',
  objectFit: 'contain',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.01)',
  },
}));

const PostActions = styled(CardActions)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1.5, 2),
  borderTop: '1px solid #f0f0f0',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(2.5),
  color: '#555',
  fontSize: '14px',
  padding: theme.spacing(0.75, 1),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f3f3f3',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(0.75),
  },
  '&.liked': {
    color: '#1e88e5',
  },
}));

const NoPostsContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(5, 0),
  color: '#666',
}));

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const endpoint = sortBy === 'recent' ? '/posts/recent' : '/posts/popular';
      const data = await fetchEndpoint(endpoint, 'GET');
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await fetchEndpoint(`/posts/${postId}/like`, 'POST', token);
      
      // Update local state to reflect the like
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentClick = (postId: string) => {
    navigate(`/comments/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <HomeContainer>
      <HomeHeader>
        <Typography variant="h4" component="h1" fontFamily="'Poppins', sans-serif" fontWeight={600}>
          Meme Gang
        </Typography>
        <Box>
          <SortButton 
            className={sortBy === 'recent' ? 'active' : ''}
            onClick={() => setSortBy('recent')}
            startIcon={<FAIcon icon="fas fa-clock" />}
          >
            Recent
          </SortButton>
          <SortButton 
            className={sortBy === 'popular' ? 'active' : ''}
            onClick={() => setSortBy('popular')}
            startIcon={<FAIcon icon="fas fa-fire" />}
          >
            Popular
          </SortButton>
        </Box>
      </HomeHeader>

      {loading && (
        <LoadingContainer>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" fontFamily="'Poppins', sans-serif">
            Loading memes...
          </Typography>
        </LoadingContainer>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            my: 2.5, 
            borderLeft: '4px solid #c62828',
            '& .MuiAlert-message': {
              fontFamily: '"Poppins", sans-serif',
            }
          }}
        >
          {error}
        </Alert>
      )}

      <PostsContainer>
        {posts.length === 0 && !loading ? (
          <NoPostsContainer>
            <Typography variant="h5" fontWeight={600} fontFamily="'Poppins', sans-serif">
              No memes found
            </Typography>
            <Typography variant="body1" fontFamily="'Poppins', sans-serif" sx={{ mt: 1 }}>
              Be the first to share a meme!
            </Typography>
          </NoPostsContainer>
        ) : (
          posts.map(post => (
            <PostCard key={post.id}>
              <CardHeader
                avatar={
                  <Avatar 
                    src={post.user.profilePicture || '/default-avatar.png'} 
                    alt={post.user.name}
                    sx={{ width: 40, height: 40 }}
                  />
                }
                title={
                  <Typography variant="subtitle1" fontWeight={500} fontFamily="'Poppins', sans-serif">
                    {post.user.name}
                  </Typography>
                }
                subheader={
                  <Typography variant="caption" color="#777" fontFamily="'Poppins', sans-serif">
                    {formatDate(post.createdAt)}
                  </Typography>
                }
                sx={{ 
                  pb: 1, 
                  borderBottom: '1px solid #f0f0f0',
                  '& .MuiCardHeader-content': { overflow: 'hidden' }
                }}
              />
              
              <PostTitle variant="h6" fontFamily="'Poppins', sans-serif">
                {post.title}
              </PostTitle>
              
              {post.content && (
                <PostContent variant="body1" fontFamily="'Poppins', sans-serif">
                  {post.content}
                </PostContent>
              )}
              
              <PostImage
                component="img"
                image={post.imageUrl}
                alt={post.title}
                onClick={() => navigate(`/post/${post.id}`)}
              />
              
              <PostActions>
                <ActionButton 
                  className={post.isLiked ? 'liked' : ''}
                  onClick={() => handleLike(post.id)}
                  startIcon={
                    <FAIcon 
                      icon="fas fa-thumbs-up" 
                      style={{ color: post.isLiked ? '#1e88e5' : undefined }}
                    />
                  }
                >
                  {post.likesCount}
                </ActionButton>
                
                <ActionButton 
                  onClick={() => handleCommentClick(post.id)}
                  startIcon={<FAIcon icon="fas fa-comment" />}
                >
                  {post.commentsCount}
                </ActionButton>
                
                <ActionButton
                  startIcon={<FAIcon icon="fas fa-share" />}
                >
                  Share
                </ActionButton>
              </PostActions>
            </PostCard>
          ))
        )}
      </PostsContainer>
    </HomeContainer>
  );
};

export default Home;