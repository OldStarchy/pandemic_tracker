import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { CardBase } from './components/CardBase';
import { CardSelectList } from './components/CardSelectList';
import { cities } from './data/cities';
import { Assortment } from './lib/Assortment';
import { Card } from './lib/Card';
import { Config } from './lib/Config';
import { Selection } from './lib/Selection';

function App() {
	const config = useMemo(() => Config.createDefault(), []);

	const [masterDeck, setMasterDeck] = useState<Assortment>(() =>
		Assortment.clone(config.masterDeck)
	);

	const [masterDeckSelection, setMasterDeckSelection] = useState<
		Record<string, number>
	>({});

	const [discardDeck, setDiscardDeck] = useState<Assortment>(() => ({
		name: 'Discard Deck',
		cards: [],
	}));

	const [discardDeckSelection, setDiscardDeckSelection] = useState<
		Record<string, number>
	>({});

	const [drawCount, setDrawCount] = useState(1);

	const [addCardPopupVisible, setAddCardPopupVisible] = useState(false);

	return (
		<div className="App">
			<div>
				<label>
					Draw Count
					<input
						type="number"
						min="1"
						value={drawCount}
						onChange={(e) => setDrawCount(parseInt(e.target.value))}
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
					<h2>{masterDeck.name}</h2>
					<CardSelectList
						style={{ flexGrow: 1 }}
						cards={masterDeck.cards}
						selectedCards={masterDeckSelection}
						setSelectedCards={setMasterDeckSelection}
						drawCount={drawCount}
					/>
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
						gap: '1rem',
						marginTop: '5rem',
					}}
				>
					<button
						onClick={() => {
							const { from, to } = Assortment.moveCards(
								masterDeck,
								discardDeck,
								masterDeckSelection,
								true
							);
							setMasterDeck(from);
							setDiscardDeck(to);
							setMasterDeckSelection({});
						}}
						disabled={Object.values(masterDeckSelection).every(
							(count) => count === 0
						)}
					>
						Move to discard -&gt;
					</button>
					<button
						onClick={() => {
							const { from, to } = Assortment.moveCards(
								discardDeck,
								masterDeck,
								discardDeckSelection,
								false
							);
							setDiscardDeck(from);
							setMasterDeck(to);
							setDiscardDeckSelection({});
						}}
						disabled={Object.values(discardDeckSelection).every(
							(count) => count === 0
						)}
					>
						&lt;- Move to Master Deck
					</button>

					<button
						onClick={() => {
							const selection = Selection.from(discardDeck.cards);

							const { from, to } = Assortment.moveCards(
								discardDeck,
								masterDeck,
								selection,
								false
							);

							setDiscardDeck(from);
							setMasterDeck(to);
						}}
					>
						&lt;&lt;- Move all to Master Deck
					</button>

					<button
						onClick={() => {
							if (!window.confirm('Are you sure?')) return;

							let newMasterDeck = Assortment.removeCards(
								masterDeck.cards,
								masterDeckSelection,
								false
							);

							setMasterDeck({
								name: 'Discard Deck',
								cards: newMasterDeck,
							});
							setMasterDeckSelection({});
						}}
					>
						Delete
					</button>

					<button
						onClick={() => {
							setAddCardPopupVisible(true);
						}}
					>
						Add New
					</button>

					<button
						onClick={() => {
							if (!window.confirm('Are you sure?')) return;

							//TODO: use "default deck" rather than "saved" deck
							setMasterDeck(Assortment.clone(config.masterDeck));
							setMasterDeckSelection({});
							setDiscardDeck({ ...discardDeck, cards: [] });
							setDiscardDeckSelection({});
						}}
					>
						Reset
					</button>
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
					<CardSelectList
						style={{ flexGrow: 1 }}
						cards={discardDeck.cards}
						selectedCards={discardDeckSelection}
						setSelectedCards={setDiscardDeckSelection}
					/>
				</div>
			</div>
			<Popup
				visible={addCardPopupVisible}
				setVisible={setAddCardPopupVisible}
			>
				<AddCardForm
					onAddCard={(card) => {
						setMasterDeck({
							...masterDeck,
							cards: Assortment.simplify(
								...masterDeck.cards,
								card
							),
						});
						setAddCardPopupVisible(false);
					}}
					onCancel={() => {
						setAddCardPopupVisible(false);
					}}
				/>
			</Popup>
		</div>
	);
}

function AddCardForm({
	onAddCard,
	onCancel,
}: {
	onAddCard: (card: Card) => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState('');
	const [type, setType] = useState('City');
	const [count, setCount] = useState(1);

	const handleSubmit = useCallback(() => {
		switch (type) {
			case 'City':
				if (name === '') return;
				const hasImage = cities.includes(name);
				onAddCard({
					name,
					type: 'City',
					count,
					image: hasImage ? `/images/cities/${name}.png` : undefined,
				});
				break;
			case 'Epidemic':
				onAddCard({
					name: 'Epidemic',
					type: 'Epidemic',
					count,
					image: '/images/epidemic.png',
				});
				break;

			case 'Other':
				if (name === '') return;
				onAddCard({ name, type: 'Other', count });
				break;
		}
	}, [onAddCard, name, type, count]);

	return (
		<CardBase>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<datalist id="cities">
					{cities.map((city) => (
						<option value={city} key={city} />
					))}
				</datalist>

				<label>
					Type
					<select
						required
						value={type}
						onChange={(e) => {
							setType(e.target.value);
						}}
					>
						<option value="City">City</option>
						<option value="Epidemic">Epidemic</option>
						<option value="Other">Other</option>
					</select>
				</label>
				{type === 'City' && (
					<label>
						Name
						<input
							required
							type="text"
							list={type === 'City' ? 'cities' : undefined}
							value={name}
							onChange={(e) => {
								setName(e.target.value);
							}}
						/>
					</label>
				)}

				<label>
					Count
					<input
						required
						type="number"
						min="1"
						value={count}
						onChange={(e) => {
							setCount(parseInt(e.target.value));
						}}
					/>
				</label>

				<button type="submit">Add</button>
				<button type="button" onClick={onCancel}>
					Cancel
				</button>
			</form>
		</CardBase>
	);
}

function Popup({
	visible,
	setVisible,
	children,
}: {
	visible: boolean;
	setVisible: (visible: boolean) => void;
	children: React.ReactNode;
}) {
	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
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
