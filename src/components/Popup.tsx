import React from 'react';

export function Popup({
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
			<div
				style={{
					background: 'black',
					padding: '1rem',
					borderRadius: '0.5rem',
					boxShadow: '0 0 1rem black',
				}}
			>
				{children}
			</div>
		</div>
	);
}
