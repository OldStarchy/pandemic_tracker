import { Card } from './Card';
import { Group } from './Group';

export interface Deck {
	id: string;
	items: DeckItem[];
}
export type DeckItem =
	| {
			type: 'card';
			cardId: Card['id'];
	  }
	| {
			type: 'group';
			groupId: Group['id'];
	  };
