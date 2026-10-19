import prototype from './Folio.html?raw';

export default function App() {
  return (
    <main className="app-shell">
      <iframe
        className="prototype-frame"
        srcDoc={prototype}
        title="Folio"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
