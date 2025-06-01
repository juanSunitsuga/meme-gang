import { useEffect, useState } from "react";
import CommentItem, { Comment } from "./CommentItem";
import { Typography } from "@mui/material";
import { fetchEndpoint } from "../FetchEndpoint";

interface CommentListProps {
  postId: string;
}

const FetchComment = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loggedInUserId, setLoggedInUserId] = useState<string>("");

  useEffect(() => {
    const fetchMainComments = async () => {
      try {
        const endpoint = `/post/${postId}/comments`;
        const data = await fetchEndpoint(endpoint, 'GET');

        if (!data) {
          console.error("No comments found for this post");
          return;
        }

        console.log("✅ ID user yang login:", data.idUser); // Tambahkan log ini

        setComments(data.comments);
        setLoggedInUserId(data.idUser);

      } catch (err) {
        console.error("Failed to fetch main comments", err);
      }
    };

    fetchMainComments();
  }, [postId]);

  const handleDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleEdit = async (commentId: string, newContent: string) => {
    try {
      const token = localStorage.getItem("token");
      const now = new Date().toISOString();

      const endpoint = `/comments/${commentId}`;
      const data = await fetchEndpoint(endpoint, 'PUT', token, {
        content: newContent,
        updatedAt: now,
      });

      if (!data) {
        console.error("Failed to update comment");
        return;
      }

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, content: newContent, updatedAt: now }
            : comment
        )
      );
    } catch (err) {
      console.error("Failed to update comment", err);
    }
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
            color: 'white',
            fontStyle: 'italic',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          Tidak ada komentar untuk post ini
        </Typography>
      ) : (
        comments.map(comment => {
          // console.log("💬 Pemilik komentar:", comment.user?.id); // Tambahkan log ini
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onEdit={handleEdit}
              // loggedInUserId={loggedInUserId}
              // userIdOwnerComments={comment.user?.id}
            />
          );
        })
      )}
    </div>
  );
};

export default FetchComment;
