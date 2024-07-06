import { useCallback, useEffect, useState } from 'react';
import { Emitter } from './Emitter';

export const Mutable = Emitter as typeof Emitter<void>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Mutable = Emitter<void>;

export function useMutable(mutable: Mutable): Record<string, never> {
	const [nonce, setNonce] = useState({});

	const onChange = useCallback(() => void setNonce({}), []);

	useEffect(() => mutable.onChange(onChange), [mutable, onChange]);

	return nonce;
}
