# PayBack (Splitter Engine) - AI Coding Guidelines

## 1. Project Philosophy
- **Minimalism:** Do not build fancy, premium, or "AI-looking" interfaces. Use shadcn/ui and Tailwind for strictly utilitarian, highly functional, and clean components.
- **Simplicity:** No heavy form libraries, no complex Aggregation pipelines unless strictly necessary, and no background workers.
- **Accuracy:** This is a financial ledger. Mathematical accuracy is paramount.

## 2. Technical Rules
- **Backend:** Node.js/Express.js + MongoDB. Follow the "Fat Model, Skinny Controller" pattern.
- **Database:** Use atomic `$inc` operators for all balance updates. Never compute balances in memory and save; always let the DB handle concurrency.
- **Frontend:** React (Vite). Use clean modals, simple forms, standard toast notifications, and basic Recharts for analytics.

## 3. Workflow Rules
- Always reference the project PRD before starting a new feature to ensure alignment with the architectural blueprint.
- When continuing work, analyze the existing codebase first. Integrate with existing code rather than rewriting it from scratch unless requested.
