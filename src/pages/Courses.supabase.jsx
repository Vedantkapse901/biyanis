import { motion } from 'framer-motion'
import { Star, Clock, BookOpen } from 'lucide-react'
import { useCourses } from '../hooks/useSupabaseData'
import { GlassCard } from '../components/ui/GlassCard'

export function Courses() {
  const { data: courses, loading, error } = useCourses()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-300 mx-auto mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-300"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Failed to load courses</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Our Courses</h1>
          <p className="mt-4 text-lg text-slate-600">
            Comprehensive programs designed for JEE, NEET, and MHT-CET success
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {courses.length > 0 ? (
            courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <GlassCard className="group h-full flex flex-col">
                  {/* Badge */}
                  {course.badge && (
                    <div className="mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4 fill-[#D90429] text-[#D90429]" />
                      <span className="text-xs font-semibold text-[#D90429] uppercase">
                        {course.badge}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#D90429] transition-colors">
                    {course.title}
                  </h3>

                  {/* Duration */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>

                  {/* Description */}
                  <p className="mt-4 flex-grow text-sm text-slate-600 leading-relaxed">
                    {course.description}
                  </p>

                  {/* CTA Button */}
                  <button className="mt-6 w-full rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white transition-all hover:bg-[#b00320] hover:shadow-lg">
                    Learn More
                  </button>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-600">
              No courses available yet. Check back soon!
            </div>
          )}
        </div>

        {/* Enrollment CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#D90429] px-8 py-4 font-bold text-white transition-all hover:bg-[#b00320] hover:shadow-lg">
            <BookOpen className="h-5 w-5" />
            Enroll Now
          </button>
        </motion.div>
      </div>
    </section>
  )
}
