import { useEffect, useState } from 'react';
import { authService } from '../api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

export default function Settings() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        setName(res.data.user?.name || '');
        setCurrency(res.data.user?.defaultCurrency || 'INR');
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateSettings({ name, defaultCurrency: currency });
      toast({ title: "Settings updated successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to update settings" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input value={currency} onChange={e => setCurrency(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
