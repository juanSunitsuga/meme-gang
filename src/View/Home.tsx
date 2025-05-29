import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';
import PostCard from './Components/PostCard';
import { useAuth } from './contexts/AuthContext';
import { useModal } from './contexts/ModalContext';

// Update Post interface to include isSaved property
interface Post {
  id: string;
  title: string;
  image_url: string;
  userIdOwnerPost: string;
  name: string;
  profilePicture?: string;
  createdAt: string;
  commentsCount: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  is_upvoted?: boolean;
  isSaved?: boolean;
  loggedInUserId?: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const navigate = useNavigate();
  const { isAuthenticated, token, isLoading, userData} = useAuth(); // <-- add isLoading
  const { openLoginModal } = useModal();

  useEffect(() => {
    fetchPosts();
  }, [sortBy, isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const endpoint = `/post?type=${sortBy === 'recent' ? 'fresh' : 'popular'}`;
      const data = await fetchEndpoint(endpoint, 'GET', isAuthenticated ? token : undefined);
      
      if (isAuthenticated && token) {
        try {
          const savedPostsResponse = await fetchEndpoint('/save/saved-posts', 'GET', token);
          
          // Check if the response has a data property that's an array
          const savedPostsArray = savedPostsResponse.data || savedPostsResponse;
          
          // Check if we now have an array before mapping
          if (Array.isArray(savedPostsArray)) {
            // Note: use post_id instead of postId to match your backend field
            const savedPostIds = new Set(savedPostsArray.map((item: any) => item.post_id));
            
            data.forEach((post: Post) => {
              post.isSaved = savedPostIds.has(post.id);
            });
          } else {
            console.error('Saved posts response is not in expected format:', savedPostsArray);
          }
        } catch (err) {
          console.error('Error fetching saved posts:', err);
        }
      }
      
      setPosts(data);
      console.log('Fetched posts:', data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle saving posts
  const handleSavePost = async (postId: string) => {
    if (!isAuthenticated) {
      // Show login modal if user is not authenticated
      openLoginModal();
      return;
    }

    try {
      // Find the post to toggle its saved status
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1) return;

      const currentSaveStatus = posts[postIndex].isSaved || false;
      const endpoint = `/save/save-post/${postId}`;
      const method = currentSaveStatus ? 'DELETE' : 'POST';
      
      const response = await fetchEndpoint(endpoint, method, token);
      console.log(`Post ${currentSaveStatus ? 'unsaved' : 'saved'} successfully`, response);
      
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...updatedPosts[postIndex],
        isSaved: !currentSaveStatus
      };
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleEditPost = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  // Show auth loading spinner before anything else
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading memes...</p>
      </div>
    );
  }

  return (
    <div className="home-container" style={{marginTop: '6%'}}>
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
              key={post.id}
              postId={post.id} 
              imageUrl={post.image_url}
              title={post.title}
              username={post.name}
              timeAgo={post.createdAt}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={post.commentsCount}
              onCommentClick={() => navigate(`/post/${post.id}`)}
              onSaveClick={() => handleSavePost(post.id)}
              isSaved={post.isSaved || false}
              tags={post.tags}
              is_upvoted={post.is_upvoted}
              userIdOwnerPost={post.userIdOwnerPost}
              loggedInUserId = {userData?.id}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
