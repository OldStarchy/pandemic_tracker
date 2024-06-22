import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MainLayout } from './components/layout/MainLayout';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

//TODO: set baseurl for deployment
console.log(process.env.FOOBAR);

root.render(
	<React.StrictMode>
		<MainLayout>
			<App />
		</MainLayout>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
