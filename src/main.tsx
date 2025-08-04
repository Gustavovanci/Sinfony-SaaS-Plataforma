import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import ToastProvider from './components/ToastProvider.tsx'
import { Toaster } from 'react-hot-toast'

// Configuração de desenvolvimento
if (import.meta.env.DEV) {
  console.log('🚀 Sinfony - Modo de Desenvolvimento');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                maxWidth: '400px',
              },
              success: {
                duration: 4000,
                style: {
                  background: '#10B981',
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#10B981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                  color: 'white',
                },
                iconTheme: {
                  primary: 'white',
                  secondary: '#EF4444',
                },
              },
              loading: {
                duration: Infinity,
                style: {
                  background: '#3B82F6',
                  color: 'white',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)