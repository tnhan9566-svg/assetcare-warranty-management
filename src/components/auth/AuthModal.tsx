import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, users, switchUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      const ok = login(email, password);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Email hoặc mật khẩu không chính xác! Hãy thử các tài khoản demo bên dưới.');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Vui lòng nhập họ tên đầy đủ!');
        return;
      }
      const ok = register(fullName, email, password);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Email này đã được sử dụng!');
      }
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {mode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-[11px] text-slate-400">AssetCare - Quản lý bảo hành & thiết bị</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-bold bg-white">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'register'
                ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng ký mới
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            <span>{mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Demo Login Buttons */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              1-Click Đăng nhập tài khoản Demo:
            </span>

            <div className="space-y-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.id)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={u.avatar}
                      alt={u.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">
                        {u.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">{u.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
