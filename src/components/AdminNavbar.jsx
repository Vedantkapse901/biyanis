import { useState } from 'react';
import { LogOut, Home, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminNavbar({ activeTab, onTabChange, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'slides', label: 'Slides', icon: '🎬' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'results', label: 'Results', icon: '🏆' },
    { id: 'branches', label: 'Branches', icon: '🏢' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'studentPortal', label: 'Study Materials', icon: '📄' },
    { id: 'studentPortalStudents', label: 'Manage Students', icon: '👥' },
    { id: 'colorChange', label: 'Color Change', icon: '🎨' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 py-2 sm:py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D90429] text-sm font-bold text-white">
              A
            </div>
            <span className="truncate text-sm font-bold text-[#0A0F2C] sm:text-base">Admin Panel</span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="tap-target gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-[#0A0F2C] transition-colors hover:border-[#D90429] hover:text-[#D90429] sm:px-3 sm:text-sm"
              title="Back to home"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="tap-target gap-1.5 rounded-lg bg-red-500 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-600 sm:px-3 sm:text-sm"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              type="button"
              className="tap-target text-[#0A0F2C] md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-slate-100 md:block" aria-label="Admin sections">
          <div className="custom-scrollbar flex gap-1 overflow-x-auto py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#D90429] bg-[#D90429]/5 text-[#D90429]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0A0F2C]'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {menuOpen && (
          <nav
            className="custom-scrollbar max-h-[60vh] overflow-y-auto border-t border-slate-100 pb-3 pt-2 md:hidden"
            aria-label="Admin sections mobile"
          >
            <div className="grid grid-cols-1 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#D90429]/10 text-[#D90429]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
