// Redux store configuration

import { createStore } from 'redux';
import { gameReducer } from './reducer';

export const store = createStore(gameReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
