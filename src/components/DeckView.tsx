import React, { useMemo } from 'react';
import { getAssortmentColors, getAssortmentLabels } from '../App';
import { Assortment } from '../lib/Assortment';
import { Card } from '../lib/Card';
import { IDeck, IPossibleCard } from '../lib/Deck';
import { useMutable } from '../lib/Mutable';
import { CardBase } from './CardBase';

export function DeckView({
	deck,
	cardPrefix,
}: {
	deck: IDeck;
	cardPrefix?: (card: IPossibleCard, index: number) => React.ReactNode;
}) {
	const deckNonce = useMutable(deck);
	const groupedCards = useMemo(
		() => deck.cards, // groupByAssortment(deck.cards),
		[deckNonce]
	);

	const colors = useMemo(() => getAssortmentColors(deck.cards), [deckNonce]);
	const labels = useMemo(() => getAssortmentLabels(deck.cards), [deckNonce]);

	return (
		<div>
			<ol>
				{groupedCards.map((card, index) => (
					<li
						key={index}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.25rem',
							margin: '0.25rem 0',
						}}
					>
						{cardPrefix?.(card, index)}
						<CardBase
							style={{
								flexGrow: 1,
								height:
									// (1 + Math.min(count, 6) * 0.75).toFixed(1) +
									'1.75rem',
								backgroundColor:
									card instanceof Assortment
										? colors.get(card)
										: undefined,
							}}
						>
							{card instanceof Card
								? card.name
								: `1 of ${Assortment.getTotalCardCount(card)}`}
							{card instanceof Assortment && (
								<> Group {labels.get(card)}</>
							)}
							{/* x{count} */}
							{card instanceof Assortment &&
								card.cards.size < 5 && (
									<>
										{' '}
										(
										{[...card.cards.entries()]
											.map(
												([c, count]) =>
													`${c.name}${
														count > 1
															? ` x${count}`
															: ''
													}`
											)
											.join(', ')}
										)
									</>
								)}
						</CardBase>
					</li>
				))}
			</ol>
		</div>
	);
}
