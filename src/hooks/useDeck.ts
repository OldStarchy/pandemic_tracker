import { useMemo } from 'react';
import { useUniverse } from '../context/universe/UniverseContext';

export function useDeck(id: string) {
	const [{ decks }] = useUniverse();

	return useMemo(() => decks.find((deck) => deck.id === id), [decks, id]);
}
