import { Card } from '../lib/Card';
import { CardBase } from './CardBase';

export function CardGrid({ cards }: { cards: Card[] }) {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
				gap: '1rem',
			}}
		>
			{cards.map((card) => (
				<CardBase key={card.name}>
					<div style={{ zIndex: 1, position: 'relative' }}>
						<h3>{card.name}</h3>
					</div>
				</CardBase>
			))}
		</div>
	);
}
