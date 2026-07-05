import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Award, 
    Lock, 
    Phone, 
    Shield, 
    Sparkles, 
    UserCheck, 
    LogIn, 
    AlertCircle,
    BookOpen,
    Users,
    Star
} from 'lucide-react';
import { TEACHERS, Teacher } from '../data';

interface LoginPortalProps {
    onLogin: (user: { role: 'teacher' | 'admin', name: string, subject?: string, phone?: string }) => void;
}

export default function LoginPortal({ onLogin }: LoginPortalProps) {
    const [selectedRole, setSelectedRole] = useState<'teacher' | 'admin'>('teacher');
    const [phoneInput, setPhoneInput] = useState('');
    const [passcodeInput, setPasscodeInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleTeacherLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        // Normalize phone number (strip spaces, symbols, and make sure it has the core 9 digits)
        let cleaned = phoneInput.trim().replace(/[\s\-\+\(\)]/g, '');
        if (!cleaned) {
            setErrorMsg('الرجاء إدخال رقم الجوال');
            return;
        }

        // Standardize: if starts with 966, remove it
        if (cleaned.startsWith('966')) {
            cleaned = cleaned.substring(3);
        }
        // If has leading 0, remove it (e.g., 0505890712 -> 505890712)
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Find teacher
        const found = TEACHERS.find(t => {
            let tClean = t.phone.trim();
            if (tClean.startsWith('0')) tClean = tClean.substring(1);
            return tClean === cleaned;
        });

        if (found) {
            setSuccessMsg(`أهلاً ومرحباً بك أستاذ ${found.name} 👋`);
            setTimeout(() => {
                onLogin({
                    role: 'teacher',
                    name: found.name,
                    subject: found.subject,
                    phone: found.phone
                });
            }, 1000);
        } else {
            setErrorMsg('عذراً، رقم الجوال هذا غير مسجل في قائمة المعلمين المعتمدين بوزارة التعليم.');
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (passcodeInput.trim() === 'hadi') {
            setSuccessMsg('تم التحقق بنجاح! جاري دخول الإدارة...');
            setTimeout(() => {
                onLogin({
                    role: 'admin',
                    name: 'عبدالهادي بن محمد المحسن', // Primary Admin Name as configured in template
                });
            }, 1000);
        } else {
            setErrorMsg('الرمز السري غير صحيح. حاول مجدداً.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none" style={{ direction: 'rtl' }}>
            {/* Elegant Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            {/* Logo/Branding Header */}
            <motion.div 
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="text-center z-10 max-w-xl mx-auto mb-8"
            >
                <div className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-xl shadow-emerald-600/20 mb-4 border border-emerald-400">
                    <Award size={40} className="animate-float" />
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">بوابة رصد السلوك المتميز</h1>
                <p className="text-emerald-700 font-extrabold text-xs md:text-sm mt-2 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full inline-block border border-emerald-100">مدرسة الجشة المتوسطة</p>
                <p className="text-slate-500 font-bold text-xs md:text-sm mt-3 leading-relaxed">بوابة موحدة لرصد السلوك الإيجابي ومتابعة رصيد التميز الطلابي بفعالية عالية وبشكل مباشر</p>
            </motion.div>

            {/* Portal Login Container */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 md:p-8 relative z-10"
            >
                {/* Role Switcher tabs and animations */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-8">
                    <button
                        onClick={() => {
                            setSelectedRole('teacher');
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                            selectedRole === 'teacher' 
                            ? 'bg-white text-emerald-700 shadow-lg shadow-slate-200/50 scale-[1.02]' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <UserCheck size={16} />
                        <span>منصة المعلم</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedRole('admin');
                            setErrorMsg('');
                            setSuccessMsg('');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                            selectedRole === 'admin' 
                            ? 'bg-white text-emerald-700 shadow-lg shadow-slate-200/50 scale-[1.02]' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Shield size={16} />
                        <span>منصة الإدارة</span>
                    </button>
                </div>

                {/* Form fields */}
                <AnimatePresence mode="wait">
                    {selectedRole === 'teacher' ? (
                        <motion.form 
                            key="teacher-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleTeacherLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="block text-slate-700 text-xs md:text-sm font-black pr-1">رقم الجوال لتسجيل الدخول</label>
                                <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white px-4 py-3.5 rounded-2xl transition-all">
                                    <Phone className="text-slate-400 shrink-0 select-none ml-3" size={18} />
                                    <input 
                                        type="tel"
                                        placeholder="مثال: 505890712"
                                        value={phoneInput}
                                        onChange={(e) => setPhoneInput(e.target.value)}
                                        className="w-full bg-transparent text-slate-800 text-sm md:text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-0 select-text"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold pr-1 leading-relaxed">يمكنك الدخول مباشرةً باستخدام رقم جوالك المسجل والمعتمد في القائمة الرسمية المرفقة.</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
                            >
                                <LogIn size={18} />
                                <span>دخول المعلم</span>
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="admin-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleAdminLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="block text-slate-700 text-xs md:text-sm font-black pr-1">الرمز السري لوحدة الإدارة</label>
                                <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white px-4 py-3.5 rounded-2xl transition-all">
                                    <Lock className="text-slate-400 shrink-0 select-none ml-3" size={18} />
                                    <input 
                                        type="password"
                                        placeholder="أدخل رمز المرور السري"
                                        value={passcodeInput}
                                        onChange={(e) => setPasscodeInput(e.target.value)}
                                        className="w-full bg-transparent text-slate-800 text-sm md:text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-0 select-text"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-l from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
                            >
                                <LogIn size={18} />
                                <span>دخول الإدارة والتقارير</span>
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Notifications */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm font-bold rounded-2xl flex items-start gap-2.5 text-right"
                        >
                            <AlertCircle className="shrink-0 text-red-500 mt-0.5" size={16} />
                            <span>{errorMsg}</span>
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs md:text-sm font-extrabold rounded-2xl flex items-start gap-2.5 text-right"
                        >
                            <Sparkles className="shrink-0 text-emerald-500 mt-0.5" size={16} />
                            <span>{successMsg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Custom Student Counselor Credit */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center max-w-lg z-10"
            >
                <div className="bg-white/75 backdrop-blur-md border border-emerald-100 rounded-2xl px-6 py-3.5 shadow-md flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs md:text-sm">
                    <Sparkles className="text-amber-500 shrink-0" size={16} />
                    <span>إعداد الموجه الطلابي: عبدالهادي بن محمد المحسن</span>
                </div>
            </motion.div>
        </div>
    );
}
