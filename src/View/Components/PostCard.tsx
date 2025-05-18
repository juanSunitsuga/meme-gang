import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface PostCardProps {
  imageUrl: string;
  title: string;
  username: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  comments: number;
}

const PostCard: React.FC<PostCardProps> = ({
  imageUrl,
  title,
  username,
  timeAgo,
  upvotes,
  downvotes,
  comments,
}) => {
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
            <Box mt={2}>
              <Chip
                icon={<ChatBubbleOutlineIcon />}
                label={`${comments} Comments`}
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#fff',
                  borderRadius: 2,
                  fontWeight: 500,
                }}
              />
            </Box>
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
    </Card>
  );
};

export default PostCard;
