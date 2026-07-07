import { useEffect, useState } from 'react';
import { expenseService, authService } from '../api/services';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import {
  IndianRupee, ChevronDown, ChevronUp, User, Clock, FileText, ArrowRightLeft, Trash2, X
} from 'lucide-react';

/* ─── Glow Status Dot ─── */
function StatusDot({ settled }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: settled ? '#22C55E' : '#EF4444',
        boxShadow: settled
          ? '0 0 0 2px rgba(34,197,94,0.15), 0 0 6px 2px rgba(34,197,94,0.35), 0 0 12px 3px rgba(34,197,94,0.15)'
          : '0 0 0 2px rgba(239,68,68,0.15), 0 0 6px 2px rgba(239,68,68,0.35), 0 0 12px 3px rgba(239,68,68,0.15)',
      }}
    />
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settleTarget, setSettleTarget] = useState(null);
  const { toast } = useToast();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      expenseService.getUserExpenses(),
      authService.getCurrentUser(),
    ])
      .then(([expRes, userRes]) => {
        setExpenses(expRes.data.data || []);
        setCurrentUser(userRes.data.data);
      })
      .catch(err => console.error('Failed to fetch:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="p-8 text-muted-foreground">Loading expenses...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Expenses</h1>
        <p className="text-muted-foreground">A detailed ledger of everything you are involved in.</p>
      </div>

      <div className="grid gap-3">
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses found.</p>
        ) : (
          expenses.map(expense => (
            <ExpenseCard
              key={expense._id}
              expense={expense}
              currentUser={currentUser}
              onSettle={(exp, share) => setSettleTarget({ expense: exp, myShare: share })}
              onDelete={async (expId) => {
                try {
                  await expenseService.deleteExpense(expId);
                  toast({ title: 'Expense deleted' });
                  setExpenses(prev => prev.filter(e => e._id !== expId));
                } catch (err) {
                  toast({ variant: 'destructive', title: err.response?.data?.message || 'Failed to delete expense' });
                }
              }}
              onClear={async (expId, isPayer) => {
                try {
                  if (isPayer) {
                    // Creator clears a fully-settled expense → hard delete (safe, all splits = 0)
                    await expenseService.deleteExpense(expId);
                  } else {
                    // Non-payer clears their settled share → soft hide (persists, others unaffected)
                    await expenseService.hideExpense(expId);
                  }
                  toast({ title: 'Expense cleared' });
                  setExpenses(prev => prev.filter(e => e._id !== expId));
                } catch (err) {
                  toast({ variant: 'destructive', title: err.response?.data?.message || 'Failed to clear expense' });
                }
              }}
            />
          ))
        )}
      </div>

      {settleTarget && (
        <SettleModal
          expense={settleTarget.expense}
          defaultAmount={settleTarget.myShare}
          onClose={() => setSettleTarget(null)}
          onSettled={() => { setSettleTarget(null); fetchData(); }}
          toast={toast}
        />
      )}
    </div>
  );
}

/* ─── Individual Expense Card ─── */
function ExpenseCard({ expense, currentUser, onSettle, onDelete, onClear }) {
  const [expanded, setExpanded] = useState(false);

  const myId = currentUser?._id;
  const paidById = expense.paidBy?._id || expense.paidBy;
  const iPaid = paidById?.toString() === myId?.toString();

  const mySplit = expense.splits?.find(s => {
    const sid = s.user?._id || s.user;
    return sid?.toString() === myId?.toString();
  });
  const myShare = mySplit?.amount ?? 0;

  // I owe if I didn't pay AND still have remaining amount
  const iOwe = !iPaid && myShare > 0;
  // My own settled status (for the Clear button)
  const mySettled = iPaid || myShare <= 0;
  // Global status: green only when EVERY non-payer split is at 0
  const allSettled = expense.splits?.every(s => {
    const uid = s.user?._id || s.user;
    const isPayer = uid?.toString() === paidById?.toString();
    return isPayer || s.amount <= 0;
  }) ?? false;

  // Summary dot logic:
  // - If I'm the payer  → green only when allSettled (everyone paid me back)
  // - If I'm a non-payer → green when I personally settled my share
  const summarySettled = iPaid ? allSettled : mySettled;

  const paidByName = expense.paidBy?.username || expense.paidBy?.fullName || 'Someone';
  const createdAt = expense.createdAt || expense.date;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* ── Summary row ── */}
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 gap-4 text-left"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Summary dot: payer=allSettled, non-payer=mySettled */}
            <StatusDot settled={summarySettled} />
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{expense.description}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
                {' · '}{expense.category}
                {' · '}
                {iPaid
                  ? <span className="text-emerald-600 font-medium">You paid</span>
                  : <span>Paid by <span className="font-medium">{paidByName}</span></span>
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-bold flex items-center justify-end gap-0.5">
                <IndianRupee className="h-3.5 w-3.5" />
                {expense.totalAmount.toFixed(2)}
              </p>
              {iOwe && (
                <p className="text-xs text-destructive font-medium">
                  You owe ₹{myShare.toFixed(2)}
                </p>
              )}
              {!iOwe && !iPaid && (
                <p className="text-xs text-emerald-600 font-medium">Your share settled ✓</p>
              )}
              {iPaid && (
                <p className="text-xs font-medium" style={{ color: allSettled ? '#22C55E' : '#6b7280' }}>
                  {allSettled ? 'Fully settled ✓' : 'Awaiting payments'}
                </p>
              )}
            </div>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            }
          </div>
        </button>

        {/* ── Expanded detail panel ── */}
        {expanded && (
          <div className="border-t px-4 pb-4 pt-3 space-y-4 text-sm">

            {/* Description */}
            <div className="flex items-start gap-2 text-muted-foreground">
              <FileText className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{expense.description}</span>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>
                Created by{' '}
                <span className="font-medium text-foreground">{paidByName}</span>
              </span>
            </div>

            {/* Date & time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {new Date(createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {/* Members & per-person status dot */}
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wide mb-2">
                Split ({expense.splitStrategy})
              </p>
              <ul className="space-y-2">
                {expense.splits?.map((split, i) => {
                  const uid = split.user?._id || split.user;
                  const isMe = uid?.toString() === myId?.toString();
                  const name = split.user?.username || split.user?.fullName || 'Member';
                  const memberSettled = split.amount <= 0;
                  const isPayer = uid?.toString() === paidById?.toString();

                  return (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StatusDot settled={memberSettled || isPayer} />
                        <span className={`font-medium ${isMe ? 'text-emerald-600' : ''}`}>
                          {isMe ? 'You' : name}
                          {isPayer && <span className="ml-1 text-xs text-muted-foreground">(paid)</span>}
                        </span>
                      </div>
                      <span className={(memberSettled || isPayer) ? 'text-emerald-600 font-medium' : 'text-destructive font-medium'}>
                        {(memberSettled || isPayer) ? '✓ Settled' : `owes ₹${split.amount.toFixed(2)}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Activity Log */}
            {expense.settlements?.length > 0 && (
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wide mb-2">
                  Activity Log
                </p>
                <ul className="space-y-1.5">
                  {expense.settlements.map((s, i) => {
                    const payerName = s.paidBy?.username || s.paidBy?.fullName || 'Someone';
                    const receiverName = s.paidTo?.username || s.paidTo?.fullName || 'Someone';
                    const isMyPayment = (s.paidBy?._id || s.paidBy)?.toString() === myId?.toString();
                    return (
                      <li key={i} className="flex items-start justify-between gap-2 py-1 border-b last:border-0">
                        <span className="text-muted-foreground leading-snug">
                          <span className={`font-medium ${isMyPayment ? 'text-emerald-600' : 'text-foreground'}`}>
                            {isMyPayment ? 'You' : payerName}
                          </span>
                          {' paid '}
                          <span className="font-medium text-foreground">{receiverName}</span>
                          {' '}
                          <span className="font-semibold text-foreground">₹{s.amount.toFixed(2)}</span>
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {new Date(s.createdAt).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Settle — only when I owe */}
              {iOwe && (
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => onSettle(expense, myShare)}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Settle ₹{myShare.toFixed(2)}
                </Button>
              )}

              {/* Clear — visible once I have fully settled (not the payer, amount=0) */}
              {!iPaid && myShare <= 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => onClear(expense._id, false)}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear from View
                </Button>
              )}

              {/* Creator buttons: Clear when fully settled, Delete when still pending */}
              {iPaid && (
                allSettled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => onClear(expense._id, true)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear from View
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (window.confirm(`Delete "${expense.description}"? This will reverse all balances.`)) {
                        onDelete(expense._id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Expense
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Settle modal ─── */
function SettleModal({ expense, defaultAmount, onClose, onSettled, toast }) {
  const [amount, setAmount] = useState(defaultAmount.toFixed(2));
  const [loading, setLoading] = useState(false);

  const paidByName = expense.paidBy?.username || expense.paidBy?.fullName || 'them';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) {
      toast({ variant: 'destructive', title: 'Enter a valid amount' });
      return;
    }
    if (val > defaultAmount + 0.01) {
      toast({ variant: 'destructive', title: `You only owe ₹${defaultAmount.toFixed(2)}` });
      return;
    }
    setLoading(true);
    try {
      await expenseService.settleUp({ expenseId: expense._id, amount: val });
      toast({
        title: val >= defaultAmount - 0.01
          ? 'Fully settled! 🎉'
          : `₹${val.toFixed(2)} paid. Remaining: ₹${(defaultAmount - val).toFixed(2)}`
      });
      onSettled();
    } catch (err) {
      toast({ variant: 'destructive', title: err.response?.data?.message || 'Failed to settle' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Paying <span className="font-medium text-foreground">{paidByName}</span> for{' '}
          <span className="font-medium text-foreground">"{expense.description}"</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={defaultAmount}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Total owed: ₹{defaultAmount.toFixed(2)}. You can pay a partial amount.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? 'Paying...' : 'Confirm Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
