import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';
import PostCard from './Components/PostCard';


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
    <div className="home-container" style={{marginTop: '1%'}}>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading memes...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="posts-container">
        {posts.length === 0 && !loading ? (
          <div className="no-posts">
            <h2>No memes found</h2>
            <p>Be the first to share a meme!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              postId={post.id} 
              imageUrl={post.image_url}
              title={post.title}
              username='Juan'
              timeAgo='Just now'
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={post.commentsCount}
              onCommentClick={() => navigate(`/post/${post.id}`)} // ini handler navigasinya
              tags={post.tags}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
