"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiSearch, FiUsers, FiTrash2, FiCalendar, FiLoader,
    FiCheck, FiX, FiShield, FiDollarSign, FiShoppingBag,
    FiRefreshCw, FiMail, FiPhone, FiEdit, FiEye,
    FiUser, FiMapPin, FiBook, FiAward, FiPlus, FiBriefcase, FiUserCheck
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GROUP_META = {
    all: { title: "Admins", subtitle: "Manage the admin accounts of the platform", icon: FiUsers, newLabel: "Add Admin" },
};
const STAT_CONFIG = {
    all: [
        { key: "total", label: "Total Admins", grad: "from-gray-700 to-gray-900", icon: FiUsers },
        { key: "active", label: "Active", grad: "from-emerald-500 to-green-600", icon: FiCheck },
        { key: "blocked", label: "Blocked", grad: "from-rose-500 to-pink-600", icon: FiX },
    ],
};

function UsersContent() {
    const group = "all";
    const meta = GROUP_META.all;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({});
    const [viewingUser, setViewingUser] = useState(null);
    const token = useSelector(selectToken);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/users/admin/all?limit=100`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();

            if (data.success && data.data) {
                // Handle paginated response - data.data.data contains the users array
                const usersArray = Array.isArray(data.data) ? data.data : (data.data.data || []);
                setUsers(usersArray);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);


    const handleEdit = (user) => {
        setEditingUser(user._id);
        setEditData({
            role: user.role,
            status: user.status,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || ""
        });
    };

    const handleSave = async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/api/users/admin/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("User updated successfully");
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to update user");
            }
        } catch (err) {
            toast.error("Failed to update user");
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const res = await fetch(`${API_BASE}/api/users/admin/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("User deleted successfully");
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error("Error deleting user");
        }
    };

    const filtered = users.filter(u => {
        const matchSearch =
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === "active").length,
        blocked: users.filter(u => u.status === "blocked").length,
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
        };
        return styles[role] || "bg-gray-200 text-gray-600";
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        };
        return styles[status] || "bg-gray-100 text-gray-600";
    };

    const getRoleLabel = (role) => (role === "admin" ? "Admin" : role);

    // View User Modal
    const ViewUserModal = ({ user, onClose }) => {
        if (!user) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Avatar */}
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-t-2xl">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <FiX size={18} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                                )}
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                                <p className="text-white/80">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(user.status)}`}>
                                        {user.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="p-6 space-y-4">
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiUser className="text-primary" /> Contact Information
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <FiMail className="text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <FiPhone className="text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
                                    </div>
                                )}
                                {user.address && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <FiMapPin className="text-gray-400" />
                                        <span className="text-gray-600 dark:text-gray-300">{user.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiAward className="text-primary" /> Account Details
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Member Since</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })
                                            : "N/A"}
                                    </span>
                                </div>
                                {user.jobTitle && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Job Title</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{user.jobTitle}</span>
                                    </div>
                                )}
                                {user.companyName && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Company</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{user.companyName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">User ID</span>
                                    <span className="font-mono text-xs text-gray-400">{user._id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiBook className="text-primary" /> Bio
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{user.bio}</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => {
                                    onClose();
                                    handleEdit(user);
                                }}
                                className="flex-1 btn btn-primary"
                            >
                                <FiEdit size={16} /> Edit User
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* View Modal */}
            <AnimatePresence>
                {viewingUser && (
                    <ViewUserModal user={viewingUser} onClose={() => setViewingUser(null)} />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <meta.icon className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#021E14' }}>{meta.title}</h1>
                        <p className="text-[12px] text-gray-400 mt-0.5">{meta.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/admin/users/create"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                        style={{ background: "#E64266" }}>
                        <FiPlus size={16} /> {meta.newLabel}
                    </Link>
                    <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(STAT_CONFIG[group] || STAT_CONFIG.all).map((c) => (
                    <div key={c.key} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-lg`}>
                                <c.icon className="text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 tabular-nums">{stats[c.key] ?? 0}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            placeholder="Search users by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-12 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FiLoader className="animate-spin text-primary" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <FiUsers size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Contact</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => setViewingUser(user)}
                                                        className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors text-left"
                                                    >
                                                        {user.firstName} {user.lastName}
                                                    </button>
                                                    {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <FiMail className="text-gray-400" size={14} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editingUser === user._id ? (
                                                <select
                                                    value={editData.role}
                                                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:border-primary outline-none"
                                                >
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editingUser === user._id ? (
                                                <select
                                                    value={editData.status}
                                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:border-primary outline-none"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="blocked">Blocked</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(user.status)}`}>
                                                    {user.status?.toUpperCase() || "ACTIVE"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FiCalendar size={14} />
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {editingUser === user._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSave(user._id)}
                                                            className="w-8 h-8 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center"
                                                        >
                                                            <FiCheck size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="w-8 h-8 bg-gray-400 text-white rounded-lg hover:bg-gray-500 flex items-center justify-center"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setViewingUser(user)}
                                                            className="w-8 h-8 rounded-lg bg-[#0F3C53]/10 dark:bg-[#0F3C53]/30 text-[#0F3C53] flex items-center justify-center hover:bg-[#0F3C53]/20 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FiEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <FiEdit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UserManagement() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
            <UsersContent />
        </Suspense>
    );
}
