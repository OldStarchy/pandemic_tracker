import { Card } from './Card';
import { Universe } from './Universe';

export default class CardUtil {
	static getCardName(universe: Universe, id: Card['id']): string | undefined {
		const card = universe.cards.find((c) => c.id === id);
		return card?.name;
	}
}
