import { Card } from './Card';

export interface Group {
	readonly id: string;
	readonly cardIds: ReadonlySet<Card['id']>;
}
