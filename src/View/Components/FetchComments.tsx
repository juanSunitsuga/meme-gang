import { useEffect, useState } from "react";
import CommentItem, { Comment } from "./CommentItem";
import { Typography } from "@mui/material";

interface CommentListProps {
  postId: string;
}

const FetchComment = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  useEffect(() => {
    const fetchMainComments = async () => {
      try {
        const res = await fetch(`http://localhost:3000/post/${postId}/comments`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Comment[] = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Failed to fetch main comments", err);
      }
    };

    fetchMainComments();
  }, [postId]);

  const handleDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleEdit = (commentId: string, currentText: string) => {
    setEditingId(commentId);
    setEditText(currentText);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleEditSave = async (commentId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      if (!res.ok) throw new Error("Failed to update comment");
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, text: editText } : comment
        )
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div>
      {comments.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{
            mt: 4,
            p: 2,
            borderRadius: 2,
            backgroundColor: '#f0f2f5',
            color: '#555',
            fontStyle: 'italic',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          Tidak ada komentar untuk post ini 😢
        </Typography>
      )   : (
        comments.map(comment =>
          editingId === comment.id ? (
            <div key={comment.id} style={{ marginBottom: 8 }}>
              <input
                value={editText}
                onChange={handleEditChange}
                style={{ marginRight: 8 }}
              />
              <button onClick={() => handleEditSave(comment.id)}>Save</button>
              <button onClick={handleEditCancel} style={{ marginLeft: 4 }}>
                Cancel
              </button>
            </div>
          ) : (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onEdit={() => handleEdit(comment.id, comment.content)}
            />
          )
        )
      )}
    </div>
  );
};

export default FetchComment;
