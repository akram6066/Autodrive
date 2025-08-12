// components/UserRow.tsx
import { User } from "@/types/user"; // ✅ Use shared type
import Button from "@/components/ui/Button";

interface UserRowProps {
  user: User;
  onViewProfile: (user: User) => void;
}

export default function UserRow({ user, onViewProfile }: UserRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="p-3">{user.name}</td>
      <td className="p-3">{user.email}</td>
      <td className="p-3 capitalize">{user.role}</td>
      <td className="p-3">
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            user.emailVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {user.emailVerified ? "Verified" : "Unverified"}
        </span>
      </td>
      <td className="p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(user)}
        >
          View Profile
        </Button>
      </td>
    </tr>
  );
}
