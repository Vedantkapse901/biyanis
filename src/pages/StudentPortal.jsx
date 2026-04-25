import { useContext, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';

function getPortalCategory(item) {
  const raw = String(item?.examType || item?.classLevel || '').trim().toUpperCase();
  if (raw === 'JEE') return 'JEE';
  if (raw === 'NEET') return 'NEET';
  if (raw === 'MHT-CET' || raw === 'MHTCET' || raw === 'MHT CET') return 'MHT-CET';
  if (raw === '11TH' || raw === '11') return 'JEE';
  if (raw === '12TH' || raw === '12') return 'NEET';
  return 'JEE';
}

export function StudentPortal() {
  const { data } = useContext(AppContext);
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('studentAuth') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/student-login" replace />;
  }

  const portalDocs = Array.isArray(data?.studentPortal) ? data.studentPortal : [];

  const docsJee = useMemo(() => portalDocs.filter((d) => getPortalCategory(d) === 'JEE'), [portalDocs]);
  const docsNeet = useMemo(() => portalDocs.filter((d) => getPortalCategory(d) === 'NEET'), [portalDocs]);
  const docsCet = useMemo(() => portalDocs.filter((d) => getPortalCategory(d) === 'MHT-CET'), [portalDocs]);

  const [activeClass, setActiveClass] = useState('JEE');
  const activeDocs =
    activeClass === 'JEE' ? docsJee : activeClass === 'NEET' ? docsNeet : docsCet;

  const renderDocList = (docs) => {
    if (!docs.length) {
      return <p className="text-sm font-medium text-slate-500">No documents uploaded yet.</p>;
    }

    return (
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-[#0A0F2C]">{doc.title || 'Untitled document'}</p>
              <p className="text-xs text-slate-500">{doc.fileType || 'PDF'}</p>
            </div>
            {doc.documentUrl ? (
              <a
                href={doc.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[#D90429] hover:underline"
              >
                Open
              </a>
            ) : (
              <span className="text-xs font-semibold text-slate-400">No file</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row">
            <div>
              <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-5xl">Student Portal</h1>
              <p className="text-lg text-slate-600">
                Access class-wise documents uploaded by admin for IIT JEE, NEET, and CET.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('studentAuth');
                sessionStorage.removeItem('studentUser');
                navigate('/student-login', { replace: true });
              }}
              className="relative z-[51] rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-[#0A0F2C] transition-colors hover:border-[#D90429] hover:text-[#D90429]"
            >
              Logout
            </button>
          </div>

          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveClass('JEE')}
                className={`rounded-xl border px-5 py-3 font-bold transition-colors ${
                  activeClass === 'JEE'
                    ? 'border-[#D90429] bg-[#D90429]/10 text-[#0A0F2C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D90429]'
                }`}
              >
                JEE
              </button>
              <button
                type="button"
                onClick={() => setActiveClass('NEET')}
                className={`rounded-xl border px-5 py-3 font-bold transition-colors ${
                  activeClass === 'NEET'
                    ? 'border-[#D90429] bg-[#D90429]/10 text-[#0A0F2C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D90429]'
                }`}
              >
                NEET
              </button>
              <button
                type="button"
                onClick={() => setActiveClass('MHT-CET')}
                className={`rounded-xl border px-5 py-3 font-bold transition-colors ${
                  activeClass === 'MHT-CET'
                    ? 'border-[#D90429] bg-[#D90429]/10 text-[#0A0F2C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D90429]'
                }`}
              >
                MHT-CET
              </button>
            </div>

            <GlassCard className="w-full border-t-4 border-t-[#D90429] bg-white">
              <div className="mb-4">
                <h2 className="font-serif text-2xl font-bold text-[#0A0F2C]">{activeClass}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Documents for {activeClass} exam.
                </p>
              </div>
              {renderDocList(activeDocs)}
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
