import { useState } from 'react'
import { Plus, Trash2, Edit2, X, Eye, EyeOff, Save } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const COURSES = ['JEE', 'NEET', 'MHT-CET']

export function StudentManagementPanel({ students = [], onAdd, onUpdate, onDelete, isLoading }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showPasswords, setShowPasswords] = useState({})
  const [addingNew, setAddingNew] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    course: 'JEE',
  })
  const [error, setError] = useState('')

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.username || !newStudent.password) {
      setError('All fields are required!')
      return
    }

    const studentData = {
      name: newStudent.name,
      email: newStudent.email,
      username: newStudent.username,
      password: newStudent.password,
      course: newStudent.course,
    }

    await onAdd(studentData)
    setNewStudent({
      name: '',
      email: '',
      username: '',
      password: '',
      course: 'JEE',
    })
    setAddingNew(false)
    setError('')
  }

  const startEdit = (student) => {
    setEditingId(student.id)
    setEditData(student)
  }

  const saveEdit = async (id) => {
    await onUpdate(id, editData)
    setEditingId(null)
    setEditData({})
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this student account?')) {
      onDelete(id)
    }
  }

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">👥 Student Management</h2>
          <p className="text-sm text-slate-600 mt-1">Total Students: {students.length}</p>
        </div>
        {!addingNew && (
          <button
            onClick={() => setAddingNew(true)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
          >
            <Plus className="h-5 w-5" /> Add Student
          </button>
        )}
      </div>

      {/* Add New Student Form */}
      {addingNew && (
        <GlassCard className="p-6 border-2 border-[#D90429]">
          <h3 className="font-bold text-slate-900 mb-4">Create New Student Account</h3>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="Username"
              value={newStudent.username}
              onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newStudent.password}
              onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <select
              value={newStudent.course}
              onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddStudent}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
            >
              Create Student
            </button>
            <button
              onClick={() => setAddingNew(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-900 hover:border-[#D90429]"
            >
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Students Table */}
      <div className="overflow-x-auto">
        <GlassCard>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Password</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Course</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No students yet. Click "Add Student" to create one.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                    {/* Name */}
                    <td className="px-4 py-3">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{student.name}</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm">
                      {editingId === student.id ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                      ) : (
                        student.email
                      )}
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3 text-sm">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          className="w-full rounded border border-slate-300 px-2 py-1"
                        />
                      ) : (
                        student.username
                      )}
                    </td>

                    {/* Password */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {editingId === student.id ? (
                          <input
                            type={showPasswords[student.id] ? 'text' : 'password'}
                            value={editData.password}
                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                            className="flex-1 rounded border border-slate-300 px-2 py-1"
                          />
                        ) : (
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                            {showPasswords[student.id] ? student.password : '••••••••'}
                          </span>
                        )}
                        <button
                          onClick={() => togglePasswordVisibility(student.id)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          {showPasswords[student.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-4 py-3 text-sm">
                      {editingId === student.id ? (
                        <select
                          value={editData.course}
                          onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                          className="rounded border border-slate-300 px-2 py-1"
                        >
                          {COURSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-[#D90429]">{student.course}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {editingId === student.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(student.id)}
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-slate-600 hover:text-slate-800"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(student)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>📚 Student Accounts:</strong> Create accounts here with username and password. Students use these to login at /student-login and see materials for their course. All students automatically have access to both Class 11 and Class 12 materials.
        </p>
      </div>
    </div>
  )
}
