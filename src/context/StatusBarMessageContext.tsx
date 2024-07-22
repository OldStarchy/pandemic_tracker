import { createContext, useContext } from 'react';

const StatusBarMessageContext = createContext<
	undefined | ((message: string | null) => void)
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
