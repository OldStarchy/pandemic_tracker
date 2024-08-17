/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import CardUtil from '../context/universe/CardUtil';
import { Deck, DeckItem } from '../context/universe/Deck';
import { useUniverse } from '../context/universe/UniverseContext';
import { getAssortmentColors } from '../lib/getAssortmentColors';
import { getAssortmentLabels } from '../lib/getAssortmentLabels';
import { CardBase } from './CardBase';
import { ExpandoList } from './ExpandoList';

export function DeckView({
	deck,
	cardPrefix,
}: {
	deck: Deck;
	cardPrefix?: (card: DeckItem, index: number) => React.ReactNode;
}) {
	const [universe] = useUniverse();
	const [expanded, setExpanded] = React.useState(false);

	const colors = useMemo(() => getAssortmentColors(deck.items), [deck]);
	const labels = useMemo(() => getAssortmentLabels(deck.items), [deck]);

	const groupedCards = useMemo(() => {
		const items: { item: DeckItem; count: number }[] = [];

		for (const item of deck.items) {
			if (items.length === 0) {
				items.push({ item, count: 1 });
				continue;
			}

			let top = items[items.length - 1];

			if (item.type !== top.item.type) {
				items.push({ item, count: 1 });
				continue;
			}

			if (item.type === 'card') {
				if (
					CardUtil.getCardName(universe, item.cardId) ===
					CardUtil.getCardName(
						universe,
						(top.item as DeckItem & { type: 'card' }).cardId,
					)
				) {
					top.count++;
					continue;
				}
			} else {
				if (
					item.groupId ===
					(top.item as DeckItem & { type: 'group' }).groupId
				) {
					top.count++;
					continue;
				}
			}

			items.push({ item, count: 1 });
		}

		return items;
	}, [deck.items]);

	return (
		<div>
			<ol>
				<ExpandoList expanded={expanded} setExpanded={setExpanded}>
					{groupedCards.map(({ item: card, count }, index) => (
						<li
							key={index}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '0.25rem',
								margin: '0.25rem 0',
							}}
						>
							{cardPrefix?.(
								card,
								groupedCards
									.slice(0, index)
									.reduce((a, b) => a + b.count, 0),
							)}
							<CardBase
								style={{
									flexGrow: 1,
									height: `${1.5 + count * 0.25}rem`,
									backgroundColor:
										card.type === 'group'
											? colors.get(card.groupId)
											: undefined,
								}}
							>
								{card.type === 'card' &&
									CardUtil.getCardName(universe, card.cardId)}
								{card.type === 'group' && (
									<>Group {labels.get(card.groupId)} Card</>
								)}
								{count !== 1 && ` (x${count})`}
							</CardBase>
						</li>
					))}
				</ExpandoList>
			</ol>
		</div>
	);
}
