import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  LogOut,
  Menu,
  ChevronDown,
  User,
  Zap,
  Crown,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const getNavigation = (t: (key: string) => string) => [
  { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
  { name: t('nav.lavori'), href: '/lavori', icon: Briefcase },
  { name: 'CSTA', href: '/csta', icon: Globe },
];

const getUserNavigation = (t: (key: string) => string) => [
  { name: t('nav.profile'), href: '/profile', icon: User },
  { name: t('nav.settings'), href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, logout, payment, getTrialDaysLeft } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = getNavigation(t);
  const userNavigation = getUserNavigation(t);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const trialDays = getTrialDaysLeft();
  const isTrial = payment?.status === 'trial';
  const planName = payment?.plan === 'trial' ? 'Prova Gratuita' : payment?.plan;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }
              ${mobile ? 'w-full' : ''}
            `}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Trial Banner */}
      {isTrial && trialDays > 0 && trialDays <= 14 && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              <span>
                {trialDays > 1 
                  ? t('dashboard.daysLeft', { days: trialDays })
                  : t('dashboard.trialLastDay')
                }
              </span>
            </div>
            <Link to="/pricing">
              <Button size="sm" variant="secondary" className="text-xs">
                <Crown className="w-3 h-3 mr-1" />
                {t('dashboard.upgrade')}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Header Mobile */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-slate-900">SafeWork AI</span>
          </Link>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Trial info mobile */}
                {isTrial && (
                  <div className="p-4 bg-primary/10 border-b border-slate-200">
                    <p className="text-sm font-medium text-primary">
                      {t('dashboard.daysLeft', { days: trialDays })}
                    </p>
                    <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full mt-2">
                        {t('dashboard.upgrade')}
                      </Button>
                    </Link>
                  </div>
                )}
                
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user?.nome_completo}</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                      {planName && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {planName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <nav className="flex-1 p-4 space-y-1">
                  <NavLinks mobile />
                </nav>
                
                <div className="p-4 border-t border-slate-200 space-y-1">
                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 w-full"
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed top-0 left-0 h-screen z-30">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">SafeWork AI</h1>
                <p className="text-xs text-slate-500">{t('nav.safetyAtWork')}</p>
              </div>
            </Link>
          </div>

          {/* Navigation - scrollable */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
            <NavLinks />
          </nav>

          {/* Plan Info & User Menu - always at bottom */}
          <div className="p-4 border-t border-slate-200 space-y-3 flex-shrink-0">
            {/* Piano attuale */}
            {planName && (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-slate-500">{t('profile.plan')}</span>
                <Badge variant={isTrial ? 'secondary' : 'default'} className="text-xs">
                  {planName}
                </Badge>
              </div>
            )}
            
            {/* Upgrade button se in trial */}
            {isTrial && (
              <Link to="/pricing">
                <Button size="sm" className="w-full text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  {t('dashboard.upgrade')}
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-slate-900 truncate">{user?.nome_completo}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.ruolo}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('profile.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pricing')}>
                  <Crown className="w-4 h-4 mr-2" />
                  {t('profile.planAndBilling')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
