/* eslint-disable react-hooks/exhaustive-deps */
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
import { cities } from './data/cities';
import { Assortment, IAssortment } from './lib/Assortment';
import { Card } from './lib/Card';
import { Deck, IDeck, IPossibleCard, IReadonlyPossibleCard } from './lib/Deck';
import { IMutable } from './lib/Mutable';

const cityCards = Object.keys(cities).map((city) => Card.get({ name: city }));
const shuffledCityCards = new Assortment(
	new Map(
		cityCards.map((card) => [
			card,
			cities[card.name as keyof typeof cities],
		])
	)
);
const infectionDeck = new Deck('Infection Deck');
infectionDeck.insert(
	new Array(Assortment.getTotalCardCount(shuffledCityCards)).fill(
		shuffledCityCards
	),
	0
);

const discardDeck = new Deck('Discard Deck');

function getNthNiceColor(n: number): string {
	const goldenRatioConjugate = 0.618033988749895;
	const hue = (n * goldenRatioConjugate) % 1;
	const color = `hsl(${hue * 360}, 100%, 10%)`;
	return color;
}

export function useMutable(mutable: IMutable): Record<string, never> {
	const [nonce, setNonce] = useState<Record<string, never>>({});

	const onChange = useCallback(() => {
		setNonce({});
	}, []);

	useEffect(() => mutable.onChange(onChange), [mutable, onChange]);

	return nonce;
}

function createStripeyBackground(colors: string[]): string {
	return `repeating-linear-gradient(45deg, ${colors
		.map(
			(color, index) =>
				`${color} ${index * 1.5}rem, ${color} ${(index + 1) * 1.5}rem`
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
				Math.max(1, typeof count === 'number' ? count : count(c))
			);
		},
		[setDrawCountRaw]
	);

	const infectionNonce = useMutable(infectionDeck);
	useMutable(discardDeck);

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
					drawCount
				);

				return { card, probability };
			})
			.sort((a, b) => b.probability - a.probability);
	}, [infectionNonce, drawCount]);

	const colors = useMemo(
		() => getAssortmentColors(infectionDeck.cards.slice(0, drawCount)),
		[infectionNonce, drawCount]
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
		<div className="App">
			<div>
				<label>
					Draw Count
					<input
						type="number"
						min="1"
						value={drawCount}
						onChange={(e) => {
							setDrawCount(parseInt(e.target.value));
						}}
					/>
				</label>
				<button
					onClick={() => {
						setDrawCount((d) => d - 1);
					}}
				>
					-
				</button>
				<button
					onClick={() => {
						setDrawCount((d) => d + 1);
					}}
				>
					+
				</button>
			</div>
			<button
				onClick={() => {
					if (infectionDeck.cards.length === 0) return;

					if (nextDrawOptions.length > 0) setTopDrawFormVisible(true);
					else {
						const stack = infectionDeck
							.remove(0, 1)
							.map(Assortment.reveal);

						discardDeck.insert(stack, 0);
					}
				}}
			>
				Draw Top
			</button>
			<button
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
			>
				Draw Bottom
			</button>
			<button
				onClick={() => {
					discardDeck.shuffle();

					const cards = discardDeck.remove(
						0,
						discardDeck.cards.length
					);

					infectionDeck.insert(cards, 0);
				}}
			>
				Shuffle and Restack
			</button>
			<button
				onClick={() => {
					const data = JSON.stringify(
						{
							infectionDeck: infectionDeck.toJson(),
							discardDeck: discardDeck.toJson(),
							drawCount,
						},
						null,
						2
					);
					const blob = new Blob([data], { type: 'application/json' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'deck.json';
					a.click();
					URL.revokeObjectURL(url);
					a.remove();
				}}
			>
				Export
			</button>
			<button
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
							0
						);
						infecDec.remove(0, infecDec.cards.length);
						infectionDeck.name = infecDec.name;

						const discDec = Deck.fromJson(json.discardDeck);
						discardDeck.remove(0, discardDeck.cards.length);
						discardDeck.insert(
							discDec.cards as unknown as IPossibleCard[],
							0
						);
						discDec.remove(0, discDec.cards.length);
						discardDeck.name = discDec.name;

						setDrawCount(json.drawCount);
					};
					input.click();
				}}
			>
				Import
			</button>
			<button
				onClick={() => {
					const data = JSON.stringify(
						infectionDeck.toJson(),
						null,
						2
					);

					setEditDeckData(data);
					setEditDeckFormVisible(true);
				}}
			>
				Edit Infction Deck
			</button>

			<ol>
				{cardDrawProbabilities.map(({ card, probability }, index) => {
					const color = [...colors.entries()]
						.filter(([assortment]) => assortment.cards.has(card))
						.map(([, color]) => color);
					return (
						<li key={index}>
							<CardBase
								style={{
									width: '400px',
									height: '1.5rem',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									background: createStripeyBackground(color),
								}}
							>
								<h3>{card.name}</h3>
								<p>{(probability * 100).toFixed(2)}%</p>
							</CardBase>
						</li>
					);
				})}
			</ol>
			<div
				style={{
					display: 'flex',
					gap: '2rem',
					position: 'relative',
					height: '100vh',
					width: 'fit-content',
					isolation: 'isolate',
				}}
			>
				<div
					style={{
						width: '400px',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<h2>{infectionDeck.name}</h2>
					<DeckView deck={infectionDeck} />
				</div>
				<div
					style={{
						width: '400px',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<h2>{discardDeck.name}</h2>
					<DeckView deck={discardDeck} />
				</div>
			</div>
			<Popup visible={editDeckFormVisible}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const json = Deck.fromJson(JSON.parse(editDeckData));
						infectionDeck.remove(0, infectionDeck.cards.length);
						infectionDeck.insert(
							json.cards as unknown as IPossibleCard[],
							0
						);
						infectionDeck.name = json.name;
						setEditDeckFormVisible(false);
					}}
				>
					<textarea
						value={editDeckData}
						style={{ width: '90vw', height: '80vh' }}
						onChange={(e) => {
							setEditDeckData(e.target.value);
						}}
					></textarea>
					<button type="submit">Save</button>
					<button
						type="button"
						onClick={() => {
							setEditDeckFormVisible(false);
						}}
					>
						Cancel
					</button>
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
								new Assortment(new Map([[card, 1]]))
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
								new Assortment(new Map([[card, 1]]))
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
			<select
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
			</select>
			<button type="submit">Draw</button>
			<button type="button" onClick={onCancel}>
				Done
			</button>
		</form>
	);
}

interface AssortedCardGroup {
	card: IReadonlyPossibleCard;
	count: number;
}

function groupByAssortment(
	cards: readonly IReadonlyPossibleCard[]
): AssortedCardGroup[] {
	const result: AssortedCardGroup[] = [];

	for (const card of cards) {
		if (result.length === 0) {
			result.push({ count: 1, card });
			continue;
		} else if (result[result.length - 1].card === card) {
			result[result.length - 1].count++;
		} else {
			result.push({ count: 1, card });
		}
	}

	return result;
}

function getAssortmentColors(
	deck: readonly IReadonlyPossibleCard[]
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
function DeckView({ deck }: { deck: IDeck }) {
	const deckNonce = useMutable(deck);
	const groupedCards = useMemo(
		() => groupByAssortment(deck.cards),
		[deckNonce]
	);

	const colors = useMemo(() => getAssortmentColors(deck.cards), [deckNonce]);

	return (
		<div>
			<ol>
				{groupedCards.map(({ card, count }, index) => (
					<li key={index}>
						<CardBase
							style={{
								height:
									(1 + Math.min(count, 6) * 0.75).toFixed(1) +
									'rem',
								backgroundColor:
									card instanceof Assortment
										? colors.get(card)
										: undefined,
							}}
						>
							{card instanceof Card
								? card.name
								: `1 of ${Assortment.getTotalCardCount(
										card
								  )} cards`}{' '}
							x{count}
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

function Popup({
	visible,
	children,
}: {
	visible: boolean;
	children: React.ReactNode;
}) {
	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				width: '100vw',
				height: '100vh',
				background: '#0008',
				display: visible ? 'flex' : 'none',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			{children}
		</div>
	);
}

export default App;
