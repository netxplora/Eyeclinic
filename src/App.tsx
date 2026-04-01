import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import BookAppointment from "./pages/BookAppointment";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminSetup from "./pages/admin/SetupAdmin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStaffManagement from "./pages/admin/StaffManagement";
import AdminBookings from "./pages/admin/Bookings";
import AdminBookingDetail from "./pages/admin/BookingDetail";
import AdminPatients from "./pages/admin/Patients";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminPasswordChange from "./pages/admin/PasswordChange";
import AdminEmailPatients from "./pages/admin/EmailPatients";
import AdminBlogManagement from "./pages/admin/BlogManagement";
import AdminBlogEdit from "./pages/admin/BlogEdit";
import AdminDoctors from "./pages/admin/Doctors";
import AdminServices from "./pages/admin/Services";
import AdminWaitlists from "./pages/admin/Waitlists";
import AdminEmergencySlots from "./pages/admin/EmergencySlots";
import AdminCheckIn from "./pages/admin/CheckIn";
import PatientLogin from "./pages/patient/Login";
import PatientSignup from "./pages/patient/Signup";
import PatientDashboard from "./pages/patient/Dashboard";
import AdminAddBooking from "./pages/admin/AddBooking";
import AdminQueuePanel from "./pages/admin/QueuePanel";
import AdminDoctorSchedule from "./pages/admin/DoctorSchedule";
import AdminActivityLogs from "./pages/admin/ActivityLogs";
import AdminPatientProfile from "./pages/admin/PatientProfile";
import { AdminLayout } from "@/components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Patient Routes */}
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/signup" element={<PatientSignup />} />
            <Route path="/patient/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin/queue" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'receptionist', 'doctor']}><AdminQueuePanel /></ProtectedRoute>} />
            
            {/* Nested Admin App */}
            <Route path="/admin" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="staff" element={<ProtectedRoute requireStaff allowedRoles={['admin']}><AdminStaffManagement /></ProtectedRoute>} />
              <Route path="bookings" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminBookings /></ProtectedRoute>} />
              <Route path="bookings/new" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'receptionist']}><AdminAddBooking /></ProtectedRoute>} />
              <Route path="bookings/:id" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminBookingDetail /></ProtectedRoute>} />
              <Route path="doctors" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor']}><AdminDoctorSchedule /></ProtectedRoute>} />
              <Route path="services" element={<ProtectedRoute requireStaff allowedRoles={['admin']}><AdminServices /></ProtectedRoute>} />
              <Route path="waitlists" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'receptionist']}><AdminWaitlists /></ProtectedRoute>} />
              <Route path="patients" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminPatients /></ProtectedRoute>} />
              <Route path="patients/:id" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminPatientProfile /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute requireStaff allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="blogs" element={<ProtectedRoute requireStaff allowedRoles={['admin']}><AdminBlogManagement /></ProtectedRoute>} />
              <Route path="blogs/:id" element={<ProtectedRoute requireStaff allowedRoles={['admin']}><AdminBlogEdit /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminSettings /></ProtectedRoute>} />
              <Route path="password" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminPasswordChange /></ProtectedRoute>} />
              <Route path="emergency-slots" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'receptionist']}><AdminEmergencySlots /></ProtectedRoute>} />
              <Route path="check-in" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'doctor', 'receptionist']}><AdminCheckIn /></ProtectedRoute>} />
              <Route path="email" element={<ProtectedRoute requireStaff allowedRoles={['admin', 'receptionist']}><AdminEmailPatients /></ProtectedRoute>} />
              <Route path="activity-logs" element={<ProtectedRoute requireStaff allowedRoles={['admin']}><AdminActivityLogs /></ProtectedRoute>} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
