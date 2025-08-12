type Props = {
  search: string;
  setSearch: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  emailVerified: string;
  setEmailVerified: (val: string) => void;
};

export default function SearchFilters({ search, setSearch, role, setRole, emailVerified, setEmailVerified }: Props) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        className="border p-2 rounded"
        placeholder="Search by name/email"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select className="border p-2 rounded" value={role} onChange={e => setRole(e.target.value)}>
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
      <select className="border p-2 rounded" value={emailVerified} onChange={e => setEmailVerified(e.target.value)}>
        <option value="">All</option>
        <option value="true">Verified</option>
        <option value="false">Unverified</option>
      </select>
    </div>
  );
}
