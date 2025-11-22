import { Settings, Palette, Wifi, Hash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RelayListManager } from '@/components/RelayListManager';
import { InterestSetsManager } from '@/components/InterestSetsManager';
import { useTheme } from '@/hooks/useTheme';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === 'dark';

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="container max-w-4xl py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your preferences and relay connections
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base cursor-pointer">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Relay Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" />
              <CardTitle>Relays</CardTitle>
            </div>
            <CardDescription>
              Manage your Nostr relay connections. Read relays are used to fetch content, while write relays receive your published events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RelayListManager />
          </CardContent>
        </Card>

        {/* Interest Sets */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <CardTitle>Interest Sets</CardTitle>
            </div>
            <CardDescription>
              Customize your homepage by creating interest sets. Each set groups related hashtags together and appears as a section on your feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterestSetsManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
