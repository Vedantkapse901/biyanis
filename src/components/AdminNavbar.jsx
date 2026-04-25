import { LogOut, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminNavbar({ activeTab, onTabChange, onLogout }) {
  const tabs = [
    { id: 'slides', label: 'Slides', icon: '🎬' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'results', label: 'Results', icon: '🏆' },
    { id: 'branches', label: 'Branches', icon: '🏢' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'freeDownloads', label: 'Downloads', icon: '⬇️' },
    { id: 'studentPortal', label: 'Student Docs', icon: '📄' },
    { id: 'studentPortalStudents', label: 'Manage Students', icon: '👥' },
    { id: 'storage', label: 'Cloud Storage', icon: '☁️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Admin Label */}
          <div className="flex items-center gap-2 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D90429] text-white font-bold text-sm">
              A
            </div>
            <span className="font-bold text-[#0A0F2C]">Admin Panel</span>
          </div>

          {/* Main Navigation Tabs - Scrollable */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors flex items-center gap-1 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-[#D90429] text-[#D90429]'
                      : 'text-slate-600 hover:text-[#D90429]'
                  }`}
                  title={tab.label}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pl-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-[#0A0F2C] transition-colors hover:border-[#D90429] hover:text-[#D90429]"
              title="Back to home"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
