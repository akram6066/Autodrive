"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string | number | Date;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
  createdAt: string | number | Date;
}

interface ProfileModalProps {
  currentUserId: string;
  user: UserData | null;
  orders: Order[];
  loadingOrders: boolean;
  onClose: () => void;
  onRoleChange: (userId: string, newRole: "admin" | "user") => Promise<void>;
}

export default function ProfileModal({
  currentUserId,
  user,
  orders,
  loadingOrders,
  onClose,
  onRoleChange,
}: ProfileModalProps) {
  const [updatingRole, setUpdatingRole] = useState(false);

  if (!user) return null;

  const isSelf = user._id === currentUserId;

  const confirmRoleChange = (newRole: "admin" | "user") => {
    toast.custom(
      (t) => (
        <div
          className={`bg-white rounded-lg shadow-lg p-6 text-sm w-80 transition-all duration-300 ${
            t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <p className="font-medium text-center">
            Change{" "}
            <span className="text-blue-600 font-semibold">{user.name}</span>’s
            role to <strong>{newRole}</strong>?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setUpdatingRole(true);
                try {
                  await onRoleChange(user._id, newRole);
                  toast.success(`Role changed to ${newRole} for ${user.name}`, {
                    position: "top-center",
                  });
                } catch {
                  toast.error("Failed to change role.", {
                    position: "top-center",
                  });
                } finally {
                  setUpdatingRole(false);
                }
              }}
              className="flex-1 px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        id: "role-change-confirm",
        position: "top-center", // Centered position
        duration: Infinity, // Stays until user clicks
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">{user.name}’s Profile</h2>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <div>
            <strong>Role:</strong>
            <select
              value={user.role}
              onChange={(e) =>
                confirmRoleChange(e.target.value as "admin" | "user")
              }
              disabled={isSelf || updatingRole}
              className="ml-2 border rounded px-2 py-1 disabled:bg-gray-100"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {isSelf && (
              <p className="text-xs text-gray-500 mt-1">
                You cannot change your own role.
              </p>
            )}
          </div>

          <p>
            <strong>Email Verified:</strong>{" "}
            {user.emailVerified ? "Yes" : "No"}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(user.createdAt).toLocaleString()}
          </p>
        </div>

        <hr className="my-4" />

        <h3 className="text-lg font-semibold mb-2">Order History</h3>

        {loadingOrders ? (
          <p className="text-sm text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders found.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {orders.map((order) => (
              <li key={order._id} className="border rounded-md p-3 shadow-sm">
                <p>
                  <strong>Total:</strong> KES {order.total}
                </p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentMethod.toUpperCase()}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
