import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CommentsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (!res.ok) throw new Error('Failed to fetch comments');
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();

      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleViewReplies = (commentId) => {
    navigate(`/posts/${postId}/comments/${commentId}/replies`);
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h2>Comments</h2>

      <form onSubmit={handleSubmitComment} style={{ marginBottom: '1.5rem' }}>
        <textarea
          style={{
            width: '100%',
            height: '100px',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            resize: 'vertical',
          }}
          placeholder="Write your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Post Comment
        </button>
      </form>

      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {comments.map((comment) => (
            <li
              key={comment.id}
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>
                {comment.User.username}
                <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p>{comment.content}</p>
              <button
                onClick={() => handleViewReplies(comment.id)}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.9rem',
                }}
              >
                🔁 View Replies
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentsPage;
