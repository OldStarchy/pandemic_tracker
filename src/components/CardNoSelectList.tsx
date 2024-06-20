import React, { useState } from 'react';
import { Card } from '../lib/Card';
import { CardNoSelect } from './CardNoSelect';

export function CardNoSelectList({
	cards,
	style,
	...props
}: { cards: Card[] } & React.ComponentProps<'div'>) {
	const [filter, setFilter] = useState('');
	const [filterExact, setFilterExact] = useState(false);

	const total = cards.map((a) => a.count).reduce((a, b) => a + b, 0);

	const filteredCards =
		filter === ''
			? cards
			: Card.select(cards, { name: filter, fuzzy: !filterExact });

	return (
		<div {...props}>
			<div>
				<div>
					<label>
						Filter{' '}
						<input
							type="text"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
						/>
					</label>
					<label>
						Exact
						<input
							type="checkbox"
							checked={filterExact}
							onChange={(e) => setFilterExact(e.target.checked)}
						/>
					</label>
				</div>
			</div>
			<ul
				style={{
					listStyle: 'none',
					padding: 0,
					margin: 0,
					display: 'grid',
					gridTemplateColumns: '1fr auto',
					gap: '0.25rem',
					alignItems: 'center',
					minHeight: 0,
					paddingRight: '15px',
				}}
			>
				<li style={{ display: 'contents' }}>
					<span />
					<span>Draw Chance</span>
				</li>
				{filteredCards.map((card) => {
					const drawChance = card.count / total;
					return (
						<li key={card.name} style={{ display: 'contents' }}>
							<CardNoSelect card={card} />
							<span style={{ justifySelf: 'flex-end' }}>
								{(100 * drawChance).toFixed(2)}% or <br />1 in{' '}
								{Math.round(
									1 /
										Number.parseFloat(
											drawChance.toPrecision(2)
										)
								)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
