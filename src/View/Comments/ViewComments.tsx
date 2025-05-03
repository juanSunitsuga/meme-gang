import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';

interface Reply {
  id: string;
  user: { name: string; avatar: string };
  text: string;
  createdAt: string;
}

interface Comment {
  id: string;
  user: { name: string; avatar: string };
  text: string;
  createdAt: string;
  replies: Reply[];
}

const CommentDetailPage = () => {
  const { commentsId } = useParams<{ commentsId: string }>();
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentAndReplies = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/comments/${commentsId}/replies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch comment data');
        }

        const data = await res.json();
        setComment(data);
      } catch (err) {
        alert('Gagal mengambil data komentar.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommentAndReplies();
  }, [commentsId]);

  if (loading) return <div>Loading...</div>;
  if (!comment) return <div>No comment found 😢</div>;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      {/* Main Comment */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={comment.user.avatar} />
          <Box>
            <Typography fontWeight="bold">{comment.user.name}</Typography>
            <Typography>{comment.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Replies */}
      {comment.replies.map((reply) => (
        <Card key={reply.id} variant="outlined" sx={{ mb: 1, ml: 6 }}>
          <CardContent sx={{ display: 'flex', gap: 2 }}>
            <Avatar src={reply.user.avatar} />
            <Box>
              <Typography fontWeight="bold">{reply.user.name}</Typography>
              <Typography>{reply.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(reply.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CommentDetailPage;
