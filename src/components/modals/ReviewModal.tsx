import React from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewingOrder: { id: string; productName: string } | null;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  reviewingOrder,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit
}) => {
  if (!isOpen || !reviewingOrder) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999999] animate-fade-in" onClick={onClose}>
      <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4" onClick={(e) => e.stopPropagation()}>
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full cursor-pointer transition text-xs font-bold"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
            ⭐ ให้คะแนนและรีวิวสินค้า
          </span>
          <h3 className="text-lg font-black text-slate-900 pt-1">
            {reviewingOrder.productName || 'สินค้าคำสั่งซื้อ'}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            เลขที่ออร์เดอร์: {reviewingOrder.id}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-2">
          <label className="text-xs font-bold text-slate-700 block">ให้คะแนนดาวความพึงพอใจ:</label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition transform hover:scale-125 cursor-pointer ${
                  star <= rating ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="text-[11px] font-extrabold text-amber-700">
            {rating === 5 && '🌟 ประทับใจมากที่สุด (5 ดาว)'}
            {rating === 4 && '👍 ดีมาก (4 ดาว)'}
            {rating === 3 && '👌 ปานกลาง (3 ดาว)'}
            {rating === 2 && '👎 พอใช้ (2 ดาว)'}
            {rating === 1 && '💔 ปรับปรุง (1 ดาว)'}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">ข้อความรีวิวสินค้าเพิ่มเติม (ถ้ามี):</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="เขียนความประทับใจเกี่ยวกับสินค้า คุณภาพ ความเร็วในการจัดส่ง..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
        >
          ส่งรีวิวสินค้า
        </button>
      </div>
    </div>
  );
};
