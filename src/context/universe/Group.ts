import { Card } from './Card';

export interface Group {
	id: string;
	cardIds: Set<Card['id']>;
}
