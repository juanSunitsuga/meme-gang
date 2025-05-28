import React, { useState } from 'react';
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

import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark'; // For filled bookmark
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'; // For outline bookmark
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import CommentList from './CommentList'; // make sure path ini sesuai
// import { useNavigate } from 'react-router-dom';
import FetchComment from './FetchComments'; // make sure path ini sesuai
import ErrorBoundary from '../ErrorBoundary';
import { fetchEndpoint } from '../FetchEndpoint';

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
  tags,
  
}) => {
  const [showComments, setShowComments] = useState(false);
  // const navigate = useNavigate();

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
          <IconButton sx={{ color: 'gray' }}>
            <MoreVertIcon />
          </IconButton>
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
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ThumbUpAltOutlinedIcon fontSize="small" />
              <Typography variant="body2">{upvotes}</Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <ThumbDownAltOutlinedIcon fontSize="small" />
              <Typography variant="body2">{downvotes}</Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <EmojiEmotionsOutlinedIcon fontSize="small" />
              <Typography variant="body2">Cheers</Typography>
            </Stack>

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
