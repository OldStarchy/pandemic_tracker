import {Context, Reducer, useContext, useMemo} from 'react';

export const ACTION_UNDO = 'ACTION_UNDO';
export const ACTION_REDO = 'ACTION_REDO';
export const ACTION_PUSH_TO_HISTORY = 'ACTION_PUSH_TO_HISTORY';
export const ACTION_CLEAR_HISTORY = 'ACTION_CLEAR_HISTORY';
interface UndoAction {
	type: typeof ACTION_UNDO;
}
interface RedoAction {
	type: typeof ACTION_REDO;
}
interface PushToHistoryAction {
	type: typeof ACTION_PUSH_TO_HISTORY;
}
interface ClearHistoryAction {
	type: typeof ACTION_CLEAR_HISTORY;
}

export type UndoActions =
	| UndoAction
	| RedoAction
	| PushToHistoryAction
	| ClearHistoryAction;

export function undoAction(): UndoAction {
	return { type: ACTION_UNDO };
}

export function redoAction(): RedoAction {
	return { type: ACTION_REDO };
}

export function setKeyframe(): PushToHistoryAction {
	return { type: ACTION_PUSH_TO_HISTORY };
}

export function clearHistory(): ClearHistoryAction {
	return { type: ACTION_CLEAR_HISTORY };
}

export interface StateWithUndo<T, TAction> {
	past: { initial: T; actions: TAction[] }[];
	future: TAction[][];
	current: T;
	keyframe: boolean;
}
export function emptyUndoState<T, TAction>(
	initial: T,
): StateWithUndo<T, TAction> {
	return {
		past: [],
		future: [],
		current: initial,
		keyframe: true,
	};
}
export function withUndoReducer<T, TAction extends { type: string }>(
	rootReducer: Reducer<T, TAction>,
): Reducer<StateWithUndo<T, TAction>, TAction | UndoActions> {
	return function withUndo(
		state: StateWithUndo<T, TAction>,
		action: TAction | UndoActions,
	): StateWithUndo<T, TAction> {
		switch (action.type) {
			case ACTION_UNDO:
				if (state.past.length === 0)
					throw new Error('No past actions to undo');

				const newPast = [...state.past];
				const last = newPast.pop()!;

				return {
					past: newPast,
					current: last.initial,
					future: [last.actions, ...state.future],
					keyframe: true,
				};

			case ACTION_REDO: {
				if (state.future.length === 0)
					throw new Error('No future actions to redo');

				const [next, ...newFuture] = [...state.future];

				return {
					past: [
						...state.past,
						{ initial: state.current, actions: next },
					],
					future: newFuture,
					current: next.reduce(rootReducer, state.current),
					keyframe: true,
				};
			}
			case ACTION_PUSH_TO_HISTORY: {
				if (state.keyframe || state.past.length === 0) return state;

				return {
					...state,
					keyframe: true,
				};
			}

			case ACTION_CLEAR_HISTORY: {
				return {
					...state,
					past: [],
					future: [],
					keyframe: true,
				};
			}

			default: {
				const next = rootReducer(state.current, action as TAction);

				let newPast = [...state.past];
				if (state.keyframe || newPast.length === 0) {
					newPast.push({
						initial: state.current,
						actions: [action as TAction],
					});
				} else {
					const last = newPast.pop()!;

					newPast.push({
						...last,
						actions: [...last.actions, action as TAction],
					});
				}

				return {
					past: newPast,
					future: [],
					current: next,
					keyframe: false,
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
