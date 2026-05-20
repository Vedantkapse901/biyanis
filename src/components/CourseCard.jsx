import { useState } from 'react';
import { Star, Play, Users, Clock, BadgeCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { ResolvedImage } from './ResolvedImage';

export function CourseCard({ course, onEnroll }) {
  const [showDetails, setShowDetails] = useState(false);

  const discount = course.original_price && course.original_price > course.price
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : 0;

  return (
    <GlassCard className="group h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-40 bg-gradient-to-br from-[#D90429]/10 to-[#0A0F2C]/10 overflow-hidden">
        {course.image_url ? (
          <ResolvedImage
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0A0F2C]/5">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-xs text-slate-500">{course.exam_type}</p>
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-[#D90429] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {discount}% OFF
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            course.status === 'active'
              ? 'bg-green-500/90 text-white'
              : 'bg-slate-500/90 text-white'
          }`}>
            {course.status === 'active' ? 'Available' : 'Coming Soon'}
          </span>
        </div>

        {/* Demo Video Play Button */}
        {course.demo_video_url && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#D90429] text-white hover:bg-[#b00320] transition-colors">
              <Play className="h-6 w-6 ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title & Exam Type */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#D90429] uppercase">{course.exam_type}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-medium text-slate-600">{course.subject}</span>
          </div>
          <h3 className="text-lg font-bold text-[#0A0F2C] leading-tight line-clamp-2">
            {course.title}
          </h3>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-[#D90429]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#D90429]">
                {course.instructor.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-slate-700 font-medium">{course.instructor}</span>
          </div>
        )}

        {/* Rating */}
        {course.rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(course.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-[#0A0F2C]">{course.rating}/5</span>
            {course.total_reviews && (
              <span className="text-xs text-slate-500">({course.total_reviews})</span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="space-y-2 text-sm text-slate-600">
          {course.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#D90429]" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.difficulty_level && (
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-[#D90429]" />
              <span className="capitalize">{course.difficulty_level} Level</span>
            </div>
          )}
        </div>

        {/* Description (Preview) */}
        {course.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* What You'll Learn (Preview) */}
        {course.what_you_learn && course.what_you_learn.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#0A0F2C] uppercase">You'll learn:</p>
            <ul className="space-y-1">
              {course.what_you_learn.slice(0, 2).map((item, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex gap-2">
                  <span className="text-[#D90429]">✓</span>
                  <span>{item}</span>
                </li>
              ))}
              {course.what_you_learn.length > 2 && (
                <li className="text-xs text-slate-500 italic">
                  +{course.what_you_learn.length - 2} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Price Section */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#D90429]">₹{course.price}</span>
            {course.original_price && course.original_price > course.price && (
              <span className="text-sm line-through text-slate-500">₹{course.original_price}</span>
            )}
          </div>

          {/* Enroll Button */}
          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={course.status !== 'active'}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              course.status === 'active'
                ? 'bg-[#D90429] text-white hover:bg-[#b00320] shadow-lg shadow-[#D90429]/30'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {course.status === 'active' ? 'Enroll Now' : 'Coming Soon'}
          </button>

          {/* Demo Video Link */}
          {course.demo_video_url && (
            <a
              href={course.demo_video_url}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-2 px-4 rounded-lg border-2 border-[#D90429] text-[#D90429] font-semibold hover:bg-[#D90429]/10 transition-colors text-center"
            >
              Watch Demo
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
