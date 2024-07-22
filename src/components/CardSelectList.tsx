import fuzzy from 'fuzzy';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { CardSelectToggle } from './CardSelectToggle';
import { Button } from './common/Button';
import { Input } from './common/Input';

export function CardSelectList({
	cards,
	selectedCards,
	setSelectedCards,
	style,
	...props
}: {
	cards: Record<string, number>;
	selectedCards: Record<string, number>;
	setSelectedCards: Dispatch<SetStateAction<Record<string, number>>>;
} & React.ComponentProps<'div'>) {
	const [filter, setFilter] = useState('');
	const [filterExact, setFilterExact] = useState(false);

	const filteredCards = useMemo(() => {
		const filtered =
			filter === ''
				? Object.entries(cards)
				: select(Object.entries(cards), {
						name: filter,
						fuzzy: !filterExact,
				  });
		filtered.sort(([a], [b]) => a.localeCompare(b));
		return filtered;
	}, [cards, filter, filterExact]);

	return (
		<div
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				...style,
			}}
			{...props}
		>
			<section
				style={{
					display: 'flex',
					gap: 'var(--gap-buttons)',
					flexWrap: 'wrap',
				}}
			>
				<Button
					onClick={() => {
						setSelectedCards(cards);
					}}
				>
					Select all
				</Button>
				<Button
					onClick={() => {
						setSelectedCards({});
					}}
				>
					Select none
				</Button>
				<Button
					onClick={() => {
						setSelectedCards((selection) =>
							subtract(cards, selection),
						);
					}}
				>
					Invert selection
				</Button>
				<section style={{ display: 'flex', gap: 'var(--gap-buttons)' }}>
					<Input
						label="Filter"
						statusBarMessage="Type to filter cards"
						type="text"
						value={filter}
						onChange={(e) => {
							setFilter(e.target.value);
						}}
					/>
					<Input
						label="Exact"
						type="checkbox"
						checked={filterExact}
						onChange={(e) => {
							setFilterExact(e.target.checked);
						}}
					/>
				</section>
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
						setSelectedCards(Object.fromEntries(filteredCards));
					}}
				>
					Set selection to current
				</Button>
				<Button
					onClick={() => {
						setSelectedCards((selection) =>
							subtract(
								selection,
								Object.fromEntries(filteredCards),
							),
						);
					}}
				>
					Remove current from selection
				</Button>
			</section>
			<ul
				style={{
					flexGrow: 1,
					listStyle: 'none',
					padding: 0,
					margin: 0,
					display: 'grid',
					gridTemplateColumns: '1fr',
					gridAutoRows: 'min-content',
					gap: '0.25rem',
					alignItems: 'center',
					justifyContent: 'flex-start',
					overflow: 'auto',
					minHeight: 0,
					paddingRight: '15px',
				}}
			>
				{filteredCards.map(([cardName, cardCount]) => {
					return (
						<li key={cardName} style={{ display: 'contents' }}>
							<CardSelectToggle
								cardName={cardName}
								cardCount={cardCount}
								selected={
									selectedCards &&
									(selectedCards[cardName] ?? 0)
								}
								setSelected={(count) => {
									setSelectedCards((selectedCards) => {
										const newSelectedCards = {
											...selectedCards,
										};

										if (count === 0) {
											delete newSelectedCards[cardName];
										} else {
											newSelectedCards[cardName] = count;
										}

										return newSelectedCards;
									});
								}}
							/>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

/**
 * Removes {@link b} from {@link from}. {@link from} is not modified.
 *
 * @throws {Error} If {@link b} contains cards not in {@link from}.
 */
function subtract(
	from: Record<string, number>,
	b: Record<string, number>,
): Record<string, number> {
	const result = { ...from };

	for (const [name, count] of Object.entries(b)) {
		if (result[name] === undefined) continue;

		const resultCount = (result[name] ?? 0) - count;

		if (resultCount > 0) {
			result[name] = resultCount;
		} else {
			delete result[name];
		}
	}

	return result;
}

function select(
	cards: [cardName: string, cardCount: number][],
	filter: Readonly<{ name: string; fuzzy?: boolean }>,
): [cardName: string, cardCount: number][] {
	if ('name' in filter) {
		if (filter.fuzzy) {
			return fuzzy
				.filter(filter.name, cards, {
					extract: (card) => card[0],
				})
				.map((result) => result.original);
		}
		return cards.filter(([cardName]) => cardName === filter.name);
	}
	return cards;
}
