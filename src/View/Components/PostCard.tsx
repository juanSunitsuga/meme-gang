import React, { useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Stack,
  Avatar,
  Chip,
  Collapse,
} from '@mui/material';
import ArrowDownwardOutlined from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlined from '@mui/icons-material/ArrowUpwardOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark'; // For filled bookmark
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'; // For outline bookmark
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FetchComment from './FetchComments';
import ErrorBoundary from '../ErrorBoundary';
import { fetchEndpoint } from '../FetchEndpoint';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PostCardProps {
  postId: string;
  imageUrl: string;
  title: string;
  username: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  isSaved: boolean;
  onCommentClick?: () => void;
  onSaveClick?: () => void;
  tags: string[];
  is_upvoted?: boolean;
  userIdOwnerPost: string;
  loggedInUserId?: string;
  onEdit?: (updatedPost: any) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  postId,
  imageUrl,
  title,
  username,
  timeAgo,
  upvotes,
  downvotes,
  comments,
  onCommentClick,
  onSaveClick,
  isSaved = false,  
  is_upvoted,
  tags,
  userIdOwnerPost,
  loggedInUserId,
  onEdit,
  onDelete,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [upvote, setUpvote] = useState(is_upvoted);
  const [downvote, setDownvote] = useState(!is_upvoted ? false : undefined);
  const [upvotesCount, setUpvotesCount] = useState(upvotes);
  const [downvotesCount, setDownvotesCount] = useState(downvotes);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const { openEditPostModal } = useModal();
  const { token } = useAuth();

  // Ini fungsi baru untuk handle comment click
  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick(); // kalau ada callback dari parent, panggil navigasi
    } else {
      setShowComments((prev) => !prev); // kalau gak ada, toggle expand comment seperti biasa
      setTimeout(() => {
        const el = document.getElementById(`comments-${postId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem('token')
    
    try {
      // Send postId as part of the URL path, not as the body
      const method = isSaved ? 'DELETE' : 'POST';
      const endpoint = `/save/save-post/${postId}`;
      
      const response = await fetchEndpoint(endpoint, method, token);
      
      if (response) {
        console.log(`Post ${isSaved ? 'unsaved' : 'saved'} successfully`);
        onSaveClick && onSaveClick();
      } else {
        console.error(`Failed to ${isSaved ? 'unsave' : 'save'} post`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }

  }

  const handleVotesClick = async (type: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('token');
    const endpoint = `/vote/${type}/${postId}`;
    try {
      if (type === 'upvote') {
        if (!upvote && !downvote) {
          setUpvote(true);
          setUpvotesCount(upvotesCount + 1);
          await fetchEndpoint(endpoint, 'POST', token);
        } else if (upvote) {
          setUpvote(false);
          setUpvotesCount(upvotesCount - 1);
          await fetchEndpoint(endpoint, 'DELETE', token);
        } else {
          setUpvote(true);
          setDownvote(false);
          setUpvotesCount(upvotesCount + 1);
          setDownvotesCount(downvotesCount > 0 ? downvotesCount - 1 : 0);
          await fetchEndpoint(endpoint, 'PUT', token);
        }
      } else {
        if (!upvote && !downvote) {
          setDownvote(true);
          setDownvotesCount(downvotesCount + 1);
          await fetchEndpoint(endpoint, 'POST', token);
        } else if (downvote) {
          setDownvote(false);
          setDownvotesCount(downvotesCount - 1);
          await fetchEndpoint(endpoint, 'DELETE', token);
        } else {
          setDownvote(true);
          setUpvote(false);
          setDownvotesCount(downvotesCount + 1);
          setUpvotesCount(upvotesCount > 0 ? upvotesCount - 1 : 0);
          await fetchEndpoint(endpoint, 'PUT', token);
        }
      }
    }
    catch (error) {
      console.error('Error handling vote:', error);
      // Handle error appropriately, e.g., show a notification
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = async () => {
    handleMenuClose();
    openEditPostModal({
      postId,
      imageUrlEdit: imageUrl,
      titleEdit: title,
      tagsEdit: tags,
    });
  };

  const handleDelete = async () => {
    handleMenuClose();
    const endpoint = `/post/${postId}`;
    const data = await fetchEndpoint(endpoint, 'DELETE', token);
    if (data && typeof onDelete === 'function') {
      onDelete(postId);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      const handleScroll = () => {
        setTimeout(() => handleMenuClose(), 10);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [menuOpen]);

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 640,
        mx: 'auto',
        my: 3,
        bgcolor: '#1a1a1a',
        color: '#fff',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar alt={username} sx={{ width: 32, height: 32 }} />
            <Box>
              <Typography fontSize={14} fontWeight={500}>
                {username}
              </Typography>
              <Typography fontSize={12} color="gray">
                {timeAgo}
              </Typography>
            </Box>
          </Stack>
          {loggedInUserId === userIdOwnerPost && (
            <>
              <IconButton sx={{ color: 'gray' }} onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              {anchorEl && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  disableScrollLock={true}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleEdit}>Edit</MenuItem>
                  <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>
              )}
            </>
          )}
        </Stack>

        {/* Title */}
        <Typography mt={2} fontWeight={600} fontSize={16}>
          {title}
        </Typography>

        {/* Image */}
        <Box
          component="img"
          src={imageUrl}
          alt="Post"
          sx={{
            width: '100%',
            borderRadius: 1,
            mt: 1,
            maxHeight: 640,
            objectFit: 'contain',
          }}
        />

        {/* Tags (optional example) */}
        <Stack direction="row" spacing={1} mt={1}>
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ bgcolor: '#2c2c2c', color: '#fff' }}
              />
            ))
          ) : null}
        </Stack>

        {/* Interaction Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <IconButton
              sx={{
                color: upvote ? '#4caf50' : '#fff', // green if upvoted
                transition: 'color 0.2s',
              }}
              onClick={handleVotesClick.bind(null, 'upvote')}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ArrowUpwardOutlined fontSize="small" />
                <Typography variant="body2">{upvotesCount}</Typography>
              </Stack>
            </IconButton>

            <IconButton
              sx={{
                color: downvote ? '#f44336' : '#fff',
                transition: 'color 0.2s',
              }}
              onClick={handleVotesClick.bind(null, 'downvote')}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ArrowDownwardOutlined fontSize="small" />
                <Typography variant="body2">{downvotesCount}</Typography>
              </Stack>
            </IconButton>

            {/* Comment Button */}
            <Chip
              icon={<ChatBubbleOutlineIcon />}
              label={`${comments} Comments`}
              onClick={handleCommentClick} // Ganti sini, pake fungsi baru
              sx={{
                backgroundColor: '#2c2c2c',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <IconButton
              sx={{
                color: isSaved ? '#1976d2' : '#aaa' // Change color when saved
              }}
              onClick={handleSaveClick}
            >
              {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <IconButton sx={{ color: '#aaa' }}>
              <ShareOutlinedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PostCard;
