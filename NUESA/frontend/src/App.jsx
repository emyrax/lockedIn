import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './stores/auth';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './features/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/Dashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import Departments from './features/Departments';
import DepartmentDetail from './features/DepartmentDetail';
import News from './features/news/News';
import NewsDetail from './features/news/NewsDetail';
import Events from './features/Events';
import EventDetail from './features/events/EventDetail';
import AlumniList from './features/alumni/AlumniList';
import AlumniProfile from './features/alumni/AlumniProfile';
import MyAlumniProfile from './features/alumni/MyAlumniProfile';
import JobBoard from './features/jobs/JobBoard';
import JobDetail from './features/jobs/JobDetail';
import PostJob from './features/jobs/PostJob';
import MyJobs from './features/jobs/MyJobs';
import Projects from './features/projects/Projects';
import ProjectDetail from './features/projects/ProjectDetail';
import ProjectSubmit from './features/projects/ProjectSubmit';
import MyProjects from './features/projects/MyProjects';
import About from './features/About';
import Contact from './features/Contact';
import Elections from './features/elections/Elections';
import ElectionDetail from './features/elections/ElectionDetail';
import VoteBooth from './features/elections/VoteBooth';
import ApplyCandidate from './features/elections/ApplyCandidate';
import MyCandidacy from './features/elections/MyCandidacy';
import VerifyVote from './features/elections/VerifyVote';
import AdminElections from './features/elections/AdminElections';
import AdminElectionDetail from './features/elections/AdminElectionDetail';
import PastRepresentative from './features/PastRepresentative';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="pt-16 lg:pt-20 bg-grid-engineering">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:code" element={<DepartmentDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/alumni" element={<AlumniList />} />
          <Route path="/alumni/my" element={
            <ProtectedRoute roles={['alumnus']}>
              <MyAlumniProfile />
            </ProtectedRoute>
          } />
          <Route path="/alumni/:id" element={<AlumniProfile />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/post" element={
            <ProtectedRoute roles={['alumnus']}>
              <PostJob />
            </ProtectedRoute>
          } />
          <Route path="/jobs/my" element={
            <ProtectedRoute roles={['alumnus']}>
              <MyJobs />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/submit" element={
            <ProtectedRoute roles={['student', 'alumnus']}>
              <ProjectSubmit />
            </ProtectedRoute>
          } />
          <Route path="/projects/my" element={
            <ProtectedRoute roles={['student', 'alumnus']}>
              <MyProjects />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pastrepresentative" element={<PastRepresentative />} />
          <Route path="/elections" element={<Elections />} />
          <Route path="/elections/:id" element={<ElectionDetail />} />
          <Route path="/elections/:id/vote" element={
            <ProtectedRoute roles={['student', 'alumnus']}>
              <VoteBooth />
            </ProtectedRoute>
          } />
          <Route path="/elections/:id/apply" element={
            <ProtectedRoute roles={['student', 'alumnus']}>
              <ApplyCandidate />
            </ProtectedRoute>
          } />
          <Route path="/elections/:id/verify" element={<VerifyVote />} />
          <Route path="/elections/my" element={
            <ProtectedRoute roles={['student', 'alumnus']}>
              <MyCandidacy />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['student', 'alumnus', 'staff', 'electo', 'super_admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute roles={['electo', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}
