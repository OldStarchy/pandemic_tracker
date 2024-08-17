import { FormEvent, memo, useMemo, useState } from 'react';
import { Card } from '../../context/universe/Card';
import {
	UniverseDispatch,
	useUniverse,
} from '../../context/universe/UniverseContext';
import { createCards } from '../../context/universe/actions/CardActions';
import { setKeyframe } from '../../context/withUndoReducer';
import { INFECTION_DECK } from '../../lib/consts';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export interface CreateCardDto {
	name: string;
}

const CreateCardFormImpl = memo(function CreateCardFormImpl({
	cards,
	dispatch,
}: {
	cards: readonly Card[];
	dispatch: UniverseDispatch;
}) {
	const [name, setName] = useState('');
	const [count, setCount] = useState(1);
	const [didEdit, setDidEdit] = useState(false);

	const cardCounts = useMemo(() => {
		const cardNames = Object.entries(
			cards.reduce(
				(acc, card) => {
					acc[card.name] = (acc[card.name] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			),
		);
		cardNames.sort((a, b) => a[0].localeCompare(b[0]));

		return cardNames;
	}, [cards]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		dispatch(
			createCards(INFECTION_DECK, 0, ...new Array(count).fill(name)),
		);
		dispatch(setKeyframe());
		setName('');
		setCount(1);
		setDidEdit(false);
	};

	const validationMessage = useMemo(() => {
		if (!didEdit) {
			return undefined;
		}

		if (name.length < 3) {
			return 'Name must be at least 3 characters long';
		}

		return undefined;
	}, [didEdit, name]);

	const dataList = useMemo(() => {
		return (
			<datalist id="existing-cards">
				{cardCounts.map(([cardName, count], index) => (
					<option key={index} value={cardName}>
						({count})
					</option>
				))}
			</datalist>
		);
	}, [cardCounts]);

	return (
		<form
			onSubmit={handleSubmit}
			style={{ display: 'flex', flexWrap: 'wrap' }}
		>
			{dataList}
			<Input
				label="Name"
				statusBarMessage={`What name will the new card${
					count === 1 ? '' : 's'
				} have?`}
				type="text"
				list="existing-cards"
				value={name}
				onChange={(e) => {
					setName(e.target.value);
					setDidEdit(true);
				}}
				required
				errorMessage={validationMessage}
			/>
			<Input
				label="Count"
				statusBarMessage={`How many ${
					name ? `"${name}" ` : ''
				}cards to create?`}
				type="number"
				value={count}
				onChange={(e) => setCount(parseInt(e.target.value, 10))}
				min={1}
			/>

			<Button type="submit">Create</Button>
		</form>
	);
});

export default function CreateCardForm() {
	const [universe, dispatch] = useUniverse();

	return <CreateCardFormImpl cards={universe.cards} dispatch={dispatch} />;
}
