import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

interface Reply {
  id: string;
  user: { name: string; avatar: string | null };
  text: string;
  createdAt: string;
}

interface Comment {
  id: string;
  user: { name: string; avatar: string | null };
  text: string;
  createdAt: string;
  replies: Reply[];
}

const CommentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReplyingFor, setIsReplyingFor] = useState<string | null>(null);
  const [replyTextForReply, setReplyTextForReply] = useState<Record<string, string>>({});

  const fetchCommentAndReplies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/comments/${id}/replies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch comment data');
      const data = await res.json();
      setComment(data);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data komentar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentAndReplies();
  }, [id]);

  const handleReplySubmit = async () => {
    if (replyText.trim() === '') return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/comments/${id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyText }),
      });

      if (!res.ok) throw new Error('Failed to submit reply');

      setReplyText('');
      setIsReplying(false);
      fetchCommentAndReplies(); // Refresh replies
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim balasan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyForReplySubmit = async (replyId: string) => {
    const replyContent = replyTextForReply[replyId];
    if (replyContent.trim() === '') return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/replies/${replyId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (!res.ok) throw new Error('Failed to submit reply to reply');

      const updatedReplies = { ...replyTextForReply, [replyId]: '' };
      setReplyTextForReply(updatedReplies);
      setIsReplyingFor(null);
      fetchCommentAndReplies(); // Refresh replies
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim balasan untuk balasan.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <CircularProgress size={40} />
    </Box>
  );
  
  if (!comment) return (
    <Paper sx={{ p: 3, textAlign: 'center', mt: 4, borderRadius: 2 }}>
      <Typography variant="h6" color="text.secondary">Komentar tidak ditemukan 😢</Typography>
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 6, px: 2 }}>
      {/* Main Comment */}
      <Card
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            src={comment.user.avatar || '/default-avatar.png'}
            sx={{ 
              width: 48, 
              height: 48,
              boxShadow: '0 0 0 2px #fff, 0 0 0 4px #f0f0f0'
            }}
          />
          <Box sx={{ width: '100%' }}>
            <Typography 
              fontWeight="600" 
              fontSize="1.1rem"
              sx={{ color: 'primary.dark' }}
            >
              {comment.user.name}
            </Typography>
            <Typography 
              mt={1} 
              color="text.primary"
              sx={{ 
                lineHeight: 1.6,
                fontSize: '1rem'
              }}
            >
              {comment.text}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              mt={1.5} 
              display="block"
              sx={{ fontSize: '0.8rem' }}
            >
              {formatDate(comment.createdAt)}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box mt={1}>
              {!isReplying ? (
                <Button 
                  startIcon={<ReplyIcon />}
                  onClick={() => setIsReplying(true)} 
                  size="medium"
                  sx={{ 
                    borderRadius: 6,
                    px: 2,
                    py: 0.75,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  Balas
                </Button>
              ) : (
                <Box 
                  sx={{ 
                    mt: 2,
                    transition: 'all 0.3s ease',
                    animation: 'fadeIn 0.3s'
                  }}
                >
                  <TextField
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    size="medium"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Tulis balasanmu dengan sopan ya..."
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)'
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#fff'
                        }
                      }
                    }}
                    autoFocus
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => setIsReplying(false)}
                      startIcon={<CloseIcon />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleReplySubmit}
                      disabled={replyText.trim() === '' || submitting}
                      endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: 1
                      }}
                    >
                      {submitting ? 'Mengirim...' : 'Kirim'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Replies Section Title */}
      {comment.replies.length > 0 && (
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {comment.replies.length} Balasan
          </Typography>
        </Box>
      )}

      {/* Replies */}
      <Box 
        sx={{ 
          maxHeight: 500, 
          overflowY: 'auto', 
          pr: 1,
          position: 'relative'
        }}
      >
        {comment.replies.length > 0 && (
          <Box 
            sx={{
              position: 'absolute',
              left: 23,
              top: 0,
              bottom: 16,
              width: 2,
              bgcolor: 'divider',
              zIndex: 0
            }}
          />
        )}
        
        {comment.replies.map((reply) => (
          <Card
            key={reply.id}
            variant="outlined"
            sx={{
              mb: 2,
              ml: 6,
              p: 2,
              borderRadius: 2.5,
              backgroundColor: '#fafafa',
              borderColor: '#eaeaea',
              position: 'relative',
              zIndex: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                backgroundColor: '#ffffff'
              }
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                src={reply.user.avatar || '/default-avatar.png'}
                sx={{ 
                  width: 36, 
                  height: 36,
                  boxShadow: '0 0 0 2px #fff'
                }}
              />
              <Box>
                <Typography 
                  fontWeight="600" 
                  fontSize="0.95rem"
                  sx={{ color: 'primary.dark' }}
                >
                  {reply.user.name}
                </Typography>
                <Typography 
                  mt={0.5} 
                  color="text.primary"
                  sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}
                >
                  {reply.text}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  mt={1} 
                  display="block"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {formatDate(reply.createdAt)}
                </Typography>
                
                {/* Reply Button for each reply */}
                {!isReplyingFor || isReplyingFor !== reply.id ? (
                  <Button
                    startIcon={<ReplyIcon />}
                    onClick={() => setIsReplyingFor(reply.id)}
                    size="small"
                    sx={{
                      mt: 1,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    Balas
                  </Button>
                ) : (
                  <Box 
                    sx={{ 
                      mt: 2,
                      transition: 'all 0.3s ease',
                      animation: 'fadeIn 0.3s'
                    }}
                  >
                    <TextField
                      value={replyTextForReply[reply.id] || ''}
                      onChange={(e) => setReplyTextForReply({ ...replyTextForReply, [reply.id]: e.target.value })}
                      size="medium"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Tulis balasanmu dengan sopan ya..."
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.03)'
                          },
                          '&.Mui-focused': {
                            backgroundColor: '#fff'
                          }
                        }
                      }}
                      autoFocus
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsReplyingFor(null)}
                        startIcon={<CloseIcon />}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 500
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleReplyForReplySubmit(reply.id)}
                        disabled={replyTextForReply[reply.id]?.trim() === '' || submitting}
                        endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 500,
                          boxShadow: 1
                        }}
                      >
                        {submitting ? 'Mengirim...' : 'Kirim'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        ))}
        
        {comment.replies.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">Belum ada balasan. Jadilah yang pertama membalas!</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentDetailPage;
