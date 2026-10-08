import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorScreen } from './components/common/ErrorScreen.jsx'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.jsx'

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tunnel: `${import.meta.env.VITE_API_URL}/api/system/sentry-tunnel`
});

function ErrorFallback({error, resetError}) {
    return (
        <ErrorScreen
            errorText={error?.message || "An unexpected client-side error occurred."}
            onRetry={() => {
                resetError();
            }}
        />
    );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <Sentry.ErrorBoundary fallback={ErrorFallback}>
            <App />
        </Sentry.ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)