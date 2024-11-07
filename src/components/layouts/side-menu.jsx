// src/components/layouts/side-menu.jsx
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../app/userSlice'; // Import clearUser action
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useLocation from React Router
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  LogOut,
} from 'lucide-react';

export default function SideMenu() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch(); // Get the dispatch function from Redux
  const user = useSelector((state) => state.user.user); // Get the user from Redux state
  const location = useLocation(); // Get the current location

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      dispatch(clearUser()); // Clear the user from Redux state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin-dashboard' },
    { icon: Users, label: 'Companies', href: '/companies' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className={`relative h-screen bg-background border-r transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <ScrollArea className="h-full">
        <div className="flex flex-col h-full p-4">
          {/* Logo and Collapse Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-8' : 'w-full'}`}>
              <div className="text-2xl font-bold text-primary">Logo</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Greeting */}
          <div className={`mb-6 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/upstream_17.png" />
                <AvatarFallback>{user ? user.fullName[0] : 'A'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold">Welcome,</h2>
                {/* Display user's full name or 'Admin' as a fallback */}
                <p className="text-xs text-muted-foreground">{user ? user.fullName : 'Admin'}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => {
              // Check if the current path matches the item's href
              const isActive = location.pathname === item.href;

              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : 'justify-start'} 
                  ${isActive ? 'font-bold text-lg text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
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
        onClick={toggleCollapse}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </div>
  );
}
