import type { ReactNode } from 'react';

export type AppDestination = 'home' | 'library' | 'settings';

interface AppShellProps {
    mainContent: ReactNode;
    player: ReactNode;
    searchQuery: string;
    searchEnabled: boolean;
    activeDestination: AppDestination;
    onSearchQueryChange: (query: string) => void;
    onSearch: () => Promise<void>;
    onNavigate: (destination: AppDestination) => void;
}

export function AppShell({
    mainContent,
    player,
    searchQuery,
    searchEnabled,
    activeDestination,
    onSearchQueryChange,
    onSearch,
    onNavigate,
}: AppShellProps) {
    return (
        <div className="app-shell">
            <header className="top-bar">
                <strong>Resonance</strong>

                <form
                    className="top-bar-search"
                    role="search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void onSearch();
                    }}
                >
                    <label>
                        <span className="visually-hidden">Search</span>
                        <input
                            type="search"
                            placeholder="Search"
                            value={searchQuery}
                            disabled={!searchEnabled}
                            autoComplete="off"
                            spellCheck={false}
                            onChange={(event) =>
                                onSearchQueryChange(event.currentTarget.value)
                            }
                        />
                    </label>
                </form>
            </header>

            <aside className="sidebar">
                <nav aria-label="Main navigation">
                    <button
                        type="button"
                        aria-current={activeDestination === 'home' ? 'page' : undefined}
                        onClick={() => onNavigate('home')}
                    >Home
                    </button>

                    <button
                        type="button"
                        aria-current={activeDestination === 'library' ? 'page' : undefined}
                        onClick={() => onNavigate('library')}
                    >
                        Library
                    </button>

                    <button
                        type="button"
                        aria-current={activeDestination === 'settings' ? 'page' : undefined}
                        onClick={() => onNavigate('settings')}
                    >
                        Settings
                    </button>
                </nav>
            </aside>

            <main className="main-content">{mainContent}</main>

            <footer className="player-bar">{player}</footer>
        </div>
    );
}