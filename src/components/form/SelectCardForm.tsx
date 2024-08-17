import { useEffect, useState } from 'react';
import { Card } from '../../context/universe/Card';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

export function SelectCardForm({
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
