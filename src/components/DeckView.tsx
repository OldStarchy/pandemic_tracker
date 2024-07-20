/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import { getAssortmentColors, getAssortmentLabels } from '../App';
import CardUtil from '../context/CardUtil';
import { Deck, DeckItem } from '../context/Deck';
import { useUniverse } from '../context/UniverseContext';
import { CardBase } from './CardBase';

export function DeckView({
	deck,
	cardPrefix,
}: {
	deck: Deck;
	cardPrefix?: (card: DeckItem, index: number) => React.ReactNode;
}) {
	const [universe, dispatch] = useUniverse();
	const groupedCards = deck.items;

	const colors = useMemo(() => getAssortmentColors(deck.items), [deck]);
	const labels = useMemo(() => getAssortmentLabels(deck.items), [deck]);

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
									card.type === 'group'
										? colors.get(card.groupId)
										: undefined,
							}}
						>
							{card.type === 'card'
								? CardUtil.getCardName(universe, card.cardId)
								: `1 of ${
										universe.groups.find(
											(g) => g.id === card.groupId,
										)?.cardIds.size
								  }`}
							{card.type === 'group' && (
								<> Group {labels.get(card.groupId)}</>
							)}
							{/* x{count} */}
							{/* {card .type === 'group' &&
								universe.groups.find(g => g.id === card.groupId)?.cardIds.size < 5 && (
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
													}`,
											)
											.join(', ')}
										)
									</>
								)} */}
						</CardBase>
					</li>
				))}
			</ol>
		</div>
	);
}
