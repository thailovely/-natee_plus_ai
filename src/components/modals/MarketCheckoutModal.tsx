import React from 'react';

interface MarketCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  quantity: number;
  setShopSubTab: (tab: string) => void;
  setProduct: (product: any) => void;
  setShowModal: (show: boolean) => void;
  showNotif: (msg: string, type: string) => void;
  playOrderAlertSound: () => void;
  currentUser: any;
  profile: any;
  fetchProfile: (userId: string) => void;
}

export const MarketCheckoutModal: React.FC<MarketCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity,
  setShopSubTab,
  setProduct,
  setShowModal,
  showNotif,
  playOrderAlertSound,
  currentUser,
  profile,
  fetchProfile
}) => {
  if (!isOpen) return null;

  const isSellerFreeShipping = 
    product?.isFreeShipping === true ||
    product?.sellerPaysShipping === true ||
    product?.freeShipping === true ||
    product?.shippingFee === 0 ||
    product?.shippingFee === '0' ||
    product?.shippingFeeBase === '0' ||
    product?.shippingFeeBase === 0;

  const itemShippingFee = isSellerFreeShipping 
    ? 0 
    : (product?.shippingFee !== undefined && product?.shippingFee !== null 
        ? Number(product.shippingFee) 
        : (product?.shippingFeeBase !== undefined && product?.shippingFeeBase !== null 
            ? Number(product.shippingFeeBase) 
            : 35));

  const totalShippingFee = itemShippingFee * quantity;
  const itemsTotalPrice = (product?.price || 0) * quantity;
  const grandTotal = itemsTotalPrice + totalShippingFee;

  const productPv = product?.pv || Math.floor(parseFloat(product?.price || 0) * 0.5);
  const totalPvEarned = productPv * quantity;
  const canSeePv = ['S','M','L','XL','XXL'].includes(profile?.rank || '') || profile?.role === 'Admin' || profile?.role === 'Manager';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 animate-fadeIn">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">รถเข็นของฉัน (Order Summary)</h3>
              <p className="text-[11px] text-slate-400">
                {product ? `ร้านค้า: ${product.sellerStoreName || product.sellerId || 'นที พลัส มาร์เก็ต'}` : 'นที พลัส มาร์เก็ต'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1.5 rounded-full hover:bg-slate-100 text-sm cursor-pointer"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        {!product ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl border border-amber-100">
              🛒
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">รถเข็นของคุณยังไม่มีสินค้า</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              ขณะนี้ไม่มีรายการสินค้าค้างในรถเข็น คุณสามารถเลือกชมและกดสั่งซื้อสินค้าใน นที พลัส มาร์เก็ต ได้เลยค่ะ
            </p>
            <div className="flex gap-2 pt-2 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer"
              >
                ยกเลิก / ปิด
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setShopSubTab('all');
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs transition shadow-md cursor-pointer"
              >
                🛍️ เลือกดูสินค้า
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 items-center">
              <img
                src={product.image}
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                alt={product.name}
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{product.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">ราคาต่อชิ้น: ฿{(product.price || 0).toLocaleString()} | จำนวน: {quantity} ชิ้น</p>
                <p className="text-[10px] text-emerald-700 font-bold">
                  ค่าจัดส่งต่อชิ้น: {isSellerFreeShipping || itemShippingFee === 0 ? '฿0 (ร้านค้าออกค่าขนส่งให้ค่ะ)' : `฿${itemShippingFee}`}
                </p>
                {canSeePv && (
                  <p className="text-[10px] text-indigo-600 font-bold">
                    คะแนน PV ที่ได้รับ: +{totalPvEarned.toLocaleString()} PV
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 font-sans text-xs">
              <div className="flex justify-between text-slate-300">
                <span>ราคาสินค้ารวม ({quantity} ชิ้น):</span>
                <span className="font-mono font-bold">฿ {itemsTotalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>ค่าจัดส่งรวม:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {isSellerFreeShipping || itemShippingFee === 0 ? '฿ 0.00 (ร้านค้าออกค่าขนส่งให้)' : `฿ ${totalShippingFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
              {canSeePv && (
                <div className="flex justify-between text-emerald-300 pt-1 border-t border-slate-800 font-bold">
                  <span>รวมคะแนน PV ที่จะได้รับ (ตำแหน่ง {profile?.rank || 'S'} ขึ้นไป):</span>
                  <span className="font-mono font-extrabold">+{totalPvEarned.toLocaleString()} PV</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline font-black">
                <span className="text-amber-400 text-sm">ยอดชำระสุทธิ (Total Amount):</span>
                <span className="text-emerald-400 text-lg font-mono">฿ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center space-y-1">
              <span className="text-amber-800 font-extrabold text-xs block">🛡️ การรับประกันความพึงพอใจ 100%</span>
              <p className="text-[11px] font-bold text-amber-900 leading-tight">
                สินค้ารับประกัน หากไม่พอใจยินดีคืนเงิน 7 วัน นับจากวันรับสินค้า
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs transition cursor-pointer"
                >
                  ปิดหน้าต่าง (เลือกดูต่อ)
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/shop/purchase', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: currentUser?.userId || profile?.userId,
                        productId: product.id,
                        quantity: quantity
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setProduct(null);
                      setShowModal(false);
                      playOrderAlertSound();
                      showNotif(`สั่งซื้อสินค้าสำเร็จแล้ว! ${data.message || ''}`, 'success');
                      if (currentUser) {
                        fetchProfile(currentUser.userId);
                      }
                    } else {
                      showNotif(data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อสินค้า', 'error');
                    }
                  } catch (err) {
                    showNotif('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์สั่งซื้อสินค้าได้', 'error');
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-2xl font-black text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-1"
              >
                <span>✓</span>
                <span>ยืนยันการสั่งซื้อสินค้า (ส่งคำสั่งซื้อไปยังร้านค้า)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
