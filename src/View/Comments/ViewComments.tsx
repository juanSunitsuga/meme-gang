import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';

const commentData = {
  id: 1,
  name: "Ardente Noira",
  avatar: "https://i.pravatar.cc/150?img=1",
  text: "Koding itu seni, bukan cuma logika 😘",
  time: "2 jam lalu",
  replies: [
    {
      id: 11,
      name: "Zhongli",
      avatar: "https://i.pravatar.cc/150?img=2",
      text: "Seni yang berbahaya kalau salah syntax 😌",
      time: "1 jam lalu",
    },
    {
      id: 12,
      name: "Childe",
      avatar: "https://i.pravatar.cc/150?img=3",
      text: "Kalau gitu ajarin aku dong~",
      time: "30 menit lalu",
    },
  ],
};

export default function CommentThread() {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      {/* Main Comment */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={commentData.avatar} />
          <Box>
            <Typography fontWeight="bold">{commentData.name}</Typography>
            <Typography variant="body2">{commentData.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {commentData.time}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Replies */}
      {commentData.replies.map((reply) => (
        <Card key={reply.id} variant="outlined" sx={{ mb: 1, ml: 6 }}>
          <CardContent sx={{ display: 'flex', gap: 2 }}>
            <Avatar src={reply.avatar} />
            <Box>
              <Typography fontWeight="bold">{reply.name}</Typography>
              <Typography variant="body2">{reply.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {reply.time}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
