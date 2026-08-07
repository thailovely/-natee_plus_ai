import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, ArrowLeftRight, History, CreditCard } from 'lucide-react';

interface ShopDashboardProps {
  profile: any;
  transactions: any[];
  onBack: () => void;
}

export const ShopDashboard: React.FC<ShopDashboardProps> = ({ profile, transactions, onBack }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Assuming 'Sale' is a transaction type for shop earnings
  const shopEarnings = transactions
    .filter(t => t.type === 'Sale' && t.status === 'Approved')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 200) {
      alert('ยอดถอนขั้นต่ำคือ 200 บาทค่ะ');
      return;
    }
    if (amount > shopEarnings) {
      alert('ยอดเงินในกระเป๋าร้านค้าไม่เพียงพอ');
      return;
    }

    try {
      const res = await fetch('/api/member/withdraw-shop-earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId, amount })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setWithdrawAmount('');
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      <button onClick={onBack} className="text-indigo-600 font-bold mb-4 flex items-center gap-1">
        <ArrowLeftRight size={18} /> กลับสู่หน้าหลัก
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">แดชบอร์ดรายได้ร้านค้า</h2>
        <div className="bg-indigo-50 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-800">รายได้คงเหลือในระบบร้านค้า</p>
            <p className="text-3xl font-black text-indigo-950">฿ {shopEarnings.toLocaleString()}</p>
          </div>
          <Wallet size={40} className="text-indigo-300" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">ถอนรายได้ร้านค้า</h3>
        <input 
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="ระบุจำนวนเงินที่ต้องการถอน (ขั้นต่ำ 200)"
          className="w-full border border-slate-200 rounded-xl p-4 mb-4"
        />
        <button 
          onClick={handleWithdraw}
          className="w-full bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          <CreditCard size={20} /> ยืนยันถอนรายได้ร้านค้า
        </button>
      </div>
    </motion.div>
  );
};
