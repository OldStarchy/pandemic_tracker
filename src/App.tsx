/* eslint-disable react-hooks/exhaustive-deps */
import {
	faArrowTurnUp,
	faArrowUp,
	faFileExport,
	faFileImport,
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
import { CardSelectList } from './components/CardSelectList';
import { DeckView } from './components/DeckView';
import { DrawProbabilityCalculator } from './components/DrawProbabilityCalculator';
import { Popup } from './components/Popup';
import { Button } from './components/common/Button';
import { H2 } from './components/common/Typography';
import CreateCardForm from './components/form/CreateCardForm';
import { SelectCardForm } from './components/form/SelectCardForm';
import { setDrawCount, setPopupVisible, useAppState } from './context/AppState';
import { useStatusBarContext } from './context/StatusBarMessageContext';
import DeckUtil from './context/universe/DeckUtil';
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
import { useDeck } from './hooks/useDeck';
import { createSave, loadSave } from './lib/SaveFormat';
import { getAutosave, saveToAutosave } from './lib/autosave';
import { DISCARD_DECK, INFECTION_DECK } from './lib/consts';

function App() {
	const [appState, dispatchAppState] = useAppState();
	const { drawCount, drawTopPickerVisible, drawBottomPickerVisible } =
		appState;

	const setDrawTopPickerVisible = (v: boolean) =>
		dispatchAppState(setPopupVisible('top', v));
	const setDrawBottomPickerVisible = (v: boolean) =>
		dispatchAppState(setPopupVisible('bottom', v));
	const setDrawww = useCallback<Dispatch<SetStateAction<number>>>(
		(count) => dispatchAppState(setDrawCount(count)),
		[],
	);

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
			setDrawww(data.drawCount);
			setStatusBarMessage('Autosave loaded');
			dispatch(clearHistory());
			setEnableAutoSave(true);
		} else {
			dispatch(createDeck(INFECTION_DECK));
			dispatch(createDeck(DISCARD_DECK));

			dispatch(
				createCards(
					INFECTION_DECK,
					0,
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

	const infectionDeck = useDeck(INFECTION_DECK);
	const discardDeck = useDeck(DISCARD_DECK);

	const canShuffleInfectionDeck = useMemo(
		() => DeckUtil.canShuffle(infectionDeck),
		[infectionDeck?.items],
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
							setDrawww(drawCount);
						};
						input.click();
					}}
				>
					Import <FontAwesomeIcon icon={faFileImport} />
				</Button>
			</section>
			<DrawProbabilityCalculator />
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

						setDrawTopPickerVisible(true);
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

						setDrawBottomPickerVisible(true);
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
							cardPrefix={(_card, index) => {
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
			<Popup visible={drawTopPickerVisible}>
				<SelectCardForm
					options={Array.from(new Set(nextDrawOptions ?? []))}
					onCancel={() => {
						setDrawTopPickerVisible(false);
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
			<Popup visible={drawBottomPickerVisible}>
				<SelectCardForm
					options={Array.from(new Set(nextBottomDrawOptions ?? []))}
					onCancel={() => {
						setDrawBottomPickerVisible(false);
					}}
					onSelectCard={(card) => {
						dispatch(
							moveCard(INFECTION_DECK, -1, DISCARD_DECK, 0, 1),
						);
						dispatch(revealCard(DISCARD_DECK, 0, card));
						dispatch(setKeyframe());

						setDrawBottomPickerVisible(false);
					}}
				/>
			</Popup>
		</div>
	);
}

export default App;
