import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useMemo } from 'react';
import { Link } from '../common/Link';

export function MainLayout({ children }: { children: ReactNode }) {
	const newIssueLink = useMemo(() => {
		const newIssueLink = new URL(
			`https://github.com/OldStarchy/pandemic_tracker/issues/new`
		);

		newIssueLink.searchParams.append(
			'body',
			(process.env.REACT_APP_GIT_SHA
				? `Version: ${process.env.REACT_APP_GIT_SHA}\n\n`
				: '') + '<!-- Write your issue here -->'
		);

		return newIssueLink;
	}, []);

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
					fontSize: '2rem',
				}}
			>
				<h1>Pandemic Tracker</h1>
				<div>
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
			<main style={{ flexGrow: 1, overflow: 'auto' }}>{children}</main>
			<footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
				<Link href={newIssueLink.toString()} target="_BLANK">
					Report an issue
				</Link>
			</footer>
		</div>
	);
}
