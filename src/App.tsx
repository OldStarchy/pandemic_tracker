/* eslint-disable react-hooks/exhaustive-deps */
import {
	faArrowTurnUp,
	faArrowUp,
	faChevronDown,
	faChevronUp,
	faEdit,
	faEllipsis,
	faFileExport,
	faFileImport,
	faMinus,
	faPlus,
	faRedo,
	faShuffle,
	faStar,
	faTrash,
	faUndo,
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
import { CardSelectList } from './components/CardSelectList';
import { DeckView } from './components/DeckView';
import { Popup } from './components/Popup';
import { Button } from './components/common/Button';
import { Input } from './components/common/Input';
import { Select } from './components/common/Select';
import { H2 } from './components/common/Typography';
import CreateCardForm from './components/form/CreateCardForm';
import { DISCARD_DECK, INFECTION_DECK, TEMP_DECK } from './consts';
import { useStatusBarContext } from './context/StatusBarMessageContext';
import { Card } from './context/universe/Card';
import CardUtil from './context/universe/CardUtil';
import { DeckItem } from './context/universe/Deck';
import DeckUtil from './context/universe/DeckUtil';
import { Group } from './context/universe/Group';
import { useCanUndo, useUniverse } from './context/universe/UniverseContext';
import {
	createCards,
	destroyCard,
} from './context/universe/actions/CardActions';
import {
	createDeck,
	moveCard,
	shuffleDeck,
} from './context/universe/actions/DeckActions';
import { revealCard } from './context/universe/actions/GroupActions';
import { load, reset } from './context/universe/actions/UniverseActions';
import {
	clearHistory,
	redoAction,
	setKeyframe,
	undoAction,
} from './context/withUndoReducer';
import { cities } from './data/cities';
import { createSave, loadSave } from './lib/SaveFormat';
import { getAutosave, saveToAutosave } from './lib/autosave';

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

function App() {
	const [drawCount, setDrawCountRaw] = useState(1);
	const [topDrawFormVisible, setTopDrawFormVisible] = useState(false);
	const [bottomDrawFormVisible, setBottomDrawFormVisible] = useState(false);
	const [editDeckFormVisible, setEditDeckFormVisible] = useState(false);

	const [editDeckData, setEditDeckData] = useState<string>('');

	const [expandDrawChanceList, setExpandDrawChanceList] = useState(false);

	const [universe, dispatch] = useUniverse();
	const { canUndo, canRedo } = useCanUndo();
	const setStatusBarMessage = useStatusBarContext();

	const [selectedCardsToDelete, setSelectedCardsToDelete] = useState<
		Record<string, number>
	>({});
	const cardNameCountMap = useMemo(() => {
		const cardNameCountMap: Record<string, number> = {};
		for (const card of universe.cards) {
			cardNameCountMap[card.name] =
				(cardNameCountMap[card.name] ?? 0) + 1;
		}
		return cardNameCountMap;
	}, [universe.cards]);

	const deleteSelectedCards = useCallback(() => {
		const selected = { ...selectedCardsToDelete };

		const idsToDelete: string[] = [];

		for (const card of universe.cards) {
			if (selected[card.name] > 0) {
				idsToDelete.push(card.id);
				selected[card.name] -= 1;
			}
		}

		setSelectedCardsToDelete({});
		dispatch(destroyCard(...idsToDelete));
		dispatch(setKeyframe());
	}, [selectedCardsToDelete, universe.cards]);

	const [enableAutoSave, setEnableAutoSave] = useState(false);
	useEffect(() => {
		dispatch(reset());

		const autosave = getAutosave();
		if (autosave) {
			const data = loadSave(JSON.parse(autosave));
			dispatch(load(data.universe));
			setDrawCount(data.drawCount);
			setStatusBarMessage('Autosave loaded');
			dispatch(clearHistory());
			setEnableAutoSave(true);
		} else {
			dispatch(createDeck(INFECTION_DECK));
			dispatch(createDeck(DISCARD_DECK));
			dispatch(createDeck(TEMP_DECK));

			dispatch(
				createCards(
					INFECTION_DECK,
					...Object.entries(cities).flatMap(([city, count]) =>
						new Array(count).fill(city),
					),
				),
			);
			dispatch(shuffleDeck(INFECTION_DECK));
			setEnableAutoSave(true);
		}

		dispatch(clearHistory());
	}, []);

	useEffect(() => {
		if (enableAutoSave) {
			saveToAutosave(JSON.stringify(createSave({ universe, drawCount })));
		}
	}, [universe, drawCount, enableAutoSave]);

	const infectionDeck = useMemo(
		() => universe.decks.find((deck) => deck.id === INFECTION_DECK),
		[universe.decks],
	);

	const discardDeck = useMemo(
		() => universe.decks.find((deck) => deck.id === DISCARD_DECK),
		[universe.decks],
	);

	const canShuffleInfectionDeck = useMemo(() => {
		if (!infectionDeck) return false;
		if (infectionDeck.items.length === 0) return false;

		if (infectionDeck.items.some((item) => item.type === 'card'))
			return true;

		const group = (infectionDeck.items[0] as DeckItem & { type: 'group' })
			.groupId;

		if (
			(infectionDeck.items as (DeckItem & { type: 'group' })[]).some(
				(item) => item.groupId !== group,
			)
		)
			return true;

		return false;
	}, [infectionDeck?.items]);

	const setDrawCount = useCallback<Dispatch<SetStateAction<number>>>(
		(count) => {
			setDrawCountRaw((c) =>
				Math.max(
					1,
					Math.min(
						infectionDeck?.items.length ?? Infinity,
						typeof count === 'number' ? count : count(c),
					),
				),
			);
		},
		[setDrawCountRaw, infectionDeck],
	);

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
			<section
				style={{
					display: 'flex',
					gap: 'var(--gap-buttons)',
					flexWrap: 'wrap',
				}}
			>
				<Button
					onClick={() => dispatch(undoAction())}
					disabled={!canUndo}
				>
					Undo <FontAwesomeIcon icon={faUndo} />
				</Button>
				<Button
					onClick={() => dispatch(redoAction())}
					disabled={!canRedo}
				>
					Redo <FontAwesomeIcon icon={faRedo} />
				</Button>
			</section>
			<section
				style={{
					display: 'flex',
					gap: 'var(--gap-buttons)',
					flexWrap: 'wrap',
				}}
			>
				<Button
					onClick={() => {
						const data = createSave({
							universe,
							drawCount,
						});
						const blob = new Blob(
							[JSON.stringify(data, undefined, 4)],
							{
								type: 'application/json',
							},
						);
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

							const { universe, drawCount } = loadSave(json);

							dispatch(load(universe));
							dispatch(setKeyframe());
							setDrawCount(drawCount);
						};
						input.click();
					}}
				>
					Import <FontAwesomeIcon icon={faFileImport} />
				</Button>
				<Button
					onClick={() => {
						const data = JSON.stringify(
							createSave({ universe, drawCount: 0 }).universe,
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
				<header style={{ display: 'flex', gap: '1rem' }}>
					<H2>Draw Chance</H2>
					{cardDrawProbabilities.length > 5 && (
						<Button
							type="button"
							onClick={() => setExpandDrawChanceList((e) => !e)}
						>
							<FontAwesomeIcon
								icon={
									expandDrawChanceList
										? faChevronUp
										: faChevronDown
								}
							/>
						</Button>
					)}
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
							setDrawCount((d) => d - 1);
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
					{cardDrawProbabilities
						.slice(0, expandDrawChanceList ? undefined : 5)
						.map(({ cardName, probability }, index) => {
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
						})}
					{!expandDrawChanceList &&
						cardDrawProbabilities.length > 5 && (
							<li key="more">
								<FontAwesomeIcon icon={faEllipsis} />
							</li>
						)}
				</ol>
			</section>
			<section
				style={{
					display: 'flex',
					gap: 'var(--gap-buttons)',
					flexWrap: 'wrap',
				}}
			>
				<Button
					onClick={() => {
						if (!infectionDeck || !nextDrawOptions) return;
						if (infectionDeck.items.length === 0) return;

						setTopDrawFormVisible(true);
					}}
					title="Draw Cards from the top of the deck"
					disabled={(infectionDeck?.items.length ?? 0) === 0}
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
					disabled={(infectionDeck?.items.length ?? 0) === 0}
				>
					Draw Bottom <FontAwesomeIcon icon={faArrowTurnUp} />
				</Button>
				<Button
					onClick={() => {
						dispatch(shuffleDeck(DISCARD_DECK));
						dispatch(
							moveCard(DISCARD_DECK, 0, INFECTION_DECK, 0, -1),
						);
						dispatch(setKeyframe());
					}}
					disabled={(discardDeck?.items.length ?? 0) === 0}
				>
					Shuffle and Restack <FontAwesomeIcon icon={faShuffle} />
				</Button>

				<Button
					onClick={() => {
						dispatch(shuffleDeck(INFECTION_DECK));
						dispatch(setKeyframe());
					}}
					disabled={!canShuffleInfectionDeck}
				>
					Shuffle the Infection Deck{' '}
					<FontAwesomeIcon icon={faShuffle} />
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
			<section>
				<H2>Create Cards</H2>
				<CreateCardForm />
			</section>
			<section>
				<H2>Delete Cards</H2>
				<Button onClick={deleteSelectedCards}>
					Delete Selected Cards <FontAwesomeIcon icon={faTrash} />
				</Button>
				<section style={{ padding: '1rem' }}>
					<CardSelectList
						cards={cardNameCountMap}
						selectedCards={selectedCardsToDelete}
						setSelectedCards={setSelectedCardsToDelete}
					/>
				</section>
			</section>
			<Popup visible={editDeckFormVisible}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const json = loadSave(
							JSON.parse(editDeckData),
						).universe;
						//TODO: Validate structure
						dispatch(load(json));
						dispatch(setKeyframe());
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
						dispatch(setKeyframe());
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
						dispatch(setKeyframe());

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
