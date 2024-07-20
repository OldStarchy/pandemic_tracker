import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MainLayout } from './components/layout/MainLayout';
import { UniverseProvider } from './context/UniverseContext';
import './index.css';
import reportWebVitals from './reportWebVitals';
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

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);

//TODO: set baseurl for deployment
// console.log(process.env.FOOBAR);

root.render(
	<React.StrictMode>
		<MainLayout>
			<UniverseProvider>
				<App />
			</UniverseProvider>
		</MainLayout>
	</React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
