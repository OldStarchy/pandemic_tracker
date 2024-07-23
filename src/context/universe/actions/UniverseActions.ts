import { Reducer } from 'react';
import { Universe } from '../Universe';
import CardActions, {
	ACTION_CREATE_CARD,
	ACTION_DESTROY_CARD,
	createCardReducer,
	destroyCardReducer,
} from './CardActions';
import DeckActions, {
	ACTION_CREATE_DECK,
	ACTION_MOVE_CARD,
	ACTION_SHUFFLE_DECK,
	createDeckReducer,
	moveCardReducer,
	shuffleDeckReducer,
} from './DeckActions';
import GroupActions, {
	ACTION_REVEAL_CARD,
	revealCardReducer,
} from './GroupActions';

export const ACTION_RESET = 'ACTION_RESET';

type ResetAction = { type: typeof ACTION_RESET };

export function reset(): ResetAction {
	return { type: ACTION_RESET };
}

export function resetReducer(_state: Universe, _action: ResetAction): Universe {
	return Universe.empty();
}

export const ACTION_LOAD = 'ACTION_LOAD';

type LoadAction = { type: typeof ACTION_LOAD; universe: Universe };

export function load(universe: Universe): LoadAction {
	return { type: ACTION_LOAD, universe };
}

export function loadReducer(_state: Universe, action: LoadAction): Universe {
	return structuredClone(action.universe);
}

export const universeReducer: Reducer<
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

		default: {
			const _exhaustiveCheck: never = action;
			return state;
		}
	}
};

type UniverseActions = ResetAction | LoadAction;

export default UniverseActions;
