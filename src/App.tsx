import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Award, 
    Calendar,
    ChevronLeft, 
    CircleAlert, 
    CircleCheck, 
    CirclePlus, 
    Crown, 
    Edit2,
    FileSpreadsheet, 
    FileText, 
    Filter, 
    History, 
    Medal, 
    MessageCircle,
    MousePointerClick,
    RotateCcw,
    Search, 
    Sparkles, 
    Star, 
    Trash2, 
    TrendingUp, 
    Trophy, 
    Upload, 
    UserMinus,
    Users, 
    X,
    Menu,
    LogOut,
    UserCheck,
    Lock,
    PieChart as PieIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { read, utils } from 'xlsx';
import { saveAs } from 'file-saver';
import { INITIAL_STUDENTS, BEHAVIOR_CATEGORIES, GRADES, Student, Behavior, TEACHERS, Teacher } from './data';
import { generateWordReport, generateComprehensiveReport, generateLiveLogsReport, generateTeacherReport } from './utils/wordGenerator';
import LoginPortal from './components/LoginPortal';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, writeBatch, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

// Components
const CountUp = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = count;
        if (start === value) return;
        const step = value > start ? 1 : -1;
        const timer = setInterval(() => {
            start += step;
            setCount(start);
            if (start === value) clearInterval(timer);
        }, 40);
        return () => clearInterval(timer);
    }, [value]);
    return <span className="animate-count-up font-inherit leading-none">{count}</span>;
};

const StatusBadge = ({ points }: { points: number }) => {
    if (points >= 20) return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg border border-yellow-300/30"
        >
            <Crown size={12} className="shrink-0" />
            <span>تميز ماسي</span>
        </motion.div>
    );
    if (points >= 15) return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 px-3 py-1 rounded-full text-[10px] font-black shadow-md border border-amber-300/50"
        >
            <Trophy size={12} className="shrink-0" />
            <span>تميز ذهبي</span>
        </motion.div>
    );
    if (points >= 10) return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-slate-200 to-slate-400 text-slate-800 px-3 py-1 rounded-full text-[10px] font-black shadow-md border border-slate-300/50"
        >
            <Medal size={12} className="shrink-0" />
            <span>تميز فضي</span>
        </motion.div>
    );
    if (points >= 5) return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-300 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md border border-orange-400/30"
        >
            <Award size={12} className="shrink-0" />
            <span>تميز برونزي</span>
        </motion.div>
    );
    return null;
};

const BackgroundAnimation = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-400/10 rounded-full animate-blob blur-xl" />
        <div className="absolute top-40 left-20 w-56 h-56 bg-teal-300/10 rounded-full animate-blob blur-xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-cyan-400/10 rounded-full animate-blob blur-xl" style={{ animationDelay: '4s' }} />
        <div className="absolute -top-10 left-1/2 w-4 h-4 bg-emerald-500/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-teal-500/30 rounded-full animate-float-reverse" />
        <div className="absolute bottom-1/3 left-10 w-5 h-5 bg-cyan-500/20 rounded-full animate-float-slow" />
    </div>
);

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    key?: string;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className={`fixed top-4 md:top-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[200] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center gap-2 md:gap-3 backdrop-blur-xl border ${
                type === 'success' ? 'bg-emerald-600/95 text-white border-emerald-400/50' : 'bg-red-600/95 text-white border-red-400/50'
            }`}
        >
            <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="shrink-0"
            >
                {type === 'success' ? <CircleCheck size={20} className="md:size-[24px]" /> : <CircleAlert size={20} className="md:size-[24px]" />}
            </motion.div>
            <span className="font-black text-sm md:text-lg flex-1 text-center md:text-right">{message}</span>
            <button onClick={onClose} className="mr-2 md:mr-4 opacity-70 hover:opacity-100 transition-opacity p-1">
                <X size={16} className="md:size-[18px]" />
            </button>
        </motion.div>
    );
};

const parseTeacherFromSource = (source: string) => {
    if (!source) return { name: "منظومة السلوك", subject: "إدارة المدرسة" };
    const match = source.match(/^أ\.\s*(.+?)\s*\((.+?)\)$/);
    if (match) {
        return { name: match[1], subject: match[2] };
    }
    if (source.startsWith("أ. ")) {
        return { name: source.substring(3), subject: "معلم" };
    }
    return { name: source, subject: "إدارة المدرسة" };
};

const TeachersLeaderboardModal = ({ students, onClose }: { students: Student[], onClose: () => void }) => {
    const teacherStats = React.useMemo(() => {
        const statsMap: Record<string, { name: string; subject: string; count: number; points: number }> = {};
        
        students.forEach(s => {
            (s.behaviors || []).forEach(b => {
                const rawSource = b.source || "غير محدد";
                const { name, subject } = parseTeacherFromSource(rawSource);
                
                if (rawSource === "نظام رصد السلوك" || rawSource === "إدارة المدرسة" || name === "نظام رصد السلوك") {
                    return;
                }

                const key = name.trim();
                if (!statsMap[key]) {
                    statsMap[key] = {
                        name: key,
                        subject: subject,
                        count: 0,
                        points: 0
                    };
                }
                statsMap[key].count += 1;
                statsMap[key].points += (b.points || 0);
            });
        });

        return Object.values(statsMap).sort((a, b) => b.count - a.count);
    }, [students]);

    const totalRecordings = teacherStats.reduce((acc, curr) => acc + curr.count, 0);
    const maxRecordings = teacherStats.length > 0 ? Math.max(...teacherStats.map(t => t.count)) : 1;

    const getTeacherBehaviors = (teacherName: string) => {
        const list: any[] = [];
        students.forEach(s => {
            (s.behaviors || []).forEach(b => {
                const rawSource = b.source || "غير محدد";
                const { name } = parseTeacherFromSource(rawSource);
                if (name.trim() === teacherName.trim()) {
                    list.push({
                        studentName: s.name,
                        behaviorTitle: b.behaviorTitle,
                        date: b.date,
                        points: b.points || 0
                    });
                }
            });
        });
        return list;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-4 text-right"
            style={{ direction: 'rtl' }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                className="relative bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-gradient-to-l from-teal-600 via-emerald-600 to-emerald-500 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 pointer-events-none text-right">
                        <div className="absolute top-2 left-10 text-4xl md:text-6xl opacity-10 animate-float">🎖️</div>
                        <div className="absolute bottom-2 right-10 text-3xl md:text-5xl opacity-10 animate-float-reverse">✨</div>
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="text-right">
                            <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 md:gap-3">
                                <Award size={24} className="md:size-[28px] text-teal-100" />
                                صدارة مبادرة رصد المعلمين
                            </h2>
                            <p className="text-teal-100 text-[10px] md:text-xs font-bold mt-1">تكريم للمعلمين الحريصين على متابعة ورصد سلوك طلابهم المتميز</p>
                        </div>
                        <button onClick={onClose} className="bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-colors">
                            <X size={20} className="md:size-[22px]" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-b border-slate-100 text-center shrink-0">
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                        <span className="text-slate-400 text-[9px] md:text-xs font-bold font-sans">المعلمون الحاضرون</span>
                        <span className="text-xs md:text-sm font-black text-slate-800 mt-0.5">{teacherStats.length} معلماً</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                        <span className="text-slate-400 text-[9px] md:text-xs font-bold">الأكثر رصداً</span>
                        <span className="text-xs md:text-sm font-black text-emerald-600 truncate px-1 mt-0.5" title={teacherStats[0]?.name}>{teacherStats[0]?.name || "لا يوجد بعد"}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                        <span className="text-slate-400 text-[9px] md:text-xs font-bold font-sans">إجمالي الرصد السلوكي</span>
                        <span className="text-xs md:text-sm font-black text-indigo-600 mt-0.5">{totalRecordings} رصدة</span>
                    </div>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/20 text-right">
                    {teacherStats.length > 0 ? (
                        <div className="space-y-3.5">
                            {teacherStats.map((teacher, index) => {
                                const percentage = Math.round((teacher.count / maxRecordings) * 100);
                                return (
                                    <motion.div
                                        key={`teacher-leader-${teacher.name}`}
                                        initial={{ opacity: 0, x: 35 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex flex-col p-4 rounded-2xl border-2 transition-all hover:scale-[1.01] hover:shadow-md ${
                                            index === 0 
                                            ? "bg-gradient-to-l from-yellow-50/70 via-amber-50/50 to-yellow-101 border-yellow-300 ring-2 ring-yellow-400/20" 
                                            : index === 1 
                                            ? "bg-slate-50/50 border-slate-300" 
                                            : index === 2 
                                            ? "bg-orange-50/40 border-amber-200" 
                                            : "bg-white border-slate-100"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {index === 0 ? (
                                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 border border-yellow-200">
                                                        <Crown size={22} />
                                                    </div>
                                                ) : index === 1 ? (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                        <Medal size={20} />
                                                    </div>
                                                ) : index === 2 ? (
                                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
                                                        <Medal size={18} />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 font-extrabold text-sm md:text-base flex items-center justify-center border border-slate-200">
                                                        {index + 1}
                                                    </div>
                                                )}
                                                
                                                <div className="text-right">
                                                    <h3 className="font-black text-sm md:text-base text-slate-900 flex items-center gap-1.5">
                                                        {teacher.name}
                                                    </h3>
                                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">مادة: {teacher.subject || "غير محدد"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => {
                                                        const behaviors = getTeacherBehaviors(teacher.name);
                                                        generateTeacherReport(teacher.name, teacher.subject || "غير محدد", behaviors);
                                                    }}
                                                    className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-black px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 text-[10px] md:text-xs cursor-pointer select-none"
                                                    title="تصدير تقرير رصد المعلم بصيغة Word"
                                                >
                                                    <FileText size={13} className="text-teal-600" />
                                                    <span>تصدير Word</span>
                                                </button>

                                                <div className="text-left shrink-0">
                                                    <div className="font-extrabold text-xs md:text-sm text-slate-800">
                                                        <span className="text-teal-600 font-black text-sm md:text-lg font-mono ml-0.5">{teacher.count}</span> رصدة سلوكية
                                                    </div>
                                                    <div className="text-[9px] md:text-xs text-slate-400 font-bold mt-1">
                                                        إجمالي النقاط: <span className="font-mono text-slate-600 font-black">{teacher.points}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3.5">
                                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mb-1">
                                                <span>نسبة التفاعل السلوكي</span>
                                                <span className="font-mono text-slate-600">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                        index === 0 
                                                        ? "bg-gradient-to-l from-yellow-500 to-amber-500" 
                                                        : index === 1 
                                                        ? "bg-slate-400" 
                                                        : index === 2 
                                                        ? "bg-amber-600" 
                                                        : "bg-teal-500"
                                                    }`} 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400">
                            <Award size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-black">لا توجد سجلات رصد من المعلمين حالياً</p>
                        </div>
                    )}
                </div>

                <div className="p-4 md:p-5 bg-gradient-to-l from-slate-50 to-slate-100 border-t border-slate-200/60 shrink-0 text-center">
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 inline-flex items-center gap-2 max-w-md shadow-inner text-emerald-850 text-xs md:text-sm font-black text-right" style={{ color: '#064e3b' }}>
                        <Sparkles size={16} className="text-amber-500 shrink-0 animate-pulse" />
                        <span>يُستحق التكريم والمكافآت لأعلى المعلمين رصداً ومتابعة لسلوك الطلاب المتميز كتقدير من الإدارة لجهودهم.</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const LeaderboardModal = ({ students, onClose }: { students: Student[], onClose: () => void }) => {
    const [filterGrade, setFilterGrade] = useState('الكل');
    const availableGrades = [...new Set(students.map(s => s.grade))].sort();
    
    const filtered = students
        .filter(s => filterGrade === 'الكل' || s.grade === filterGrade)
        .filter(s => s.totalPoints > 0)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20);

    const uniquePoints = Array.from(new Set(filtered.map(s => s.totalPoints))).sort((a, b) => b - a);

    const getRankIcon = (points: number) => {
        const rankIndex = uniquePoints.indexOf(points);
        if (rankIndex === 0) return <Crown size={24} className="text-yellow-400 md:size-[28px]" />;
        if (rankIndex === 1) return <Medal size={20} className="text-slate-400 md:size-[24px]" />;
        if (rankIndex === 2) return <Medal size={18} className="text-amber-700 md:size-[22px]" />;
        return <span className="text-slate-400 font-black text-sm md:text-lg">{rankIndex + 1}</span>;
    };

    const getRankBg = (points: number) => {
        const rankIndex = uniquePoints.indexOf(points);
        if (rankIndex === 0) return "bg-gradient-to-l from-yellow-50 via-amber-50 to-yellow-100 border-yellow-300 shadow-yellow-100/50";
        if (rankIndex === 1) return "bg-gradient-to-l from-slate-50 to-slate-100 border-slate-300 shadow-slate-100/50";
        if (rankIndex === 2) return "bg-gradient-to-l from-orange-50 to-amber-50 border-amber-300 shadow-amber-50/50";
        return "bg-white border-slate-100";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                className="relative bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-gradient-to-l from-amber-500 via-yellow-500 to-orange-500 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-10 text-4xl md:text-6xl opacity-10 animate-float">🏆</div>
                        <div className="absolute bottom-2 right-10 text-3xl md:text-5xl opacity-10 animate-float-reverse">⭐</div>
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="text-right">
                            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2 md:gap-3">
                                <Trophy size={24} className="md:size-[32px]" />
                                لوحة المتصدرين
                            </h2>
                            <p className="text-yellow-100 text-[10px] md:text-sm font-bold mt-1">أبطال السلوك الإيجابي المتميز</p>
                        </div>
                        <button onClick={onClose} className="bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-colors">
                            <X size={20} className="md:size-[22px]" />
                        </button>
                    </div>
                    <div className="mt-4 md:mt-5 relative z-10">
                        <div className="relative group">
                            <select 
                                value={filterGrade} 
                                onChange={(e) => setFilterGrade(e.target.value)}
                                className="appearance-none bg-white/95 text-amber-900 border-none font-black text-xs md:text-sm px-5 py-2.5 md:py-3 pr-10 rounded-xl md:rounded-2xl cursor-pointer outline-none shadow-xl w-full text-right"
                            >
                                <option value="الكل">🏆 جميع الفصول ({students.filter(s => s.totalPoints > 0).length} بطل)</option>
                                {availableGrades.map(g => (
                                    <option key={`lead-grade-${g}`} value={g}>{g} ({students.filter(s => s.grade === g && s.totalPoints > 0).length})</option>
                                ))}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-600/50">
                                <ChevronLeft size={16} className="-rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
                    {filtered.length > 0 ? (
                        <div className="space-y-2 md:space-y-3">
                            {filtered.map((student, index) => (
                                <motion.div
                                    key={`leaderboard-${student.id}`}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 ${getRankBg(student.totalPoints)} transition-all hover:scale-[1.01] hover:shadow-lg`}
                                >
                                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
                                        {getRankIcon(student.totalPoints)}
                                    </div>
                                    <div className="flex-1 min-w-0 text-right">
                                        <div className={`text-[15px] md:text-lg font-medium leading-tight ${uniquePoints.indexOf(student.totalPoints) === 0 ? 'text-amber-800' : 'text-slate-800'}`}>
                                            {student.name}
                                        </div>
                                        <div className="text-[10px] md:text-xs text-slate-400 font-bold mt-0.5">{student.grade}</div>
                                    </div>
                                    <div className={`font-black text-lg md:text-2xl text-left ${uniquePoints.indexOf(student.totalPoints) === 0 ? 'text-amber-600' : uniquePoints.indexOf(student.totalPoints) < 3 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                        {student.totalPoints}
                                        <span className="text-[9px] md:text-xs font-bold text-slate-400 mr-1 uppercase">نقطة</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 md:py-20 text-slate-300">
                            <Trophy size={48} className="md:size-[64px] mx-auto mb-4 opacity-10" />
                            <p className="font-black text-base md:text-lg">لا يوجد متصدرون في هذه الفئة</p>
                            <p className="text-[10px] md:text-xs mt-1 font-bold">ابدأ بمنح النقاط للطلاب ليظهروا هنا</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatsDashboardModal = ({ students, onClose }: { students: Student[], onClose: () => void }) => {
    // 1. Calculate stats per grade
    const gradeStats = GRADES.map(grade => {
        const gradeStudents = students.filter(s => s.grade === grade);
        const totalPoints = gradeStudents.reduce((sum, s) => sum + s.totalPoints, 0);
        const studentCount = gradeStudents.length;
        const averagePoints = studentCount > 0 ? Number((totalPoints / studentCount).toFixed(1)) : 0;
        return {
            name: grade,
            value: totalPoints, // for PieChart compatibility
            studentCount,
            averagePoints
        };
    }).filter(stat => stat.studentCount > 0); // only show grades with students

    // Sort by total points descending
    const sortedStats = [...gradeStats].sort((a, b) => b.value - a.value);

    // General School KPIs
    const totalSchoolPoints = students.reduce((sum, s) => sum + s.totalPoints, 0);
    const totalStudentsCount = students.length;
    const avgSchoolPoints = totalStudentsCount > 0 ? Number((totalSchoolPoints / totalStudentsCount).toFixed(1)) : 0;
    
    // Find leading class
    const leadingGrade = sortedStats[0]?.name || "لا يوجد";

    // Define beautiful custom colors
    const COLORS = [
        '#059669', // Emerald
        '#2563eb', // Blue
        '#4f46e5', // Indigo
        '#d97706', // Amber
        '#7c3aed', // Purple
        '#db2777', // Pink
        '#0891b2', // Cyan
        '#ea580c', // Orange
        '#16a34a', // Green
    ];

    // Tooltip custom component
    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 text-white p-4 rounded-2xl border border-slate-700 shadow-xl text-right text-xs" style={{ direction: 'rtl' }}>
                    <p className="font-cairo-extrabold text-emerald-400 text-sm mb-1">{data.name}</p>
                    <p className="font-bold text-slate-200">مجموع النقاط: <span className="text-white text-sm font-black">{data.value}</span> نقطة</p>
                    <p className="text-slate-400 font-medium font-tajawal-normal">عدد الطلاب: {data.studentCount} طلاب</p>
                    <p className="text-slate-400 font-medium font-tajawal-normal">متوسط نقاط الطالب: {data.averagePoints} نقطة</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                className="relative bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[92vh] md:max-h-[88vh] overflow-hidden flex flex-col border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with gradient match to our themes */}
                <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 left-10 text-4xl md:text-6xl opacity-10 animate-float">📊</div>
                        <div className="absolute bottom-2 right-10 text-3xl md:text-5xl opacity-10 animate-float-reverse">📈</div>
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="text-right" dir="rtl">
                            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2 md:gap-3">
                                <PieIcon size={24} className="md:size-[32px] text-emerald-200" />
                                لوحة مؤشرات الفصول الإحصائية
                            </h2>
                            <p className="text-emerald-100 text-[10px] md:text-sm font-bold mt-1 font-tajawal-normal">توزيع وتحليل نقاط التميز السلوكي على مستوى الفصول الدراسية</p>
                        </div>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors shrink-0">
                            <X size={20} className="md:size-[22px]" />
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/50 space-y-6">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right flex flex-col justify-between" dir="rtl">
                            <span className="text-[10px] md:text-xs text-slate-400 font-extrabold block">إجمالي نقاط المدرسة</span>
                            <div className="mt-2 text-xl md:text-3xl font-cairo-extrabold text-indigo-600">
                                <CountUp value={totalSchoolPoints} />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right flex flex-col justify-between" dir="rtl">
                            <span className="text-[10px] md:text-xs text-slate-400 font-extrabold block">الصف الدراسي المتصدر</span>
                            <div className="mt-2 text-[14px] md:text-lg font-cairo-extrabold text-emerald-600 truncate">
                                {leadingGrade}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right flex flex-col justify-between" dir="rtl">
                            <span className="text-[10px] md:text-xs text-slate-400 font-extrabold block">معدل نقاط الطالب</span>
                            <div className="mt-2 text-xl md:text-3xl font-cairo-extrabold text-amber-600">
                                {avgSchoolPoints} <span className="text-[10px] md:text-xs text-slate-400 font-bold">نقطة</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right flex flex-col justify-between" dir="rtl">
                            <span className="text-[10px] md:text-xs text-slate-400 font-extrabold block">إجمالي الطلاب</span>
                            <div className="mt-2 text-xl md:text-3xl font-cairo-extrabold text-slate-700">
                                <CountUp value={totalStudentsCount} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Right side: Recharts Pie Chart */}
                        <div className="lg:col-span-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <h3 className="text-slate-700 text-xs md:text-sm font-extrabold mb-4 text-right w-full" dir="rtl">النسبة المئوية لتوزيع النقاط</h3>
                            
                            {totalSchoolPoints > 0 ? (
                                <div className="h-64 sm:h-72 w-full min-w-0 flex items-center justify-center relative" style={{ direction: 'ltr' }}>
                                    <ResponsiveContainer width="100%" height={252} minWidth={0}>
                                        <PieChart>
                                            <Pie
                                                data={gradeStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {gradeStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomPieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute text-center" style={{ direction: 'rtl' }}>
                                        <p className="text-[10px] md:text-xs text-slate-400 font-extrabold leading-none">مجموع النقاط</p>
                                        <p className="text-xl md:text-3xl font-cairo-extrabold text-slate-700 leading-tight mt-1">{totalSchoolPoints}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-300 w-full" dir="rtl">
                                    <PieIcon size={48} className="opacity-10 mb-2" />
                                    <p className="text-sm font-bold">لا تتوفر نقاط كافية لتمثيل الرسم البياني</p>
                                </div>
                            )}

                            {/* Color Legend (Custom RTL lists) */}
                            {totalSchoolPoints > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-4 text-right w-full font-tajawal-normal text-[11px] md:text-xs px-2" dir="rtl">
                                    {gradeStats.map((entry, index) => {
                                        const percent = totalSchoolPoints > 0 ? ((entry.value / totalSchoolPoints) * 100).toFixed(1) : 0;
                                        return (
                                            <div key={`legend-item-${index}`} className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-slate-600 font-semibold truncate flex-1">{entry.name}</span>
                                                <span className="text-slate-400 font-bold">({percent}%)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Left side: Detailed Table */}
                        <div className="lg:col-span-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-slate-700 text-xs md:text-sm font-extrabold mb-4 text-right" dir="rtl">تحليل الأداء التفصيلي للفصول</h3>
                            
                            <div className="overflow-x-auto" dir="rtl">
                                <table className="w-full text-right text-xs md:text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400">
                                            <th className="pb-3 pt-1 font-extrabold pr-2">الفصل الدراسي</th>
                                            <th className="pb-3 pt-1 font-extrabold text-center">الطلاب</th>
                                            <th className="pb-3 pt-1 font-extrabold text-center">النقاط</th>
                                            <th className="pb-3 pt-1 font-extrabold text-center pl-2">متوسط الطالب</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sortedStats.map((stat, index) => {
                                            const progressWidth = totalSchoolPoints > 0 ? (stat.value / totalSchoolPoints) * 100 : 0;
                                            return (
                                                <tr key={`stat-row-${index}`} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 pr-2 font-bold text-slate-800">
                                                        <div className="flex flex-col">
                                                            <span>{stat.name}</span>
                                                            <div className="w-24 md:w-32 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                                <div 
                                                                    className="h-full rounded-full transition-all duration-500"
                                                                    style={{ 
                                                                        width: `${progressWidth}%`,
                                                                        backgroundColor: COLORS[index % COLORS.length]
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-center font-bold text-slate-500">{stat.studentCount}</td>
                                                    <td className="py-3 text-center font-black text-slate-700">{stat.value}</td>
                                                    <td className="py-3 text-center font-extrabold text-indigo-600 pl-2">
                                                        {stat.averagePoints}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-950/90 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-right text-xs" style={{ direction: 'rtl' }}>
                <p className="font-extrabold text-emerald-400 mb-1">{data.date === 'البداية' ? 'تصفير النقاط' : data.date}</p>
                {data.day && <p className="text-slate-300 font-bold mb-1">اليوم: {data.day}</p>}
                {data.title && data.date !== 'البداية' && (
                    <p className="text-slate-200 font-medium mb-1 truncate max-w-[200px]">السلوك: {data.title}</p>
                )}
                <div className="flex justify-between gap-4 mt-2 pt-1.5 border-t border-slate-800">
                    <span className="font-black text-emerald-300">+{data.pointsAdded}</span>
                    <span className="text-slate-400">النقاط المضافة</span>
                </div>
                <div className="flex justify-between gap-4 mt-1">
                    <span className="font-black text-amber-400">{data.cumulativePoints} / 20</span>
                    <span className="text-slate-400">الرصيد التراكمي</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function App() {
    const [currentUser, setCurrentUser] = useState<{ role: 'teacher' | 'admin', name: string, subject?: string, phone?: string } | null>(() => {
        const saved = localStorage.getItem("pos_behavior_user");
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return null;
    });

    const [students, setStudents] = useState<Student[]>([]);
    const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterGrade, setFilterGrade] = useState("الكل");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showBehaviorForm, setShowBehaviorForm] = useState(false);
    const [customPoints, setCustomPoints] = useState(0);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showTeachersLeaderboard, setShowTeachersLeaderboard] = useState(false);
    const [showStatsDashboard, setShowStatsDashboard] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
    const [lastAssignedStudents, setLastAssignedStudents] = useState<Student[]>([]);
    const [bulkFilterGrade, setBulkFilterGrade] = useState("الكل");
    const [bulkStep, setBulkStep] = useState<'select' | 'assign'>('select');
    const [editingBehaviorId, setEditingBehaviorId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Behavior | null>(null);
    const [behaviorSort, setBehaviorSort] = useState<'date' | 'points'>('date');
    const [behaviorDate, setBehaviorDate] = useState(new Date().toISOString().split('T')[0]);
    const [behaviorSource, setBehaviorSource] = useState("نظام رصد السلوك");
    const [showSidebar, setShowSidebar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("pos_behavior_user", JSON.stringify(currentUser));
            if (currentUser.role === 'teacher') {
                setBehaviorSource(`أ. ${currentUser.name} (${currentUser.subject})`);
            } else {
                setBehaviorSource("إدارة المدرسة");
            }
        } else {
            localStorage.removeItem("pos_behavior_user");
        }
    }, [currentUser]);

    const getStudentChartData = (student: Student | null) => {
        if (!student || !student.behaviors) return [];
        // Sort oldest to newest (chronological order)
        // behaviors has b.date, we can parse it/sort it.
        // Dates in Saudi locale are usually like `dd/mm/yyyy` or standard string format. Let's do a robust chronological sort.
        const sorted = [...student.behaviors].sort((a, b) => {
            // Try to parse standard dd/mm/yyyy formatted by toLocaleDateString('ar-SA')
            const parseDate = (dStr: string) => {
                const parts = dStr.split('/');
                if (parts.length === 3) {
                    // toLocaleDateString ar-SA or similar: parts[0] is day/year depending on locale representation
                    // We assume dd/mm/yyyy or yyyy/mm/dd. Let's check part lengths.
                    if (parts[2].length === 4) { // dd/mm/yyyy
                        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
                    } else if (parts[0].length === 4) { // yyyy/mm/dd
                        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
                    }
                }
                return new Date(dStr).getTime() || 0;
            };
            return parseDate(a.date) - parseDate(b.date);
        });

        let sum = 0;
        const pts = sorted.map((b, idx) => {
            sum += b.points;
            return {
                index: idx + 1,
                date: b.date,
                day: b.day,
                pointsAdded: b.points,
                cumulativePoints: sum,
                title: b.behaviorTitle
            };
        });
        return [{ index: 0, date: 'البداية', day: '', pointsAdded: 0, cumulativePoints: 0, title: 'البداية' }, ...pts];
    };

    useEffect(() => {
        // Subscribe to students in real-time
        const qStudents = collection(db, "students");
        const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
            if (snapshot.empty) {
                console.info("Firestore: Students collection is empty. Seeding INITIAL_STUDENTS...");
                const batch = writeBatch(db);
                INITIAL_STUDENTS.forEach((student) => {
                    const docRef = doc(db, "students", student.id);
                    batch.set(docRef, student);
                });
                batch.commit().then(() => {
                    console.info("Firestore: Initial student data synchronized successfully.");
                }).catch((err) => {
                    console.error("Firestore: Seeding failed:", err);
                });
            } else {
                const docsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Student[];
                
                // Keep the list sorted chronologically/numerically by Student ID
                docsList.sort((a, b) => {
                    const idA = parseInt(a.id.replace(/\D/g, '')) || 0;
                    const idB = parseInt(b.id.replace(/\D/g, '')) || 0;
                    if (idA !== idB) return idA - idB;
                    return a.name.localeCompare(b.name, 'ar');
                });
                setStudents(docsList);
            }
        }, (error) => {
            console.error("Firestore: Students snap subscription failed:", error);
        });

        // Subscribe to central behavior logs feed (recent actions)
        const qLogs = query(collection(db, "behavior_logs"), orderBy("timestamp", "desc"), limit(25));
        const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
            const logsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBehaviorLogs(logsList);
        }, (error) => {
            console.error("Firestore: Logs snap subscription failed:", error);
        });

        return () => {
            unsubscribeStudents();
            unsubscribeLogs();
        };
    }, []);

    const fireCelebration = () => {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b']
        });
        setTimeout(() => {
            confetti({
                particleCount: 60,
                spread: 120,
                origin: { y: 0.7 },
                colors: ['#059669', '#14b8a6']
            });
        }, 300);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = utils.sheet_to_json(ws, { header: 1 }) as any[][];

                if (data.length < 2) {
                    setNotification({ message: "الملف فارغ أو غير صالح", type: "error" });
                    return;
                }

                const imported: Student[] = data.slice(1)
                    .filter(row => row[0])
                    .map((row, idx) => ({
                        id: `s-imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                        name: String(row[0]).trim(),
                        nationalId: "",
                        grade: String(row[1] || "غير محدد").trim(),
                        phone: String(row[2] || "غير محدد").trim(),
                        totalPoints: 0,
                        behaviors: []
                    }));

                const batch = writeBatch(db);
                imported.forEach(s => {
                    batch.set(doc(db, "students", s.id), s);
                });
                await batch.commit();

                setNotification({ message: `✨ تم استيراد ${imported.length} طالب بنجاح!`, type: "success" });
                fireCelebration();
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch (err) {
                setNotification({ message: "حدث خطأ أثناء قراءة الملف", type: "error" });
            }
        };
        reader.readAsBinaryString(file);
    };

    const getDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', { weekday: 'long' });
    };

    const addBehavior = async (studentId: string, pointInput: number, title: string) => {
        const points = pointInput === 0 ? customPoints : pointInput;
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        
        // Prevent duplicate behavior titles in same date
        if (student.behaviors && student.behaviors.some(b => b.behaviorTitle === title && b.date === new Date(behaviorDate).toLocaleDateString('ar-SA'))) {
            setNotification({ message: "تم رصد هذا السلوك مسبقاً لهذا الطالب في هذا التاريخ", type: "error" });
            return;
        }

        // Max points constraint (20)
        if (student.totalPoints >= 20) {
            setNotification({ message: "⚠️ استنفذ الطالب كامل درجات السلوك المتميز (20 درجة)", type: "error" });
            return;
        }

        const remaining = 20 - student.totalPoints;
        const finalPoints = points > remaining ? remaining : points;

        const newBehavior: Behavior = {
            id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date: new Date(behaviorDate).toLocaleDateString('ar-SA'),
            day: getDayName(behaviorDate),
            behaviorTitle: title,
            points: finalPoints,
            source: behaviorSource
        };

        const updatedStudent: Student = {
            ...student,
            totalPoints: student.totalPoints + finalPoints,
            behaviors: [newBehavior, ...(student.behaviors || [])]
        };

        try {
            await setDoc(doc(db, "students", studentId), updatedStudent);

            const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await setDoc(doc(db, "behavior_logs", logId), {
                id: logId,
                teacherName: currentUser?.name || "معلم",
                studentId,
                studentName: student.name,
                category: title,
                points: finalPoints,
                date: new Date(behaviorDate).toLocaleDateString('ar-SA'),
                timestamp: Date.now()
            });

            if (updatedStudent.totalPoints >= 20) {
                setNotification({ message: "✅ تم الوصول للحد الأعلى للسلوك المتميز (20 درجة)", type: "success" });
            } else {
                setNotification({ message: `🏆 تم رصد: ${title}`, type: "success" });
            }

            if (selectedStudent?.id === studentId) setSelectedStudent(updatedStudent);
            fireCelebration();
        } catch (error) {
            console.error("Firestore add behavior failed:", error);
            setNotification({ message: "حدث خطأ في مزامنة الرصد مع قاعدة البيانات", type: "error" });
        }

        setCustomPoints(0);
        setShowBehaviorForm(false);
    };

    const handleBulkAssign = async (pointInput: number, title: string) => {
        const currentSelectedIds = [...selectedForBulk];
        let countAssigned = 0;
        let countSkipped = 0;

        const batch = writeBatch(db);
        const assignedStudents: Student[] = [];

        for (const s of students) {
            if (!currentSelectedIds.includes(s.id)) continue;

            const hasDuplicateByDay = s.behaviors && s.behaviors.some(
                b => b.behaviorTitle === title && b.date === new Date(behaviorDate).toLocaleDateString('ar-SA')
            );

            if (hasDuplicateByDay || s.totalPoints >= 20) {
                countSkipped++;
                continue;
            }

            const points = pointInput;
            const remaining = 20 - s.totalPoints;
            const finalPoints = points > remaining ? remaining : points;

            const newBehavior: Behavior = {
                id: `b-bulk-${Date.now()}-${s.id}-${Math.random().toString(36).substr(2, 5)}`,
                date: new Date(behaviorDate).toLocaleDateString('ar-SA'),
                day: getDayName(behaviorDate),
                behaviorTitle: title,
                points: finalPoints,
                source: behaviorSource
            };

            const updatedObj: Student = {
                ...s,
                totalPoints: s.totalPoints + finalPoints,
                behaviors: [newBehavior, ...(s.behaviors || [])]
            };

            batch.set(doc(db, "students", s.id), updatedObj);
            assignedStudents.push(updatedObj);

            // Create global log
            const logId = `log-bulk-${Date.now()}-${s.id}-${Math.random().toString(36).substring(2, 6)}`;
            batch.set(doc(db, "behavior_logs", logId), {
                id: logId,
                teacherName: currentUser?.name || "معلم",
                studentId: s.id,
                studentName: s.name,
                category: title,
                points: finalPoints,
                date: new Date(behaviorDate).toLocaleDateString('ar-SA'),
                timestamp: Date.now()
            });

            countAssigned++;
        }

        if (countAssigned > 0) {
            try {
                await batch.commit();
                setLastAssignedStudents(assignedStudents);
                setNotification({ 
                    message: `✅ تم رصد السلوك لـ ${countAssigned} طالب بنجاح! ${countSkipped > 0 ? `(تجاوز ${countSkipped} طلاب للحد أو التكرار)` : ''}`, 
                    type: "success" 
                });
                fireCelebration();
            } catch (error) {
                console.error("Firestore bulk assign failed:", error);
                setNotification({ message: "حدث خطأ في مزامنة الرصد الجماعي مع قاعدة البيانات", type: "error" });
            }
        } else {
            setNotification({ 
                message: "⚠️ لم يتم إضافة أي نقاط (تأكد من عدم التكرار أو تم بلوغ الحد الأقصى 20)", 
                type: "error" 
            });
        }

        setSelectedForBulk([]);
    };

    const toggleStudentSelection = (id: string) => {
        setSelectedForBulk(prev => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const selectAllFiltered = () => {
        const filteredIds = filteredStudents.map(s => s.id);
        if (filteredIds.every(id => selectedForBulk.includes(id))) {
            setSelectedForBulk(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedForBulk(prev => [...new Set([...prev, ...filteredIds])]);
        }
    };

    const handleUpdateBehavior = async (studentId: string, behaviorId: string, updatedData: Partial<Behavior>) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        // Find behavior index
        const bIdx = student.behaviors.findIndex(b => b.id === behaviorId);
        if (bIdx === -1) return;

        const oldBehavior = student.behaviors[bIdx];
        const newPoints = updatedData.points !== undefined ? updatedData.points : oldBehavior.points;
        const currentTotalWithoutOld = student.totalPoints - oldBehavior.points;

        if (currentTotalWithoutOld + newPoints > 20) {
            setNotification({ message: "تعديل النقاط سيتجاوز الحد الأعلى (20 درجة)", type: "error" });
            return;
        }

        const updatedBehaviors = [...student.behaviors];
        updatedBehaviors[bIdx] = { ...oldBehavior, ...updatedData };

        const updatedStudent: Student = {
            ...student,
            totalPoints: currentTotalWithoutOld + newPoints,
            behaviors: updatedBehaviors
        };

        try {
            await setDoc(doc(db, "students", studentId), updatedStudent);
            if (selectedStudent?.id === studentId) setSelectedStudent(updatedStudent);
            setNotification({ message: "📝 تم تحديث السلوك بنجاح", type: "success" });
        } catch (error) {
            console.error("Firestore edit error:", error);
            setNotification({ message: "تعذر حفظ التعديلات في السحابة المزامنة", type: "error" });
        }

        setEditingBehaviorId(null);
        setEditFormData(null);
    };

    const handleDeleteBehavior = async (studentId: string, behaviorId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        const behaviorToDelete = student.behaviors.find(b => b.id === behaviorId);
        if (!behaviorToDelete) return;

        const updatedBehaviors = student.behaviors.filter(b => b.id !== behaviorId);
        const updatedStudent: Student = {
            ...student,
            totalPoints: student.totalPoints - behaviorToDelete.points,
            behaviors: updatedBehaviors
        };

        try {
            await setDoc(doc(db, "students", studentId), updatedStudent);
            if (selectedStudent?.id === studentId) setSelectedStudent(updatedStudent);
            setNotification({ message: "🗑️ تم حذف السجل بنجاح", type: "success" });
        } catch (error) {
            console.error("Firestore delete behavior error:", error);
            setNotification({ message: "فشل حذف السجل الكترونياً", type: "error" });
        }
    };

    const sendWhatsAppMessage = (student: Student) => {
        const message = `السلام عليكم ورحمة الله وبركاته،

نهنئكم بحصول ابننا المتميز/ ${student.name}
على نقاط السلوك المتميز ( ${student.totalPoints} / 20 ). 

نشكركم ونشكر الطالب على مثابرته واجتهاده في تطبيق قيم السلوك الإيجابي، والتميز في البيئة المدرسية، متمنين له دوام التوفيق والنجاح.

مدرسة الجشة المتوسطة
الموجه الطلابي: عبدالهادي بن محمد المحسن`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${student.phone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const displayedStudents = React.useMemo(() => {
        return students.map(s => {
            if (currentUser && currentUser.role === 'teacher') {
                const teacherBehaviors = (s.behaviors || []).filter(b => 
                    b.source === behaviorSource || 
                    (b.source && b.source.includes(currentUser.name))
                );
                const teacherPoints = teacherBehaviors.reduce((acc, b) => acc + b.points, 0);
                return {
                    ...s,
                    behaviors: teacherBehaviors,
                    totalPoints: teacherPoints
                };
            }
            return s;
        });
    }, [students, currentUser, behaviorSource]);

    const filteredStudents = displayedStudents
        .filter(s => filterGrade === "الكل" || s.grade === filterGrade)
        .filter(s => {
            const term = searchTerm.trim().toLowerCase();
            if (!term) return true;
            return (
                s.name.toLowerCase().includes(term) || 
                s.grade.toLowerCase().includes(term) || 
                s.phone.includes(term) ||
                s.nationalId?.includes(term)
            );
        });

    const availableGrades = [...new Set(students.map(s => s.grade))].sort();
    const totalPointsOverall = displayedStudents.reduce((acc, s) => acc + s.totalPoints, 0);
    const gradeStudentCount = filterGrade === "الكل" ? displayedStudents.length : displayedStudents.filter(s => s.grade === filterGrade).length;

    if (!currentUser) {
        return <LoginPortal onLogin={(user) => setCurrentUser(user)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 text-slate-900 pb-28 relative">
            <BackgroundAnimation />
            
            {/* شريط التحكم في الاختيارات العائم */}
            <AnimatePresence>
                {selectedForBulk.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[90] w-full max-w-2xl px-4"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3 md:gap-4 overflow-hidden">
                            <div className="flex items-center gap-3 md:gap-4 pr-1 md:pr-2">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/40 text-sm md:text-base">
                                    {selectedForBulk.length}
                                </div>
                                <div>
                                    <div className="text-white font-bold text-[10px] md:text-sm">طالباً مختاراً</div>
                                    <button 
                                        onClick={() => setSelectedForBulk([])}
                                        className="text-emerald-400 text-[8px] md:text-[10px] font-black hover:text-emerald-300 transition-colors uppercase tracking-wider"
                                    >
                                        إلغاء التحديد
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-1.5 md:gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => generateComprehensiveReport(students.filter(s => selectedForBulk.includes(s.id)), "مجموعة طلاب")}
                                    className="bg-gradient-to-l from-blue-600 to-indigo-600 hover:shadow-blue-500/20 text-white px-3 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black transition-all flex items-center gap-1.5 md:gap-2 shadow-lg"
                                >
                                    <FileText size={14} className="md:size-[16px]" />
                                    <span className="hidden sm:inline">تصدير Word</span>
                                    <span className="sm:hidden text-[8px]">تصدير</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setShowBulkModal(true)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black transition-all flex items-center gap-1.5 md:gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <Users size={14} className="md:size-[16px]" />
                                    <span className="hidden sm:inline">رصد جماعي</span>
                                    <span className="sm:hidden text-[8px]">رصد</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {notification && (
                    <Toast 
                        key={`toast-${notification.message.substring(0, 10)}`}
                        message={notification.message} 
                        type={notification.type} 
                        onClose={() => setNotification(null)} 
                    />
                )}
                {showLeaderboard && (
                    <LeaderboardModal 
                        students={students} 
                        onClose={() => setShowLeaderboard(false)} 
                    />
                )}
                {showTeachersLeaderboard && (
                    <TeachersLeaderboardModal 
                        students={students} 
                        onClose={() => setShowTeachersLeaderboard(false)} 
                    />
                )}
                {showStatsDashboard && (
                    <StatsDashboardModal 
                        students={students} 
                        onClose={() => setShowStatsDashboard(false)} 
                    />
                )}
                {showBulkModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => {
                            setShowBulkModal(false);
                            setBulkStep('select');
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-none md:rounded-[2.5rem] shadow-2xl relative overflow-hidden w-full max-w-6xl h-full md:h-[90vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-l from-emerald-600 to-teal-600 p-4 md:p-6 text-white flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="bg-white/20 p-2 rounded-xl shrink-0">
                                        <Users size={24} />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-lg md:text-xl font-black">نافذة الرصد الجماعي المتقدم</h3>
                                        <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
                                            <p className="text-emerald-50 text-[10px] font-bold">رصد مجمع للفصول والطلاب</p>
                                            <p className="text-white text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Calendar size={10} />
                                                تاريخ الرصد: {new Date(behaviorDate).toLocaleDateString('ar-SA')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end">
                                    <div className="flex bg-black/10 p-1 rounded-xl lg:hidden flex-1 mx-2">
                                        <button 
                                            onClick={() => setBulkStep('select')}
                                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${bulkStep === 'select' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white'}`}
                                        >
                                            1. اختيار
                                        </button>
                                        <button 
                                            onClick={() => setBulkStep('assign')}
                                            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${bulkStep === 'assign' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white'}`}
                                        >
                                            2. رصد
                                        </button>
                                    </div>
                                    <div className="hidden md:flex gap-2">
                                        <button 
                                            onClick={() => {
                                                const toExport = selectedForBulk.length > 0 
                                                    ? students.filter(s => selectedForBulk.includes(s.id))
                                                    : lastAssignedStudents;
                                                
                                                if (toExport.length === 0) {
                                                    alert("الرجاء اختيار طلاب أولاً للتصدير");
                                                    return;
                                                }
                                                generateComprehensiveReport(toExport, "الرصد الجماعي");
                                            }}
                                            className="bg-white/20 hover:bg-white/30 text-white px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center gap-2 border border-white/10"
                                        >
                                            <FileText size={16} />
                                            <span className="truncate">تصدير Word {selectedForBulk.length === 0 && lastAssignedStudents.length > 0 && "(لآخر رصد)"}</span>
                                        </button>
                                    </div>
                                    <button onClick={() => {
                                        setShowBulkModal(false);
                                        setBulkStep('select');
                                    }} className="bg-black/10 hover:bg-black/20 p-2 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
                                {/* Sidebar: Grades */}
                                <div className={`lg:w-56 border-b lg:border-b-0 lg:border-l border-slate-100 bg-slate-50/50 p-2 md:p-4 overflow-x-auto lg:overflow-y-auto custom-scrollbar flex lg:flex-col gap-2 shrink-0 ${bulkStep !== 'select' ? 'hidden lg:flex' : 'flex'}`}>
                                    <div className="hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 text-right">الفصول الدراسية</div>
                                    <button 
                                        onClick={() => setBulkFilterGrade("الكل")}
                                        className={`whitespace-nowrap lg:w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${bulkFilterGrade === "الكل" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100"}`}
                                    >
                                        جميع الطلاب
                                    </button>
                                    <button 
                                        onClick={() => setBulkFilterGrade("selected")}
                                        className={`whitespace-nowrap lg:w-full text-right px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between gap-2 border-2 ${
                                            bulkFilterGrade === "selected" 
                                            ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/30 scale-[1.02]" 
                                            : selectedForBulk.length > 0 
                                                ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" 
                                                : "bg-white text-blue-400 border-slate-100 opacity-60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CircleCheck size={14} />
                                            <span>المختارون</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${bulkFilterGrade === "selected" ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
                                            {selectedForBulk.length}
                                        </span>
                                    </button>
                                    <div className="hidden lg:block h-px bg-slate-100 my-1" />
                                    {GRADES.map(grade => (
                                        <button 
                                            key={`bulk-nav-grade-${grade}`}
                                            onClick={() => setBulkFilterGrade(grade)}
                                            className={`whitespace-nowrap lg:w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${bulkFilterGrade === grade ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100"}`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>

                                {/* Center: Student Selection */}
                                <div className={`flex-1 p-4 md:p-6 overflow-hidden flex flex-col border-b lg:border-b-0 lg:border-l border-slate-50 ${bulkStep !== 'select' ? 'hidden lg:flex' : 'flex'}`}>
                                    <div className={`mb-4 md:mb-6 shrink-0 transition-all duration-500 ${selectedForBulk.length > 0 ? "opacity-100 translate-y-0" : "opacity-60"}`}>
                                        <div className="flex justify-between items-center mb-2 text-right">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${selectedForBulk.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                                    <Users size={18} />
                                                </div>
                                                <span className="text-xs md:text-sm font-black text-slate-800">الطلاب المختارون ({selectedForBulk.length})</span>
                                            </div>
                                            {selectedForBulk.length > 0 && (
                                                <button onClick={() => setSelectedForBulk([])} className="text-[10px] font-bold text-red-500 hover:underline">إلغاء الكل</button>
                                            )}
                                        </div>
                                        <div className={`bg-white border-2 rounded-2xl p-3 min-h-[50px] max-h-[100px] overflow-y-auto flex flex-wrap gap-2 custom-scrollbar transition-all ${selectedForBulk.length > 0 ? "border-emerald-500 shadow-sm" : "border-slate-100 border-dashed"}`}>
                                            {selectedForBulk.length > 0 ? (
                                                selectedForBulk.map(id => {
                                                    const s = students.find(st => st.id === id);
                                                    if (!s) return null;
                                                    return (
                                                        <div key={`tag-sel-${id}`} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2">
                                                            <span>{s.name}</span>
                                                            <X size={10} className="cursor-pointer" onClick={() => toggleStudentSelection(id)} />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full flex items-center justify-center text-slate-300 text-[10px] font-bold text-center text-right">الرجاء اختيار الطلاب من القائمة أدناه</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4 text-right">
                                        <span className="text-sm font-black text-slate-700">قائمة الأسماء ({students.filter(s => bulkFilterGrade === "الكل" ? true : bulkFilterGrade === "selected" ? selectedForBulk.includes(s.id) : s.grade === bulkFilterGrade).length})</span>
                                        <button 
                                            onClick={() => {
                                                const currentIds = students.filter(s => bulkFilterGrade === "الكل" ? true : bulkFilterGrade === "selected" ? selectedForBulk.includes(s.id) : s.grade === bulkFilterGrade).map(s => s.id);
                                                if (currentIds.every(id => selectedForBulk.includes(id))) {
                                                    setSelectedForBulk(prev => prev.filter(id => !currentIds.includes(id)));
                                                } else {
                                                    setSelectedForBulk(prev => [...new Set([...prev, ...currentIds])]);
                                                }
                                            }}
                                            className="text-[10px] font-black text-emerald-600"
                                        >
                                            تحديد/إلغاء الكل
                                        </button>
                                    </div>
                                    
                                    <div className="flex-grow overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 p-1">
                                        {students
                                            .filter(s => 
                                                bulkFilterGrade === "الكل" ? true : 
                                                bulkFilterGrade === "selected" ? selectedForBulk.includes(s.id) : 
                                                s.grade === bulkFilterGrade
                                            )
                                            .map(student => (
                                                <motion.div 
                                                    key={`bulk-grid-item-${student.id}`}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => toggleStudentSelection(student.id)}
                                                    className={`p-3 md:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                                        selectedForBulk.includes(student.id) 
                                                        ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                                                        : "border-slate-100 bg-white hover:border-emerald-200"
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <div className={`text-[15px] font-medium leading-tight ${selectedForBulk.includes(student.id) ? "text-emerald-900" : "text-slate-700"}`}>
                                                            {student.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-1">{student.grade}</div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                                                        selectedForBulk.includes(student.id) ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-200"
                                                    }`}>
                                                        {selectedForBulk.includes(student.id) && <CircleCheck size={14} />}
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>

                                    {/* Mobile Next Button */}
                                    <div className="mt-4 lg:hidden pb-4">
                                        <button 
                                            onClick={() => setBulkStep('assign')}
                                            disabled={selectedForBulk.length === 0}
                                            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            الخطوة التالية (رصد السلوك)
                                            <ChevronLeft size={16} className="-rotate-180" />
                                        </button>
                                    </div>
                                </div>

                                {/* Right: Behavior Assignment Panel */}
                                <div className={`lg:w-80 border-r lg:border-r-0 lg:border-l border-slate-100 bg-slate-50/50 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 lg:shrink-0 ${bulkStep !== 'assign' ? 'hidden lg:flex' : 'flex-1'}`}>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 shrink-0 text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">ملخص الاختيار</div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-black text-emerald-600">{selectedForBulk.length} طالباً</span>
                                            <span className="text-xs font-bold text-slate-600">:سيتم الرصد لـ</span>
                                        </div>
                                        {selectedForBulk.length === 0 && (
                                            <div className="bg-amber-50 text-amber-700 text-[10px] p-2 rounded-lg font-bold border border-amber-100">
                                                الرجاء العودة لاختيار الطلاب أولاً
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">إعدادات الرصد للمجموعة</div>
                                    <div className="grid grid-cols-1 gap-2 p-3 bg-white border border-slate-100 rounded-2xl mb-2">
                                        <div className="space-y-1 text-right">
                                            <label className="text-[9px] font-black text-slate-500 mr-1">تاريخ الرصد</label>
                                            <div className="relative">
                                                <input 
                                                    type="date"
                                                    value={behaviorDate}
                                                    onChange={(e) => setBehaviorDate(e.target.value)}
                                                    className="w-full text-[10px] p-2 pr-8 bg-slate-50 rounded-lg border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none text-right font-bold transition-all"
                                                />
                                                <Calendar size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <label className="text-[9px] font-black text-slate-500 mr-1">مصدر الرصد</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    value={behaviorSource}
                                                    onChange={(e) => setBehaviorSource(e.target.value)}
                                                    placeholder="أدخل المصدر..."
                                                    className="w-full text-[10px] p-2 pr-8 bg-slate-50 rounded-lg border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none text-right font-bold transition-all"
                                                />
                                                <Edit2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">اختر السلوك للمجموعة</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                        {BEHAVIOR_CATEGORIES.filter(cat => cat.points > 0).map((cat, idx) => (
                                            <div key={`bulk-cat-item-${cat.title}-${idx}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                                <div className="flex justify-between items-center mb-3 text-right">
                                                    <span className="font-black text-slate-800 text-xs">{cat.title}</span>
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                                        +{cat.points}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    {cat.examples.map((ex, eidx) => (
                                                        <button 
                                                            key={`bulk-btn-item-${cat.title}-${eidx}`}
                                                            disabled={selectedForBulk.length === 0}
                                                            onClick={() => handleBulkAssign(cat.points, ex)}
                                                            className="w-full text-right text-[10px] p-2.5 bg-slate-50 rounded-xl border border-transparent hover:border-emerald-500 hover:text-emerald-700 transition-all font-black disabled:opacity-50 disabled:cursor-not-allowed group"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <ChevronLeft size={10} className="text-slate-300 group-hover:text-emerald-500 group-hover:-translate-x-1" />
                                                                <span className="flex-1">{ex}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile Back Button */}
                                    <div className="mt-4 lg:hidden pb-10">
                                        <button 
                                            onClick={() => setBulkStep('select')}
                                            className="w-full bg-slate-200 text-slate-700 py-3.5 rounded-xl font-black flex items-center justify-center gap-2"
                                        >
                                            العودة لاختيار الأسماء
                                            <ChevronLeft size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {showClearConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 z-0" />
                            <div className="relative z-10 text-right">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-200">
                                    <RotateCcw size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">تصفير ومسح البيانات</h3>
                                <p className="text-slate-500 leading-relaxed mb-8">
                                    يمكنك اختيار تصفير نقاط الطلاب فقط مع الإبقاء على أسمائهم، أو مسح كافة البيانات والطلاب تماماً.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button 
                                        onClick={async () => {
                                            const batch = writeBatch(db);
                                            const resetStudents = students.map(s => ({
                                                ...s,
                                                totalPoints: 0,
                                                behaviors: []
                                            }));
                                            resetStudents.forEach(s => {
                                                batch.set(doc(db, "students", s.id), s);
                                            });

                                            const logId = `log-reset-${Date.now()}`;
                                            batch.set(doc(db, "behavior_logs", logId), {
                                                id: logId,
                                                teacherName: "إدارة المدرسة",
                                                studentId: "all",
                                                studentName: "جميع الطلاب",
                                                category: "تصفير جميع نقاط وسلوكيات الطلاب",
                                                points: 0,
                                                date: new Date().toLocaleDateString('ar-SA'),
                                                timestamp: Date.now()
                                            });

                                            try {
                                                await batch.commit();
                                                setSelectedStudent(null);
                                                setShowClearConfirm(false);
                                                setNotification({ message: "🔄 تم تصفير جميع نقاط الطلاب بنجاح", type: "success" });
                                            } catch (error) {
                                                console.error("Firestore reset points error:", error);
                                                setNotification({ message: "حدث خطأ أثناء تصفير النقاط السحابية", type: "error" });
                                            }
                                        }}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <History size={18} />
                                        تصفير النقاط فقط
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const batch = writeBatch(db);
                                            INITIAL_STUDENTS.forEach(s => {
                                                batch.set(doc(db, "students", s.id), {
                                                    ...s,
                                                    totalPoints: 0,
                                                    behaviors: []
                                                });
                                            });

                                            const logId = `log-reset-all-${Date.now()}`;
                                            batch.set(doc(db, "behavior_logs", logId), {
                                                id: logId,
                                                teacherName: "إدارة المدرسة",
                                                studentId: "all",
                                                studentName: "تهيئة النظام",
                                                category: "حذف كل شيء وإعادة تهيئة القائمة الأساسية",
                                                points: 0,
                                                date: new Date().toLocaleDateString('ar-SA'),
                                                timestamp: Date.now()
                                            });

                                            try {
                                                await batch.commit();
                                                setSelectedStudent(null);
                                                setShowClearConfirm(false);
                                                setNotification({ message: "🗑️ تم مسح كافه البيانات وإعادة التهيئة للملفات بنجاح", type: "success" });
                                            } catch (error) {
                                                console.error("Firestore re-init error:", error);
                                                setNotification({ message: "حدث خطأ أثناء تصفير كافة السجلات", type: "error" });
                                            }
                                        }}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        حذف كل شيء
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setShowClearConfirm(false)}
                                    className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3 rounded-2xl transition-all active:scale-95"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {showDeleteConfirm && selectedStudent && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 z-0" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-200">
                                    <UserMinus size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">حذف الطالب نهائياً؟</h3>
                                <p className="text-slate-500 leading-relaxed mb-8">
                                    هل أنت متأكد من حذف الطالب <span className="text-red-600 font-bold">{selectedStudent.name}</span>؟ سيتم مسح جميع سجلاته السلوكية ولن تتمكن من استعادتها.
                                </p>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await deleteDoc(doc(db, "students", selectedStudent.id));
                                                setSelectedStudent(null);
                                                setShowDeleteConfirm(false);
                                                setNotification({ message: "🗑️ تم حذف الطالب بنجاح", type: "success" });
                                            } catch (error) {
                                                console.error("Firestore delete student error:", error);
                                                setNotification({ message: "فشل حذف الطالب كلياً من السحابة", type: "error" });
                                            }
                                        }}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
                                    >
                                        تأكيد الحذف
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all active:scale-95"
                                    >
                                        تراجع
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Drawer / القائمة الجانبية المستوحاة */}
            <AnimatePresence>
                {showSidebar && (
                    <>
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSidebar(false)}
                            className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[200] cursor-pointer"
                        />
                        
                        {/* Drawer Sheet */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 right-0 w-[320px] sm:w-[380px] bg-white text-slate-800 shadow-2xl z-[201] flex flex-col justify-between overflow-hidden text-right"
                            dir="rtl"
                        >
                            {/* Drawer Content */}
                            <div>
                                {/* Header */}
                                <div className="p-5 md:p-6 bg-gradient-to-l from-emerald-700 to-emerald-600 text-white flex items-center justify-between border-b border-emerald-800/20">
                                    <div className="flex items-center gap-2">
                                        <Award size={20} className="text-emerald-200" />
                                        <span className="font-black text-sm md:text-base">خيارات التحكم والتقارير</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowSidebar(false)}
                                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors cursor-pointer"
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </div>

                                {/* Actions Menu List */}
                                <div className="p-4 md:p-5 space-y-4">
                                    
                                    {/* Action 1: Import file (Admin Only) */}
                                    {currentUser?.role === 'admin' ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02, x: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setShowSidebar(false);
                                                fileInputRef.current?.click();
                                            }}
                                            className="w-full text-right flex items-center gap-4 bg-slate-50 hover:bg-emerald-50/70 p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                                        >
                                            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                                <Upload size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">استيراد ملف الطلاب (إكسل)</div>
                                                <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">رفع وتحديث أسماء الطلاب والفصول مباشرة عبر ملف إكسل</div>
                                            </div>
                                        </motion.button>
                                    ) : (
                                        <div className="w-full text-right flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/60 opacity-60">
                                            <div className="bg-slate-200 text-slate-400 p-2.5 rounded-xl">
                                                <Upload size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-sm text-slate-400 flex items-center gap-1.5">
                                                    <span>استيراد ملف الطلاب</span>
                                                    <Lock size={12} className="text-slate-400" />
                                                </div>
                                                <div className="text-[10px] md:text-xs text-slate-400 font-medium mt-0.5">متاح فقط للمسؤولين في إدارة المدرسة</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action 2: Group Entry رصد جماعي */}
                                    <motion.button
                                        whileHover={selectedForBulk.length > 0 ? { scale: 1.02, x: -4 } : {}}
                                        whileTap={selectedForBulk.length > 0 ? { scale: 0.98 } : {}}
                                        onClick={() => {
                                            if (selectedForBulk.length > 0) {
                                                setShowSidebar(false);
                                                setShowBulkModal(true);
                                            }
                                        }}
                                        disabled={selectedForBulk.length === 0}
                                        className={`w-full text-right flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                                            selectedForBulk.length > 0
                                            ? "bg-gradient-to-l from-emerald-50 to-teal-50/50 hover:from-emerald-100/50 hover:to-teal-100/50 text-slate-800 border-emerald-200/60 cursor-pointer group"
                                            : "bg-slate-50 text-slate-400 border-slate-100 grayscale cursor-not-allowed opacity-60"
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-xl transition-transform ${
                                            selectedForBulk.length > 0 ? "bg-emerald-500 text-white group-hover:scale-110" : "bg-slate-200 text-slate-400"
                                        }`}>
                                            <Users size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className={`font-black text-sm ${selectedForBulk.length > 0 ? "text-slate-800 group-hover:text-emerald-700" : ""}`}>
                                                رصد جماعي سلوكي ({selectedForBulk.length})
                                            </div>
                                            <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">
                                                {selectedForBulk.length > 0 
                                                    ? `رصد نقاط وسلوكيات جماعية لـ ${selectedForBulk.length} طلاب محددين حالياً`
                                                    : "حدد الطلاب أولاً باستخدام صندوق الاختيار في الجدول لتفعيل الرصد الجماعي"}
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Action 3: Leaderboard المتصدرون */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowSidebar(false);
                                            setShowLeaderboard(true);
                                        }}
                                        className="w-full text-right flex items-center gap-4 bg-amber-50/40 hover:bg-amber-50 p-3.5 rounded-2xl border border-amber-100 hover:border-amber-200 transition-all cursor-pointer group"
                                    >
                                        <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                            <Trophy size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-sm text-slate-800 group-hover:text-amber-700 transition-colors">لوحة المتصدرين والأوائل</div>
                                            <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">عرض الطلاب الحاصلين على أعلى النقاط لتكريمهم</div>
                                        </div>
                                    </motion.button>

                                    {/* Action 3.5: Stats Dashboard لوحة إحصائية */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowSidebar(false);
                                            setShowStatsDashboard(true);
                                        }}
                                        className="w-full text-right flex items-center gap-4 bg-purple-50/40 hover:bg-purple-50 p-3.5 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all cursor-pointer group"
                                    >
                                        <div className="bg-purple-100 text-purple-700 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                            <PieIcon size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-sm text-slate-800 group-hover:text-purple-700 transition-colors">لوحة الإحصائيات والمؤشرات (Dashboard)</div>
                                            <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">تحليل وتوزيع نقاط السلوك التميزي للفصول بيانياً</div>
                                        </div>
                                    </motion.button>

                                    {/* Action 3.1: Teachers' Tracking رصد المعلمين (Admin Only) */}
                                    {currentUser?.role === 'admin' && (
                                        <motion.button
                                            whileHover={{ scale: 1.02, x: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setShowSidebar(false);
                                                setShowTeachersLeaderboard(true);
                                            }}
                                            className="w-full text-right flex items-center gap-4 bg-teal-50/40 hover:bg-teal-50 p-3.5 rounded-2xl border border-teal-100 hover:border-teal-200 transition-all cursor-pointer group"
                                        >
                                            <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                                <Award size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-sm text-slate-800 group-hover:text-teal-700 transition-colors">لوحة رصد المعلمين</div>
                                                <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">صدارة المعلمين الأكثر رصداً وتكريم جهود عطائهم</div>
                                            </div>
                                        </motion.button>
                                    )}

                                    {/* Action 4: Word Export تصدير Word (Admin Only) */}
                                    {currentUser?.role === 'admin' && (
                                        <motion.button
                                            whileHover={{ scale: 1.02, x: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setShowSidebar(false);
                                                generateComprehensiveReport(filteredStudents, filterGrade);
                                            }}
                                            className="w-full text-right flex items-center gap-4 bg-blue-50/40 hover:bg-blue-50 p-3.5 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all cursor-pointer group"
                                        >
                                            <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                                <FileText size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-sm text-slate-800 group-hover:text-blue-700 transition-colors">تصدير تقرير Word الشامل</div>
                                                <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5 font-sans">تنزيل ملف Word رسمي متكامل للفصل المحدد أو للمدرسة</div>
                                            </div>
                                        </motion.button>
                                    )}


                                    {/* Action 5: Clear and reset (Admin only) */}
                                    {currentUser?.role === 'admin' && (
                                        <motion.button
                                            whileHover={{ scale: 1.02, x: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setShowSidebar(false);
                                                setShowClearConfirm(true);
                                            }}
                                            className="w-full text-right flex items-center gap-4 bg-red-50/40 hover:bg-red-50 p-3.5 rounded-2xl border border-red-100 hover:border-red-200 transition-all cursor-pointer group"
                                        >
                                            <div className="bg-red-100 text-red-700 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                                <RotateCcw size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black text-sm text-slate-800 group-hover:text-red-700 transition-colors">تصفير السجلات وتهيئة البيانات</div>
                                                <div className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5">مسح جميع سجلات وسلوكيات ونقاط الطلاب للبدء من جديد</div>
                                            </div>
                                        </motion.button>
                                    )}

                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 text-center">
                                <p className="text-[10px] text-slate-400 font-bold">بوابة رصد السلوك المتميز © {new Date().getFullYear()}</p>
                                <p className="text-[9px] text-slate-300 font-black mt-0.5">مدرسة الجشة المتوسطة للأبطال</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                className="relative bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-600 text-white p-4 md:p-6 shadow-2xl mb-6 md:mb-8 overflow-hidden shine-effect"
            >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] bg-[length:200%_100%] animate-shimmer" />
                <div className="container mx-auto flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 relative z-10">
                    <motion.div 
                        className="flex items-center gap-4 md:gap-5 w-full xl:w-auto text-right"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.div 
                            className="bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm shadow-inner shrink-0"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Award size={28} className="md:size-[36px]" />
                        </motion.div>
                        <div className="min-w-0 text-right">
                            <h1 className="text-lg md:text-2xl font-black tracking-tight leading-tight truncate">بوابة رصد السلوك المتميز</h1>
                            <p className="text-emerald-100 text-[11px] md:text-[13px] font-bold mt-1 md:mt-1.5">مدرسة الجشة المتوسطة</p>
                            <p className="text-white text-[9px] md:text-[11px] font-bold mt-0.5 flex items-center gap-1.5">
                                <Sparkles size={10} className="animate-pulse shrink-0" />
                                <span className="truncate">الموجه الطلابي: عبدالهادي بن محمد المحسن</span>
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="flex flex-row items-center gap-2 md:gap-3 justify-between xl:justify-end w-full xl:w-auto"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* 1. Hamburger button (three lines) to open Sidebar */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSidebar(true)}
                            className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 px-3 md:px-5 py-2.5 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-md font-black text-[11px] md:text-sm shadow-sm transition-all text-white shrink-0 cursor-pointer"
                        >
                            <Menu size={16} className="md:size-[18px] shrink-0" />
                            <span>الخيارات والتقارير</span>
                        </motion.button>

                        {/* 2. User Profile Badge & Logout Option (Positioned on the Left Side) */}
                        <div className="flex items-center gap-2 bg-white/15 px-3 md:px-4 py-2 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-md select-none text-right shadow-inner">
                            <button 
                                onClick={() => {
                                    localStorage.removeItem("pos_behavior_user");
                                    setSelectedForBulk([]);
                                    setLastAssignedStudents([]);
                                    setSearchTerm("");
                                    setFilterGrade("الكل");
                                    setSelectedStudent(null);
                                    setShowBehaviorForm(false);
                                    setShowLeaderboard(false);
                                    setShowTeachersLeaderboard(false);
                                    setShowStatsDashboard(false);
                                    setShowBulkModal(false);
                                    setEditingBehaviorId(null);
                                    setEditFormData(null);
                                    setCurrentUser(null);
                                }}
                                className="bg-red-500/20 hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-600 hover:shadow-lg hover:shadow-red-500/30 text-white p-2.5 rounded-xl transition-all border border-red-500/15 cursor-pointer hover:scale-105 active:scale-95 shrink-0 ml-3"
                                title="تسجيل الخروج"
                            >
                                <LogOut size={14} />
                            </button>
                            <div className="text-right min-w-0">
                                <p className="text-[10px] text-white/70 font-bold leading-none">مرحباً بك</p>
                                <p className="text-xs md:text-sm font-black leading-tight mt-1 whitespace-nowrap text-white bg-slate-900/60 border border-white/10 px-2.5 py-1 rounded-lg shadow-sm max-w-none inline-block">{currentUser.name}</p>
                                {currentUser.role === 'teacher' && <p className="text-[9px] text-emerald-200 font-extrabold mt-0.5 leading-none">{currentUser.subject}</p>}
                                {currentUser.role === 'admin' && <p className="text-[9px] text-amber-300 font-extrabold mt-0.5 leading-none">مسؤول الإدارة</p>}
                            </div>
                            <div className="bg-white/20 p-2 rounded-xl shrink-0 hidden sm:block mr-2">
                                <UserCheck size={16} className="text-emerald-100" />
                            </div>
                        </div>

                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx,.xls" />
                    </motion.div>
                </div>
            </motion.header>

            <div className="container mx-auto px-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { icon: <Users size={20} className="md:size-[24px]" />, label: "عدد الطلاب", value: students.length, color: "from-blue-500 to-blue-600" },
                        { icon: <TrendingUp size={20} className="md:size-[24px]" />, label: "إجمالي النقاط", value: totalPointsOverall, color: "from-emerald-500 to-emerald-600" },
                        { icon: <Star size={20} className="md:size-[24px]" />, label: "أعلى نقاط", value: displayedStudents.length > 0 ? Math.max(...displayedStudents.map(s => s.totalPoints)) : 0, color: "from-amber-500 to-orange-500" },
                        { icon: <Filter size={20} className="md:size-[24px]" />, label: "طلاب الفصل", value: gradeStudentCount, color: "from-purple-500 to-indigo-500" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={`stat-card-${idx}`}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 * idx + 0.6 }}
                            whileHover={{ y: -8, scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
                            className={`bg-gradient-to-l ${stat.color} text-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-lg flex items-center gap-3 md:gap-4 border border-white/20 shine-effect group transition-all`}
                        >
                            <div className="bg-white/20 p-2 md:p-3 rounded-lg md:rounded-2xl animate-float group-hover:scale-110 transition-transform shrink-0">
                                {stat.icon}
                            </div>
                            <div className="min-w-0">
                                <div className="text-white/80 text-[10px] md:text-xs font-bold truncate">{stat.label}</div>
                                <div className="text-lg md:text-2xl font-black"><CountUp value={stat.value} /></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <main className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student List */}
                    <div className="lg:col-span-2 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm border border-white/60 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all"
                        >
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none shrink-0">
                                    <select 
                                        value={filterGrade} 
                                        onChange={(e) => setFilterGrade(e.target.value)}
                                        className="w-full appearance-none bg-emerald-600 text-white font-black text-[11px] md:text-sm px-4 md:px-5 py-2.5 md:py-3 pr-9 md:pr-10 rounded-xl cursor-pointer outline-none hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 border-none"
                                    >
                                        <option value="الكل">جميع الفصول ({students.length})</option>
                                        {availableGrades.map(g => (
                                            <option key={`filter-grade-${g}`} value={g}>{g} ({students.filter(s => s.grade === g).length})</option>
                                        ))}
                                    </select>
                                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none md:size-[16px]" />
                                </div>
                                <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />
                            </div>
                            
                            <div className="flex items-center gap-2 bg-slate-50/50 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-slate-100 flex-1 group focus-within:border-emerald-300 focus-within:bg-white transition-all">
                                <Search className="text-slate-400 group-focus-within:text-emerald-500 shrink-0 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="ابحث باسم الطالب أو الجوال..."
                                    className="w-full bg-transparent focus:outline-none text-[11px] md:text-sm font-bold border-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                            className="bg-white/80 backdrop-blur-md rounded-2xl md:rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden"
                        >
                            <div className="responsive-table-container custom-scrollbar pb-3">
                                <table className="w-full text-right border-collapse min-w-[720px] lg:min-w-[780px]">
                                    <thead className="bg-gradient-to-l from-slate-100 to-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="sticky right-0 bg-slate-100 z-30 px-2 py-3 md:py-4 text-center shrink-0" style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 md:w-5 md:h-5 rounded-md accent-emerald-600 cursor-pointer"
                                                    checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedForBulk.includes(s.id))}
                                                    onChange={selectAllFiltered}
                                                />
                                            </th>
                                            <th className="sticky right-[48px] bg-slate-100 z-30 px-2 md:px-4 py-3 md:py-4 font-black text-slate-600 text-[10px] md:text-sm text-right min-w-[150px] md:min-w-[200px] border-l border-slate-200">اسم الطالب</th>
                                            <th className="px-2 md:px-4 py-3 md:py-4 font-black text-slate-600 text-[10px] md:text-sm text-center w-16 md:w-24">الصف</th>
                                            <th className="hidden sm:table-cell px-2 md:px-4 py-3 md:py-4 font-black text-slate-600 text-[10px] md:text-sm text-center w-28 md:w-36">رقم الهاتف</th>
                                            <th className="pl-6 md:pl-8 pr-2 py-3 md:py-4 font-black text-slate-700 text-[11px] md:text-sm text-center w-32 md:w-40 min-w-[155px]">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50">
                                        <AnimatePresence mode="popLayout">
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map((student, idx) => (
                                                    <motion.tr
                                                        key={`main-row-${student.id}`}
                                                        initial={{ opacity: 0, x: 40 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -40 }}
                                                        transition={{ delay: idx * 0.02 }}
                                                        whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.03)' }}
                                                        className={`group transition-all cursor-pointer ${selectedForBulk.includes(student.id) ? 'bg-emerald-50/40' : ''}`}
                                                        onClick={() => toggleStudentSelection(student.id)}
                                                    >
                                                        <td 
                                                            style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }} className={`sticky right-0 z-20 text-center shrink-0 px-2 py-2.5 md:py-4 transition-colors ${
                                                                selectedForBulk.includes(student.id) ? 'bg-emerald-50' : 'bg-white group-hover:bg-slate-50'
                                                            }`} 
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 md:w-5 md:h-5 rounded-md accent-emerald-600 cursor-pointer"
                                                                checked={selectedForBulk.includes(student.id)}
                                                                onChange={() => toggleStudentSelection(student.id)}
                                                            />
                                                        </td>
                                                        <td 
                                                            className={`sticky right-[48px] z-20 text-right min-w-[150px] md:min-w-[200px] px-2 md:px-4 py-2.5 md:py-4 border-l transition-colors ${
                                                                selectedForBulk.includes(student.id) 
                                                                    ? 'bg-emerald-50 border-emerald-100' 
                                                                    : 'bg-white group-hover:bg-slate-50 border-slate-100'
                                                            }`}
                                                        >
                                                            <div className="text-[13px] md:text-[15px] font-medium text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight truncate max-w-[120px] md:max-w-none">
                                                                {student.name}
                                                            </div>
                                                            {/* Progress bar to 20-point target */}
                                                             <div className="mt-2 flex items-center gap-2 max-w-[140px] md:max-w-[180px] select-none" onClick={e => e.stopPropagation()}>
                                                                 <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                                                                     <div 
                                                                         className={`h-full rounded-full transition-all duration-500 ${
                                                                             student.totalPoints >= 20 
                                                                                 ? 'bg-gradient-to-l from-amber-500 to-orange-500 animate-pulse' 
                                                                                 : 'bg-gradient-to-l from-emerald-500 to-teal-500'
                                                                         }`}
                                                                         style={{ width: `${Math.max(0, Math.min((student.totalPoints / 20) * 100, 100))}%` }}
                                                                     />
                                                                 </div>
                                                                 <div className="flex items-center gap-0.5 shrink-0">
                                                                     <span className={`text-[10px] font-black tabular-nums ${student.totalPoints >= 20 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                                         {student.totalPoints}
                                                                     </span>
                                                                     <span className="text-[9px] text-slate-400 font-bold">/20</span>
                                                                     {student.totalPoints >= 20 && (
                                                                         <Trophy size={11} className="text-amber-500 animate-bounce shrink-0 ml-0.5" />
                                                                     )}
                                                                 </div>
                                                             </div>
                                                        </td>
                                                        <td className="px-2 md:px-4 py-2.5 md:py-4 text-center w-16 md:w-24">
                                                            <span className="bg-slate-50 text-slate-600 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg font-black group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors text-[8px] md:text-[10px] border border-slate-100 whitespace-nowrap">
                                                                {student.grade}
                                                            </span>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-2 md:px-4 py-2.5 md:py-4 text-center w-28 md:w-36">
                                                            <span className="text-[10px] md:text-xs font-bold text-slate-500 tabular-nums">
                                                                {student.phone || "—"}
                                                            </span>
                                                        </td>
                                                        
                                                        <td className="pl-6 md:pl-8 pr-2 py-2.5 md:py-4 text-center w-32 md:w-40 min-w-[155px]">
                                                            <motion.button
                                                                whileHover={{ scale: 1.04 }}
                                                                whileTap={{ scale: 0.96 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedStudent(students.find(s => s.id === student.id) || student);
                                                                    setShowBehaviorForm(false);
                                                                }}
                                                                className="inline-flex items-center justify-center gap-1.5 bg-emerald-50/70 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/60 hover:border-emerald-600 rounded-xl px-3 py-2 text-[10px] sm:text-xs font-black transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-emerald-200/40 pointer-events-auto shrink-0 group/btn whitespace-nowrap"
                                                            >
                                                                <History size={13} className="shrink-0 opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                                                                <span className="hidden sm:inline">عرض السجل</span>
                                                                <span className="sm:hidden text-[9px]">السجل</span>
                                                                <ChevronLeft size={12} className="shrink-0 transition-transform duration-300 group-hover/btn:-translate-x-0.5" />
                                                            </motion.button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ opacity: 1, scale: 1 }}>
                                                            <Users size={48} className="md:size-[64px] mx-auto mb-6 opacity-5" />
                                                            <p className="text-base md:text-xl font-black text-slate-300">لا توجد بيانات طلاب حالياً</p>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                            className="bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 text-center border border-emerald-100 shadow-sm text-emerald-800 font-extrabold text-xs md:text-sm flex items-center justify-center gap-2"
                        >
                            <Sparkles className="text-amber-500 shrink-0" size={16} />
                            <span>إعداد الموجه الطلابي: عبدالهادي بن محمد المحسن</span>
                        </motion.div>
                    </div>

                    {/* Dashboard / Sidebar */}
                                        <div className="lg:col-span-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {selectedStudent ? (
                                <motion.div
                                    key={`details-${selectedStudent.id}`}
                                    initial={{ opacity: 0, x: -60, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -60, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden sticky top-6 max-h-[calc(100vh-100px)] flex flex-col"
                                >
                                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4 md:p-5 text-white relative overflow-hidden shrink-0 text-right">
                                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                            <div className="absolute -top-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-emerald-500/10 rounded-full animate-blob" />
                                            <div className="absolute -bottom-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-teal-500/10 rounded-full animate-blob" style={{ animationDelay: '3s' }} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-3.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {currentUser.role === 'admin' && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#fff' }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                            className="p-2 bg-white/10 rounded-xl transition-all border border-white/20 shadow-md flex items-center justify-center text-white/70 hover:text-white"
                                                            title="حذف الطالب نهائياً"
                                                        >
                                                            <Trash2 size={14} />
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setSelectedStudent(null)}
                                                        className="p-2 bg-white/10 rounded-xl transition-all border border-white/20 shadow-md flex items-center justify-center text-white/70 hover:text-white"
                                                    >
                                                        <X size={14} />
                                                    </motion.button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 justify-end">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => sendWhatsAppMessage(selectedStudent)}
                                                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black transition-all shadow-md border border-emerald-400/50"
                                                    >
                                                        <MessageCircle size={13} />
                                                        <span>شكر</span>
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => generateWordReport(selectedStudent)}
                                                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black transition-all shadow-md border border-white/10"
                                                    >
                                                        <FileText size={13} />
                                                        <span>تقرير</span>
                                                    </motion.button>
                                                </div>
                                            </div>
                                            <motion.h2 
                                                className="text-[13px] md:text-[14px] font-black mb-1 md:mb-1.5 leading-tight text-white/95 text-right"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {selectedStudent.name}
                                            </motion.h2>
                                            <div className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2 mt-2 md:mt-2.5 text-emerald-100">
                                                <StatusBadge points={selectedStudent.totalPoints} />
                                                <div className="flex gap-1.5 opacity-90 text-[10px] md:text-xs">
                                                    <span className="bg-white/15 px-2 py-0.5 rounded-md tracking-wider backdrop-blur-sm border border-white/5">{selectedStudent.grade}</span>
                                                    {selectedStudent.phone && (
                                                        <span className="bg-white/15 px-2 py-0.5 rounded-md tracking-wider backdrop-blur-sm border border-white/5 tabular-nums">{selectedStudent.phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <motion.div 
                                                className="mt-3 md:mt-4 bg-white/10 border border-white/15 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 flex flex-col items-center justify-center backdrop-blur-xl relative overflow-hidden group shadow-lg"
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: 0.4, type: 'spring', stiffness: 100, damping: 15 }}
                                            >
                                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                                
                                                <div className="relative z-10 text-center w-full">
                                                    <div className="text-[8px] md:text-[9px] text-emerald-300/80 font-black uppercase tracking-[0.15em] mb-0.5 md:mb-1">رصيد التميز الإيجابي</div>
                                                    <div className="flex items-end justify-center gap-0.5">
                                                        <div className="text-3xl md:text-[40px] font-black leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-emerald-400 drop-shadow-sm">
                                                            <CountUp value={selectedStudent.totalPoints} />
                                                        </div>
                                                        <div className="text-emerald-400/60 font-black text-xs md:text-sm mb-1">/ 20</div>
                                                    </div>
                                                </div>

                                                <div className="mt-1.5 md:mt-2 relative shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                                                    <motion.div
                                                        initial={{ rotate: -180, opacity: 0 }}
                                                        animate={{ rotate: 0, opacity: 1 }}
                                                        transition={{ delay: 0.8, type: 'spring' }}
                                                    >
                                                        {selectedStudent.totalPoints >= 20 ? (
                                                            <Trophy size={20} className="text-amber-400 md:size-[24px]" />
                                                        ) : (
                                                            <Star size={20} className="text-emerald-300 md:size-[24px]" />
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-grow bg-white">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowBehaviorForm(!showBehaviorForm)}
                                            className="w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-3 transition-all mb-4 md:mb-6 shadow-lg shadow-emerald-500/20 text-base md:text-lg bg-gradient-to-l from-emerald-600 to-teal-600 text-white border border-emerald-400/30"
                                        >
                                            {showBehaviorForm ? <ChevronLeft size={20} className="rotate-90 md:size-[22px]" /> : <CirclePlus size={20} className="md:size-[22px]" />}
                                            <span>{showBehaviorForm ? 'إيقاف الرصد' : 'رصد سلوك جديد'}</span>
                                        </motion.button>

                                        <AnimatePresence mode="wait">
                                            {showBehaviorForm ? (
                                                <motion.div
                                                    key={`form-${selectedStudent.id}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4 md:space-y-6 overflow-hidden"
                                                >
                                                    {/* Date and Source Inputs */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl">
                                                        <div className="space-y-1 text-right">
                                                            <label className="text-[10px] md:text-xs font-black text-slate-500 mr-1">تاريخ الرصد</label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="date"
                                                                    value={behaviorDate}
                                                                    onChange={(e) => setBehaviorDate(e.target.value)}
                                                                    className="w-full text-[11px] md:text-sm p-2 md:p-2.5 pr-8 bg-white rounded-lg md:rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-right font-bold transition-all"
                                                                />
                                                                <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-right">
                                                            <label className="text-[10px] md:text-xs font-black text-slate-500 mr-1">مصدر الرصد</label>
                                                            <div className="relative">
                                                                <input 
                                                                    type="text"
                                                                    value={behaviorSource}
                                                                    onChange={(e) => setBehaviorSource(e.target.value)}
                                                                    placeholder="أدخل المصدر..."
                                                                    className="w-full text-[11px] md:text-sm p-2 md:p-2.5 pr-8 bg-white rounded-lg md:rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-right font-bold transition-all"
                                                                />
                                                                <Edit2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 md:space-y-4">
                                                        {BEHAVIOR_CATEGORIES.map((cat, idx) => (
                                                        <motion.div
                                                            key={`form-cat-${cat.title}-${idx}`}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="bg-slate-50/50 border-2 border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 hover:border-emerald-400 hover:shadow-md transition-all group"
                                                        >
                                                            <div className="flex justify-between items-center mb-2.5 md:mb-3 text-right">
                                                                <span className="font-black text-slate-800 text-[11px] md:text-sm">{cat.title}</span>
                                                                <motion.span 
                                                                    whileHover={{ scale: 1.1 }}
                                                                    className="bg-emerald-100 text-emerald-700 text-[9px] md:text-xs font-black px-2.5 md:px-3 py-0.5 md:py-1 rounded-full border border-emerald-200"
                                                                >
                                                                    {cat.points > 0 ? `+${cat.points}` : "مخصص"}
                                                                </motion.span>
                                                            </div>
                                                            <div className="relative">
                                                                <select 
                                                                    className="w-full text-[11px] md:text-sm p-2.5 md:p-3 pr-4 md:pr-4 bg-white/80 rounded-lg md:rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer transition-all appearance-none text-right font-bold"
                                                                    onChange={(e) => {
                                                                        if (e.target.value && cat.points > 0) {
                                                                            addBehavior(selectedStudent.id, cat.points, e.target.value);
                                                                        }
                                                                    }}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="" disabled>اختر ممارسة السلوك...</option>
                                                                    {cat.examples.map((ex, eidx) => (
                                                                        <option key={`form-opt-${idx}-${eidx}`} value={ex}>{ex}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                    <ChevronLeft size={14} className="-rotate-90" />
                                                                </div>
                                                            </div>
                                                            {cat.points === 0 && (
                                                                <div className="mt-3 flex gap-2">
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder="1-6"
                                                                        min={1} max={6}
                                                                        className="w-16 md:w-20 text-center p-2.5 md:p-3 bg-white rounded-lg md:rounded-xl border-2 border-slate-100 font-bold focus:border-emerald-500 outline-none text-[11px] md:text-sm"
                                                                        value={customPoints || ""}
                                                                        onChange={(e) => setCustomPoints(Number(e.target.value))}
                                                                    />
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.03 }}
                                                                        whileTap={{ scale: 0.97 }}
                                                                        onClick={() => {
                                                                            if (customPoints > 0 && customPoints <= 6) {
                                                                                addBehavior(selectedStudent.id, customPoints, "سلوك متميز مخصص");
                                                                            } else {
                                                                                alert("الرجاء إدخال درجة بين 1 و 6");
                                                                            }
                                                                        }}
                                                                        className="flex-1 bg-slate-900 text-white rounded-lg md:rounded-xl font-black text-[11px] md:text-sm hover:bg-emerald-600 transition-colors py-2.5 md:py-3 shadow-lg shadow-slate-900/10"
                                                                    >
                                                                        إضافة مخصصة
                                                                    </motion.button>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="history"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="flex flex-col gap-3 md:gap-4 mb-5 md:mb-6">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="flex items-center gap-2 font-black text-slate-800 text-base md:text-lg text-right">
                                                                <History className="text-emerald-600 size-5 md:size-[22px]" />
                                                                سجل السلوكيات
                                                            </h3>
                                                            {selectedStudent.behaviors.length > 0 && (
                                                                <span className="bg-slate-100 text-slate-500 text-[10px] md:text-xs font-black px-2.5 md:px-3 py-1 rounded-full border border-slate-200">
                                                                    {selectedStudent.behaviors.length} سلوك
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {selectedStudent.behaviors.length > 0 && (
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => setBehaviorSort('date')}
                                                                    className={`flex-1 py-2 px-2 md:px-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all border ${
                                                                        behaviorSort === 'date' 
                                                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    الترتيب حسب التاريخ
                                                                </button>
                                                                <button 
                                                                    onClick={() => setBehaviorSort('points')}
                                                                    className={`flex-1 py-2 px-2 md:px-4 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all border ${
                                                                        behaviorSort === 'points' 
                                                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    الترتيب حسب النقاط
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {selectedStudent.behaviors.length > 0 && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="bg-slate-50 border border-slate-150 rounded-2xl p-3 md:p-4 mb-5 shadow-sm text-right overflow-hidden"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                    <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg">
                                                                        <TrendingUp size={14} className="md:size-4" />
                                                                    </div>
                                                                    <span className="font-black text-slate-800 text-[11px] md:text-sm">تطور نقاط التميز</span>
                                                                </div>
                                                                <span className="text-[9px] text-slate-400 font-extrabold bg-slate-200/50 px-2.5 py-0.5 rounded-full">تراكمي</span>
                                                            </div>
                                                            <div className="h-36 md:h-44 w-full min-w-0" style={{ direction: 'ltr' }}>
                                                                <ResponsiveContainer width="100%" height={150} minWidth={0}>
                                                                    <AreaChart
                                                                        data={getStudentChartData(selectedStudent)}
                                                                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                                                    >
                                                                        <defs>
                                                                            <linearGradient id="studentPointsGrad" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                                                                            </linearGradient>
                                                                        </defs>
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                        <XAxis 
                                                                            dataKey="date" 
                                                                            tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }}
                                                                            axisLine={false}
                                                                            tickLine={false}
                                                                        />
                                                                        <YAxis 
                                                                            domain={[0, Math.max(20, Math.ceil((selectedStudent.totalPoints + 2) / 5) * 5)]}
                                                                            tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }}
                                                                            axisLine={false}
                                                                            tickLine={false}
                                                                        />
                                                                        <Tooltip content={<CustomTooltip />} />
                                                                        <Area 
                                                                            type="monotone" 
                                                                            dataKey="cumulativePoints" 
                                                                            stroke="#10b981" 
                                                                            strokeWidth={2.5}
                                                                            fillOpacity={1} 
                                                                            fill="url(#studentPointsGrad)" 
                                                                            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#10b981' }}
                                                                        />
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <AnimatePresence mode="popLayout">
                                                            {selectedStudent.behaviors.length > 0 ? (
                                                                [...selectedStudent.behaviors]
                                                                    .sort((a, b) => {
                                                                        if (behaviorSort === 'points') return b.points - a.points;
                                                                        return b.date.localeCompare(a.date);
                                                                    })
                                                                    .map((b, bidx) => (
                                                                        <motion.div
                                                                            key={`behavior-history-${b.id}`}
                                                                            layout
                                                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                                                            transition={{ 
                                                                                type: 'spring', 
                                                                                stiffness: 120, 
                                                                                damping: 14,
                                                                                delay: Math.min(bidx * 0.05, 0.4) 
                                                                            }}
                                                                            className="relative bg-white border-r-4 md:border-r-8 border-r-emerald-500 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md group"
                                                                        >
                                                                            {currentUser.role === 'admin' && (
                                                                                <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            setEditingBehaviorId(b.id);
                                                                                            setEditFormData({ ...b });
                                                                                        }}
                                                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                                                                        title="تعديل"
                                                                                    >
                                                                                        <Edit2 size={12} className="md:size-[14px]" />
                                                                                    </button>
                                                                                    <button 
                                                                                        onClick={() => handleDeleteBehavior(selectedStudent.id, b.id)}
                                                                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                                                                        title="حذف"
                                                                                    >
                                                                                        <Trash2 size={12} className="md:size-[14px]" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {editingBehaviorId === b.id ? (
                                                                                <div className="space-y-4 text-right">
                                                                                    <div className="flex justify-between items-center mb-2">
                                                                                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">تعديل البيانات</span>
                                                                                        <div className="flex gap-2">
                                                                                            <button 
                                                                                                onClick={() => {
                                                                                                    if (editFormData) {
                                                                                                        handleUpdateBehavior(selectedStudent.id, b.id, editFormData);
                                                                                                    }
                                                                                                }}
                                                                                                className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                                                                                            >
                                                                                                <CircleCheck size={18} />
                                                                                            </button>
                                                                                            <button 
                                                                                                onClick={() => {
                                                                                                    setEditingBehaviorId(null);
                                                                                                    setEditFormData(null);
                                                                                                }}
                                                                                                className="bg-slate-100 text-slate-500 p-2 rounded-xl hover:bg-slate-200 transition-colors"
                                                                                            >
                                                                                                <X size={18} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        className="w-full text-sm font-bold p-3 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-400 outline-none text-right"
                                                                                        value={editFormData?.behaviorTitle || ""}
                                                                                        onChange={(e) => setEditFormData(prev => prev ? ({ ...prev, behaviorTitle: e.target.value }) : null)}
                                                                                    />
                                                                                    <div className="flex gap-2 flex-wrap">
                                                                                        <input 
                                                                                            type="number" 
                                                                                            className="w-16 text-center font-black p-2 bg-slate-50 rounded-lg border-2 border-slate-100 focus:border-blue-400 outline-none text-xs"
                                                                                            value={editFormData?.points || ""}
                                                                                            onChange={(e) => setEditFormData(prev => prev ? ({ ...prev, points: Number(e.target.value) }) : null)}
                                                                                        />
                                                                                        <input 
                                                                                            type="text" 
                                                                                            className="flex-1 min-w-[100px] text-[10px] p-2 bg-slate-50 rounded-lg border-2 border-slate-100 focus:border-blue-400 outline-none text-right"
                                                                                            value={editFormData?.date || ""}
                                                                                            onChange={(e) => setEditFormData(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                                                                                        />
                                                                                        <input 
                                                                                            type="text" 
                                                                                            className="flex-1 min-w-[100px] text-[10px] p-2 bg-slate-50 rounded-lg border-2 border-slate-100 focus:border-blue-400 outline-none text-right"
                                                                                            placeholder="اليوم"
                                                                                            value={editFormData?.day || ""}
                                                                                            onChange={(e) => setEditFormData(prev => prev ? ({ ...prev, day: e.target.value }) : null)}
                                                                                        />
                                                                                        <input 
                                                                                            type="text" 
                                                                                            className="w-full text-[10px] p-2 bg-slate-50 rounded-lg border-2 border-slate-100 focus:border-blue-400 outline-none text-right mt-1"
                                                                                            placeholder="المصدر"
                                                                                            value={editFormData?.source || ""}
                                                                                            onChange={(e) => setEditFormData(prev => prev ? ({ ...prev, source: e.target.value }) : null)}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex justify-between items-start">
                                                                                    <div className="flex-1 text-right">
                                                                                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-lg font-extrabold mb-1.5 select-none transition-colors hover:bg-slate-200">
                                                                                             <Calendar size={12} className="text-slate-500" />
                                                                                             <span className="tabular-nums font-sans">{b.date}</span>
                                                                                         </div>
                                                                                        <div className="font-extrabold text-slate-800 text-sm leading-snug">{b.behaviorTitle}</div>
                                                                                         {b.source && (
                                                                                             <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1 select-none">
                                                                                                 <span className="text-slate-400">الراصد:</span>
                                                                                                 <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/60 font-black">{b.source}</span>
                                                                                             </div>
                                                                                         )}
                                                                                    </div>
                                                                                    <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-emerald-100 transition-all group-hover:bg-emerald-500 group-hover:text-white">
                                                                                        +{b.points}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    ))
                                                            ) : (
                                                                <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                                                                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                                        <History className="text-slate-300" size={32} />
                                                                    </div>
                                                                    <p className="text-slate-400 font-bold text-sm">لا يوجد سلوكيات مسجلة حالياً</p>
                                                                </div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0, scale: 0.93 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.93 }}
                                    className="sticky top-6 flex flex-col gap-6"
                                >
                                    {/* Onboarding Instructions Card */}
                                    <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl p-6 text-center shadow-lg shadow-slate-100">
                                        <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                            <Users size={28} className="text-emerald-500 animate-pulse" />
                                        </div>
                                        <h3 className="font-extrabold text-base text-slate-800 mb-1">منصة رصد السلوك المتميز الموحدة</h3>
                                        <p className="text-[11px] font-black text-slate-400 leading-normal px-2">انقر على زر "عرض السجل" لرصد درجات التميز السلوكي أو التحكم بسجلات نقاط الطالب.</p>
                                    </div>

                                    {/* Live Behavior Audit Logs - For Real-time Tracking */}
                                    {currentUser?.role === "admin" && (
                                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-[2rem] p-5 md:p-6 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col max-h-[500px]">
                                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                                            <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
                                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
                                        </div>

                                        <div className="flex flex-col gap-3 mb-4 relative z-10 border-b border-slate-800/80 pb-4 text-center">
                                            <div className="text-center w-full mt-1.5 mb-0.5">
                                                <span className="font-cairo-extrabold text-white text-base md:text-lg font-black tracking-wide block">سجل الرصد المباشر للمعلمين</span>
                                            </div>

                                            <div className="flex justify-center items-center gap-3 w-full my-0.5">
                                                <div className="bg-white/10 text-white/50 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                                                    تحديث فوري
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[9px] font-bold">
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                                                    متصل
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 w-full mt-1">
                                                <button
                                                    onClick={() => setShowStatsDashboard(true)}
                                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black py-2.5 px-3 rounded-xl border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md hover:scale-[1.02] shrink-0 cursor-pointer"
                                                    title="عرض لوحة التحكم الإحصائية للفصول"
                                                >
                                                    <PieIcon size={13} className="shrink-0" />
                                                    <span>لوحة الإحصائيات (Dashboard)</span>
                                                </button>
                                                <button
                                                    onClick={() => generateLiveLogsReport(behaviorLogs)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black py-2.5 px-3 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md hover:scale-[1.02] shrink-0 cursor-pointer"
                                                    title="تصدير السجل إلى ملف Word"
                                                >
                                                    <FileText size={13} className="shrink-0" />
                                                    <span>تصدير Word</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto custom-scrollbar flex-1 relative z-10 space-y-3 pr-1 pl-1" style={{ maxHeight: '350px' }}>
                                            {behaviorLogs && behaviorLogs.length > 0 ? (
                                                behaviorLogs.map((log) => (
                                                    <motion.div
                                                        key={`live-log-${log.id}`}
                                                        layout
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="bg-slate-800/50 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 transition-all text-right group"
                                                    >
                                                        <div className="flex justify-between items-start gap-2 mb-1.5">
                                                            <div className="font-black text-xs text-amber-400 truncate max-w-[150px]">
                                                                {log.teacherName}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className="font-black text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                                    +{log.points}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="text-[11px] font-black text-slate-200 leading-normal mb-1">
                                                            رصد سلوك متميز للطالب: <span className="text-emerald-300 font-extrabold">{log.studentName}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                                                            <span className="font-sans line-clamp-1">{log.category}</span>
                                                            <span className="font-mono text-[9px] text-slate-500 shrink-0">
                                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : log.date}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center text-slate-500">
                                                    <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center mx-auto mb-3">
                                                        <History size={20} className="text-slate-600 animate-spin" style={{ animationDuration: '3s' }} />
                                                    </div>
                                                    <p className="text-[11px] font-bold">بانتظار تسجيل أول عملية رصد من المعلمين...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <motion.footer
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 80, delay: 1.2 }}
                className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200/50 p-4 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.05)]"
            >
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-slate-500 text-sm">الطلاب:</span>
                            <span className="font-black text-slate-900">{students.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-slate-500 text-sm">إجمالي النقاط:</span>
                            <span className="font-black text-emerald-600">{totalPointsOverall}</span>
                        </div>
                        {filterGrade !== "الكل" && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-slate-500 text-sm">{filterGrade}:</span>
                                <span className="font-black text-purple-600">{gradeStudentCount}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-emerald-700 text-xs font-extrabold flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-500 animate-pulse" />
                        إعداد الموجه الطلابي: عبدالهادي بن محمد المحسن
                    </div>
                </div>
            </motion.footer>
        </div>
    );
}
