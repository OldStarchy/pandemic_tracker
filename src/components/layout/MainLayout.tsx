import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useMemo, useState } from 'react';
import { StatusBarMessageProvider } from '../../context/StatusBarMessageContext';
import { Link, Span } from '../common/Typography';

const devMode = process.env.NODE_ENV === 'development';

export function MainLayout({ children }: { children: ReactNode }) {
	const newIssueLink = useMemo(() => {
		const newIssueLink = new URL(
			`https://github.com/OldStarchy/pandemic_tracker/issues/new`,
		);

		newIssueLink.searchParams.append(
			'body',
			(process.env.REACT_APP_GIT_SHA
				? `Version: ${process.env.REACT_APP_GIT_SHA}\n\n`
				: '') + '<!-- Write your issue here -->',
		);

		return newIssueLink;
	}, []);

	const [statusBarMessage, setStatusBarMessage] = useState<string | null>(
		null,
	);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: '100vw',
				height: '100dvh',
				isolation: 'isolate',
			}}
		>
			<header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					fontSize: '1.5rem',
					padding: '0.5rem',
				}}
			>
				<h1>Pandemic Tracker</h1>
				<div style={{ marginRight: '-0.5rem' }}>
					<Link
						href="https://github.com/OldStarchy/pandemic_tracker"
						target="_BLANK"
						aria-label="Open the Pandemic Legacy project on GitHub in a new tab"
						title="Open the Pandemic Legacy project on GitHub in a new tab"
					>
						<FontAwesomeIcon icon={faGithub} />
					</Link>
				</div>
			</header>
			<main
				style={{
					flexGrow: 1,
					overflow: 'auto',
					padding: '0 0.5rem',
				}}
			>
				<StatusBarMessageProvider value={setStatusBarMessage}>
					{children}
				</StatusBarMessageProvider>
			</main>
			<footer>
				<Span>
					{statusBarMessage && (
						<>
							<FontAwesomeIcon icon={faInfoCircle} />{' '}
						</>
					)}
					{statusBarMessage}
				</Span>
			</footer>
			<footer
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					flexDirection: 'row-reverse',
				}}
			>
				<Link href={newIssueLink.toString()} target="_BLANK">
					Report an issue or suggest a feature
				</Link>
				{devMode && <Span>Dev Mode</Span>}
			</footer>
		</div>
	);
}
