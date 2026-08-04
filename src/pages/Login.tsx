import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Shield, Activity, Bell, Lock } from 'lucide-react';
import { toast } from 'sonner';
import DamLogo from '@/components/DamLogo';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, forceGuestLogin } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const success = await loginWithGoogle();
    
    if (success) {
      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } else {
      toast.error('Failed to authenticate with Google. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      if (success === 'pending') {
        const role = window.prompt("Your account request has been sent to the Admin and is pending approval.\n\nTo access temporarily, please type the role you want: 'user' or 'engineer'");
        
        if (role && (role.toLowerCase() === 'user' || role.toLowerCase() === 'engineer')) {
          forceGuestLogin(email, role.toLowerCase() === 'engineer' ? 'Engineer' : 'User');
          toast.info(`Logged in as Guest ${role} temporarily.`);
          navigate('/dashboard');
        } else if (role) {
          toast.error("Invalid role entered. Please try again.");
        }
        setIsLoading(false);
        return;
      }
      
      if (success === 'visitor') {
        toast.info('Welcome! You are browsing as a Visitor. Admin and Engineer panels are restricted.', {
          duration: 5000,
        });
      } else {
        toast.success(t('auth.loginSuccess'));
      }
      navigate('/dashboard');
    } else {
      toast.error(t('auth.loginInvalid'));
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setIsLoading(true);
    const success = await login(demoEmail, demoPassword);
    
    if (success) {
      toast.success(t('auth.demoLoginSuccess'));
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  console.log('🔐 Login component rendering, t function:', typeof t);
  
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 glass-card border-r border-primary/30 p-12 flex-col justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        
        <div className="relative z-10 space-y-8">
          <DamLogo size={140} showText={true} />
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              {t('auth.heroTitlePrefix')}
              <span className="gradient-text"> {t('auth.heroTitleHighlight')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('auth.heroSubtitle')}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-secondary" />
                <div className="text-3xl font-bold text-foreground">0</div>
              </div>
              <div className="text-sm text-muted-foreground">{t('auth.statsDamsMonitored')}</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-primary" />
                <div className="text-3xl font-bold text-foreground">82.2%</div>
              </div>
              <div className="text-sm text-muted-foreground">{t('auth.statsAiAccuracy')}</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-8 h-8 text-destructive" />
                <div className="text-3xl font-bold text-foreground">24/7</div>
              </div>
              <div className="text-sm text-muted-foreground">{t('auth.statsAlertSystem')}</div>
            </div>
            
            <div className="glass-card p-4 rounded-xl border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-8 h-8 text-accent" />
                <div className="text-3xl font-bold text-foreground">0</div>
              </div>
              <div className="text-sm text-muted-foreground">{t('auth.statsLivesProtected')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <DamLogo size={100} showText={true} />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t('auth.welcomeBack')}</h1>
            <p className="text-muted-foreground">{t('auth.signInSubtitle')}</p>
            <p className="text-sm font-medium text-primary mt-2">Login for Engineer or Admin account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.emailAddress')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-card pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  {t('auth.rememberMe')}
                </Label>
              </div>
              <button type="button" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>

          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full flex items-center justify-center gap-3 h-10 text-sm mt-4" 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              'Authenticating...'
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>



          <div className="text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary hover:underline font-medium"
            >
              {t('auth.signUpNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
