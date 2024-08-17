import { PayloadAction } from '@reduxjs/toolkit';
import { Card } from '../context/universe/Card';
import CardUtil from '../context/universe/CardUtil';
import { Deck, DeckItem } from '../context/universe/Deck';
import { Group } from '../context/universe/Group';
import { Universe } from './universeSlice';

export function createDeck(
	state: Universe,
	{
		payload: { id },
	}: PayloadAction<{
		id: Deck['id'];
	}>,
): void {
	if (state.decks.some((deck) => deck.id === id)) {
		throw new Error(`Deck ${id} already exists`);
	}

	state.decks.push({
		id,
		items: [],
	});
}

export function moveCard(
	state: Universe,
	{
		payload: { fromDeckId, fromIndex, toDeckId, toIndex, count },
	}: PayloadAction<{
		fromDeckId: Deck['id'];
		fromIndex: number;
		toDeckId: Deck['id'];
		toIndex: number;
		count: number;
	}>,
): void {
	const fromDeck = state.decks.find((deck) => deck.id === fromDeckId);

	if (!fromDeck) {
		throw new Error(`Deck ${fromDeckId} not found when moving card`);
	}

	const toDeck = state.decks.find((deck) => deck.id === toDeckId);

	if (!toDeck) {
		throw new Error(`Deck ${toDeckId} not found when moving card`);
	}

	const cards = fromDeck.items.splice(fromIndex, count);

	toDeck.items.splice(toIndex, 0, ...cards);
}

export function shuffleDeck(
	state: Universe,
	{
		payload: { deckId },
	}: PayloadAction<{
		deckId: Deck['id'];
	}>,
): void {
	const deck = state.decks.find((deck) => deck.id === deckId);

	if (!deck) {
		throw new Error(`Deck ${deckId} not found when shuffling`);
	}

	const uniqueCardNames = new Set(
		deck.items.flatMap((item) => {
			if (item.type === 'card')
				return CardUtil.getCardName(state, item.cardId);

			const group = state.groups.find(
				(group) => group.id === item.groupId,
			)!;
			return Array.from(group.cardIds).map((cardId) =>
				CardUtil.getCardName(state, cardId),
			);
		}),
	);

	if (uniqueCardNames.size <= 0) {
		return;
	}

	const numberOfItemsFromEachGroup: Record<string, number> = {};
	for (const item of deck.items) {
		if (item.type === 'group') {
			numberOfItemsFromEachGroup[item.groupId] =
				(numberOfItemsFromEachGroup[item.groupId] ?? 0) + 1;
		}
	}

	const allGroupsInThisDeckAreFullyInThisDeck = Array.from(
		Object.entries(numberOfItemsFromEachGroup),
	).every(([groupId, count]) => {
		const group = state.groups.find((group) => group.id === groupId);

		if (!group) return false;

		if (count === group.cardIds.size) return true;

		return false;
	});

	if (!allGroupsInThisDeckAreFullyInThisDeck) {
		throw new Error(
			'Cannot shuffle deck with incomplete groups. Some items in this deck come from shuffle groups that have cards elsewhere, entanglement is not supported',
		);
	}

	const groupsToDelete = Object.keys(numberOfItemsFromEachGroup);

	const cardsInNewGroup: Card['id'][] = [];

	for (const item of deck.items) {
		if (item.type === 'card') {
			cardsInNewGroup.push(item.cardId);
		}
	}

	for (const groupId of groupsToDelete) {
		const group = state.groups.find((group) => group.id === groupId)!;

		cardsInNewGroup.push(...group.cardIds);
	}

	const newGroup: Group = {
		id: crypto.randomUUID(),
		cardIds: new Set(cardsInNewGroup),
	};

	state.groups = [
		...state.groups.filter((group) => !groupsToDelete.includes(group.id)),
		newGroup,
	];

	deck.items = cardsInNewGroup.map(
		(): DeckItem => ({
			type: 'group',
			groupId: newGroup.id,
		}),
	);
}
