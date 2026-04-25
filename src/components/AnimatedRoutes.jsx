import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from '../pages/Home';
import { Courses } from '../pages/Courses';
import { Results } from '../pages/Results';
import { Branches } from '../pages/Branches';
import { StudyMaterial } from '../pages/StudyMaterial';
import { About } from '../pages/About';
import { Contact } from '../pages/Contact';
import { Gallery } from '../pages/Gallery';
import { StudentPortal } from '../pages/StudentPortal';
import { StudentLogin } from '../pages/StudentLogin';
import { AdminPanel } from './AdminPanel.supabase';

export function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/results" element={<Results />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/study-material" element={<StudyMaterial />} />
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </AnimatePresence>
  );
}
