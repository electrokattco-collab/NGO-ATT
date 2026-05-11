import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/src/context/AuthContext';
import { MainLayout } from '@/src/layouts/MainLayout';
import { AdminLayout } from '@/src/layouts/AdminLayout';
import { ScrollToTop } from '@/src/components/common/ScrollToTop';
import { ErrorBoundary } from '@/src/components/common/ErrorBoundary';
import { ROUTES } from '@/src/constants';

// Pages
import Home from '@/src/pages/Home';
import About from '@/src/pages/About';
import Programs from '@/src/pages/Programs';
import Volunteer from '@/src/pages/Volunteer';
import Donations from '@/src/pages/Donations';
import Contact from '@/src/pages/Contact';
import Blog from '@/src/pages/Blog';
import BlogDetails from '@/src/pages/BlogDetails';

// Admin Pages
import { ProtectedRoute } from '@/src/components/common/ProtectedRoute';
import AdminOverview from '@/src/pages/admin/Overview';
import AdminVolunteers from '@/src/pages/admin/Volunteers';
import AdminBlog from '@/src/pages/admin/Blog';
import AdminBlogEditor from '@/src/pages/admin/BlogEditor';
import AdminRoles from '@/src/pages/admin/RoleManagement';

// Placeholder Pages
const Events = () => <div className="pt-40 text-center text-4xl font-bold min-h-screen">Events Page Coming Soon</div>;
const Gallery = () => <div className="pt-40 text-center text-4xl font-bold min-h-screen">Gallery Page Coming Soon</div>;

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<MainLayout><Home /></MainLayout>} />
          <Route path={ROUTES.ABOUT} element={<MainLayout><About /></MainLayout>} />
          <Route path={ROUTES.PROGRAMS} element={<MainLayout><Programs /></MainLayout>} />
          <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
          <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
          <Route path={ROUTES.VOLUNTEER} element={<MainLayout><Volunteer /></MainLayout>} />
          <Route path={ROUTES.DONATIONS} element={<MainLayout><Donations /></MainLayout>} />
          <Route path={ROUTES.CONTACT} element={<MainLayout><Contact /></MainLayout>} />
          <Route path={ROUTES.BLOG} element={<MainLayout><Blog /></MainLayout>} />
          <Route path="/blog/:slug" element={<MainLayout><BlogDetails /></MainLayout>} />

          {/* Admin Protected Routes */}
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<ProtectedRoute requiredRoles={['super_admin', 'admin']}><AdminLayout><AdminOverview /></AdminLayout></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.VOLUNTEERS} element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'volunteer_manager']}><AdminLayout><AdminVolunteers /></AdminLayout></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.BLOG} element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'editor']}><AdminLayout><AdminBlog /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'editor']}><AdminLayout><AdminBlogEditor /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'editor']}><AdminLayout><AdminBlogEditor /></AdminLayout></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.DONATIONS} element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'donor_manager']}><AdminLayout><div className="text-3xl font-black">Donations Tracking Coming Soon</div></AdminLayout></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.MESSAGES} element={<ProtectedRoute requiredRoles={['super_admin', 'admin']}><AdminLayout><div className="text-3xl font-black">Messages Management Coming Soon</div></AdminLayout></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.EVENTS} element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'editor']}><AdminLayout><div className="text-3xl font-black">Events Management Coming Soon</div></AdminLayout></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN.GALLERY} element={<ProtectedRoute requiredRoles={['super_admin', 'admin', 'editor']}><AdminLayout><div className="text-3xl font-black">Gallery Management Coming Soon</div></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute requiredRoles={['super_admin']}><AdminLayout><AdminRoles /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}
