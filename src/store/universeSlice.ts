import { createSlice } from '@reduxjs/toolkit';
import { Card } from '../context/universe/Card';
import { Deck } from '../context/universe/Deck';
import { Group } from '../context/universe/Group';
import { createCards, destroyCards } from './cardReducers';
import { createDeck, moveCard, shuffleDeck } from './deckReducers';
import { revealCard } from './groupReducers';
import { load, reset } from './saveStateReducers';

export interface Universe {
	decks: Deck[];
	cards: Card[];
	groups: Group[];
}

export namespace Universe {
	export function empty(): Universe {
		return {
			decks: [],
			cards: [],
			groups: [],
		};
	}
}

export const universeSlice = createSlice({
	name: 'universe',
	initialState: Universe.empty,
	reducers: {
		createCards,
		destroyCards,
		createDeck,
		moveCard,
		shuffleDeck,
		revealCard,
		reset,
		load,
	},
});

export const actions = universeSlice.actions;

export default universeSlice.reducer;
