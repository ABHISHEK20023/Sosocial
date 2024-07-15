import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";

export const getMyInfo = createAsyncThunk(
    "user/getMyInfo",
    async () => {
        try {
            const res = await axiosClient.get("/user/getMyInfo");
            return res.result;
        } catch (error) {
            return Promise.reject(error);
        }
    }
);

export const updateMyProfile = createAsyncThunk(
    "user/updateMyProfile",
    async (body) => {
        try {
            const res = await axiosClient.put("/user/", body);
            return res.result;
        } catch (error) {
            return Promise.reject(error);
        }
    }
);

const appConfigSlice = createSlice({
    name: "appConfigSlice",
    initialState: {
        isLoading: false,
        toastData:{},
        myProfile: null,
    },
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }, showToast: (state, action) => {
            state.toastData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateMyProfile.fulfilled, (state, action) => {
                state.myProfile = action.payload.user;
            })
            .addCase(getMyInfo.fulfilled, (state, action) => {
                state.myProfile = action.payload?.user;
            });
        // ,
        //     builder.addCase(getMyInfo.pending, (state, action) => {

        //     })
    },
});

export default appConfigSlice.reducer;

export const { setLoading, showToast } = appConfigSlice.actions;
