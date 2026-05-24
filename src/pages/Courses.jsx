import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useCourses } from '../hooks/useSupabaseData';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { CourseCard } from '../components/CourseCard';
import { AccentText } from '../components/ui/AccentText';

const EXAM_TYPES = ['JEE Main', 'JEE Advanced', 'NEET', 'MHT-CET'];

// Define subjects for each exam type
const SUBJECTS_BY_EXAM = {
  'JEE Main': ['Physics', 'Chemistry', 'Mathematics'],
  'JEE Advanced': ['Physics', 'Chemistry', 'Mathematics'],
  'NEET': ['Physics', 'Chemistry', 'Biology'],
  'MHT-CET': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

export function Courses() {
  const { data: courses, loading } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExams, setSelectedExams] = useState([]); // Multiple selection
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const activeCourses = courses?.filter((c) => c.status === 'active') || [];

  // Get available subjects based on selected exams
  const getAvailableSubjects = () => {
    if (selectedExams.length === 0) {
      // If no exam selected, show all subjects
      return ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];
    }

    // MHT-CET with anything = all subjects
    if (selectedExams.includes('MHT-CET')) {
      return ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];
    }

    // NEET with anything (but not MHT-CET) = NEET restrictions
    if (selectedExams.includes('NEET')) {
      return ['All', 'Physics', 'Chemistry', 'Biology'];
    }

    // JEE Main/Advanced only = JEE restrictions
    return ['All', 'Physics', 'Chemistry', 'Mathematics'];
  };

  const availableSubjects = getAvailableSubjects();

  // Reset subject if it's not available in newly selected exams
  useEffect(() => {
    if (selectedSubject !== 'All' && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject('All');
    }
  }, [selectedExams, availableSubjects, selectedSubject]);

  const filteredCourses = useMemo(() => {
    let filtered = activeCourses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Exam type filter - course matches if ANY selected exam is in course exam_type
    if (selectedExams.length > 0) {
      filtered = filtered.filter((course) => {
        const courseExams = Array.isArray(course.exam_type) ? course.exam_type : [course.exam_type];
        return selectedExams.some(exam => courseExams.includes(exam));
      });
    }

    // Subject filter
    if (selectedSubject !== 'All') {
      filtered = filtered.filter((course) => course.subject === selectedSubject);
    }

    // Difficulty level filter
    if (selectedLevel !== 'All') {
      filtered = filtered.filter((course) => course.difficulty_level === selectedLevel);
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest')
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return (a.display_order || 0) - (b.display_order || 0);
    });

    return filtered;
  }, [activeCourses, searchQuery, selectedExams, selectedSubject, selectedLevel, sortBy]);

  const handleExamChange = (exam) => {
    setSelectedExams(prev => {
      if (prev.includes(exam)) {
        // Unchecking an exam
        return prev.filter(e => e !== exam);
      } else {
        // Checking an exam - apply restrictions
        if (exam === 'NEET' && (prev.includes('JEE Main') || prev.includes('JEE Advanced'))) {
          // Cannot add NEET if JEE is selected
          alert('❌ NEET cannot be selected with JEE Main/Advanced');
          return prev;
        }
        if ((exam === 'JEE Main' || exam === 'JEE Advanced') && prev.includes('NEET')) {
          // Cannot add JEE if NEET is selected
          alert('❌ JEE Main/Advanced cannot be selected with NEET');
          return prev;
        }
        return [...prev, exam];
      }
    });
  };

  const handleEnroll = (courseId) => {
    alert(`✅ Enrolled in course! (Feature coming soon)`);
  };

  // Show loading state
  if (loading) {
    return (
      <PageTransition>
        <div className="page-shell bg-[#F8F9FA] flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading courses...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-shell bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
              Master Your <AccentText>Exams</AccentText>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Choose from our carefully curated courses designed by India's top educators.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, instructors..."
                className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-900 placeholder-slate-500 focus:border-[#D90429] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Exam Types - Multiple Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Type (Select Multiple)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {EXAM_TYPES.map((exam) => (
                  <label key={exam} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExams.includes(exam)}
                      onChange={() => handleExamChange(exam)}
                      className="w-4 h-4 rounded border-slate-300 text-[#D90429]"
                    />
                    <span className="text-sm font-medium text-slate-700">{exam}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remaining Filters */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Subject - Dynamic based on selected exams */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-[#D90429] focus:outline-none"
                >
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject === 'All' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-[#D90429] focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-[#D90429] focus:outline-none"
                >
                  <option value="popular">Popular</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-600">
              Showing <span className="text-[#D90429]">{filteredCourses.length}</span> of{' '}
              <span className="text-[#D90429]">{activeCourses.length}</span> courses
            </p>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <p className="text-lg font-semibold text-slate-600 mb-2">No courses found</p>
              <p className="text-slate-500">Try adjusting your filters or search query</p>
            </GlassCard>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
