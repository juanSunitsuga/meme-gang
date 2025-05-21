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
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CommentList from './CommentList'; // make sure path ini sesuai
// import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';



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
          <Chip label="wtf" size="small" sx={{ bgcolor: '#2c2c2c', color: '#fff' }} />
          <Chip label="funny" size="small" sx={{ bgcolor: '#2c2c2c', color: '#fff' }} />
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
        <CommentList key={postId} postId={postId} />
        </ErrorBoundary>
      </Box>
    </Collapse>

    </Card>
  );
};

export default PostCard;
