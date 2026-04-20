import { configureStore } from '@reduxjs/toolkit';
import universeSlice from './universeSlice';

export const store = configureStore({
	reducer: {
		universeSlice,
	},
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware().concat((store) => (next) => (action) => {
			return next(action);
		});
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
