const express = require('express');
const router = express.Router();
const multer = require('multer');
const authentificateToken = require('../middleware/auth');
const UserController = require('../controllers/user-controller');
const PostController  = require('../controllers/post-controller');
const CommentController = require('../controllers/comment-controller');
const LikeController  = require('../controllers/like-controller');
const FollowController = require('../controllers/follow-controller');

// Показати де знаходяться файли
const storage = multer.diskStorage({
	  destination: 'uploads',
	  filename: function (req, file, cb) {
		    cb(null, file.originalname);
	  }
});

const upload = multer({ storage: storage });


// Роути для користувачів

// register - реєстрація користувача
router.post('/register', UserController.register);

// login - логін користувача
router.post('/login', UserController.login);

// getUserById - отримати користувача по id
router.get('/user/:id', authentificateToken,UserController.getUserById);

// updateUser - оновлення користувача
router.put('/user/:id',authentificateToken, UserController.updateUser);

// getCurrentUser - отримати поточного користувача
router.get('/current', authentificateToken,UserController.current);


// Роут для постів

// createPost - створення поста
router.post('/posts', authentificateToken,PostController.createPost);

// getAllPosts - отримати всі пости
router.get('/posts', authentificateToken,PostController.getAllPosts);

// getPostById - отримати пост по id
router.get('/posts/:id', authentificateToken,PostController.getPostById);

// updatePost - оновлення поста
router.put('/posts/:id', authentificateToken,PostController.updatePost);

// deletePost - видалення поста
router.delete('/posts/:id', authentificateToken,PostController.deletePost);


// Роут для коментарів

// createComment - створення коментаря
router.post('/comments', authentificateToken,CommentController.createComment);

// deleteComment - видалення коментаря
router.delete('/comments/:id', authentificateToken,CommentController.deleteComment);

// updateComment - оновлення коментаря

router.put('/comments/:id', authentificateToken,CommentController.updateComment);


// Роут для лайків

// likePost - лайк поста
router.post('/likes', authentificateToken,LikeController.likePost);

// unlikePost - дизлайк поста
router.delete('/likes/:id', authentificateToken,LikeController.unlikePost);


// Роут для підписок

// followUser - підписатися на користувача
router.post('/follow', authentificateToken, FollowController.followUser);

// unfollowUser - відписатися від користувача
router.delete('/follow/:id', authentificateToken, FollowController.unfollowUser);


module.exports = router;  