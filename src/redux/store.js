// Redux store configuration
import { createStore } from 'redux';
import { gameReducer } from './reducer';
export const store = createStore(gameReducer);
