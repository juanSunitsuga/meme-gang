import { UpvoteDownvote } from '../models/Upvote_Downvote_Post';
import { Comment } from '../models/Comment';

export const countVotes = async (postId: string): Promise<{ upvotes: number; downvotes: number }> => {
    const upvotes = await UpvoteDownvote.count({
        where: { post_id: postId, is_upvote: true },
    });
    const downvotes = await UpvoteDownvote.count({
        where: { post_id: postId, is_upvote: false },
    });
    return { upvotes, downvotes };
}

export const countComments = async (postId: string): Promise<number> => {
    const comments = await Comment.count({
        where: { post_id: postId },
    });
    return comments;
}

export const fetchVotesState = async (postId: string, userId: string) => {
    const is_upvote = await UpvoteDownvote.findOne({
        where: { post_id: postId, user_id: userId},
    });
    return {
        is_upvote: is_upvote?.is_upvote,
    }
}