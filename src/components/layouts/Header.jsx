import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  PieChart,
  Plus,
  Sun,
  User,
  X,
} from 'lucide-react';

import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/Button';
import NetnadaLogo from '@/assets/NetNada_logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';

export default function Header({ user }) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navigation = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: PieChart,
      current: location.pathname === '/dashboard',
    },
    ...(user?.role === 'SuperAdmin'
      ? [
          {
            name: 'Company Management',
            href: '/companies',
            icon: Building2,
            current:
              location.pathname.includes('/companies') || location.pathname.includes('/company/'),
          },
        ]
      : []),
    {
      name: 'User Logs',
      href: '/user-logs',
      icon: ClipboardList,
      current: location.pathname === '/user-logs',
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b ${
        theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={NetnadaLogo || '/placeholder.svg'} alt="EcoNet Logo" className="h-8 w-auto" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.current
                  ? theme === 'dark'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-900'
                  : theme === 'dark'
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-slate-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>
          {/* Updated Invite Button: Wrap with Link to navigate to invite page.
              Using user.company (assumed to be the company id) */}
          <Link to={`/invite-user/${user?.company?._id || user?.company}`}>
            <Button
              size="sm"
              className={`hidden md:flex ${
                theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Plus className="mr-1 h-4 w-4" /> Invite
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.fullName} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}
            >
              <DropdownMenuLabel className={theme === 'dark' ? 'text-slate-300' : ''}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : ''}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`text-red-500 ${theme === 'dark' ? 'hover:bg-slate-700' : ''}`}
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu
                  className={`h-6 w-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={theme === 'dark' ? 'bg-slate-900 border-slate-700' : ''}
            >
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src={NetnadaLogo || '/placeholder.svg'}
                    alt="EcoNet Logo"
                    className="h-8 w-auto"
                  />
                  <span
                    className={`ml-2 text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    EcoNet
                  </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X
                    className={`h-6 w-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                  />
                </Button>
              </div>
              <nav className="mt-8 flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? theme === 'dark'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-900'
                        : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
