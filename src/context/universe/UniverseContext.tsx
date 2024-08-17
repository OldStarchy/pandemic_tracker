import {
	createContext,
	Dispatch,
	ReducerAction,
	ReducerState,
	useContext,
	useReducer,
} from 'react';
import {
	createUseCanUndo,
	emptyUndoState,
	withUndoReducer,
} from '../withUndoReducer';
import { Universe } from './Universe';
import UniverseActions, { universeReducer } from './actions/UniverseActions';

const appReducer = withUndoReducer(universeReducer);

export type UniverseState = ReducerState<typeof appReducer>;
export type UniverseDispatch = Dispatch<ReducerAction<typeof appReducer>>;

const UniverseContext = createContext<[UniverseState, UniverseDispatch]>([
	emptyUndoState(Universe.empty()),
	() => {
		throw new Error('UniverseContext not initialized');
	},
]);

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

export function useUniverse() {
	const [stateWithUndo, dispatch] = useContext(UniverseContext);

	return [stateWithUndo.current, dispatch] as const;
}

export const useCanUndo = createUseCanUndo(UniverseContext);
