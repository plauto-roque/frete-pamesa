"use client";

export function Header() {
  return (
    <header className="h-16 bg-surface fixed top-0 right-0 left-60 z-10 border-b border-outline-variant flex items-center justify-between px-8">
      <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant w-80">
        <span className="material-symbols-outlined msym-lg text-on-surface-variant">search</span>
        <input
          className="bg-transparent border-none text-sm text-on-surface w-full outline-none placeholder:text-on-surface-variant/60"
          placeholder="Buscar fretes, clientes..."
          type="text"
        />
      </div>
      <div className="flex items-center gap-5">
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined msym-lg">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined msym-lg">settings</span>
        </button>
      </div>
    </header>
  );
}
