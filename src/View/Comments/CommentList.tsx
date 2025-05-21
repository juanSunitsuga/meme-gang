
import React, { useEffect, useState, useCallback } from 'react';
  import { useParams } from 'react-router-dom';
  import {
    CircularProgress,
    Stack,
    Typography,
    Box,
    Paper,
    Button,
    IconButton,
    Collapse,
    TextField,
    Avatar,
    Menu,
    MenuItem,
  } from '@mui/material';
  import ReplyIcon from '@mui/icons-material/Reply';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  import ExpandLessIcon from '@mui/icons-material/ExpandLess';
  import DeleteIcon from '@mui/icons-material/Delete';
  import MoreVertIcon from '@mui/icons-material/MoreVert';
  import { fetchEndpoint } from '../FetchEndpoint';

  interface User {
    username: string;
    avatar: string | null;
  }

  export interface Comment {
    id: string;
    user: User;
    content: string;
    createdAt: string;
    postId?: string;
    reply_to?: string;
    replies: Comment[];
  }

  interface CommentListProps {
    postId?: string;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ReplyInput: React.FC<{
  onSend: (text: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
  replyingTo?: string;
}> = ({ onSend, onCancel, autoFocus, replyingTo }) => {
  const [text, setText] = useState('');
  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <TextField
        fullWidth
        size="small"
        autoFocus={autoFocus}
        placeholder={replyingTo ? `Balas @${replyingTo}` : 'Tulis balasan...'}
        value={text}
        onChange={e => setText(e.target.value)}
        multiline
        minRows={2}
        sx={{
          background: '#18191c',
          borderRadius: 2,
          input: { color: '#f1f1f1' },
          textarea: { color: '#f1f1f1' },
        }}
        slotProps={{
          input: {
            style: { color: '#f1f1f1' },
          },
        }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            if (text.trim()) {
              onSend(text);
              setText('');
            }
          }}
          sx={{
            bgcolor: '#4fa3ff',
            color: '#fff',
            '&:hover': { bgcolor: '#3578e5' },
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          Kirim
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={onCancel}
          sx={{ color: '#b0b0b0' }}
        >
          Batal
        </Button>
      </Stack>
    </Box>
  );
};
  const CommentList: React.FC<CommentListProps> = ({ postId: propPostId }) => {
    const { postId: paramPostId } = useParams<{ postId: string }>();
    const postId = propPostId || paramPostId;

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
    const [selectedReply, setSelectedReply] = useState<{ id: string, anchor: HTMLElement | null } | null>(null);

    const fetchComments = useCallback(async () => {
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
      if (postId) fetchComments();
    }, [postId, fetchComments]);

    const handleReplySend = async (
      parentId: string,
      text: string,
      parentUsername: string,
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
            body: JSON.stringify({ content: replyText }),
          }
        );
        if (!res.ok) throw new Error('Gagal mengirim balasan');
        await fetchComments();
      } catch (err) {
        console.error(err);
        alert('Gagal mengirim balasan 😢');
      }
    };

    const handleDeleteComment = (commentId: string) => {
      handleDelete(commentId);
    };

    const handleDelete = async (commentId: string) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Unauthorized. Please login again.');
          return;
        }
        await fetchEndpoint(`/post/${postId}/comments/${commentId}`, 'DELETE', token);
        setComments(prev =>
          prev
            .filter(comment => comment.id !== commentId)
            .map(comment => ({
              ...comment,
              replies: Array.isArray(comment.replies)
                ? comment.replies.filter(reply => reply.id !== commentId)
                : [],
            }))
        );
        alert('Delete comment success');
      } catch (error) {
        console.error('Gagal menghapus komentar:', error);
        alert('Failed to delete comment, try again');
      }
    };

    const handleReplyMenuOpen = (event: React.MouseEvent<HTMLElement>, replyId: string) => {
      setSelectedReply({ id: replyId, anchor: event.currentTarget });
    };

    const handleReplyMenuClose = () => {
      setSelectedReply(null);
    };

    if (loading)
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#4fa3ff' }} />
        </Box>
      );

    const renderComment = (comment: Comment, isReply = false) => {
      const isMenuOpen = selectedReply?.id === comment.id;
      const hasReplies = comment.replies && comment.replies.length > 0;
      const showReplySection = showReplies[comment.id];

      console.log('showReplies', showReplies);
      return (
        <Paper
          key={comment.id}
          elevation={isReply ? 0 : 2}
          sx={{
            bgcolor: '#18191c',
            color: '#f1f1f1',
            borderRadius: 3,
            p: 2,
            mb: isReply ? 1 : 2,
            ml: isReply ? 4 : 0,
            boxShadow: isReply ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
            position: 'relative',
          }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Avatar
              src={comment.user.avatar || undefined}
              alt={comment.user.username}
              sx={{ width: 36, height: 36, bgcolor: '#23272f', mt: 0.5 }}
            />
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: '#4fa3ff',
                    mr: 1,
                    fontSize: '1rem',
                  }}
                >
                  {comment.user.username}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#b0b0b0', fontSize: '0.85rem' }}
                >
                  {formatDate(comment.createdAt)}
                </Typography>
              </Stack>
              <Typography
                variant="body1"
                sx={{ color: '#f1f1f1', mt: 0.5, wordBreak: 'break-word' }}
              >
              
              {comment.content}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<ReplyIcon sx={{ color: '#4fa3ff' }} />}
                  sx={{
                    color: '#4fa3ff',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 1.5,
                    minWidth: 0,
                    '&:hover': { bgcolor: '#23272f' },
                  }}
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setReplyingToUsername(comment.user.username);
                  }}
                >
                  Reply
                </Button>
                <Button
                    size="small"
                    startIcon={
                      showReplySection ? (
                        <ExpandLessIcon sx={{ color: '#b0b0b0' }} />
                      ) : (
                        <ExpandMoreIcon sx={{ color: '#b0b0b0' }} />
                      )
                    }
                    sx={{
                      color: '#b0b0b0',
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 2,
                      px: 1.5,
                      minWidth: 0,
                      '&:hover': { bgcolor: '#23272f' },
                    }}
                    onClick={() =>
                      setShowReplies((prev) => ({
                        ...prev,
                        [comment.id]: !prev[comment.id],
                      }))
                    }
                  >
                    {showReplySection ? 'Hide Replies' : 'Replies'}
                  </Button>
              </Stack>
              {replyingTo === comment.id && (
                <ReplyInput
                  onSend={async (text) => {
                    await handleReplySend(comment.id, text, comment.user.username);
                    setReplyingTo(null);
                    setReplyingToUsername(null);
                  }}
                  onCancel={() => {
                    setReplyingTo(null);
                    setReplyingToUsername(null);
                  }}
                  autoFocus
                  replyingTo={replyingToUsername || undefined}
                />
              )}
              {!isReply && hasReplies && (
              <Button
                size="small"
                startIcon={
                  showReplySection ? (
                    <ExpandLessIcon sx={{ color: '#b0b0b0' }} />
                  ) : (
                    <ExpandMoreIcon sx={{ color: '#b0b0b0' }} />
                  )
                }
                sx={{
                  color: '#b0b0b0',
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 1.5,
                  minWidth: 0,
                  '&:hover': { bgcolor: '#23272f' },
                }}
                onClick={() =>
                  setShowReplies((prev) => ({
                    ...prev,
                    [comment.id]: !prev[comment.id],
                  }))
                }
              >
                {showReplySection ? 'Hide Replies' : 'Replies'}
              </Button>
            )}

            {!isReply && hasReplies && (
              <Collapse in={showReplySection} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 1 }}>
                  {comment.replies
                    .filter((reply) => reply.reply_to === comment.id)
                    .map((reply) => renderComment(reply, true))}
                </Box>
              </Collapse>
            )}

            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={(e) => handleReplyMenuOpen(e, comment.id)}
                sx={{
                  color: '#b0b0b0',
                  p: 0.5,
                  '&:hover': { bgcolor: '#23272f' },
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={selectedReply?.anchor}
                open={isMenuOpen}
                onClose={handleReplyMenuClose}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: '#23272f',
                      color: '#f1f1f1',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      minWidth: 120,
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleDeleteComment(comment.id);
                    handleReplyMenuClose();
                  }}
                  sx={{
                    color: '#ff5252',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#2d2d2d' },
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Paper>
      );
    };

    return (
      <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', mt: 2 }}>
        {comments.length === 0 ? (
          <Typography
            align="center"
            sx={{ color: '#b0b0b0', mt: 4, fontStyle: 'italic' }}
          >
            Belum ada komentar.
          </Typography>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </Box>
    );
  };

  export default CommentList;
