import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  Paper,
  List,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import PostCard from "../Components/PostCard";
import { Link, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchEndpoint } from "../FetchEndpoint";

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
}

interface Post {
  id: string;
  title: string;
  createdAt: string;
  image_url?: string;
  upvotes?: number;
  downvotes?: number;
  commentsCount?: number;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  user?: {
    username?: string;
  };
}

// Helper untuk mention dan link ke profile
function renderContentWithMention(content: string) {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, idx) =>
    /^@\w+/.test(part) ? (
      <Link
        key={idx}
        to={`/profile/${part.slice(1)}`}
        style={{ color: "#4fa3ff", fontWeight: 600, textDecoration: "none" }}
      >
        {part}
      </Link>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Ambil username user yang sedang login
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setCurrentUser(null);
      try {
        const data = await fetchEndpoint("/profile/me", "GET", token);
        setCurrentUser(data.username);
      } catch {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      try {
        const endpoint = `/profile/${username}`;
        const data = await fetchEndpoint(endpoint, 'GET');
        setUser(data);
      } catch (err) {
        console.error("Error fetching user profile", err);
      }
    };

    const fetchPosts = async () => {
      try {
        const endpoint = `/profile/${username}/post`;
        const data = await fetchEndpoint(endpoint, 'GET');
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts", err);
      }
    };

    const fetchComments = async () => {
      try {
        const endpoint = `/profile/${username}/comment`;
        const data = await fetchEndpoint(endpoint, 'GET');
        setComments(data);
      } catch (err) {
        console.error("Error fetching comments", err);
      }
    };

    setLoading(true);
    Promise.all([fetchUser(), fetchPosts(), fetchComments()]).finally(() =>
      setLoading(false)
    );
  }, [username]);

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Hapus komentar ini?")) return;
    try {
      const endpoint = `/comments/${commentId}`;
      await fetchEndpoint(endpoint, 'DELETE', token);

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert("Gagal menghapus komentar");
      console.error("Error deleting comment", err);
    }
  };

  if (loading || !user)
    return <Typography p={3}>Loading profile...</Typography>;

  const getAvatarUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return undefined;

    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }

    const filename = avatarPath.includes('/')
      ? avatarPath.split('/').pop()
      : avatarPath;

    if (!filename) return undefined;

    const cacheBuster = avatarPath.includes('?t=') ? '' : `?t=${new Date().getTime()}`;
    return `/uploads/avatars/${filename}${cacheBuster}`;
  };

  return (
    <Paper sx={{ backgroundColor: "#121212", color: "#fff", p: 4 , marginTop: "5%"}}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar
          src={getAvatarUrl(user.profilePicture)}
          alt={user.username}
          sx={{ width: 80, height: 80, mr: 2 }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="body2" color="gray">
            {user.email}
          </Typography>
        </Box>
      </Box>

      {/* Bio or Tagline */}
      <Typography variant="body2" mb={2} color="gray">
        My Funny Collection
      </Typography>

      <Divider sx={{ borderColor: "#333" }} />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        textColor="inherit"
        indicatorColor="primary"
        sx={{
          mb: 2,
          "& .MuiTab-root": { textTransform: "none", color: "white" },
        }}
      >
        <Tab label="Posts" />
        <Tab label="Comments" />
      </Tabs>

      <Divider sx={{ borderColor: "#333", mb: 2 }} />

      {/* Content */}
      {tab === 0 && (
        <Box>
          {posts.length === 0 ? (
            <Typography align="center" color="gray">
              No posts yet
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  imageUrl={post.image_url || ""}
                  title={post.title}
                  username={user.username || "Unknown"}
                  timeAgo={new Date(post.createdAt).toLocaleString()}
                  upvotes={post.upvotes || 0}
                  downvotes={post.downvotes || 0}
                  comments={post.commentsCount || 0}
                  isSaved={false}
                  tags={[]}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {comments.length === 0 ? (
            <Typography align="center" color="gray">
              No comments yet
            </Typography>
          ) : (
            <List>
              {comments.map((comment) => (
                <Paper
                  key={comment.id}
                  elevation={0}
                  sx={{
                    bgcolor: "#18191c",
                    color: "#f1f1f1",
                    borderRadius: 3,
                    p: 2,
                    mb: 1,
                    ml: 0,
                    boxShadow: "none",
                    position: "relative",
                  }}
                >
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      src={getAvatarUrl(user.profilePicture || undefined)}
                      alt={user.username}
                      sx={{ width: 36, height: 36, bgcolor: "#23272f", mt: 0.5 }}
                    />
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4fa3ff" }}>
                          {comment.user?.username || user.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#b0b0b0" }}>
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ mt: 0.5, wordBreak: "break-word" }}>
                        {renderContentWithMention(comment.content)}
                      </Typography>
                    </Box>
                    {/* Tombol aksi hanya jika user login adalah pemilik comment */}
                    {comment.user?.username === currentUser && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            sx={{ color: "#ff5252" }}
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Profile;