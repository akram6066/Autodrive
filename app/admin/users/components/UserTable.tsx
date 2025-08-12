// components/UserTable.tsx
import UserRow from "./UserRow";
import { User } from "@/types/user"; // Import the shared User type

interface UserTableProps {
  users: User[];
  onViewProfile: (user: User) => void;
}

export default function UserTable({ users, onViewProfile }: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 text-left text-xs uppercase">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Email Verified</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user._id} user={user} onViewProfile={onViewProfile} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
