import { Card } from '../lib/Card';
import { CardBase } from './CardBase';

export function CardNoSelect({ card }: { card: Card }) {
	return (
		<div
			style={{
				position: 'relative',
				userSelect: 'none',
				color: card.count === 0 ? 'gray' : undefined,
			}}
		>
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
				<div
					style={{
						zIndex: 1,
						position: 'relative',
						display: 'flex',
						flexDirection: 'row',
						gap: '1rem',
					}}
				>
					<h3 style={{ flexGrow: 1 }}>{card.name}</h3>
					<p>{card.description}</p>
					<p>{card.type}</p>
					<p>x{card.count}</p>
				</div>
			</CardBase>
		</div>
	);
}
