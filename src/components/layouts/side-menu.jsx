import { useState, useEffect  } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../app/userSlice';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import logoIcon from '../../../src/assets/NetNada_logo_icon.png';
import logoFull from '../../../src/assets/NetNada_logo.png';

import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

export default function SideMenu({ logoMargin = 'm-2' }) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed state
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      dispatch(clearUser());
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

    // Reset isCollapsed state on route change
    useEffect(() => {
      setIsCollapsed(true); // Collapse sidebar by default on route change
    }, [location.pathname]); // Effect runs whenever route changes

  // Menu items
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin-dashboard' },
    { icon: Users, label: 'Companies', href: '/companies' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div
      className={`relative h-screen bg-background border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      onMouseEnter={() => setIsCollapsed(false)} // Expand on hover
      onMouseLeave={() => setIsCollapsed(true)}  // Collapse on hover
    >
      <ScrollArea className="h-full">
        <div className="flex flex-col h-full p-4 relative z-10">
          {/* Logo and Collapse Toggle */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isCollapsed ? 'w-12' : 'w-full'
              }`}
            >
              <div className="flex items-center relative z-20">
                
                <img
                  src={logoIcon}
                  alt="Logo Icon"
                  className={`h-8 ${isCollapsed ? 'block' : 'hidden'} ${logoMargin} transition-all`}
                  style={{
                    zIndex: 999, // Ensure logo stays on top
                    position: 'relative',
                  }}
                />
                
                <div
                  className={`text-2xl font-bold text-primary ${isCollapsed ? 'hidden' : 'flex'} ${logoMargin}`}
                  style={{
                    zIndex: 999, // Ensure full logo stays on top
                    position: 'relative',
                  }}
                >
                  <img
                    src="src/assets/NetNada_logo.png"
                    alt={logoFull}
                    className="h-12 mr-2" // Adjust size as needed
                  />
                  
                </div>
              </div>
            </div>
          </div>

          {/* User Greeting */}
          <div
            className={`mb-6 overflow-hidden transition-all duration-700 ease-in-out ${
              isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/upstream_17.png" />
                <AvatarFallback>{user ? user.fullName[0] : 'A'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold">Welcome,</h2>
                <p className="text-xs text-muted-foreground">
                  {user ? user.fullName : 'Admin'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.href;

              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isCollapsed ? 'justify-center' : 'justify-start'
                  } ${isActive ? 'font-bold text-lg text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 text-sm">{item.label}</span>}
                </a>
              );
            })}
          </nav>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="flex items-center w-full mt-6 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 text-sm">Logout</span>}
          </Button>
        </div>
      </ScrollArea>

      {/* Mobile Menu Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
}
