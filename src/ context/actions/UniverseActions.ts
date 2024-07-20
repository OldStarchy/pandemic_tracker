import { Universe } from '../Universe';

export const ACTION_RESET = 'ACTION_RESET';

type ResetAction = { type: typeof ACTION_RESET };

export function reset(): ResetAction {
	return { type: ACTION_RESET };
}

export function resetReducer(state: Universe, action: ResetAction): Universe {
	return Universe.empty();
}

export const ACTION_LOAD = 'ACTION_LOAD';

type LoadAction = { type: typeof ACTION_LOAD; universe: Universe };

export function load(universe: Universe): LoadAction {
	return { type: ACTION_LOAD, universe };
}

export function loadReducer(state: Universe, action: LoadAction): Universe {
	return structuredClone(action.universe);
}

type UniverseActions = ResetAction | LoadAction;

export default UniverseActions;
