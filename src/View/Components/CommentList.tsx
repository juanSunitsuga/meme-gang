import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Stack, Typography, Box } from '@mui/material';
import MainCommentCard from './MainCommentCard';
import { fetchEndpoint } from '../FetchEndpoint';

interface Comment {
  id: string;
  user: { name: string; avatar: string | null };
  text: string;
  createdAt: string;
  postId?: string;
  replies: Comment[];
}

interface CommentListProps {
  postId?: string; // Tambahkan postId opsional dari props
}

const CommentList: React.FC<CommentListProps> = ({ postId: propPostId }) => {
  const { postId: paramPostId } = useParams<{ postId: string }>();
  const postId = propPostId || paramPostId; // Prioritaskan dari props

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchEndpoint(`/post/${postId}/comments`, 'GET', token);

      setComments(data);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memuat komentar 😥');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

const handleDelete = async (commentId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang 😥');
      return;
    }

    await fetchEndpoint(`/comments/${commentId}`, 'DELETE', token);

    const deleteRecursively = (comments: Comment[]): Comment[] =>
      comments
        .filter(comment => comment.id !== commentId)
        .map(comment => ({
          ...comment,
          replies: deleteRecursively(comment.replies),
        }));

    setComments(prevComments => deleteRecursively(prevComments));
  } catch (error) {
    console.error('Gagal menghapus komentar:', error);
    alert('Terjadi kesalahan saat menghapus komentar 😥');
  }
};


  const handleEditSuccess = async (commentId: string, updatedText: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang 😥');
      return;
    }

    await fetchEndpoint(
      `/comments/${commentId}`,
      'PUT',
      token,
      { text: updatedText }
    );

    const editRecursively = (comments: Comment[]): Comment[] =>
      comments.map(comment =>
        comment.id === commentId
          ? { ...comment, text: updatedText }
          : { ...comment, replies: editRecursively(comment.replies) }
      );

    setComments(prevComments => editRecursively(prevComments));
  } catch (error) {
    console.error('Gagal mengupdate komentar:', error);
    alert('Terjadi kesalahan saat mengupdate komentar 😥');
  }
};


  const handleReplySend = async (
    parentId: string,
    text: string,
    parentUsername: string
  ) => {
    const token = localStorage.getItem('token');
    const replyText = `@${parentUsername} ${text}`;

    try {
      const res = await fetch(
        `http://localhost:3000/comments/${parentId}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: replyText }),
        }
      );

      if (!res.ok) throw new Error('Gagal mengirim balasan');
      // Refresh comments after posting a reply
      await fetchComments();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim balasan 😢');
    }
  };

  const renderComments = (commentList: Comment[], level = 0) => (
    <Stack spacing={2}>
      {commentList.map((comment) => (
        <Box key={comment.id} sx={{ ml: level * 4 }}>
          <MainCommentCard
            postId={postId!}
            id={comment.id}
            user={comment.user}
            text={comment.text}
            createdAt={comment.createdAt}
            onDelete={() => handleDelete(comment.id)}
            onEditSuccess={(updatedText) =>
              handleEditSuccess(comment.id, updatedText)
            }
            onReplySend={(parentId, replyText, parentUsername) =>
              handleReplySend(parentId, replyText, parentUsername)
            }
          />
          {comment.replies?.length > 0 &&
            renderComments(comment.replies, level + 1)}
        </Box>
      ))}
    </Stack>
  );

  if (loading) return <CircularProgress sx={{ color: '#4fa3ff' }} />;

  return (
    <Stack spacing={2}>
      {comments.length === 0 ? (
        <Typography color="gray">Belum ada komentar</Typography>
      ) : (
        renderComments(comments)
      )}
    </Stack>
  );
};

export default CommentList;
