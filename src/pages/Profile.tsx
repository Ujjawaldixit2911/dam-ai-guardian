import { useState, useRef, useEffect } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User as UserIcon,
  Mail,
  Building,
  Phone,
  Shield,
  Bell,
  Clock,
  Camera,
  Trash2,
  HardHat,
  Award,
  MapPin,
  Activity,
  Wrench,
  Radio,
  Check,
  Sparkles,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

// Preset avatar options for instant selection
const PRESET_AVATARS = [
  {
    label: 'Chief Director',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Safety Engineer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hydrology Lead',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Field Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    label: 'Site Inspector',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
];

const POPULAR_DAMS = [
  'Tehri Dam (Uttarakhand)',
  'Bhakra Nangal Dam (Himachal Pradesh)',
  'Sardar Sarovar Dam (Gujarat)',
  'Idukki Dam (Kerala)',
  'Hirakud Dam (Odisha)',
  'Nagarjuna Sagar Dam (Telangana/AP)',
  'Koyna Dam (Maharashtra)',
  'Krishna Raja Sagara Dam (Karnataka)',
  'Tungabhadra Dam (Karnataka)',
  'Mullaperiyar Dam (Kerala/TN)',
  'All Sector Facilities (Multi-Site)',
];

const SPECIALIZATIONS = [
  'Structural Integrity & Seismic Telemetry',
  'Seepage & Pore Pressure Analysis',
  'Spillway & Radial Gate Hydraulics',
  'Reservoir Siltation & Bathymetric Survey',
  'AI Predictive Analytics & Sensor Networks',
  'Disaster Management & Emergency Action Plans',
];

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || 'Safety Engineer',
    organization: currentUser?.organization || 'Central Water Commission (CWC)',
    phone: currentUser?.phone || '',
    designation: currentUser?.designation || 'Dam Safety Engineer',
    assignedDam: currentUser?.assignedDam || 'Tehri Dam (Uttarakhand)',
    specialization: currentUser?.specialization || 'Structural Integrity & Seismic Telemetry',
    experience: currentUser?.experience || '5+ Years',
    licenseNumber: currentUser?.licenseNumber || 'CWC-ENG-2024-884',
    emergencyContact: currentUser?.emergencyContact || '',
    bio:
      currentUser?.bio ||
      'Dedicated dam safety specialist monitoring live sensor telemetry, reservoir health, and predictive risk indicators.',
    avatarUrl: currentUser?.avatarUrl || '',
    onDuty: currentUser?.onDuty ?? true,
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: true,
    weeklyReports: true,
  });

  // Sync state if currentUser changes externally
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: currentUser.role || 'Safety Engineer',
        organization: currentUser.organization || 'Central Water Commission (CWC)',
        phone: currentUser.phone || '',
        designation: currentUser.designation || 'Dam Safety Engineer',
        assignedDam: currentUser.assignedDam || 'Tehri Dam (Uttarakhand)',
        specialization: currentUser.specialization || 'Structural Integrity & Seismic Telemetry',
        experience: currentUser.experience || '5+ Years',
        licenseNumber: currentUser.licenseNumber || 'CWC-ENG-2024-884',
        emergencyContact: currentUser.emergencyContact || '',
        bio:
          currentUser.bio ||
          'Dedicated dam safety specialist monitoring live sensor telemetry, reservoir health, and predictive risk indicators.',
        avatarUrl: currentUser.avatarUrl || '',
        onDuty: currentUser.onDuty ?? true,
      });
    }
  }, [currentUser]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setFormData((prev) => ({ ...prev, avatarUrl: base64Url }));
      updateProfile({ avatarUrl: base64Url });
      toast.success('Profile picture updated successfully!');
      setShowPresetPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    updateProfile({ avatarUrl: url });
    toast.success('Avatar preset applied!');
    setShowPresetPicker(false);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    updateProfile({ avatarUrl: '' });
    toast.success('Profile picture removed. Initials will be displayed.');
  };

  const handleToggleDuty = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, onDuty: checked }));
    updateProfile({ onDuty: checked });
    toast.success(checked ? 'Status set to: On Active Duty' : 'Status set to: Off Duty');
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Engineer profile updated successfully!');
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: currentUser.role || 'Safety Engineer',
        organization: currentUser.organization || 'Central Water Commission (CWC)',
        phone: currentUser.phone || '',
        designation: currentUser.designation || 'Dam Safety Engineer',
        assignedDam: currentUser.assignedDam || 'Tehri Dam (Uttarakhand)',
        specialization: currentUser.specialization || 'Structural Integrity & Seismic Telemetry',
        experience: currentUser.experience || '5+ Years',
        licenseNumber: currentUser.licenseNumber || 'CWC-ENG-2024-884',
        emergencyContact: currentUser.emergencyContact || '',
        bio: currentUser.bio || '',
        avatarUrl: currentUser.avatarUrl || '',
        onDuty: currentUser.onDuty ?? true,
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-secondary',
      'bg-accent',
      'bg-emerald-600',
      'bg-blue-600',
      'bg-violet-600',
    ];
    const hash = (name || 'User').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const lastLogin = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text mb-1">
            {currentUser?.role?.toLowerCase() === 'admin' ? 'Admin Profile & Credentials' : 'Engineer Profile & Credentials'}
          </h1>
          <p className="text-muted-foreground">
            Manage your personal credentials, assigned dam station, telemetry alerts, and profile picture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md px-4 py-2 rounded-xl border border-primary/20 shadow-sm">
            <span
              className={`w-3 h-3 rounded-full ${formData.onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`}
            />
            <span className="text-xs font-semibold text-foreground">
              {formData.onDuty ? 'On Active Duty' : 'Off Duty'}
            </span>
            <Switch
              checked={formData.onDuty}
              onCheckedChange={handleToggleDuty}
              aria-label="Toggle duty status"
            />
          </div>

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/90 shadow-md flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="glass-card">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Header Hero Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-primary/30 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar Section with Upload Controls */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.name || 'User'}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-primary/50 shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className={`w-32 h-32 md:w-36 md:h-36 rounded-2xl ${getAvatarColor(
                    formData.name || ''
                  )} flex items-center justify-center text-4xl md:text-5xl font-extrabold text-white shadow-2xl border-4 border-primary/40`}
                >
                  {getInitials(formData.name || 'User')}
                </div>
              )}

              {/* Status indicator on avatar */}
              <span
                className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-background shadow-md ${
                  formData.onDuty ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
                title={formData.onDuty ? 'On Active Duty' : 'Off Duty'}
              />

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Quick overlay camera trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Change Photo"
              >
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium">Upload Photo</span>
              </button>
            </div>

            {/* Photo Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-8 glass-card border-primary/40 hover:bg-primary/20 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                Upload Photo
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresetPicker(!showPresetPicker)}
                className="text-xs h-8 glass-card border-primary/40 hover:bg-primary/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                Presets
              </Button>

              {formData.avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  className="text-xs h-8 text-destructive hover:bg-destructive/10 px-2"
                  title="Remove custom photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Preset Avatar Selector Dropdown / Drawer */}
            {showPresetPicker && (
              <div className="p-3 glass-card rounded-xl border border-primary/30 shadow-lg mt-2 flex flex-col gap-2 w-full animate-in fade-in zoom-in-95">
                <span className="text-xs font-semibold text-muted-foreground text-center">
                  Select Preset Avatar:
                </span>
                <div className="flex items-center justify-center gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(preset.url)}
                      className="relative group/p rounded-lg overflow-hidden border border-primary/30 hover:border-primary transition-all hover:scale-110"
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-10 h-10 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Bio & Badges */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {formData.name || 'Engineer Name'}
              </h2>
              <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 font-semibold px-2.5 py-0.5">
                <Shield className="w-3.5 h-3.5 mr-1" />
                {formData.role}
              </Badge>
              {formData.licenseNumber && (
                <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 font-mono text-xs">
                  <Award className="w-3.5 h-3.5 mr-1" />
                  ID: {formData.licenseNumber}
                </Badge>
              )}
            </div>

            <p className="text-lg font-medium text-primary flex items-center justify-center md:justify-start gap-2">
              <HardHat className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{formData.designation || 'Dam Safety Engineer'}</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="truncate">{formData.assignedDam}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Building className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="truncate">{formData.organization}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{formData.phone || 'No phone provided'}</span>
              </div>
            </div>

            {formData.bio && (
              <p className="text-xs md:text-sm text-muted-foreground bg-card/40 backdrop-blur-sm p-3 rounded-xl border border-primary/10 mt-3 italic">
                "{formData.bio}"
              </p>
            )}
          </div>

          {/* Quick Last Login Card */}
          <div className="glass-card p-4 rounded-2xl border border-primary/20 text-xs space-y-2 flex-shrink-0 md:self-start">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <div className="font-semibold text-foreground">Last Session</div>
                <div className="text-muted-foreground text-[11px]">{lastLogin}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-primary/10 text-muted-foreground">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-foreground">Experience</div>
                <div className="text-muted-foreground text-[11px]">{formData.experience}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Editing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Engineer & Technical Profile (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Engineer Credentials */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-primary/30 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-primary/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/20 text-primary">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Engineer Credentials & Station</h3>
                  <p className="text-xs text-muted-foreground">Assigned dam, engineering domain & official identification</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Designation */}
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-sm font-medium">Designation / Title</Label>
                <div className="relative">
                  <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="designation"
                    placeholder="e.g. Senior Dam Safety Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-sm font-medium">Official CWC ID / License No.</Label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="licenseNumber"
                    placeholder="e.g. CWC-ENG-2024-884"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 font-mono text-sm focus:border-primary"
                  />
                </div>
              </div>

              {/* Assigned Dam */}
              <div className="space-y-2">
                <Label htmlFor="assignedDam" className="text-sm font-medium">Assigned Dam Facility</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  {isEditing ? (
                    <select
                      id="assignedDam"
                      value={formData.assignedDam}
                      onChange={(e) => setFormData({ ...formData, assignedDam: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background/60 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      {POPULAR_DAMS.map((dam) => (
                        <option key={dam} value={dam} className="bg-slate-900 text-foreground">
                          {dam}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="assignedDam"
                      value={formData.assignedDam}
                      disabled={true}
                      className="pl-10 glass-card bg-background/50"
                    />
                  )}
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-medium">Primary Technical Domain</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  {isEditing ? (
                    <select
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background/60 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec} className="bg-slate-900 text-foreground">
                          {spec}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      disabled={true}
                      className="pl-10 glass-card bg-background/50"
                    />
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="experience"
                    placeholder="e.g. 8+ Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Emergency Contact / Radio */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency On-Call Line / Radio ID</Label>
                <div className="relative">
                  <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="emergencyContact"
                    placeholder="e.g. +91 98765 00000 / VHF Ch 16"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="bio" className="text-sm font-medium">Professional Bio & Operational Scope</Label>
              <Textarea
                id="bio"
                placeholder="Describe your monitoring responsibilities, expertise, and safety protocols..."
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                className="glass-card bg-background/50 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Personal & Organization Details */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-primary/30 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-primary/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-secondary/20 text-secondary">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Contact & Agency Information</h3>
                  <p className="text-xs text-muted-foreground">Official contact details and organization affiliation</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Official Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="text-sm font-medium">Organization / Agency</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10 glass-card bg-background/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Quick Actions */}
        <div className="space-y-8">
          {/* Notification & Telemetry Preferences */}
          <div className="glass-card rounded-3xl p-6 border border-primary/30 shadow-lg space-y-6">
            <div className="flex items-center gap-2.5 border-b border-primary/20 pb-4">
              <div className="p-2 rounded-xl bg-accent/20 text-accent">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Alert Preferences</h3>
                <p className="text-xs text-muted-foreground">Emergency dispatch & notifications</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotif" className="font-semibold text-sm text-foreground cursor-pointer">
                    Email Telemetry Reports
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive daily health summaries & critical alerts</p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-3 pt-2 border-t border-primary/10">
                <div className="space-y-0.5">
                  <Label htmlFor="smsAlerts" className="font-semibold text-sm text-foreground cursor-pointer">
                    Emergency SMS Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">Instant SMS dispatch during Red SOS breach thresholds</p>
                </div>
                <Switch
                  id="smsAlerts"
                  checked={settings.smsAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsAlerts: checked })}
                />
              </div>

              <div className="flex items-start justify-between gap-3 pt-2 border-t border-primary/10">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklyReports" className="font-semibold text-sm text-foreground cursor-pointer">
                    Weekly AI Safety Audit
                  </Label>
                  <p className="text-xs text-muted-foreground">Weekly ML anomaly analysis and sensor drift digests</p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, weeklyReports: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Quick Safety Summary Card */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/20 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-foreground text-sm">Station Telemetry Status</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile is currently linked with real-time sensors at{' '}
              <strong className="text-foreground">{formData.assignedDam}</strong>. High priority alerts will be routed to your verified contact.
            </p>
            <div className="p-3 rounded-xl bg-card/60 border border-emerald-500/20 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Dam:</span>
                <span className="font-semibold text-emerald-400">{formData.assignedDam.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">License Verified:</span>
                <span className="font-semibold text-emerald-400">Yes (CWC Active)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
