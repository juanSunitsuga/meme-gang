import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';
import './Home.css';

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
    <div className="home-container">
      <div className="home-header">
        <h1>Meme Gang</h1>
        <div className="sort-options">
          <button 
            className={sortBy === 'recent' ? 'active' : ''} 
            onClick={() => setSortBy('recent')}
          >
            Recent
          </button>
          <button 
            className={sortBy === 'popular' ? 'active' : ''} 
            onClick={() => setSortBy('popular')}
          >
            Popular
          </button>
        </div>
      </div>

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
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="user-info">
                  <img 
                    src={post.user.profilePicture || '/default-avatar.png'} 
                    alt={post.user.name} 
                    className="avatar"
                  />
                  <div>
                    <h3>{post.user.name}</h3>
                    <p className="post-date">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <h2 className="post-title">{post.title}</h2>
              
              {post.content && <p className="post-content">{post.content}</p>}
              
              <div className="post-image-container">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="post-image"
                  onClick={() => navigate(`/post/${post.id}`)}
                />
              </div>
              
              <div className="post-actions">
                <button 
                  className={`like-button ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <i className={`fas fa-thumbs-up ${post.isLiked ? 'liked' : ''}`}></i>
                  <span>{post.likesCount}</span>
                </button>
                
                <button 
                  className="comment-button"
                  onClick={() => handleCommentClick(post.id)}
                >
                  <i className="fas fa-comment"></i>
                  <span>{post.commentsCount}</span>
                </button>
                
                <button className="share-button">
                  <i className="fas fa-share"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;