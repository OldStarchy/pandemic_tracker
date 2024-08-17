import { DeckItem } from '../context/universe/Deck';
import { Group } from '../context/universe/Group';

export function getAssortmentLabels(
	deck: readonly DeckItem[],
): Map<Group['id'], string> {
	const assortments = new Map<Group['id'], string>();

	for (const card of deck) {
		if (card.type === 'group') {
			if (!assortments.has(card.groupId)) {
				assortments.set(
					card.groupId,
					String.fromCharCode(65 + assortments.size),
				);
			}
		}
	}

	return assortments;
}
