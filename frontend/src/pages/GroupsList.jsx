import { useEffect, useState } from 'react';
import { groupService } from '../api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const res = await groupService.getGroupDashboard();
      setGroups(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage your split groups.</p>
        </div>
        <CreateGroupModal onCreated={fetchGroups} />
      </div>

      {loading ? (
        <div className="p-8">Loading groups...</div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You don't have any groups yet. Create one to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(g => (
            <Link key={g._id} to={`/group/${g._id}`}>
              <Card className="hover:bg-muted transition-colors h-full">
                <CardHeader>
                  <CardTitle>{g.name}</CardTitle>
                  <CardDescription>{g.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{g.members?.length || 0} members</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateGroupModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groupService.createGroup({ name, description });
      toast({ title: "Group Created" });
      setOpen(false);
      onCreated();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to create group" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
