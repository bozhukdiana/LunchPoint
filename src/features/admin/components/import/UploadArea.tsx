import { useRef } from 'react';

type UploadAreaProps = {
  onFile: (file: File) => void;
  disabled?: boolean;
};

export function UploadArea({ onFile, disabled }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    ) {
      onFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = '';
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        disabled
          ? 'border-slate-200 bg-slate-50 opacity-60'
          : 'cursor-pointer border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
      }`}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => event.key === 'Enter' && !disabled && inputRef.current?.click()}
      aria-label="Завантажити Excel-файл"
    >
      <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 5.072 5.572 5.25 5.25 0 0 1-5.25 5.25H6.75Z" />
      </svg>
      <div>
        <p className="font-semibold text-slate-800">Перетягніть файл сюди або натисніть для вибору</p>
        <p className="mt-1 text-sm text-slate-500">Підтримується формат .xlsx</p>
      </div>
      <input
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
