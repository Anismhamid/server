const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

const express = require('express');

const router = express.Router();
const Posts = require('../models/post');
const auth = require('../middlewares/auth');
const { getPostSchema } = require('../schema/postsSchema');
const { requirePermission } = require('../middlewares/userPermissions');
const { invalidateSitemapCache } = require('../routes/sitemap');

//==============All-posts==========
// Get all posts for search in home page
router.get('/', async (req, res) => {
    try {
        const posts = await Posts.find()
            .populate({
                path: 'seller',
                select: 'name image slug _id',
            })
            .populate({
                path: 'reviews.user',
                select: 'name image slug _id',
            });

        return res.status(200).json(posts.reverse());
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.get('/related-posts/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { excludeId, limit = 4 } = req.query;

        const categoryFormatted =
            category.charAt(0).toUpperCase() + category.slice(1);

        let currentPost = null;

        if (excludeId) {
            currentPost = await Posts.findById(excludeId);
        }

        const matchStage = {
            category: categoryFormatted,
        };

        if (excludeId) {
            matchStage._id = {
                $ne: new mongoose.Types.ObjectId(excludeId),
            };
        }

        const pipeline = [
            { $match: matchStage },

            // 🧠 add score
            {
                $addFields: {
                    score: {
                        $add: [
                            // brand match
                            currentPost
                                ? {
                                      $cond: [
                                          {
                                              $eq: [
                                                  '$brand',
                                                  currentPost.brand,
                                              ],
                                          },
                                          5,
                                          0,
                                      ],
                                  }
                                : 0,

                            // type match
                            currentPost
                                ? {
                                      $cond: [
                                          {
                                              $eq: ['$type', currentPost.type],
                                          },
                                          3,
                                          0,
                                      ],
                                  }
                                : 0,

                            // subcategory match
                            currentPost
                                ? {
                                      $cond: [
                                          {
                                              $eq: [
                                                  '$subcategory',
                                                  currentPost.subcategory,
                                              ],
                                          },
                                          2,
                                          0,
                                      ],
                                  }
                                : 0,

                            // price similarity
                            currentPost
                                ? {
                                      $cond: [
                                          {
                                              $and: [
                                                  {
                                                      $gte: [
                                                          '$price',
                                                          currentPost.price *
                                                              0.7,
                                                      ],
                                                  },
                                                  {
                                                      $lte: [
                                                          '$price',
                                                          currentPost.price *
                                                              1.3,
                                                      ],
                                                  },
                                              ],
                                          },
                                          2,
                                          0,
                                      ],
                                  }
                                : 0,

                            // 🎲 randomness
                            { $rand: {} },
                        ],
                    },
                },
            },

            { $sort: { score: -1 } },

            { $limit: Number(limit) },
        ];

        const posts = await Posts.aggregate(pipeline);

        res.status(200).send(posts);
    } catch (error) {
        console.error('Aggregation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Post new post
router.post(
    '/',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    async (req, res) => {
        try {
            const { category, type, ...postData } = req.body;

            // get category and subcategory schema
            const schema = getPostSchema(category, type);

            // Add type and category to the data
            const dataToValidate = {
                ...postData,
                category,
                type,
            };

            console.log('Data to validate:', dataToValidate);
            console.log('Payload:', req.payload);

            // validate schema
            const { error } = await schema.validate(dataToValidate);

            // if error return the error
            if (error) {
                console.error('Validation error:', error.details[0]);
                return res.status(400).send(error.details[0].message);
            }

            // Create a new post using the data from the request body
            const post = new Posts({
                ...dataToValidate,
                seller: req.payload._id,
            });

            // Save the new post to the database
            await post.save();
            invalidateSitemapCache();

            const io = req.app.get('io');
            io.emit('post:new', post);

            // Send the created post back in the response
            res.status(201).send(post);
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).send(error.message);
        }
    },
);

// Get spicific post by id
router.get('/spicific/:postId', async (req, res) => {
    try {
        const post = await Posts.findById(req.params.postId)
            .populate({
                path: 'seller',
                select: 'name image slug _id',
            })
            .populate({
                path: 'reviews.user',
                select: 'name image slug _id',
            });

        if (!post) {
            return res.status(404).send('post not found');
        }

        res.status(200).send(post);
    } catch (error) {
        console.error('Get specific post error:', error);
        res.status(500).send(error.message);
    }
});

// Update post
router.put(
    '/:postId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    async (req, res) => {
        try {
            const post = await Posts.findById(req.params.postId);
            if (!post) return res.status(404).send('Post not found');

            const isOwner =
                req.payload._id.toString() === post.seller._id.toString();
            const isAdminOrMod =
                req.payload.role === 'Admin' ||
                req.payload.role === 'Moderator';

            if (!isOwner && !isAdminOrMod) {
                return res.status(403).send('Access denied');
            }

            const schema = getPostSchema(post.category, post.type);

            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
                allowUnknown: false,
                presence: 'optional',
            });

            if (error) {
                console.error('❌ Joi validation error:', error.details);

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.details.map((detail) => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                    })),
                });
            }

            const updatedPost = await Posts.findByIdAndUpdate(
                req.params.postId,
                { $set: value },
                { returnDocument: 'after', runValidators: true },
            );

            invalidateSitemapCache();

            res.status(200).send(updatedPost);
        } catch (error) {
            console.error('❌ Update post error:', error);
            console.error('Post ID:', req.params.postId);
            console.error('Body:', req.body);

            return res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    },
);

// Delete post
router.delete(
    '/:postId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    async (req, res) => {
        const { postId } = req.params;

        try {
            // Validate postId format
            if (!postId || postId === 'undefined' || postId === 'null') {
                return res.status(400).send('Invalid post ID');
            }

            const post = await Posts.findById(postId);
            if (!post) return res.status(404).send('This post is not found');

            // Safe access to seller.slug
            const isOwner =
                req.payload._id.toString() === post.seller.toString();

            const canDelete =
                req.payload.role === 'Admin' ||
                req.payload.role === 'Moderator' ||
                isOwner;

            if (!canDelete) {
                return res
                    .status(403)
                    .send(
                        "Access denied. You don't have permission to delete this post",
                    );
            }

            // Safe access to image.publicId
            if (post.image && post.image.publicId) {
                try {
                    await cloudinary.uploader.destroy(post.image.publicId);
                    console.log(`Deleted image: ${post.image.publicId}`);
                } catch (cloudinaryError) {
                    console.error(
                        'Cloudinary deletion failed:',
                        cloudinaryError,
                    );
                }
            }

            // Delete the post
            await post.deleteOne();

            invalidateSitemapCache();
            return res
                .status(200)
                .send('The post has been deleted successfully');
        } catch (error) {
            console.error('Delete Route Error:', error);
            // Send actual error for debugging (but hide in postion)
            return res.status(500).json({
                error: error.message,
                stack:
                    process.env.NODE_ENV === 'development'
                        ? error.stack
                        : undefined,
            });
        }
    },
);
//______________End-All-posts__________

router.get('/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const post = await Posts.find({
            category: category.charAt(0).toUpperCase() + category.slice(1),
        });

        if (!post.length) return res.status(404).send(`${category} not found`);

        res.status(200).send(post);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// ----- Like / Unlike a post -----
// PATCH /api/posts/:postId/like
router.patch(
    '/:postId/like',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.payload._id.toString();

            const post = await Posts.findById(postId);
            if (!post)
                return res.status(404).send({ message: 'Post not found' });

            const alreadyLiked = post.likes.includes(userId);

            if (alreadyLiked) {
                post.likes.pull(userId); // ✅ Mongoose method بدل filter
            } else {
                post.likes.push(userId);
            }

            await post.save();

            res.status(200).send({
                postId: post._id,
                liked: !alreadyLiked,
                totalLikes: post.likes.length,
            });
        } catch (error) {
            console.error('Like error:', error);
            res.status(500).send({ message: 'Internal server error' });
        }
    },
);

// PATCH the reviews for a specific post
router.patch(
    '/:postId/reviews',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    async (req, res) => {
        try {
            const { postId } = req.params;
            const { comment, rating } = req.body;
            const { _id } = req.payload;

            if (!comment || comment.trim().length === 0) {
                return res.status(400).send({
                    message: 'Comment is required',
                });
            }

            const numericRating = Number(rating);

            if (
                rating !== undefined &&
                (numericRating < 1 || numericRating > 5)
            ) {
                return res.status(400).send({
                    message: 'Rating must be between 1 and 5',
                });
            }

            const post = await Posts.findById(postId);

            if (!post) {
                return res.status(404).send({
                    message: 'Post not found',
                });
            }

            const newReview = {
                user: _id,
                comment: comment.trim(),
                rating: rating !== undefined ? numericRating : null,
                createdAt: new Date(),
            };

            post.reviews.push(newReview);

            await post.save();

            return res.status(201).send({
                message: 'Review added successfully',
                review: newReview,
            });
        } catch (error) {
            console.error('Review error:', error);

            return res.status(500).send({
                message: error.message,
            });
        }
    },
);

// Delete a specific review from a post
router.delete(
    '/:postId/reviews/:reviewId',
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    auth,
    async (req, res) => {
        try {
            const { postId, reviewId } = req.params;
            const userId = req.payload._id;

            const post = await Posts.findById(postId);

            if (!post) {
                return res.status(404).send({
                    message: 'Post not found',
                });
            }

            const review = post.reviews.id(reviewId);

            if (!review) {
                return res.status(404).send({
                    message: 'Review not found',
                });
            }

            // review.user is ObjectId
            if (String(review.user) !== String(userId)) {
                return res.status(403).send({
                    message: 'You cannot delete this review',
                });
            }

            review.deleteOne();

            await post.save();

            return res.send({
                message: 'Review deleted successfully',
            });
        } catch (error) {
            console.error('Delete review error:', error);

            return res.status(500).send({
                message: error.message,
            });
        }
    },
);

// Update a specific review for a post
router.patch(
    '/:postId/reviews/:reviewId',
    auth,
    requirePermission('canUseAccount'),
    requirePermission('canCreatePosts'),
    async (req, res) => {
        try {
            const { postId, reviewId } = req.params;
            const { comment, rating } = req.body;
            const userId = req.payload._id;

            const post = await Posts.findById(postId);

            if (!post) {
                return res.status(404).send({
                    message: 'Post not found',
                });
            }

            const review = post.reviews.id(reviewId);

            if (!review) {
                return res.status(404).send({
                    message: 'Review not found',
                });
            }

            // review.user is ObjectId
            if (String(review.user) !== String(userId)) {
                return res.status(403).send({
                    message: 'You cannot edit this review',
                });
            }

            if (comment !== undefined) {
                if (!comment.trim()) {
                    return res.status(400).send({
                        message: 'Comment is required',
                    });
                }

                review.comment = comment.trim();
            }

            if (rating !== undefined) {
                const numericRating = Number(rating);

                if (
                    !Number.isFinite(numericRating) ||
                    numericRating < 1 ||
                    numericRating > 5
                ) {
                    return res.status(400).send({
                        message: 'Rating must be between 1 and 5',
                    });
                }

                review.rating = numericRating;
            }

            review.updatedAt = new Date();

            await post.save();

            return res.send({
                message: 'Review updated successfully',
                review,
            });
        } catch (error) {
            console.error('Update review error:', error);

            return res.status(500).send({
                message: error.message,
            });
        }
    },
);

router.patch('/:postId/increment-views', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Posts.findByIdAndUpdate(
            postId,
            { $inc: { views: 1 } },
            {
                new: true,
                runValidators: false,
            },
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        return res.status(200).json({
            success: true,
            views: post.views,
        });
    } catch (error) {
        console.error('Increment views error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to increment post views',
            error: error.message,
        });
    }
});

module.exports = router;
