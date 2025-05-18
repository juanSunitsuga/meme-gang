import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';
import PostCard from './Components/PostCard';
import './Home.css';

// Interfaces
interface Post {
  title: string;
  imageUrl: string;
  user: {
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  commentsCount: number;
  upvotes: number;
  downvotes: number;
}

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
      const endpoint = `/post?type=${sortBy === 'recent' ? 'fresh' : 'popular'}`;
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

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Meme Gang</h1>
        <div className="sort-options">
          <button
            className={sortBy === 'recent' ? 'active' : ''}
            onClick={() => setSortBy('recent')}
            startIcon={<FAIcon icon="fas fa-clock" />}
          >
            Recent
          </button>
          <button
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
            <PostCard
              imageUrl={post.imageUrl}
              title={post.title}
              username='Juan'
              timeAgo='Just now'
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={post.commentsCount}
            />
          ))
        )}
      </PostsContainer>
    </HomeContainer>
  );
};

export default Home;
