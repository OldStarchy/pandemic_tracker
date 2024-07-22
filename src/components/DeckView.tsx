/* eslint-disable react-hooks/exhaustive-deps */
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo } from 'react';
import { getAssortmentColors, getAssortmentLabels } from '../App';
import CardUtil from '../context/universe/CardUtil';
import { Deck, DeckItem } from '../context/universe/Deck';
import { useUniverse } from '../context/universe/UniverseContext';
import { CardBase } from './CardBase';
import { Button } from './common/Button';

export function DeckView({
	deck,
	cardPrefix,
}: {
	deck: Deck;
	cardPrefix?: (card: DeckItem, index: number) => React.ReactNode;
}) {
	const [universe, _dispatch] = useUniverse();
	const groupedCards = deck.items;
	const [expanded, setExpanded] = React.useState(false);

	const colors = useMemo(() => getAssortmentColors(deck.items), [deck]);
	const labels = useMemo(() => getAssortmentLabels(deck.items), [deck]);

	return (
		<div>
			{groupedCards.length > 5 && (
				<Button onClick={() => setExpanded((expanded) => !expanded)}>
					{expanded ? 'Show 5' : 'Show all'}
				</Button>
			)}
			<ol>
				{groupedCards
					.slice(0, expanded ? undefined : 5)
					.map((card, index) => (
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
									? CardUtil.getCardName(
											universe,
											card.cardId,
									  )
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
				{!expanded && groupedCards.length > 5 && (
					<li>
						<FontAwesomeIcon icon={faEllipsis} />
					</li>
				)}
			</ol>
		</div>
	);
}
