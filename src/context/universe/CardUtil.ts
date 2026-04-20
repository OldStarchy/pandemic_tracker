import { Universe } from '../../store/universeSlice';
import { Card } from './Card';

export default class CardUtil {
	static getCardName(universe: Universe, id: Card['id']): string | undefined {
		const card = universe.cards.find((c) => c.id === id);
		return card?.name;
	}
}
