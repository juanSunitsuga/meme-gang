import { Votes } from '../models/Votes';
import { Comment } from '../models/Comment';
import { PostTag } from '../models/PostTags';
import { Tag } from '../models/Tag';
import { User } from '../models/User';
import { Op } from 'sequelize';

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
    };
}

export const fetchTagName = async (postId: string) => {
    const postTags = await PostTag.findAll({
        where: { post_id: postId },
        raw: true,
    });
    const allTagIds = Array.from(new Set(postTags.map(pt => pt.tag_id)));
    if (allTagIds.length === 0) return [];
    const tags = await Tag.findAll({
        where: { id: { [Op.in]: allTagIds } },
        attributes: ['tag_name'],
        raw: true,
    });
    return tags.map(tag => tag.tag_name);
}

export const fetchUserData = async (userId: string) => {
    const user = await User.findByPk(userId);
    return user;
}