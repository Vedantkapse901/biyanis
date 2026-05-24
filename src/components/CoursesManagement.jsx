import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { uploadAdminFile, buildStoragePath } from '../lib/mediaStorage';
import { buildB2DisplayUrl } from '../lib/b2MediaUrls';
import { friendlyError, userMessages } from '../lib/userMessages';
import { ResolvedImage } from './ResolvedImage';

const ALL_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
const EXAM_TYPES = ['JEE Main', 'JEE Advanced', 'NEET', 'MHT-CET'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = ['2 Weeks', '4 Weeks', '6 Weeks', '8 Weeks', '12 Weeks', '16 Weeks', '24 Weeks'];
const DISPLAY_POSITIONS = ['Featured (First)', 'Second', 'Third', 'Fourth', 'Regular'];

// Subject mapping for each exam type
const SUBJECTS_BY_EXAM = {
  'JEE Main': ['Physics', 'Chemistry', 'Mathematics'],
  'JEE Advanced': ['Physics', 'Chemistry', 'Mathematics'],
  'NEET': ['Physics', 'Chemistry', 'Biology'],
  'MHT-CET': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

export function CoursesManagement({ courses = [], onAdd, onUpdate, onDelete, loading = false }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const handleAddNew = () => {
    setFormData({
      title: '',
      exam_type: [],
      subject: [],
      price: 2999,
      original_price: 4999,
      description: '',
      instructor: '',
      duration: '12 Weeks',
      difficulty_level: 'Beginner',
      image_url: '',
      demo_video_url: '',
      what_you_learn: [''],
      requirements: [''],
      rating: 0,
      status: 'active',
      display_position: 'Regular',
    });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (course) => {
    setFormData({
      ...course,
      exam_type: Array.isArray(course.exam_type) ? course.exam_type : [course.exam_type || ''],
      subject: Array.isArray(course.subject) ? course.subject : [course.subject || ''],
      what_you_learn: Array.isArray(course.what_you_learn) ? course.what_you_learn : [course.what_you_learn || ''],
      requirements: Array.isArray(course.requirements) ? course.requirements : [course.requirements || ''],
    });
    setImagePreview(course.image_url ? buildB2DisplayUrl(course.image_url) : null);
    setEditingId(course.id);
    setShowForm(true);
  };

  const getAvailableSubjects = (examTypes) => {
    if (!examTypes || examTypes.length === 0) {
      return ALL_SUBJECTS;
    }

    // MHT-CET with anything = all subjects
    if (examTypes.includes('MHT-CET')) {
      return ALL_SUBJECTS;
    }

    // NEET with anything (but not MHT-CET) = NEET restrictions
    if (examTypes.includes('NEET')) {
      return ['Physics', 'Chemistry', 'Biology'];
    }

    // JEE Main/Advanced only = JEE restrictions
    return ['Physics', 'Chemistry', 'Mathematics'];
  };

  const availableSubjects = useMemo(() => {
    return getAvailableSubjects(formData?.exam_type);
  }, [formData?.exam_type]);

  const handleExamTypeChange = (examType) => {
    const current = formData.exam_type || [];
    let updatedExams;

    if (current.includes(examType)) {
      // Unchecking an exam type
      updatedExams = current.filter(e => e !== examType);
    } else {
      // Checking an exam type - apply restrictions
      if (examType === 'NEET' && (current.includes('JEE Main') || current.includes('JEE Advanced'))) {
        // Cannot add NEET if JEE is selected
        alert('❌ NEET cannot be selected with JEE Main/Advanced');
        return;
      }
      if ((examType === 'JEE Main' || examType === 'JEE Advanced') && current.includes('NEET')) {
        // Cannot add JEE if NEET is selected
        alert('❌ JEE Main/Advanced cannot be selected with NEET');
        return;
      }
      updatedExams = [...current, examType];
    }

    const newAvailableSubjects = getAvailableSubjects(updatedExams);
    // Filter selected subjects to only include available ones
    const newSubjects = (formData.subject || []).filter(s => newAvailableSubjects.includes(s));

    setFormData({
      ...formData,
      exam_type: updatedExams,
      subject: newSubjects,
    });
  };

  const handleSubjectChange = (subjectName) => {
    const current = formData.subject || [];
    if (current.includes(subjectName)) {
      setFormData({
        ...formData,
        subject: current.filter(s => s !== subjectName),
      });
    } else {
      setFormData({
        ...formData,
        subject: [...current, subjectName],
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      setImageUploading(true);
      const storagePath = buildStoragePath('courses', file.name);
      const { url, storageRef } = await uploadAdminFile({ storagePath, file, contentType: file.type });
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, image_url: storageRef }));
    } catch (err) {
      console.error('Course image upload failed:', err);
      alert(friendlyError(err, userMessages.uploadFailed));
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    // Convert display_position to numeric order
    const positionMap = {
      'Featured (First)': 0,
      'Second': 1,
      'Third': 2,
      'Fourth': 3,
      'Regular': 99,
    };

    const payload = {
      ...formData,
      title: (formData.title || '').trim() || 'Untitled Course',
      exam_type: formData.exam_type || [],
      subject: formData.subject || [],
      display_order: positionMap[formData.display_position] || 99,
      what_you_learn: (formData.what_you_learn || []).filter(item => item.trim()),
      requirements: (formData.requirements || []).filter(item => item.trim()),
    };

    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onAdd(payload);
    }

    setShowForm(false);
    setFormData(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this course?')) {
      await onDelete(id);
    }
  };

  const calculateDiscount = () => {
    if (!formData?.price || !formData?.original_price) return 0;
    return Math.round(((formData.original_price - formData.price) / formData.original_price) * 100);
  };

  if (!formData && showForm) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0A0F2C]">Courses Management</h2>
        {!showForm && (
          <button
            onClick={handleAddNew}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
          >
            <Plus className="h-5 w-5" /> Add Course
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && formData && (
        <GlassCard className="p-6 border-t-4 border-t-[#D90429]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0A0F2C]">{editingId ? 'Edit Course' : 'Add New Course'}</h3>
              <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Course Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Course Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Complete JEE Physics"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Exam Types (Multiple Selection) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Exam Types (Select Multiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {EXAM_TYPES.map((exam) => (
                      <label key={exam} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.exam_type || []).includes(exam)}
                          onChange={() => handleExamTypeChange(exam)}
                          className="w-4 h-4 rounded border-slate-300 text-[#D90429] focus:border-[#D90429]"
                        />
                        <span className="text-sm text-slate-700">{exam}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subject (Multiple Selection Checkboxes) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Subjects (Select Multiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableSubjects.map((subject) => (
                      <label key={subject} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.subject || []).includes(subject)}
                          onChange={() => handleSubjectChange(subject)}
                          className="w-4 h-4 rounded border-slate-300 text-[#D90429] focus:border-[#D90429]"
                        />
                        <span className="text-sm text-slate-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Instructor */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="e.g., Dr. John Smith"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  >
                    {DURATIONS.map((dur) => (
                      <option key={dur} value={dur}>{dur}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Difficulty Level</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="2999"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Original Price (MRP) (₹)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                      placeholder="4999"
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                    />
                    {formData.original_price > formData.price && (
                      <div className="bg-[#D90429] text-white px-3 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
                        {calculateDiscount()}% OFF
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Course Thumbnail Image</label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-[#D90429] transition-colors">
                      {imageUploading ? (
                        <>
                          <Loader className="h-5 w-5 text-[#D90429] animate-spin" />
                          <span className="text-sm text-slate-600">Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-600">Click to upload image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <ResolvedImage
                        src={formData.image_url || imagePreview}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Demo Video URL */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Demo Video URL</label>
                  <input
                    type="url"
                    value={formData.demo_video_url}
                    onChange={(e) => setFormData({ ...formData, demo_video_url: e.target.value })}
                    placeholder="https://youtube.com/... or drive link"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Display Position (Instead of Display Order) */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Display Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DISPLAY_POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setFormData({ ...formData, display_position: pos })}
                        className={`text-sm px-3 py-2 rounded-lg font-semibold transition-colors ${
                          formData.display_position === pos
                            ? 'bg-[#D90429] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will students learn? Course overview..."
                rows="3"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
              />
            </div>

            {/* What You'll Learn */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">What You'll Learn (one per line)</label>
              <textarea
                value={formData.what_you_learn.join('\n')}
                onChange={(e) => setFormData({ ...formData, what_you_learn: e.target.value.split('\n') })}
                placeholder="• Topic 1&#10;• Topic 2&#10;• Topic 3"
                rows="3"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">Requirements (one per line)</label>
              <textarea
                value={formData.requirements.join('\n')}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split('\n') })}
                placeholder="• Completed Class XI&#10;• Basic knowledge of topics"
                rows="3"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
              >
                {loading ? '💾 Saving...' : '💾 Save Course'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Courses Grid */}
      {!showForm && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <GlassCard key={course.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Image */}
                {course.image_url && (
                  <ResolvedImage
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A0F2C] text-lg">{course.title}</h3>
                    <p className="text-sm text-slate-600">
                      {Array.isArray(course.exam_type) ? course.exam_type.join(', ') : course.exam_type} • {Array.isArray(course.subject) ? course.subject.join(', ') : course.subject}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#D90429]">₹{course.price}</span>
                    {course.original_price > course.price && (
                      <>
                        <span className="text-sm line-through text-slate-500">₹{course.original_price}</span>
                        <span className="text-xs bg-[#D90429]/10 text-[#D90429] px-2 py-1 rounded font-bold">
                          {Math.round(((course.original_price - course.price) / course.original_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="text-sm text-slate-600 space-y-1">
                  <p>👨‍🏫 {course.instructor || 'TBD'}</p>
                  <p>⏱️ {course.duration}</p>
                  <p>📊 {course.difficulty_level}</p>
                </div>

                {/* Status Badge */}
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    course.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {course.status === 'active' ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {!showForm && courses.length === 0 && (
        <GlassCard className="p-12 text-center">
          <p className="text-slate-600 font-semibold">No courses yet. Create your first course!</p>
        </GlassCard>
      )}
    </div>
  );
}
