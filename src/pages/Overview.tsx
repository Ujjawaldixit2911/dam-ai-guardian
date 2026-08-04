import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDam } from '@/contexts/DamContext';
import KPICard from '@/components/KPICard';
import SensorCard from '@/components/SensorCard';
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Layers,
  Droplets,
  Zap,
  Gauge,
  Thermometer,
  CloudRain,
  Radio,
  Ruler,
  Compass,
} from 'lucide-react';

const Overview = () => {
  const { t } = useLanguage();
  const { selectedDam, getDamLabel } = useDam();
  const [sensorData, setSensorData] = useState({
    waterLevel: 78.5,
    vibration: 2.3,
    pressure: 4.5,
    temperature: 28,
    rainfall: 12,
    seismic: 0.8,
    crackWidth: 0.3,
    tilt: 0.02,
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      let baseWaterLevel = 75;
      let baseVibration = 2.0;
      let basePressure = 4.0;
      let baseSeismic = 0.5;
      
      if (selectedDam === 'bhakra') {
        baseWaterLevel = 50; baseVibration = 1.0; basePressure = 3.2; baseSeismic = 0.2;
      } else if (selectedDam === 'sardar') {
        baseWaterLevel = 85; baseVibration = 3.0; basePressure = 5.0; baseSeismic = 0.8;
      } else if (selectedDam === 'nagarjuna') {
        baseWaterLevel = 40; baseVibration = 0.5; basePressure = 2.5; baseSeismic = 0.1;
      } else if (selectedDam === 'hirakud') {
        baseWaterLevel = 65; baseVibration = 1.5; basePressure = 3.5; baseSeismic = 0.4;
      }

      setSensorData({
        waterLevel: baseWaterLevel + Math.random() * 10,
        vibration: baseVibration + Math.random() * 2,
        pressure: basePressure + Math.random() * 1,
        temperature: 25 + Math.random() * 5,
        rainfall: Math.random() * 20,
        seismic: baseSeismic + Math.random() * 0.5,
        crackWidth: 0.2 + Math.random() * 0.2,
        tilt: 0.01 + Math.random() * 0.02,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDam]);

  const generateTrend = () => Array.from({ length: 12 }, () => 60 + Math.random() * 40);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          icon={Shield}
          value={0}
          label={t('dashboard.totalDamsMonitored')}
          suffix="+"
          trend={`+5.2% ${t('dashboard.fromLastMonth')}`}
          trendUp={true}
          iconColor="text-primary"
        />
        <KPICard
          icon={AlertTriangle}
          value={12}
          label={t('dashboard.criticalAlerts')}
          trend={`-8% ${t('dashboard.thisWeek')}`}
          trendUp={false}
          iconColor="text-destructive"
        />
        <KPICard
          icon={Activity}
          value={0}
          label={t('dashboard.activeSensors')}
          suffix="+"
          trend={`+12% ${t('dashboard.operational')}`}
          trendUp={true}
          iconColor="text-secondary"
        />
        <KPICard
          icon={TrendingUp}
          value={94.8}
          label={t('dashboard.aiAccuracy')}
          suffix="%"
          trend={`+2.3% ${t('dashboard.improved')}`}
          trendUp={true}
          iconColor="text-accent"
        />
        <KPICard
          icon={Users}
          value={0}
          label={t('dashboard.livesProtected')}
          suffix="+"
          trend={`+15% ${t('dashboard.coverage')}`}
          trendUp={true}
          iconColor="text-yellow-500"
        />
        <KPICard
          icon={Layers}
          value={45000}
          label={t('dashboard.agingDams')}
          suffix="+"
          trend={t('dashboard.requiresMonitoring')}
          trendUp={false}
          iconColor="text-orange-500"
        />
      </div>


      {/* Recent Alerts Panel */}
      <div className="glass-card rounded-2xl p-6 border-primary/30">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('dashboard.recentAlerts')}</h2>
        <div className="space-y-3">
          {[
            {
              level: 'critical',
              dam: getDamLabel(selectedDam),
              message: `Seismic activity detected - ${(selectedDam === 'sardar' ? 0.9 : 0.5)} Richter`,
              time: '2 minutes ago',
            },
            {
              level: 'warning',
              dam: getDamLabel(selectedDam),
              message: `Water level approaching ${selectedDam === 'tehri' ? 85 : 75}%`,
              time: '15 minutes ago',
            },
            {
              level: 'info',
              dam: 'Sardar Sarovar',
              message: 'Routine maintenance completed',
              time: '1 hour ago',
            },
          ].map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-lg glass-card border-l-4 ${
                alert.level === 'critical'
                  ? 'border-destructive'
                  : alert.level === 'warning'
                  ? 'border-yellow-500'
                  : 'border-primary'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 flex-shrink-0 ${
                  alert.level === 'critical'
                    ? 'text-destructive'
                    : alert.level === 'warning'
                    ? 'text-yellow-500'
                    : 'text-primary'
                }`}
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{alert.dam}</div>
                <div className="text-sm text-muted-foreground">{alert.message}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
