import { createSlice, configureStore } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        id: null,
        email: null,
        name: null,
        publicKey: null,
        privateKey: null
    },
    reducers: {
        setUser(state, action) {
            const user = action.payload;
            state.id = user.id;
            state.email = user.email;
            state.name = user.name;
            state.publicKey = user.publicKey;
            state.privateKey = user.privateKey;
        }
    }
});

export const { setUser } = userSlice.actions;

const store = configureStore({
    reducer: {
        user: userSlice.reducer
    }
});

export default store;
