/**
 * Simplifies debts among a group of people for a specific currency.
 * @param {Array} balances - Array of balance objects { fromUser, toUser, amount }
 * @returns {Array} simplifiedBalances - Array of simplified balance objects
 */
export const simplifyDebts = (balances) => {
    // 1. Calculate net balance for each user
    const netBalances = {};

    balances.forEach(balance => {
        const from = balance.fromUser.toString();
        const to = balance.toUser.toString();
        const amount = balance.amount;

        if (!netBalances[from]) netBalances[from] = 0;
        if (!netBalances[to]) netBalances[to] = 0;

        netBalances[from] -= amount; // fromUser owes money, so their balance decreases
        netBalances[to] += amount;   // toUser is owed money, so their balance increases
    });

    // 2. Separate into debtors and creditors
    const debtors = [];
    const creditors = [];

    for (const [user, amount] of Object.entries(netBalances)) {
        if (amount < -0.01) { // using 0.01 for floating point issues
            debtors.push({ user, amount: -amount });
        } else if (amount > 0.01) {
            creditors.push({ user, amount });
        }
    }

    // 3. Match debtors and creditors
    let i = 0; // debtors index
    let j = 0; // creditors index
    const simplifiedBalances = [];

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const minAmount = Math.min(debtor.amount, creditor.amount);

        simplifiedBalances.push({
            fromUser: debtor.user,
            toUser: creditor.user,
            amount: parseFloat(minAmount.toFixed(2))
        });

        debtor.amount -= minAmount;
        creditor.amount -= minAmount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return simplifiedBalances;
};
