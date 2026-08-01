type ImportButtonProps = {
  canImport: boolean;
  isImporting: boolean;
  onImport: () => void;
};

export function ImportButton({ canImport, isImporting, onImport }: ImportButtonProps) {
  return (
    <button
      className="rounded-lg bg-emerald-700 px-6 py-2.5 font-semibold text-white disabled:opacity-60 hover:bg-emerald-800"
      disabled={!canImport || isImporting}
      onClick={onImport}
      type="button"
    >
      {isImporting ? 'Імпорт…' : 'Розпочати імпорт'}
    </button>
  );
}
