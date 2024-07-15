import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";
// import store from "../store";
export const getUserProfile = createAsyncThunk(
    "user/getUserProfile",
    async (body) => {
        try {
            const res = await axiosClient.post("/user/getUserProfile",body);
            return res.result;
        } catch (error) {
            return Promise.reject(error);
        } 
    }
);

export const likeAndUnlikePost = createAsyncThunk(
    "post/likeAndUnlike",
    async (body) => {
        try {
            const res = await axiosClient.post("/posts/like", body);
            // console.log(res);
            return res.result.post;
        } catch (error) {
            return Promise.reject(error);
        }
    }
);

const postSlice = createSlice({
    name: "postSlice",
    initialState: {
        userProfile: {},
    },
    extraReducers: (builder) => {
        builder.addCase(getUserProfile.fulfilled, (state, action) => {
            state.userProfile = action.payload;
        }).addCase(likeAndUnlikePost.fulfilled, (state, action) => {
            const post=action.payload;
            const index=state?.userProfile?.posts?.findIndex(item=>item._id===post._id)
            // const index1=store.getState().feedReducer.feedData?.posts?.findIndex(item=>item._id===post._id)
            if(index!==undefined && index!==-1){
                state.userProfile.posts[index]=post;
            }
            // if (index1 !== undefined && index1 !== -1) {
            //   store.getState().feedReducer.feedData.posts[index1] = post;
            // }

        });
    }
});

export default postSlice.reducer;
