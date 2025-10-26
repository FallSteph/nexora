import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Projects', path: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Manage Users', path: '/users', icon: Users, show: user?.role === 'admin' },
    { name: 'Notifications', path: '/notifications', icon: Bell, show: true },
    { name: 'Settings', path: '/settings', icon: Settings, show: true },
  ];

  // Close mobile sidebar when navigating
  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gradient truncate">Nexora</h1>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="flex-shrink-0 h-8 w-8 p-0 md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all ${
                isActive
                  ? 'gradient-primary text-white hover-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 sm:p-4 border-t border-border space-y-2 sm:space-y-3">
        <div className="flex items-center space-x-3 px-3 sm:px-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-secondary flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Sign Out</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                Are you sure you want to sign out of Nexora?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="glass w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={logout}
                className="gradient-primary hover-glow w-full sm:w-auto"
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - hidden on desktop */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 h-10 w-10 p-0 glass md:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 glass-strong border-r border-border z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <>
        {/* Backdrop */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-screen w-80 max-w-[85vw] glass-strong border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </>

      {/* Spacer for mobile header */}
      <div className="h-16 md:h-0" />
    </>
  );
};

export default Sidebar;