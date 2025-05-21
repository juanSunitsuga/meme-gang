import React from 'react';
import {
  Avatar,
  Box,
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';

interface MainCommentCardProps {
  postId: string;
  id: string;
  user: { username: string; avatar: string | null };
  text: string;
  createdAt: string;
  onDelete?: () => void;
  onReplySend?: (parentId: string, replyText: string, parentUsername: string) => void;
}

const MainCommentCard: React.FC<MainCommentCardProps> = ({
  postId,
  id,
  user,
  text,
  createdAt,
  onDelete,
  onReplySend,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      } else {
        console.log('Komentar berhasil dihapus');
      }

      onDelete?.();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus komentar.');
    }
    handleMenuClose();
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
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ backgroundColor: '#2f2f2f', color: '#fff', p: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex" alignItems="flex-start">
          <Avatar src={user.avatar || undefined} sx={{ mr: 2, mt: 0.5 }} />
          <Box>
            <Typography fontWeight="bold" color="#4fa3ff">
              {user.username}
            </Typography>
            <Typography variant="caption" color="gray" sx={{ display: 'block', mb: 1 }}>
              {formatDate(createdAt)}
            </Typography>
            <Typography sx={{ mt: 1, color: '#ddd', whiteSpace: 'pre-line' }}>
              {text}
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
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </Box>
      <Box mt={1}>
        <IconButton
          size="small"
          onClick={() => {
            const replyText = prompt(`Balas ke @${user.username}:`);
            if (replyText && onReplySend) {
              onReplySend(id, replyText, user.username);
            }
          }}
          sx={{ color: '#4fa3ff' }}
        >
          <ReplyIcon fontSize="small" />
          <Typography variant="body2" ml={0.5}>
            Balas
          </Typography>
        </IconButton>
      </Box>
    </Card>
  );
};

export default MainCommentCard;
