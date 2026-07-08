import { useState, useEffect, useMemo } from 'react';
import { expenseService, groupService, authService } from '../api/services';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { Users, Receipt, Calendar, ListPlus, Search, UserPlus, Plus } from 'lucide-react';

export function AddExpenseModal({ groupId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Others');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(groupId || '');
  
  // New Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Split State
  const [splitStrategy, setSplitStrategy] = useState('EQUAL');
  const [exactAmounts, setExactAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      // Fetch initial data
      authService.getCurrentUser().then(res => setCurrentUser(res.data.data)).catch(console.error);
      groupService.getGroupDashboard().then(res => setGroups(res.data.data || [])).catch(console.error);
    } else {
      // Reset state on close
      setAmount(''); setDesc(''); setSelectedGroup(''); setSelectedFriends([]);
      setNewGroupName(''); setSplitStrategy('EQUAL'); setExactAmounts({}); setPercentages({});
    }
  }, [open]);

  // Handle User Search
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
    if (!selectedFriends.find(f => f._id === user._id) && user._id !== currentUser?._id) {
      setSelectedFriends([...selectedFriends, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Dynamic Split Calculation
  const participants = useMemo(() => {
    if (selectedGroup === 'NEW_GROUP') {
      return currentUser ? [currentUser, ...selectedFriends] : selectedFriends;
    }
    // If existing group, we ideally need the group members. For simplicity, if we don't have members fetched, 
    // we just default EQUAL to everyone in the backend. 
    // But for the UI preview, we'll just show a placeholder if we don't have member details.
    const group = groups.find(g => g._id === selectedGroup);
    return group ? group.members : [];
  }, [selectedGroup, selectedFriends, currentUser, groups]);

  const total = Number(amount) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalGroupId = selectedGroup;

      // 1. Handle Inline Group Creation
      if (selectedGroup === 'NEW_GROUP') {
        if (!newGroupName || selectedFriends.length === 0) {
          toast({ variant: "destructive", title: "Missing group details" });
          setLoading(false);
          return;
        }
        
        const groupRes = await groupService.createGroup({
          name: newGroupName,
          description: "Created from Add Expense",
          members: selectedFriends.map(f => f._id)
        });
        finalGroupId = groupRes.data.data._id;
      }

      if (!finalGroupId) {
        toast({ variant: "destructive", title: "Please select or create a group" });
        setLoading(false);
        return;
      }

      // 2. Build Splits Array based on Strategy
      let finalSplits = [];
      if (splitStrategy === 'EXACT') {
        finalSplits = participants.map(p => ({
          user: p._id || p,
          amount: Number(exactAmounts[p._id || p]) || 0
        }));
        const sum = finalSplits.reduce((acc, s) => acc + s.amount, 0);
        if (Math.abs(sum - total) > 0.01) {
          toast({ variant: "destructive", title: "Exact amounts must equal total" });
          setLoading(false); return;
        }
      } else if (splitStrategy === 'PERCENTAGE') {
        finalSplits = participants.map(p => ({
          user: p._id || p,
          percentage: Number(percentages[p._id || p]) || 0,
          amount: (total * (Number(percentages[p._id || p]) || 0)) / 100
        }));
        const pSum = finalSplits.reduce((acc, s) => acc + s.percentage, 0);
        if (Math.abs(pSum - 100) > 0.01) {
          toast({ variant: "destructive", title: "Percentages must equal 100%" });
          setLoading(false); return;
        }
      } else {
        // EQUAL
        const splitAmount = total / (participants.length || 1);
        finalSplits = participants.map(p => ({
          user: p._id || p,
          amount: splitAmount
        }));
      }

      // 3. Submit Expense
      await expenseService.createExpense({
        groupId: finalGroupId,
        totalAmount: total,
        description: desc,
        category,
        date,
        currency: 'INR', // Default currency
        splitStrategy,
        splits: finalSplits.length > 0 ? finalSplits : undefined // Backend handles EQUAL internally if splits undefined, but we send it explicitly if we have members
      });

      toast({ title: "Expense Added Successfully" });
      setOpen(false);
      if (onAdded) onAdded();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to add expense" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full lg:w-auto bg-foreground hover:bg-foreground/90 text-background font-semibold transition-colors">
          <ListPlus className="mr-2 h-5 w-5" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold border-b pb-4">Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
          {/* Top: Giant Amount */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <Label className="text-muted-foreground font-medium">Amount</Label>
            <div className="flex items-center justify-center text-6xl md:text-6xl font-light text-foreground">
              <span className="text-foreground">₹</span>
              <Input 
                type="number" 
                step="0.01" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
                placeholder="0.00" 
                className="text-6xl md:text-6xl h-20 w-56 border-none bg-transparent shadow-none text-foreground placeholder:text-muted focus-visible:ring-0 px-2 caret-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase font-semibold">Description</Label>
              <div className="relative">
                <Receipt className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={desc} onChange={e => setDesc(e.target.value)} required placeholder="e.g. Dinner at Da Luigi" className="pl-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Dining Out</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="pl-9" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            {!groupId && (
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center">
                  <Users className="mr-2 h-4 w-4" /> Split With
                </Label>
              </div>
            )}

            {!groupId && (
              <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Group or Create New..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_GROUP" className="font-semibold">+ Create New Group...</SelectItem>
                  {groups.map(g => (
                    <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Inline Group Creation UI */}
            {selectedGroup === 'NEW_GROUP' && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-4 border">
                <Input 
                  placeholder="New Group Name" 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  required
                />
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users to add..." 
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
                          <Plus className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Split Strategy Toggle */}
            {participants.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex bg-muted rounded-md p-1">
                  {['EQUAL', 'PERCENTAGE', 'EXACT'].map(strat => (
                    <button
                      key={strat}
                      type="button"
                      onClick={() => setSplitStrategy(strat)}
                      className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${splitStrategy === strat ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {strat === 'PERCENTAGE' ? '%' : strat === 'EQUAL' ? 'Equal' : 'Exact'}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {participants.map(p => {
                    const isMe = p._id === currentUser?._id;
                    const splitVal = splitStrategy === 'EQUAL' 
                      ? (total / participants.length).toFixed(2) 
                      : '';

                    return (
                      <div key={p._id || p} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center space-x-2">
                          {p.avatar ? (
                            <img src={p.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isMe ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                              {isMe ? 'YOU' : (p.username?.substring(0, 2).toUpperCase() || 'U')}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{isMe ? 'You (Paid)' : (p.username || p.fullName || 'Member')}</p>
                          </div>
                        </div>
                        
                        <div>
                          {splitStrategy === 'EQUAL' && <span className="font-medium text-sm">₹{splitVal}</span>}
                          {splitStrategy === 'EXACT' && (
                            <div className="flex items-center">
                              <span className="text-muted-foreground text-sm mr-1">₹</span>
                              <Input 
                                type="number" step="0.01" className="w-20 h-8 text-right"
                                value={exactAmounts[p._id || p] || ''}
                                onChange={e => setExactAmounts({...exactAmounts, [p._id || p]: e.target.value})}
                              />
                            </div>
                          )}
                          {splitStrategy === 'PERCENTAGE' && (
                            <div className="flex items-center">
                              <Input 
                                type="number" step="1" className="w-16 h-8 text-right mr-1"
                                value={percentages[p._id || p] || ''}
                                onChange={e => setPercentages({...percentages, [p._id || p]: e.target.value})}
                              />
                              <span className="text-muted-foreground text-sm">%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-foreground hover:bg-foreground/90 text-background" disabled={loading}>
              Save Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
