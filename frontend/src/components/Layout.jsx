import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, ReceiptText, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { AddExpenseModal } from './AddExpenseModal';
import { authService } from '../api/services';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';

export default function Layout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    authService.getCurrentUser()
      .then(res => setUser(res.data.data))
      .catch(err => {
        console.error("Auth check failed:", err);
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // swallow — clear session regardless
    }
    toast({ title: 'Logged out' });
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Sidebar for Desktop / Navbar for Mobile */}
      <aside className="w-full lg:w-64 border-b lg:border-r border-border bg-card p-4 flex lg:flex-col justify-between lg:justify-start">
        <div className="flex items-center space-x-2 lg:mb-8">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold shadow-sm">
            P
          </div>
          <span className="text-xl font-bold tracking-tight hidden lg:inline-block">PayBack</span>
        </div>
        
        <nav className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-2">
          <Link to="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground font-medium text-sm">
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden lg:inline-block">Dashboard</span>
          </Link>
          <Link to="/expenses" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground font-medium text-sm">
            <ReceiptText className="h-5 w-5" />
            <span className="hidden lg:inline-block">All Expenses</span>
          </Link>
          <Link to="/groups" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground font-medium text-sm">
            <Users className="h-5 w-5" />
            <span className="hidden lg:inline-block">Groups</span>
          </Link>
        </nav>
        
        <div className="hidden lg:flex mt-auto pt-6 border-t border-border w-full justify-center">
          <AddExpenseModal />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-end gap-3 px-6">
          <ThemeToggle />
          <NotificationBell />
          
          <Link to="/settings" title="Settings" className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Settings" 
                className="h-8 w-8 rounded-full object-cover shadow-sm hover:ring-2 hover:ring-primary transition-all" 
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shadow-sm hover:ring-2 hover:ring-primary transition-all">
                {user?.username?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
