import { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogOut, Plus, Trash2, Bot, AlertTriangle, Save } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AppContext } from '../context/AppContext';
import { defaultData } from '../data/defaultData';
import { appId, storage, useFirebase } from '../lib/firebase';
import { GlassCard } from './ui/GlassCard';
import { ThemeButton } from './ui/ThemeButton';

function getPortalCategory(item) {
  const raw = String(item?.examType || item?.classLevel || '').trim().toUpperCase();
  if (raw === 'JEE') return 'JEE';
  if (raw === 'NEET') return 'NEET';
  if (raw === 'MHT-CET' || raw === 'MHTCET' || raw === 'MHT CET') return 'MHT-CET';
  // Backward compatibility for older saved data.
  if (raw === '11TH' || raw === '11') return 'JEE';
  if (raw === '12TH' || raw === '12') return 'NEET';
  return 'JEE';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isMediaField(tab, key, item) {
  if (tab === 'slides' && key === 'url') return true;
  if (tab === 'results' && key === 'image') return true;
  if (tab === 'gallery' && (key === 'url' || key === 'thumbnail')) return true;
  if ((key === 'url' || key === 'image' || key === 'thumbnail') && (item.type === 'image' || item.type === 'video')) {
    return true;
  }
  return false;
}

function getMediaAccept(tab, key, item) {
  if (tab === 'slides' && key === 'url') return item.type === 'video' ? 'video/*' : 'image/*';
  if (tab === 'results' && key === 'image') return 'image/*';
  if (tab === 'gallery') {
    if (key === 'thumbnail') return 'image/*';
    if (key === 'url') return item.type === 'video' ? 'video/*' : 'image/*';
  }
  return 'image/*,video/*';
}

export function AdminPanel() {
  const [auth, setAuth] = useState(sessionStorage.getItem('adminAuth') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { data, setData } = useContext(AppContext);
  const [draftData, setDraftData] = useState(data);
  const [activeTab, setActiveTab] = useState('slides');
  const [activePortalClass, setActivePortalClass] = useState('JEE');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    setDraftData(data);
  }, [data]);

  const hasUnsavedChanges = useMemo(() => JSON.stringify(draftData) !== JSON.stringify(data), [draftData, data]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Biyanis@123') {
      setAuth(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleLogout = () => {
    setAuth(false);
    sessionStorage.removeItem('adminAuth');
  };

  const saveToWebsite = () => {
    setData(draftData);
    setSaveStatus('Changes saved to website.');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Some users may already have saved older/invalid shapes in localStorage/cloud.
  // Keep admin robust by treating non-arrays as empty arrays.
  const getTabData = (tab) => (Array.isArray(draftData[tab]) ? draftData[tab] : []);

  const setTabData = (tab, nextArray) => {
    setDraftData((prev) => ({ ...prev, [tab]: nextArray }));
  };

  const getNewItemTemplate = (tab) => {
    switch (tab) {
      case 'slides':
        return { type: 'image', url: '', headline: 'New Slide', sub: '', cta: 'Click Here' };
      case 'courses':
        return { title: 'New Course', badge: 'New', duration: '1 Year', desc: 'Course description...' };
      case 'results':
        return { name: 'Student Name', score: 'Rank/Score', exam: 'JEE/NEET', year: new Date().getFullYear().toString(), image: '' };
      case 'branches':
        return { name: 'BRANCH NAME', phone: '+91 0000000000', address: 'Full address here', mapLink: 'https://maps.app.goo.gl/...' };
      case 'gallery':
        return { folder: 'New Folder', title: 'New Event', type: 'image', url: '', thumbnail: '', eventDate: new Date().toISOString().slice(0, 10), driveLink: 'https://drive.google.com/' };
      case 'freeDownloads':
        return { title: 'New Download', fileType: 'PDF', url: '' };
      case 'studentPortalStudents':
        return { name: 'New Student', username: '', password: '' };
      default:
        return { title: 'New Item' };
    }
  };

  const updateArrayItem = (key, id, field, value) => {
    const updated = getTabData(key).map((item) => (item.id === id ? { ...item, [field]: value } : item));
    setTabData(key, updated);
  };

  const updateSettingsField = (field, value) => {
    setDraftData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  const handleMediaUpload = async (tab, id, field, file) => {
    if (!file) return;

    // For student portal PDFs, upload to Firebase Storage so links work across devices.
    if (tab === 'studentPortal' && field === 'documentUrl' && useFirebase && storage) {
      try {
        setSaveStatus('Uploading PDF...');
        const safeName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const storagePath = `artifacts/${appId}/public/studentPortal/${id}/${safeName}`;
        const fileRef = ref(storage, storagePath);
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(fileRef, file, { contentType: file.type || 'application/pdf' });
          task.on(
            'state_changed',
            (snapshot) => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setSaveStatus(`Uploading PDF... ${pct}%`);
            },
            reject,
            resolve,
          );
        });
        const publicUrl = await getDownloadURL(fileRef);
        updateArrayItem(tab, id, field, publicUrl);
        updateArrayItem(tab, id, 'fileType', 'PDF');
        setSaveStatus('PDF uploaded. Click Save to Website to publish.');
        setTimeout(() => setSaveStatus(''), 2500);
        return;
      } catch (error) {
        console.error('Student PDF upload failed:', error);
        setSaveStatus('PDF upload failed. Check Firebase Storage rules or internet, then retry.');
        setTimeout(() => setSaveStatus(''), 4000);
        return;
      }
    }

    const dataUrl = await readFileAsDataUrl(file);
    updateArrayItem(tab, id, field, dataUrl);
  };

  const deleteArrayItem = (key, id) => {
    const updated = getTabData(key).filter((item) => item.id !== id);
    setTabData(key, updated);
  };

  const addArrayItem = (key, defaultObj) => {
    const items = getTabData(key);
    const newId = items.length > 0 ? Math.max(...items.map((d) => d.id)) + 1 : 1;
    setTabData(key, [...items, { id: newId, ...defaultObj }]);
  };

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4">
        <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
          <GlassCard className="w-full max-w-md border-t-4 border-t-[#D90429]">
            <div className="mb-8 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-[#0A0F2C]" />
              <h2 className="font-serif text-2xl font-bold text-[#0A0F2C]">Admin Access</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-[#0A0F2C] focus:border-[#D90429] focus:outline-none"
                />
                {error && <p className="mt-2 text-sm font-medium text-red-500">Incorrect password</p>}
              </div>
              <ThemeButton type="submit" className="w-full">
                Login to Dashboard
              </ThemeButton>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    'slides',
    'courses',
    'results',
    'branches',
    'gallery',
    'freeDownloads',
    'studentPortal',
    'studentPortalStudents',
    'settings',
  ];
  const currentItems = getTabData(activeTab);
  const studentPortalItems = getTabData('studentPortal');
  const studentPortalJeeItems = studentPortalItems.filter((d) => getPortalCategory(d) === 'JEE');
  const studentPortalNeetItems = studentPortalItems.filter((d) => getPortalCategory(d) === 'NEET');
  const studentPortalCetItems = studentPortalItems.filter((d) => getPortalCategory(d) === 'MHT-CET');
  const activeStudentPortalItems =
    activePortalClass === 'JEE'
      ? studentPortalJeeItems
      : activePortalClass === 'NEET'
        ? studentPortalNeetItems
        : studentPortalCetItems;

  const addStudentPortalItem = (examType) => {
    addArrayItem('studentPortal', {
      examType,
      title: `New ${examType} Document`,
      fileType: 'PDF',
      documentUrl: '',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] pt-20 md:flex-row">
      <div className="flex h-[calc(100vh-80px)] w-full flex-col overflow-y-auto bg-[#0A0F2C] md:fixed md:w-64">
        <div className="border-b border-white/10 p-6">
          <h2 className="font-serif text-xl font-bold text-white">Admin Dashboard</h2>
        </div>
        <div className="flex-1 py-4">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`w-full px-6 py-3 text-left transition-colors ${activeTab === t ? 'border-r-4 border-[#D90429] bg-[#D90429]/20 text-[#D90429]' : 'text-slate-300 hover:text-white'}`}
            >
              {t === 'studentPortal'
                ? 'Manage Student Portal'
                : t === 'studentPortalStudents'
                  ? 'Manage Students'
                  : `Manage ${t}`}
            </button>
          ))}
        </div>
        <div className="border-t border-white/10 p-4">
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-2 py-2 text-red-400 hover:text-red-300">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl font-bold capitalize text-[#0A0F2C]">
            {activeTab === 'studentPortal'
              ? 'Student Portal'
              : activeTab === 'studentPortalStudents'
                ? 'Students'
                : activeTab} Manager
          </h1>
          <div className="flex items-center gap-2">
            {activeTab !== 'settings' && activeTab !== 'studentPortal' && (
              <button
                type="button"
                onClick={() => addArrayItem(activeTab, getNewItemTemplate(activeTab))}
                className="flex items-center gap-2 rounded-lg bg-[#0A0F2C] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#D90429]"
              >
                <Plus className="h-4 w-4" /> Add New
              </button>
            )}
            <button
              type="button"
              onClick={saveToWebsite}
              disabled={!hasUnsavedChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save to Website
            </button>
          </div>
        </div>

        {saveStatus && <p className="mb-4 text-sm font-semibold text-green-700">{saveStatus}</p>}
        {hasUnsavedChanges && <p className="mb-4 text-xs text-amber-700">You have unsaved changes. Click Save to Website.</p>}

        {activeTab === 'settings' ? (
          <div className="space-y-6">
            <GlassCard className="border-l-4 border-l-[#0A0F2C] bg-white">
              <h2 className="mb-4 font-serif text-xl font-bold text-[#0A0F2C]">Site settings</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ['tagline', 'Tagline'],
                  ['whatsapp', 'WhatsApp (digits, country code without +)'],
                  ['reviewLink', 'Google review / maps link'],
                ].map(([field, label]) => (
                  <div key={field} className={field === 'reviewLink' ? 'md:col-span-2' : ''}>
                    <label className="mb-1 block text-xs font-bold text-slate-500">{label}</label>
                    <input
                      type="text"
                      value={draftData.settings[field] ?? ''}
                      onChange={(e) => updateSettingsField(field, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-[#0A0F2C] outline-none focus:border-[#D90429]"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="hidden border-l-4 border-l-[#D90429] bg-white">
              <h2 className="mb-2 flex items-center gap-2 font-serif text-xl font-bold text-[#0A0F2C]">
                <Bot className="h-6 w-6 text-[#D90429]" /> AI (Gemini) - Tutor & Review Assistant
              </h2>
              <p className="mb-4 text-sm text-slate-600">Create a key at Google AI Studio and paste it here.</p>
              <label className="mb-1 block text-xs font-bold text-slate-500">Gemini API key</label>
              <input
                type="password"
                autoComplete="off"
                value={draftData.settings.geminiApiKey || ''}
                onChange={(e) => updateSettingsField('geminiApiKey', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-[#0A0F2C] outline-none focus:border-[#D90429]"
                placeholder="AIza..."
              />
            </GlassCard>

            <GlassCard className="border-l-4 border-l-red-500 bg-white">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-600">
                <AlertTriangle className="h-6 w-6" /> Danger Zone
              </h2>
              <p className="mb-6 text-slate-600">Reset loads default template into draft. Save to Website to apply.</p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Load default template into draft? Click Save to Website to apply.')) {
                    setDraftData(defaultData);
                  }
                }}
                className="rounded-lg bg-red-500 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-red-600"
              >
                Load Factory Defaults (Draft)
              </button>
            </GlassCard>
          </div>
        ) : activeTab === 'studentPortal' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setActivePortalClass('JEE')}
                className={`rounded-xl border px-5 py-3 font-bold transition-colors ${
                  activePortalClass === 'JEE'
                    ? 'border-[#D90429] bg-[#D90429]/10 text-[#0A0F2C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D90429]'
                }`}
              >
                JEE
              </button>
              <button
                type="button"
                onClick={() => setActivePortalClass('NEET')}
                className={`rounded-xl border px-5 py-3 font-bold transition-colors ${
                  activePortalClass === 'NEET'
                    ? 'border-[#D90429] bg-[#D90429]/10 text-[#0A0F2C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D90429]'
                }`}
              >
                NEET
              </button>
              <button
                type="button"
                onClick={() => setActivePortalClass('MHT-CET')}
                className={`rounded-xl border px-5 py-3 font-bold transition-colors ${
                  activePortalClass === 'MHT-CET'
                    ? 'border-[#D90429] bg-[#D90429]/10 text-[#0A0F2C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D90429]'
                }`}
              >
                MHT-CET
              </button>
            </div>

            <GlassCard className="border-l-4 border-l-[#0A0F2C] bg-white">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-bold text-[#0A0F2C]">{activePortalClass}</h2>
                <button
                  type="button"
                  onClick={() => addStudentPortalItem(activePortalClass)}
                  className="flex items-center gap-2 rounded-lg bg-[#0A0F2C] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#D90429]"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {activeStudentPortalItems.length ? (
                <div className="space-y-4">
                  {activeStudentPortalItems.map((item) => (
                    <GlassCard key={item.id} className="bg-white">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <label className="mb-1 block text-xs font-bold text-slate-500">Title</label>
                          <input
                            type="text"
                            value={item.title ?? ''}
                            onChange={(e) => updateArrayItem('studentPortal', item.id, 'title', e.target.value)}
                            className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-[#D90429]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteArrayItem('studentPortal', item.id)}
                          className="mt-5 text-red-500 hover:text-red-700"
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Document (PDF)</label>
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={(e) =>
                            handleMediaUpload('studentPortal', item.id, 'documentUrl', e.target.files?.[0])
                          }
                          className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs"
                        />

                        {item.documentUrl ? (
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <a
                              href={item.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-[#D90429] hover:underline"
                            >
                              Open
                            </a>
                            <span className="text-xs font-semibold text-slate-500">Uploaded</span>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-slate-500">No file uploaded</p>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500">No {activePortalClass} documents uploaded yet.</p>
              )}
            </GlassCard>
          </div>
        ) : (
          <div className="space-y-6">
            {currentItems.map((item) => (
              <GlassCard key={item.id} className="bg-white">
                <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4">
                  <span className="font-bold text-[#0A0F2C]">ID: {item.id}</span>
                  <button type="button" onClick={() => deleteArrayItem(activeTab, item.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.keys(item)
                    .filter((k) => k !== 'id')
                    .map((key) => {
                      const value = item[key];
                      const isBoolean = typeof value === 'boolean';
                      const isNumber = typeof value === 'number';
                      const mediaField = isMediaField(activeTab, key, item);
                      return (
                        <div key={key}>
                          <label className="mb-1 block text-xs font-bold capitalize text-slate-500">{key}</label>
                          {mediaField ? (
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept={getMediaAccept(activeTab, key, item)}
                                onChange={(e) => handleMediaUpload(activeTab, item.id, key, e.target.files?.[0])}
                                className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs"
                              />
                              {value && String(value).startsWith('data:image') && (
                                <img src={value} alt="preview" className="h-16 w-16 rounded object-cover" />
                              )}
                              {value && String(value).startsWith('data:video') && (
                                <video src={value} className="h-20 w-32 rounded object-cover" controls preload="metadata" />
                              )}
                            </div>
                          ) : isBoolean ? (
                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                              <input type="checkbox" checked={Boolean(value)} onChange={(e) => updateArrayItem(activeTab, item.id, key, e.target.checked)} />
                              Enabled
                            </label>
                          ) : (
                            <input
                              type={isNumber ? 'number' : key === 'password' ? 'password' : 'text'}
                              value={value ?? ''}
                              onChange={(e) => updateArrayItem(activeTab, item.id, key, isNumber ? Number(e.target.value || 0) : e.target.value)}
                              className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-[#0A0F2C] outline-none focus:border-[#D90429]"
                              placeholder=""
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
