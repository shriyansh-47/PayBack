import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService, authService } from '../api/services';
import { AddMembersModal } from '../components/AddMembersModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Trash } from 'lucide-react';

export default function GroupView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroup = async () => {
    try {
      const [groupRes, userRes, expensesRes] = await Promise.all([
        groupService.getGroupDetails(groupId),
        authService.getCurrentUser(),
        groupService.getGroupActivity(groupId),
      ]);
      setGroup(groupRes.data.data);
      setCurrentUser(userRes.data.data);
      setExpenses(expensesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this group? All expenses will be removed.")) return;
    try {
      await groupService.deleteGroup(groupId);
      toast({ title: "Group Deleted" });
      navigate('/groups');
    } catch (err) {
      toast({ variant: "destructive", title: err.response?.data?.message || "Failed to delete group" });
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (group?.name) {
      document.title = `${group.name} | PayBack`;
    } else {
      document.title = 'Group | PayBack';
    }
  }, [group?.name]);

  if (loading) return <div className="p-8">Loading group...</div>;
  if (!group) return <div className="p-8">Group not found.</div>;

  const createdById = group.createdBy?._id || group.createdBy;
  const isCreator = createdById?.toString() === currentUser?._id?.toString();
  const creatorName = group.createdBy?.username || group.createdBy?.fullName || 'Someone';
  const createdAt = new Date(group.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Created by <span className="font-medium text-foreground">{creatorName}</span> on {createdAt}
          </p>
        </div>
        <div className="flex space-x-2">
          {isCreator && (
            <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Group">
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Members</CardTitle>
            <AddMembersModal groupId={groupId} currentMembers={group.members} onAdded={fetchGroup} />
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {group.members?.map(m => (
                <li key={m._id} className="flex items-center gap-3 text-sm">
                  {m.avatar ? (
                    <img src={m.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                      {m.username?.[0]?.toUpperCase() || m.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-medium">{m.username || m.fullName}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {expenses.map(exp => (
                  <li key={exp._id} className="text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold">{exp.description}</p>
                      <p className="font-bold">₹{exp.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {exp.paidBy?.avatar ? (
                        <img src={exp.paidBy.avatar} alt="avatar" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {exp.paidBy?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Added by <span className="font-medium text-foreground">{exp.paidBy?.username || exp.paidBy?.fullName || 'Someone'}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(exp.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
