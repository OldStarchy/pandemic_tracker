import { ReactNode } from 'react';

export function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100vw',
				height: '100vh',
				isolation: 'isolate',
			}}
		>
			<header>This is a header</header>
			<main style={{ flexGrow: 1 }}>{children}</main>
			<footer>This is a footer</footer>
		</div>
	);
}
