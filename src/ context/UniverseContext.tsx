import {
	Dispatch,
	Reducer,
	ReducerAction,
	ReducerState,
	createContext,
	useContext,
	useReducer,
} from 'react';
import { Universe } from './Universe';
import CardActions, {
	ACTION_CREATE_CARD,
	ACTION_DESTROY_CARD,
	createCardReducer,
	destroyCardReducer,
} from './actions/CardActions';
import DeckActions, {
	ACTION_CREATE_DECK,
	ACTION_MOVE_CARD,
	ACTION_REVEAL_CARD,
	ACTION_SHUFFLE_DECK,
	createDeckReducer,
	moveCardReducer,
	revealCardReducer,
	shuffleDeckReducer,
} from './actions/DeckActions';
import UniverseActions, {
	ACTION_LOAD,
	ACTION_RESET,
	loadReducer,
	resetReducer,
} from './actions/UniverseActions';

const universeReducer: Reducer<
	Universe,
	CardActions | DeckActions | UniverseActions
> = (state, action) => {
	switch (action.type) {
		case ACTION_RESET:
			return resetReducer(state, action);
		case ACTION_LOAD:
			return loadReducer(state, action);

		case ACTION_CREATE_DECK:
			return createDeckReducer(state, action);

		case ACTION_CREATE_CARD:
			return createCardReducer(state, action);
		case ACTION_DESTROY_CARD:
			return destroyCardReducer(state, action);

		case ACTION_MOVE_CARD:
			return moveCardReducer(state, action);
		case ACTION_SHUFFLE_DECK:
			return shuffleDeckReducer(state, action);
		case ACTION_REVEAL_CARD:
			return revealCardReducer(state, action);

		default:
			const _exhaustiveCheck: never = action;
			return state;
	}
};

export function UniverseProvider({ children }: { children: React.ReactNode }) {
	const [universe, dispatch] = useReducer(
		universeReducer,
		undefined,
		Universe.empty,
	);

	return (
		<UniverseContext.Provider value={[universe, dispatch]}>
			{children}
		</UniverseContext.Provider>
	);
}

const UniverseContext = createContext<
	[
		ReducerState<typeof universeReducer>,
		Dispatch<ReducerAction<typeof universeReducer>>,
	]
>([
	Universe.empty(),
	() => {
		throw new Error('UniverseContext not initialized');
	},
]);

export function useUniverse() {
	return useContext(UniverseContext);
}
