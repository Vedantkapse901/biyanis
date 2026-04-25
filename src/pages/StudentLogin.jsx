import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { ThemeButton } from '../components/ui/ThemeButton';

export function StudentLogin() {
  const { data } = useContext(AppContext);
  const navigate = useNavigate();

  const students = useMemo(
    () => (Array.isArray(data?.studentPortalStudents) ? data.studentPortalStudents : []),
    [data],
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isLoggedIn = sessionStorage.getItem('studentAuth') === 'true';

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/student-portal', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const u = username.trim();
    const p = password;
    if (!u || !p) {
      setError('Please enter username and password.');
      return;
    }

    const match = students.find(
      (s) => String(s.username || '').trim() === u && String(s.password || '') === p,
    );

    if (!match) {
      setError('Invalid credentials.');
      return;
    }

    sessionStorage.setItem('studentAuth', 'true');
    sessionStorage.setItem('studentUser', u);
    setError('');
    navigate('/student-portal', { replace: true });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-serif text-4xl font-bold text-[#0A0F2C] md:text-5xl">Student Login</h1>
            <p className="text-slate-600">Login to access 11th & 12th documents.</p>
          </div>

          <GlassCard className="border-t-4 border-t-[#D90429] bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] outline-none focus:border-[#D90429]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] outline-none focus:border-[#D90429]"
                />
              </div>

              {error && <p className="text-center text-sm font-semibold text-red-600">{error}</p>}

              <ThemeButton type="submit" className="w-full">
                Access Student Portal
              </ThemeButton>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 font-bold text-[#0A0F2C] transition-colors hover:border-[#D90429] hover:text-[#D90429]"
              >
                Back to Home
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}

