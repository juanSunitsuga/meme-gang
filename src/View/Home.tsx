import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';
import PostCard from './Components/PostCard';
import { useAuth } from './contexts/AuthContext';
import { useModal } from './contexts/ModalContext';

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

interface HomeProps {
  searchResults?: Post[] | null;
  searchQuery?: string;
}

const Home: React.FC<HomeProps> = ({ searchResults, searchQuery }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [searchNotFound, setSearchNotFound] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, token, isLoading, userData} = useAuth(); // <-- add isLoading
  const { openLoginModal } = useModal();

  useEffect(() => {
    if (searchResults) {
      // Jika hasil pencarian ada, gunakan hasil pencarian
      if (Array.isArray(searchResults) && searchResults.length === 0) {
        setPosts([]);
        setSearchNotFound(true);
        setLoading(false);
        return;
      }
      setSearchNotFound(false);
      const mappedResults = searchResults.map(post => ({
        ...post,
        user: post.user ?? { name: 'Anonymous' },
        commentsCount: post.commentsCount ?? 0,
        upvotes: post.upvotes ?? 0,
        downvotes: post.downvotes ?? 0,
        tags: post.tags ?? [],
      }));
      setPosts(mappedResults);
      setLoading(false);
    } else {
      setSearchNotFound(false);
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, sortBy, isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const endpoint = `/post?type=${sortBy === 'recent' ? 'fresh' : 'popular'}`;
      const data = await fetchEndpoint(endpoint, 'GET', isAuthenticated ? token : undefined);

      if (isAuthenticated && token) {
        try {
          const savedPostsResponse = await fetchEndpoint('/save/saved-posts', 'GET', token);
          const savedPostsArray = savedPostsResponse.data || savedPostsResponse;
          if (Array.isArray(savedPostsArray)) {
            const savedPostIds = new Set(savedPostsArray.map((item: any) => item.post_id));
            data.forEach((post: Post) => {
              post.isSaved = savedPostIds.has(post.id);
            });
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

  const handleSavePost = async (postId: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1) return;

      const currentSaveStatus = posts[postIndex].isSaved || false;
      const endpoint = `/save/save-post/${postId}`;
      const method = currentSaveStatus ? 'DELETE' : 'POST';

      await fetchEndpoint(endpoint, method, token);

      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...updatedPosts[postIndex],
        isSaved: !currentSaveStatus,
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

      {searchNotFound && searchQuery && (
        <div className="no-posts">
          <h2>No memes found for "{searchQuery}"</h2>
          <p>Try searching with different keywords or be the first to share a meme!</p>
        </div>
      )}

      {!searchNotFound && (
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
      )}
    </div>
  );
};

export default Home;
