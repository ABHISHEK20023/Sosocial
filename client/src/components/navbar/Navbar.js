import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Navbar.scss'
import Avatar from '../avatar/Avatar'
import { IoIosLogOut } from "react-icons/io";
import {  useSelector } from 'react-redux';
import { axiosClient } from '../../utils/axiosClient';
import { KEY_ACCESS_TOKEN, removeItem } from '../../utils/localStorageManager';
function Navbar() {

  const navigate = useNavigate();
  const myProfile=useSelector(state=>state.appConfigReducer.myProfile)
  const handleLogoutClicked=async ()=>{
    try {
      await axiosClient.post('/auth/logout')
      removeItem(KEY_ACCESS_TOKEN)
      navigate('/login')
    } catch (error) {
      
    }
  }
  return (
    <div className='Navbar'>
      <div className='container'>
        <h2 className='banner hover-link' onClick={() => { navigate('/') }}>So social</h2>
        <div className="right-side">
          <div className="profile hover-link" onClick={() => navigate(`/profile/${myProfile?._id}`)}><Avatar src={myProfile?.avatar?.url}/></div>
          <div className="logout hover-link" onClick={handleLogoutClicked}><IoIosLogOut/></div>
        </div>
      </div>
    </div>
  )
}

export default Navbar