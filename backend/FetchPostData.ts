import { Votes } from '../models/Votes';
import { Comment } from '../models/Comment';

export const countVotes = async (postId: string): Promise<{ upvotes: number; downvotes: number }> => {
    const upvotes = await Votes.count({
        where: { post_id: postId, is_upvote: true },
    });
    const downvotes = await Votes.count({
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
    const is_upvote = await Votes.findOne({
        where: { post_id: postId, user_id: userId},
    });
    return {
        is_upvote: is_upvote?.is_upvote,
    }
}