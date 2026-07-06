import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Settings } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Sidebar for Desktop / Navbar for Mobile */}
      <aside className="w-full lg:w-64 border-b lg:border-r border-border bg-card p-4 flex lg:flex-col justify-between lg:justify-start">
        <div className="flex items-center space-x-2 lg:mb-8">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">P</div>
          <span className="text-xl font-bold tracking-tight hidden lg:inline-block">PayBack</span>
        </div>
        
        <nav className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-2">
          <Link to="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground font-medium text-sm">
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden lg:inline-block">Dashboard</span>
          </Link>
          <Link to="/groups" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground font-medium text-sm">
            <Users className="h-5 w-5" />
            <span className="hidden lg:inline-block">Groups</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground font-medium text-sm">
            <Settings className="h-5 w-5" />
            <span className="hidden lg:inline-block">Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-end px-6">
          <NotificationBell />
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
