import { Card } from './Card';
import { Group } from './Group';

export interface Deck {
	readonly id: string;
	readonly items: readonly DeckItem[];
}
export type DeckItem =
	| {
			readonly type: 'card';
			readonly cardId: Card['id'];
	  }
	| {
			readonly type: 'group';
			readonly groupId: Group['id'];
	  };
