import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/contexts/LanguageContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Sun,
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      updates: true,
      newsletter: false,
    },
    preferences: {
      autoSave: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
    }
  });

  const handleSave = async (section: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSuccess(t('settings.updatedSuccess', { section }));
    setIsLoading(false);
    
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t('settings.title')}</h1>
        <p className="text-slate-500 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>
                  {t('settings.notificationsDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.emailNotifications')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.emailNotificationsDesc')}
                </p>
              </div>
              <Switch 
                checked={settings.notifications.email}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, notifications: { ...settings.notifications, email: checked }})
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.pushNotifications')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.pushNotificationsDesc')}
                </p>
              </div>
              <Switch 
                checked={settings.notifications.push}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, notifications: { ...settings.notifications, push: checked }})
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.productUpdates')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.productUpdatesDesc')}
                </p>
              </div>
              <Switch 
                checked={settings.notifications.updates}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, notifications: { ...settings.notifications, updates: checked }})
                }
              />
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => handleSave('Notifiche')} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('settings.savePreferences')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle>{t('settings.security')}</CardTitle>
                <CardDescription>
                  {t('settings.securityDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.twoFactor')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.twoFactorDesc')}
                </p>
              </div>
              <Switch 
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, security: { ...settings.security, twoFactor: checked }})
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t('settings.sessionTimeout')}</Label>
              <Input 
                type="number" 
                value={settings.security.sessionTimeout}
                onChange={(e) => 
                  setSettings({ ...settings, security: { ...settings.security, sessionTimeout: e.target.value }})
                }
                className="w-32"
              />
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => handleSave('Impostazioni sicurezza')} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('settings.saveSecurity')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>{t('settings.preferences')}</CardTitle>
                <CardDescription>
                  {t('settings.preferencesDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Sun className="w-4 h-4 text-orange-500" />
                  )}
                  <Label>{t('settings.darkMode')}</Label>
                </div>
                <p className="text-sm text-slate-500">
                  {t('settings.darkModeDesc')}
                </p>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  setTheme(checked ? 'dark' : 'light');
                }}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Label>{t('settings.aiLanguage')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.aiLanguageDesc')}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(LANGUAGE_NAMES) as Array<keyof typeof LANGUAGE_NAMES>).map((lang) => (
                  <Button
                    key={lang}
                    variant={language === lang ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage(lang)}
                    className="w-full justify-start gap-2"
                  >
                    <span>{LANGUAGE_FLAGS[lang]}</span>
                    <span>{LANGUAGE_NAMES[lang]}</span>
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.autoSave')}</Label>
                <p className="text-sm text-slate-500">
                  {t('settings.autoSaveDesc')}
                </p>
              </div>
              <Switch 
                checked={settings.preferences.autoSave}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, preferences: { ...settings.preferences, autoSave: checked }})
                }
              />
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => handleSave('Preferenze')} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('settings.savePreferences')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-600">{t('settings.dangerZone')}</CardTitle>
                <CardDescription>
                  {t('settings.dangerZoneDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('settings.deleteAccount')}</h4>
                <p className="text-sm text-slate-500">
                  {t('settings.deleteAccountDesc')}
                </p>
              </div>
              <Button variant="destructive">
                {t('settings.delete')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
