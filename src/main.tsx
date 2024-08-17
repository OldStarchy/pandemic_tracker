import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { MainLayout } from './components/layout/MainLayout';
import { AppStateProvider } from './context/AppState.tsx';
import { UniverseProvider } from './context/universe/UniverseContext';
import './index.css';
import './reset.css';

Sentry.init({
	dsn: 'https://f90fa035261e910e125efd9ec29e8fd7@o4506370894200832.ingest.us.sentry.io/4507555106521088',
	integrations: [
		Sentry.browserTracingIntegration(),
		Sentry.replayIntegration(),
	],
	// Performance Monitoring
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
	tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<MainLayout>
			<UniverseProvider>
				<AppStateProvider>
					<App />
				</AppStateProvider>
			</UniverseProvider>
		</MainLayout>
	</React.StrictMode>,
);
