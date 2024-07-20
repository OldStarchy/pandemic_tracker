import { Universe } from '../Universe';

export const ACTION_RESET = 'ACTION_RESET';
type ResetAction = { type: typeof ACTION_RESET };
export function reset(): ResetAction {
	return { type: ACTION_RESET };
}

export function resetReducer(state: Universe, action: ResetAction) {
	return Universe.empty();
}

type UniverseActions = ResetAction;

export default UniverseActions;
