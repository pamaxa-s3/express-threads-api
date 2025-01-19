const { prisma } = require('../prisma/prisma-client');

const PostController = {
	// Створення поста
	createPost: async (req, res) => {
		const {content} = req.body;

		const authorId = req.user.userId;

		if(!content) {
			return res.status(400).send('Content is required');
		}

		try {
			const post = await prisma.post.create({
				data: {
					content,
					authorId
				}
			});

			res.json(post);
		}
		catch(err) {
			console.error('Create Post Error:', err);
			res.status(500).json({err : 'Internal Server Error'});
		}
	},

	// Отримати всі пости
	getAllPosts: async (req, res) => {
		
		const userId = req.user.userId;

		try {
			const posts = await prisma.post.findMany({
				include: {
					likes:true,
					author: true,
					comments: true
				},
				orderBy: {
					createdAt: 'desc'
				}
			})

			const postsWithLikes = posts.map(post => ({
					...post,
					likedByUser: post.likes.some(like => like.userId === userId)
				}));

			res.json(postsWithLikes);

			} catch(err) {
			console.error('Get All Posts Error:', err);
			res.status(500).json({err : 'Internal Server Error'});
		}
	},


	// Отримат пост по id
	getPostById: async (req, res) => {
		const {id} = req.params;
		const userId = req.user.userId;

		try {
			const post = await prisma.post.findUnique({
				where: {id},
				include: {
					comments:{
						include: {
							user: true
							}
						},
						likes: true,
						author: true
					}
			})

			if(!post) {
				return res.status(404).json({err: 'Post not found'});
			}

			const postWithLikes = {
				...post,
				likedByUser: post.likes.some(like => like.userId === userId)
			};

			res.json(postWithLikes);

		} catch(err) {
			console.error('Get Post By Id Error:', err);
			res.status(500).json({err : 'Internal Server Error'});
		}
	},

	// Оновлення поста
	updatePost: async (req, res) => {
		const {id} = req.params;
		const userId = req.user.userId;
		const {content} = req.body;

		if(!content) {
			return res.status(400).send('Content is required');
		}

		const post = await prisma.post.findUnique({
			where: {id}
		});

		if(!post) {
			return res.status(404).json({err: 'Post not found'});
		}

		if(post.authorId !== userId) {
			return res.status(403).json({err: 'Forbidden'});
		}

		try {
			const updatedPost = await prisma.post.update({
				where: {id},
				data: {content}
			});

			res.json(updatedPost);

		} catch(err) {
			console.error('Update Post Error:', err);
			res.status(500).json({err : 'Internal Server'})
		}
	},

	// Видалення поста
	deletePost: async (req, res) => {
		const {id} = req.params;

		const post = await prisma.post.findUnique({
			where: {id}
		});

		if(!post) {
			return res.status(404).json({err: 'Post not found'});
		}

		if(post.authorId !== req.user.userId) {
			return res.status(403).json({err: 'Forbidden'});
		}

		try {
		 	const transaction = await prisma.$transaction([
				prisma.comment.deleteMany({where: {postId: id}}),
				prisma.like.deleteMany({where: {postId: id}}),
				prisma.post.delete({where: {id}})
			])

			res.json(transaction)

		} catch(err) {
			console.error('Delete Post Error:', err);
			res.status(500).json({err : 'Internal Server Error'});
		}
	}
};

module.exports = PostController;