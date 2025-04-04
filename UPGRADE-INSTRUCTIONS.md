# Poiesis Pete Upgrade Instructions

This document outlines the steps needed to upgrade the Vercel AI Chatbot to Poiesis Pete with token tracking and admin features.

## 1. Install Required Dependencies

```bash
# Install LangChain for token tracking
pnpm add langchain langchain-openai

# Install other required dependencies
pnpm add recharts date-fns
```

## 2. Apply Database Migrations

After implementing the new schema changes with user roles, token tracking, and custom prompts, generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

## 3. Setup Admin User

To create your first admin user, connect to your database and run:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 4. Sync with Upstream Repository

Configure GitHub to automatically sync changes from the upstream repository (vercel/ai-chatbot):

1. Set up the GitHub Action for sync in `.github/workflows/sync-upstream.yml`
2. When the sync PR is created, carefully review changes to avoid overwriting your customizations
3. Resolve conflicts, especially in files like:
   - `app/(chat)/api/chat/route.ts` (token tracking)
   - `components/chat-header.tsx` (branding)
   - `components/app-sidebar.tsx` (admin menu)
   - `lib/db/schema.ts` (custom tables)

## 5. Token Usage Tracking Implementation

The implementation adds several key features:

1. **Database Schema**: Tables for token usage and user limits
2. **Token Tracking**: Integration with LangChain callbacks for accurate tracking
3. **Rate Limiting**: Prevents users from exceeding their daily token limits
4. **Admin Dashboard**: Provides analytics on token usage

## 6. Admin Dashboard Access

Once the implementation is complete, admin users can access the dashboard at `/admin` which shows:

- Token usage statistics
- User management
- Custom prompt management
- User limits configuration

## 7. Rebranding

The rebranding process involves:

1. Updating application metadata (package.json, layout.tsx)
2. Replacing Vercel branding with Poiesis Pete
3. Removing the "Deploy to Vercel" button
4. Customizing the sidebar and header components

## 8. Troubleshooting

If you encounter issues:

- Check database migrations are properly applied
- Verify user roles are correctly set in the database
- Ensure all dependencies are installed
- Check for console errors related to token tracking

For LangChain token tracking issues, refer to [LangChain documentation on token usage tracking](https://js.langchain.com/docs/how_to/chat_token_usage_tracking/). 