import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Info } from 'lucide-react';

export default function CstaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            CSTA Assist
          </h1>
          <p className="text-slate-500 mt-1">
            cstachemassist.online
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Globe className="w-3 h-3" />
          Portal
        </Badge>
      </div>

      {/* Original CSTA Design - recreating the tricolor flag */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Upper - Dark Red Section (from original #750A04) */}
        <div 
          className="h-32 sm:h-40 flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(180deg, #750A04 0%, #8B0F08 100%)'
          }}
        >
          <div className="text-white/30">
            <Globe className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>
        </div>

        {/* Middle - White/Cream Section with Title */}
        <div 
          className="h-32 sm:h-40 flex items-center justify-center px-4"
          style={{ 
            background: 'linear-gradient(180deg, #FFFEF8 0%, #F5F5DC 100%)'
          }}
        >
          <div className="text-center">
            <h2 
              className="text-2xl sm:text-4xl font-bold tracking-tight"
              style={{ 
                color: '#AE2835',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              cstachemassist.online
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              CSTA Chem Assist Portal
            </p>
          </div>
        </div>

        {/* Lower - Green Section */}
        <div 
          className="h-32 sm:h-40 flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(180deg, #2D7D32 0%, #1B5E20 100%)'
          }}
        >
          <div className="text-white/30">
            <Globe className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>
        </div>
      </Card>

      {/* Info Cards - matching the tricolor theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#750A0420' }}
              >
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: '#750A04' }}
                />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">CSTA Legacy</h3>
                <p className="text-sm text-slate-500">Original portal design</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FFFEF820', border: '1px solid #e5e5e5' }}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2"
                  style={{ borderColor: '#ccc', backgroundColor: '#FFFEF8' }}
                />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Integrated</h3>
                <p className="text-sm text-slate-500">Unified with SafeWork AI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#2D7D3220' }}
              >
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: '#2D7D32' }}
                />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Active</h3>
                <p className="text-sm text-slate-500">Services operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-2">About CSTA Assist</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                This portal represents the original CSTA (CSTA Chem Assist) online presence. 
                The tricolor design with deep burgundy, cream, and forest green reflects the 
                heritage and identity of the platform. This page has been integrated into 
                SafeWork AI to preserve the legacy while providing a modern, unified experience.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">Legacy Portal</Badge>
                <Badge variant="secondary">CSTA Chem Assist</Badge>
                <Badge variant="secondary">Integrated</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
