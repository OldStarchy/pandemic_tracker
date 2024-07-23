import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faInfoCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useMemo, useState } from 'react';
import { StatusBarMessageProvider } from '../../context/StatusBarMessageContext';
import { Popup } from '../Popup';
import { Button } from '../common/Button';
import { H2, H3, Link, Span } from '../common/Typography';

export function MainLayout({ children }: { children: ReactNode }) {
	const [showWhatsNew, setShowWhatsNew] = useState(() => {
		const dismissed = localStorage.getItem('whats_new.version_dismissed');
		const sha = import.meta.env.VITE_GIT_SHA;
		const shouldShow = dismissed !== (sha ?? 'dev');
		return shouldShow;
	});

	const newIssueLink = useMemo(() => {
		const newIssueLink = new URL(
			`https://github.com/OldStarchy/pandemic_tracker/issues/new`,
		);

		newIssueLink.searchParams.append(
			'body',
			(import.meta.env.VITE_GIT_SHA
				? `Version: ${import.meta.env.VITE_GIT_SHA}\n\n`
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
					<button
						title="View what's new"
						onClick={() => setShowWhatsNew(true)}
					>
						<FontAwesomeIcon icon={faNewspaper} />
					</button>
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

					<Popup visible={showWhatsNew}>
						<section
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '0.5rem',
							}}
						>
							<H2>Whats New</H2>
							<section>
								<H3>New backend</H3>
								<p>
									The backend now uses immutable state with
									react's useReducer. This also means the undo
									stack has been fully reimplemented and is no
									longer janky!
								</p>
							</section>
							<section>
								<H3>Card Management</H3>
								<p>
									You can now create and destroy cards without
									manually editing the exported save file! Use
									the forms at the bottom of the page.
								</p>
							</section>
							<section>
								<H3>Autosave</H3>
								<p>Everything gets saved automatically now!</p>
								<p>
									Opening this app in multiple tabs will have
									unpredictable results! (I don't recommend
									doing it!)
								</p>
							</section>
							<section>
								<H3>What's New Section</H3>
								<p>Its now a button in the header!</p>
							</section>
							<section>
								<H3>UI impovements</H3>
								<p>Everything looks slightly better now!</p>
							</section>
							<section>
								<H3>Hints in the Footer!</H3>
								<p>
									Sometimes there will be hints in the footer!
								</p>
							</section>
							<section
								style={{
									display: 'flex',
									gap: 'var(--gap-buttons)',
								}}
							>
								<Button
									onClick={() => {
										localStorage.setItem(
											'whats_new.version_dismissed',
											import.meta.env.VITE_GIT_SHA ??
												'dev',
										);
										setShowWhatsNew(false);
									}}
								>
									Mark as Read
								</Button>
								<Button onClick={() => setShowWhatsNew(false)}>
									Close
								</Button>
							</section>
						</section>
					</Popup>
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
				{import.meta.env.DEV && <Span>Dev Mode</Span>}
			</footer>
		</div>
	);
}
