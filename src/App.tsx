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
import { useUniverse } from './ context/UniverseContext';
import { createCards } from './ context/actions/CardActions';
import { createDeck, shuffleDeck } from './ context/actions/DeckActions';
import { reset } from './ context/actions/UniverseActions';
import './App.css';
import { CardBase } from './components/CardBase';
import { DeckView } from './components/DeckView';
import { Popup } from './components/Popup';
import { Button } from './components/common/Button';
import { Input } from './components/common/Input';
import { Select } from './components/common/Select';
import { H2 } from './components/common/Typography';
import { cities } from './data/cities';
import { Assortment, IAssortment } from './lib/Assortment';
import { Card } from './lib/Card';
import { Deck, IPossibleCard, IReadonlyPossibleCard } from './lib/Deck';

const cityCards = Object.keys(cities).map((city) => Card.get({ name: city }));
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
		dispatch(createDeck('Infection Deck'));
		dispatch(
			createCards(
				'Infection Deck',
				...Object.entries(cities).flatMap(([city, count]) =>
					new Array(count).fill(city),
				),
			),
		);
		dispatch(shuffleDeck('Infection Deck'));
		dispatch(createDeck('Discard Deck'));
	}, []);

	const cardDrawProbabilities = useMemo(() => {
		const allTheCards = infectionDeck.cards
			.slice(0, drawCount)
			.reduce((cards, item) => {
				if (item instanceof Card) {
					cards.add(item);
				} else {
					for (const [card] of item.cards) {
						cards.add(card);
					}
				}

				return cards;
			}, new Set<Card>());

		return [...allTheCards]
			.map((card) => {
				const probability = Deck.calculateDrawChance(
					infectionDeck,
					card,
					drawCount,
				);

				return { card, probability };
			})
			.sort((a, b) => b.probability - a.probability);
	}, [infectionNonce, drawCount]);

	const colors = useMemo(
		() => getAssortmentColors(infectionDeck.cards.slice(0, drawCount)),
		[infectionNonce, drawCount],
	);

	const nextDrawOptions = useMemo(() => {
		const top = infectionDeck.peek(0);
		if (top) {
			return Assortment.getCardOptions(top);
		}
		return [];
	}, [infectionNonce]);

	const nextBottomDrawOptions = useMemo(() => {
		const bottom = infectionDeck.peek(-1)!;
		if (bottom) {
			return Assortment.getCardOptions(bottom);
		}

		return [];
	}, [infectionNonce]);

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
						({ card, probability }, index) => {
							const color = [...colors.entries()]
								.filter(([assortment]) =>
									assortment.cards.has(card),
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
										<h3>{card.name}</h3>
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
								infectionDeck: infectionDeck.toJson(),
								discardDeck: discardDeck.toJson(),
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

							const infecDec = Deck.fromJson(json.infectionDeck);
							infectionDeck.remove(0, infectionDeck.cards.length);
							infectionDeck.insert(
								infecDec.cards as unknown as IPossibleCard[],
								0,
							);
							infecDec.remove(0, infecDec.cards.length);
							infectionDeck.name = infecDec.name;

							const discDec = Deck.fromJson(json.discardDeck);
							discardDeck.remove(0, discardDeck.cards.length);
							discardDeck.insert(
								discDec.cards as unknown as IPossibleCard[],
								0,
							);
							discDec.remove(0, discDec.cards.length);
							discardDeck.name = discDec.name;

							setDrawCount(json.drawCount);
						};
						input.click();
					}}
				>
					Import <FontAwesomeIcon icon={faFileImport} />
				</Button>
				<Button
					onClick={() => {
						const data = JSON.stringify(
							infectionDeck.toJson(),
							null,
							2,
						);

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
						if (infectionDeck.cards.length === 0) return;

						if (nextDrawOptions.length > 0)
							setTopDrawFormVisible(true);
						else {
							const stack = infectionDeck
								.remove(0, 1)
								.map(Assortment.reveal);

							discardDeck.insert(stack, 0);
						}
					}}
					title="Draw Cards from the top of the deck"
				>
					Draw Top <FontAwesomeIcon icon={faArrowUp} />
				</Button>
				<Button
					onClick={() => {
						if (infectionDeck.cards.length === 0) return;

						if (nextBottomDrawOptions.length > 0)
							setBottomDrawFormVisible(true);
						else {
							const stack = infectionDeck
								.remove(-1, 1)
								.map(Assortment.reveal);

							discardDeck.insert(stack, 0);
						}
					}}
					title="Draw a card from the bottom of the deck"
				>
					Draw Bottom <FontAwesomeIcon icon={faArrowTurnUp} />
				</Button>
				<Button
					onClick={() => {
						discardDeck.shuffle();

						const cards = discardDeck.remove(
							0,
							discardDeck.cards.length,
						);

						infectionDeck.insert(cards, 0);
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
				<section
					style={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<H2>{infectionDeck.name}</H2>
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
				<section
					style={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<H2>{discardDeck.name}</H2>
					<DeckView deck={discardDeck} />
				</section>
			</section>
			<Popup visible={editDeckFormVisible}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const json = Deck.fromJson(JSON.parse(editDeckData));
						infectionDeck.remove(0, infectionDeck.cards.length);
						infectionDeck.insert(
							json.cards as unknown as IPossibleCard[],
							0,
						);
						infectionDeck.name = json.name;
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
					options={nextDrawOptions}
					onCancel={() => {
						setTopDrawFormVisible(false);
					}}
					onSelectCard={(card) => {
						const top = infectionDeck.remove(0, 1)[0]!;
						if (top instanceof Card && top !== card) {
							throw new Error('Unexpected card selected');
						}

						if (top instanceof Assortment) {
							Assortment.subtract(
								top,
								new Assortment(new Map([[card, 1]])),
							);
						}

						discardDeck.insert([card], -1);
					}}
				/>
			</Popup>
			<Popup visible={bottomDrawFormVisible}>
				<SelectCardForm
					options={nextBottomDrawOptions}
					onCancel={() => {
						setBottomDrawFormVisible(false);
					}}
					onSelectCard={(card) => {
						const top = infectionDeck.remove(-1, 1)[0]!;
						if (top instanceof Card && top !== card) {
							throw new Error('Unexpected card selected');
						}

						if (top instanceof Assortment) {
							Assortment.subtract(
								top,
								new Assortment(new Map([[card, 1]])),
							);
						}

						discardDeck.insert([card], -1);
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
	options: Card[];
	onCancel: () => void;
	onSelectCard: (card: Card) => void;
}) {
	const [cardName, setCardName] = useState(options[0]!.name);

	useEffect(() => {
		if (options.length === 0) {
			onCancel();
			return;
		}
		if (!options.some((card) => card.name === cardName)) {
			setCardName(options[0].name);
		}
	}, [options]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();

				const card = options.find((card) => card.name === cardName)!;
				onSelectCard(card);
			}}
		>
			<Select
				value={cardName}
				onChange={(e) => {
					setCardName(e.target.value);
				}}
			>
				{options.map((card) => (
					<option value={card.name} key={card.name}>
						{card.name}
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
	deck: readonly IReadonlyPossibleCard[],
): Map<IAssortment, string> {
	const assortments = new Map<IAssortment, string>();

	for (const card of deck) {
		if (card instanceof Assortment) {
			if (!assortments.has(card)) {
				assortments.set(card, getNthNiceColor(assortments.size));
			}
		}
	}

	return assortments;
}

export function getAssortmentLabels(
	deck: readonly IReadonlyPossibleCard[],
): Map<IAssortment, string> {
	const assortments = new Map<IAssortment, string>();

	for (const card of deck) {
		if (card instanceof Assortment) {
			if (!assortments.has(card)) {
				assortments.set(
					card,
					String.fromCharCode(65 + assortments.size),
				);
			}
		}
	}

	return assortments;
}

export default App;
