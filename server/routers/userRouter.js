const UserController = require('../controllers/userController');
const requireUser = require('../middlewares/requireUser');
const router=require('express').Router();

router.post('/follow',requireUser,UserController.followOrUnfollowUserController)
router.get('/getFeedData',requireUser,UserController.getPostsOfFollwings)
router.get('/getMyposts',requireUser,UserController.getMyposts)
router.get('/getUserposts',requireUser,UserController.getUserPosts)
router.delete('/',requireUser,UserController.deleteMyprofile)
router.get('/getMyInfo',requireUser,UserController.getMyInfo)
router.put('/',requireUser,UserController.updateUserProfile)
router.post('/getUserProfile',requireUser,UserController.getUserProfile)
module.exports=router;