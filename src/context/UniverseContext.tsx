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
	ACTION_SHUFFLE_DECK,
	createDeckReducer,
	moveCardReducer,
	shuffleDeckReducer,
} from './actions/DeckActions';
import GroupActions, {
	ACTION_REVEAL_CARD,
	revealCardReducer,
} from './actions/GroupActions';
import UniverseActions, {
	ACTION_LOAD,
	ACTION_RESET,
	loadReducer,
	resetReducer,
} from './actions/UniverseActions';
import {
	createUseCanUndo,
	emptyUndoState,
	withUndoReducer,
} from './withUndoReducer';

const universeReducer: Reducer<
	Universe,
	CardActions | DeckActions | UniverseActions | GroupActions
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

const appReducer = withUndoReducer(universeReducer);

export function UniverseProvider({ children }: { children: React.ReactNode }) {
	const [universe, dispatch] = useReducer(appReducer, undefined, () =>
		emptyUndoState<Universe, UniverseActions>(Universe.empty()),
	);

	return (
		<UniverseContext.Provider value={[universe, dispatch]}>
			{children}
		</UniverseContext.Provider>
	);
}

const UniverseContext = createContext<
	[
		ReducerState<typeof appReducer>,
		Dispatch<ReducerAction<typeof appReducer>>,
	]
>([
	emptyUndoState(Universe.empty()),
	() => {
		throw new Error('UniverseContext not initialized');
	},
]);

export function useUniverse() {
	const [stateWithUndo, dispatch] = useContext(UniverseContext);

	return [stateWithUndo.current, dispatch] as const;
}

export const useCanUndo = createUseCanUndo(UniverseContext);
