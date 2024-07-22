import { Dispatch, SetStateAction, createContext, useContext } from 'react';

const StatusBarMessageContext = createContext<
	undefined | Dispatch<SetStateAction<string | null>>
>(undefined);

export function useStatusBarContext() {
	const ctx = useContext(StatusBarMessageContext);

	if (!ctx) {
		throw new Error(
			'useStatusBarContext must be used within StatusBarMessageProvider',
		);
	}

	return ctx;
}

export const StatusBarMessageProvider = StatusBarMessageContext.Provider;
