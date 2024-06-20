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
					{card.image && (
						<img
							style={{
								position: 'absolute',
								inset: 0,
								width: '100%',
								height: '100%',
								zIndex: 0,
								objectFit: 'cover',
								filter: 'brightness(0.3)',
							}}
							src={card.image}
							alt={card.name}
						/>
					)}
					<div style={{ zIndex: 1, position: 'relative' }}>
						<h3>{card.name}</h3>
						<p>{card.description}</p>
						<p>{card.type}</p>
						{card.count > 1 && <p>x{card.count}</p>}
					</div>
				</CardBase>
			))}
		</div>
	);
}
