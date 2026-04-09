import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
	faInfoCircle,
	faNewspaper,
	faRedo,
	faUndo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useMemo, useState } from 'react';
import { StatusBarMessageProvider } from '../../context/StatusBarMessageContext';
import {
	useCanUndo,
	useUniverse,
} from '../../context/universe/UniverseContext';
import { redoAction, undoAction } from '../../context/withUndoReducer';
import { Popup } from '../Popup';
import { Button } from '../common/Button';
import { H2, H3, Hr, Link, Para, Span } from '../common/Typography';

export function MainLayout({ children }: { children: ReactNode }) {
	const [_universe, dispatch] = useUniverse();
	const { canUndo, canRedo } = useCanUndo();

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
					gap: 'var(--gap-buttons)',
					padding: '0.5rem',
					borderBottom: '1px solid #ccc',
					alignItems: 'center',
				}}
			>
				<Button
					onClick={() => dispatch(undoAction())}
					disabled={!canUndo}
				>
					<FontAwesomeIcon icon={faUndo} />
				</Button>
				<Button
					onClick={() => dispatch(redoAction())}
					disabled={!canRedo}
				>
					<FontAwesomeIcon icon={faRedo} />
				</Button>
				<h1 style={{ flexGrow: 1, fontSize: '1.5rem' }}>
					Pandemic Tracker
				</h1>
				<div style={{ marginRight: '-0.5rem', fontSize: '1.5rem' }}>
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
					padding: '0.5rem 0.5rem 0',
				}}
			>
				<StatusBarMessageProvider value={setStatusBarMessage}>
					{children}

					<Popup
						visible={showWhatsNew}
						style={{
							border: '1px solid #ccc',
							margin: '1rem',
							height: '80dvh',
						}}
					>
						<section
							style={{
								display: 'flex',
								height: '100%',
								flexDirection: 'column',
								gap: '0.5rem',
								lineHeight: 1.4,
								alignItems: 'stretch',
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<H2>Whats New</H2>
								<span>{import.meta.env.VITE_GIT_SHA}</span>
							</div>
							<section
								style={{
									overflowY: 'auto',
								}}
							>
								<section>
									<H3>Added the Exile Deck</H3>
									<Para>
										A new deck that can be used to exile
										cards from the game. You can exile cards
										by selecting "Exile" instead of "Draw"
										in the draw card popup.
									</Para>
									<Para>
										Exiled cards do not count towards any
										draw probability calculations. You can
										return the exiled cards to the Infection
										Deck with the "Shuffle and Restack"
										button.
									</Para>
								</section>
								<section>
									<H3>Moved Undo/Redo Buttons</H3>
									<Para>
										The undo and redo buttons have been
										moved the header to make them easier to
										find regardless of which page you're on.
									</Para>
								</section>
								<section>
									<H3>New Layout</H3>
									<Para>
										The deck display has been reworked a bit
										to use up less horizontal screen space.
										Decks will display side-by-side if there
										is enough room, otherwise they'll stack
										vertically.
									</Para>
									<Para>
										There's also a bit more vertical space
										with the addition of some dividers
										between sections.
									</Para>
									<H3>Card Groups</H3>
									<Para>
										Card groups are now marked with a "?",
										which is much shorter than "Group A" and
										omits the practically useless group
										names.
									</Para>
									<Para>
										However they can now be expanded to show
										the list of individal cards in the
										group.
									</Para>
									<H3>Deck Action Buttons</H3>
									<Para>
										Some of the deck-specific action buttons
										have also been moved under each deck's
										heading to make it clear which deck is
										getting shuffled and restacked.
									</Para>
								</section>
								<Hr />
								<H2>Old News</H2>
								<section>
									<H3>New backend</H3>
									<Para>
										The backend now uses immutable state
										with react's useReducer. This also means
										the undo stack has been fully
										reimplemented and is no longer janky!
									</Para>
								</section>
								<section>
									<H3>Card Management</H3>
									<Para>
										You can now create and destroy cards
										without manually editing the exported
										save file! Use the forms at the bottom
										of the page.
									</Para>
								</section>
								<section>
									<H3>Autosave</H3>
									<Para>
										Everything gets saved automatically now!
									</Para>
									<Para>
										Opening this app in multiple tabs will
										have unpredictable results! (I don't
										recommend doing it!)
									</Para>
								</section>
								<section>
									<H3>What's New Section</H3>
									<Para>Its now a button in the header!</Para>
								</section>
								<section>
									<H3>UI impovements</H3>
									<Para>
										Everything looks slightly better now!
									</Para>
								</section>
								<section>
									<H3>Hints in the Footer!</H3>
									<Para>
										Sometimes there will be hints in the
										footer!
									</Para>
								</section>
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
				<Span>{import.meta.env.VITE_GIT_SHA ?? 'Dev Mode'}</Span>
			</footer>
		</div>
	);
}
