/* eslint-disable react-hooks/exhaustive-deps */
import {
	faArrowTurnUp,
	faArrowUp,
	faEdit,
	faFileExport,
	faFileImport,
	faMinus,
	faPlus,
	faShuffle,
	faStar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import './App.css';
import { CardBase } from './components/CardBase';
import { DeckView } from './components/DeckView';
import { Popup } from './components/Popup';
import { Button } from './components/common/Button';
import { Input } from './components/common/Input';
import { Select } from './components/common/Select';
import { H2 } from './components/common/Typography';
import { Card } from './context/Card';
import CardUtil from './context/CardUtil';
import { DeckItem } from './context/Deck';
import DeckUtil from './context/DeckUtil';
import { Group } from './context/Group';
import { useUniverse } from './context/UniverseContext';
import { createCards } from './context/actions/CardActions';
import {
	createDeck,
	moveCard,
	revealCard,
	shuffleDeck,
} from './context/actions/DeckActions';
import { load, reset } from './context/actions/UniverseActions';
import { cities } from './data/cities';

// const cityCards = Object.keys(cities).map((city) => Card.get({ name: city }));
// const shuffledCityCards = new Assortment(
// 	new Map(
// 		cityCards.map((card) => [
// 			card,
// 			cities[card.name as keyof typeof cities],
// 		])
// 	)
// );
// const infectionDeck = new Deck('Infection Deck');
// infectionDeck.insert(
// 	new Array(Assortment.getTotalCardCount(shuffledCityCards)).fill(
// 		shuffledCityCards
// 	),
// 	0
// );

// const discardDeck = new Deck('Discard Deck');

function getNthNiceColor(n: number): string {
	const goldenRatioConjugate = 0.618033988749895;
	const hue = (n * goldenRatioConjugate) % 1;
	const color = `hsl(${hue * 360}, 100%, 10%)`;
	return color;
}

function createStripeyBackground(colors: string[]): string {
	return `repeating-linear-gradient(45deg, ${colors
		.map(
			(color, index) =>
				`${color} ${index * 1.5}rem, ${color} ${(index + 1) * 1.5}rem`,
		)
		.join(', ')})`;
}

const INFECTION_DECK = 'Infection Deck';
const DISCARD_DECK = 'Discard Deck';

function App() {
	const [drawCount, setDrawCountRaw] = useState(1);
	const [topDrawFormVisible, setTopDrawFormVisible] = useState(false);
	const [bottomDrawFormVisible, setBottomDrawFormVisible] = useState(false);
	const [editDeckFormVisible, setEditDeckFormVisible] = useState(false);

	const [editDeckData, setEditDeckData] = useState<string>('');

	const setDrawCount = useCallback<Dispatch<SetStateAction<number>>>(
		(count) => {
			setDrawCountRaw((c) =>
				Math.max(1, typeof count === 'number' ? count : count(c)),
			);
		},
		[setDrawCountRaw],
	);

	const [universe, dispatch] = useUniverse();

	useEffect(() => {
		dispatch(reset());
		dispatch(createDeck(INFECTION_DECK));
		dispatch(
			createCards(
				INFECTION_DECK,
				...Object.entries(cities).flatMap(([city, count]) =>
					new Array(count).fill(city),
				),
			),
		);
		dispatch(shuffleDeck(INFECTION_DECK));
		dispatch(createDeck(DISCARD_DECK));
	}, []);

	const infectionDeck = universe.decks.find(
		(deck) => deck.id === INFECTION_DECK,
	);

	const discardDeck = universe.decks.find((deck) => deck.id === DISCARD_DECK);

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

	const nextDrawOptions = useMemo(() => {
		const top = infectionDeck?.items[0];
		if (top) {
			return DeckUtil.getCardOptions(universe, top);
		}
		return [];
	}, [infectionDeck]);

	const nextBottomDrawOptions = useMemo(() => {
		const bottom = infectionDeck?.items[infectionDeck.items.length - 1];
		if (bottom) {
			return DeckUtil.getCardOptions(universe, bottom);
		}

		return [];
	}, [infectionDeck]);

	return (
		<div
			className="App"
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: '0.5rem',
			}}
		>
			<section>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
					}}
				>
					<label>Draw Count</label>
					<Button
						style={{ aspectRatio: '1' }}
						onClick={() => {
							setDrawCount((d) => d - 1);
						}}
					>
						<FontAwesomeIcon icon={faMinus} />
					</Button>
					<Input
						type="number"
						min="1"
						style={{ flexGrow: 1 }}
						value={drawCount}
						onChange={(e) => {
							setDrawCount(parseInt(e.target.value));
						}}
					/>
					<Button
						style={{ aspectRatio: '1' }}
						onClick={() => {
							setDrawCount((d) => d + 1);
						}}
					>
						<FontAwesomeIcon icon={faPlus} />
					</Button>
				</div>
			</section>
			<section>
				<H2>Draw Chance</H2>
				<ol
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '0.25rem',
					}}
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
				</ol>
			</section>
			<section>
				<Button
					onClick={() => {
						const data = JSON.stringify(
							{
								universe,
								drawCount,
							},
							null,
							2,
						);
						const blob = new Blob([data], {
							type: 'application/json',
						});
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = 'deck.json';
						a.click();
						URL.revokeObjectURL(url);
						a.remove();
					}}
				>
					Export <FontAwesomeIcon icon={faFileExport} />
				</Button>
				<Button
					onClick={async () => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = '.json';
						input.onchange = async () => {
							const file = input.files?.[0];
							if (!file) return;

							const data = await file.text();
							const json = JSON.parse(data);
							//TODO: Validate structure

							dispatch(load(json.universe));
							// const infecDec = Deck.fromJson(json.infectionDeck);
							// infectionDeck.remove(0, infectionDeck.cards.length);
							// infectionDeck.insert(
							// 	infecDec.cards as unknown as IPossibleCard[],
							// 	0,
							// );
							// infecDec.remove(0, infecDec.cards.length);
							// infectionDeck.name = infecDec.name;

							// const discDec = Deck.fromJson(json.discardDeck);
							// discardDeck.remove(0, discardDeck.cards.length);
							// discardDeck.insert(
							// 	discDec.cards as unknown as IPossibleCard[],
							// 	0,
							// );
							// discDec.remove(0, discDec.cards.length);
							// discardDeck.name = discDec.name;

							setDrawCount(json.drawCount);
						};
						input.click();
					}}
				>
					Import <FontAwesomeIcon icon={faFileImport} />
				</Button>
				<Button
					onClick={() => {
						const data = JSON.stringify(universe, null, 2);

						setEditDeckData(data);
						setEditDeckFormVisible(true);
					}}
				>
					Edit Infction Deck <FontAwesomeIcon icon={faEdit} />
				</Button>
			</section>
			<section>
				<Button
					onClick={() => {
						if (!infectionDeck || !nextDrawOptions) return;
						if (infectionDeck.items.length === 0) return;

						setTopDrawFormVisible(true);
					}}
					title="Draw Cards from the top of the deck"
				>
					Draw Top <FontAwesomeIcon icon={faArrowUp} />
				</Button>
				<Button
					onClick={() => {
						if (!infectionDeck || !nextBottomDrawOptions) return;
						if (infectionDeck.items.length === 0) return;

						setBottomDrawFormVisible(true);
					}}
					title="Draw a card from the bottom of the deck"
				>
					Draw Bottom <FontAwesomeIcon icon={faArrowTurnUp} />
				</Button>
				<Button
					onClick={() => {
						dispatch(shuffleDeck(DISCARD_DECK));
						dispatch(
							moveCard(DISCARD_DECK, 0, INFECTION_DECK, 0, -1),
						);
					}}
				>
					Shuffle and Restack <FontAwesomeIcon icon={faShuffle} />
				</Button>
			</section>
			<section
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '0.5rem',
					position: 'relative',
					isolation: 'isolate',
				}}
			>
				{infectionDeck && (
					<section
						style={{
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<H2>{infectionDeck.id}</H2>

						<DeckView
							deck={infectionDeck}
							cardPrefix={(card, index) => {
								if (index < drawCount) {
									return (
										<FontAwesomeIcon
											title="This card will be drawn"
											icon={faStar}
										/>
									);
								}
								return null;
							}}
						/>
					</section>
				)}
				{discardDeck && (
					<section
						style={{
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<H2>{discardDeck.id}</H2>
						<DeckView deck={discardDeck} />
					</section>
				)}
			</section>
			<Popup visible={editDeckFormVisible}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const json = JSON.parse(editDeckData);
						//TODO: Validate structure
						dispatch(load(json));
						setEditDeckFormVisible(false);
					}}
					style={{
						flexDirection: 'column',
					}}
				>
					<textarea
						value={editDeckData}
						style={{
							width: '90vw',
							height: '80vh',
							background: '#222',
						}}
						onChange={(e) => {
							setEditDeckData(e.target.value);
						}}
					></textarea>
					<div>
						<Button type="submit">Save</Button>
						<Button
							type="button"
							onClick={() => {
								setEditDeckFormVisible(false);
							}}
						>
							Cancel
						</Button>
					</div>
				</form>
			</Popup>
			<Popup visible={topDrawFormVisible}>
				<SelectCardForm
					options={Array.from(new Set(nextDrawOptions ?? []))}
					onCancel={() => {
						setTopDrawFormVisible(false);
					}}
					onSelectCard={(card) => {
						if (!infectionDeck) return;

						dispatch(
							moveCard(INFECTION_DECK, 0, DISCARD_DECK, 0, 1),
						);
						dispatch(revealCard(DISCARD_DECK, 0, card));
					}}
				/>
			</Popup>
			<Popup visible={bottomDrawFormVisible}>
				<SelectCardForm
					options={Array.from(new Set(nextBottomDrawOptions ?? []))}
					onCancel={() => {
						setBottomDrawFormVisible(false);
					}}
					onSelectCard={(card) => {
						dispatch(
							moveCard(INFECTION_DECK, -1, DISCARD_DECK, 0, 1),
						);
						dispatch(revealCard(DISCARD_DECK, 0, card));

						setBottomDrawFormVisible(false);
					}}
				/>
			</Popup>
		</div>
	);
}

function SelectCardForm({
	options,
	onCancel,
	onSelectCard,
}: {
	options: Card['name'][];
	onCancel: () => void;
	onSelectCard: (card: Card['name']) => void;
}) {
	const [cardName, setCardName] = useState(options[0]);

	useEffect(() => {
		if (options.length === 0) {
			onCancel();
			return;
		}
		if (!options.some((c) => c === cardName)) {
			setCardName(options[0]);
		}
	}, [options]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();

				onSelectCard(cardName);
			}}
		>
			<Select
				value={cardName}
				onChange={(e) => {
					setCardName(e.target.value);
				}}
			>
				{options.map((cardName) => (
					<option value={cardName} key={cardName}>
						{cardName}
					</option>
				))}
			</Select>
			<Button type="submit">Draw</Button>
			<Button type="button" onClick={onCancel}>
				Done
			</Button>
		</form>
	);
}

export function getAssortmentColors(
	deck: readonly DeckItem[],
): Map<Group['id'], string> {
	const assortments = new Map<Group['id'], string>();

	for (const card of deck) {
		if (card.type === 'group') {
			if (!assortments.has(card.groupId)) {
				assortments.set(
					card.groupId,
					getNthNiceColor(assortments.size),
				);
			}
		}
	}

	return assortments;
}

export function getAssortmentLabels(
	deck: readonly DeckItem[],
): Map<Group['id'], string> {
	const assortments = new Map<Group['id'], string>();

	for (const card of deck) {
		if (card.type === 'group') {
			if (!assortments.has(card.groupId)) {
				assortments.set(
					card.groupId,
					String.fromCharCode(65 + assortments.size),
				);
			}
		}
	}

	return assortments;
}

export default App;
