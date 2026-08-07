import React from 'react';

interface CancelOrderModalProps {
  isOpen: boolean;
  data: { orderId: string; productName: string; userId: string; totalPrice: number } | null;
  onClose: () => void;
  reason: string;
  setReason: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  data,
  onClose,
  reason,
  setReason,
  onSubmit
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
              <span>🚫</span>
              <h3>ยืนยันการยกเลิกบิลสั่งซื้อ (Void Order & Issue Credit Note)</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-1.5">
            <div className="font-black text-rose-800 flex items-center gap-1 text-sm">
              <span>⚠️</span>
              <span>คำเตือนทางภาษีและสิทธิ์สมาชิก</span>
            </div>
            <p className="leading-relaxed">
              การยกเลิกบิลนี้จะส่งผลให้ระบบสร้าง <strong>"ใบลดหนี้ (Credit Note)"</strong> สำหรับนำแสดงต่อกรมสรรพากรโดยอัตโนมัติ เพื่อขอลดหย่อนภาษีขาย และจะทำการคำนวณสิทธิ์และยอด PV สะสมของผู้ใช้รหัส <strong className="font-mono">{data.userId}</strong> ใหม่ทันที
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">เลขที่บิลสั่งซื้อ:</span>
              <span className="font-mono font-bold text-indigo-600">{data.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">รหัสสมาชิกผู้สั่งซื้อ:</span>
              <span className="font-bold text-slate-800">{data.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">รายการสินค้า:</span>
              <span className="font-bold text-slate-800">{data.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">มูลค่ารวมบิล:</span>
              <span className="font-black text-emerald-600 font-mono">฿ {data.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เหตุผลการยกเลิกบิล (ระบุสำหรับสรรพากรและใบลดหนี้) <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500 mb-2"
              >
                <option value="ออกบิลซ้ำเนื่องจากข้อผิดพลาดของระบบ">ออกบิลซ้ำเนื่องจากข้อผิดพลาดของระบบ (Duplicate Billing Error)</option>
                <option value="คำนวณราคาหรือแพ็กเกจผิดพลาดทางเทคนิค">คำนวณราคาหรือแพ็กเกจผิดพลาดทางเทคนิค (System Pricing Calculation Error)</option>
                <option value="ลูกค้าขอยกเลิกและคืนเงินเต็มจำนวน">ลูกค้าขอยกเลิกและคืนเงินเต็มจำนวน (Customer Cancellation & Full Refund)</option>
                <option value="ออกใบกำกับภาษีผิดรหัสสมาชิก/ที่อยู่">ออกใบกำกับภาษีผิดรหัสสมาชิก/ที่อยู่ (Incorrect Tax Invoice Credentials)</option>
                <option value="custom">ระบุเหตุผลอื่นๆ...</option>
              </select>
              {reason === 'custom' && (
                <input
                  type="text"
                  placeholder="กรอกเหตุผลการยกเลิกบิล..."
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก / ถอยกลับ
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🚫</span>
                <span>ยืนยันยกเลิกและออกใบลดหนี้</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};
