import { useEffect, useState } from "react";
import CommentItem, { Comment } from "./CommentItem";

interface CommentListProps {
  postId: string;
}

const FetchComment = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);

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

  // Fungsi untuk menghapus komentar dari state setelah berhasil dihapus di backend
  const handleDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  return (
    <div>
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={handleDelete} // <-- ini penting supaya UI langsung update
        />
      ))}
    </div>
  );
};

export default FetchComment;
