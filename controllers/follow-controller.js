const {prisma} = require('../prisma/prisma-client');
const { connect } = require('../routes');

const FollowController = {

	// Підписатися на користувача
	followUser : async (req, res) => {
		const {followingId} = req.body;
		const userId = req.user.userId;

		if(followingId === userId) {
			return res.status(500).error({error: "You can't subscribe to yourself"})
		}

		try {
			const existingSubscription = await prisma.follows.findFirst({
				where: {
					AND: [
						{followerId: userId},
						{followingId}
					]
				}
			})

			if(existingSubscription) {
				return res.status(400).json({error: "Subscription already exists"});
			}

			await prisma.follows.create({
				data: {
					follower:{
						connect: { id: userId }
					},
					following: {
						connect: { id: followingId }
					}
				}
			});

			res.status(201).json({message: "Subscription successfully created"})

		} catch (error) {
			console.error("Follower error", error);
			return res.status(500).json({error: "Internal server error"})
		}
	},

	// Відписатися від користувача
	unfollowUser : async (req, res) => {
		const { followingId } = req.body;
		const userId = req.user.userId;

		try {

			const follows = await prisma.follows.findFirst({
				where: {
					AND: [
						{ followerId: userId },
						{ followingId }
					]
				}
			})

			if(!follows){
				return res.status(404).json({
					error: "You are not subscribed to this user."
				})
			}

			await prisma.follows.delete({
				where: {
					id: follows.id
				}
			})

			res.status(201).json({
				message: "You have unsubscribed"
			})

		} catch (error) {
			console.error("Unfollow error", error)
			return res.status(500).json({
				error: "Internal server error"
			})
		}
	}
}

module.exports = FollowController;