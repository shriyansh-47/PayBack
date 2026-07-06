import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService, expenseService } from '../api/services';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { Trash } from 'lucide-react';

export default function GroupView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroup = async () => {
    try {
      const res = await groupService.getGroupDetails(groupId);
      setGroup(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await groupService.deleteGroup(groupId);
      toast({ title: "Group Deleted" });
      navigate('/groups');
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to delete group" });
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  if (loading) return <div className="p-8">Loading group...</div>;
  if (!group) return <div className="p-8">Group not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>
        <div className="flex space-x-2">
          <AddExpenseModal groupId={groupId} onAdded={fetchGroup} />
          <SettleUpModal groupId={groupId} onSettled={fetchGroup} />
          <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Group">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {group.balances?.length === 0 ? (
              <p className="text-sm text-muted-foreground">All settled up!</p>
            ) : (
              <ul className="space-y-2">
                {group.balances?.map((b, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{b.fromUser}</span> owes <span className="font-medium">{b.toUser}</span> {b.amount} {b.currency}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



function SettleUpModal({ groupId, onSettled }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [toUser, setToUser] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await expenseService.settleUp({
        groupId,
        amount: Number(amount),
        toUser,
        currency: 'USD'
      });
      toast({ title: "Settled up" });
      setOpen(false);
      onSettled();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to settle up" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Settle Up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Debts</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Who are you paying?</Label>
            <Input placeholder="User ID" value={toUser} onChange={e => setToUser(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>Confirm Settlement</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
