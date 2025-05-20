import React, { useEffect, useState, useRef } from 'react';
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

  // Ref for the main container
  const containerRef = useRef<HTMLDivElement>(null);

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
      fetchCommentAndReplies();
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
      const res = await fetch(`http://localhost:3000/comments/${replyId}/replies`, {
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
      fetchCommentAndReplies(); 
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim balasan.');
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
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      bgcolor: '#1A1A1A'
    }}>
      <CircularProgress size={40} sx={{ color: '#58a9ff' }} />
    </Box>
  );
  
  if (!comment) return (
    <Paper sx={{ 
      p: 3, 
      textAlign: 'center', 
      mt: 4, 
      borderRadius: 2,
      bgcolor: '#2D2D2D',
      color: 'rgba(255,255,255,0.8)'
    }}>
      <Typography variant="h6">Komentar tidak ditemukan</Typography>
    </Paper>
  );

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        minHeight: '100vh', 
        maxWidth: 700, 
        mx: 'auto', 
        px: 2,
        pb: 5,
        color: 'white',
      }}
    >

      {/* Main Comment */}
      <Card
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          mt: 4,
          borderRadius: 3,
          bgcolor: '#2D2D2D',
          color: 'white',
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
              bgcolor: '#666',
              boxShadow: '0 0 0 2px #2D2D2D, 0 0 0 4px #444'
            }}
          />
          <Box sx={{ width: '100%' }}>
            <Typography 
              fontWeight="600" 
              fontSize="1.1rem"
              sx={{ color: '#58a9ff' }}
            >
              {comment.user.name}
            </Typography>
            <Typography 
              mt={1} 
              color="white"
              sx={{ 
                lineHeight: 1.6,
                fontSize: '1rem'
              }}
            >
              {comment.text}
            </Typography>
            <Typography 
              variant="caption" 
              color="rgba(255,255,255,0.6)" 
              mt={1.5} 
              display="block"
              sx={{ fontSize: '0.8rem' }}
            >
              {formatDate(comment.createdAt)}
            </Typography>

            <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />

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
                    color: '#58a9ff',
                    '&:hover': {
                      backgroundColor: 'rgba(88, 169, 255, 0.1)'
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
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#58a9ff'
                        }
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)'
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
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
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
                        bgcolor: '#58a9ff',
                        '&:hover': {
                          bgcolor: '#4a90e2'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(88, 169, 255, 0.3)',
                          color: 'rgba(255, 255, 255, 0.4)'
                        }
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
            color="rgba(255,255,255,0.7)"
            sx={{ fontWeight: 500 }}
          >
            {comment.replies.length} Balasan
          </Typography>
        </Box>
      )}

      {/* Replies */}
      <Box 
        sx={{ 
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
              bgcolor: '#444',
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
              backgroundColor: '#222',
              borderColor: '#333',
              color: 'white',
              position: 'relative',
              zIndex: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                backgroundColor: '#282828'
              }
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                src={reply.user.avatar || '/default-avatar.png'}
                sx={{ 
                  width: 36, 
                  height: 36,
                  bgcolor: '#666',
                  boxShadow: '0 0 0 2px #222'
                }}
              />
              <Box>
                <Typography 
                  fontWeight="600" 
                  fontSize="0.95rem"
                  sx={{ color: '#58a9ff' }}
                >
                  {reply.user.name}
                </Typography>
                <Typography 
                  mt={0.5} 
                  color="white"
                  sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}
                >
                  {reply.text}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="rgba(255,255,255,0.6)" 
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
                      fontWeight: 500,
                      color: '#58a9ff',
                      '&:hover': {
                        backgroundColor: 'rgba(88, 169, 255, 0.1)'
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
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#58a9ff'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)'
                        }
                      }}
                      autoFocus
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                      variant="outlined"
                      onClick={() => {
                        setIsReplyingFor(null);
                        setReplyText('');
                      }}
                      startIcon={<CloseIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
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
                          bgcolor: '#58a9ff',
                          '&:hover': {
                            bgcolor: '#4a90e2'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'rgba(88, 169, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.4)'
                          }
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
          <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.6)' }}>
            <Typography variant="body2">Belum ada balasan. Jadilah yang pertama membalas!</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentDetailPage;