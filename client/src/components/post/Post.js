import React from "react";
import Avatar from "../avatar/Avatar";
import { CiHeart } from "react-icons/ci";
import "./Post.scss";
import {useNavigate} from 'react-router-dom'
import { useDispatch } from "react-redux";
import { likeAndUnlikePost } from "../../redux/slices/postSlice";
import { FaHeart } from "react-icons/fa";
function Post({post}) {
  const dispatch=useDispatch()
  const navigate=useNavigate()
  const handlePostLiked=(e)=>{
    dispatch(likeAndUnlikePost({
      postId:post._id
    }))
  }
  
  return (
    <div className="Post">
      <div className="heading" onClick={()=>navigate(`/profile/${post.owner._id}`)}>
        <Avatar src={post.owner?.avatar?.url} />
        <h4>{post.owner?.name}</h4>
      </div>
      <div className="content">
        <img src={post.image.url} alt="" />
      </div>
      <div className="footer">
        <p style={{marginBottom:"10px"}}className="caption">{post.caption}</p>
        <div className="like" onClick={handlePostLiked} >
          {!post.isLiked ? <CiHeart className="icon" /> : <FaHeart style={{ color:"#E1306C"}} className="icon" />}
          
          <h4>{`${post.likesCount} likes`}</h4>
        </div>
        <h6 className="time-ago">{post?.timeAgo}</h6>
      </div>
    </div>
  );
}

export default Post;
