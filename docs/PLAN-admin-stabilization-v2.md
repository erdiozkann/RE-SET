# PLAN-admin-stabilization-v2.md

## 1. Project Overview
- **Goal**: Resolve "Admin Panel Not Loading" issue and fully stabilize the Admin Dashboard.
- **Context**: Previous fixes (RLS, AuthContext, .htaccess) resolved specific errors, but the panel remains inaccessible (stuck on loading or redirect loop).
- **Strategy**: Multi-Agent Orchestration (Backend, Frontend, Test Engineer).

## 2. Root Cause Hypothesis
1. **RLS Recursion/Timeout**: Even with non-recursive policies, specific queries in `AdminPage.tsx` components (DashboardTab, AppointmentsTab) might be failing silently or timing out.
2. **Component Crash**: A child component of `AdminPage` might be throwing an error during render that isn't caught by an Error Boundary.
3. **State Mismatch**: `AuthContext` might show user as authenticated, but `useRequireAdmin` hook inside components might be returning false due to race conditions.

## 3. Phase 1: Diagnosis & Immediate Fixes (P0)

### 3.1. Backend Specialist (Auth & RLS)
- [ ] **Audit RLS Policies**: Verify `fix_users_rls.sql` application.
- [ ] **Check RPC/Edge Functions**: Ensure no hidden triggers are blocking admin actions.
- [ ] **Fix `clients` Table**: Confirm `email` column exists and is indexed for performance.

### 3.2. Frontend Specialist (Routing & State)
- [ ] **Implement Error Boundary**: Wrap `AdminPage` in a React Error Boundary to catch render crashes.
- [ ] **Debug `activeTab` Rendering**: Isolate which tab causes the crash (start with empty dashboard).
- [ ] **Verify `ProtectedRoute`**: Ensure it handles `loading` state correctly without infinite waits.

### 3.3. Test Engineer (Verification)
- [ ] **Manual Test**: Login as `info@re-set.com.tr`.
- [ ] **Console Audit**: Check for "React Minified Error" or Network 403/500 errors.
- [ ] **LocalStorage Check**: Verify `sb-*-auth-token` persistence.

## 4. Phase 2: Code Health & Optimization (P1)
- [ ] **Refactor `AdminPage`**: Lazy load all tabs to isolate failures.
- [ ] **Unify Supabase Client**: Ensure singleton pattern across app.
- [ ] **Add Loading Skeletons**: Improve UX during data fetch.

## 5. Agent Assignments
| Agent | Role | Responsibilities |
|-------|------|------------------|
| `backend-specialist` | Database & API | RLS fixes, SQL schema verification. |
| `frontend-specialist` | UI/UX & React | Component debugging, Error Boundaries, Routing. |
| `test-engineer` | QA & Validation | Login flows, Console error analysis, Verification. |

## 6. Execution Steps
1. **Frontend**: Add Error Boundary to `AdminPage.tsx`.
2. **Frontend**: Comment out all tabs in `AdminPage.tsx` except a simple "Hello Admin" text to verify basic access.
3. **Backend**: Re-verify `clients` table schema via SQL.
4. **Test**: Check if "Hello Admin" appears.
5. **Frontend**: Uncomment tabs one by one to find the crasher.
