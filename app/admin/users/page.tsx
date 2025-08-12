"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import SearchFilters from "./components/SearchFilters";
import UserTable from "./components/UserTable";
import Pagination from "./components/Pagination";
import ProfileModal from "./components/ProfileModal";
import type { User } from "../../../types/user";

export interface Order {
  _id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [emailVerified, setEmailVerified] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ✅ Memoized fetchUsers to avoid dependency warning
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (emailVerified) params.set("emailVerified", emailVerified);
      params.set("page", page.toString());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !Array.isArray(data.users)) {
        console.error("Invalid response", data);
        setUsers([]);
        setTotal(0);
        return;
      }

      setUsers(data.users);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotal(0);
    }
  }, [search, role, emailVerified, page]);

  // Fetch Orders for Selected User
  const fetchOrdersForUser = useCallback(async (userId: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/admin/orders/user/${userId}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        console.error("Error fetching orders:", data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    }
    setLoadingOrders(false);
  }, []);

  // View Profile + Orders
  const handleViewProfile = async (user: User) => {
    setSelectedUser(user);
    await fetchOrdersForUser(user._id);
  };

  // Change Role with all safety measures
  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user"
  ) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own role.");
      return;
    }

    if (!confirm("Are you sure you want to change this user's role?")) return;

    try {
      const res = await fetch("/api/admin/users/[id]/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Failed to parse JSON:", text);
        toast.error("Invalid server response.");
        return;
      }

      if (!res.ok) {
        toast.error(data?.error || "Failed to update role.");
        return;
      }

      toast.success("Role updated successfully");
      fetchUsers();

      // Update modal if same user
      setSelectedUser((prev) =>
        prev && prev._id === userId ? { ...prev, role: newRole } : prev
      );
    } catch (error) {
      console.error("Role change failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ✅ No more warning — fetchUsers is stable & in deps
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <SearchFilters
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        emailVerified={emailVerified}
        setEmailVerified={setEmailVerified}
      />

      <UserTable users={users} onViewProfile={handleViewProfile} />

      <Pagination page={page} total={total} setPage={setPage} />

      <ProfileModal
        user={selectedUser}
        orders={orders}
        loadingOrders={loadingOrders}
        onClose={() => setSelectedUser(null)}
        onRoleChange={handleRoleChange}
        currentUserId={currentUserId}
      />
    </div>
  );
}
