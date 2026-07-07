import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authService, groupService } from '../api/services';
import { useToast } from '../hooks/use-toast';
import { Search, UserPlus, X, UserPlus2 } from 'lucide-react';

export function AddMembersModal({ groupId, currentMembers = [], onAdded }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedFriends([]);
    }
  }, [open]);

  useEffect(() => {
    let ignore = false;
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await authService.searchUsers(searchQuery);
        if (!ignore) {
          // Filter out existing members and already selected friends
          const currentMemberIds = currentMembers.map(m => m._id || m);
          const selectedIds = selectedFriends.map(f => f._id);
          const filtered = (res.data.data || []).filter(u => 
            !currentMemberIds.includes(u._id) && !selectedIds.includes(u._id)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const debounceId = setTimeout(fetchUsers, 300);
    return () => {
      ignore = true;
      clearTimeout(debounceId);
    };
  }, [searchQuery, selectedFriends, currentMembers]);

  const addFriend = (user) => {
    setSelectedFriends(prev => [...prev, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFriend = (id) => {
    setSelectedFriends(prev => prev.filter(f => f._id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFriends.length === 0) return;
    
    setLoading(true);
    try {
      const memberIds = selectedFriends.map(f => f._id);
      await groupService.addMembersToGroup(groupId, { members: memberIds });
      toast({ title: 'Members added successfully!' });
      setOpen(false);
      if (onAdded) onAdded();
    } catch (err) {
      toast({ variant: 'destructive', title: err.response?.data?.message || 'Failed to add members' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus2 className="h-4 w-4" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Type username..." 
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
          
          <Button type="submit" className="w-full" disabled={loading || selectedFriends.length === 0}>
            {loading ? 'Adding...' : 'Add to Group'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
