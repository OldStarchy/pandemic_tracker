import { Context, Reducer, useContext, useMemo } from 'react';

export const ACTION_UNDO = 'ACTION_UNDO';
export const ACTION_REDO = 'ACTION_REDO';
interface UndoAction {
	type: typeof ACTION_UNDO;
}
interface RedoAction {
	type: typeof ACTION_REDO;
}

export function undoAction(): UndoAction {
	return { type: ACTION_UNDO };
}

export function redoAction(): RedoAction {
	return { type: ACTION_REDO };
}
interface StateWithUndo<T, TAction> {
	past: { initial: T; action: TAction }[];
	future: TAction[];
	current: T;
}
export function emptyUndoState<T, TAction>(
	initial: T,
): StateWithUndo<T, TAction> {
	return { past: [], future: [], current: initial };
}
export function withUndoReducer<T, TAction extends { type: string }>(
	rootReducer: Reducer<T, TAction>,
): Reducer<StateWithUndo<T, TAction>, TAction | UndoAction | RedoAction> {
	return function withUndo(
		state: StateWithUndo<T, TAction>,
		action: TAction | UndoAction | RedoAction,
	): StateWithUndo<T, TAction> {
		switch (action.type) {
			case ACTION_UNDO:
				const last = state.past[state.past.length - 1];
				return {
					past: state.past.slice(0, -1),
					future: [last.action, ...state.future],
					current: last.initial,
				};
			case ACTION_REDO: {
				const next = state.future[0];
				if (!next) return state;

				return {
					past: [
						...state.past,
						{ initial: state.current, action: next },
					],
					future: state.future.slice(1),
					current: rootReducer(state.current, next),
				};
			}
			default: {
				const next = rootReducer(state.current, action as TAction);
				return {
					past: [
						...state.past,
						{ initial: state.current, action: action as TAction },
					],
					future: [],
					current: next,
				};
			}
		}
	};
}
export function createUseCanUndo<T extends Context<any>>(context: T) {
	return function useCanUndo() {
		const [stateWithUndo] = useContext(context);

		const canUndo = stateWithUndo.past.length > 0;
		const canRedo = stateWithUndo.future.length > 0;

		return useMemo(() => ({ canUndo, canRedo }), [canUndo, canRedo]);
	};
}
