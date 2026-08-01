import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';

const root = createRoot(document.getElementById('root')!);

async function bootstrap(): Promise<void> {
  const { App } = await import('@/app/App');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Невідома помилка запуску застосунку.';
  root.render(
    <main
      style={{
        display: 'grid',
        minHeight: '100vh',
        placeItems: 'center',
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#f8fafc',
        color: '#0f172a',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: '#ffffff',
          border: '1px solid #fecaca',
          borderRadius: '1rem',
          padding: '2rem',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#15803d',
            marginBottom: '0.75rem',
          }}
        >
          LunchPoint
        </p>
        <h1
          style={{ fontSize: '1.25rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.75rem' }}
        >
          Помилка конфігурації
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#475569', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
          {message}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Створіть файл <code>.env.local</code> на основі <code>.env.example</code> і вкажіть
          значення Firebase Console.
        </p>
      </div>
    </main>,
  );
});
