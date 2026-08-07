import React, { useState } from 'react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopEarnings: number;
  onConfirm: (amount: number) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  shopEarnings,
  onConfirm
}) => {
  const [amount, setAmount] = useState<number>(0);
  if (!isOpen) return null;

  const tax = amount * 0.03;
  const fee = 20;
  const net = Math.max(0, amount - tax - fee);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100">
        <h3 className="font-bold text-lg text-slate-800">ถอนรายได้</h3>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">ยอดเงินในกระเป๋า: ฿{shopEarnings.toLocaleString()}</p>
          <input
            type="number"
            className="w-full border rounded-xl p-3"
            placeholder="ระบุยอดถอน"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            max={shopEarnings}
          />
          <div className="space-y-1 text-sm text-slate-600">
            <p>ภาษีหัก ณ ที่จ่าย 3%: ฿{tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <p>ค่าบริการ: ฿{fee.toLocaleString()}</p>
            <p className="text-base font-bold text-slate-900">ยอดคงเหลือเข้าบัญชี: ฿{net.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold cursor-pointer">ปิด</button>
          <button onClick={() => onConfirm(amount)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold cursor-pointer">ยืนยันถอน</button>
        </div>
      </div>
    </div>
  );
};
