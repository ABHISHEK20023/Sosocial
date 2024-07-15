const mongoose = require('mongoose');

const userschema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false //this will hide then password when we will find any document in the db
    },
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    avatar: {
        publicId: String,
        url: String
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
},
{
    timespamps:true
})

module.exports = mongoose.model('user', userschema);