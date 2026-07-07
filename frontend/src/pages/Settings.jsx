import { useEffect, useState } from 'react';
import { authService } from '../api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [avatar, setAvatar] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        setName(res.data.data?.fullName || '');
        setCurrency(res.data.data?.defaultCurrency || 'INR');
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await authService.updateSettings({ fullName: name, defaultCurrency: currency });
      toast({ title: "Profile updated successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAvatarSave = async (e) => {
    e.preventDefault();
    if (!avatar) {
      toast({ variant: "destructive", title: "Please select an image first" });
      return;
    }
    setLoadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      await authService.updateAvatar(formData);
      toast({ title: "Avatar updated successfully" });
      setAvatar(null);
    } catch (err) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to update avatar" });
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    setLoadingPassword(true);
    try {
      await authService.changePassword({ oldPassword, newPassword, confirmPassword });
      toast({ title: "Password changed successfully" });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to change password" });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (fetching) return <div className="p-8 text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loadingProfile}>
              {loadingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Avatar Update */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a new avatar image.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAvatarSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Image</Label>
              <Input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loadingAvatar || !avatar}>
              {loadingAvatar ? "Uploading..." : "Upload Avatar"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account security.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2 relative">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2 relative">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2 relative">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="destructive" disabled={loadingPassword}>
              {loadingPassword ? "Changing..." : "Change Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>

    </div>
  );
}
