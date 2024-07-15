const { success, error } = require("../utils/responseWrapper");
const Post = require('../models/Post');
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;



const createPostController = async (req, res) => {
    try {

        const { caption, postImg } = req.body;
        const owner = req._id;

        if (!caption || !postImg) {
            return res.send(error(400, "Caption and postImg are required"))
        }


        const uploadResult = await cloudinary.uploader.upload(postImg, {
            folder: "postImg",
        });

        const user = await User.findById(req._id);

        const post = await Post.create({
            owner,
            caption,
            image: {
                publicId: uploadResult.public_id,
                url: uploadResult.url
            }
        })

        user.posts.push(post._id);
        await user.save();

        return res.send(success(201, { post }))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const likeAndUnlikePost = async (req, res) => {

    try {
        const { postId } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId).populate('owner');
        if (!post) {
            return res.send(error(404, 'post not found'))
        }

        if (post.likes.includes(curUserId)) {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
        } else {
            post.likes.push(curUserId);
        }
        await post.save();
        return res.send(success(200,{post:mapPostOutput(post,req._id)}))
    } catch (e) {
        return res.send(error(500, e.message));
    }

}

const updataPostController = async (req, res) => {
    try {

        const { postId, caption } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.send(error(404, 'Post Not Found'))
        }


        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, 'only owners can update posts'));
        }


        if (caption) {
            post.caption = caption;
        }
        await post.save();
        return res.send(success(200, { post }));

    } catch (e) {
        console.log(e.message)
        return res.send(error(500, e.message));

    }

}

const deletePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        const curUser = await User.findById(curUserId)
        if (!post) {
            return res.send(error(404, 'Post Not Found'))
        }



        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, 'only owners can delete their posts'));
        }
        const index = curUser.posts.indexOf(postId);
        curUser.posts.splice(index, 1);
        await curUser.save();
        await Post.deleteOne({ _id: postId })
        res.send(success(200, 'post deleted successfully'))
    } catch (e) {
        res.send(error(500, e.message))
    }

}

module.exports = { createPostController, likeAndUnlikePost, updataPostController, deletePost };