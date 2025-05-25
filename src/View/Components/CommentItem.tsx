import {
  Avatar,
  Box,
  Button,
  Collapse,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ReplyIcon from "@mui/icons-material/Reply";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface User {
  username: string;
  avatar: string | null;
  profilePicture?: string | null;
}

export type Comment = {
  id: string;
  user?: User;
  content: string;
  parentId?: string | null;
  reply_to?: string | null; // untuk backend yang pakai reply_to
  createdAt: string;
  updatedAt?: string;
  profilePicture?: string;
  post_id?: string;
};

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  scrollToTargetUsername?: string;
}

const formatDate = (dateString: string) => {
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
};

// Membuat struktur pohon reply dari array flat
type ReplyNode = Comment & { replies?: ReplyNode[] };

function buildReplyTree(replies: Comment[], parentId: string): ReplyNode[] {
  return replies
    .filter(r => (r.parentId ?? r.reply_to) === parentId)
    .map(r => ({
      ...r,
      replies: buildReplyTree(replies, r.id),
    }));
}

function renderReplies(replyNodes: ReplyNode[], onDelete: (id: string) => void) {
  return replyNodes.map((reply) => (
    <CommentItem
      key={reply.id}
      comment={reply}
      onDelete={onDelete}
    />
  ));
}

const CommentItem = ({
  comment,
  onDelete,
  scrollToTargetUsername,
}: CommentItemProps) => {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [savingEdit, setSavingEdit] = useState(false);

  // State untuk konten dan updatedAt
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState<string | undefined>(
    comment.updatedAt
  );

  const openMenu = Boolean(anchorEl);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      scrollToTargetUsername &&
      scrollToTargetUsername === comment.user?.username &&
      commentRef.current
    ) {
      commentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      commentRef.current.style.outline = "2px solid #4fa3ff";
      commentRef.current.style.borderRadius = "12px";
      setTimeout(() => {
        if (commentRef.current) {
          commentRef.current.style.outline = "none";
        }
      }, 3000);
    }
  }, [scrollToTargetUsername, comment.user?.username]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleShowReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setLoading(true);
    try {
      // Ambil semua reply (langsung & nested) dari backend
      const res = await fetch(`http://localhost:3000/comments/${comment.id}`);
      const data = await res.json();

      // Jika backend mengirim { mainComment, replies }
      const repliesArray: Comment[] = Array.isArray(data)
        ? data
        : data.replies || [];

      setReplies(
        repliesArray.map((reply: any) => ({
          id: reply.id,
          user: {
            username: reply.user?.username || reply.user?.name || "",
            avatar: reply.user?.avatar || reply.user?.profilePicture || "",
            profilePicture: reply.user?.profilePicture || "",
          },
          content: reply.content || reply.text || "",
          parentId: reply.parentId ?? reply.reply_to ?? comment.id,
          reply_to: reply.reply_to,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          profilePicture: reply.user?.avatar || reply.user?.profilePicture || "",
          post_id: reply.post_id,
        }))
      );
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to fetch replies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    setShowReplyInput((prev) => {
      if (prev) setReplyContent("");
      return !prev;
    });
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    setSendingReply(true);
    try {
      const token = localStorage.getItem("token");
      const formattedReply = `@${comment.user?.username ?? "user"} ${replyContent}`;

      const res = await fetch(`http://localhost:3000/comments/${comment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formattedReply,
          reply_to: comment.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      const newReplyRaw = await res.json();
      const newReply: Comment = {
        id: newReplyRaw.id,
        user: {
          username: newReplyRaw.user?.username || newReplyRaw.user?.name || "",
          avatar: newReplyRaw.user?.avatar || newReplyRaw.user?.profilePicture || "",
          profilePicture: newReplyRaw.user?.profilePicture || "",
        },
        content: newReplyRaw.content || newReplyRaw.text || "",
        parentId: newReplyRaw.reply_to || newReplyRaw.parentId || comment.id,
        reply_to: newReplyRaw.reply_to,
        createdAt: newReplyRaw.createdAt,
        updatedAt: newReplyRaw.updatedAt,
        profilePicture: newReplyRaw.user?.avatar || newReplyRaw.user?.profilePicture || "",
        post_id: newReplyRaw.post_id,
      };
      setReplies((prev) => [...prev, newReply]);
      setReplyContent("");
      setShowReplyInput(false);
    } catch (err) {
      console.error("Failed to send reply", err);
      alert("Gagal mengirim reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteClick = async () => {
    handleMenuClose();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/comments/${comment.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      if (onDelete) onDelete(comment.id);
    } catch (err) {
      console.error("Gagal menghapus komentar", err);
      alert("Gagal menghapus komentar");
    }
  };

  const handleDeleteReply = (commentId: string) => {
    setReplies((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    try {
      const token = localStorage.getItem("token");
      const now = new Date().toISOString();
      const res = await fetch(`http://localhost:3000/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent, updatedAt: now }),
      });
      if (!res.ok) throw new Error("Failed to edit comment");
      setCurrentContent(editContent);
      setCurrentUpdatedAt(now);
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal mengedit komentar", err);
      alert("Gagal mengedit komentar");
    } finally {
      setSavingEdit(false);
    }
  };

  // Menampilkan timestamp: pakai updatedAt jika ada, jika tidak pakai createdAt
  const renderTimestamp = () => {
    const updated = currentUpdatedAt || comment.updatedAt;
    if (updated && updated !== comment.createdAt) {
      return (
        <Typography variant="caption" sx={{ color: "#b0b0b0" }}>
          {formatDate(updated)} (edited)
        </Typography>
      );
    }
    return (
      <Typography variant="caption" sx={{ color: "#b0b0b0" }}>
        {formatDate(comment.createdAt)}
      </Typography>
    );
  };

  return (
    <Paper
      ref={commentRef}
      elevation={comment.parentId || comment.reply_to ? 0 : 2}
      sx={{
        bgcolor: "#18191c",
        color: "#f1f1f1",
        borderRadius: 3,
        p: 2,
        mb: comment.parentId || comment.reply_to ? 1 : 2,
        ml: comment.parentId || comment.reply_to ? 4 : 0,
        boxShadow: comment.parentId || comment.reply_to ? "none" : "0 2px 8px rgba(0,0,0,0.18)",
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        sx={{ position: "absolute", top: 8, right: 8, color: "#b0b0b0" }}
        onClick={handleMenuOpen}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            setIsEditing(true);
            setEditContent(currentContent);
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "#ff5252" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Stack direction="row" spacing={2}>
        <Avatar
          src={comment.profilePicture || comment.user?.avatar || comment.user?.profilePicture || undefined}
          alt={comment.user?.username || ""}
          sx={{ width: 36, height: 36, bgcolor: "#23272f", mt: 0.5 }}
        />
        <Box flex={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#4fa3ff" }}>
              {comment.user?.username}
            </Typography>
            {renderTimestamp()}
          </Stack>

          {/* Edit Mode */}
          {isEditing ? (
            <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
              <TextField
                size="small"
                variant="outlined"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                sx={{
                  bgcolor: "#23272f",
                  input: { color: "#f1f1f1" },
                }}
                multiline
                minRows={1}
                maxRows={4}
                autoFocus
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editContent.trim()}
                  sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
                >
                  {savingEdit ? <CircularProgress size={18} /> : "Simpan"}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(currentContent);
                  }}
                  sx={{ borderRadius: 2, minWidth: 0, px: 2, color: "#b0b0b0" }}
                >
                  Batal
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 0.5, wordBreak: "break-word" }}>
              {currentContent}
            </Typography>
          )}

          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <Button
              size="small"
              startIcon={<ReplyIcon sx={{ color: "#4fa3ff" }} />}
              onClick={handleReply}
              sx={{
                color: "#4fa3ff",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                px: 1.5,
                minWidth: 0,
                "&:hover": { bgcolor: "#23272f" },
              }}
            >
              Reply
            </Button>

            {!comment.parentId && !comment.reply_to && (
              <Button
                size="small"
                startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={handleShowReplies}
                sx={{
                  color: "#b0b0b0",
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 1.5,
                  minWidth: 0,
                  "&:hover": { bgcolor: "#23272f" },
                }}
              >
                {showReplies ? "Hide Replies" : "Replies"}
              </Button>
            )}
          </Box>

          {showReplyInput && (
            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <TextField
                size="small"
                variant="outlined"
                placeholder={`Reply ke ${comment.user?.username ?? "user"}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                sx={{
                  bgcolor: "#23272f",
                  input: { color: "#f1f1f1" },
                  flex: 1,
                }}
                multiline
                minRows={1}
                maxRows={4}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendReply}
                disabled={sendingReply || !replyContent.trim()}
                sx={{ borderRadius: 2, minWidth: 0, px: 2 }}
              >
                {sendingReply ? <CircularProgress size={18} /> : "Kirim"}
              </Button>
            </Box>
          )}

          {loading && (
            <Box sx={{ mt: 1 }}>
              <CircularProgress size={20} sx={{ color: "#4fa3ff" }} />
            </Box>
          )}

          <Collapse in={showReplies} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1 }}>
              {replies.length === 0 && !loading ? (
                <Typography variant="body2" sx={{ color: "#b0b0b0", fontStyle: "italic", ml: 2 }}>
                  Tidak ada reply untuk komentar ini
                </Typography>
              ) : (
                renderReplies(buildReplyTree(replies, comment.id), handleDeleteReply)
              )}
            </Box>
          </Collapse>
        </Box>
      </Stack>
    </Paper>
  );
};

export default CommentItem;