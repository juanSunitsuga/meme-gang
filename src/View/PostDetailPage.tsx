import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from './Components/PostCard';
import CommentList from './Components/CommentList';
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';

// dayjs.extend(relativeTime);

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

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`http://localhost:3000/posts/${postId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const postData = await res.json();
        console.log('Fetched post:', postData); // Debug log
        setPost(postData);
      } catch (error) {
        console.error('Failed to fetch post detail', error);
        setPost(null); // Pastikan set null kalau error
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div style={{ maxWidth: 640, margin: 'auto', padding: 16 }}>
      <PostCard
        postId={post.id}
        imageUrl={post.image_url || ''}
        title={post.title}
        username="Unknown" // TODO: Ganti jika backend punya data username
        timeAgo="just now" // TODO: Gunakan dayjs jika perlu
        upvotes={post.upvotes}
        downvotes={post.downvotes}
        comments={post.commentsCount}
      />

      {/* Tampilkan komentar */}
      <CommentList postId={post.id} />
    </div>
  );
};

export default PostDetailPage;
