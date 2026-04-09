/* eslint-disable react-hooks/exhaustive-deps */
import React, { CSSProperties, useEffect, useMemo } from 'react';
import CardUtil from '../context/universe/CardUtil';
import { Deck, DeckItem } from '../context/universe/Deck';
import DeckUtil from '../context/universe/DeckUtil';
import { useUniverse } from '../context/universe/UniverseContext';
import { getAssortmentColors } from '../lib/getAssortmentColors';
import { getAssortmentLabels } from '../lib/getAssortmentLabels';
import { CardBase } from './CardBase';
import { ExpandoList } from './ExpandoList';

export function DeckView({
	deck,
	cardPrefix,
	style,
}: {
	deck: Deck;
	cardPrefix?: (card: DeckItem, index: number) => React.ReactNode;
	style?: CSSProperties;
}) {
	const [universe] = useUniverse();
	const [expanded, setExpanded] = React.useState(false);
	const [expandedItems, setExpandedItems] = React.useState(new Set<number>());

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
	}, [deck.items, universe]);

	useEffect(() => {
		setExpandedItems(new Set());
	}, [groupedCards.length]);

	return (
		<div style={style}>
			<ol>
				<ExpandoList expanded={expanded} setExpanded={setExpanded}>
					{groupedCards.map(({ item: card, count }, index) => {
						const title = (() => {
							if (card.type === 'card') {
								const name = CardUtil.getCardName(
									universe,
									card.cardId,
								);
								if (count === 1) return [name!];
								return [`${name} (x${count})`];
							}

							if (card.type === 'group')
								return Object.entries(
									DeckUtil.getCardOptions(
										universe,
										card,
									).reduce(
										(groups, card) => {
											groups[card] ??= 0;
											groups[card]++;
											return groups;
										},
										{} as Record<string, number>,
									),
								).map(([card, count]) => `${card} (x${count})`);

							const _exhaustiveCheck: never = card;
							throw new Error(
								`Unhandled case: ${_exhaustiveCheck}`,
							);
						})();

						return (
							<li
								key={index}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '0.25rem',
									margin: '0.25rem 0',
								}}
								onClick={() => {
									setExpandedItems((items) => {
										const clone = new Set(items);
										if (clone.has(index))
											clone.delete(index);
										else clone.add(index);
										return clone;
									});
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
										// height: `${1.5 + count * 0.25}rem`,
										minHeight: `1.75rem`,
										backgroundColor:
											card.type === 'group'
												? colors.get(card.groupId)
												: undefined,
									}}
									title={title.join(', ')}
								>
									{expandedItems.has(index) ? (
										title.map((t) => <p key={t}>{t}</p>)
									) : (
										<>
											{card.type === 'card' &&
												CardUtil.getCardName(
													universe,
													card.cardId,
												)}
											{card.type === 'group' && <>?</>}
											{count !== 1 && ` (x${count})`}
										</>
									)}
								</CardBase>
							</li>
						);
					})}
				</ExpandoList>
			</ol>
		</div>
	);
}
