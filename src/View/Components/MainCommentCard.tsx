import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

interface MainCommentCardProps {
  postId: string;
  id: string;
  user: { name: string; avatar: string | null };
  text: string;
  createdAt: string;
  onDelete?: () => void;
  onReplySend?: (parentId: string, replyText: string, parentUsername: string) => void;
  onEditSuccess?: (updatedText: string) => void;
}

const MainCommentCard: React.FC<MainCommentCardProps> = ({
  postId,
  id,
  user,
  text,
  createdAt,
  onDelete,
  onReplySend,
  onEditSuccess
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [loading, setLoading] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText(text);
  };

  const handleDelete = async () => {
    const confirm = window.confirm('Yakin mau hapus komentar ini? 😢');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/post/${postId}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Gagal hapus komentar');
      }

      onDelete?.();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus komentar.');
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/post/${postId}/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editedText }),
      });

      if (!res.ok) {
        throw new Error('Failed to update comment');
      }

      const data = await res.json();
      setIsEditing(false);
      onEditSuccess?.(data.comment.content);
    } catch (err) {
      console.error(err);
      alert('Gagal mengedit komentar.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    onReplySend?.(id, replyText, user.name);
    setReplyText('');
    setShowReplyInput(false);
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

  return (
    <Card sx={{ backgroundColor: '#2f2f2f', color: '#fff', p: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex">
          <Avatar src={user.avatar || undefined} sx={{ mr: 2 }} />
          <Box>
            <Typography fontWeight="bold" color="#4fa3ff">
              {user.name}
            </Typography>

            {isEditing ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                sx={{ mt: 1, backgroundColor: '#fff', borderRadius: 1 }}
              />
            ) : (
              <Typography>
                <span style={{ color: '#4fa3ff', fontWeight: 500 }}>
                  {text.startsWith('@') ? text.split(' ')[0] : ''}
                </span>{' '}
                {text.replace(/^@\S+\s/, '')}
              </Typography>
            )}

            <Typography variant="caption" color="gray">
              {formatDate(createdAt)}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleMenuOpen} sx={{ color: '#fff' }}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
          <MenuItem onClick={() => { handleDelete?.(); handleMenuClose(); }}>Delete</MenuItem>
        </Menu>
      </Box>

      {isEditing && (
        <Box mt={1} display="flex" gap={1}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveEdit}
            disabled={loading}
          >
            Simpan
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
          >
            Batal
          </Button>
        </Box>
      )}

      {!isEditing && (
        <Box mt={1}>
          <IconButton size="small" onClick={() => setShowReplyInput(!showReplyInput)} sx={{ color: '#4fa3ff' }}>
            <ReplyIcon fontSize="small" />
            <Typography variant="body2" ml={0.5}>
              Balas
            </Typography>
          </IconButton>
        </Box>
      )}

      {showReplyInput && (
        <Box mt={1}>
          <TextField
            fullWidth
            multiline
            size="small"
            placeholder={`Balas ke @${user.name}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={handleReplySubmit}
          >
            Kirim
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default MainCommentCard;
