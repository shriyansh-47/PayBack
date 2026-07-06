import { useEffect, useState } from 'react';
import { expenseService } from '../api/services';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseService.getUserExpenses()
      .then(res => setExpenses(res.data.data))
      .catch(err => console.error("Failed to fetch expenses:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading expenses...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Expenses</h1>
        <p className="text-muted-foreground">A detailed ledger of everything you are involved in.</p>
      </div>

      <div className="grid gap-4">
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses found.</p>
        ) : (
          expenses.map(expense => (
            <Card key={expense._id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold">{expense.description}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()} • {expense.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{expense.totalAmount.toFixed(2)} {expense.currency}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
