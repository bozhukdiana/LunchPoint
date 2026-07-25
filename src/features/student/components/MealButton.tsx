type MealButtonProps = {
  isPending: boolean;
  onClick: () => void;
};

export function MealButton({ isPending, onClick }: MealButtonProps) {
  return (
    <button
      className="w-full rounded-xl bg-emerald-700 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isPending}
      onClick={onClick}
      type="button"
    >
      {isPending ? 'Збереження…' : '🍽️ Я харчувався'}
    </button>
  );
}
