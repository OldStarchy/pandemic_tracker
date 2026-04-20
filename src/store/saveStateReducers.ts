import { Action, PayloadAction } from '@reduxjs/toolkit';
import { Universe } from './universeSlice';

export function reset(_state: Universe, _action: Action): Universe {
	return Universe.empty();
}

export function load(
	_state: Universe,
	{ payload: { universe } }: PayloadAction<{ universe: Universe }>,
): Universe {
	return structuredClone(universe);
}
