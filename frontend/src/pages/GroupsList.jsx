import { useEffect, useState } from 'react';
import { groupService, authService } from '../api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Search, UserPlus, X } from 'lucide-react';

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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setName(''); setDescription(''); setSearchQuery('');
      setSearchResults([]); setSelectedFriends([]);
    }
  }, [open]);

  useEffect(() => {
    let ignore = false;
    
    if (searchQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        authService.searchUsers(searchQuery.trim())
          .then(res => {
            if (!ignore) setSearchResults(res.data.data);
          })
          .catch(console.error);
      }, 300);
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    } else {
      setSearchResults([]);
    }
    
    return () => {
      ignore = true;
    };
  }, [searchQuery]);

  const addFriend = (user) => {
    if (!selectedFriends.find(f => f._id === user._id)) {
      setSelectedFriends([...selectedFriends, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFriend = (userId) => {
    setSelectedFriends(selectedFriends.filter(f => f._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groupService.createGroup({ 
        name, 
        description,
        members: selectedFriends.map(f => f._id)
      });
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

          <div className="space-y-2">
            <Label>Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-9"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                  {searchResults.map(u => (
                    <div 
                      key={u._id} 
                      className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                      onClick={() => addFriend(u)}
                    >
                      <div className="flex items-center space-x-2">
                        {u.avatar ? (
                          <img src={u.avatar} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-white">
                            {u.username?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{u.username}</span>
                      </div>
                      <UserPlus className="h-4 w-4 text-emerald-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Display Selected Friends */}
            {selectedFriends.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFriends.map(f => (
                  <div key={f._id} className="flex items-center bg-muted px-2 py-1 rounded-md text-sm">
                    {f.avatar ? (
                      <img src={f.avatar} alt="avatar" className="h-4 w-4 rounded-full object-cover mr-1" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-slate-300 flex items-center justify-center text-[8px] font-bold text-white mr-1">
                        {f.username?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {f.username}
                    <X 
                      className="ml-2 h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeFriend(f._id)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
