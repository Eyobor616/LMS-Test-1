import React, { useMemo, useState } from 'react';
import AppLayout from './components/layout/AppLayout.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import CourseBuilder from './components/courses/CourseBuilder.jsx';
import CourseLibrary from './components/courses/CourseLibrary.jsx';
import BundleManager from './components/courses/BundleManager.jsx';
import QuizManager from './components/quizzes/QuizManager.jsx';
import CertificateStudio from './components/certificates/CertificateStudio.jsx';
import CommunicationHub from './components/communication/CommunicationHub.jsx';

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const views = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', description: 'Progress snapshots tailored to your role', component: <Dashboard /> },
      { id: 'builder', label: 'Course Builder', description: 'Design course blueprints, modules, and drip schedules', component: <CourseBuilder /> },
      { id: 'library', label: 'Course Library', description: 'Preview courses, manage enrollments, and instructor teams', component: <CourseLibrary /> },
      { id: 'bundles', label: 'Bundles', description: 'Group courses into themed collections for curated learning paths', component: <BundleManager /> },
      { id: 'quizzes', label: 'Quizzes', description: 'Build assessments, deliver quizzes, and review auto-grading insights', component: <QuizManager /> },
      { id: 'certificates', label: 'Certificates', description: 'Craft shareable completion certificates with custom branding', component: <CertificateStudio /> },
      { id: 'communications', label: 'Communications', description: 'Announcements, direct messages, and course-wide discussions', component: <CommunicationHub /> },
    ],
    []
  );

  const activeConfig = views.find((view) => view.id === activeView) ?? views[0];

  return (
    <AppLayout
      title="Tutor LMS MVP"
      subtitle={activeConfig.description}
      activeView={activeView}
      onNavigate={setActiveView}
      views={views}
    >
      {activeConfig.component}
    </AppLayout>
  );
};

export default App;
