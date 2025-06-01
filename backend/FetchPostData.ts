import { Votes } from '../models/Votes';
import { Comment } from '../models/Comment';
import { PostTag } from '../models/PostTags';
import { Tag } from '../models/Tag';
import { User } from '../models/User';
import sequelize, { Op } from 'sequelize';

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

export async function buildPostWithAllData(posts: any[], userId: string) {
    const postIds = posts.map(post => post.id);

    const votes = await Votes.findAll({
        where: { post_id: { [Op.in]: postIds } },
        attributes: [
            'post_id',
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_upvote THEN 1 ELSE 0 END')), 'upvotes'],
            [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_upvote THEN 0 ELSE 1 END')), 'downvotes'],
        ],
        group: ['post_id'],
        raw: true,
    }) as unknown as Array<{ post_id: string; upvotes: number; downvotes: number }>;

    const comments = await Comment.findAll({
        where: { post_id: { [Op.in]: postIds } },
        attributes: [
            'post_id',
            [sequelize.fn('COUNT', sequelize.col('id')), 'commentCount'],
        ],
        group: ['post_id'],
        raw: true,
    }) as unknown as Array<{ post_id: string; commentCount: string }>;

    const voteMap: { [key: string]: { upvotes: number; downvotes: number } } = {};
    for (const vote of votes) {
        voteMap[vote.post_id] = {
            upvotes: Number(vote.upvotes),
            downvotes: Number(vote.downvotes),
        };
    }

    const commentMap: { [key: string]: number } = {};
    for (const c of comments) {
        commentMap[c.post_id] = Number(c.commentCount);
    }

    const postTags = await PostTag.findAll({
        where: { post_id: { [Op.in]: postIds } },
        raw: true,
    });

    const postIdToTagIds: { [key: string]: string[] } = {};
    postTags.forEach(pt => {
        if (!postIdToTagIds[pt.post_id]) postIdToTagIds[pt.post_id] = [];
        postIdToTagIds[pt.post_id].push(pt.tag_id);
    });

    const allTagIds = Array.from(new Set(postTags.map(pt => pt.tag_id)));
    const tags = await Tag.findAll({
        where: { id: { [Op.in]: allTagIds } },
        raw: true,
    });

    const tagIdToName: { [key: string]: string } = {};
    tags.forEach(tag => {
        tagIdToName[tag.id] = tag.tag_name;
    });

    let userVotesMap: { [key: string]: boolean | null } = {};
    if (userId) {
        const userVotes = await Votes.findAll({
            where: {
                post_id: { [Op.in]: postIds },
                user_id: userId,
            },
            attributes: ['post_id', 'is_upvote'],
            raw: true,
        });
        userVotesMap = userVotes.reduce((acc, vote) => {
            acc[vote.post_id] = vote.is_upvote; // true or false
            return acc;
        }, {} as { [key: string]: boolean });
    }

    const userIds = Array.from(new Set(posts.map(post => post.user_id)));
    const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'username', 'profilePicture'],
        raw: true,
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    return posts.map(post => {
        const votes = voteMap[post.id] || { upvotes: 0, downvotes: 0 };
        const commentCount = commentMap[post.id] || 0;
        const tagIds = postIdToTagIds[post.id] || [];
        const tagNames = tagIds.map(tagId => tagIdToName[tagId]).filter(Boolean);
        const is_upvoted = userId ? (userVotesMap[post.id] ?? null) : null;
        const user = userMap[post.user_id];

        return {
            ...post.toJSON(),
            upvotes: votes.upvotes,
            downvotes: votes.downvotes,
            commentsCount: commentCount,
            tags: tagNames,
            is_upvoted: is_upvoted,
            name: user.username,
            profilePicture: user?.profilePicture,
        };
    });
}