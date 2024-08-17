/* eslint-disable react-hooks/exhaustive-deps */
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { setDrawCount, useAppState } from '../context/AppState';
import { Card } from '../context/universe/Card';
import CardUtil from '../context/universe/CardUtil';
import DeckUtil from '../context/universe/DeckUtil';
import { useUniverse } from '../context/universe/UniverseContext';
import { INFECTION_DECK } from '../lib/consts';
import { createStripeyBackground } from '../lib/createStripeyBackground';
import { getAssortmentColors } from '../lib/getAssortmentColors';
import { CardBase } from './CardBase';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { H2 } from './common/Typography';
import { ExpandoList } from './ExpandoList';

export function DrawProbabilityCalculator() {
	const [universe, dispatch] = useUniverse();

	const infectionDeck = useMemo(
		() => universe.decks.find((deck) => deck.id === INFECTION_DECK),
		[universe.decks],
	);

	const [{ drawCount }, dispatchAppState] = useAppState();

	const setDrawww = useCallback<Dispatch<SetStateAction<number>>>(
		(count) => dispatchAppState(setDrawCount(count)),
		[],
	);

	const [showAll, setShowAll] = useState(false);

	const cardDrawProbabilities = useMemo(() => {
		if (!infectionDeck) return [];

		const allTheCardIds = infectionDeck.items
			.slice(0, drawCount)
			.reduce((cards, item) => {
				switch (item.type) {
					case 'card': {
						cards.add(item.cardId);
						break;
					}
					case 'group': {
						const group = universe.groups.find(
							(group) => group.id === item.groupId,
						)!;

						group.cardIds.forEach((cId) => cards.add(cId));
						break;
					}
				}

				return cards;
			}, new Set<Card['id']>());

		const allTheCardNames = new Set(
			Array.from(allTheCardIds).map(
				(id) => universe.cards.find((card) => card.id === id)!.name,
			),
		);

		const result = [...allTheCardNames].map((cardName) => {
			const probability = DeckUtil.calculateDrawChance(
				universe,
				infectionDeck,
				cardName,
				drawCount,
			);

			return { cardName, probability };
		});

		result.sort((a, b) => b.probability - a.probability);

		return result;
	}, [universe, drawCount]);

	const colors = useMemo(
		() =>
			getAssortmentColors(
				(infectionDeck?.items ?? []).slice(0, drawCount),
			),
		[infectionDeck, drawCount],
	);

	return (
		<section>
			<header style={{ display: 'flex', gap: '1rem' }}>
				<H2>Draw Chance</H2>
			</header>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 'var(--gap-buttons)',
				}}
			>
				<Button
					style={{ aspectRatio: '1' }}
					onClick={() => {
						setDrawww((d) => d - 1);
					}}
				>
					<FontAwesomeIcon icon={faMinus} />
				</Button>
				<Input
					type="number"
					label="Draw Count"
					statusBarMessage="Select the number of cards you will draw. This will affect the draw probabilities."
					min="1"
					max={infectionDeck?.items.length}
					style={{ flexGrow: 1 }}
					value={drawCount}
					onChange={(e) => {
						setDrawww(parseInt(e.target.value));
					}}
				/>
				<Button
					style={{ aspectRatio: '1' }}
					onClick={() => {
						setDrawww((d) =>
							Math.min(
								infectionDeck?.items.length ?? Infinity,
								d + 1,
							),
						);
					}}
				>
					<FontAwesomeIcon icon={faPlus} />
				</Button>
			</div>

			{cardDrawProbabilities.length === 0 && (
				<p>No cards in Infection Deck to draw.</p>
			)}
			<ol
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '0.25rem',
				}}
			>
				<ExpandoList
					expanded={showAll}
					setExpanded={setShowAll}
					limit={5}
				>
					{cardDrawProbabilities.map(
						({ cardName, probability }, index) => {
							const color = [...colors.entries()]
								.filter(([assortment]) =>
									Array.from(
										universe.groups.find(
											(g) => g.id === assortment,
										)!.cardIds,
									)
										.map((id) =>
											CardUtil.getCardName(universe, id),
										)
										.includes(cardName),
								)
								.map(([, color]) => color);
							return (
								<li key={index}>
									<CardBase
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											background:
												createStripeyBackground(color),
										}}
									>
										<h3>{cardName}</h3>
										<p>{(probability * 100).toFixed(2)}%</p>
									</CardBase>
								</li>
							);
						},
					)}
				</ExpandoList>
			</ol>
		</section>
	);
}
