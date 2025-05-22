import { useState } from "react";

export type Comment = {
  id: string;
  username?: string;
  content: string;
  parentId?: string | null;  
  createdAt: string;
  profilePicture?: string;
};

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShowReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/comments/${comment.id}/reply`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Comment[] = await res.json();
      setReplies(data);
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to fetch replies", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: comment.parentId ? "20px" : "0px", marginTop: "10px" }}>
      <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <p><strong>{comment.username || "Anonymous"}</strong></p>
        <p>{comment.content}</p>

        <button onClick={handleShowReplies}>
          {showReplies ? "Hide Replies" : "Show Replies"}
        </button>
      </div>

      {loading && <p>Loading replies...</p>}

      {showReplies && replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} />
      ))}
    </div>
  );
};

export default CommentItem;
