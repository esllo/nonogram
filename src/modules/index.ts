import { combineReducers } from 'redux';
import nonogram from './nonogram';

const rootReducer = combineReducers({
  nonogram,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
