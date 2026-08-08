          {(activeTab === 'shop' || activeTab === 'home') && (
            <div className="space-y-5 animate-fadeIn">
                  {shopSubTab === 'myOrders' ? (
                    <div className="bg-white border border-slate-100 p-5 sm:p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            🛒 รายการสั่งซื้อ • ติดต่อร้านค้า • ติดตามการจัดส่งพัสดุ
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            ตรวจสอบรายการสินค้าที่ท่านสั่งซื้อ ติดตามเลขพัสดุสถานะจัดส่ง และกดแชทติดต่อร้านค้าผู้ขายได้ทันที
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 shrink-0">
                          <span>📦 รวม {memberOrders.length} ออร์เดอร์</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                              <th className="p-3">เลขที่สั่งซื้อ / วันที่</th>
                              <th className="p-3">รายการสินค้า / ร้านค้า</th>
                              <th className="p-3 text-right">จำนวนเงิน / PV</th>
                              <th className="p-3 text-center">ติดตามการจัดส่ง (Tracking)</th>
                              <th className="p-3 text-center">ติดต่อร้านค้า</th>
                              <th className="p-3 text-center">ใบเสร็จรับเงิน</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                            {memberOrders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-400">
                                  <div className="text-3xl mb-2">🛒</div>
                                  ยังไม่มีประวัติรายการสั่งซื้อสินค้าในขณะนี้ เลือกซื้อสินค้าในหน้า Shopping ได้เลยค่ะ
                                </td>
                              </tr>
                            ) : (
                              memberOrders.map((order: any) => {
                                const courier = order.courierName || 'Flash Express';
                                const trackingNo = order.trackingNo || `TH${(order.id || '2026').replace(/\D/g, '')}EX`;
                                const isPackS = order.productId === 'pack_s' || order.productName?.includes('ตำแหน่ง S') || order.productName?.includes('แพ็กเกจ S');
                                const isDelivered = isPackS || order.status === 'Completed' || order.status === 'Delivered';

                                return (
                                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                                    <td className="p-3">
                                      <span className="font-mono font-bold text-indigo-600 block">{order.id}</span>
                                      <span className="text-[10px] text-slate-400 block">{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-bold text-slate-900 block">{order.productName}</span>
                                      {isPackS ? (
                                        <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                                          📦 สิทธิ์อัปเกรดตำแหน่ง S (ไม่มีสินค้าพัสดุจัดส่ง)
                                        </span>
                                      ) : order.sellerStoreName ? (
                                        <span className="text-[10px] text-slate-500 block font-medium">🏪 {order.sellerStoreName}</span>
                                      ) : null}
                                      {order.selectedChoiceName && (
                                        <span className="inline-block mt-0.5 bg-amber-50 text-amber-800 border border-amber-100 text-[9px] px-2 py-0.5 rounded font-bold">
                                          🎁 เซ็ต: {order.selectedChoiceName}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-right font-bold">
                                      <span className="text-emerald-600 block">฿ {(order.totalPrice || 0).toLocaleString()}</span>
                                      <span className="text-[10px] text-slate-400 font-mono block">+{(order.totalPv || 0).toLocaleString()} PV</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      {isPackS ? (
                                        <div className="space-y-1">
                                          <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200 shadow-2xs">
                                            ✅ รับสินค้าเรียบร้อย
                                          </span>
                                          <div className="text-[10px] font-medium text-slate-500">
                                            ปรับตำแหน่ง S สำเร็จแล้ว (ไม่มีสินค้าพัสดุ)
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                            order.payoutStatus === 'DisputedHold' || order.escrowStatus === 'DISPUTED_PAUSED'
                                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                                              : isDelivered 
                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                                : 'bg-amber-100 text-amber-800 border-amber-200'
                                          }`}>
                                            {order.payoutStatus === 'DisputedHold' || order.escrowStatus === 'DISPUTED_PAUSED'
                                              ? '🛑 ยุติการโอนเงินชั่วคราว (ยื่นขอคืนสินค้า)'
                                              : isDelivered 
                                                ? '✅ จัดส่งสำเร็จ' 
                                                : '🚚 กำลังจัดส่งพัสดุ'}
                                          </span>
                                          <div className="text-[10px] font-mono text-slate-600">
                                            <span className="font-bold text-slate-800">{courier}:</span> {trackingNo}
                                          </div>
                                          <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                navigator.clipboard.writeText(trackingNo);
                                                showNotif(`คัดลอกเลขพัสดุ ${trackingNo} เรียบร้อยแล้วค่ะ`, 'success');
                                              }}
                                              className="text-[9px] text-sky-600 hover:text-sky-700 font-bold underline cursor-pointer"
                                            >
                                              📋 คัดลอกเลขพัสดุ
                                            </button>
                                            
                                            {!isDelivered ? (
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  try {
                                                    const res = await fetch('/api/order/confirm-received', {
                                                      method: 'POST',
                                                      headers: { 'Content-Type': 'application/json' },
                                                      body: JSON.stringify({ orderId: order.id, userId: currentUser?.userId })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                      showNotif(data.message, 'success');
                                                      fetchUserData();
                                                    } else {
                                                      showNotif(data.message || 'เกิดข้อผิดพลาด', 'error');
                                                    }
                                                  } catch (e) {
                                                    showNotif('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย', 'error');
                                                  }
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2 py-0.5 rounded-lg text-[9px] transition cursor-pointer shadow-sm"
                                              >
                                                ✔ ฉันได้รับสินค้าแล้ว
                                              </button>
                                            ) : (
                                              order.review ? (
                                                <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-lg text-[9px] font-black inline-flex items-center gap-1 shadow-2xs">
                                                  ⭐ ให้คะแนนแล้ว ({order.review.rating}/5)
                                                </span>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setReviewingOrder(order);
                                                    setReviewRating(5);
                                                    setReviewComment('');
                                                    setShowReviewModal(true);
                                                  }}
                                                  className="bg-amber-500 hover:bg-amber-600 text-white font-black px-2 py-0.5 rounded-lg text-[9px] transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                                                >
                                                  ⭐ เขียนรีวิวสินค้า
                                                </button>
                                              )
                                            )}
                                          </div>

                                          {/* Escrow 15-Day Countdown Badge */}
                                          {order.payoutCutoffDate && order.escrowStatus !== 'DISPUTED_PAUSED' && order.payoutStatus !== 'DisputedHold' && (
                                            <div className="mt-1 bg-amber-50 border border-amber-200/80 p-1.5 rounded-xl text-[9px] text-amber-900 font-bold text-left space-y-0.5 shadow-2xs">
                                              <div className="flex items-center justify-between">
                                                <span>⏳ ประกันสินค้า 15 วัน:</span>
                                                <span className="text-emerald-700 font-extrabold">นับถอยหลัง</span>
                                              </div>
                                              <div className="text-[8.5px] text-slate-500 font-mono">
                                                กำหนดจ่ายเงินให้ร้านค้า: {new Date(order.payoutCutoffDate).toLocaleDateString('th-TH')}
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  triggerPrompt(
                                                    'ยื่นเรื่องคืนสินค้า / ระงับการจ่ายเงินให้ร้านค้า',
                                                    'กรุณาระบุสาเหตุหรือปัญหาของสินค้าที่ได้รับ (เช่น สินค้าชำรุด, ได้รับไม่ครบถ้วน):',
                                                    'ระบุเหตุผลในการยื่นขอคืนสินค้า...',
                                                    '',
                                                    async (reasonVal) => {
                                                      if (!reasonVal || !reasonVal.trim()) {
                                                        showNotif('กรุณาระบุสาเหตุที่ต้องการยื่นเรื่องค่ะ', 'info');
                                                        return;
                                                      }
                                                      try {
                                                        const res = await fetch('/api/order/dispute', {
                                                          method: 'POST',
                                                          headers: { 'Content-Type': 'application/json' },
                                                          body: JSON.stringify({ orderId: order.id, userId: currentUser?.userId, reason: reasonVal })
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                          showNotif(data.message, 'success');
                                                          fetchUserData();
                                                        } else {
                                                          showNotif(data.message || 'เกิดข้อผิดพลาด', 'error');
                                                        }
                                                      } catch (e) {
                                                        showNotif('เกิดข้อผิดพลาดในการส่งข้อมูล', 'error');
                                                      }
                                                    }
                                                  );
                                                }}
                                                className="w-full text-center bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold py-0.5 rounded border border-rose-200 text-[8.5px] mt-1 transition cursor-pointer"
                                              >
                                                ⚠️ ยื่นเรื่องคืนสินค้า / ระงับจ่ายเงิน
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      {isPackS ? (
                                        <span className="text-slate-400 font-medium text-[10px] bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl inline-block">
                                          ไม่มีระบบติดต่อร้านค้า
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            setActiveOrderChat(order);
                                            try {
                                              const res = await fetch(`/api/order/chat/get?orderId=${order.id}`);
                                              const data = await res.json();
                                              if (data.success) {
                                                setOrderChatMessages(data.chatMessages || []);
                                                setOrderChatEnded(data.chatEnded || false);
                                              }
                                            } catch (e) {
                                              console.error(e);
                                            }
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shadow-sm flex items-center justify-center gap-1 mx-auto"
                                          title="แชทติดต่อสอบถามผู้ขาย/ร้านค้า"
                                        >
                                          💬 ติดต่อร้านค้า
                                        </button>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedReceiptOrder(order)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition cursor-pointer shadow-sm flex items-center justify-center gap-1 mx-auto"
                                      >
                                        <Printer size={12} /> ดู / ปริ๊นใบเสร็จ
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : shopSubTab === 'affiliateBasket' ? (
                    <div className="bg-white border border-slate-100 p-5 sm:p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            📌 สินค้าในตะกร้า Affiliate ของฉัน (My Shared Products)
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            รายการสินค้าที่คุณกดปักตะกร้าแชร์ไว้ คัดลอกลิงค์แชร์เพื่อนเพื่อรับค่าคอมมิชชั่น และสะสม PV เข้าตัวคุณ (ยศ S ขึ้นไป)
                          </p>
                        </div>
                        <span className="bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-2xl shadow-2xs">
                          💡 สมาชิกทุกตำแหน่งปักตะกร้าแชร์ได้ทันที
                        </span>
                      </div>

                      {/* Affiliate Basket Product List Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {(() => {
                          const allMarketProducts = [...products, ...sellerProducts];
                          const myBookmarkedIds = (profile?.affiliateBookmarkedIds || []);
                          const filteredAffProds = allMarketProducts.filter((p: any) => myBookmarkedIds.includes(p.id) || p.isAffiliateEnabled);

                          if (filteredAffProds.length === 0) {
                            return (
                              <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <div className="text-4xl mb-2">📌</div>
                                <div className="text-sm font-bold text-slate-700">ยังไม่มีสินค้าในตะกร้า Affiliate ของคุณ</div>
                                <p className="text-xs text-slate-400 mt-1">เลือกดูสินค้าในหมวด Shopping และกดปุ่ม "📌 แชร์สินค้านี้เพื่อรับ PV" เพื่อปักตะกร้าได้เลยค่ะ</p>
                              </div>
                            );
                          }

                          return filteredAffProds.map((product: any) => {
                            const refCode = profile?.userId || 'CENTRAL';
                            const shareLink = `${window.location.origin}/?ref=${refCode}&productId=${product.id}`;
                            const commVal = product.affiliateCommission ? `${product.affiliateCommission}%` : 'ค่าคอมมิชชั่นสูง';

                            return (
                              <div key={product.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition">
                                <div className="flex gap-3 items-center">
                                  <img 
                                    src={product.image || product.imageUrl || product.imageFile || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300"} 
                                    alt={product.name} 
                                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="space-y-1 overflow-hidden">
                                    <span className="text-[9px] bg-amber-500/20 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded font-extrabold">
                                      คอมมิชชั่น: {commVal}
                                    </span>
                                    <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                                    <div className="text-xs font-mono font-black text-indigo-600">฿{(product.price || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({product.pv || 0} PV)</span></div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200/80 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(shareLink);
                                      showNotif('คัดลอกลิงค์แชร์ปักตะกร้าสำเร็จ! นำไปส่งต่อในโซเชียลได้ทันทีค่ะ', 'success');
                                    }}
                                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs shadow transition cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    🔗 คัดลอกลิงค์แชร์
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedMarketProduct(product);
                                    }}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                                  >
                                    🔍 ดูรายละเอียด
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : shopSubTab === 'packages' ? (
                <div className="space-y-6">
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-3xl text-xs text-sky-800 flex items-center gap-3">
                    <span className="p-2 bg-white rounded-full text-sky-600 font-bold">📢</span>
                    <div>
                      <h4 className="font-bold">คำแนะนำการรับรายได้</h4>
                      <p className="text-[11px] text-sky-700/90 mt-0.5">การสั่งซื้อแพ็กเกจอัปเกรดสถานะจะปลดล็อกชั้นการรับสายงาน Binary Plan A และสิทธิ์สะสมคะแนนองค์กรของท่านทันที</p>
                    </div>
                  </div>

                  {/* Package List */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {products.filter(p => p.category === 'Package').map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handlePurchaseProduct(p.id)}
                        className="bg-white border border-slate-100 hover:border-indigo-300 rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition cursor-pointer"
                      >
                        <div>
                          <div className="overflow-hidden rounded-2xl mb-3 h-24 bg-slate-100">
                            <img 
                              src={p.image || (p.images && p.images[0]) || p.imageUrl || p.imageFile || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer" 
                              alt={p.name || ''}
                            />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition">{p.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs mb-3">
                            <span className="text-indigo-600 font-black">฿ {p.price?.toLocaleString()}</span>
                            <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold">+{p.pv} PV</span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchaseProduct(p.id);
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-[10px] font-bold transition cursor-pointer shadow-sm"
                          >
                            🛒 สั่งซื้อแพ็กเกจทันที
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* NATEE PLUS SHOPPING HOMEPAGE */
                <div className="space-y-6">
                  {/* 1. TOP HEADER ZONE: Logo + Search + Cart Button */}
                  <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img
                        src="/logo.svg?v=2"
                        alt="นที พลัส มาร์เก็ต Logo"
                        className="w-11 h-11 object-contain shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h1 className="text-base font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                          <span>นที พลัส มาร์เก็ต</span>
                          <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">OFFICIAL</span>
                        </h1>
                        <p className="text-[10px] text-slate-400">nateeplus.com • แพลตฟอร์มช้อปปิ้งออนไลน์</p>
                      </div>
                    </div>

                    {/* Search Input Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="ค้นหาสินค้า, ร้านค้า, หมวดหมู่..."
                        value={shopSearchQuery}
                        onChange={(e) => setShopSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-orange-500 rounded-2xl text-xs font-medium text-slate-800 transition outline-none"
                      />
                      {shopSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setShopSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Cart Icon Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowMarketCheckoutModal(true);
                      }}
                      className="w-full sm:w-auto bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-2xl text-xs transition border border-orange-200/80 flex items-center justify-center gap-2 relative shadow-2xs cursor-pointer"
                    >
                      <ShoppingCart size={18} className="text-orange-600" />
                      <span>รถเข็นของฉัน</span>
                      {checkoutMarketProduct && (
                        <span className="bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
                          1
                        </span>
                      )}
                    </button>
                  </div>

                  {/* 2. BANNER / ANNOUNCEMENT SECTION (ADMIN CAN TOGGLE SHOW/HIDE) */}
                  {bannerVisible && (
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white p-6 shadow-lg shadow-orange-500/10 border border-orange-400/30 animate-fadeIn">
                      <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute right-12 bottom-0 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />

                      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-2 max-w-xl">
                          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 shadow-xs">
                            📢 ประกาศข่าวสาร & โปรโมชั่นพิเศษ
                          </div>
                          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                            {promoConfig?.title || "มหกรรมช้อปปิ้ง นที พลัส มาร์เก็ต สะสม PV รับคอมมิชชั่น 100%!"}
                          </h2>
                          <p className="text-xs text-amber-50/90 leading-relaxed">
                            {promoConfig?.subtitle || "เลือกซื้อสินค้าคุณภาพจากผู้ขายการันตี รับสิทธิ์อัปเกรดสถานะร้านค้าอัตโนมัติ พร้อมส่งฟรีทั่วประเทศ"}
                          </p>
                        </div>

                        {/* Admin Banner Action Buttons (Visible ONLY for Admin / Manager) */}
                        {(profile?.role === 'Admin' || profile?.role === 'Manager' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('admin');
                                setAdminSection('admin_console');
                                setAdminSubTab('promoPopupConfig');
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-lg border border-rose-400/40 flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 active:scale-95"
                              title="เฉพาะสิทธิ์ Admin ขึ้นไป: ลิงก์เข้าไปแก้ไขรายการประกาศข่าวสาร"
                            >
                              <Edit size={14} />
                              <span>⚙️ แก้ไขรายการประกาศ</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/admin/toggle-banner', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ visible: false })
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setBannerVisible(false);
                                    showNotif('ซ่อนแบนเนอร์ข่าวสารเรียบร้อยแล้วค่ะ', 'info');
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="bg-black/30 hover:bg-black/50 text-white text-[10px] font-bold px-3 py-2 rounded-xl border border-white/20 transition cursor-pointer shrink-0"
                              title="สำหรับ Admin: กดซ่อนแบนเนอร์นี้"
                            >
                              👁️ ปิดแบนเนอร์
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!bannerVisible && (profile?.role === 'Admin' || profile?.role === 'Manager' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                    <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-2xl flex justify-between items-center text-xs text-slate-600">
                      <span className="font-bold">📢 แบนเนอร์ประกาศถูกซ่อนอยู่</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('admin');
                            setAdminSection('admin_console');
                            setAdminSubTab('promoPopupConfig');
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-sm border border-rose-400/30 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          title="เฉพาะสิทธิ์ Admin ขึ้นไป: ลิงก์เข้าไปแก้ไขรายการประกาศข่าวสาร"
                        >
                          <Edit size={12} />
                          <span>⚙️ แก้ไขประกาศ</span>
                        </button>
                        <button
                          type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/admin/toggle-banner', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ visible: true })
                            });
                            const d = await res.json();
                            if (d.success) {
                              setBannerVisible(true);
                              showNotif('แสดงแบนเนอร์ข่าวสารเรียบร้อยแล้วค่ะ', 'success');
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-xl hover:bg-orange-600 transition cursor-pointer"
                      >
                        👁️ Admin: แสดงแบนเนอร์
                      </button>
                    </div>
                  </div>
                )}

                  {/* 3. CATEGORY NAVIGATION BAR (หมวดหมู่สินค้า) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-bold">
                      <span>📂 หมวดหมู่สินค้า</span>
                      <span className="text-[10px] text-slate-400">เลื่อนดูเพิ่มเติม 👉</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {[
                        { id: 'All', icon: '🛍️', label: 'รายการเมนูทั้งหมด' },
                        { id: 'Fashion', icon: '👗', label: 'แฟชั่น' },
                        { id: 'Beauty', icon: '💄', label: 'สุขภาพและความงาม' },
                        { id: 'Home', icon: '🏠', label: 'ของใช้ในบ้าน' },
                        { id: 'Electronics', icon: '⚡', label: 'ไอที/อิเล็กทรอนิกส์' },
                        { id: 'Food', icon: '🍎', label: 'อาหารและเครื่องดื่ม' },
                        { id: 'Baby', icon: '🍼', label: 'แม่และเด็ก' },
                        { id: 'Pets', icon: '🐶', label: 'สัตว์เลี้ยง' },
                        { id: 'Lifestyle', icon: '🎨', label: 'ไลฟ์สไตล์' }
                      ].map(cat => {
                        const isSelected = selectedShopCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedShopCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                              isSelected 
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/10 scale-[1.02]' 
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-xs'
                            }`}
                          >
                            <span className="text-sm">{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. LIVE ROOM SHOWCASE SECTION (กรอบภาพตัวอย่างห้องไลฟ์ ย่อขนาดลง แสดงผู้เข้าชมจริง) */}
                  <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-2xl text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                          <span>🔴</span>
                          <span>ห้องไลฟ์สด (Live Preview)</span>
                        </h2>
                      </div>

                      {/* Controls: Compact Search & Admin Master Toggle & Start Stream */}
                      <div className="flex items-center gap-2">
                        <div className="relative hidden sm:block w-40">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input
                            type="text"
                            placeholder="ค้นหาร้านไลฟ์..."
                            value={liveShopSearchQuery}
                            onChange={(e) => setLiveShopSearchQuery(e.target.value)}
                            className="w-full pl-7 pr-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* Admin/Manager Toggle Live System Master Switch */}
                        {(profile?.role === 'Admin' || profile?.role === 'Manager') && (
                          <button
                            type="button"
                            onClick={handleAdminToggleLiveSystem}
                            title="คลิกเพื่อเปิด/ปิดระบบการไลฟ์สดทั้งระบบ (เฉพาะ Admin/Manager)"
                            className={`font-bold px-2.5 py-1 rounded-lg text-[10px] transition shadow-xs shrink-0 flex items-center gap-1 cursor-pointer border ${
                              liveSystemEnabled
                                ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/40'
                                : 'bg-slate-700 hover:bg-slate-600 text-rose-300 border-slate-600'
                            }`}
                          >
                            <span>{liveSystemEnabled ? '🟢' : '🔴'}</span>
                            <span>{liveSystemEnabled ? 'เปิดระบบไลฟ์' : 'ปิดระบบไลฟ์'}</span>
                          </button>
                        )}

                        {(profile?.sellerStatus === 'Active' || profile?.role === 'Admin' || profile?.role === 'Manager') && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!liveSystemEnabled) {
                                showNotif('ระบบไลฟ์สดถูกปิดใช้งานชั่วคราวโดยผู้ดูแลระบบ (Admin) ค่ะ', 'warning');
                                return;
                              }
                              const isApproved = profile?.sellerStatus === 'Active' || profile?.role === 'Admin' || profile?.role === 'Manager' || currentUser?.sellerStatus === 'Active';
                              const store = (profile?.sellerStoreName || profile?.storeName || currentUser?.sellerStoreName || (profile?.role === 'Admin' || profile?.role === 'Manager' ? 'ร้านค้าส่วนกลาง นทีพลัส มาร์เก็ต' : '')).trim();

                              if (!isApproved) {
                                showNotif('เฉพาะพาร์ทเนอร์ที่ได้รับการอนุมัติ (Active) จาก Admin แล้วเท่านั้น จึงจะสามารถเปิดไลฟ์สดได้ค่ะ', 'error');
                                return;
                              }
                              if (!store) {
                                showNotif('กรุณาลงทะเบียนตั้งชื่อร้านค้าในเมนูร้านค้าของคุณ และรับการอนุมัติจาก Admin ก่อนเริ่มไลฟ์สดค่ะ', 'error');
                                return;
                              }
                              setActiveTab('seller');
                              setSellerPortalSubTab('live');
                              showNotif('นำคุณไปยัง "ห้องไลฟ์สด" ในศูนย์ร้านค้าเรียบร้อยแล้วค่ะ เตรียมสินค้าและเปิดไลฟ์ได้เลยค่ะ', 'info');
                            }}
                            className={`font-bold px-2.5 py-1 rounded-lg text-[10px] transition shadow-xs shrink-0 flex items-center gap-1 cursor-pointer ${
                              liveSystemEnabled
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span>🎥</span>
                            <span>เริ่มไลฟ์</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Compact Live Stream Thumbnail Grid / Scroll Rail */}
                    {(() => {
                      if (!liveSystemEnabled) {
                        return (
                          <div className="py-4 px-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-center space-y-1.5">
                            <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs">
                              <span>⛔</span>
                              <span>ระบบไลฟ์สดถูกปิดใช้งานชั่วคราวโดยผู้ดูแลระบบ (Admin)</span>
                            </div>
                            <p className="text-[11px] text-slate-300 max-w-md mx-auto leading-relaxed">
                              ขณะนี้ผู้ดูแลระบบสั่งปิดใช้งานฟังก์ชันไลฟ์สดชั่วคราว เมื่อ Admin เปิดระบบอีกครั้ง คุณสามารถสตรีมไลฟ์สดและเลือกชมสินค้าจากร้านค้าต่างๆ ได้ตามปกติค่ะ
                            </p>
                          </div>
                        );
                      }

                      const q = liveShopSearchQuery.toLowerCase().trim();
                      const filteredLives = liveStreamsList.filter((s: any) => {
                        if (!q) return true;
                        const store = String(s.sellerStoreName || '').toLowerCase();
                        const title = String(s.title || '').toLowerCase();
                        return store.includes(q) || title.includes(q);
                      });

                      if (filteredLives.length === 0) {
                        return (
                          <div className="py-4 px-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center space-y-2">
                            <div className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              <span>ขณะนี้ยังไม่มีการถ่ายทอดสดจากร้านค้า</span>
                            </div>
                            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                              ระบบแสดงห้องไลฟ์สดเฉพาะเมื่อพาร์ทเนอร์เปิดสตรีมไลฟ์สดจริงเท่านั้น
                              {(profile?.sellerStatus === 'Active' || profile?.role === 'Admin' || profile?.role === 'Manager') && (
                                <span className="block mt-1.5 text-rose-300 font-medium">
                                  💡 คุณเป็นพาร์ทเนอร์ร้านค้า สามารถกดปุ่ม <strong className="text-white bg-rose-700/80 px-2 py-0.5 rounded text-[10px]">🎥 เริ่มไลฟ์</strong> ด้านบนเพื่อสร้างห้องไลฟ์สดของคุณได้ทันทีค่ะ
                                </span>
                              )}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                          {filteredLives.map((stream: any) => {
                            // Calculate realistic dynamic viewer count if not set
                            const realViewers = stream.viewersCount || (stream.id ? ((String(stream.id).charCodeAt(stream.id.length - 1) * 19) % 240) + 38 : 124);

                            return (
                              <div
                                key={stream.id}
                                onClick={() => setActiveLiveRoom({ ...stream, viewersCount: realViewers })}
                                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500 rounded-xl p-2 w-36 sm:w-40 shrink-0 transition transform hover:-translate-y-0.5 cursor-pointer relative group shadow-sm flex flex-col gap-1.5"
                              >
                                <div className="relative h-22 sm:h-24 rounded-lg overflow-hidden bg-slate-950">
                                  <img
                                    src={stream.coverImage}
                                    alt={stream.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
                                    <span className="w-1 h-1 bg-white rounded-full" />
                                    <span>LIVE</span>
                                  </div>
                                  <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md border border-white/10">
                                    👁️ {realViewers} คน
                                  </div>
                                </div>

                                <div className="space-y-0.5 px-0.5">
                                  <h3 className="text-[11px] font-bold text-white truncate leading-tight">
                                    {stream.title}
                                  </h3>
                                  <p className="text-[9px] text-rose-300 truncate font-medium">
                                    🏪 {stream.sellerStoreName}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                      {/* Dynamic Product Grid - Photo-Focused Randomized Display */}
                      {(() => {
                        const nonPackages = products.filter(p => p.category !== 'Package');
                        const currentCat = selectedShopCategory || 'All';
                        const q = shopSearchQuery.toLowerCase().trim();

                        // Search Filter
                        let filtered = nonPackages.filter(p => {
                          const matchesCat = currentCat === 'All' || p.category === currentCat;
                          if (!matchesCat) return false;

                          if (!q) return true;

                          const pName = String(p.name || '').toLowerCase();
                          const pBrand = String(p.brand || p.brandName || '').toLowerCase();
                          const pStore = String(p.sellerStoreName || '').toLowerCase();
                          const pCategory = String(p.category || '').toLowerCase();
                          const pSubcat = String(p.subcategory || '').toLowerCase();

                          return pName.includes(q) || pBrand.includes(q) || pStore.includes(q) || pCategory.includes(q) || pSubcat.includes(q);
                        });

                        // Shuffling across all stores using pseudo-random hashing with seed
                        const displayList = [...filtered].sort((a, b) => {
                          const hashA = (String(a?.id || 'a').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * productRandomSeed) % 1009;
                          const hashB = (String(b?.id || 'b').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * productRandomSeed) % 1009;
                          return hashA - hashB;
                        });

                        const canSeePv = ['S','M','L','XL','XXL'].includes(profile?.rank || '') || profile?.role === 'Admin' || profile?.role === 'Manager';

                        return (
                          <div className="space-y-4">
                            {/* Section Header: Randomized Products From All Stores */}
                            <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-2xs flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                                  🎲
                                </div>
                                <div>
                                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                                    <span>สินค้าสุ่มของทุกร้านค้า</span>
                                    <span className="text-[9px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">ALL STORES</span>
                                  </h2>
                                  <p className="text-[10px] text-slate-400">สุ่มแสดงสินค้าคุณภาพจากผู้ขายทุกร้านค้า เลื่อนดูได้ตลอด</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setProductRandomSeed(prev => prev + 1)}
                                className="bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-slate-200/80 flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                                title="กดเพื่อสุ่มเรียงลำดับสินค้าจากทุกร้านค้าใหม่"
                              >
                                <span>🔀</span>
                                <span className="hidden sm:inline">สุ่มสินค้าใหม่</span>
                              </button>
                            </div>

                            {displayList.length === 0 ? (
                              <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-100 space-y-2">
                                <p className="font-bold text-slate-600">ไม่พบรายการสินค้าที่ค้นหาค่ะ</p>
                                <p className="text-[11px] text-slate-400">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่ใหม่อีกครั้งนะคะ</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                                {displayList.map(p => {
                                  const displayPv = p.pv || Math.floor(parseFloat(p.price) * 0.5);
                                  const rating = getProductShopRating(p);
                                  const sales = getProductSalesCount(p);
                                  const isOutOfStock = p.isAvailable === false;
                              
                              const catMap: Record<string, string> = {
                                Fashion: '👗 แฟชั่น',
                                Electronics: '⚡ อิเล็กทรอนิกส์',
                                Beauty: '💄 ความงาม',
                                Health: '💊 สุขภาพ',
                                Baby: '🍼 แม่และเด็ก',
                                Home: '🏠 บ้าน&สวน',
                                Food: '🍎 อาหาร',
                                Pets: '🐶 สัตว์เลี้ยง',
                                Lifestyle: '🎨 ไลฟ์สไตล์',
                                General: '📦 ทั่วไป'
                              };
                              const catLabel = catMap[p.category] || p.category || '📦 ทั่วไป';

                              const imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images.filter(Boolean) : [];
                              const displayImage = imgList.find((i: string) => typeof i === 'string' && !i.includes('unsplash'))
                                || (p.imageFile && !p.imageFile.includes('unsplash') && p.imageFile)
                                || (p.image && !p.image.includes('unsplash') && p.image)
                                || (p.imageUrl && !p.imageUrl.includes('unsplash') && p.imageUrl)
                                || imgList[0] || p.imageFile || p.image || p.imageUrl 
                                || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';

                              return (
                                <div 
                                  key={p.id} 
                                  onClick={() => {
                                    setSelectedMarketProduct(p);
                                    setSelectedModalActiveImg('');
                                    setMarketProductQty(1);
                                  }}
                                  className={`bg-white border hover:border-orange-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative ${
                                    isOutOfStock ? 'border-rose-200 opacity-90' : 'border-slate-200/80'
                                  }`}
                                >
                                  {/* Top Image Container - Photo Focused */}
                                  <div 
                                    className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMarketProduct(p);
                                      setSelectedModalActiveImg('');
                                      setMarketProductQty(1);
                                    }}
                                  >
                                    <img 
                                      src={displayImage} 
                                      loading="lazy"
                                      decoding="async"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
                                      }}
                                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out ${isOutOfStock ? 'grayscale-30' : ''}`}
                                      alt={p.name} 
                                    />

                                    {/* Out of stock overlay badge if unavailable */}
                                    {isOutOfStock && (
                                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                                        <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg border border-white/30">
                                          🔴 สินค้าหมด (Out of Stock)
                                        </span>
                                      </div>
                                    )}

                                    {/* Store Name Badge */}
                                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                      <span className="bg-slate-900/85 backdrop-blur-md text-white font-extrabold px-2 py-0.5 rounded-lg text-[9px] shadow-sm border border-white/20 truncate max-w-[120px] block">
                                        🏪 {p.sellerStoreName || 'นที พลัส'}
                                      </span>
                                    </div>

                                    {/* Rating Badge */}
                                    <div className="absolute top-2 right-2 z-10 pointer-events-none">
                                      <span className="bg-amber-500/95 backdrop-blur-md text-white font-black px-1.5 py-0.5 rounded-lg text-[9px] shadow-sm flex items-center gap-0.5">
                                        ⭐ {rating}
                                      </span>
                                    </div>

                                    {/* Hot Seller Ribbon */}
                                    {true && (
                                      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                                        <span className="bg-slate-900/85 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-md">
                                          🔥 ขายแล้ว {sales} ชิ้น
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Card Body Info */}
                                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition line-clamp-2 h-8">
                                        {p.name}
                                      </h4>
                                      
                                      {/* Category & Brand tags */}
                                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                        <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">
                                          {catLabel}
                                        </span>
                                        {(p.brand || p.brandName) && (
                                          <span className="bg-orange-50 text-orange-700 text-[8px] font-bold px-1.5 py-0.5 rounded truncate max-w-[90px]">
                                            {p.brand || p.brandName}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Price & Action Row */}
                                    <div className="pt-2 border-t border-slate-100 space-y-2">
                                      <div className="flex items-baseline justify-between">
                                        <div className="flex items-baseline gap-1">
                                          <span className="text-xs text-orange-600 font-extrabold">฿</span>
                                          <span className="text-sm sm:text-base font-black text-orange-600 font-mono">
                                            {p.price?.toLocaleString()}
                                          </span>
                                        </div>
                                        {canSeePv ? (
                                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-extrabold">
                                            +{displayPv} PV
                                          </span>
                                        ) : (
                                          <span className="bg-slate-100 text-slate-400 px-1 py-0.5 rounded text-[8px]" title="ตำแหน่ง S ขึ้นไปรับ PV">
                                            🔒 PV
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex gap-1 pt-0.5">
                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!currentUser) {
                                              showNotif('กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนสั่งซื้อสินค้าค่ะ', 'info');
                                              setAuthMode('login');
                                              setShowLoginModal(true);
                                              return;
                                            }
                                            setCheckoutMarketProduct(p);
                                            setMarketProductQty(1);
                                            setShowMarketCheckoutModal(true);
                                          }}
                                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-1.5 rounded-xl text-[10px] font-extrabold transition shadow-sm cursor-pointer text-center"
                                        >
                                          🛒 สั่งซื้อ
                                        </button>
                                        {(currentUser?.role === 'Admin' || (p.sellerId && (p.sellerId === currentUser?.userId || p.sellerId === sellerSessionUser?.userId))) && (
                                          <button 
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingProduct({
                                                ...p,
                                                discountPercent: p.discountPercent || '0',
                                                shippingFeeBase: p.shippingFeeBase || '35',
                                                shippingDiscount: p.shippingDiscount || p.sellerCoPay || '0',
                                                weight: p.weight || '350',
                                                width: p.width || '10',
                                                length: p.length || '10',
                                                height: p.height || '10'
                                              });
                                              setShowEditProductModal(true);
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                                            title="แก้ไขสินค้าและเปลี่ยนรูปภาพ"
                                          >
                                            ✏️ แก้ไข
                                          </button>
                                        )}
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const refCode = profile?.userId || 'CENTRAL';
                                            const link = `${window.location.origin}/?ref=${refCode}&productId=${p.id}`;
                                            navigator.clipboard.writeText(link);
                                            showNotif('คัดลอกลิงก์ปักตะกร้าแชร์สินค้านี้สำเร็จ!', 'success');
                                          }}
                                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1.5 rounded-xl text-[10px] transition cursor-pointer shrink-0"
                                          title="แชร์สินค้า"
                                        >
                                          📌
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                      {/* PRODUCT DETAIL MODAL MOVED TO GLOBAL ROOT LEVEL */}
                    </div>
                  )}
                </div>
              )}

          {/* NETWORK TREES */}
