"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiUser, FiMail, FiPhone, FiLock, FiSave, FiLoader,
    FiShield, FiCheck, FiEye, FiEyeOff
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectToken, updateUser } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
    const currentUser = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const dispatch = useDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser?.role === "manager") {
            router.replace("/dashboard/admin/tours");
        }
    }, [currentUser, router]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        avatar: "",
        bio: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || "",
                lastName: currentUser.lastName || "",
                email: currentUser.email || "",
                phone: currentUser.phone || "",
                avatar: currentUser.avatar || "",
                bio: currentUser.bio || "",
            });
        }
    }, [currentUser]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/users/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(formData),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                toast.success("Profile updated!");
                if (data.data) {
                    dispatch(updateUser(data.data));
                }
            } else toast.error(data.message || "Update failed");
        } catch { toast.error("Error updating profile"); }
        finally { setLoading(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/update-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                    confirmNewPassword: passwordData.confirmPassword,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                toast.success("Password changed!");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else toast.error(data.message || "Failed to change password");
        } catch { toast.error("Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <FiUser className="text-white text-xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
                    <p className="text-sm text-gray-500">Manage your account</p>
                </div>
            </div>

            <div className="space-y-10">
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleProfileUpdate} className="card p-6 space-y-6 max-w-2xl">
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl mb-6">
                        <FiUser className="text-primary" size={24} />
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Profile Information</p>
                            <p className="text-sm text-gray-500">Update your personal details</p>
                        </div>
                    </div>
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                {formData.avatar ? <img src={formData.avatar} alt="" className="w-full h-full object-cover" /> : `${formData.firstName?.[0]}${formData.lastName?.[0]}`}
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</p>
                            <p className="text-sm text-gray-500">{currentUser?.role?.toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">First Name</label>
                            <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="input" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Last Name</label>
                            <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="input" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Email</label>
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input pl-11" disabled />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Phone</label>
                        <div className="relative">
                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input pl-11" />
                        </div>
                    </div>

                    <ImageInput
                        label="Avatar"
                        value={formData.avatar}
                        onChange={(v) => setFormData({ ...formData, avatar: v })}
                        labelClass="text-xs font-bold text-gray-500 uppercase block mb-2"
                        inputClass="input"
                    />

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Bio</label>
                        <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="input resize-none" />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? <FiLoader className="animate-spin" /> : <FiSave />} Update Profile
                    </button>
                </motion.form>

                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handlePasswordChange} className="card p-6 space-y-6 max-w-2xl">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <FiShield className="text-amber-600" size={24} />
                        <div>
                            <p className="font-bold text-amber-800 dark:text-amber-200">Security Settings</p>
                            <p className="text-sm text-amber-600 dark:text-amber-300">Change your password</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Current Password</label>
                        <div className="relative">
                            {!passwordData.currentPassword && <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                            <input type={showCurrent ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={`input pr-12 ${passwordData.currentPassword ? 'pl-4' : 'pl-11'}`} required />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">New Password</label>
                        <div className="relative">
                            {!passwordData.newPassword && <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                            <input type={showNew ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={`input pr-12 ${passwordData.newPassword ? 'pl-4' : 'pl-11'}`} required minLength={6} />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Confirm New Password</label>
                        <div className="relative">
                            {!passwordData.confirmPassword && <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                            <input type={showConfirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={`input pr-12 ${passwordData.confirmPassword ? 'pl-4' : 'pl-11'}`} required />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? <FiLoader className="animate-spin" /> : <FiCheck />} Change Password
                    </button>
                </motion.form>
            </div>
        </div>
    );
}
