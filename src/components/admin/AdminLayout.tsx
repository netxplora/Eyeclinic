import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Users,
  UserCog,
  Stethoscope,
  BriefcaseMedical,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  ClipboardList,
  Eye,
  AlertTriangle,
  ClipboardCheck,
  Monitor,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { NotificationBell } from "./NotificationBell";

export function AdminLayout() {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const navigationOptions = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin", exact: true, roles: ["admin", "doctor", "receptionist"] },
    { name: "Check-In Queue", icon: ClipboardList, path: "/admin/check-in", exact: false, roles: ["admin", "doctor", "receptionist"] },
    { name: "Quick Book", icon: ClipboardCheck, path: "/admin/bookings/new", exact: false, roles: ["admin", "receptionist"] },
    { name: "Waiting Room TV", icon: Monitor, path: "/admin/queue", exact: false, roles: ["admin", "receptionist"] },
    { name: "Bookings", icon: CalendarCheck, path: "/admin/bookings", exact: false, roles: ["admin", "doctor", "receptionist"] },
    { name: "Waitlist", icon: Clock, path: "/admin/waitlists", exact: false, roles: ["admin", "receptionist"] },
    { name: "Patients", icon: Users, path: "/admin/patients", exact: false, roles: ["admin", "doctor", "receptionist"] },
    { name: "Doctor Schedules", icon: Stethoscope, path: "/admin/doctors", exact: false, roles: ["admin", "doctor"] },
    { name: "Emergency Slots", icon: AlertTriangle, path: "/admin/emergency-slots", exact: false, roles: ["admin", "receptionist"] },
    { name: "Services", icon: BriefcaseMedical, path: "/admin/services", exact: false, roles: ["admin"] },
    { name: "Staff", icon: UserCog, path: "/admin/staff", exact: false, roles: ["admin"] },
    { name: "Analytics", icon: BarChart3, path: "/admin/analytics", exact: false, roles: ["admin"] },
    { name: "Blog Posts", icon: BookOpen, path: "/admin/blogs", exact: false, roles: ["admin"] },
    { name: "Activity Logs", icon: Settings, path: "/admin/activity-logs", exact: false, roles: ["admin"] },
    { name: "Settings", icon: Settings, path: "/admin/settings", exact: false, roles: ["admin", "doctor", "receptionist"] },
  ];

  const filteredNav = navigationOptions.filter(item =>
    userRole && item.roles.includes(userRole)
  );

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-sidebar-border/50">
        <SidebarHeader className="p-4 flex flex-row items-center gap-2 border-b border-sidebar-border/50 py-5">
          <div className="bg-primary/10 p-1.5 rounded-md flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-primary tracking-tight truncate">
            {userRole === 'admin' ? 'Satome Admin' : userRole === 'receptionist' ? 'Satome Desk' : userRole === 'doctor' ? 'Satome Doctor' : 'Satome'}
          </span>
        </SidebarHeader>
        <SidebarContent className="py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNav.map((item) => {
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.name} className="font-medium transition-colors hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-bold py-5">
                        <Link to={item.path}>
                          <item.icon className="w-4 h-4 ml-1" />
                          <span className="ml-1">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/50 p-4 bg-muted/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {userRole === 'admin' ? 'Satome Admin' : userRole === 'receptionist' ? 'Satome Desk' : userRole === 'doctor' ? 'Satome Doctor' : userRole}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 shadow-none h-9 mt-1" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 bg-background/80 backdrop-blur-md px-4 border-b border-sidebar-border/50 shadow-sm text-sidebar-foreground">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2 hover:bg-muted" />
            <div className="flex items-center gap-2 bg-primary/10 p-1 rounded-sm md:hidden">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm text-primary tracking-tight md:hidden">
              {userRole === 'admin' ? 'Satome Admin' : userRole === 'receptionist' ? 'Satome Desk' : userRole === 'doctor' ? 'Satome Doctor' : 'Satome'}
            </span>
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
            <div className="relative w-full">
               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
               </div>
               <Input 
                   type="text" 
                   className="pl-10 w-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-sm h-9" 
                   placeholder="Global search patients, IDs, or bookings... (Press '/')" 
                   onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                         navigate(`/admin/patients?q=${encodeURIComponent(e.currentTarget.value)}`);
                      }
                   }}
               />
               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-[10px] text-muted-foreground font-medium border rounded px-1.5 py-0.5 bg-background">/</span>
               </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <NotificationBell />
            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 bg-white">
              {userRole === 'admin' ? 'Satome Admin' : userRole === 'receptionist' ? 'Satome Desk' : userRole === 'doctor' ? 'Satome Doctor' : userRole}
            </div>
          </div>
        </div>

        <main className="flex-1 w-full bg-slate-50/40 dark:bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
