const Post = require("../models/Post");
const User = require("../models/User");
const { trace } = require("../routers/postRouter");
const cloudinary = require("cloudinary").v2;

const { error, success } = require("../utils/responseWrapper");
const { mapPostOutput } = require("../utils/Utils");

const followOrUnfollowUserController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        const userTOFollow = await User.findById(userIdToFollow);
        if (!userTOFollow) {
            return res.send(error(404, "user to follow not found"));
        }

        if (userIdToFollow === curUserId) {
            res.send(error(409, "you can not follow yourself"));
        }
        if (curUser.followings.includes(userIdToFollow)) {
            const followingindex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingindex, 1);
            const followerIndex = userTOFollow.followers.indexOf(curUser);

            userTOFollow.followers.splice(followerIndex, 1);
        }
        else {
            userTOFollow.followers.push(curUserId);
            curUser.followings.push(userIdToFollow);
        }
        await userTOFollow.save();
        await curUser.save();
        return res.send(success(200, { user: userTOFollow }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const getPostsOfFollwings = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId).populate('followings');

        const Allposts = await Post.find({
            owner: {
                $in: curUser.followings,
            },
        }).populate('owner');
        const posts = Allposts.map(item => mapPostOutput(item, req._id)).reverse();
        const followingIds = curUser.followings.map(item => item._id)
        const suggestions = await User.find({
            $and: [{
                _id: {
                    $nin: followingIds,
                }
            }, {
                _id: {
                    $ne: req._id
                }
            }]
        });
        return res.send(success(200, { ...curUser._doc, suggestions, posts }));
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};

const getMyposts = async (req, res) => {
    try {
        const { curUserId } = req.body;

        const ownr = req._id;
        if (!curUserId) {
            return res.send(error(500, "user required"));
        }
        if (curUserId !== ownr) {
            return res.send(error(500, "only owner of the post can access"));
        }
        const allUserPosts = await Post.find({ owner: curUserId }).populate(
            "likes"
        );
        return res.send(success(200, { allUserPosts }));
        //     const {userId}=req.body;
        // const owner=req._id;
        // if(!userId)
        // {
        //   return  res.send(error(500,'user required'));
        // }
        // if(userId!==owner)
        // {
        //     return res.send(error(500,"only owner of the post can access"))
        // }
        // const user=await User.findById(userId);
        // if(!user)
        // {
        //     return res.send(error(404,'user not found'));
        // }
        // userPosts= await Post.find({"_id" :{
        //     '$in':user.posts
        // }})
        // return res.send(success(200,userPosts));
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};

const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.send(error(400, "UserId is required"));
        }
        const allUserPosts = await Post.find({
            owner: userId,
        }).populate("likes");
        return res.send(success(200, { allUserPosts }));
    } catch (e) {
        console.log(e.message);
        return res.send(error(500, e.message));
    }
};

const deleteMyprofile = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        // delete all posts
        await Post.deleteMany({
            owner: curUserId,
        });
        //removed self from followers's followings
        curUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(curUserId);
            follower.followings.splice(index, 1);
            await follower.save();
        });

        //remove myself from my follwings' followers
        curUser.followings.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = follower.followings.indexOf(curUserId);
            following.followers.splice(index, 1);
            await following.save();
        });

        //removing myself from all likes
        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        });

        await User.deleteOne({ _id: curUserId });

        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
        });
        return res.send(success(200, "user deleted"));
    } catch (e) {
        console.log(e.message);
        res.send(error(500, e.message));
    }
};

const getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req._id);
        if (!user) return res.send(error(404, "User not found"));
        return res.send(success(200, { user }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};
const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;
        const user = await User.findById(req._id);
        if (name) {
            user.name = name;
        }
        if (bio) {
            user.bio = bio;
        }
        if (userImg) {
            const uploadResult = await cloudinary.uploader.upload(userImg, {
                folder: "profileImg",
            });
            user.avatar = {
                url: uploadResult.url,
                publicId: uploadResult.public_id
            }
        }
        await user.save()
        return res.send(success(200, { user }))

    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        });

        const posts = user.posts.map(item => mapPostOutput(item, req._id)).reverse();
        return res.send(success(200, { ...user._doc, posts }))


    } catch (e) {
        return res.send(error(500, e.message));

    }
}

module.exports = {
    followOrUnfollowUserController,
    getPostsOfFollwings,
    getMyposts,
    getUserPosts,
    deleteMyprofile,
    getMyInfo,
    updateUserProfile,
    getUserProfile,
};
