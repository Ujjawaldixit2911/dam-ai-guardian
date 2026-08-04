import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import SensorCard from '@/components/SensorCard';
import EnhancedWeatherDashboard from '@/components/EnhancedWeatherDashboard';
import { Droplets, Zap, Gauge, Thermometer, CloudRain, Radio, Ruler, Compass, AlertTriangle } from 'lucide-react';
import sendDamFailureAlert from '@/lib/alertService';
import { toast } from 'sonner';
import { fetchAuthorities } from '@/lib/authorityService';
import { initSocket } from '@/services/backendService';
import { useDam } from '@/contexts/DamContext';

const Monitoring = () => {
  const { selectedDam, setSelectedDam, dams } = useDam();
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

  const [waterLevelData, setWaterLevelData] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 70 + Math.random() * 15,
    }))
  );

  const [vibrationData, setVibrationData] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 1.5 + Math.random() * 2,
    }))
  );

  // Track last sent timestamps per alert key to rate-limit notifications
  const lastSentRef = useRef<Record<string, number>>({});
  const recipientsRef = useRef<string[]>([]);

  // Refresh server-side authorities every 60s
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const list = await fetchAuthorities();
      if (!mounted) return;
      recipientsRef.current = list;
    };
    // initialize socket connection for server-side notifications
    const socket = initSocket();
    
    // Listen for socket connection
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected to backend');
      toast.success('Connected to backend server');
    });
    
    socket.on('disconnect', () => {
      console.warn('⚠️  Socket.IO disconnected');
      toast.error('Disconnected from backend');
    });
    
    socket.on('alert-sent', (data) => {
      console.log('📧 Alert sent from backend:', data);
      toast.success(`Backend sent alert: ${data.subject}`);
    });
    
    load();
    const id = setInterval(load, 60 * 1000);
    return () => { 
      mounted = false; 
      clearInterval(id);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('alert-sent');
    };
  }, []);

  const [seismicData, setSeismicData] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: Math.random() * 1.5,
    }))
  );

  useEffect(() => {
    let baseWaterLevel = 85;
    let baseVibration = 2.5;
    let baseSeismic = 0.5;
    if (selectedDam === 'bhakra') {
      baseWaterLevel = 60; baseVibration = 1.0; baseSeismic = 0.2;
    } else if (selectedDam === 'sardar') {
      baseWaterLevel = 92; baseVibration = 3.5; baseSeismic = 0.8;
    } else if (selectedDam === 'nagarjuna') {
      baseWaterLevel = 45; baseVibration = 0.5; baseSeismic = 0.1;
    } else if (selectedDam === 'hirakud') {
      baseWaterLevel = 70; baseVibration = 1.5; baseSeismic = 0.4;
    }

    setWaterLevelData(
      Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: baseWaterLevel - 15 + Math.random() * 15,
      }))
    );
    setVibrationData(
      Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: baseVibration - 1 + Math.random() * 2,
      }))
    );
    setSeismicData(
      Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        value: baseSeismic + Math.random() * 0.5,
      }))
    );
  }, [selectedDam]);

  useEffect(() => {
    const interval = setInterval(() => {
      let baseWaterLevel = 85;
      let baseVibration = 2.5;
      let basePressure = 4;
      let baseSeismic = 0.7;
      
      if (selectedDam === 'bhakra') {
        baseWaterLevel = 60; baseVibration = 1.0; basePressure = 3.2; baseSeismic = 0.2;
      } else if (selectedDam === 'sardar') {
        baseWaterLevel = 92; baseVibration = 3.5; basePressure = 5.2; baseSeismic = 1.1;
      } else if (selectedDam === 'nagarjuna') {
        baseWaterLevel = 45; baseVibration = 0.5; basePressure = 2.5; baseSeismic = 0.1;
      } else if (selectedDam === 'hirakud') {
        baseWaterLevel = 70; baseVibration = 1.5; basePressure = 3.8; baseSeismic = 0.4;
      }

      const newSensorData = {
        waterLevel: baseWaterLevel + Math.random() * 15, // Increased range: 85-100% (more likely to hit 95%)
        vibration: baseVibration + Math.random() * 2, // Increased range: 2.5-4.5 (more likely to hit 3)
        pressure: basePressure + Math.random() * 1,
        temperature: 25 + Math.random() * 5,
        rainfall: Math.random() * 20,
        seismic: baseSeismic + Math.random() * 0.5, // Increased range: 0.7-1.2 (more likely to hit 0.9)
        crackWidth: 0.25 + Math.random() * 0.2, // Increased range: 0.25-0.45 (more likely to hit 0.35)
        tilt: 0.01 + Math.random() * 0.02,
      };

      setSensorData(newSensorData);

      // Update chart data with actual time
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setWaterLevelData((prev) => {
        const newData = [...prev.slice(1), { time: timeStr, value: newSensorData.waterLevel }];
        return newData;
      });

      setVibrationData((prev) => {
        const newData = [...prev.slice(1), { time: timeStr, value: newSensorData.vibration }];
        return newData;
      });

      // After updating sensor data, check thresholds and possibly notify authorities using the same newSensorData snapshot
      try {
        // emit sensor snapshot to server for server-side evaluation/notification
        try {
          const socket = initSocket();
          if (socket && socket.connected) {
            socket.emit('sensor-report', newSensorData);
            console.log('✅ Emitted sensor-report to backend:', { waterLevel: newSensorData.waterLevel, seismic: newSensorData.seismic });
          } else {
            console.warn('⚠️  Socket not connected yet');
          }
        } catch (e) {
          console.error('❌ Socket emit failed:', e);
        }
        const recipients = recipientsRef.current.length > 0 ? recipientsRef.current : (localStorage.getItem('hydrolake_authority_emails') || '').split(',').map(s => s.trim()).filter(Boolean);

        if (recipients.length > 0) {
          const now = Date.now();
          const RATE_LIMIT = 5 * 60 * 1000; // 5 minutes

          const checkAndNotify = async (key: string, condition: boolean, subject: string, body: string) => {
            if (!condition) return;
            const last = lastSentRef.current[key] ?? 0;
            if (now - last < RATE_LIMIT) return; // suppressed
            lastSentRef.current[key] = now;
            try {
              const res = await sendDamFailureAlert({ recipients, subject, body, metadata: { generatedAt: new Date().toISOString() } });
              if (res.ok) {
                if ((res as any).fallback) {
                  toast.success('Opened mail client to notify authorities (fallback)');
                } else {
                  toast.success(`Notified authorities: ${subject}`);
                }
              } else {
                toast.error(`Failed to notify authorities: ${(res as any).error ?? 'unknown'}`);
              }
            } catch (err: any) {
              toast.error(`Notification error: ${err?.message ?? String(err)}`);
            }
          };

          const snapshot = newSensorData;

          checkAndNotify(
            'waterLevel',
            snapshot.waterLevel > 95,
            `CRITICAL: Water level ${snapshot.waterLevel.toFixed(1)}%`,
            `Water level is ${snapshot.waterLevel.toFixed(1)}% — exceeds threshold.\nSnapshot: ${JSON.stringify(snapshot, null, 2)}`
          );

          checkAndNotify(
            'seismic',
            snapshot.seismic > 0.9,
            `CRITICAL: Seismic activity ${snapshot.seismic.toFixed(2)}`,
            `Seismic reading ${snapshot.seismic.toFixed(2)} Richter — exceeds threshold.\nSnapshot: ${JSON.stringify(snapshot, null, 2)}`
          );

          checkAndNotify(
            'vibration',
            snapshot.vibration > 3,
            `ALERT: Vibration ${snapshot.vibration.toFixed(2)} mm/s`,
            `Vibration reading ${snapshot.vibration.toFixed(2)} mm/s — high vibration detected.\nSnapshot: ${JSON.stringify(snapshot, null, 2)}`
          );

          checkAndNotify(
            'crackWidth',
            snapshot.crackWidth > 0.35,
            `ALERT: Crack width ${snapshot.crackWidth.toFixed(2)} mm`,
            `Crack width ${snapshot.crackWidth.toFixed(2)} mm — structural concern.\nSnapshot: ${JSON.stringify(snapshot, null, 2)}`
          );
        }
      } catch (err) {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDam]);

  const generateTrend = () => Array.from({ length: 12 }, () => 60 + Math.random() * 40);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Real-Time Monitoring</h1>
            <p className="text-muted-foreground">Live sensor data and predictive analytics</p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-xl border border-border/50 shadow-sm">
            <label className="text-base font-bold text-foreground bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20 flex items-center gap-2">
              📍 Select Dam:
            </label>
            <select
              value={selectedDam}
              onChange={(e) => setSelectedDam(e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-primary/30 text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              {dams.map((dam) => (
                <option key={dam.value} value={dam.value}>
                  {dam.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Authority Recipients Display */}
        <div className="mt-3 p-3 glass-card rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Alert Recipients:</span>
            {recipientsRef.current.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recipientsRef.current.map((email, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-mono">
                    {email}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-yellow-500 text-xs">⚠️ No recipients configured (check Alerts page)</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={async () => {
              try {
                const recipients = recipientsRef.current.length > 0 ? recipientsRef.current : (localStorage.getItem('hydrolake_authority_emails') || '').split(',').map(s => s.trim()).filter(Boolean);
                if (recipients.length === 0) {
                  toast.error('No authority recipients configured (server or localStorage)');
                  return;
                }

                const subject = 'TEST ALERT: Hydrolake test notification';
                const body = `This is a manual test alert generated at ${new Date().toISOString()}\n\nCurrent sensor snapshot:\n${JSON.stringify(sensorData, null, 2)}`;

                const res = await sendDamFailureAlert({ recipients, subject, body, metadata: { test: true } });
                if (res && (res as any).ok) {
                  if ((res as any).previewUrl) {
                    toast.success('Test alert sent — preview available');
                  } else if ((res as any).fallback) {
                    toast.success('Opened mail client for test alert (fallback)');
                  } else {
                    toast.success('Test alert sent successfully');
                  }
                } else {
                  toast.error(`Test alert failed: ${(res as any)?.error ?? 'unknown'}`);
                }
              } catch (err: any) {
                toast.error(`Error sending test alert: ${err?.message ?? String(err)}`);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
          >
            Send test alert
          </button>
          <button
            onClick={async () => {
              // Confirmation dialog for SOS
              const confirmed = window.confirm(
                '🚨 EMERGENCY SOS ALERT 🚨\n\n' +
                'This will send an IMMEDIATE CRITICAL ALERT to all authorities.\n\n' +
                'Current Status:\n' +
                `• Water Level: ${sensorData.waterLevel.toFixed(1)}%\n` +
                `• Seismic: ${sensorData.seismic.toFixed(2)} Richter\n` +
                `• Vibration: ${sensorData.vibration.toFixed(2)} mm/s\n` +
                `• Crack Width: ${sensorData.crackWidth.toFixed(2)} mm\n\n` +
                'Do you want to proceed with sending the SOS alert?'
              );

              if (!confirmed) {
                toast.info('SOS alert cancelled');
                return;
              }

              try {
                const recipients = recipientsRef.current.length > 0 ? recipientsRef.current : (localStorage.getItem('hydrolake_authority_emails') || '').split(',').map(s => s.trim()).filter(Boolean);
                if (recipients.length === 0) {
                  toast.error('No authority recipients configured for SOS alert');
                  return;
                }

                const subject = '🚨 EMERGENCY SOS: Dam Critical Alert';
                const body = `🚨🚨🚨 EMERGENCY SOS ALERT 🚨🚨🚨

CRITICAL DAM SITUATION DETECTED

Time: ${new Date().toISOString()}
Location: Hydrolake Dam Monitoring System

CURRENT SENSOR READINGS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Water Level: ${sensorData.waterLevel.toFixed(1)}% ${sensorData.waterLevel > 85 ? '⚠️ CRITICAL' : ''}
Vibration: ${sensorData.vibration.toFixed(2)} mm/s ${sensorData.vibration > 3 ? '⚠️ HIGH' : ''}
Pressure: ${sensorData.pressure.toFixed(2)} MPa ${sensorData.pressure > 4.8 ? '⚠️ HIGH' : ''}
Temperature: ${sensorData.temperature.toFixed(1)}°C
Rainfall: ${sensorData.rainfall.toFixed(1)} mm/h ${sensorData.rainfall > 15 ? '⚠️ HEAVY' : ''}
Seismic Activity: ${sensorData.seismic.toFixed(2)} Richter ${sensorData.seismic > 0.9 ? '⚠️ CRITICAL' : ''}
Crack Width: ${sensorData.crackWidth.toFixed(2)} mm ${sensorData.crackWidth > 0.35 ? '⚠️ STRUCTURAL CONCERN' : ''}
Tilt: ${sensorData.tilt.toFixed(3)}° ${sensorData.tilt > 0.025 ? '⚠️ CONCERN' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMMEDIATE ACTION REQUIRED ⚠️

This is an emergency SOS alert triggered manually by the operator.
Please respond immediately and coordinate emergency response protocols.

Full Sensor Data:
${JSON.stringify(sensorData, null, 2)}`;

                const res = await sendDamFailureAlert({ 
                  recipients, 
                  subject, 
                  body, 
                  metadata: { 
                    sos: true, 
                    priority: 'CRITICAL',
                    timestamp: new Date().toISOString(),
                    sensorData 
                  } 
                });
                
                if (res && (res as any).ok) {
                  if ((res as any).previewUrl) {
                    toast.success('🚨 SOS ALERT SENT — Preview: ' + (res as any).previewUrl, { duration: 10000 });
                    console.log('SOS Preview URL:', (res as any).previewUrl);
                  } else if ((res as any).fallback) {
                    toast.success('🚨 SOS ALERT: Opened mail client (fallback)');
                  } else {
                    toast.success('🚨 SOS ALERT SENT TO ALL AUTHORITIES');
                  }
                } else {
                  toast.error(`SOS alert failed: ${(res as any)?.error ?? 'unknown'}`);
                }
              } catch (err: any) {
                toast.error(`Error sending SOS alert: ${err?.message ?? String(err)}`);
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-red-600 text-white hover:bg-red-700 font-bold text-lg shadow-lg animate-pulse border-2 border-red-400"
          >
            <AlertTriangle className="w-6 h-6" />
            EMERGENCY SOS
          </button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard
          icon={Droplets}
          label="Water Level"
          value={sensorData.waterLevel}
          unit="%"
          status={sensorData.waterLevel > 85 ? 'warning' : 'normal'}
          trend={generateTrend()}
        />
        <SensorCard
          icon={Zap}
          label="Vibrations"
          value={sensorData.vibration}
          unit="mm/s"
          status={sensorData.vibration > 3 ? 'warning' : 'normal'}
          trend={generateTrend()}
        />
        <SensorCard
          icon={Gauge}
          label="Pressure"
          value={sensorData.pressure}
          unit="MPa"
          status={sensorData.pressure > 4.8 ? 'warning' : 'normal'}
          trend={generateTrend()}
        />
        <SensorCard
          icon={Thermometer}
          label="Temperature"
          value={sensorData.temperature}
          unit="°C"
          status="normal"
          trend={generateTrend()}
        />
        <SensorCard
          icon={CloudRain}
          label="Rainfall"
          value={sensorData.rainfall}
          unit="mm/h"
          status={sensorData.rainfall > 15 ? 'warning' : 'normal'}
          trend={generateTrend()}
        />
        <SensorCard
          icon={Radio}
          label="Seismic"
          value={sensorData.seismic}
          unit="Richter"
          status={sensorData.seismic > 0.9 ? 'critical' : 'normal'}
          trend={generateTrend()}
        />
        <SensorCard
          icon={Ruler}
          label="Crack Width"
          value={sensorData.crackWidth}
          unit="mm"
          status={sensorData.crackWidth > 0.35 ? 'warning' : 'normal'}
          trend={generateTrend()}
        />
        <SensorCard
          icon={Compass}
          label="Tilt"
          value={sensorData.tilt}
          unit="°"
          status={sensorData.tilt > 0.025 ? 'warning' : 'normal'}
          trend={generateTrend()}
        />
      </div>


      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water Level Chart */}
        <div className="glass-card rounded-2xl p-6 border-primary/30">
          <h3 className="text-xl font-bold text-foreground mb-4">Water Level (24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={waterLevelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(217 33% 10%)',
                  border: '1px solid hsl(180 100% 50%)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(180 100% 50%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(158 100% 50%)', r: 4 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vibration Chart */}
        <div className="glass-card rounded-2xl p-6 border-primary/30">
          <h3 className="text-xl font-bold text-foreground mb-4">Vibration Levels (24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vibrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(217 33% 10%)',
                  border: '1px solid hsl(180 100% 50%)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(270 80% 65%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(180 100% 50%)', r: 4 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Seismic Activity Chart */}
        <div className="glass-card rounded-2xl p-6 border-primary/30 lg:col-span-2">
          <h3 className="text-xl font-bold text-foreground mb-4">Seismic Activity (Annual)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seismicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(217 33% 10%)',
                border: '1px solid hsl(180 100% 50%)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" fill="hsl(158 100% 50%)" radius={[8, 8, 0, 0]} />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


    </div>
  );
};

export default Monitoring;
