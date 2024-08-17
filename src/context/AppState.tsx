import {
	createContext,
	Dispatch,
	Reducer,
	SetStateAction,
	useContext,
	useReducer,
} from 'react';

export interface AppState {
	drawCount: number;
	drawTopPickerVisible: boolean;
	drawBottomPickerVisible: boolean;
}

type AppStateAction =
	| { type: 'DRAW_COUNT'; count: (count: number) => number }
	| {
			type: 'POPUP_VISIBLE';
			popup: 'top' | 'bottom';
			visible: (visible: boolean) => boolean;
	  };

export function setDrawCount(count: SetStateAction<number>): AppStateAction {
	return {
		type: 'DRAW_COUNT',
		count: count instanceof Function ? count : () => count,
	};
}

export function setPopupVisible(
	popup: 'top' | 'bottom',
	visible: SetStateAction<boolean>,
): AppStateAction {
	return {
		type: 'POPUP_VISIBLE',
		popup,
		visible: visible instanceof Function ? visible : () => visible,
	};
}

const appStateReducer: Reducer<AppState, AppStateAction> = (state, action) => {
	switch (action.type) {
		case 'DRAW_COUNT':
			return {
				...state,
				drawCount: Math.max(1, action.count(state.drawCount)),
			};
		case 'POPUP_VISIBLE':
			switch (action.popup) {
				case 'top':
					return {
						...state,
						drawTopPickerVisible: action.visible(
							state.drawTopPickerVisible,
						),
					};
				case 'bottom':
					return {
						...state,
						drawBottomPickerVisible: action.visible(
							state.drawBottomPickerVisible,
						),
					};
			}
	}
	const _exhaustiveCheck: never = action;
	return state;
};

const AppStateContext = createContext<
	[AppState | null, Dispatch<AppStateAction>]
>([null, () => {}]);

export function useAppState() {
	const [state, setState] = useContext(AppStateContext);

	if (state === null) {
		throw new Error('Attempt to use app state outside of app');
	}

	return [state, setState] as const;
}
export function AppStateProvider({ children }: { children: React.ReactNode }) {
	const [appState, dispatch] = useReducer(appStateReducer, {
		drawCount: 0,
		drawTopPickerVisible: false,
		drawBottomPickerVisible: false,
	});

	return (
		<AppStateContext.Provider value={[appState, dispatch]}>
			{children}
		</AppStateContext.Provider>
	);
}
