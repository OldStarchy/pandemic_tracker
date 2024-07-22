import { useEffect, useState } from 'react';
import { CardBase } from './CardBase';

export function CardSelectToggle({
	cardName: cardName,
	cardCount,
	selected,
	setSelected,
}: {
	cardName: string;
	cardCount: number;
	selected: number;
	setSelected: (count: number) => void;
}) {
	selected = selected ?? 0;
	const unselected = cardCount - selected;

	const [visibleUnselected, setVisibleUnselected] = useState(unselected);

	useEffect(() => {
		if (selected !== 0) {
			setVisibleUnselected(cardCount - selected);
		} else {
			const timeout = setTimeout(() => {
				setVisibleUnselected(cardCount - selected);
			}, 100);

			return () => {
				clearTimeout(timeout);
			};
		}
	}, [selected, cardCount]);

	return (
		<div
			style={{
				position: 'relative',
				userSelect: 'none',
				color: cardCount === 0 ? 'gray' : undefined,
			}}
		>
			<CardBase
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'space-between',
					background: 'var(--color-background)',
				}}
			>
				<span>{visibleUnselected}</span>
				<span>0</span>
			</CardBase>
			<CardBase
				key={cardName}
				style={{
					marginLeft: selected > 0 ? '2rem' : 0,
					marginRight: selected > 0 ? 0 : '2rem',
					transition: `margin-left 0.1s ease-out, margin-right 0.1s ease-out`,
					cursor: cardCount > 0 ? 'pointer' : undefined,
					background: 'var(--color-background)',
				}}
				onClick={(e) => {
					if (cardCount === 0) return;

					if (e.shiftKey) {
						setSelected(selected === 0 ? cardCount : 0);
					} else {
						setSelected((selected + 1) % (cardCount + 1));
					}
				}}
			>
				<div
					style={{
						zIndex: 1,
						position: 'relative',
						display: 'flex',
						flexDirection: 'row',
						gap: '1rem',
					}}
				>
					<h3 style={{ flexGrow: 1 }}>{cardName}</h3>
					<p>x{selected > 0 ? selected : cardCount}</p>
				</div>
			</CardBase>
		</div>
	);
}
