const { prisma } = require('../prisma/prisma-client');
const bcrypt = require('bcryptjs');
const Jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const UserController = {
	// Register user
	register: async (req, res) => {
		const {email, password, name} = req.body;
		if(!email || !password || !name) {
			return res.status(400).json({error: 'Email, password and name are required'});
		}
		try {
			// Check if user with this email exists
			const existingUser = await prisma.user.findUnique(({where: {email}}));
			if(existingUser) {
				return res.status(400).json({error: 'User with this email already exists'});
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Create avatar
			const png = Jdenticon.toPng(`${name}${Date.now()}`, 200);
			const avatarName = `${name}_${Date.now()}.png`;
			const avatarPath = path.join( __dirname, '/../uploads', avatarName);
			fs.writeFileSync(avatarPath, png);

			// Create user with avatar
			const user = await prisma.user.create({
				data: {
					email,
					password: hashedPassword,
					name,
					avatarUrl: `/uploads/${avatarName}`
				}
			});

			res.json(user);

	} catch (error) {
		console.error('Error in register',error);
		res.status(500).json({error: 'Internal server error'});
	}
},

	// Login user
	login: async (req, res) => {
		const {email, password} = req.body;
		if(!email || !password) {
			return res.status(400).json({error: 'Email and password are required'});
		}

		try {
			// Check if user with this email exists
			const user = await prisma.user.findUnique({where: {email}});
			if(!user) {
				return res.status(400).json({error: 'Password or email is incorrect'});
			}

			// Compare passwords
			const isMatch = await bcrypt.compare(password, user.password);
			if(!isMatch) {
				return res.status(400).json({error: 'Password or email is incorrect'});
			}

			// Generate token
			const token = jwt.sign(({userId: user.id}), process.env.SECRET_KEY)

			res.json({token});

		} catch (error) {
			console.error('Error in login', error);
			res.status(500).json({error: 'Internal server error'});
		}
	},

	// Get user by id
	getUserById: async (req, res) => {
		const {id} = req.params;
		const userId = req.user.userId;

		if(id !== userId) {
			return res.status(403).json({error: 'Forbidden'});
		}

		try {
			const user = await prisma.user.findUnique({
				where: {
					id
				},
				include: {
					followers: true,
				 	following: true
				}
			});

			if(!user) {
				return res.status(404).json({error: 'User not found'});
			}

			const isFollowing = await prisma.follows.findFirst({
				where : {
					AND: [
						{followerId: userId},
						{followingId: id}
					]
				}
			});

			res.json({...user, isFollowing: Boolean(isFollowing)});

		} catch (error) {
			console.error('Error in getUserById', error);
			res.status(500).json({error: 'Internal server error'});
		}	
	},

	// Update user
	updateUser: async (req, res) => {
		const {id} = req.params;
		const {email, name, dateOfBirth, bio, location} = req.body;

		let filePath;
		if(req.file && req.file.path) {
			filePath = req.file.path;
		}

		if(id !== req.user.userId) {
			return res.status(403).json({error: 'Forbidden'});
		}

		try {

			if (email){
				const existingUser = await prisma.user.findFirst({where: {email}});
				if(existingUser && existingUser.id !== id) { 
					return res.status(400).json({error: 'User with this email already exists'});
				}
			}

			const user = await prisma.user.update({
				where: {id},
				data: {
					email: email || undefined,
					name: name || undefined,
					avatarUrl: filePath ? `/${filePath}` : undefined,
					dateOfBirth: dateOfBirth || undefined,
					bio: bio || undefined,
					location: location || undefined
				}
			});
			if(!user) {
				return res.status(404).json({error: 'User not found'});
			}


			res.json(user);

		} catch (error) {
			console.error('Error in updateUser', error);
			res.status(500).json({error: 'Internal server error'});
		}
	},

	// Get current user
	current: async (req, res) => {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: req.user.userId
				},
				include: {
					followers:{
						include: {
							follower:true
						} ,
					},
					following: {
						include: {
							following: true
						}
					}
				}
			});

			if(!user) {
				return res.status(404).json({error: 'User not found'});
			}

			res.json(user);

		} catch (error) {
			console.error('Error in current', error);
			res.status(500).json({error: 'Internal server error'});
		}
	},
}

module.exports = UserController;