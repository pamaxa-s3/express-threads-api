const { update } = require('jdenticon/standalone');
const { prisma } = require('../prisma/prisma-client');

const CommentController = {

	// createComment - створення коментаря
	createComment: async (req, res) => {
		const { postId, content } = req.body;
		const userId = req.user.userId;
		
		if (!postId || !content) {
			return res.status(400).json({ error: 'Invalid data' });
		}

		try {
			const comment = await prisma.comment.create({
				data: {
					postId,
					userId,
					content
				}
			})

			res.status(201).json(comment);

		} catch (error) {
			console.log('Error creating comment', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	},

	// deleteComment - видалення коментаря
	deleteComment: async (req, res) => {
		const { id } = req.params;
		const userId = req.user.userId;

		try {
			const comment = await prisma.comment.findUnique({
				where: {
					id
				}
			});

			if (!comment) {
				return res.status(404).json({ error: 'Comment not found' });
			}

			if (comment.userId !== userId) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			await prisma.comment.delete({
				where: { id }
			});

			res.json(comment);

		} catch (error) {
			console.log('Error deleting comment', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	},

	// updateComment - оновлення коментаря
	updateComment: async (req, res) => {
		const { id } = req.params;
		const { content } = req.body;
		const userId = req.user.userId;

		if (!content) {
			return res.status(400).json({ error: 'Invalid data' });
		}

		try {
			const comment = await prisma.comment.findUnique({
				where: {
					id
				}
			});

			if (!comment) {
				return res.status(404).json({ error: 'Comment not found' });
			}

			if (comment.userId !== userId) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const updatedComment = await prisma.comment.update({
				where: { id },
				data: { content }
			});

			res.json(updatedComment);

		} catch (error) {
			console.log('Error updating comment', error);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		
	}
};

module.exports = CommentController;