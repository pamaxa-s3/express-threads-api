const {prisma} = require('../prisma/prisma-client');

const LikeController = {

	// likePost - лайк поста
	likePost: async (req, res) => {
		const {postId} = req.body;
		const userId = req.user.userId;

		if (!postId) {
			return res.status(400).json({error: 'Invalid data'});
		}

		try {
			const existingLike = await prisma.like.findFirst({
				where: {
					postId,
					userId
				}
			});

			if (existingLike) {
				return res.status(400).json({error: 'Like already exists'});
			}

			const like = await prisma.like.create({
				data: {
					postId,
					userId
				}
			});

			res.status(201).json(like);

		} catch (error) {
			console.log('Error creating like', error);
			return res.status(500).json({error: 'Internal Server Error'});
		}
	},

	// unlikePost - дизлайк поста
	unlikePost: async (req, res) => {
		
		const {id} = req.params;
		const userId = req.user.userId;

		if (!id) {
			return res.status(400).json({error: 'Invalid data'});
		}

		try{

			const existingLike = await prisma.like.findFirst({
				where: {
					postId: id,
					userId
				}
			});

			if (!existingLike) {
				return res.status(404).json({error: 'Like not found'});
			}

			if (existingLike.userId !== userId) {
				return res.status(403).json({error: 'Forbidden'});
			}

			const like = await prisma.like.deleteMany({
				where: {
					postId: id,
					userId
				}
			});

			res.json(like)

		} catch (error) {
			console.log('Error deleting like', error);
			return res.status(500).json({error: 'Internal Server Error'});
		}
	}
};

module.exports = LikeController;