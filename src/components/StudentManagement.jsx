import { useState } from 'react';
import { Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function StudentManagement({ students, onAddStudent, onUpdateStudent, onDeleteStudent, saveStatus, setSaveStatus }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const togglePassword = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSaveStatus('✓ Copied to clipboard!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const addNewStudent = () => {
    const newId = students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
    onAddStudent({
      id: newId,
      name: 'New Student',
      username: `student${newId}`,
      password: `pass${newId}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Student Button */}
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold text-[#0A0F2C]">Student Accounts</h2>
        <button
          type="button"
          onClick={addNewStudent}
          className="flex items-center gap-2 rounded-lg bg-[#0A0F2C] px-4 py-2 text-white transition-colors hover:bg-[#D90429]"
        >
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <GlassCard className="bg-white text-center py-12">
          <p className="text-slate-500 font-semibold">No students added yet</p>
          <p className="text-sm text-slate-400 mt-2">Click "Add Student" to create student accounts</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <GlassCard key={student.id} className="bg-white">
              <div className="flex items-center justify-between gap-4">
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D90429] text-white font-bold text-sm">
                      {String(student.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={student.name || ''}
                        onChange={(e) => onUpdateStudent(student.id, 'name', e.target.value)}
                        placeholder="Student Name"
                        className="block w-full font-bold text-[#0A0F2C] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#D90429] outline-none px-0 py-1"
                      />
                      <p className="text-xs text-slate-500">ID: {student.id}</p>
                    </div>
                  </div>
                </div>

                {/* Toggle Expand */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                  className="rounded bg-slate-100 px-3 py-2 text-sm font-bold text-[#0A0F2C] transition-colors hover:bg-slate-200"
                >
                  {expandedId === student.id ? 'Hide' : 'Show'} Details
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete student "${student.name}"?`)) {
                      onDeleteStudent(student.id);
                      setSaveStatus(`✓ Student deleted`);
                      setTimeout(() => setSaveStatus(''), 2000);
                    }
                  }}
                  className="rounded bg-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Expanded Details */}
              {expandedId === student.id && (
                <div className="mt-4 border-t border-slate-200 pt-4 space-y-4">
                  {/* Username */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">USERNAME</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={student.username || ''}
                        onChange={(e) => onUpdateStudent(student.id, 'username', e.target.value)}
                        placeholder="username"
                        className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-[#0A0F2C] outline-none focus:border-[#D90429]"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(student.username || '')}
                        className="rounded bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                        title="Copy username"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">PASSWORD</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showPasswords[student.id] ? 'text' : 'password'}
                        value={student.password || ''}
                        onChange={(e) => onUpdateStudent(student.id, 'password', e.target.value)}
                        placeholder="password"
                        className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-[#0A0F2C] outline-none focus:border-[#D90429]"
                      />
                      <button
                        type="button"
                        onClick={() => togglePassword(student.id)}
                        className="rounded bg-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-300"
                        title="Toggle password visibility"
                      >
                        {showPasswords[student.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(student.password || '')}
                        className="rounded bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                        title="Copy password"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="rounded bg-blue-50 p-3 text-xs text-blue-700">
                    <p className="font-bold">📝 Student Login Credentials</p>
                    <p className="mt-1">Share these credentials with the student:</p>
                    <p className="mt-2 font-mono bg-white rounded p-2 border border-blue-200">
                      Username: <strong>{student.username || 'username'}</strong> <br />
                      Password: <strong>{student.password || 'password'}</strong>
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Info Card */}
      <GlassCard className="border-l-4 border-l-green-500 bg-green-50">
        <h3 className="mb-2 font-bold text-green-900">✓ How Student Login Works</h3>
        <ul className="space-y-1 text-sm text-green-800">
          <li>• Add each student here with a unique username and password</li>
          <li>• Share these credentials with the student via email or in person</li>
          <li>• Students use these credentials to login at Student Portal page</li>
          <li>• Once logged in, students can access all PDFs for their exam category (JEE/NEET/MHT-CET)</li>
          <li>• Click "Save to Website" to publish student accounts</li>
        </ul>
      </GlassCard>
    </div>
  );
}
