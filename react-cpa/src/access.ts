// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    // admin: currentUser?.roles?.includes('admin') || false,
    admin: true,
  };
}
