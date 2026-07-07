import { useEffect, useState, useMemo, useRef } from 'react';
import { groupService, authService, expenseService, notificationService } from '../api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { IndianRupee, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, groupsRes, expensesRes] = await Promise.all([
          authService.getCurrentUser().catch(() => ({ data: { data: null } })),
          groupService.getGroupDashboard().catch(() => ({ data: { data: [] } })),
          expenseService.getUserExpenses().catch(() => ({ data: { data: [] } })),
        ]);
        setUser(userRes.data.data);
        setGroups(groupsRes.data.data || []);
        setExpenses(expensesRes.data.data || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute real balance summaries from live expense splits
  const { totalOwed, totalOwing, chartData } = useMemo(() => {
    const myId = user?._id;
    if (!myId) return { totalOwed: 0, totalOwing: 0, chartData: [] };

    let owed = 0;   // others owe me
    let owing = 0;  // I owe others
    const categoryTotals = {};

    expenses.forEach(exp => {
      const paidById = exp.paidBy?._id || exp.paidBy;
      const iPaid = paidById?.toString() === myId.toString();

      exp.splits?.forEach(s => {
        const uid = s.user?._id || s.user;
        const isMe = uid?.toString() === myId.toString();

        if (iPaid && !isMe && s.amount > 0) {
          owed += s.amount;
        }
        if (!iPaid && isMe && s.amount > 0) {
          owing += s.amount;
          // Only count MY spending share in the chart
          const cat = exp.category || 'Others';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + s.amount;
        }
      });
    });

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    return { totalOwed: owed, totalOwing: owing, chartData };
  }, [expenses, user]);

  const netBalance = totalOwed - totalOwing;

  if (loading) return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="h-12 w-12 rounded-full object-cover shadow-sm" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shadow-sm">
            {user?.username?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.username || user?.fullName || 'User'}</span>
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
              {netBalance >= 0 ? '+' : ''}₹{Math.abs(netBalance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netBalance >= 0 ? 'You are owed more than you owe' : 'You owe more than you are owed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalOwing.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending settlements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Are Owed</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{totalOwed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting from others</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Spending chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Your share of group expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No expense data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent groups */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
            <CardDescription>Active splits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No groups yet.</p>
              ) : (
                groups.slice(0, 6).map(g => (
                  <Link
                    key={g._id}
                    to={`/group/${g._id}`}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.members?.length || 0} members</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
