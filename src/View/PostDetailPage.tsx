import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from './Components/PostCard';
// import CommentList from './Components/CommentList';
import { fetchEndpoint } from './FetchEndpoint';

interface PostDetail {
  id: string;
  title: string;
  image_url: string | null;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
}

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(0); // Add refresh state

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true); // Ensure loading is set when fetching
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
  }, [postId, refresh]); // Add refresh as dependency

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

      const response = await fetch(`http://localhost:3000/post/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: trimmedComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gagal menambahkan komentar:', errorData);
        return;
      }

      setCommentText('');
      setRefresh((prev) => prev + 1); // Trigger refresh after comment
    } catch (error) {
      console.error('Terjadi kesalahan saat submit komentar:', error);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div style={{ maxWidth: 640, margin: 'auto', padding: 16 }}>
        <PostCard
            postId={post.id}
            imageUrl={post.image_url || ''}
            title={post.title}
            username="Unknown"
            timeAgo="just now"
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            comments={post.commentsCount}
        />

      <div style={{ marginTop: 32 }}>
        <form
            onSubmit={handleCommentSubmit}
            style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1e1e1e',
            padding: 8,
            borderRadius: 8,
            }}
        >
            <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Leave a comment..."
            style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 6,
                border: '1px solid #333',
                backgroundColor: '#121212',
                color: '#fff',
                fontSize: 14,
                marginRight: 8,
                outline: 'none',
            }}
            />
            <button
            type="submit"
            disabled={submitting}
            style={{
                padding: '10px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
            }}
            >
            {submitting ? 'Post' : 'Post'}
            </button>
        </form>
        </div>
    </div>
  );
};

export default PostDetailPage;
