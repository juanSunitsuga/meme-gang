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
import ArrowDownwardOutlined from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlined from '@mui/icons-material/ArrowUpwardOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FetchComment from './FetchComments';
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
  onCommentClick?: () => void;  // optional handler click comment
  tags: string[];
  is_upvoted?: boolean;
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
  is_upvoted,
  tags,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [upvote, setUpvote] = useState(false);
  const [downvote, setDownvote] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(upvotes);
  const [downvotesCount, setDownvotesCount] = useState(downvotes);

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
            <IconButton sx={{ color: '#aaa' }}>
              <BookmarkBorderIcon />
            </IconButton>
            <IconButton sx={{ color: '#aaa' }}>
              <ShareOutlinedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>

      <Collapse in={showComments} timeout="auto" unmountOnExit>
      <Box id={`comments-${postId}`} px={2} pb={2}>
        <ErrorBoundary>
          {/* <CommentList key={postId} postId={postId} /> */}
          <FetchComment postId={postId} />
        </ErrorBoundary>
      </Box>
    </Collapse>

    </Card>
  );
};

export default PostCard;
