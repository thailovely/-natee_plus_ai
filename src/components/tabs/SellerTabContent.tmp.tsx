          {activeTab === 'seller' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-950">Natee Plus Partner 🤝</h2>
                  <p className="text-xs text-slate-400 mt-1">แผงควบคุมคลังสินค้าและการค้าปลีก-ส่ง นที พาร์ทเนอร์</p>
                </div>

              </div>

              {/* EARNINGS DISPLAY */}
              {(() => {
                const shopEarnings = transactions.filter(t => t.type === 'Sale' && t.status === 'Approved').reduce((sum, t) => sum + (t.amount || 0), 0);
                const tax = shopEarnings * 0.03;
                const fee = 20;
                const net = shopEarnings - tax - fee;
                return (
                  <>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-indigo-600 font-bold">รายได้คงเหลือในระบบร้านค้า</p>
                        <p className="text-2xl font-black text-indigo-950">฿ {shopEarnings.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowWithdrawModal(true)} className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-xs shadow-sm cursor-pointer hover:bg-indigo-50 transition">ถอนรายได้</button>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xl">💰</span>
                        </div>
                      </div>
                    </div>
                    <WithdrawModal 
                      isOpen={showWithdrawModal}
                      onClose={() => setShowWithdrawModal(false)}
                      shopEarnings={shopEarnings}
                      onConfirm={(amount) => { 
                        setShowWithdrawModal(false); 
                        alert(`ทำรายการถอนเงิน ${amount} บาทเรียบร้อย`); 
                      }}
                    />
                  </>
                );
              })()}

              {/* WELCOME FIRST-LOGIN POPUP MODAL */}
              {sellerWelcomeShown && sellerSessionUser?.sellerStatus === 'Active' && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-indigo-100 animate-fadeIn">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck size={36} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-950">🎉 อนุมัติการเปิดร้านค้าเรียบร้อยแล้ว!</h3>
                      <p className="text-xs text-slate-500 leading-normal">
                        ยินดีต้อนรับ สู่ระบบ Partner รหัสร้านค้าของคุณคือ:
                      </p>
                      <div className="inline-block bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
                        <span className="font-mono font-extrabold text-indigo-700 text-lg tracking-wider">
                          {sellerSessionUser.sellerCode}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleSellerMarkFirstLoginShown}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow cursor-pointer text-xs"
                    >
                      ตกลง (รับทราบและเข้าสู่ระบบร้านค้า)
                    </button>
                  </div>
                </div>
              )}

              {!sellerSessionUser ? (
                sellerPortalSubTab === 'learning' ? (
                  // 📖 RENDER LEARNING CENTER (ACCESSIBLE TO ALL MEMBERS & VISITORS)
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          📖 ศูนย์การเรียนรู้และคู่มือผู้ขาย (Partner Learning Centre)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">รวมคู่มือการใช้งานระบบ บทเรียนการตลาด และวิธีการไลฟ์สดขายสินค้า</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSellerPortalSubTab('home')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                      >
                        <span>←</span>
                        <span>กลับสู่หน้าเข้าสู่ระบบร้านค้า</span>
                      </button>
                    </div>

                    {/* FEATURED: LIVE STREAMING SELLER GUIDE */}
                    <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-rose-500/30 shadow-xl space-y-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            คู่มือการใช้งานระบบ: Live Shopping
                          </div>
                          <h5 className="text-base font-extrabold text-white flex items-center gap-2">
                            🎥 ขั้นตอนการไลฟ์สดขายสินค้า และเชื่อมต่อ TikTok Live / YouTube / Facebook
                          </h5>
                          <p className="text-xs text-slate-300">
                            วิธีสร้างห้องไลฟ์สด นำลิงก์วิดีโอจากแพลตฟอร์มต่างๆ มาวางเพื่อดึงสัญญาณสด พร้อมปักตะกร้าสินค้าในร้านค้าของคุณ
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('shop');
                            showNotif("นำท่านไปยังหน้าตลาดเพื่อทดลองเปิดห้องไลฟ์สด", "info");
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                        >
                          <Video size={16} />
                          <span>ไปที่หน้าตลาด เพื่อเปิดไลฟ์สด</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 font-sans text-xs">
                        {/* STEP 1 */}
                        <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                            <h6 className="font-extrabold text-rose-200">เริ่มสร้างห้องไลฟ์สด</h6>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            กดปุ่ม <strong className="text-white">"🎥 เริ่มไลฟ์สด"</strong> บนแถบห้องไลฟ์สดหน้ามาร์เก็ต ใส่หัวข้อเรื่องที่น่าสนใจ และอัปโหลดภาพปกห้องไลฟ์ (Cover Image) เพื่อดึงดูดผู้เข้าชม
                          </p>
                        </div>

                        {/* STEP 2 */}
                        <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                            <h6 className="font-extrabold text-indigo-200">คัดลอกลิงก์สตรีมไลฟ์สด</h6>
                          </div>
                          <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                            <div><strong className="text-white">🎵 TikTok Live:</strong> เปิด TikTok บนมือถือ -&gt; Go LIVE -&gt; คัดลอกลิงก์สตรีม เช่น <code className="text-amber-300 text-[10px]">https://www.tiktok.com/@yourname/live</code></div>
                            <div><strong className="text-white">▶️ YouTube Live:</strong> คัดลอก URL เช่น <code className="text-amber-300 text-[10px]">https://youtube.com/live/xxx</code> หรือ <code className="text-amber-300 text-[10px]">https://youtu.be/xxx</code></div>
                            <div><strong className="text-white">📘 Facebook Live:</strong> คัดลอกลิงก์วิดีโอถ่ายทอดสดบนเพจของคุณ</div>
                          </div>
                        </div>

                        {/* STEP 3 */}
                        <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                            <h6 className="font-extrabold text-emerald-200">ปักตะกร้าสินค้า & รับออเดอร์</h6>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            เลือกสินค้าในร้านของคุณที่ต้องการปักตะกร้า ลูกค้าที่เข้าชมไลฟ์สดสามารถคลิกดูสินค้า ปักตะกร้า และกดสั่งซื้อพร้อมสะสมคะแนน PV ได้ทันทีขณะรับชม
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-3.5 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">💡 เคล็ดลับเพิ่มยอดขาย:</span>
                          <span>แชทโต้ตอบกับลูกค้าแบบ Real-time และมอบโค้ดส่วนลดพิเศษสำหรับผู้เข้าชมไลฟ์สดเท่านั้น</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">ระบบรองรับ Live Embed อัตโนมัติ</span>
                      </div>
                    </div>

                    {/* OTHER LEARNING LESSONS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">ยอดนิยม 🔥</span>
                        <h5 className="font-bold text-slate-800 text-xs">🚀 บทเรียนที่ 1: ตกแต่งร้านค้าอย่างไรให้สมาชิกสนใจกดสั่ง</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          เทคนิคจับคู่โทนสีที่เหมาะสมกับกลุ่มผลิตภัณฑ์สุขภาพ การจัดสรรวางสินค้าหมวดหมู่หลักในตำแหน่งหน้าแรก และความโดดเด่นของภาพผลิตภัณฑ์
                        </p>
                      </div>
                      <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                        <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full">คู่มือระบบ 📑</span>
                        <h5 className="font-bold text-slate-800 text-xs">📦 บทเรียนที่ 2: ไขข้อสงสัยสูตรค่าขนส่ง Shippop และ PV</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          อธิบายขั้นตอนการวัดขนาด กว้างxยาวxสูง จริงของแพ็คเกจ และการคำนวณน้ำหนักปริมาตรที่เหมาะสม เพื่อลดความคลาดเคลื่อนทางบัญชี
                        </p>
                      </div>
                      <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">กฎหมายร้านค้า ⚖️</span>
                        <h5 className="font-bold text-slate-800 text-xs">🛡️ บทเรียนที่ 3: ระเบียบข้อบังคับและจรรยาบรรณผู้ค้าของนทีพลัส</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          ทำความเข้าใจนโยบายความโปร่งใสทางกฎหมาย กฎการคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของผู้ซื้อ และการห้ามจำหน่ายสินค้าลอกเลียนแบบ
                        </p>
                      </div>
                      <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                        <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-full">แชร์ประสบการณ์ 💡</span>
                        <h5 className="font-bold text-slate-800 text-xs">🌟 บทเรียนที่ 4: เคล็ดลับการตอบกลับแชทและบริการหลังการขาย</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          ตอบข้อซักถามลูกค้าอย่างถูกต้อง สรรพคุณทางกฏหมาย วิธีดูแลออเดอร์ที่มีปัญหาคืนสินค้า เพื่อคงสถานะเรตติ้งระดับ 5 ดาวเสมอ
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // SELLER PORTAL LOGIN & REGISTRATION
                  <div className="max-w-xl mx-auto">
                  {!isRegisteringSeller ? (
                    // 1. SELLER CENTRE LOGIN SCREEN
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md space-y-6">
                      <div className="text-center space-y-2">
                        <img src="/logo.svg?v=2" className="w-48 h-48 mx-auto object-contain mb-2" alt="Natee Plus Logo" referrerPolicy="no-referrer" />
                        <h3 className="text-xl font-bold text-slate-900">Natee Plus Partner</h3>
                        <p className="text-xs text-slate-400">เข้าสู่พอร์ทัลพาร์ทเนอร์ด้วยรหัสสมาชิกนทีพลัสของท่าน</p>
                      </div>

                      <form onSubmit={handleSellerLogin} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1.5">
                            <Users size={12} className="text-indigo-500" /> Username / รหัสสมาชิก
                          </label>
                          <input 
                            type="text"
                            required
                            value={sellerLoginUsername}
                            onChange={(e) => setSellerLoginUsername(e.target.value)}
                            placeholder="กรอกชื่อผู้ใช้หรือรหัสสมาชิกเพื่อเข้าสู่ระบบร้านค้า"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600 uppercase">Password / รหัสผ่าน</label>
                          <div className="relative">
                            <input 
                              type={showSellerLoginPassword ? "text" : "password"}
                              required
                              value={sellerLoginPassword}
                              onChange={(e) => setSellerLoginPassword(e.target.value)}
                              placeholder="กรอกรหัสผ่านเข้าใช้ระบบ"
                              className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSellerLoginPassword(!showSellerLoginPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                              title={showSellerLoginPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                              {showSellerLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-md hover:shadow transition-all cursor-pointer text-xs"
                        >
                          เข้าสู่ระบบร้านค้า
                        </button>

                        {currentUser && (
                          <button
                            type="button"
                            onClick={async () => {
                              const kycOk = (profile?.statusKyc === 'Active' || currentUser?.statusKyc === 'Active' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager');
                              if (!kycOk) {
                                showNotif("🔒 บัญชีของคุณยังไม่ได้ผ่านการอนุมัติยืนยันตัวตน (KYC) กรุณายื่นเอกสารและรอการอนุมัติ KYC ในเมนูโปรไฟล์ก่อนนะคะ", 'warning');
                                setActiveTab('profile');
                                return;
                              }
                              const autoSeller = {
                                ...currentUser,
                                sellerStatus: 'Active',
                                sellerStoreName: currentUser.sellerStoreName || (currentUser.name ? `${currentUser.name} Store` : 'ร้านค้าพาร์ทเนอร์'),
                                sellerCode: currentUser.sellerCode || 'SEL' + Math.floor(10000 + Math.random() * 90000)
                              };
                              setSellerSessionUser(autoSeller);
                              showNotif(`เข้าสู่ระบบร้านค้า ${autoSeller.sellerStoreName} เรียบร้อยแล้วค่ะ 🎉`, 'success');
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                          >
                            ⚡ เข้าสู่ระบบร้านค้าทันที ({currentUser.name || currentUser.username})
                          </button>
                        )}
                      </form>

                      {/* KYC Requirement Warning Banner if user is not KYC active */}
                      {currentUser && profile?.statusKyc !== 'Active' && currentUser?.statusKyc !== 'Active' && currentUser?.role !== 'Admin' && currentUser?.role !== 'Manager' && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-2">
                          <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                            🔒 จำเป็นต้องผ่านการยืนยันตัวตน (KYC) ก่อนเปิดร้านค้า
                          </div>
                          <p className="text-[11px] text-amber-700 leading-relaxed">
                            ตามมาตรการความปลอดภัย คุณต้องยื่นเอกสารยืนยันตัวตนและได้รับการอนุมัติ KYC ก่อนเปิดร้านค้าหรือลงขายสินค้าค่ะ
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                          >
                            📄 ไปที่เมนูโปรไฟล์ เพื่อยื่นเอกสาร KYC
                          </button>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-4 text-center">
                        {currentUser?.sellerStatus === 'Active' && !hasDismissedApprovedNotice ? (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center text-xs space-y-1 relative">
                            <button
                              type="button"
                              onClick={() => {
                                setHasDismissedApprovedNotice(true);
                                if (currentUser?.userId) {
                                  localStorage.setItem('dismissed_approved_banner_' + currentUser.userId, 'true');
                                }
                              }}
                              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg text-xs cursor-pointer"
                              title="ปิดการแสดงผลข้อความนี้"
                            >
                              ✕
                            </button>
                            <p className="font-bold">✓ บัญชีของท่านได้รับการอนุมัติเป็นร้านค้าเรียบร้อยแล้วค่ะ</p>
                            <p className="text-slate-500 font-mono text-[10px]">รหัสร้านค้าของท่านคือ: <span className="font-bold text-emerald-700">{currentUser?.sellerCode || '-'}</span></p>
                            <p className="text-slate-500 text-[10px]">ท่านสามารถกรอกรหัสผ่านเพื่อเข้าใช้งานพอร์ทัลร้านค้าได้ทันที</p>
                          </div>
                        ) : currentUser?.sellerStatus === 'Pending' ? (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-center text-xs space-y-1 animate-pulse">
                            <p className="font-bold">⏳ คำขอเปิดร้านค้าของท่านอยู่ระหว่างรอแอดมินอนุมัติค่ะ</p>
                            <p className="text-slate-500 text-[10px]">เมื่อได้รับการอนุมัติแล้ว ท่านจะสามารถเปิดร้านค้าและลงขายสินค้าได้ทันที</p>
                          </div>
                        ) : currentUser?.sellerStatus === 'Suspended' ? (
                          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-2xl text-center text-xs space-y-1">
                            <p className="font-bold">⚠️ บัญชีร้านค้าของท่านถูกระงับการใช้งานชั่วคราว</p>
                            <p className="text-slate-500 text-[10px]">กรุณาติดต่อฝ่ายบริการลูกค้าเพื่อดำเนินการตรวจสอบเพิ่มเติมค่ะ</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const kycOk = (profile?.statusKyc === 'Active' || currentUser?.statusKyc === 'Active' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager');
                              if (!kycOk) {
                                showNotif("🔒 สำหรับการสมัครเปิดร้านค้า คุณต้องผ่านการอนุมัติยืนยันตัวตน (KYC) ในเมนูโปรไฟล์ให้เรียบร้อยก่อนนะคะ", 'warning');
                                setActiveTab('profile');
                                return;
                              }
                              setIsRegisteringSeller(true);
                              setSellerRegStep('rules');
                              setSellerRulesAgreed(false);
                              setSellerPdpaAgreed(false);
                            }}
                            className="text-indigo-600 hover:text-indigo-500 hover:underline font-bold text-xs cursor-pointer block mx-auto mb-2"
                          >
                            เพิ่งเคยเข้าระบบ Partner / สมัครใหม่
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('learning');
                            showNotif("ยินดีต้อนรับสู่ศูนย์การเรียนรู้และคู่มือผู้ขายค่ะ 📖", "info");
                          }}
                          className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          📖 ศูนย์การเรียนรู้และคู่มือผู้ขาย (คลิกเพื่อเข้าชมบทเรียน)
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 2. SELLER REGISTRATION WIZARD (สมัครใหม่)
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md space-y-6 max-w-2xl mx-auto">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                          <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">ลงทะเบียนเปิดร้านค้าผู้ขายรายใหม่</h3>
                        <p className="text-xs text-slate-400">
                          ขั้นตอนที่ {sellerRegStep === 'rules' ? '1: กฎระเบียบข้อบังคับ' : '2: กรอกข้อมูลและยืนยัน OTP / PIN'}
                        </p>
                      </div>

                      {sellerRegStep === 'rules' ? (
                        // STEP 1: RULES & REGULATIONS
                        <div className="space-y-6">
                           <div className="border border-slate-100 rounded-2xl bg-slate-50 p-4 max-h-72 overflow-y-auto text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                            {sellerRegulationsText || "กำลังโหลดกฎข้อบังคับ..."}
                          </div>

                          <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <label className="flex items-start gap-2.5 text-xs text-slate-700 font-bold cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={sellerRulesAgreed}
                                onChange={(e) => setSellerRulesAgreed(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                              />
                              <span>ข้าพเจ้าได้อ่านระเบียบดีแล้ว</span>
                            </label>

                            <div className="flex items-start gap-2.5 text-xs text-slate-700 font-bold">
                              <input 
                                id="pdpa-checkbox"
                                type="checkbox"
                                checked={sellerPdpaAgreed}
                                onChange={(e) => setSellerPdpaAgreed(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                              />
                              <label htmlFor="pdpa-checkbox" className="cursor-pointer">
                                ข้าพเจ้ากดยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) ตามกฎหมาย 
                                <button 
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); setShowPdpaModal(true); }}
                                  className="ml-1 text-indigo-600 hover:text-indigo-500 hover:underline font-extrabold inline-block"
                                >
                                  [คลิกอ่านนโยบายความปลอดภัยข้อมูลผู้ขาย บริษัท นที พลัส มาร์เก็ต จำกัด]
                                </button>
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => setIsRegisteringSeller(false)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              ย้อนกลับ
                            </button>
                            <button
                              disabled={!sellerRulesAgreed || !sellerPdpaAgreed}
                              onClick={() => setSellerRegStep('form')}
                              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow ${
                                sellerRulesAgreed && sellerPdpaAgreed
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              ยืนยันกฎข้อบังคับ
                            </button>
                          </div>
                        </div>
                      ) : (
                        // STEP 2: FILL REGISTRATION FORM WITH OTP/PIN
                        <form onSubmit={handleSellerApplyWithOtp} className="space-y-5 text-xs text-slate-700">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-slate-700 font-bold flex items-center gap-1.5">
                                <Lock size={12} className="text-amber-500" /> Username / รหัสสมาชิก (ล็อกตามบัญชีสมาชิกของท่าน)
                              </label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  disabled
                                  value={currentUser?.userId || ''}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold bg-slate-100 text-slate-400 select-none cursor-not-allowed"
                                />
                                <button
                                  type="button"
                                  onClick={handleSellerSendOtp}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all animate-pulse"
                                >
                                  ขอรับ OTP
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-slate-700 font-bold">ชื่อร้านค้าออนไลน์ (ชื่อแบรนด์)</label>
                              <input 
                                type="text"
                                required
                                value={sellerStoreName}
                                onChange={(e) => setSellerStoreName(e.target.value)}
                                placeholder="เช่น ร้านนทีเครื่องแกงใต้"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                              />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                              <label className="block text-slate-700 font-bold">💬 LINE ID / LINE Official Account ร้านค้า (ถ้ามี)</label>
                              <input 
                                type="text"
                                value={sellerRegLine}
                                onChange={(e) => setSellerRegLine(e.target.value)}
                                placeholder="เช่น @nateeplus หรือ https://line.me/ti/p/..."
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                              />
                            </div>
                          </div>

                          {/* Simulated OTP Helper Banner (Only in Sandbox / Test mode) */}
                          {isSandboxActive && sellerOtpSimulated && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl font-medium animate-pulse flex items-center justify-between text-[11px]">
                              <span>🔐 รหัส OTP จำลองสำหรับทดสอบของคุณคือ: <strong>{sellerOtpSimulated}</strong></span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSellerRegOtp(sellerOtpSimulated);
                                  showNotif("วางรหัส OTP จำลองเรียบร้อย", "info");
                                }}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                ใช้รหัสนี้
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-slate-700 font-bold">รหัส OTP 6 หลัก (จากอีเมลของท่าน)</label>
                              <input 
                                type="text"
                                required
                                maxLength={6}
                                value={sellerRegOtp}
                                onChange={(e) => setSellerRegOtp(e.target.value)}
                                placeholder="กรอกรหัส OTP"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-center"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-slate-700 font-bold">รหัสธุรกรรม (PIN 6 หลัก)</label>
                              <div className="relative">
                                <input 
                                  type={showSellerRegPin ? "text" : "password"}
                                  required
                                  maxLength={6}
                                  value={sellerRegPin}
                                  onChange={(e) => setSellerRegPin(e.target.value)}
                                  placeholder="กรอกรหัส PIN"
                                  className="w-full border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-bold tracking-widest text-center"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSellerRegPin(!showSellerRegPin)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                  title={showSellerRegPin ? "ซ่อนรหัส PIN" : "แสดงรหัส PIN"}
                                >
                                  {showSellerRegPin ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
                            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                              🏭 2. ข้อมูลคลังสินค้า / โรงงาน และพิกัดแผนที่จัดส่ง
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-slate-700 text-[11px] font-bold mb-1">บ้านเลขที่ / คลังสินค้า</label>
                                <input 
                                  type="text"
                                  value={warehouseHouseNo}
                                  onChange={(e) => setWarehouseHouseNo(e.target.value)}
                                  placeholder="เช่น 99/1 คลัง A"
                                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 text-[11px] font-bold mb-1">หมู่ / ซอย</label>
                                <input 
                                  type="text"
                                  value={warehouseMoo}
                                  onChange={(e) => setWarehouseMoo(e.target.value)}
                                  placeholder="เช่น หมู่ 4 ซอยสดใส"
                                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 text-[11px] font-bold mb-1">ถนน</label>
                                <input 
                                  type="text"
                                  value={warehouseRoad}
                                  onChange={(e) => setWarehouseRoad(e.target.value)}
                                  placeholder="เช่น ถนนเพชรเกษม"
                                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Tambon Auto-complete Search Box */}
                            <div className="relative">
                              <label className="block text-slate-700 text-[11px] font-bold mb-1">🔍 ค้นหาตำบล / อำเภอ / จังหวัด (คลังสินค้า) *</label>
                              <div className="relative">
                                <input 
                                  type="text"
                                  value={warehouseAddressQuery}
                                  onChange={(e) => handleWarehouseTambonSearch(e.target.value)}
                                  placeholder="พิมพ์ชื่อตำบล, อำเภอ, จังหวัด หรือรหัสไปรษณีย์ เช่น บางลำพู, เชียงใหม่..."
                                  className="w-full border border-slate-200 bg-white rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>

                              {warehouseTambonResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                                  {warehouseTambonResults.map((item: any, idx: number) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => selectWarehouseTambon(item)}
                                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition cursor-pointer flex justify-between items-center"
                                    >
                                      <span>ต. {item.subdistrict || item.tambon} &gt; อ. {item.district || item.amphoe} &gt; จ. {item.province}</span>
                                      <span className="font-mono text-indigo-600 font-bold">{item.zipcode}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Selected Warehouse Location Summary */}
                            {(warehouseProvince || warehouseDistrict || warehouseSubdistrict) && (
                              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-2.5 text-xs flex flex-wrap gap-x-3 gap-y-1 font-medium text-indigo-950">
                                <span>📍 ตำบล: <strong className="text-indigo-700">{warehouseSubdistrict}</strong></span>
                                <span>อำเภอ: <strong className="text-indigo-700">{warehouseDistrict}</strong></span>
                                <span>จังหวัด: <strong className="text-indigo-700">{warehouseProvince}</strong></span>
                                <span>รหัสไปรษณีย์: <strong className="text-indigo-700 font-mono">{warehouseZipcode}</strong></span>
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <label className="block text-slate-700 text-[11px] font-bold">ที่ตั้งคลังสินค้าและจัดส่งแบบเต็ม (Full Address)</label>
                              <textarea 
                                rows={2}
                                required
                                value={sellerAddress}
                                onChange={(e) => setSellerAddress(e.target.value)}
                                placeholder="กรอกที่อยู่อย่างละเอียดเพื่อใช้สำหรับการรับ-ส่งคืนสินค้า"
                                className="w-full border border-slate-200 bg-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            {/* Interactive Pinpoint Map */}
                            <NateeWarehouseMap 
                              lat={warehouseLat} 
                              lng={warehouseLng} 
                              onChange={(lat, lng) => {
                                setWarehouseLat(lat);
                                setWarehouseLng(lng);
                              }}
                              address={sellerAddress}
                              onAddressChange={(addr) => {
                                if (!sellerAddress) setSellerAddress(addr);
                              }}
                            />
                          </div>

                          <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
                            <button
                              type="button"
                              onClick={() => setSellerRegStep('rules')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              ย้อนกลับ
                            </button>
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md hover:shadow"
                            >
                              ✓ ยืนยันข้อมูลและสมัครร้านค้า
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : sellerSessionUser.sellerStatus === 'Pending' ? (
                // PENDING APPROVAL SCREEN WITH SECURITY LOCK LOGO
                <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-md text-center max-w-lg mx-auto space-y-6">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm relative animate-pulse">
                    <ShieldCheck size={48} />
                    <span className="absolute bottom-1 right-1 bg-amber-500 border-2 border-white w-4 h-4 rounded-full"></span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-extrabold text-slate-850">🔒 การขอเปิดร้านค้าอยู่ระหว่างการขออนุมัติ</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      ข้อมูลการขอจดทะเบียนร้านค้า <span className="font-bold text-indigo-600">"{sellerSessionUser.sellerStoreName}"</span> เรียบร้อยแล้วค่ะ การขอเปิดร้านค้าอยู่ระหว่างการขออนุมัติโดยแอดมิน เพื่อความปลอดภัยและเป็นระเบียบตามเงื่อนไขของบริษัท
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex flex-col gap-2 max-w-sm mx-auto">
                    <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1 font-sans">
                      <p>🏪 <strong>ชื่อร้านค้า:</strong> {sellerSessionUser.sellerStoreName}</p>
                      <p>📍 <strong>ที่ตั้งคลังสินค้า:</strong> {sellerSessionUser.sellerAddress}</p>
                      {sellerSessionUser.sellerCode && <p>📦 <strong>รหัสร้านพรีจีไอดี:</strong> {sellerSessionUser.sellerCode}</p>}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSellerSessionUser(null);
                        setSellerLoginUsername('');
                        setSellerLoginPassword('');
                        showNotif("ออกจากระบบร้านค้าเรียบร้อยแล้วค่ะ", "info");
                      }}
                      className="mt-4 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border border-rose-100"
                    >
                      ออกจากระบบร้านค้า (Log out)
                    </button>
                  </div>
                </div>
              ) : sellerSessionUser.sellerStatus === 'Active' ? (
                // ACTIVE SELLER DASHBOARD VIEW
                <div className="space-y-6">
                  {/* PROFILE HEADER BLOCK (โปรไฟล์ร้านค้า ชื่อสกุล รูประฆังแจ้งเตือน) */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-slate-750/50 relative overflow-visible z-30">
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    </div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Logo 100% untreated frame */}
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-indigo-500/30 flex items-center justify-center p-1.5 overflow-hidden shadow-inner group">
                        <img 
                          src="/logo.svg?v=2" 
                          alt="Natee Plus Seller Logo" 
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                            ✓ ผ่านการอนุมัติร้านค้า
                          </span>
                          <span className="font-mono text-[10px] text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md">
                            รหัสร้านค้า: {sellerSessionUser.sellerCode}
                          </span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight text-white">{sellerSessionUser.sellerStoreName}</h3>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          👤 เจ้าของร้าน: <span className="text-slate-100 font-medium">{sellerSessionUser.name} {sellerSessionUser.surname || ''}</span> 
                          <span className="text-slate-500">|</span> 
                          ID บัญชี: <span className="font-mono text-slate-100">{sellerSessionUser.userId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-20 self-stretch md:self-auto justify-end">
                      {/* Bell Notification Bell Dropdown */}
                      {(() => {
                        const sellerBroadcastNotifs = systemNotifications
                          .filter((n: any) => n.target === 'sellers' || n.target === 'all')
                          .map((n: any) => ({
                            id: String(n.id),
                            title: n.title,
                            desc: n.message,
                            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'เมื่อสักครู่',
                            rawTime: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
                            isBroadcast: true,
                            target: n.target
                          }));

                        const mergedSellerNotifs = [
                          ...sellerBroadcastNotifs,
                          ...sellerNotifs.map((sn: any) => ({
                            ...sn,
                            id: String(sn.id),
                            rawTime: sn.rawTime || 0
                          }))
                        ].sort((a, b) => (b.rawTime || 0) - (a.rawTime || 0))
                         .slice(0, 10);

                        const unreadSellerNotifs = mergedSellerNotifs.filter(
                          (n: any) => !n.read && !readNotifIds.includes(String(n.id))
                        );
                        const unreadCount = unreadSellerNotifs.length;

                        return (
                          <div className="relative z-50">
                            <button
                              type="button"
                              onClick={() => setShowSellerNotifs(!showSellerNotifs)}
                              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center border border-slate-700/60 transition-all cursor-pointer relative"
                              title="กระดิ่งแจ้งเตือนร้านค้าพันธมิตร"
                            >
                              <Bell size={20} className={unreadCount > 0 ? "animate-swing text-amber-400" : ""} />
                              {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border border-slate-900 shadow-sm">
                                  {unreadCount}
                                </span>
                              )}
                            </button>

                            {showSellerNotifs && (
                              <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-xs z-[99999] animate-fadeIn space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                    <Bell size={14} className="text-amber-400" /> แจ้งเตือนร้านค้า ({unreadCount > 0 ? `${unreadCount} ใหม่` : 'อ่านแล้ว'})
                                  </span>
                                  {unreadCount > 0 && (
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setSellerNotifs(prev => prev.map((n: any) => ({ ...n, read: true })));
                                        markAllNotifsAsRead(mergedSellerNotifs.map((n: any) => n.id));
                                        showNotif("อ่านการแจ้งเตือนทั้งหมดแล้ว", "success");
                                      }}
                                      className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                                    >
                                      อ่านทั้งหมด
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                                  {mergedSellerNotifs.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4 text-[11px]">ไม่มีการแจ้งเตือนร้านค้าในขณะนี้</p>
                                  ) : (
                                    mergedSellerNotifs.map((n: any) => {
                                      const isRead = Boolean(n.read) || readNotifIds.includes(String(n.id));
                                      return (
                                        <div
                                          key={n.id}
                                          onClick={() => {
                                            if (!isRead) {
                                              markNotifAsRead(n.id);
                                              setSellerNotifs(prev => prev.map((sn: any) => String(sn.id) === String(n.id) ? { ...sn, read: true } : sn));
                                            }
                                          }}
                                          className={`p-2.5 rounded-xl transition cursor-pointer relative border ${
                                            isRead 
                                              ? 'bg-slate-850/40 text-slate-400 border-slate-800' 
                                              : 'bg-indigo-950/70 border-amber-500/80 text-slate-100 shadow-sm hover:bg-indigo-900/80'
                                          }`}
                                        >
                                          {!isRead && (
                                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" title="ยังไม่อ่าน"></span>
                                          )}
                                          <div className="font-bold text-[11px] flex justify-between items-center pr-3">
                                            <span>{n.title}</span>
                                            {n.target === 'sellers' && (
                                              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">ร้านค้า</span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-300 mt-0.5 leading-relaxed whitespace-pre-wrap">{n.desc}</div>
                                          <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-slate-800/60">
                                            <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                                            <span className={`text-[9px] font-bold ${isRead ? 'text-slate-500' : 'text-amber-400'}`}>
                                              {isRead ? '✓ อ่านแล้ว' : '🔘 แตะเพื่ออ่าน'}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Log out Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSellerSessionUser(null);
                          setSellerLoginUsername('');
                          setSellerLoginPassword('');
                          showNotif("ออกจากระบบร้านค้าเรียบร้อยแล้วค่ะ", "info");
                        }}
                        className="bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 text-slate-300 border border-slate-700/60 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <LogOut size={14} /> ออกจากระบบ
                      </button>
                    </div>
                  </div>

                  {/* SECURITY DEPOSIT & SALES/LISTING PRIVILEGE OVERVIEW CARD */}
                  {(() => {
                    const deposit = parseFloat(sellerSessionUser?.securityDeposit || 0);
                    const maxListingCap = deposit * 10;
                    const activeUnfulfilledSales = (sellerOrders || [])
                      .filter((o: any) => o.status === 'Processing' || o.status === 'Paid')
                      .reduce((sum: number, o: any) => sum + (parseFloat(o.totalPrice || o.price) || 0), 0);
                    const salesLimitRemaining = Math.max(0, deposit - activeUnfulfilledSales);

                    const currentListingValue = (sellerProducts || [])
                      .filter((p: any) => p.isAvailable !== false)
                      .reduce((sum: number, p: any) => {
                        const pPrice = parseFloat(p.price) || 0;
                        const pStock = p.stock !== undefined ? parseFloat(p.stock) : 5;
                        return sum + (pPrice * Math.min(pStock, 50));
                      }, 0);
                    const listingCapRemaining = Math.max(0, maxListingCap - currentListingValue);

                    return (
                      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-lg space-y-4 relative overflow-hidden border border-amber-400/40">
                        <div className="absolute -top-6 -right-6 p-8 opacity-10 pointer-events-none">
                          <ShieldCheck size={180} />
                        </div>
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-amber-300/30 pb-3 relative z-10">
                          <div>
                            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                              <ShieldCheck size={20} className="text-amber-200" />
                              <span>🛡️ เงินประกันร้านค้า & วงเงินสิทธิ์วางขายคงเหลือ (Security Deposit & Sales Limits)</span>
                            </h4>
                            <p className="text-[11px] text-amber-100 mt-0.5">
                              วางเงินประกันเพื่อขยายวงเงินวางขายสินค้าบนหน้าร้าน 10 เท่า และประกันความเสี่ยงยอดขายรอดำเนินการส่ง
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSellerPortalSubTab('deposit');
                              showNotif("เข้าสู่ระบบจัดการเงินประกันร้านค้า", "info");
                            }}
                            className="bg-white hover:bg-amber-50 text-amber-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <span>ฝากเงินประกันเพิ่ม / จัดการ</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 font-sans">
                          {/* Card 1: เงินประกันสะสมคงเหลือ */}
                          <div className="bg-amber-950/40 border border-amber-300/30 rounded-2xl p-3.5 space-y-1 backdrop-blur-sm">
                            <div className="text-[10px] text-amber-200 font-extrabold uppercase tracking-wider">
                              1. เงินประกันสะสมคงเหลือ
                            </div>
                            <div className="text-xl font-black font-mono text-white">
                              ฿{deposit.toLocaleString()} <span className="text-[10px] font-normal text-amber-200">บาท</span>
                            </div>
                            <p className="text-[9.5px] text-amber-200/90 leading-tight">
                              ประกันความเสี่ยงยอดสั่งซื้อค้างส่ง
                            </p>
                          </div>

                          {/* Card 2: วงเงินรับสั่งซื้อคงเหลือ */}
                          <div className="bg-amber-950/40 border border-amber-300/30 rounded-2xl p-3.5 space-y-1 backdrop-blur-sm">
                            <div className="text-[10px] text-amber-200 font-extrabold uppercase tracking-wider">
                              2. วงเงินรับสั่งซื้อคงเหลือ
                            </div>
                            <div className="text-xl font-black font-mono text-emerald-300">
                              ฿{salesLimitRemaining.toLocaleString()} <span className="text-[10px] font-normal text-emerald-200">บาท</span>
                            </div>
                            <p className="text-[9.5px] text-amber-200/90 leading-tight">
                              (หักยอดค้างส่ง ฿{activeUnfulfilledSales.toLocaleString()})
                            </p>
                          </div>

                          {/* Card 3: วงเงินลงขายสินค้า (10x) */}
                          <div className="bg-amber-950/40 border border-amber-300/30 rounded-2xl p-3.5 space-y-1 backdrop-blur-sm">
                            <div className="text-[10px] text-amber-200 font-extrabold uppercase tracking-wider">
                              3. วงเงินวางขายสินค้าสูงสุด (10 เท่า)
                            </div>
                            <div className="text-xl font-black font-mono text-white">
                              ฿{maxListingCap.toLocaleString()} <span className="text-[10px] font-normal text-amber-200">บาท</span>
                            </div>
                            <p className="text-[9.5px] text-amber-200/90 leading-tight">
                              คำนวณจากเงินประกัน × 10 เท่า
                            </p>
                          </div>

                          {/* Card 4: สิทธิ์ลงขายสินค้าคงเหลือ */}
                          <div className="bg-amber-950/40 border border-amber-300/30 rounded-2xl p-3.5 space-y-1 backdrop-blur-sm">
                            <div className="text-[10px] text-amber-200 font-extrabold uppercase tracking-wider">
                              4. สิทธิ์วางขายสินค้าคงเหลือ
                            </div>
                            <div className="text-xl font-black font-mono text-amber-200">
                              ฿{listingCapRemaining.toLocaleString()} <span className="text-[10px] font-normal text-amber-200">บาท</span>
                            </div>
                            <p className="text-[9.5px] text-amber-200/90 leading-tight">
                              (มูลค่าสินค้าลงขายแล้ว ฿{currentListingValue.toLocaleString()})
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ROW 1: REPORT BAR GRID (รอจัดส่ง , ลูกค้ายกเลิก , การคืนเงิน/คืนสินค้า , คะแนนร้าน) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* To Ship (รอจัดส่ง) */}
                    {(() => {
                      const toShipOrders = sellerOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Returned' && o.status !== 'Refunded');
                      const count = toShipOrders.length;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('orders');
                            setSellerOrderFilter('Processing');
                            showNotif("แสดงเฉพาะรายการสินค้าที่ค้างรอส่งพัสดุ", "info");
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
                            sellerPortalSubTab === 'orders' && sellerOrderFilter === 'Processing'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-900'
                              : 'bg-white border-slate-100 hover:border-amber-200 hover:bg-amber-50/10 text-slate-800 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-[11px] font-bold">📦 รอจัดส่ง (To Ship)</span>
                            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Truck size={16} /></span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black font-mono text-amber-600">{count}</span>
                            <span className="text-[10px] text-slate-400">ออเดอร์ค้างส่ง</span>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Cancelled (ลูกค้ายกเลิก) */}
                    {(() => {
                      const cancelledOrders = sellerOrders.filter(o => o.status === 'Cancelled');
                      const count = cancelledOrders.length;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('orders');
                            setSellerOrderFilter('Cancelled');
                            showNotif("แสดงเฉพาะรายการที่ผู้ซื้อขอยกเลิก", "info");
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
                            sellerPortalSubTab === 'orders' && sellerOrderFilter === 'Cancelled'
                              ? 'bg-rose-500/10 border-rose-500 text-rose-900'
                              : 'bg-white border-slate-100 hover:border-rose-200 hover:bg-rose-50/10 text-slate-800 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-[11px] font-bold">🚫 ลูกค้ายกเลิก (Cancelled)</span>
                            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><UserX size={16} /></span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black font-mono text-rose-600">{count}</span>
                            <span className="text-[10px] text-slate-400">รายการยกเลิก</span>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Returns (คืนสินค้า/คืนเงิน) */}
                    {(() => {
                      const refundOrders = sellerOrders.filter(o => o.status === 'Returned' || o.status === 'Refunded');
                      const count = refundOrders.length;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('orders');
                            setSellerOrderFilter('Refunded');
                            showNotif("แสดงเฉพาะการขอคืนพัสดุและขอเงินคืน", "info");
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
                            sellerPortalSubTab === 'orders' && sellerOrderFilter === 'Refunded'
                              ? 'bg-purple-500/10 border-purple-500 text-purple-900'
                              : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-purple-50/10 text-slate-800 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-[11px] font-bold">🔄 การคืนเงิน/คืนสินค้า</span>
                            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><RotateCcw size={16} /></span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-2xl font-black font-mono text-purple-600">{count}</span>
                            <span className="text-[10px] text-slate-400">การคืนสินค้า</span>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Store Rating (คะแนนร้านค้า) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSellerPortalSubTab('rating');
                        showNotif("แสดงรายละเอียดคะแนนและรีวิวล่าสุด", "success");
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
                        sellerPortalSubTab === 'rating'
                          ? 'bg-teal-500/10 border-teal-500 text-teal-900'
                          : 'bg-white border-slate-100 hover:border-teal-200 hover:bg-teal-50/10 text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-[11px] font-bold">⭐️ คะแนนร้าน (Rating)</span>
                        <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><Star size={16} /></span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black font-mono text-teal-600">5.0 ★</span>
                        <span className="text-[10px] text-slate-400">(คะแนนดีเยี่ยม 100%)</span>
                      </div>
                    </button>
                  </div>

                  {/* ROW 2 & ROW 3 COMBINED IN A MODERN TWO-ROW NAV GRID */}
                  <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    {/* Title */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        🎮 เมนูจัดการร้านค้า Natee Partner
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Control Panel v2.0</span>
                    </div>

                    {/* ROW 2: สินค้าของฉัน , การสั่งซื้อ , การเงิน/บัญชี , สถิตร้านค้า */}
                    <div className="space-y-3">
                      <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">แถวที่ 2: ระบบบริหารจัดการหลัก</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* สินค้าของฉัน */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('products');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'products'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <ShoppingBag size={20} className={sellerPortalSubTab === 'products' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">สินค้าของฉัน</div>
                            <div className="text-[9px] text-slate-400 leading-none">ลงสินค้าและขอยื่นอนุมัติ</div>
                          </div>
                        </button>

                        {/* การสั่งซื้อ */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('orders');
                            setSellerOrderFilter('All');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'orders' && sellerOrderFilter === 'All'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <ShoppingCart size={20} className={sellerPortalSubTab === 'orders' && sellerOrderFilter === 'All' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">การสั่งซื้อ</div>
                            <div className="text-[9px] text-slate-400 leading-none">พิมพ์ที่อยู่ & ส่งพัสดุ</div>
                          </div>
                        </button>

                        {/* การเงิน/บัญชี */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('finance');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'finance'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <Wallet size={20} className={sellerPortalSubTab === 'finance' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">การเงิน/บัญชี</div>
                            <div className="text-[9px] text-slate-400 leading-none">บัญชีรายรับและค่าจัดส่ง</div>
                          </div>
                        </button>

                        {/* สถิตร้านค้า */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('stats');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'stats'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <BarChart2 size={20} className={sellerPortalSubTab === 'stats' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">สถิตร้านค้า</div>
                            <div className="text-[9px] text-slate-400 leading-none">การเติบโตและสถิติการสั่งซื้อ</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* ROW 3: หน้าหลัก , แชท , ศูนย์การเรียนรู้ , ข้อมูลร้าน */}
                    <div className="space-y-3 pt-2">
                      <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">แถวที่ 3: ระบบข้อมูลและการสื่อสาร</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* หน้าหลัก */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('home');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'home'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <Home size={20} className={sellerPortalSubTab === 'home' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">หน้าหลัก</div>
                            <div className="text-[9px] text-slate-400 leading-none">หน้าแดชบอร์ดแผงควบคุม</div>
                          </div>
                        </button>

                        {/* แชท */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('chat');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'chat'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <MessageSquare size={20} className={sellerPortalSubTab === 'chat' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">แชท</div>
                            <div className="text-[9px] text-slate-400 leading-none">คุยและประสานงานผู้ซื้อ</div>
                          </div>
                        </button>

                        {/* ศูนย์การเรียนรู้ */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('learning');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'learning'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <BookOpen size={20} className={sellerPortalSubTab === 'learning' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">ศูนย์การเรียนรู้</div>
                            <div className="text-[9px] text-slate-400 leading-none">บทเรียนและเทคนิคเพิ่มยอดขาย</div>
                          </div>
                        </button>

                        {/* เงินประกันร้านค้า */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('deposit');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'deposit'
                              ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <ShieldCheck size={20} className={sellerPortalSubTab === 'deposit' ? 'text-white' : 'text-amber-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs flex items-center gap-1">
                              <span>เงินประกันร้านค้า</span>
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">10x</span>
                            </div>
                            <div className="text-[9px] text-slate-400 leading-none">ประกันความเสี่ยง & ขยายวงเงิน</div>
                          </div>
                        </button>

                        {/* ข้อมูลร้าน */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('info');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer ${
                            sellerPortalSubTab === 'info'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <Store size={20} className={sellerPortalSubTab === 'info' ? 'text-white' : 'text-indigo-400'} />
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs">ข้อมูลร้าน</div>
                            <div className="text-[9px] text-slate-400 leading-none">ที่ตั้งคลังสินค้าและแผนที่ GPS</div>
                          </div>
                        </button>

                        {/* ห้องไลฟ์สด */}
                        <button
                          type="button"
                          onClick={() => {
                            setSellerPortalSubTab('live');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden cursor-pointer col-span-2 sm:col-span-1 ${
                            sellerPortalSubTab === 'live'
                              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/50'
                              : 'bg-slate-850 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Video size={20} className={sellerPortalSubTab === 'live' ? 'text-white' : 'text-rose-400 animate-pulse'} />
                            <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-md font-black tracking-wider uppercase animate-pulse">
                              LIVE
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-xs text-rose-300 flex items-center gap-1">
                              <span>ห้องไลฟ์สด</span>
                            </div>
                            <div className="text-[9px] text-slate-400 leading-none">เตรียมสินค้า, ปักตะกร้า & ไลฟ์สด</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SUB-TAB CONTENTS */}
                  <div className="animate-fadeIn">
                    {sellerPortalSubTab === 'home' && (
                      <div className="space-y-6">
                        {/* Quick Stats Overviews */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">📈 ยอดขายร้านค้าในสัปดาห์นี้</span>
                            <div className="text-xl font-black text-slate-900">
                              ฿{(sellerOrders.filter((o: any) => o.status === 'Completed').reduce((acc: number, o: any) => acc + o.totalPrice, 0)).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-bold">✓ อัปเดตเข้ารายได้ร้านค้าทันที (80% สิทธิผู้ขาย)</div>
                          </div>
                          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">📦 ผลิตภัณฑ์ลงขายสำเร็จ</span>
                            <div className="text-xl font-black text-slate-900">
                              {sellerProducts.filter((p: any) => p.status === 'Approved').length} / {sellerProducts.length} <span className="text-xs text-slate-400 font-normal">สินค้าผ่านอนุมัติ</span>
                            </div>
                            <div className="text-[10px] text-slate-500">รออนุมัติ {sellerProducts.filter((p: any) => p.status === 'Approved' ? false : p.status !== 'Rejected').length} รายการ</div>
                          </div>
                          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">🎖️ คะแนนเรตติ้งคลังจัดส่ง</span>
                            <div className="text-xl font-black text-slate-900 flex items-center gap-1">
                              5.00 <span className="text-amber-400 text-sm">★★★★★</span>
                            </div>
                            <div className="text-[10px] text-teal-600 font-bold">ความรวดเร็วในการจัดส่งเฉลี่ย: ยอดเยี่ยม</div>
                          </div>
                        </div>

                        {/* WAREHOUSE MAP & WAREHOUSE ADDRESS SECTION (หน้าแรกของร้านค้าใต้คะแนนเรตติ้งคลังจัดส่ง) */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                            <div>
                              <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                                <MapPin size={18} className="text-indigo-600" /> 📍 แผนที่พิกัดคลังสินค้าและที่อยู่จัดส่งสินค้า (Warehouse Map & Address)
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                ระบุพิกัดจีพีเอสและที่อยู่คลังสินค้า/โรงงานสำหรับจัดส่ง (ให้กรอกเฉพาะ บ้านเลขที่ ถนน/ซอย หมู่ที่ และเลือกตำบล/อำเภอ)
                              </p>
                            </div>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                              profile?.shippingPinStatus === 'Confirmed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : profile?.shippingPinStatus === 'PendingApproval'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {profile?.shippingPinStatus === 'Confirmed' ? '✓ ปักหมุดแล้ว' : profile?.shippingPinStatus === 'PendingApproval' ? '⏳ รอแอดมินอนุมัติ' : 'ยังไม่ปักหมุด'}
                            </span>
                          </div>

                          {/* Warehouse Address Inputs */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1">บ้านเลขที่ / อาคาร / ชั้น</label>
                                <input 
                                  type="text"
                                  value={warehouseHouseNo}
                                  onChange={(e) => setWarehouseHouseNo(e.target.value)}
                                  placeholder="เช่น 123/45 อาคาร B"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1">หมู่ที่ / ซอย</label>
                                <input 
                                  type="text"
                                  value={warehouseMoo}
                                  onChange={(e) => setWarehouseMoo(e.target.value)}
                                  placeholder="เช่น หมู่ 3 ซอยสุขุมวิท 21"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 text-xs font-bold mb-1">ถนน</label>
                                <input 
                                  type="text"
                                  value={warehouseRoad}
                                  onChange={(e) => setWarehouseRoad(e.target.value)}
                                  placeholder="เช่น ถนนเพชรเกษม"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Tambon Auto-complete Search Box for Warehouse Address */}
                            <div className="relative">
                              <label className="block text-slate-700 text-xs font-bold mb-1">ค้นหาตำบล / อำเภอ / จังหวัด (คลังสินค้า/โรงงาน)</label>
                              <div className="relative">
                                <input 
                                  type="text"
                                  value={warehouseAddressQuery}
                                  onChange={(e) => handleWarehouseTambonSearch(e.target.value)}
                                  placeholder="พิมพ์ชื่อตำบล อำเภอ หรือรหัสไปรษณีย์ เพื่อเลือกคลังสินค้า..."
                                  className="w-full border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                                />
                                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>

                              {warehouseTambonResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                                  {warehouseTambonResults.map((item: any, idx: number) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => selectWarehouseTambon(item)}
                                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition cursor-pointer flex justify-between items-center"
                                    >
                                      <span>ต. {item.subdistrict || item.tambon} &gt; อ. {item.district || item.amphoe} &gt; จ. {item.province}</span>
                                      <span className="font-mono text-indigo-600 font-bold">{item.zipcode}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Selected Warehouse District Summary Box */}
                            {(warehouseProvince || warehouseDistrict || warehouseSubdistrict) && (
                              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs flex flex-wrap gap-x-4 gap-y-1 font-medium text-indigo-950">
                                <span>📍 ตำบล: <strong className="text-indigo-700">{warehouseSubdistrict}</strong></span>
                                <span>อำเภอ: <strong className="text-indigo-700">{warehouseDistrict}</strong></span>
                                <span>จังหวัด: <strong className="text-indigo-700">{warehouseProvince}</strong></span>
                                <span>รหัสไปรษณีย์: <strong className="text-indigo-700 font-mono">{warehouseZipcode}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Warehouse Map Pin Container */}
                          <div className="space-y-3">
                            <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                              <span>📌 ปักหมุดแผนที่คลังสินค้า (Google Maps / OpenStreetMap Pin):</span>
                              {warehouseLat && warehouseLng && (
                                <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                  Lat: {warehouseLat.toFixed(6)}, Lng: {warehouseLng.toFixed(6)}
                                </span>
                              )}
                            </div>

                            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[320px]">
                              <NateeWarehouseMap
                                latitude={warehouseLat || profile?.shippingLat || 13.7563}
                                longitude={warehouseLng || profile?.shippingLng || 100.5018}
                                onLocationSelect={(lat, lng) => {
                                  setWarehouseLat(lat);
                                  setWarehouseLng(lng);
                                }}
                                isEditable={!(profile?.shippingPinStatus === 'Confirmed' && profile?.role !== 'admin')}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleSaveWarehousePinAndAddress}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-md hover:shadow transition cursor-pointer flex items-center justify-center gap-2"
                            >
                              <MapPin size={16} /> บันทึกพิกัดและที่อยู่คลังสินค้า
                            </button>
                          </div>
                        </div>

                        {/* Guidelines Advice Box (กรอบคำแนะนำร้านค้า) */}
                        <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-50/20 border border-indigo-100 rounded-3xl p-6 shadow-sm space-y-4">
                          <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                            📌 กรอบคำแนะนำการจัดการร้านค้าและนโยบายผู้ขาย (Seller Guidelines)
                          </h4>
                          <div className="text-xs text-slate-700 leading-relaxed space-y-3.5 font-sans">
                            <div className="flex gap-2.5 items-start">
                              <span className="text-indigo-600 font-bold shrink-0 mt-0.5">1.</span>
                              <p>
                                <strong>รักษามาตรฐานเวลาการจัดส่งพัสดุ:</strong> กรุณาแพ็คและจัดส่งพัสดุผ่านทางระบบขนส่งพันธมิตร (เช่น Flash, Kerry) ภายในระยะเวลาไม่เกิน 24-48 ชั่วโมงหลังจากได้รับสถานะ "รอส่งสินค้า" เพื่อคะแนนร้านค้าและโอกาสเติบโตของแบรนด์ท่านในหน้าสินค้าแนะนำ
                              </p>
                            </div>
                            <div className="flex gap-2.5 items-start border-t border-indigo-100/50 pt-3">
                              <span className="text-indigo-600 font-bold shrink-0 mt-0.5">2.</span>
                              <p>
                                <strong>ความถูกต้องของค่าจัดส่ง Shippop:</strong> ระบบได้เชื่อมโยง API ของ Shippop อัตโนมัติ เพื่อคำนวณราคาจัดส่งตามขนาดความกว้าง ยาว สูง และน้ำหนักรวมจริงของกล่องพัสดุ หากข้อมูลมิติกล่องไม่ตรงกับความเป็นจริง อาจมีค่าปรับส่วนต่างย้อนหลังได้ กรุณาตรวจสอบให้รอบคอบทุกครั้งที่ลงสินค้าใหม่
                              </p>
                            </div>
                            <div className="flex gap-2.5 items-start border-t border-indigo-100/50 pt-3">
                              <span className="text-indigo-600 font-bold shrink-0 mt-0.5">3.</span>
                              <p>
                                <strong>ระบบปันผล PV และ GP สำหรับร้านค้าผู้ร่วมทุน:</strong> ยอดส่วนแบ่งค่าแนะนำและจัดซื้อพอร์ทัล GP (20%) และสิทธิในการสะสมคะแนน PV จะถูกโอนคำนวณผ่านระบบสมาชิก Natee Plus ทันทีที่ผู้สั่งซื้อคลิกยืนยันการรับพัสดุสำเร็จ ทำให้ระบบคะแนนของทุกสายงานปลอดภัยและตรวจสอบได้ 100%
                              </p>
                            </div>
                            <div className="flex gap-2.5 items-start border-t border-indigo-100/50 pt-3">
                              <span className="text-indigo-600 font-bold shrink-0 mt-0.5">4.</span>
                              <p>
                                <strong>กฎความโปร่งใสทางกฎหมาย (PDPA & VAT):</strong> เอกสารการเงินและการขอเงินคืนภาษีมูลค่าเพิ่ม สามารถพิมพ์หรือดาวน์โหลดเพื่อยื่นทางสรรพากรได้โดยตรงในเมนู "การเงิน/บัญชี" เพื่อสิทธิประโยชน์สูงสุดของร้านค้าจดทะเบียนจัดตั้งบริษัท
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {sellerPortalSubTab === 'rating' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-bold text-slate-800">⭐️ คะแนนและรีวิวจากลูกค้า (Shop Ratings)</h4>
                          <span className="text-xs text-slate-400">อัปเดตเรียลไทม์</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                            <div className="text-2xl font-black text-slate-900">5.0 ★ / 5.0</div>
                            <div className="text-xs text-slate-500">คะแนนเฉลี่ยร้านค้า</div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                            <div className="text-2xl font-black text-slate-900">100%</div>
                            <div className="text-xs text-slate-500">ความพึงพอใจของลูกค้า</div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                            <div className="text-2xl font-black text-slate-900">100%</div>
                            <div className="text-xs text-slate-500">อัตราการตอบแชทกลับ</div>
                          </div>
                        </div>

                        {/* Recent Reviews List */}
                        <div className="space-y-4">
                          <h5 className="font-bold text-slate-700 text-xs">💬 รีวิวล่าสุดจากลูกค้าผู้ซื้อจริง</h5>
                          <div className="divide-y divide-slate-150">
                            <div className="py-3.5 space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-800">คุณอรทัย สิทธิวรวงษ์ (สมาชิก Natee-1025)</span>
                                <span className="text-amber-500 font-bold">★★★★★ 5.0</span>
                              </div>
                              <p className="text-xs text-slate-600">"ส่งสินค้ารวดเร็วมากค่ะ แพ็คกล่องมาอย่างดีมีกันกระแทกครบถ้วน สรรพคุณสมคำร่ำลือ จะอุดหนุนซ้ำอีกแน่นอนค่ะ"</p>
                              <p className="text-[10px] text-slate-400 font-mono">2 ชั่วโมงที่ผ่านมา | ผลิตภัณฑ์บำรุงผิวชาเขียวนทีพลัส</p>
                            </div>
                            <div className="py-3.5 space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-800">คุณวิทยา พลสุวรรณ (สมาชิก Natee-2501)</span>
                                <span className="text-amber-500 font-bold">★★★★★ 5.0</span>
                              </div>
                              <p className="text-xs text-slate-600">"จัดส่งรวดเร็ว บริการขนส่งดีมาก แชทคุยถามข้อมูลร้านค้าตอบกลับทันที ชื่นชมความรับผิดชอบและเป็นมืออาชีพครับ"</p>
                              <p className="text-[10px] text-slate-400 font-mono">1 วันที่ผ่านมา | อาหารเสริมพลัสออร์แกนิค</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {sellerPortalSubTab === 'products' && (
                      <div className="space-y-6">
                        {/* Add New Product Form */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <span className="p-1.5 bg-indigo-600 text-white rounded-xl text-xs">🛍️</span>
                              <span>ลงทะเบียนและยื่นอนุมัติสินค้าใหม่ (Natee Plus Partner)</span>
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                              อัตราส่วนรูปภาพ 1:1 (สูงสุด 5 รูป)
                            </span>
                          </div>

                          <form onSubmit={handleSellerProdSubmit} className="space-y-5 text-xs">
                            {/* 1:1 Image Upload Gallery Section (Max 5 Images) */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                                  <span>📷 รูปภาพผลิตภัณฑ์ (ขนาด 1:1 Square)</span>
                                  <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {newProd.images.length}/5 ภาพ (รองรับไฟล์ PNG, JPG)
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {newProd.images.map((imgUrl, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-200 bg-white shadow-xs group">
                                    <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                                    {idx === 0 && (
                                      <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                                        รูปหลัก
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewProd(prev => ({
                                          ...prev,
                                          images: prev.images.filter((_, i) => i !== idx)
                                        }));
                                      }}
                                      className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition opacity-90 group-hover:opacity-100"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}

                                {newProd.images.length < 5 && (
                                  <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group">
                                    <span className="text-xl text-slate-400 group-hover:text-indigo-600 font-bold">+</span>
                                    <span className="text-[10px] text-slate-500 group-hover:text-indigo-600 font-bold mt-1">
                                      เพิ่มรูป (1:1)
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        const remainingSlots = 5 - newProd.images.length;
                                        const filesToProcess = files.slice(0, remainingSlots);
                                        
                                        filesToProcess.forEach(f => {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            if (reader.result) {
                                              setNewProd(prev => {
                                                if (prev.images.length >= 5) return prev;
                                                return { ...prev, images: [...prev.images, reader.result as string] };
                                              });
                                            }
                                          };
                                          reader.readAsDataURL(f);
                                        });
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* Basic Product Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-slate-700 font-semibold mb-1">
                                  ชื่อเรียกผลิตภัณฑ์ (ภาษาไทย) <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                  type="text" 
                                  required
                                  value={newProd.name}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="เช่น เซรั่มบำรุงผิวหน้าพลัสออร์แกนิค"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">
                                  ปริมาณสต็อกพร้อมจำหน่าย (ชิ้น) <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                  type="number" 
                                  required
                                  value={newProd.stock}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, stock: e.target.value }))}
                                  placeholder="เช่น 100"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                              </div>
                            </div>

                            {/* Pricing & Financial Setup */}
                            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 space-y-3">
                              <h5 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                                🏷️ กำหนดราคาและส่วนลดสินค้า
                              </h5>

                              {/* Add Product Auto-Calculate helper container */}
                              <div className="bg-white border border-amber-200/80 rounded-xl p-3 space-y-2 font-sans shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                                    💡 ระบบช่วยคำนวณราคาขายอัตโนมัติ (รวม GP 20% และ VAT 7%)
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                  <div>
                                    <label className="block text-slate-600 text-[10px] font-bold mb-1">
                                      รายรับที่พาร์ทเนอร์ต้องการได้รับจริงสุทธิ (฿):
                                    </label>
                                    <div className="relative">
                                      <input 
                                        type="number"
                                        placeholder="เช่น 800"
                                        value={newProdTargetPayout}
                                        onChange={(e) => {
                                          const inputVal = e.target.value;
                                          setNewProdTargetPayout(inputVal);
                                          const targetVal = parseFloat(inputVal) || 0;
                                          if (targetVal > 0) {
                                            const calculatedPrice = Math.ceil(targetVal / 0.80);
                                            setNewProd(prev => ({ ...prev, price: calculatedPrice.toString() }));
                                          } else if (inputVal === '') {
                                            setNewProd(prev => ({ ...prev, price: '' }));
                                          }
                                        }}
                                        className="w-full bg-white border border-amber-300 rounded-xl pl-3 pr-10 py-1.5 text-xs text-amber-950 placeholder-amber-400 font-extrabold focus:ring-2 focus:ring-amber-400 outline-none"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-[10px]">บาท</span>
                                    </div>
                                  </div>
                                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 leading-relaxed">
                                    ราคาขายจำหน่ายหน้าเว็บแนะนำ: <strong className="text-amber-950 font-mono text-xs">฿ {newProd.price || 0}</strong>
                                    <p className="text-[9.5px] text-amber-800/90 mt-0.5">
                                      * หัก GP 20% แล้ว พาร์ทเนอร์จะได้รับเงิน <strong>฿ {newProdTargetPayout || Math.round((parseFloat(newProd.price || '0') || 0) * 0.80)}</strong> บาทพอดี (รวม VAT 7% เรียบร้อยแล้ว)
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-slate-700 font-semibold mb-1">
                                    ราคาตั้งขายปกติ (บาท) <span className="text-rose-500">*</span>
                                  </label>
                                  <input 
                                    type="number" 
                                    required
                                    value={newProd.price}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewProd(prev => ({ ...prev, price: val }));
                                      const p = parseFloat(val) || 0;
                                      setNewProdTargetPayout(p > 0 ? (p * 0.80).toString() : '');
                                    }}
                                    placeholder="เช่น 1000"
                                    className="w-full border border-amber-300 bg-white rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-amber-400 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-700 font-semibold mb-1">
                                    ส่วนลดโปรโมชั่น (%)
                                  </label>
                                  <input 
                                    type="number" 
                                    value={newProd.discountPercent}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, discountPercent: e.target.value }))}
                                    placeholder="เช่น 0 หรือ 10"
                                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs text-rose-600 font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-700 font-semibold mb-1">
                                    ค่าขนส่งขั้นต่ำร้านค้า (บาท) <span className="text-xs text-slate-400">(ขั้นต่ำ 35)</span>
                                  </label>
                                  <input 
                                    type="number" 
                                    value={newProd.shippingFeeBase}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, shippingFeeBase: e.target.value }))}
                                    placeholder="35"
                                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Category & Subcategory */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่หลักผลิตภัณฑ์ (Category)</label>
                                <select 
                                  value={newProd.category}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-400 outline-none"
                                >
                                  <option value="Fashion">👗 เสื้อผ้า แฟชั่น และเครื่องแต่งกาย (Fashion)</option>
                                  <option value="Electronics">🔌 อุปกรณ์ไอที และอิเล็กทรอนิกส์ (Electronics)</option>
                                  <option value="Beauty">🧴 เครื่องสำอาง ความงาม และผิวพรรณ (Beauty)</option>
                                  <option value="Health">💊 อาหารเสริม และผลิตภัณฑ์เพื่อสุขภาพ (Health)</option>
                                  <option value="Baby">👶 แม่และเด็ก ของเล่นเด็ก (Baby & Kids)</option>
                                  <option value="Home">🏠 ของตกแต่งบ้าน และเครื่องครัว (Home & Living)</option>
                                  <option value="Food">🍎 อาหารและเครื่องดื่ม (Food & Beverage)</option>
                                  <option value="Pets">🐶 สัตว์เลี้ยง (Pets)</option>
                                  <option value="Lifestyle">🎨 ไลฟ์สไตล์และงานอดิเรก (Lifestyle & Hobbies)</option>
                                  <option value="General">📦 ทั่วไป (General)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">ประเภทผลิตภัณฑ์ย่อย (Subcategory)</label>
                                <input 
                                  type="text" 
                                  value={newProd.subcategory}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, subcategory: e.target.value }))}
                                  placeholder="ระบุประเภทสินค้าย่อย"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                              </div>
                            </div>

                             {/* Affiliate, Extra PV, & Availability Settings Block */}
                            <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                                <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 text-amber-900">
                                  ⚙️ ตั้งค่าระบบ Affiliate (ปักตะกร้า), PV เพิ่มเติม & สถานะการขาย
                                </h5>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {/* 1. Status Toggle (In Stock / Out of Stock) */}
                                <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-2 flex flex-col justify-between">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700">สถานะรายการสินค้า:</span>
                                    <button
                                      type="button"
                                      onClick={() => setNewProd(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                                      className={`px-3 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                                        newProd.isAvailable 
                                          ? 'bg-emerald-500 text-white shadow-sm' 
                                          : 'bg-rose-500 text-white shadow-sm'
                                      }`}
                                    >
                                      {newProd.isAvailable ? '🟢 พร้อมขาย (In Stock)' : '🔴 สินค้าหมด / ปิดขาย'}
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-tight">
                                    เปิด = สินค้าแสดงพร้อมสั่งซื้อ | ปิด = ขึ้นสถานะสินค้าหมด
                                  </p>
                                </div>

                                {/* 2. Affiliate Commission Settings */}
                                <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700">ระบบปักตะกร้า Affiliate:</span>
                                    <button
                                      type="button"
                                      onClick={() => setNewProd(prev => ({ ...prev, isAffiliateEnabled: !prev.isAffiliateEnabled }))}
                                      className={`px-3 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                                        newProd.isAffiliateEnabled 
                                          ? 'bg-indigo-600 text-white shadow-sm' 
                                          : 'bg-slate-300 text-slate-600'
                                      }`}
                                    >
                                      {newProd.isAffiliateEnabled ? '🟢 เปิดให้ปักตะกร้า' : '⚪ ปิดปักตะกร้า'}
                                    </button>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                      ค่าคอมมิชชั่น Affiliate (บาท/ชิ้น):
                                    </label>
                                    <input
                                      type="number"
                                      disabled={!newProd.isAffiliateEnabled}
                                      value={newProd.affiliateCommission}
                                      onChange={(e) => setNewProd(prev => ({ ...prev, affiliateCommission: e.target.value }))}
                                      placeholder="0"
                                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 disabled:bg-slate-100 disabled:text-slate-400"
                                    />
                                  </div>
                                </div>

                                {/* 3. Extra PV Setting */}
                                <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-2">
                                  <label className="block font-bold text-slate-700 text-xs">
                                    🎁 เพิ่มคะแนน PV (PV เพิ่มเติมจากร้าน):
                                  </label>
                                  <input
                                    type="number"
                                    value={newProd.extraPv}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, extraPv: e.target.value }))}
                                    placeholder="0"
                                    className="w-full border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-purple-700 bg-purple-50/30"
                                  />
                                  <p className="text-[10px] text-purple-800 font-medium leading-tight">
                                    * 1 PV เพิ่มเติม = นำไปหัก 1 บาท ในยอดโอนสุทธิร้านค้า
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Package Weight & Dimensions */}
                            <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-3">
                              <h5 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 text-indigo-900">
                                📦 ขนาดกล่องพัสดุและน้ำหนัก (เพื่อประเมินค่าจัดส่ง)
                              </h5>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div>
                                  <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">น้ำหนัก (กรัม)</label>
                                  <input 
                                    type="number" 
                                    required
                                    value={newProd.weight}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, weight: e.target.value }))}
                                    placeholder="350"
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">กว้าง W (ซม.)</label>
                                  <input 
                                    type="number" 
                                    required
                                    value={newProd.width}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, width: e.target.value }))}
                                    placeholder="10"
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">ยาว L (ซม.)</label>
                                  <input 
                                    type="number" 
                                    required
                                    value={newProd.length}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, length: e.target.value }))}
                                    placeholder="10"
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-600 text-[10px] font-semibold mb-0.5">สูง H (ซม.)</label>
                                  <input 
                                    type="number" 
                                    required
                                    value={newProd.height}
                                    onChange={(e) => setNewProd(prev => ({ ...prev, height: e.target.value }))}
                                    placeholder="10"
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Live Calculation Preview Box */}
                            {(() => {
                              const calc = calculateShippingAndPricing(
                                newProd.price,
                                newProd.weight,
                                newProd.width,
                                newProd.length,
                                newProd.height,
                                newProd.discountPercent,
                                newProd.shippingFeeBase,
                                newProd.shippingDiscount,
                                1,
                                newProd.extraPv,
                                newProd.affiliateCommission,
                                newProd.isAffiliateEnabled
                              );
                              return (
                                <div className="bg-slate-900 text-slate-100 p-4.5 rounded-2xl space-y-3 font-sans shadow-md border border-slate-800">
                                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <span className="font-extrabold text-[11px] text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                      📊 สรุปตารางคำนวณราคาสินค้า & หักค่าธรรมเนียมสุทธิ (Live Preview)
                                    </span>
                                    <span className="text-[9px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                                      สูตร นที พลัส มาร์เก็ต
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                                    <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                                      <div className="flex justify-between text-slate-300">
                                        <span>ราคาสินค้าที่ร้านตั้ง:</span>
                                        <span className="font-mono font-bold">฿ {calc.originalPrice.toLocaleString()}</span>
                                      </div>
                                      {calc.discountPercent > 0 && (
                                        <div className="flex justify-between text-rose-400">
                                          <span>ส่วนลดสินค้า ({calc.discountPercent}%):</span>
                                          <span className="font-mono font-bold">- ฿ {(calc.originalPrice - calc.discountedPrice).toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-sky-400">
                                        <span>+ ค่าจัดส่งลูกค้า (1 ชิ้น):</span>
                                        <span className="font-mono font-bold">+ ฿ {calc.customerShippingFee.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-slate-700 pt-1.5 text-amber-300 font-extrabold">
                                        <span>ยอดรวมที่ลูกค้าชำระเงินจริง:</span>
                                        <span className="font-mono text-sm">฿ {calc.totalCustomerPaid.toFixed(2)}</span>
                                      </div>
                                    </div>

                                    <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                                      <div className="flex justify-between text-slate-300">
                                        <span>ยอดขายก่อน VAT (÷ 1.07):</span>
                                        <span className="font-mono">฿ {calc.priceExVat.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-rose-400">
                                        <span>หัก VAT 7%:</span>
                                        <span className="font-mono">- ฿ {calc.vat.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-rose-400">
                                        <span>หักค่าธรรมเนียม GP 20%:</span>
                                        <span className="font-mono">- ฿ {calc.gpAmount.toFixed(2)}</span>
                                      </div>
                                      {calc.isAffiliateEnabled && calc.affiliateCommission > 0 && (
                                        <div className="flex justify-between text-amber-400 font-bold">
                                          <span>หักค่าคอม Affiliate (ปักตะกร้า):</span>
                                          <span className="font-mono">- ฿ {calc.affiliateCommission.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {calc.extraPv > 0 && (
                                        <div className="flex justify-between text-purple-300 font-bold">
                                          <span>หักค่า PV เพิ่มเติม ({calc.extraPv} PV):</span>
                                          <span className="font-mono">- ฿ {calc.extraPv.toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-emerald-400 border-t border-slate-700 pt-1.5 font-extrabold">
                                        <span>ยอดโอนรับสุทธิร้านค้า (Net Payout):</span>
                                        <span className="font-mono text-sm text-emerald-300">฿ {calc.netPayout.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-purple-300 text-[10px] pt-1">
                                        <span>คะแนน PV รวม (GP PV + เพิ่มเติม):</span>
                                        <span className="font-mono font-extrabold text-purple-300">
                                          {calc.pv} PV ({calc.basePv} + {calc.extraPv})
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-slate-400 italic leading-snug pt-1">
                                    📌 หมายเหตุ: ค่าคอมมิชชั่น Affiliate และ PV เพิ่มเติม จะถูกนำไปหักจากยอดโอนสุทธิร้านค้าโดยอัตโนมัติ
                                  </p>
                                </div>
                              );
                            })()}

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-slate-700 font-semibold">คำอธิบายรายละเอียดสรรพคุณสินค้า (สูงสุด 500 ตัวอักษร)</label>
                                <button
                                  type="button"
                                  disabled={isRefiningDescription}
                                  onClick={async () => {
                                    const textToRefine = newProd.description || newProd.name;
                                    if (!textToRefine || !textToRefine.trim()) {
                                      showNotif("กรุณาระบุชื่อสินค้าหรือคำอธิบายก่อนเพื่อให้ AI ช่วยเรียบเรียงค่ะ", "warning");
                                      return;
                                    }
                                    setIsRefiningDescription(true);
                                    try {
                                      const res = await fetch('/api/ai/refine-description', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ text: newProd.description, productName: newProd.name })
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        setNewProd(prev => ({ ...prev, description: data.refinedText }));
                                        showNotif("AI ปรับปรุงสรรพคุณตามกฎหมายไทยเรียบร้อยแล้วค่ะ! ✨", "success");
                                      } else {
                                        showNotif(data.message || "เกิดข้อผิดพลาดในการปรับปรุงรายละเอียด", "error");
                                      }
                                    } catch (err) {
                                      showNotif("ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้", "error");
                                    } finally {
                                      setIsRefiningDescription(false);
                                    }
                                  }}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 border border-indigo-200 animate-pulse font-sans"
                                >
                                  {isRefiningDescription ? '⏳ AI กำลังปรับปรุงภาษา...' : '✨ AI ช่วยเรียบเรียงกฎหมายไทย'}
                                </button>
                              </div>
                              <textarea 
                                rows={3}
                                value={newProd.description}
                                maxLength={500}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val.length <= 500) {
                                    setNewProd(prev => ({ ...prev, description: val }));
                                  }
                                }}
                                placeholder="อธิบายสรรพคุณสินค้าสั้นๆ และวิธีการใช้งาน หรือกดปุ่ม AI ช่วยเรียบเรียงให้อัตโนมัติ"
                                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                              />
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-md cursor-pointer transition active:scale-95">
                              ยื่นอนุมัติเพิ่มรายการสินค้า (Natee Plus Market)
                            </button>
                          </form>
                        </div>

                        {/* Submitted Products List */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                            🛍️ รายการสินค้าของคุณทั้งหมด ({sellerProducts.length} รายการ)
                          </h4>
                          {sellerProducts.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-6">คุณยังไม่ได้ส่งผลิตภัณฑ์เข้าพิจารณาค่ะ</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {sellerProducts.map((p: any) => {
                                let badgeColor = "bg-amber-100 text-amber-800";
                                let statusTxt = "รอแอดมินอนุมัติ";
                                if (p.status === "Approved") {
                                  badgeColor = "bg-emerald-100 text-emerald-800";
                                  statusTxt = "เปิดจำหน่ายแล้ว";
                                } else if (p.status === "Rejected") {
                                  badgeColor = "bg-rose-100 text-rose-800";
                                  statusTxt = "ปฏิเสธ";
                                }

                                const imgList = Array.isArray(p.images) && p.images.length > 0 
                                  ? p.images 
                                  : [p.imageFile || p.image].filter(Boolean);

                                return (
                                  <div key={p.id} className="border border-slate-150 rounded-2xl p-4 bg-white hover:border-indigo-200 transition space-y-3 shadow-2xs">
                                    <div className="flex gap-3">
                                      <div className="w-20 h-20 aspect-square rounded-xl overflow-hidden border border-slate-100 shrink-0 relative bg-slate-50">
                                        <img 
                                          src={imgList[0] || p.image} 
                                          alt={p.name} 
                                          onClick={() => setPreviewImageUrl(imgList[0] || p.image)}
                                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition" 
                                          title="คลิกเพื่อขยายดูรูปภาพขนาดใหญ่"
                                        />
                                        {imgList.length > 1 && (
                                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded pointer-events-none">
                                            +{imgList.length - 1} รูป
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1">
                                          <div>
                                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-extrabold border border-slate-200 mb-1">
                                              🆔 {p.id}
                                            </span>
                                            <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const sellerId = sellerSessionUser?.userId || currentUser?.userId;
                                                  const res = await fetch('/api/seller/product/toggle-availability', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ productId: p.id, userId: sellerId })
                                                  });
                                                  const d = await res.json();
                                                  if (d.success) {
                                                    showNotif(d.message, 'success');
                                                    if (sellerId) fetchSellerData(sellerId);
                                                    fetch('/api/shop/products').then(r => r.json()).then(data => { if (data.success && Array.isArray(data.products)) setProducts(data.products); });
                                                  } else {
                                                    showNotif(d.message, 'error');
                                                  }
                                                } catch (err) {
                                                  showNotif("เกิดข้อผิดพลาดในการเปลี่ยนสถานะสินค้า", "error");
                                                }
                                              }}
                                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
                                                p.isAvailable !== false
                                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                              }`}
                                              title="คลิกสวิตช์เปิด/ปิดรายการสินค้า (สินค้าหมด หรือ พร้อมขาย)"
                                            >
                                              {p.isAvailable !== false ? '🟢 พร้อมขาย' : '🔴 สินค้าหมด'}
                                            </button>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                              {statusTxt}
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.description || "ไม่มีคำอธิบาย"}</p>
                                        <div className="mt-2 text-[10px] space-y-0.5">
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">ราคาขาย:</span>
                                            <strong className="text-indigo-600 font-bold">฿{p.price?.toLocaleString()}</strong>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">ยอดรับสุทธิร้านค้า:</span>
                                            <strong className="text-emerald-600 font-bold">฿{parseFloat(p.netPayout || p.price * 0.8).toFixed(2)}</strong>
                                          </div>
                                        </div>

                                        {/* Affiliate & Extra PV Badges */}
                                        <div className="flex flex-wrap items-center gap-1 mt-2 pt-1.5 border-t border-slate-100 text-[9px]">
                                          <span className={`px-1.5 py-0.5 rounded font-extrabold ${
                                            p.isAffiliateEnabled !== false && parseFloat(p.affiliateCommission) > 0
                                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                              : 'bg-slate-100 text-slate-500'
                                          }`}>
                                            {p.isAffiliateEnabled !== false && parseFloat(p.affiliateCommission) > 0
                                              ? `📌 ปักตะกร้า ฿${p.affiliateCommission}/ชิ้น`
                                              : '⚪ ปิดปักตะกร้า'}
                                          </span>
                                          <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-extrabold border border-purple-200">
                                            ✨ PV รวม: {p.pv || 0} PV {p.extraPv ? `(ร้านเพิ่ม +${p.extraPv})` : ''}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingProduct({
                                            ...p,
                                            images: imgList,
                                            discountPercent: p.discountPercent || '0',
                                            shippingFeeBase: p.shippingFeeBase || '35',
                                            shippingDiscount: p.shippingDiscount || '0',
                                            affiliateCommission: p.affiliateCommission || '0',
                                            isAffiliateEnabled: p.isAffiliateEnabled !== false,
                                            extraPv: p.extraPv || '0',
                                            isAvailable: p.isAvailable !== false
                                          });
                                          setShowEditProductModal(true);
                                        }}
                                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition cursor-pointer"
                                      >
                                        ✏️ แก้ไขรายละเอียดสินค้า & ตั้งค่า
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(p.id)}
                                        className="text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-lg transition cursor-pointer"
                                      >
                                        🗑️ ลบสินค้า
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {sellerPortalSubTab === 'orders' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            📦 รายการสั่งซื้อคลังสินค้าคุณ ({sellerOrders.filter(o => sellerOrderFilter === 'All' ? true : sellerOrderFilter === 'Processing' ? (o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Returned' && o.status !== 'Refunded') : sellerOrderFilter === 'Cancelled' ? o.status === 'Cancelled' : (o.status === 'Refunded' || o.status === 'Returned')).length} บิล)
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">กรองสถานะ:</span>
                            <select
                              value={sellerOrderFilter}
                              onChange={(e) => setSellerOrderFilter(e.target.value)}
                              className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-700"
                            >
                              <option value="All">แสดงทั้งหมด (All)</option>
                              <option value="Processing">รอจัดส่งพัสดุ (Processing)</option>
                              <option value="Cancelled">ลูกค้ายกเลิก (Cancelled)</option>
                              <option value="Refunded">การคืนเงิน/คืนสินค้า (Refunded/Returned)</option>
                            </select>
                            <button
                              type="button"
                              onClick={fetchSellerData}
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={12} /> รีเฟรชข้อมูล
                            </button>

                          </div>
                        </div>

                        {(() => {
                          const filtered = sellerOrders.filter(o => {
                            if (sellerOrderFilter === 'All') return true;
                            if (sellerOrderFilter === 'Processing') return o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Returned' && o.status !== 'Refunded';
                            if (sellerOrderFilter === 'Cancelled') return o.status === 'Cancelled';
                            return o.status === 'Returned' || o.status === 'Refunded';
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="text-center py-12 text-slate-400 italic">
                                <p className="text-xs">ไม่พบบิลตามตัวเลือกตัวกรองนี้ค่ะ 🛒</p>
                              </div>
                            );
                          }

                          return (
                            <div className="overflow-x-auto rounded-2xl border border-slate-100">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px]">
                                    <th className="p-3">ข้อมูลบิลสั่งซื้อ</th>
                                    <th className="p-3">สินค้าที่สั่ง</th>
                                    <th className="p-3 text-center">จำนวน</th>
                                    <th className="p-3 text-right">ยอดรับสุทธิ (80%)</th>
                                    <th className="p-3">ที่อยู่จัดส่งพัสดุ</th>
                                    <th className="p-3">สถานะจัดส่ง</th>
                                    <th className="p-3">ข้อมูลขนส่ง & นำส่ง</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                                  {filtered.map((order) => {
                                    const tracking = sellerShippingTracking[order.id] || { company: 'Flash Express', trackingNo: '', note: '' };
                                    const netEarning = order.totalPrice * 0.8;
                                    
                                    return (
                                      <tr key={order.id} className="hover:bg-slate-50/40 align-top">
                                        <td className="p-3 font-mono space-y-1">
                                          <div className="font-bold text-slate-900">{order.id}</div>
                                          <div className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleString('th-TH')}</div>
                                          <div className="text-[10px] text-slate-500">ผู้สั่ง: {order.userId}</div>
                                        </td>
                                        <td className="p-3 font-medium text-slate-800">
                                          {order.productName}
                                        </td>
                                        <td className="p-3 text-center font-bold">
                                          {order.quantity} ชิ้น
                                        </td>
                                        <td className="p-3 text-right font-bold text-emerald-600">
                                          ฿{netEarning.toLocaleString()}
                                        </td>
                                        <td className="p-3 text-[11px] text-slate-500 leading-relaxed max-w-[200px]">
                                          {order.shippingAddress}
                                        </td>
                                        <td className="p-3">
                                          {order.status === 'Completed' ? (
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                              ✓ จัดส่งเรียบร้อย
                                            </span>
                                          ) : order.status === 'Cancelled' ? (
                                            <span className="bg-rose-100 text-rose-850 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                                              ✖ ลูกค้ายกเลิก
                                            </span>
                                          ) : (
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                              รอส่งสินค้า
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-3 space-y-2">
                                          {order.status === 'Completed' ? (
                                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-[10px] space-y-0.5 text-slate-600 max-w-[180px]">
                                              <div>🚚 ขนส่ง: <strong className="text-slate-800">{order.trackingCompany}</strong></div>
                                              <div className="truncate">เลขพัสดุ: <strong className="text-indigo-600 select-all">{order.trackingNo}</strong></div>
                                              {order.shippingNote && <div className="text-slate-400 truncate">โน้ต: {order.shippingNote}</div>}
                                            </div>
                                          ) : order.status === 'Cancelled' ? (
                                            <div className="text-[10px] text-slate-400 italic">ออเดอร์นี้ถูกยกเลิกแล้ว</div>
                                          ) : (
                                            <div className="space-y-1.5 max-w-[180px]">
                                              <select
                                                value={tracking.company}
                                                onChange={(e) => setSellerShippingTracking(prev => ({
                                                  ...prev,
                                                  [order.id]: { ...(prev[order.id] || { company: 'Flash Express', trackingNo: '', note: '' }), company: e.target.value }
                                                }))}
                                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px] bg-white text-slate-700"
                                              >
                                                <option value="Flash Express">Flash Express</option>
                                                <option value="Kerry Express">Kerry Express</option>
                                                <option value="J&T Express">J&T Express</option>
                                                <option value="ไปรษณีย์ไทย (EMS)">ไปรษณีย์ไทย (EMS)</option>
                                              </select>
                                              <input
                                                type="text"
                                                required
                                                value={tracking.trackingNo}
                                                onChange={(e) => setSellerShippingTracking(prev => ({
                                                  ...prev,
                                                  [order.id]: { ...(prev[order.id] || { company: 'Flash Express', trackingNo: '', note: '' }), trackingNo: e.target.value }
                                                }))}
                                                placeholder="กรอกเลขพัสดุ (Tracking No)"
                                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
                                              />
                                              <input
                                                type="text"
                                                value={tracking.note}
                                                onChange={(e) => setSellerShippingTracking(prev => ({
                                                  ...prev,
                                                  [order.id]: { ...(prev[order.id] || { company: 'Flash Express', trackingNo: '', note: '' }), note: e.target.value }
                                                }))}
                                                placeholder="บันทึกข้อความเพิ่มเติม"
                                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleSellerShipOrder(order.id)}
                                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer"
                                              >
                                                ยืนยันการจัดส่งพัสดุ
                                              </button>
                                            </div>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveOrderChat(order);
                                              setOrderChatMessages([]);
                                            }}
                                            className="w-full mt-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer border border-emerald-200 flex items-center justify-center gap-1"
                                          >
                                            <MessageCircle size={12} /> แชทกับลูกค้า
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {sellerPortalSubTab === 'finance' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <span>💰 การเงิน และ บัญชีรายรับร้านค้า (Finance & Tax Hub)</span>
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">บริษัท นที พลัส มาร์เก็ต จำกัด (Natee Plus Market Co., LTD)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const completed = sellerOrders.filter((o: any) => o.status === 'Completed');
                                if (completed.length === 0) {
                                  showNotif('ยังไม่มีรายการสั่งซื้อที่ชำระเงินสำเร็จสำหรับส่งออกรายงาน CSV ค่ะ', 'warning');
                                  return;
                                }
                                const headers = ['เลขที่คำสั่งซื้อ', 'วันที่สั่งซื้อ', 'ชื่อสินค้า', 'จำนวน', 'ราคารวม (บาท)', 'ส่วนลด (บาท)', 'ค่าจัดส่ง (บาท)', 'หัก GP 20%', 'ยอดรับสุทธิร้านค้า (บาท)', 'สถานะ'];
                                const rows = completed.map((o: any) => [
                                  o.id,
                                  new Date(o.createdAt).toLocaleDateString('th-TH'),
                                  o.productName || '-',
                                  o.quantity || 1,
                                  o.totalPrice || 0,
                                  o.couponDiscountAmount || 0,
                                  o.shippingFee || 0,
                                  ((o.totalPrice || 0) * 0.20).toFixed(2),
                                  ((o.totalPrice || 0) * 0.80).toFixed(2),
                                  'ชำระแล้ว (Completed)'
                                ]);
                                exportToCsv(`Shop_Sales_Report_${profile?.sellerCode || 'Seller'}_${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
                                showNotif('ส่งออกรายงานยอดขายร้านค้าเป็นไฟล์ CSV เรียบร้อยแล้วค่ะ 📥', 'success');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                            >
                              📥 ส่งออก CSV รายงานยอดขาย
                            </button>
                            <span className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold font-mono border border-indigo-100 shadow-2xs">
                              E-Cash สะสมพร้อมถอน: ฿{(sellerOrders.filter((o: any) => o.status === 'Completed').reduce((acc: number, o: any) => acc + (o.totalPrice * 0.8), 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Financial Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                            <div className="text-base font-extrabold text-slate-900 font-mono">
                              ฿{(sellerOrders.reduce((acc: number, o: any) => acc + (o.totalPrice || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">ยอดขายรวมทั้งหมด</div>
                          </div>
                          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                            <div className="text-base font-extrabold text-emerald-700 font-mono">
                              ฿{(sellerOrders.filter((o: any) => o.status === 'Completed').reduce((acc: number, o: any) => acc + (o.totalPrice * 0.8), 0)).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-semibold">ยอดโอนรับสุทธิ (Net Payout)</div>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                            <div className="text-base font-extrabold text-rose-600 font-mono">
                              ฿{(sellerOrders.filter((o: any) => o.status === 'Completed').reduce((acc: number, o: any) => acc + (o.totalPrice * 0.2), 0)).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">ค่าบริการระบบ (GP 20%)</div>
                          </div>
                          <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 space-y-1">
                            <div className="text-base font-extrabold text-purple-700 font-mono">
                              ฿{(sellerOrders.filter((o: any) => o.status === 'Completed').reduce((acc: number, o: any) => acc + (o.totalPrice * 0.03), 0)).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-purple-800 font-semibold">หักภาษี ณ ที่จ่าย (3%)</div>
                          </div>
                        </div>

                        {/* Tax Type Registration Selection */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              📄 รูปแบบการเสียภาษี & เอกสารสถาบันการเงิน (Tax Entity Profile)
                            </h5>
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              กรมสรรพากร / นที พลัส มาร์เก็ต
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 bg-white ${taxType === 'personal' ? 'border-indigo-600 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="radio" 
                                name="taxType" 
                                value="personal" 
                                checked={taxType === 'personal'} 
                                onChange={() => setTaxType('personal')} 
                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="text-xs space-y-0.5">
                                <span className="font-bold text-slate-900 block">👤 บุคคลธรรมดา (Personal Taxpayer)</span>
                                <span className="text-[11px] text-slate-500 block">
                                  หักภาษี ณ ที่จ่าย 3% นำส่งกรมสรรพากร (ภ.ง.ด.3) ออกใบรับรอง 50 ทวิ ทุกสิ้นปี
                                </span>
                              </div>
                            </label>

                            <label className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 bg-white ${taxType === 'corporate' ? 'border-indigo-600 ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="radio" 
                                name="taxType" 
                                value="corporate" 
                                checked={taxType === 'corporate'} 
                                onChange={() => setTaxType('corporate')} 
                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="text-xs space-y-0.5">
                                <span className="font-bold text-slate-900 block">🏢 นิติบุคคล / บริษัทจำกัด (Corporate Taxpayer)</span>
                                <span className="text-[11px] text-slate-500 block">
                                  นำส่ง ภ.ง.ด.53 และออกใบกำกับภาษีเต็มรูปแบบในนาม บริษัท นที พลัส มาร์เก็ต จำกัด
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Date Range Sales Report Filter */}
                        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-3">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <h5 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                              📅 กรองรายงานสรุปยอดขายตามช่วงเวลา (Sales Date Range Report)
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                showNotif("กำลังส่งออกรายงานยอดขาย PDF และ Excel ตามช่วงเวลา...", "info");
                              }}
                              className="text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 transition cursor-pointer"
                            >
                              📥 ดาวน์โหลดรายงาน (Excel/PDF)
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">วันที่เริ่มต้น:</label>
                              <input 
                                type="date" 
                                value={salesReportStartDate}
                                onChange={(e) => setSalesReportStartDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">วันที่สิ้นสุด:</label>
                              <input 
                                type="date" 
                                value={salesReportEndDate}
                                onChange={(e) => setSalesReportEndDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400"
                              />
                            </div>
                            <div className="bg-white border border-indigo-100 rounded-xl p-2.5 text-[11px] font-medium text-slate-700 flex justify-between items-center">
                              <span>ช่วงเวลาที่เลือก:</span>
                              <strong className="text-indigo-700 font-mono font-bold">
                                {salesReportStartDate || 'ทั้งหมด'} ถึง {salesReportEndDate || 'ปัจจุบัน'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* 15-Day Cutoff Payout Schedule Table */}
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-2">
                            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              ⏳ ตารางกำหนดวันโอนเงินรายรับร้านค้า (ตัดรอบ 15 วันหลังจัดส่ง)
                            </h5>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              เงื่อนไข: ครบ 15 วันนับจากวันส่งพัสดุ
                            </span>
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                                  <th className="p-3">เลขที่คำสั่งซื้อ</th>
                                  <th className="p-3">วันที่จัดส่งพัสดุ</th>
                                  <th className="p-3">วันครบกำหนดโอน (Cutoff +15)</th>
                                  <th className="p-3 text-right">ยอดรับสุทธิ</th>
                                  <th className="p-3 text-center">สถานะการโอน</th>
                                  <th className="p-3 text-center">เอกสารรับเงิน</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                                {sellerOrders.filter(o => o.status === 'Completed').length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                                      ยังไม่มีรายการพัสดุที่จัดส่งสำเร็จค่ะ
                                    </td>
                                  </tr>
                                ) : (
                                  sellerOrders.filter(o => o.status === 'Completed').map((order) => {
                                    const shipDate = order.shippedAt ? new Date(order.shippedAt) : new Date(order.createdAt);
                                    const cutoffDate = order.payoutCutoffDate 
                                      ? new Date(order.payoutCutoffDate) 
                                      : new Date(shipDate.getTime() + (15 * 24 * 60 * 60 * 1000));
                                    
                                    const isMatured = new Date() >= cutoffDate;
                                    const netPayout = order.totalPrice * 0.8;

                                    return (
                                      <tr key={order.id} className="hover:bg-slate-50/50">
                                        <td className="p-3 font-mono font-bold text-slate-900">{order.id}</td>
                                        <td className="p-3 font-mono text-slate-600">{shipDate.toLocaleDateString('th-TH')}</td>
                                        <td className="p-3 font-mono font-bold text-indigo-700">{cutoffDate.toLocaleDateString('th-TH')}</td>
                                        <td className="p-3 text-right font-mono font-bold text-emerald-600">
                                          ฿{netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 text-center">
                                          {isMatured ? (
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                              ✓ โอนเข้า E-Cash แล้ว
                                            </span>
                                          ) : (
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                                              ⏳ รอครบกำหนด 15 วัน
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-3 text-center">
                                          <button
                                            type="button"
                                            onClick={() => setSelectedReceiptOrder(order)}
                                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                                          >
                                            📄 ใบเสร็จ (PDF)
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

                        {/* Bank Account Info */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            🏦 บัญชีธนาคารรับโอนเงินของร้านค้า
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-150">
                            <div>
                              <span className="text-[10px] text-slate-400 block">ธนาคาร:</span>
                              <strong className="text-slate-800 font-semibold">ธนาคารกสิกรไทย (K-Bank)</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">ชื่อบัญชี:</span>
                              <strong className="text-slate-800 font-semibold">{sellerSessionUser?.sellerStoreName || "บริษัท นที พลัส มาร์เก็ต จำกัด"}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">รอบโอนอัตโนมัติ:</span>
                              <strong className="text-indigo-600 font-semibold">ทุกวันศุกร์ (เวลา 18:00 น.)</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECURITY DEPOSIT TAB */}
                    {sellerPortalSubTab === 'deposit' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <span>🛡️ เงินประกันความเสี่ยงร้านค้า (Security Deposit Hub)</span>
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">วางเงินประกันเพื่อขยายวงเงินวางขายสินค้า 10 เท่า และสร้างความเชื่อมั่นให้ผู้ซื้อ</p>
                          </div>
                          <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl font-bold font-mono border border-amber-200">
                            อัตราส่วนขยายวงเงิน: 10 เท่าของเงินประกัน
                          </span>
                        </div>

                        {/* Stats overview */}
                        {(() => {
                          const deposit = parseFloat(sellerSessionUser?.securityDeposit || 0);
                          const maxCap = deposit * 10;
                          const activeSales = (sellerOrders || [])
                            .filter((o: any) => o?.status === 'Processing' || o?.status === 'Paid')
                            .reduce((sum: number, o: any) => sum + (parseFloat(o?.totalPrice) || 0), 0);
                          
                          return (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden">
                                  <div className="text-xs font-semibold text-amber-100 uppercase tracking-wider">เงินประกันสะสมคงเหลือ</div>
                                  <div className="text-3xl font-black font-mono">฿{deposit.toLocaleString()}</div>
                                  <div className="text-[10px] text-amber-100/80">สามารถถอนคืนได้เมื่อไม่มีคำสั่งซื้อรอดำเนินการ</div>
                                </div>

                                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden border border-slate-800">
                                  <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">วงเงินสิทธิ์ลงวางขายสินค้า (10x Cap)</div>
                                  <div className="text-3xl font-black font-mono text-emerald-400">฿{maxCap.toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-400">คำนวณจากเงินประกัน ฿{deposit.toLocaleString()} × 10 เท่า</div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">ยอดขายรอดำเนินการจัดส่งค้างอยู่</div>
                                  <div className="text-3xl font-black font-mono text-rose-600">฿{activeSales.toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-500">เงินประกันต้องค้างไว้อย่างน้อยเท่ากับยอดขายรอดำเนินการ</div>
                                </div>
                              </div>

                              {/* Action Forms: Deposit & Withdraw */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {/* DEPOSIT FORM */}
                                <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 space-y-4">
                                  <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                                    <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                                      <span>➕ ฝากเงินประกันเพิ่ม (จากกระเป๋า E-Cash)</span>
                                    </h5>
                                    <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded font-mono border border-emerald-200">
                                      E-Cash พร้อมใช้: ฿{(sellerSessionUser?.balanceECash || 0).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">โอนเงินฝากประกันเพื่อขยายวงเงินการลงขายสินค้าเพิ่ม 10 เท่าทันที</p>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ระบุจำนวนเงินที่ต้องการฝาก (บาท):</label>
                                      <input 
                                        type="number"
                                        id="secDepositAmountInput"
                                        placeholder="เช่น 1000"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const inputEl = document.getElementById("secDepositAmountInput") as HTMLInputElement;
                                        const amt = parseFloat(inputEl?.value || "0");
                                        if (!amt || amt <= 0) {
                                          showNotif("กรุณาระบุจำนวนเงินประกันที่ต้องการฝาก", "warning");
                                          return;
                                        }
                                        try {
                                          const res = await fetch("/api/seller/security-deposit/deposit", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ userId: sellerSessionUser.userId, amount: amt })
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            showNotif(data.message, "success");
                                            setSellerSessionUser((prev: any) => ({
                                              ...prev,
                                              securityDeposit: (prev.securityDeposit || 0) + amt,
                                              balanceECash: data.newECash
                                            }));
                                            if (inputEl) inputEl.value = "";
                                          } else {
                                            showNotif(data.message, "error");
                                          }
                                        } catch (e) {
                                          showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
                                        }
                                      }}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      🛡️ ยืนยันโอนฝากเงินประกันเพิ่ม
                                    </button>
                                  </div>
                                </div>

                                {/* WITHDRAW FORM */}
                                <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-5 space-y-4">
                                  <div className="flex justify-between items-center border-b border-rose-100 pb-2">
                                    <h5 className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                                      <span>➖ ถอนเงินประกันคืน (เข้ากระเป๋า E-Cash)</span>
                                    </h5>
                                    <span className="text-[10px] text-rose-700 bg-white px-2 py-0.5 rounded font-mono border border-rose-200">
                                      เงินประกันคงเหลือ: ฿{deposit.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">ถอนเงินประกันคืนกลับเข้ากระเป๋า E-Cash ได้ตลอดเวลาหากไม่มีออเดอร์ค้างจัดส่ง</p>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ระบุจำนวนเงินที่ต้องการถอน (บาท):</label>
                                      <input 
                                        type="number"
                                        id="secWithdrawAmountInput"
                                        placeholder="เช่น 500"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const inputEl = document.getElementById("secWithdrawAmountInput") as HTMLInputElement;
                                        const amt = parseFloat(inputEl?.value || "0");
                                        if (!amt || amt <= 0) {
                                          showNotif("กรุณาระบุจำนวนเงินที่ต้องการถอน", "warning");
                                          return;
                                        }
                                        try {
                                          const res = await fetch("/api/seller/security-deposit/withdraw", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ userId: sellerSessionUser.userId, amount: amt })
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            showNotif(data.message, "success");
                                            setSellerSessionUser((prev: any) => ({
                                              ...prev,
                                              securityDeposit: Math.max(0, (prev.securityDeposit || 0) - amt),
                                              balanceECash: data.newECash
                                            }));
                                            if (inputEl) inputEl.value = "";
                                          } else {
                                            showNotif(data.message, "error");
                                          }
                                        } catch (e) {
                                          showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
                                        }
                                      }}
                                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      💸 ยืนยันถอนเงินประกันคืนเข้า E-Cash
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {sellerPortalSubTab === 'stats' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-bold text-slate-800">📊 สถิติจำหน่ายและวิเคราะห์เชิงลึก (Shop Analytics)</h4>
                          <span className="text-xs text-slate-400">ข้อมูลอัปเดตสัปดาห์นี้</span>
                        </div>

                        {/* Stylized Progress Gauges representing visitor metrics */}
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>ยอดผู้เข้าชมหน้ารายการสินค้าของท่าน</span>
                              <span className="font-mono text-indigo-600">1,420 ครั้ง (+15%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>อัตราการสั่งซื้อสำเร็จ (Conversion Rate)</span>
                              <span className="font-mono text-emerald-600">88.5% (สูงกว่าค่าเฉลี่ย 12%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88.5%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>สัดส่วนคะแนน PV ที่หมวนเวียนสำเร็จ</span>
                              <span className="font-mono text-purple-600">4,850 PV (+30%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Advice Box based on statistics */}
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed">
                          <strong>💡 คำแนะนำระบบอัตโนมัติ:</strong> ช่วงเวลานาทีทองของร้านท่านคือช่วงเวลา 19:00 - 22:00 น. แนะนำให้เพิ่มช่วงสต็อกในสต็อกผลิตภัณฑ์บำรุงผิว เพื่อรองรับออเดอร์ปันยอดส่งที่สูงขึ้นในช่วงวันหยุดเสาร์-อาทิตย์นี้ค่ะ
                        </div>


                      </div>
                    )}

                    {sellerPortalSubTab === 'chat' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            💬 ห้องสนทนากับลูกค้าและผู้ซื้อพันธมิตร ({sellerMockChatMessages.length} ข้อความ)
                          </h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">กำลังเชื่อมต่อ (Online)</span>
                        </div>

                        {/* Message history thread */}
                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 h-64 overflow-y-auto space-y-3 flex flex-col">
                          {sellerMockChatMessages.map((msg: any) => (
                            <div key={msg.id} className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                              msg.sender === 'seller' 
                                ? 'bg-indigo-600 text-white rounded-br-none self-end shadow-md' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none self-start shadow-sm'
                            }`}>
                              <div>{msg.text}</div>
                              <div className={`text-[9px] mt-1 font-mono text-right ${msg.sender === 'seller' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</div>
                            </div>
                          ))}
                        </div>

                        {/* Interactive text reply box */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!sellerNewMessageText.trim()) return;
                            const newMsg = {
                              id: sellerMockChatMessages.length + 1,
                              sender: 'seller',
                              text: sellerNewMessageText,
                              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
                            };
                            setSellerMockChatMessages(prev => [...prev, newMsg]);
                            setSellerNewMessageText('');
                            showNotif("ส่งข้อความถึงลูกค้าสำเร็จแล้วค่ะ", "success");
                          }}
                          className="flex gap-2"
                        >
                          <input 
                            type="text" 
                            value={sellerNewMessageText}
                            onChange={(e) => setSellerNewMessageText(e.target.value)}
                            placeholder="พิมพ์ข้อความตอบกลับลูกค้าที่นี่..."
                            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                          />
                          <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                          >
                            ส่งข้อความ
                          </button>
                        </form>
                      </div>
                    )}

                    {sellerPortalSubTab === 'learning' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              📖 ศูนย์การเรียนรู้และคู่มือผู้ขาย (Partner Learning Centre)
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">รวมคู่มือการใช้งานระบบ บทเรียนการตลาด และวิธีการไลฟ์สดขายสินค้า</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSellerPortalSubTab('home')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                          >
                            <span>←</span>
                            <span>กลับสู่แผงควบคุมร้านค้า</span>
                          </button>
                        </div>

                        {/* FEATURED: LIVE STREAMING SELLER GUIDE */}
                        <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-rose-500/30 shadow-xl space-y-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10">
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                คู่มือการใช้งานระบบ: Live Shopping
                              </div>
                              <h5 className="text-base font-extrabold text-white flex items-center gap-2">
                                🎥 ขั้นตอนการไลฟ์สดขายสินค้า และเชื่อมต่อ TikTok Live / YouTube / Facebook
                              </h5>
                              <p className="text-xs text-slate-300">
                                วิธีสร้างห้องไลฟ์สด นำลิงก์วิดีโอจากแพลตฟอร์มต่างๆ มาวางเพื่อดึงสัญญาณสด พร้อมปักตะกร้าสินค้าในร้านค้าของคุณ
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('shop');
                                showNotif("นำท่านไปยังหน้าตลาดเพื่อทดลองเปิดห้องไลฟ์สด", "info");
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                            >
                              <Video size={16} />
                              <span>ไปที่หน้าตลาด เพื่อเปิดไลฟ์สด</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 font-sans text-xs">
                            {/* STEP 1 */}
                            <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                                <h6 className="font-extrabold text-rose-200">เริ่มสร้างห้องไลฟ์สด</h6>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                กดปุ่ม <strong className="text-white">"🎥 เริ่มไลฟ์สด"</strong> บนแถบห้องไลฟ์สดหน้ามาร์เก็ต ใส่หัวข้อเรื่องที่น่าสนใจ และอัปโหลดภาพปกห้องไลฟ์ (Cover Image) เพื่อดึงดูดผู้เข้าชม
                              </p>
                            </div>

                            {/* STEP 2 */}
                            <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                                <h6 className="font-extrabold text-indigo-200">คัดลอกลิงก์สตรีมไลฟ์สด</h6>
                              </div>
                              <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                                <div><strong className="text-white">🎵 TikTok Live:</strong> เปิด TikTok บนมือถือ -&gt; Go LIVE -&gt; คัดลอกลิงก์สตรีม เช่น <code className="text-amber-300 text-[10px]">https://www.tiktok.com/@yourname/live</code></div>
                                <div><strong className="text-white">▶️ YouTube Live:</strong> คัดลอก URL เช่น <code className="text-amber-300 text-[10px]">https://youtube.com/live/xxx</code> หรือ <code className="text-amber-300 text-[10px]">https://youtu.be/xxx</code></div>
                                <div><strong className="text-white">📘 Facebook Live:</strong> คัดลอกลิงก์วิดีโอถ่ายทอดสดบนเพจของคุณ</div>
                              </div>
                            </div>

                            {/* STEP 3 */}
                            <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5 backdrop-blur-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                                <h6 className="font-extrabold text-emerald-200">ปักตะกร้าสินค้า & รับออเดอร์</h6>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                เลือกสินค้าในร้านของคุณที่ต้องการปักตะกร้า ลูกค้าที่เข้าชมไลฟ์สดสามารถคลิกดูสินค้า ปักตะกร้า และกดสั่งซื้อพร้อมสะสมคะแนน PV ได้ทันทีขณะรับชม
                              </p>
                            </div>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-750 rounded-2xl p-3.5 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2 relative z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-bold">💡 เคล็ดลับเพิ่มยอดขาย:</span>
                              <span>แชทโต้ตอบกับลูกค้าแบบ Real-time และมอบโค้ดส่วนลดพิเศษสำหรับผู้เข้าชมไลฟ์สดเท่านั้น</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ระบบรองรับ Live Embed อัตโนมัติ</span>
                          </div>
                        </div>

                        {/* OTHER LEARNING LESSONS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">ยอดนิยม 🔥</span>
                            <h5 className="font-bold text-slate-800 text-xs">🚀 บทเรียนที่ 1: ตกแต่งร้านค้าอย่างไรให้สมาชิกสนใจกดสั่ง</h5>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              เทคนิคจับคู่โทนสีที่เหมาะสมกับกลุ่มผลิตภัณฑ์สุขภาพ การจัดสรรวางสินค้าหมวดหมู่หลักในตำแหน่งหน้าแรก และความโดดเด่นของภาพผลิตภัณฑ์
                            </p>
                          </div>
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                            <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full">คู่มือระบบ 📑</span>
                            <h5 className="font-bold text-slate-800 text-xs">📦 บทเรียนที่ 2: ไขข้อสงสัยสูตรค่าขนส่ง Shippop และ PV</h5>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              อธิบายขั้นตอนการวัดขนาด กว้างxยาวxสูง จริงของแพ็คเกจ และการคำนวณน้ำหนักปริมาตรที่เหมาะสม เพื่อลดความคลาดเคลื่อนทางบัญชี
                            </p>
                          </div>
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">กฎหมายร้านค้า ⚖️</span>
                            <h5 className="font-bold text-slate-800 text-xs">🛡️ บทเรียนที่ 3: ระเบียบข้อบังคับและจรรยาบรรณผู้ค้าของนทีพลัส</h5>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              ทำความเข้าใจนโยบายความโปร่งใสทางกฎหมาย กฎการคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของผู้ซื้อ และการห้ามจำหน่ายสินค้าลอกเลียนแบบ
                            </p>
                          </div>
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2">
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-full">แชร์ประสบการณ์ 💡</span>
                            <h5 className="font-bold text-slate-800 text-xs">🌟 บทเรียนที่ 4: เคล็ดลับการตอบกลับแชทและบริการหลังการขาย</h5>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              ตอบข้อซักถามลูกค้าอย่างถูกต้อง สรรพคุณทางกฏหมาย วิธีดูแลออเดอร์ที่มีปัญหาคืนสินค้า เพื่อคงสถานะเรตติ้งระดับ 5 ดาวเสมอ
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {sellerPortalSubTab === 'info' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                              🏪 ข้อมูลที่อยู่จัดส่งและปักหมุดพิกัด GPS คลังสินค้า (Warehouse GPS Map Location)
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              ปักหมุดตำแหน่งที่ตั้งคลังสินค้าปลายทางสำหรับการจัดส่งพัสดุ เมื่อท่านบันทึกและล็อกพิกัดเรียบร้อยแล้ว แอดมินจะมองเห็นพิกัดและที่อยู่นี้ตรงกันโดยสมบูรณ์
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl font-mono">
                              รหัสร้านค้า: {sellerSessionUser.sellerCode || '-'}
                            </span>
                            {isWarehouseLocked ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsWarehouseLocked(false);
                                  showNotif("ปลดล็อกคลังสินค้าเรียบร้อยค่ะ ท่านสามารถแก้ไขที่อยู่และลากหมุดบนแผนที่ได้เลยค่ะ", "info");
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                              >
                                <span>✏️</span>
                                <span>แก้ไขคลังสินค้า</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsWarehouseLocked(true);
                                  showNotif("ยกเลิกการแก้ไขและล็อกพิกัดคลังสินค้าเรียบร้อยค่ะ", "info");
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>❌</span>
                                <span>ยกเลิกการแก้ไข</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status Mode Banner */}
                        {isWarehouseLocked ? (
                          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-3 text-emerald-950">
                              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                                🔒
                              </div>
                              <div>
                                <h6 className="font-extrabold text-emerald-950 text-xs flex items-center gap-2">
                                  <span>พิกัดและที่อยู่คลังสินค้าถูกล็อกอยู่ (Warehouse Locked)</span>
                                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-bold">ปลอดภัย 100%</span>
                                </h6>
                                <p className="text-[11px] text-emerald-800/90 mt-0.5">
                                  หากต้องการปรับเปลี่ยนตำแหน่งปักหมุด GPS หรือแก้ไขรายละเอียดที่อยู่จัดส่ง ให้กดปุ่ม <strong>"แก้ไขคลังสินค้า"</strong> ด้านขวามือค่ะ
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsWarehouseLocked(false);
                                showNotif("ปลดล็อกคลังสินค้าแล้วค่ะ ท่านสามารถแก้ไขที่อยู่และลากหมุดบนแผนที่ได้เลยค่ะ", "info");
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
                            >
                              <span>✏️</span>
                              <span>แก้ไขคลังสินค้า</span>
                            </button>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shadow-2xs">
                            <div className="flex items-center gap-3 text-amber-950">
                              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs animate-bounce">
                                📍
                              </div>
                              <div>
                                <h6 className="font-extrabold text-amber-950 text-xs flex items-center gap-2">
                                  <span>กำลังอยู่ในโหมดปรับแก้ไขคลังสินค้า (Editing Mode)</span>
                                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">ปลดล็อกแล้ว</span>
                                </h6>
                                <p className="text-[11px] text-amber-800/90 mt-0.5">
                                  ท่านสามารถพิมพ์เปลี่ยนที่อยู่ หรือลากหมุดปักตำแหน่งพิกัด GPS ใหม่ได้เลย เมื่อเปลี่ยนเรียบร้อยให้กด <strong>"ขอรับ OTP"</strong> แล้วกรอกรหัสเพื่อล็อกพิกัดอีกครั้งค่ะ
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsWarehouseLocked(true);
                                showNotif("ยกเลิกการแก้ไขและล็อกพิกัดคลังสินค้าเรียบร้อยค่ะ", "info");
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              <span>❌</span>
                              <span>ยกเลิกการแก้ไข</span>
                            </button>
                          </div>
                        )}

                        <form onSubmit={handleUpdateWarehouseWithOtp} className="space-y-6 text-xs text-slate-700">
                          {/* Security Notice Banner */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 shadow-2xs">
                            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                              <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                              <span>🔒 ระบบความปลอดภัยมาตรฐานป้องกันการทุจริต (Email OTP Verification Required)</span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              เนื่องจากคลังสินค้าเป็นจุดรับส่งและคืนพัสดุสำคัญ การแก้ไขที่อยู่คลังสินค้าและพิกัดแผนที่ GPS ทุกครั้ง จะต้องผ่านการยืนยันรหัส <strong>OTP ผ่านทางอีเมล</strong> (ส่งไปยัง: <strong className="text-indigo-700">{sellerSessionUser.email || 'อีเมลที่ลงทะเบียน'}</strong>) เพื่อป้องกันมิจฉาชีพแอบอ้างสวมรอยแก้ไขข้อมูลคลังสินค้าค่ะ
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Warehouse Address & OTP Verification Panel */}
                            <div className="space-y-4 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-extrabold text-slate-800 flex items-center justify-between">
                                    <span className="flex items-center gap-1">🏭 ที่อยู่จัดส่งคลังสินค้าปลายทาง (Full Warehouse Shipping Address) *</span>
                                    {isWarehouseLocked && (
                                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        🔒 ช่องนี้ถูกล็อกอยู่
                                      </span>
                                    )}
                                  </label>
                                  <p className="text-[10px] text-slate-400">
                                    * หมายเหตุ: คลังสินค้าสำหรับจัดส่งพัสดุอาจไม่ใช่ที่อยู่ปัจจุบันของคุณ กรุณาระบุรายละเอียดที่อยู่คลังจริง
                                  </p>
                                  <textarea 
                                    rows={3}
                                    required
                                    readOnly={isWarehouseLocked}
                                    value={sellerWarehouseEditAddress}
                                    onChange={(e) => setSellerWarehouseEditAddress(e.target.value)}
                                    placeholder="ระบุบ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด และรหัสไปรษณีย์ ของคลังสินค้า..."
                                    className={`w-full border rounded-xl p-3 text-xs outline-none leading-relaxed transition ${
                                      isWarehouseLocked 
                                        ? 'bg-slate-100/80 border-slate-200 text-slate-600 cursor-not-allowed' 
                                        : 'bg-white border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 shadow-2xs'
                                    }`}
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1">
                                    💬 LINE ID / LINE Official Account (ช่องทางติดต่อ LINE ของร้านค้า)
                                  </label>
                                  <p className="text-[10px] text-slate-400">
                                    * ระบุ LINE ID หรือลิงก์ LINE Official Account (เช่น @nateeplus หรือ https://line.me/ti/p/...) เพื่อให้ลูกค้าติดต่อสอบถามเกี่ยวกับสินค้า
                                  </p>
                                  <input 
                                    type="text"
                                    readOnly={isWarehouseLocked}
                                    value={sellerWarehouseEditLine}
                                    onChange={(e) => setSellerWarehouseEditLine(e.target.value)}
                                    placeholder="เช่น @nateeplus หรือ https://line.me/ti/p/..."
                                    className={`w-full border rounded-xl p-2.5 text-xs outline-none transition font-mono ${
                                      isWarehouseLocked 
                                        ? 'bg-slate-100/80 border-slate-200 text-slate-600 cursor-not-allowed' 
                                        : 'bg-white border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900'
                                    }`}
                                  />
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-slate-600 text-[11px]">
                                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                    <span>📞 <strong>ผู้ดูแลคลัง:</strong> {sellerSessionUser.sellerPhone || sellerSessionUser.phone || '08x-xxx-xxxx'}</span>
                                    <span>✉️ <strong>อีเมล:</strong> {sellerSessionUser.email || '-'}</span>
                                    <span>💬 <strong>LINE:</strong> <strong className="text-emerald-700">{sellerSessionUser.sellerLine || sellerWarehouseEditLine || 'ยังไม่ได้ระบุ'}</strong></span>
                                  </div>
                                  <div className="font-mono text-indigo-700 font-bold bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/50">
                                    📍 พิกัด GPS คลังสินค้าที่ปักหมุดปัจจุบัน: Latitude {Number(sellerWarehouseEditLat || 0).toFixed(6)}, Longitude {Number(sellerWarehouseEditLng || 0).toFixed(6)}
                                  </div>
                                </div>
                              </div>

                              {/* OTP Verification & Confirmation Box */}
                              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-3 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <h5 className="font-extrabold text-indigo-950 text-xs flex items-center gap-1">
                                      🔑 ขอรับรหัส OTP ทางอีเมลเพื่อล็อกพิกัด
                                    </h5>
                                    <p className="text-[10px] text-indigo-700/80">
                                      ส่งรหัส OTP 6 หลักไปยังอีเมล {sellerSessionUser.email}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSendWarehouseOtp}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm shrink-0 flex items-center justify-center gap-1"
                                  >
                                    <span>{sellerWarehouseOtpSent ? '🔄 ขอส่ง OTP อีกครั้ง' : '📩 ขอรับรหัส OTP'}</span>
                                  </button>
                                </div>

                                {sellerWarehouseOtpSent && (
                                  <p className="text-[10px] text-emerald-600 font-medium">
                                    ✓ ระบบได้จัดส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว กรุณาตรวจสอบในกล่องข้อความหรืออีเมลขยะ (Junk/Spam)
                                  </p>
                                )}

                                <div className="space-y-1">
                                  <label className="block text-[11px] font-bold text-slate-700">
                                    กรอกรหัส OTP 6 หลัก *
                                  </label>
                                  <input 
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={sellerWarehouseOtp}
                                    onChange={(e) => setSellerWarehouseOtp(e.target.value)}
                                    placeholder="กรอกรหัส 6 หลักจากอีเมล"
                                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm font-mono font-black tracking-widest text-center focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md flex justify-center items-center gap-1.5 active:scale-95"
                                >
                                  <span>🔒 บันทึกและล็อกพิกัดคลังสินค้าปลายทาง</span>
                                </button>
                              </div>
                            </div>

                            {/* Map Selector & Pinpoint Canvas */}
                            <div className="space-y-2">
                              <label className="block text-xs font-extrabold text-slate-800 flex items-center justify-between gap-2">
                                <span>🗺️ ปักหมุดแผนที่ตำแหน่งคลังสินค้า GPS (Pin Location) *</span>
                                {isWarehouseLocked ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsWarehouseLocked(false);
                                      showNotif("ปลดล็อกแผนที่แล้ว สามารถขยับหมุดปักพิกัดใหม่ได้เลยค่ะ", "info");
                                    }}
                                    className="text-[10px] font-extrabold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
                                  >
                                    <span>✏️ แก้ไขคลังสินค้า</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg animate-pulse shrink-0">
                                    📍 ปลดล็อกแล้ว: คลิกหรือลากหมุดบนแผนที่ได้เลย
                                  </span>
                                )}
                              </label>
                              <NateeWarehouseMap 
                                lat={sellerWarehouseEditLat} 
                                lng={sellerWarehouseEditLng} 
                                onChange={(lat, lng) => {
                                  setSellerWarehouseEditLat(lat);
                                  setSellerWarehouseEditLng(lng);
                                }}
                                address={sellerWarehouseEditAddress}
                                onAddressChange={(addr) => {
                                  if (addr) setSellerWarehouseEditAddress(addr);
                                }}
                                readOnly={isWarehouseLocked}
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {sellerPortalSubTab === 'live' && (() => {
                      const activeSellerId = sellerSessionUser?.userId || currentUser?.userId;
                      const activeStoreName = sellerSessionUser?.sellerStoreName || profile?.sellerStoreName || profile?.storeName || 'ร้านค้าพาร์ทเนอร์';
                      const sellerActiveLiveStream = liveStreamsList.find((s: any) => s.status === 'LIVE' && (s.sellerId === activeSellerId || s.sellerStoreName === activeStoreName));
                      const myApprovedProducts = products.filter((p: any) => p.sellerId === activeSellerId || p.userId === activeSellerId);

                      return (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-6 text-white animate-fadeIn">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
                            <div>
                              <h4 className="text-base font-extrabold text-rose-400 flex items-center gap-2">
                                <Video size={22} className="text-rose-500 animate-pulse" />
                                <span>🎥 ห้องเตรียมไลฟ์สดร้านค้า (Live Studio & Stream Preparation Room)</span>
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">
                                จัดการลิงก์สตรีม จัดหมวดหมู่สินค้าที่จะนำขึ้นไลฟ์สด กำหนดรหัสสินค้า (SKU) และเลือกสินค้าปักตะกร้าหน้าจอได้ก่อนเปิดไลฟ์สดจริง
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                              {sellerActiveLiveStream ? (
                                <span className="bg-rose-600/90 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border border-rose-400/50 animate-pulse flex items-center gap-1.5 shadow-md">
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                  <span>กำลังถ่ายทอดสดอยู่ (LIVE)</span>
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                                  <span>โหมดเตรียมความพร้อม (OFFLINE)</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* IF SELLER IS NOT LIVE: PREPARATION SETUP */}
                          {!sellerActiveLiveStream ? (
                            <div className="space-y-6">
                              {/* Step 1: Stream Information */}
                              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                                <h5 className="text-xs font-black text-rose-300 flex items-center gap-2 uppercase tracking-wider">
                                  <span>1️⃣</span>
                                  <span>ตั้งค่าหัวข้อและช่องทางถ่ายทอดสด (Live Stream Settings)</span>
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div className="space-y-1.5">
                                    <label className="block text-slate-300 font-bold">หัวข้อการถ่ายทอดสด *</label>
                                    <input
                                      type="text"
                                      value={liveCreateTitle}
                                      onChange={(e) => setLiveCreateTitle(e.target.value)}
                                      placeholder={`เช่น เปิดกรุสินค้าฮิตจากร้าน ${activeStoreName} ลดพิเศษ 50%!`}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-rose-500 outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="block text-slate-300 font-bold">ลิงก์วิดีโอถ่ายทอดสด (YouTube / TikTok / Facebook / Embed URL) *</label>
                                    <input
                                      type="text"
                                      value={liveCreateStreamUrl}
                                      onChange={(e) => setLiveCreateStreamUrl(e.target.value)}
                                      placeholder="https://www.youtube.com/watch?v=... หรือ https://vt.tiktok.com/..."
                                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:border-rose-500 outline-none"
                                    />
                                    <p className="text-[10px] text-slate-400">
                                      💡 ระบบจะแปลงลิงก์ YouTube Live / Shorts หรือ TikTok Embed ให้แสดงผลในวิดีโอผู้เข้าชมโดยอัตโนมัติ
                                    </p>
                                  </div>
                                  <div className="space-y-1.5 md:col-span-2">
                                    <label className="block text-slate-300 font-bold">รูปภาพปกห้องไลฟ์ (Cover Image URL) - หากว่างไว้ระบบจะใช้รูปสินค้าหน้าแรก</label>
                                    <input
                                      type="text"
                                      value={liveCreateCoverImage}
                                      onChange={(e) => setLiveCreateCoverImage(e.target.value)}
                                      placeholder="https://images.unsplash.com/photo-..."
                                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:border-rose-500 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Step 2: Product Catalog & Custom SKU Codes */}
                              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div>
                                    <h5 className="text-xs font-black text-rose-300 flex items-center gap-2 uppercase tracking-wider">
                                      <span>2️⃣</span>
                                      <span>เตรียมรายการสินค้าในร้านเพื่อนำขึ้นไลฟ์สด (Assign Live Products & SKU Codes)</span>
                                    </h5>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      เลือกสินค้าที่จะเสนอขายในไลฟ์ และระบุรหัสสินค้าสั้น (เช่น A1, A2) ให้ผู้เข้าชมพิมพ์รหัสสั่งซื้อได้ทันที
                                    </p>
                                  </div>
                                  <span className="text-xs font-extrabold text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-xl shrink-0">
                                    เลือกแล้ว {livePrepCatalog.length} รายการ
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                                  {myApprovedProducts.length === 0 ? (
                                    <div className="col-span-full py-8 text-center text-slate-500 text-xs bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                                      <p>ยังไม่พบสินค้าในคลังร้านค้าของคุณ ({activeStoreName})</p>
                                      <button
                                        type="button"
                                        onClick={() => setSellerPortalSubTab('products')}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                                      >
                                        ➕ ไปที่เมนู "สินค้าของฉัน" เพื่อเพิ่มสินค้า
                                      </button>
                                    </div>
                                  ) : (
                                    myApprovedProducts.map((prod: any, idx: number) => {
                                      const isSelected = livePrepCatalog.some((item: any) => item.id === prod.id);
                                      const currentItem = livePrepCatalog.find((item: any) => item.id === prod.id);
                                      const defaultSku = `A${idx + 1}`;

                                      return (
                                        <div
                                          key={prod.id}
                                          className={`p-3 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                                            isSelected
                                              ? 'bg-rose-950/40 border-rose-500/80 shadow-md'
                                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <img
                                              src={prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
                                              alt={prod.name}
                                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <h6 className="text-xs font-bold text-white truncate">{prod.name}</h6>
                                              <p className="text-[11px] font-mono font-black text-rose-400">฿ {(prod.price || 0).toLocaleString()}</p>
                                            </div>
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setLivePrepCatalog((prev) => [
                                                    ...prev,
                                                    {
                                                      id: prod.id,
                                                      name: prod.name,
                                                      price: prod.price,
                                                      image: prod.image || (prod.images && prod.images[0]),
                                                      skuCode: defaultSku
                                                    }
                                                  ]);
                                                } else {
                                                  setLivePrepCatalog((prev) => prev.filter((item: any) => item.id !== prod.id));
                                                  if (livePrepActiveSpotlight?.id === prod.id) {
                                                    setLivePrepActiveSpotlight(null);
                                                  }
                                                }
                                              }}
                                              className="w-5 h-5 accent-rose-600 rounded cursor-pointer shrink-0"
                                            />
                                          </div>

                                          {isSelected && (
                                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] gap-2">
                                              <span className="text-slate-400 font-medium shrink-0">รหัสสั่งซื้อ (SKU):</span>
                                              <input
                                                type="text"
                                                value={currentItem?.skuCode || defaultSku}
                                                onChange={(e) => {
                                                  const val = e.target.value.toUpperCase();
                                                  setLivePrepCatalog((prev) =>
                                                    prev.map((item: any) => (item.id === prod.id ? { ...item, skuCode: val } : item))
                                                  );
                                                }}
                                                className="bg-black border border-rose-500/50 rounded-lg px-2 py-1 text-xs text-rose-300 font-mono font-bold w-20 text-center focus:outline-none"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Step 3: Active Spotlight Item Picker */}
                              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                                <div>
                                  <h5 className="text-xs font-black text-rose-300 flex items-center gap-2 uppercase tracking-wider">
                                    <span>3️⃣</span>
                                    <span>เลือกสินค้าปักตะกร้าเดี่ยวแสดงเน้นหน้าจอขณะเริ่มไลฟ์ (Active Spotlight Item)</span>
                                  </h5>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    เลือกสินค้า 1 ชิ้นที่จะแสดงเด่นตรงมุมวิดีโอถ่ายทอดสด เมื่อเริ่มสตรีมแล้ว คุณจะสามารถกดสลับเปลี่ยนได้แบบเรียลไทม์
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                                  {livePrepCatalog.length === 0 ? (
                                    <div className="text-xs text-slate-500 italic py-2">
                                      กรุณาเลือกสินค้าในขั้นตอนที่ 2 ด้านบนก่อนค่ะ
                                    </div>
                                  ) : (
                                    livePrepCatalog.map((item: any) => {
                                      const isSpotlight = livePrepActiveSpotlight?.id === item.id;
                                      return (
                                        <button
                                          key={item.id}
                                          type="button"
                                          onClick={() => setLivePrepActiveSpotlight(item)}
                                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-3 min-w-[220px] transition cursor-pointer shrink-0 ${
                                            isSpotlight
                                              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                                              : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                                          }`}
                                        >
                                          <img
                                            src={item.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
                                            alt={item.name}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/20"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                              <span className="text-[9px] bg-black/40 font-mono font-black px-1.5 py-0.5 rounded text-amber-300">
                                                {item.skuCode}
                                              </span>
                                              <span className="text-[10px] font-bold truncate">{item.name}</span>
                                            </div>
                                            <p className="text-[10px] font-extrabold mt-0.5 text-white">฿ {(item.price || 0).toLocaleString()}</p>
                                          </div>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Start Live Stream Button */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={handleCreateLiveStreamFromPrep}
                                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black py-4 rounded-2xl text-sm transition shadow-xl transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-rose-400/40"
                                >
                                  <span className="text-xl">🔴</span>
                                  <span>ยืนยันข้อมูลและเปิดห้องถ่ายทอดสดทันที (Go Live Now)</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* IF SELLER IS CURRENTLY LIVE: LIVE CONTROL CENTER */
                            <div className="space-y-6 animate-fadeIn">
                              {/* Live Stream Status Control Card */}
                              <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl font-black shadow-lg animate-pulse">
                                    🔴
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-black text-white">{sellerActiveLiveStream.title}</h5>
                                    <div className="flex items-center gap-3 text-xs text-rose-300 mt-0.5">
                                      <span>👁️ ผู้ชมขณะนี้: <strong>{sellerActiveLiveStream.viewersCount || 18} คน</strong></span>
                                      <span>•</span>
                                      <span>📌 สินค้าในคลังไลฟ์: <strong>{sellerActiveLiveStream.liveProductsCatalog?.length || 0} รายการ</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleEndLiveStream(sellerActiveLiveStream.id)}
                                  className="bg-slate-800 hover:bg-rose-700 border border-rose-500/50 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
                                >
                                  <span>⏹️</span>
                                  <span>ปิดการถ่ายทอดสด (End Live Stream)</span>
                                </button>
                              </div>

                              {/* Live Spotlight Switcher Panel */}
                              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h6 className="text-xs font-black text-rose-300 flex items-center gap-2">
                                    <span>📌</span>
                                    <span>สลับสินค้าปักตะกร้าเดี่ยวบนหน้าจอผู้ชมแบบเรียลไทม์ (Live Spotlight Item Switcher)</span>
                                  </h6>
                                  <span className="text-[10px] text-slate-400">กดเพื่อสลับปักตะกร้าเดี่ยวขึ้นหน้าจอ</span>
                                </div>

                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                                  {(!sellerActiveLiveStream.liveProductsCatalog || sellerActiveLiveStream.liveProductsCatalog.length === 0) ? (
                                    <div className="text-xs text-slate-500 py-2">ยังไม่มีรายการสินค้าในคลังไลฟ์สด</div>
                                  ) : (
                                    sellerActiveLiveStream.liveProductsCatalog.map((item: any) => {
                                      const isCurrentSpot = sellerActiveLiveStream.activeSpotlightProduct?.id === item.id;
                                      return (
                                        <button
                                          key={item.id}
                                          type="button"
                                          onClick={() => handleSwitchSpotlightLive(item, sellerActiveLiveStream.id)}
                                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 min-w-[200px] transition cursor-pointer shrink-0 ${
                                            isCurrentSpot
                                              ? 'bg-rose-600 border-rose-300 text-white shadow-lg ring-2 ring-rose-400'
                                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                          }`}
                                        >
                                          <img
                                            src={item.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
                                            alt={item.name}
                                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                              <span className="text-[9px] bg-black/50 font-mono font-bold px-1 rounded text-amber-300">
                                                {item.skuCode}
                                              </span>
                                              <span className="text-[10px] font-bold truncate">{item.name}</span>
                                            </div>
                                            <p className="text-[10px] font-mono text-white mt-0.5">฿ {(item.price || 0).toLocaleString()}</p>
                                          </div>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Real-time Studio Chat Feed */}
                              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                  <h6 className="text-xs font-black text-slate-200 flex items-center gap-2">
                                    <span>💬</span>
                                    <span>แชทสดผู้ชม & AI Moderation Feed</span>
                                  </h6>
                                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                    🤖 AI ช่วยตรวจจับรหัสสั่งซื้อและคัดกรองข้อความ
                                  </span>
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                                  {(!sellerActiveLiveStream.chatMessages || sellerActiveLiveStream.chatMessages.length === 0) ? (
                                    <div className="text-center text-slate-500 py-6">ยังไม่มีข้อความสนทนา</div>
                                  ) : (
                                    sellerActiveLiveStream.chatMessages.map((msg: any) => (
                                      <div
                                        key={msg.id}
                                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 ${
                                          msg.matchedSkuCode
                                            ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                                            : msg.aiBlocked
                                            ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                                            : 'bg-slate-900 border-slate-800 text-slate-200'
                                        }`}
                                      >
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                          <div className="flex items-center gap-2 text-[10px]">
                                            <span className="font-bold text-rose-300">{msg.sender}</span>
                                            <span className="text-slate-500">{msg.time}</span>
                                            {msg.matchedSkuCode && (
                                              <span className="bg-emerald-500 text-slate-950 font-mono font-black text-[9px] px-1.5 py-0.2 rounded">
                                                🛒 พิมพ์รหัสสั่งซื้อ: {msg.matchedSkuCode}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] leading-relaxed">{msg.text}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center max-w-2xl space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-base font-bold text-rose-600">❌ คำขอเปิดร้านค้าไม่ได้รับการอนุมัติ</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mt-2">
                    ขออภัยค่ะ คำขอเปิดร้านค้าออนไลน์ของท่านไม่ผ่านเกณฑ์การตรวจสอบจากผู้ดูแลระบบ เนื่องจากข้อมูลพิกัดคลังสินค้าหรือที่อยู่จัดส่งยังไม่ครบถ้วนหรือไม่สอดคล้องตามเกณฑ์ความปลอดภัยค่ะ
                  </p>
                  <p className="text-xs text-slate-500 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100/50 max-w-md mx-auto">
                    ท่านสามารถติดต่อฝ่ายบริการลูกค้า หรือปรับปรุงข้อมูลพิกัด/ที่อยู่คลังสินค้าใหม่ และกดยื่นคำสมัครเปิดร้านค้าใหม่อีกครั้งได้ทันทีค่ะ
                  </p>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/seller/reset-status', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: currentUser.userId })
                        });
                        const d = await res.json();
                        if (d.success) {
                          setProfile((prev: any) => ({ ...prev, sellerStatus: 'NotApplied' }));
                        } else {
                          alert(d.message);
                        }
                      } catch (err) {
                        console.error("Error resetting seller status:", err);
                      }
                    }}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    ปรับปรุงที่อยู่และสมัครใหม่อีกครั้ง
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ADMIN CONSOLE VIEW */}
          {(activeTab === 'admin' && (currentUser?.role === 'Admin' || currentUser?.role === 'Manager')) && (
            <div className="space-y-6 animate-fadeIn max-w-6xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-rose-600 flex items-center gap-2">
                    <Settings size={26} /> แผงควบคุมตรวจอนุมัติหลังบ้านระบบ (Admin Desk)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">บริหารคิวธุรกรรม รอตรวจเอกสารแนบ KYC อนุมัติเบิกเงินสดและกิจกรรม CSR</p>
                </div>
                
                <button 
                  onClick={fetchAdminQueues}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} className="animate-spin" /> รีเฟรชดึงข้อมูลคิวงาน
                </button>
              </div>

              {/* Three Main System Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAdminSection('members_system');
                    setAdminSubTab('queues');
                  }}
                  className={`p-4 rounded-3xl text-left transition-all duration-300 border relative overflow-hidden cursor-pointer ${
                    adminSection === 'members_system'
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20'
                      : 'bg-white border-slate-100 hover:border-rose-200 text-slate-700 hover:bg-rose-50/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      adminSection === 'members_system' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-500'
                    }`}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm">จัดการระบบสมาชิก Natee Plus</h3>
                      <p className={`text-[10px] mt-0.5 ${
                        adminSection === 'members_system' ? 'text-rose-100' : 'text-slate-400'
                      }`}>สรุปถอนเงิน, ข้อมูล, อนุมัติสมาชิก & E-Cash</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminSection('seller_system');
                    setAdminSubTab('manageShops');
                  }}
                  className={`p-4 rounded-3xl text-left transition-all duration-300 border relative overflow-hidden cursor-pointer ${
                    adminSection === 'seller_system'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-700 hover:bg-indigo-50/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      adminSection === 'seller_system' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm">จัดการระบบ Natee Partner</h3>
                      <p className={`text-[10px] mt-0.5 ${
                        adminSection === 'seller_system' ? 'text-indigo-100' : 'text-slate-400'
                      }`}>จัดการร้าน, จัดส่ง, สถานะสินค้า & สรุปยอดจ่าย</p>
                    </div>
                  </div>
                </button>

                {(profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSection('admin_console');
                      setAdminSubTab('manageRegulations');
                      fetchSellerRegulationsText();
                    }}
                    className={`p-4 rounded-3xl text-left transition-all duration-300 border relative overflow-hidden cursor-pointer ${
                      adminSection === 'admin_console'
                        ? 'bg-slate-800 border-slate-700 text-white shadow-lg shadow-slate-800/20'
                        : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700 hover:bg-slate-50/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        adminSection === 'admin_console' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Settings size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">Admin Console</h3>
                        <p className={`text-[10px] mt-0.5 ${
                          adminSection === 'admin_console' ? 'text-slate-200' : 'text-slate-400'
                        }`}>ระเบียบผู้ขาย, ตั้งค่าธนาคาร, รีเซ็ตระบบ และควบคุมส่วนกลาง</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Admin Submenu rendered based on active adminSection */}
              <div className="flex flex-wrap gap-2 mb-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                {adminSection === 'members_system' && (
                  <>
                    <button 
                      onClick={() => setAdminSubTab('queues')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                        adminSubTab === 'queues' ? 'bg-rose-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📊 สรุปสถิติ & ถอนเงิน
                      {withQueue.length > 0 && (
                        <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                          {withQueue.length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('members')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'members' ? 'bg-rose-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      👥 ข้อมูลสมาชิก
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('memberApprovals')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                        adminSubTab === 'memberApprovals' ? 'bg-rose-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📋 อนุมัติสมาชิกใหม่
                      {kycQueue.length > 0 && (
                        <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                          {kycQueue.length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('depositApprove')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                        adminSubTab === 'depositApprove' 
                          ? 'bg-rose-600 text-white shadow-md' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      💰 อนุมัติ E-Cash
                      {depositQueue.length > 0 && (
                        <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                          {depositQueue.length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('analytics')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        adminSubTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📊 ศูนย์วิเคราะห์ข้อมูลและกราฟสถิติ
                    </button>
                  </>
                )}

                {adminSection === 'seller_system' && (
                  <>
                    <button 
                      onClick={() => setAdminSubTab('manageShops')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                        adminSubTab === 'manageShops' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      🏪 จัดการร้านค้า
                      {(() => {
                        const totalPending = adminMembersList.filter((m: any) => m.sellerStatus === 'Pending').length;
                        return totalPending > 0 ? (
                          <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                            {totalPending}
                          </span>
                        ) : null;
                      })()}
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('productApprovals')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                        adminSubTab === 'productApprovals' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📦 อนุมัติรายการสินค้า
                      {(prodQueue?.length || 0) > 0 && (
                        <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                          {prodQueue.length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('shippingApprove')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                        adminSubTab === 'shippingApprove' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      🚚 อนุมัติ การจัดส่งสินค้า
                      {adminOrders.filter((o: any) => o.status === "Processing").length > 0 && (
                        <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                          {adminOrders.filter((o: any) => o.status === "Processing").length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('orderStatus')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        adminSubTab === 'orderStatus' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📦 จัดการสถานะสินค้า
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('couponPv')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative cursor-pointer ${
                        adminSubTab === 'couponPv' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      🎟️ สรุปรายการจ่ายร้านค้า ({pendingCouponPv.length})
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('memberShopInfo')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative cursor-pointer ${
                        adminSubTab === 'memberShopInfo' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      👥 ข้อมูลสมาชิกร้านค้า
                    </button>

                    <button 
                      onClick={() => {
                        setAdminSubTab('manageRegulations');
                        fetchSellerRegulationsText();
                      }} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative cursor-pointer ${
                        adminSubTab === 'manageRegulations' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📝 Admin Console (ระเบียบผู้ขาย)
                    </button>

                    <button 
                      onClick={() => setAdminSubTab('analytics')} 
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        adminSubTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      📊 ศูนย์วิเคราะห์ข้อมูลและกราฟสถิติ
                    </button>
                  </>
                )}

                 {adminSection === 'admin_console' && (
                   <>
                     <button 
                       onClick={() => {
                         setAdminSubTab('manageRegulations');
                         fetchSellerRegulationsText();
                       }} 
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative cursor-pointer ${
                         adminSubTab === 'manageRegulations' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                       }`}
                     >
                       📝 จัดการระเบียบข้อบังคับผู้ขาย
                      </button>

                      <button 
                        onClick={() => setAdminSubTab('promoPopupConfig')} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          adminSubTab === 'promoPopupConfig' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        🎁 ตั้งค่า Pop-Up ส่วนลดพิเศษ
                     </button>

                     <button 
                        onClick={() => setAdminSubTab('botConfig')} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          adminSubTab === 'botConfig' ? 'bg-cyan-600 text-white shadow-md font-black' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        🤖 ตั้งค่า AI Chatbot & PDF
                     </button>

                     {(profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                       <button 
                         onClick={() => setAdminSubTab('systemReset')} 
                         className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                           adminSubTab === 'systemReset' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                         }`}
                       >
                         ⚙️ รีเซ็ตระบบ
                       </button>
                     )}
 
                     <button 
                       onClick={() => setAdminSubTab('systemConditions')} 
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                         adminSubTab === 'systemConditions' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                       }`}
                     >
                       📋 เงื่อนไขระบบ (ค่าคอมมิชชั่น)
                     </button>
 
                     <button 
                       onClick={() => setAdminSubTab('packageChoices')} 
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                         adminSubTab === 'packageChoices' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                       }`}
                     >
                       📦 จัดการสินค้าแพ็กเกจ
                     </button>
 
                     <button 
                       onClick={() => setAdminSubTab('companyAccountingReport')} 
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                         adminSubTab === 'companyAccountingReport' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                       }`}
                     >
                       📈 รายงานระบบบัญชีบริษัท
                     </button>

                     <button 
                       onClick={() => setAdminSubTab('analytics')} 
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                         adminSubTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                       }`}
                     >
                       📊 ศูนย์วิเคราะห์ข้อมูลและกราฟสถิติ
                     </button>
 
                     {(profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                       <>
                         <button 
                           onClick={() => setAdminSubTab('bankSettings')} 
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                             adminSubTab === 'bankSettings' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                           }`}
                         >
                           🏦 ตั้งค่าธนาคาร / ระบบแจ้งเตือน (LINE)
                         </button>
                         <button 
                           onClick={() => setAdminSubTab('featureToggles')} 
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                             adminSubTab === 'featureToggles' ? 'bg-amber-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                           }`}
                         >
                           🎛️ เปิด-ปิด ฟีเจอร์ระบบอิสระ
                         </button>
                         <button 
                           onClick={() => setAdminSubTab('maintenance')} 
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                             adminSubTab === 'maintenance' ? 'bg-slate-800 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700'
                           }`}
                         >
                           ⏸️ พักหน้าจอ (Manager)
                         </button>
                       </>
                     )}
                   </>
                 )}
              </div>

              {adminSubTab === 'queues' && (
                <>
                {/* Ledger Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-bold text-slate-600">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">ภาษีสะสมรอนำส่งสรรพากร</span>
                  <strong className="text-base text-slate-800">฿ {adminStats?.taxReserves?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">ยอดสำรองกองทุนแผน B</span>
                  <strong className="text-base text-indigo-600">฿ {adminStats?.planBReserves?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">ยอดเงินกองทุน CSR ปัจจุบัน</span>
                  <strong className="text-base text-rose-600 font-extrabold">฿ {adminStats?.csrBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">ค่าฟีและกำไรสุทธิบริษัท</span>
                  <strong className="text-base text-slate-900">฿ {adminStats?.companyProfits?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
                  <span className="text-[10px] text-emerald-800 block mb-1">เงินหมุนเวียน E-Cash ทั้งระบบ</span>
                  <strong className="text-base text-emerald-600 font-extrabold">฿ {adminStats?.memberECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>

              {/* Admin Double authorization (CSR Fund withdrawal with Manager Approval Key OTP) */}
              <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  🛡️ ถอนเงินออกจากกองทุนปันสุข CSR (ต้องผ่านรหัสกุญแจร่วม Manager OTP)
                </h3>
                <form onSubmit={handleCsrWithdraw} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-700">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">จำนวนเงินถอน (บาท)</label>
                    <input 
                      type="number" 
                      required
                      value={csrWithAmt}
                      onChange={(e) => setCsrWithAmt(e.target.value)}
                      placeholder="ระบุยอดถอน"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">วัตถุประสงค์เพื่อสาธารณประโยชน์</label>
                    <input 
                      type="text" 
                      required
                      value={csrWithPurpose}
                      onChange={(e) => setCsrWithPurpose(e.target.value)}
                      placeholder="เช่น มอบทุนอาหารกลางวัน รร."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">รหัส OTP อนุมัติร่วม (Manager OTP)</label>
                    <input 
                      type="password" 
                      required
                      value={csrManagerOtp}
                      onChange={(e) => setCsrManagerOtp(e.target.value)}
                      placeholder="กรอกคีย์หลัก (Default: 123456)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-wider"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl transition cursor-pointer">
                      อนุมัติทำรายการถอนเงิน CSR
                    </button>
                  </div>
                </form>
              </div>

              {/* Withdrawals pending list */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    💸 ตารางอนุมัติเบิกยอดเงินรายได้สมาชิก (Bank Withdrawal Queue)
                  </h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {featureToggles.enableSCBNetPayout !== false && (
                      <button
                        type="button"
                        onClick={() => exportSCBPayoutBatch(withQueue)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        🏦 ส่งออก Batch โอน SCB Business Net (.CSV)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (withQueue.length === 0) {
                          showNotif('ไม่มีคำขอถอนเงินในคิวที่จะส่งออก CSV ค่ะ', 'warning');
                          return;
                        }
                        const headers = ['รหัสรายการ', 'รหัสสมาชิก', 'ยอดถอน (บาท)', 'หักสำรอง 20%', 'หัก ณ ที่จ่าย 3%', 'ค่าธรรมเนียม 2%', 'ยอดโอนจริง (บาท)', 'รายละเอียดบัญชี', 'สถานะ', 'วันที่'];
                        const rows = withQueue.map((item: any) => [
                          item.id,
                          item.userId,
                          item.amount || 0,
                          item.autoReserve || 0,
                          item.withholdingTax || 0,
                          item.companyFee || 0,
                          item.netAmount || 0,
                          item.details || '-',
                          item.status || 'Pending',
                          new Date(item.createdAt).toLocaleString('th-TH')
                        ]);
                        exportToCsv(`eMoney_Withdrawal_Queue_${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
                        showNotif('ส่งออกรายงานยอดถอน e-Money เป็นไฟล์ CSV เรียบร้อยแล้วค่ะ 📥', 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-xl transition cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      📥 ส่งออก CSV รายงานถอนเงิน
                    </button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 text-xs text-slate-700">
                  {withQueue.length > 0 ? (
                    withQueue.map(item => (
                      <div key={item.id} className="border border-slate-100 p-3 rounded-2xl bg-slate-50 flex justify-between items-center gap-4">
                        <div>
                          <span className="font-mono font-bold text-rose-600 text-[10px]">{item.id}</span>
                          <h5 className="font-bold text-slate-800 mt-0.5">ยอดเบิกถอน: ฿ {item.amount?.toLocaleString()} บาท</h5>
                          <p className="text-[10px] text-emerald-600 font-semibold">โอนเข้าบัญชีจริง: ฿ {item.netAmount?.toFixed(2)} บาท</p>
                          <p className="text-[9px] text-slate-400">{item.details}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <select
                            value={withDeductions[item.id] || "Tax"}
                            onChange={(e) => setWithDeductions(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="bg-white border border-slate-200 rounded-lg text-[10px] px-2 py-1 font-semibold focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="Tax">หักภาษี ณ ที่จ่าย (จ่ายภาษี)</option>
                            <option value="Profit">หักเข้าบริษัท (กำไรสุทธิ)</option>
                            <option value="None">ไม่หัก (โอนเต็มจำนวน)</option>
                          </select>
                          <button 
                            onClick={() => handleWithApprove(item.id, withDeductions[item.id] || "Tax")}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition text-center"
                          >
                            อนุมัติโอนแล้ว
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8">ไม่มีคำขอถอนเงินปันผลค้างรอในพอร์ทัล</p>
                  )}
                </div>
              </div>

              {/* Member Management Console */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    👥 ระบบค้นหาและจัดการแก้ไขข้อมูลสมาชิกทั้งหมด
                  </h4>
                  <div className="relative max-w-md w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                      <Search size={14} />
                    </span>
                    <input 
                      type="text" 
                      placeholder="ค้นหาด้วย ชื่อ, นามสกุล, Username, รหัสสมาชิก, เลขบัตร..."
                      value={searchMemberQuery}
                      onChange={(e) => setSearchMemberQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Google Sheets Sync/Export Banner */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-sm shrink-0">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        📊 ส่งออกและแชร์ข้อมูลสมาชิกไปยัง Google Sheet
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {googleSheetsUser ? (
                          <span>เชื่อมต่อกับบัญชี Google: <strong className="text-slate-700 font-semibold">{googleSheetsUser.email}</strong> แล้วค่ะ</span>
                        ) : (
                          <span>เชื่อมต่อกับ Google เพื่อสร้าง Google Sheet บันทึกและแชร์รายชื่อสมาชิก (พร้อมข้อมูลสมัคร, ตำแหน่ง, ยอดสะสม) แบบอัตโนมัติ</span>
                        )}
                      </p>
                      {exportedSheetUrl && (
                        <a 
                          href={exportedSheetUrl} 
                          target="_blank" 
                          rel="noreferrer noopener" 
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-500 font-bold underline"
                        >
                          🟢 เปิดลิงก์ Google Sheet ที่แชร์สำเร็จล่าสุด ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={isExportingToSheets}
                      onClick={handleExportToGoogleSheets}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/10"
                    >
                      {isExportingToSheets ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>กำลังส่งออก...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet size={13} />
                          <span>{googleSheetsUser ? 'บันทึก/อัปเดตไป Google Sheet' : 'เชื่อมต่อ & บันทึก Google Sheet'}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadMembersCsv}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="ดาวน์โหลดไฟล์ CSV สามารถนำไปเปิดใน Excel หรือ Import เข้า Google Sheets ได้ทันที"
                    >
                      <FileText size={13} />
                      <span>ดาวน์โหลด CSV / Excel</span>
                    </button>
                    {googleSheetsUser && (
                      <button
                        type="button"
                        onClick={handleDisconnectGoogleSheets}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[11px] px-3 py-2 rounded-xl transition cursor-pointer"
                      >
                        ยกเลิกเชื่อมต่อ
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  {(() => {
                    const filteredMembers = adminMembersList.filter(m => {
                      const q = searchMemberQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        m.userId?.toLowerCase().includes(q) ||
                        m.username?.toLowerCase().includes(q) ||
                        m.sponsorId?.toLowerCase().includes(q) ||
                        m.name?.toLowerCase().includes(q) ||
                        m.surname?.toLowerCase().includes(q) ||
                        m.phone?.includes(q) ||
                        m.idCard?.includes(q) ||
                        m.email?.toLowerCase().includes(q)
                      );
                    });
                    const itemsPerPage = 20;
                    const startIndex = (adminMembersPage - 1) * itemsPerPage;
                    const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

                    return (
                      <>
                        <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                          <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                            <tr>
                              <th className="px-4 py-3">รหัสสมาชิก / Username</th>
                              <th className="px-4 py-3">ผู้แนะนำ (Sponsor)</th>
                              <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                              <th className="px-4 py-3">เบอร์โทร / อีเมล</th>
                              <th className="px-4 py-3">ระดับ / สิทธิ์</th>
                              <th className="px-4 py-3 text-right">กระเป๋าคงเหลือ / ยอดสะสมทั้งหมด</th>
                              <th className="px-4 py-3 text-center">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {paginatedMembers.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400">
                                  ไม่พบข้อมูลสมาชิกในระบบ
                                </td>
                              </tr>
                            ) : (
                              paginatedMembers.map(member => (
                                <tr key={member.userId} className="hover:bg-slate-50 transition">
                                  <td className="px-4 py-3 font-semibold">
                                    <span className="text-rose-600 block font-mono font-bold text-[10px]">{member.userId}</span>
                                    <span className="text-slate-500 font-mono text-[11px]">@{member.username}</span>
                                    <span className="text-[9px] text-slate-400 block font-medium mt-1" title="วันที่สมัคร">
                                      📅 {member.createdAt ? new Date(member.createdAt).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-indigo-600 block font-mono font-bold text-[11px]">{member.sponsorId || '-'}</span>
                                    {member.sponsorId && member.sponsorId !== 'SYSTEM' && (
                                      <span className="text-[10px] text-slate-400 block font-medium">
                                        {(() => {
                                          const s = adminMembersList.find(x => x.userId === member.sponsorId);
                                          return s ? `@${s.username}` : '';
                                        })()}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-slate-900">
                                    {member.name} {member.surname}
                                    <span className="block text-[10px] text-slate-400">เลขบัตร: {member.idCard || "-"}</span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">
                                    <span className="block">{member.phone}</span>
                                    <span className="block text-[10px] text-slate-400">{member.email || "-"}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 block mb-1 w-max">
                                      {member.rank || "S"}
                                    </span>
                                    <span className="block text-[10px] text-slate-400 font-bold">สิทธิ์: {member.role || "Member"}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold">
                                    <div className="mb-1.5">
                                      <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none mb-0.5">คงเหลือ</span>
                                      <span className="block text-emerald-600 font-bold text-xs">E-Cash: {member.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-purple-600 font-bold text-[10px]">E-Money: {(member.balanceEMoney || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-indigo-500 font-bold text-[10px]">Coupon: {member.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="pt-1 border-t border-slate-100">
                                      <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none mb-0.5">สะสมทั้งหมด</span>
                                      <span className="block text-emerald-700 font-bold text-[11px]">รายได้สะสม: {(member.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-indigo-600 font-bold text-[10px]">คูปองสะสม: {(member.totalCouponsEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                      <button 
                                        onClick={() => {
                                          setEditingMember({ ...member });
                                          setOriginalMember({ ...member });
                                          setShowEditMemberModal(true);
                                        }}
                                        className="w-full bg-slate-800 hover:bg-rose-600 text-white hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer text-center"
                                      >
                                        แก้ไขข้อมูล
                                      </button>
                                      <button 
                                        onClick={() => {
                                          triggerConfirm(
                                            "ยืนยันการสวมสิทธิ์",
                                            `คุณต้องการสวมสิทธิ์เพื่อเข้าใช้งานระบบในฐานะคุณ ${member.name} ใช่หรือไม่?`,
                                            () => {
                                              setOriginalAdmin(currentUser);
                                              const targetMember = member;
                                              setCurrentUser(targetMember);
                                              // setProfile(targetMember);
                                              if (sellerSessionUser && sellerSessionUser.userId !== targetMember.userId) {
                                                setSellerSessionUser(null);
                                              }
                                              profileFetchedAt.current = 0;
                                              setActiveTab('dash');
                                              showNotif(`สวมสิทธิ์เข้าใช้งานในฐานะ @${member.username} สำเร็จ! ✨`, 'success');
                                            }
                                          );
                                        }}
                                        className="w-full bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer text-center"
                                      >
                                        👤 เปิดหน้าสมาชิก
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                          <TablePagination currentPage={adminMembersPage} totalItems={filteredMembers.length} itemsPerPage={itemsPerPage} onPageChange={setAdminMembersPage} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* ADMIN ORDERS & SHIPPING LEDGER */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  🚚 รายการสั่งซื้อของขวัญแพ็กเกจและสินค้าทั่วไป (Orders & Shipment Ledger)
                </h4>

                {/* Search & Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">เลขที่บิลสั่งซื้อ (Order ID)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น ORD_..."
                      value={orderSearchId}
                      onChange={(e) => setOrderSearchId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">รหัสผู้สั่งซื้อ (User ID)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น MB_..."
                      value={orderSearchUserId}
                      onChange={(e) => setOrderSearchUserId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">วันที่สั่งซื้อ (ปี-เดือน-วัน)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น 2026-07"
                      value={orderSearchDate}
                      onChange={(e) => setOrderSearchDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">สถานะการจัดส่ง</label>
                    <select
                      value={orderSearchStatus}
                      onChange={(e) => setOrderSearchStatus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-rose-500 outline-none font-semibold text-slate-700"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="Processing">รอดำเนินการ (Processing)</option>
                      <option value="Completed">จัดส่งเรียบร้อย (Completed)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  {(() => {
                    const filteredOrders = adminOrders.filter(order => {
                      const matchesId = !orderSearchId || order.id.toLowerCase().includes(orderSearchId.toLowerCase());
                      const matchesUserId = !orderSearchUserId || order.userId.toLowerCase().includes(orderSearchUserId.toLowerCase());
                      const matchesDate = !orderSearchDate || order.createdAt.includes(orderSearchDate) || new Date(order.createdAt).toLocaleString('th-TH').includes(orderSearchDate);
                      const matchesStatus = !orderSearchStatus || order.status === orderSearchStatus;
                      return matchesId && matchesUserId && matchesDate && matchesStatus;
                    });
                    const itemsPerPage = 20;
                    const startIndex = (adminOrdersSearchPage - 1) * itemsPerPage;
                    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

                    return (
                      <>
                        <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                          <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                            <tr>
                              <th className="px-4 py-3">รหัสบิล / วันที่สั่งซื้อ</th>
                              <th className="px-4 py-3">ผู้สั่งซื้อ (User ID)</th>
                              <th className="px-4 py-3">รายการสินค้า / ชุดสินค้าเลือก</th>
                              <th className="px-4 py-3 text-right">ยอดชำระ / PV</th>
                              <th className="px-4 py-3">ที่อยู่จัดส่งสินค้า</th>
                              <th className="px-4 py-3 text-center">สถานะ</th>
                              <th className="px-4 py-3 text-center">ใบเสร็จ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                            {paginatedOrders.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400">
                                  ไม่มีประวัติการสั่งซื้อสินค้าใดๆ ในขณะนี้
                                </td>
                              </tr>
                            ) : (
                              paginatedOrders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-4 py-3">
                                    <span className="font-mono font-bold text-indigo-600 block">{order.id}</span>
                                    <span className="text-[9px] text-slate-400 block">{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-slate-800">
                                    {order.userId}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="font-bold block text-slate-900">{order.productName}</span>
                                    {order.selectedChoiceName && (
                                      <span className="inline-block mt-1 bg-amber-50 text-amber-800 border border-amber-100 text-[9px] px-2 py-0.5 rounded font-bold">
                                        🎁 เซ็ตที่เลือก: {order.selectedChoiceName}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold">
                                    <span className="text-emerald-600 block">฿ {order.totalPrice?.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block">+{order.totalPv} PV</span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 leading-normal max-w-xs truncate" title={order.shippingAddress}>
                                    {order.shippingAddress || "ไม่มีข้อมูลที่อยู่"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {order.status === "Processing" ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                                          รอดำเนินการ
                                        </span>
                                        <button 
                                          onClick={() => handleCompleteOrder(order.id)}
                                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded text-[9px] cursor-pointer mt-1"
                                        >
                                          ยืนยันการจัดส่งแล้ว
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                        จัดส่งเรียบร้อย
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedReceiptOrder(order)}
                                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                                    >
                                      📄 ดู/ปริ๊นใบเสร็จ
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        {filteredOrders.length > itemsPerPage && (
                          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <TablePagination currentPage={adminOrdersSearchPage} totalItems={filteredOrders.length} itemsPerPage={itemsPerPage} onPageChange={setAdminOrdersSearchPage} />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
                </>
              )}

              {adminSubTab === 'members' && (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      👥 ระบบค้นหาและจัดการแก้ไขข้อมูลสมาชิกทั้งหมด
                    </h4>
                    {/* Button removed */}
                    <div className="relative max-w-md w-full">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <Search size={14} />
                      </span>
                      <input 
                        type="text" 
                        placeholder="ค้นหาด้วย ชื่อ, นามสกุล, Username, รหัสสมาชิก, เลขบัตร..."
                        value={searchMemberQuery}
                        onChange={(e) => {
                          setSearchMemberQuery(e.target.value);
                          setAdminMembersTabPage(1); // reset to page 1 on search
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {(() => {
                    const filtered = adminMembersList.filter(m => {
                      const q = searchMemberQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        m.userId?.toLowerCase().includes(q) ||
                        m.username?.toLowerCase().includes(q) ||
                        m.sponsorId?.toLowerCase().includes(q) ||
                        m.name?.toLowerCase().includes(q) ||
                        m.surname?.toLowerCase().includes(q) ||
                        m.phone?.includes(q) ||
                        m.idCard?.includes(q) ||
                        m.email?.toLowerCase().includes(q)
                      );
                    });
                    const itemsPerPage = 20;
                    const startIndex = (adminMembersTabPage - 1) * itemsPerPage;
                    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                    return (
                      <>
                        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                          <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                            <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                              <tr>
                                <th className="px-4 py-3">รหัสสมาชิก / Username</th>
                                <th className="px-4 py-3">ผู้แนะนำ (Sponsor)</th>
                                <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                                <th className="px-4 py-3">เบอร์โทร / อีเมล</th>
                                <th className="px-4 py-3">ระดับ / สิทธิ์</th>
                                <th className="px-4 py-3 text-right">E-Cash / E-Money / Coupon</th>
                                <th className="px-4 py-3 text-center">จัดการ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {paginated.length > 0 ? (
                                paginated.map(member => (
                                  <tr key={member.userId} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 font-semibold">
                                      <span className="text-rose-600 block font-mono font-bold text-[10px]">{member.userId}</span>
                                      <span className="text-slate-500 font-mono text-[11px]">@{member.username}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-indigo-600 block font-mono font-bold text-[11px]">{member.sponsorId || '-'}</span>
                                      {member.sponsorId && member.sponsorId !== 'SYSTEM' && (
                                        <span className="text-[10px] text-slate-400 block font-medium">
                                          {(() => {
                                            const s = adminMembersList.find(x => x.userId === member.sponsorId);
                                            return s ? `@${s.username}` : '';
                                          })()}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                      {member.name} {member.surname}
                                      <span className="block text-[10px] text-slate-400 font-normal">เลขบัตร: {member.idCard || "-"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 font-mono">
                                      <span className="block">{member.phone}</span>
                                      <span className="block text-[10px] text-slate-400">{member.email || "-"}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 block mb-1 w-max">
                                        {member.rank || "S"}
                                      </span>
                                      <span className="block text-[10px] text-slate-400 font-bold">สิทธิ์: {member.role || "Member"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                      <span className="block text-emerald-600 font-bold" title="E-Cash">💵 {member.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-[10px] text-amber-600 font-bold" title="E-Money">💰 {(member.balanceEMoney || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-[10px] text-indigo-500 font-bold" title="E-Coupon">🎟️ {member.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex flex-col gap-1 items-center justify-center">
                                        <button 
                                          onClick={() => {
                                            setEditingMember({ ...member });
                                            setOriginalMember({ ...member });
                                            setShowEditMemberModal(true);
                                          }}
                                          className="w-full bg-slate-800 hover:bg-rose-600 text-white hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer text-center"
                                        >
                                          แก้ไขข้อมูล
                                        </button>
                                        <button 
                                          onClick={() => {
                                            triggerConfirm(
                                              "ยืนยันการสวมสิทธิ์",
                                              `คุณต้องการสวมสิทธิ์เพื่อเข้าใช้งานระบบในฐานะคุณ ${member.name} ใช่หรือไม่?`,
                                              () => {
                                                setOriginalAdmin(currentUser);
                                                const targetMember = member;
                                                setCurrentUser(targetMember);
                                                // setProfile(targetMember);
                                                if (sellerSessionUser && sellerSessionUser.userId !== targetMember.userId) {
                                                  setSellerSessionUser(null);
                                                }
                                                profileFetchedAt.current = 0;
                                                setActiveTab('dash');
                                                showNotif(`สวมสิทธิ์เข้าใช้งานในฐานะ @${member.username} สำเร็จ! ✨`, 'success');
                                              }
                                            );
                                          }}
                                          className="w-full bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer text-center"
                                        >
                                          👤 เปิดหน้าสมาชิก
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="text-center py-8 text-slate-400">
                                    ไม่พบข้อมูลสมาชิกในระบบ
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {filtered.length > itemsPerPage && (
                          <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 mt-4">
                            <TablePagination currentPage={adminMembersTabPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setAdminMembersTabPage} />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {adminSubTab === 'memberApprovals' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* KYC Pending queue */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      📋 ตารางอนุมัติเอกสารสมัครสมาชิก (KYC Pending Queue)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 text-xs text-slate-700">
                      {(() => {
                        const itemsPerPage = 20;
                        const startIndex = (adminKycPage - 1) * itemsPerPage;
                        const paginatedKycQueue = kycQueue.slice(startIndex, startIndex + itemsPerPage);

                        return (
                          <>
                            {paginatedKycQueue.length > 0 ? (
                              paginatedKycQueue.map(item => (
                                <div key={item.userId} className="border border-slate-100 p-4 rounded-2xl bg-slate-50 flex flex-col justify-between gap-3">
                                  <div>
                                    <span className="font-mono font-bold text-indigo-600 text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded">{item.userId}</span>
                                    <h5 className="font-bold text-slate-800 mt-1">{item.name} {item.surname}</h5>
                                    <div className="mt-2 space-y-1 text-slate-500 text-[11px]">
                                      <p>บัตรประชาชน: {item.idCard}</p>
                                      <p>ธนาคาร: {item.bankName} (เลขที่ {item.bankAccount})</p>
                                    </div>
                                    {item.kycImgUrl && (
                                      <div className="flex gap-2 mt-3">
                                        <div className="relative group">
                                          <a 
                                            href={item.kycImgUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                                          >
                                            🔍 รูปบัตร ปชช.
                                          </a>
                                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-white p-2 rounded-2xl shadow-2xl border border-slate-200 w-64 pointer-events-none animate-fadeIn">
                                            <p className="text-[9px] text-slate-400 font-bold mb-1 text-center">พรีวิวรูปบัตรประชาชน (ชี้เพื่อพรีวิว / คลิกเพื่อดูรูปใหญ่)</p>
                                            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center max-h-48">
                                              <img 
                                                src={item.kycImgUrl} 
                                                alt="KYC ID Card Preview" 
                                                referrerPolicy="no-referrer"
                                                className="w-full h-auto object-contain"
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="relative group">
                                          <a 
                                            href={item.kycBookUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                                          >
                                            🔍 หน้าสมุดบัญชี
                                          </a>
                                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-white p-2 rounded-2xl shadow-2xl border border-slate-200 w-64 pointer-events-none animate-fadeIn">
                                            <p className="text-[9px] text-slate-400 font-bold mb-1 text-center">พรีวิวหน้าสมุดบัญชีธนาคาร (ชี้เพื่อพรีวิว / คลิกเพื่อดูรูปใหญ่)</p>
                                            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center max-h-48">
                                              <img 
                                                src={item.kycBookUrl} 
                                                alt="KYC Bank Book Preview" 
                                                referrerPolicy="no-referrer"
                                                className="w-full h-auto object-contain"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 border-t border-slate-200/60 pt-2">
                                    <button 
                                      onClick={() => {
                                        setKycRejectId(item.userId);
                                        setKycRejectReason('ข้อมูลเอกสารภาพถ่ายหรือบัญชีธนาคารไม่ถูกต้องชัดเจน');
                                      }}
                                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer"
                                    >
                                      ปฏิเสธเอกสาร
                                    </button>
                                    <button 
                                      onClick={() => handleKycApprove(item.userId)}
                                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-1.5 rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                                    >
                                      อนุมัติสมาชิก
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-2 text-slate-400 text-center py-8">ไม่มีคำขอเอกสาร KYC รอพิจารณาในขณะนี้</div>
                            )}
                            {kycQueue.length > itemsPerPage && (
                              <div className="col-span-full mt-4 pt-4 border-t border-slate-100">
                                <TablePagination currentPage={adminKycPage} totalItems={kycQueue.length} itemsPerPage={itemsPerPage} onPageChange={setAdminKycPage} />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Shipping Pins Pending Queue */}
                  {(() => {
                    const pendingPins = adminMembersList.filter((m: any) => m.shippingPinStatus === 'PendingApproval');
                    if (pendingPins.length === 0) return null;

                    return (
                      <div className="bg-white border border-rose-100 p-6 rounded-3xl shadow-sm space-y-4 animate-fadeIn border-l-4 border-l-rose-500">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            📍 ตารางอนุมัติการแก้ไขพิกัดแผนที่จัดส่ง ({pendingPins.length} รายการรออนุมัติ)
                          </h4>
                          <span className="bg-rose-100 text-rose-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                            ด่วนที่สุด
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2">
                          {pendingPins.map((m: any) => (
                            <div key={m.userId} className="border border-slate-200 p-4 rounded-2xl bg-slate-50 space-y-4 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-mono font-bold text-rose-600 text-[10px] bg-rose-50 px-1.5 py-0.5 rounded">@{m.username}</span>
                                    <h5 className="font-bold text-slate-900 mt-1">{m.name} {m.surname}</h5>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold">ID: {m.userId}</span>
                                </div>
                                <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                                  <p><b>ที่อยู่จัดส่งปัจจุบัน:</b> {m.shippingAddress || m.idAddress || "ไม่มีข้อมูล"}</p>
                                  <p className="font-mono text-[10px] text-indigo-600">
                                    📍 พิกัดปัจจุบัน: {m.shippingLat ? `${Number(m.shippingLat).toFixed(6)}, ${Number(m.shippingLng || 0).toFixed(6)}` : "ยังไม่เคยปักหมุด"}
                                  </p>
                                  <p className="font-mono text-[10px] text-rose-600 bg-rose-50/50 p-1.5 rounded border border-rose-100/50 mt-1">
                                    <b>📍 พิกัดใหม่ที่ต้องการขอแก้ไข:</b> {m.pendingShippingLat ? `${Number(m.pendingShippingLat).toFixed(6)}, ${Number(m.pendingShippingLng || 0).toFixed(6)}` : 'ยังไม่มีข้อมูล'}
                                  </p>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-200">
                                  <NateeWarehouseMap 
                                    lat={m.pendingShippingLat} 
                                    lng={m.pendingShippingLng} 
                                    readOnly={true}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex gap-2 border-t border-slate-200/60 pt-3">
                                <button 
                                  onClick={() => {
                                    triggerConfirm(
                                      "ปฏิเสธพิกัดจัดส่ง",
                                      `ต้องการปฏิเสธคำขอแก้ไขพิกัดจัดส่งของ ${m.name} ใช่หรือไม่?`,
                                      async () => {
                                        try {
                                          const res = await fetch('/api/admin/reject-shipping-pin', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId: m.userId })
                                          });
                                          const resData = await res.json();
                                          if (resData.success) {
                                            showNotif(resData.message, 'success');
                                          } else {
                                            showNotif(resData.message || 'เกิดข้อผิดพลาด', 'error');
                                          }
                                        } catch (err) {
                                          showNotif('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
                                        }
                                      }
                                    );
                                  }}
                                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-[10px] font-bold transition cursor-pointer"
                                >
                                  ❌ ปฏิเสธการแก้ไข
                                </button>
                                <button 
                                  onClick={() => {
                                    triggerConfirm(
                                      "อนุมัติพิกัดจัดส่ง",
                                      `ต้องการอนุมัติพิกัดแผนที่จัดส่งใหม่ของ ${m.name} ใช่หรือไม่?`,
                                      async () => {
                                        try {
                                          const res = await fetch('/api/admin/approve-shipping-pin', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId: m.userId })
                                          });
                                          const resData = await res.json();
                                          if (resData.success) {
                                            showNotif(resData.message, 'success');
                                          } else {
                                            showNotif(resData.message || 'เกิดข้อผิดพลาด', 'error');
                                          }
                                        } catch (err) {
                                          showNotif('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
                                        }
                                      }
                                    );
                                  }}
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-xl text-[10px] font-bold transition shadow-sm cursor-pointer"
                                >
                                  ✓ อนุมัติพิกัดใหม่
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Member Search list */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        👥 ระบบค้นหาและจัดการแก้ไขข้อมูลสมาชิกทั้งหมด
                      </h4>
                      <div className="relative max-w-md w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                          <Search size={14} />
                        </span>
                        <input 
                          type="text" 
                          placeholder="ค้นหาด้วย ชื่อ, นามสกุล, Username, รหัสสมาชิก..."
                          value={searchMemberQuery}
                          onChange={(e) => setSearchMemberQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                        <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                          <tr>
                            <th className="px-4 py-3">รหัสสมาชิก / Username</th>
                            <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                            <th className="px-4 py-3">เบอร์โทร / อีเมล</th>
                            <th className="px-4 py-3">ระดับ / สิทธิ์</th>
                            <th className="px-4 py-3 text-right">E-Cash / E-Money / Coupon</th>
                            <th className="px-4 py-3 text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {adminMembersList.filter(m => {
                            const q = searchMemberQuery.toLowerCase().trim();
                            if (!q) return true;
                            return (
                              m.userId?.toLowerCase().includes(q) ||
                              m.username?.toLowerCase().includes(q) ||
                              m.name?.toLowerCase().includes(q) ||
                              m.surname?.toLowerCase().includes(q) ||
                              m.phone?.includes(q) ||
                              m.idCard?.includes(q) ||
                              m.email?.toLowerCase().includes(q)
                            );
                          }).map(member => (
                            <tr key={member.userId} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3 font-semibold">
                                <span className="text-rose-600 block font-mono font-bold text-[10px]">{member.userId}</span>
                                <span className="text-slate-500 font-mono text-[11px]">@{member.username}</span>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {member.name} {member.surname}
                                <span className="block text-[10px] text-slate-400 font-normal">เลขบัตร: {member.idCard || "-"}</span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono">
                                <span className="block">{member.phone}</span>
                                <span className="block text-[10px] text-slate-400">{member.email || "-"}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 block mb-1 w-max">
                                  {member.rank || "S"}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-bold">สิทธิ์: {member.role || "Member"}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                <span className="block text-emerald-600 font-bold" title="E-Cash">💵 ฿ {member.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="block text-[10px] text-amber-600 font-bold" title="E-Money">💰 ฿ {(member.balanceEMoney || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="block text-[10px] text-indigo-500 font-bold" title="E-Coupon">🎟️ ฿ {member.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => {
                                    setEditingMember({ ...member });
                                    setOriginalMember({ ...member });
                                    setShowEditMemberModal(true);
                                  }}
                                  className="bg-slate-800 hover:bg-rose-600 text-white hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer"
                                >
                                  แก้ไขข้อมูล
                                </button>
                              </td>
                            </tr>
                          ))}
                          {adminMembersList.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-400">
                                ไม่พบข้อมูลสมาชิกในระบบ
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'depositApprove' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Dedicated Slip deposit queue */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          💰 รายการตรวจสอบและอนุมัติเติมเงิน E-Cash
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">กรุณาตรวจสอบความถูกต้องของยอดโอนและภาพหลักฐานสลิป ก่อนกดปุ่มอนุมัติ</p>
                      </div>
                      {depositQueue.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-xs font-black">
                          รออนุมัติ {depositQueue.length} รายการ
                        </span>
                      )}
                    </div>

                    {(() => {
                      const itemsPerPage = 20;
                      const startIndex = (adminDepositQueuePage - 1) * itemsPerPage;
                      const paginatedDepositQueue = depositQueue.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-700">
                            {paginatedDepositQueue.length > 0 ? (
                              paginatedDepositQueue.map(item => (
                                <div key={item.id} className="border border-slate-200/80 p-4 rounded-2xl bg-slate-50/50 space-y-3 flex flex-col justify-between hover:shadow-md transition duration-200">
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="font-mono font-bold text-indigo-600 text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded">{item.id}</span>
                                        <h5 className="font-bold text-slate-800 mt-1">{item.name || item.userId} (รหัส {item.userId})</h5>
                                        <p className="text-[10px] text-slate-400 font-mono">เมื่อ: {new Date(item.createdAt).toLocaleString('th-TH')}</p>
                                      </div>
                                      <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">รอแอดมินตรวจสลิป</span>
                                    </div>
                                    
                                    <div className="border-t border-slate-200/60 pt-2 space-y-1">
                                      <p className="text-xs flex justify-between">
                                        <span className="text-slate-500">ยอดแจ้งเติมเงิน:</span>
                                        <span className="font-bold text-slate-700">฿ {item.amount?.toLocaleString()} บาท</span>
                                      </p>
                                      <p className="text-xs flex justify-between">
                                        <span className="text-slate-500">ยอดโอนเงินจริง:</span>
                                        <span className="font-bold text-emerald-600">฿ {item.transferAmount?.toLocaleString()} บาท</span>
                                      </p>
                                      <p className="text-[11px] text-slate-400 flex justify-between">
                                        <span>วันที่โอนเงินจริง:</span>
                                        <span className="font-semibold text-slate-600">{item.transferDate || '-'}</span>
                                      </p>
                                    </div>

                                    {item.slipImgUrl && (
                                      <div className="bg-white border border-slate-100 p-2 rounded-xl flex items-center justify-between mt-2 relative">
                                        <span className="text-[10px] text-slate-400 font-medium">📷 ไฟล์สลิปโอนเงิน</span>
                                        <div className="relative group">
                                          <button 
                                            type="button"
                                            onClick={() => setActiveSlipModal(item.slipImgUrl)}
                                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer relative"
                                          >
                                            🔍 ดูภาพสลิปจริง
                                          </button>
                                          
                                          {/* Hover Preview Tooltip */}
                                          <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 z-50 bg-white p-2 rounded-2xl shadow-2xl border border-slate-200 w-64 pointer-events-none animate-fade-in">
                                            <p className="text-[9px] text-slate-400 font-bold mb-1 text-center">ตัวอย่างสลิปโอนเงิน (ชี้เพื่อพรีวิว / คลิกเพื่อขยาย)</p>
                                            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center max-h-72">
                                              <img 
                                                src={item.slipImgUrl} 
                                                alt="Hover Slip Preview" 
                                                referrerPolicy="no-referrer"
                                                className="w-full h-auto object-contain"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2 border-t border-slate-200/60 pt-2">
                                    <button 
                                      onClick={() => {
                                        setDepositRejectId(item.id);
                                        setDepositRejectReason('ข้อมูลโอนเงินไม่ตรง หรือสลิปซ้ำ/ไม่ถูกต้อง');
                                      }}
                                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center"
                                    >
                                      ปฏิเสธ
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setDepositApproveId(item.id);
                                        setDepositApproveAmount((item.transferAmount || item.amount || 0).toString());
                                      }}
                                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-xl text-[11px] font-bold transition shadow-sm cursor-pointer text-center"
                                    >
                                      อนุมัติเติมเงิน
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                                <p className="text-3xl mb-2">🎉</p>
                                <p className="text-xs font-bold text-slate-600">ไม่มีรายการแจ้งโอนเงินรออนุมัติในขณะนี้</p>
                                <p className="text-[10px] text-slate-400 mt-1">ยอดสลิปเติมเงินทั้งหมดในระบบได้รับการตรวจสอบและทำรายการเรียบร้อยแล้วค่ะ</p>
                              </div>
                            )}
                          </div>
                          {depositQueue.length > itemsPerPage && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <TablePagination currentPage={adminDepositQueuePage} totalItems={depositQueue.length} itemsPerPage={itemsPerPage} onPageChange={setAdminDepositQueuePage} />
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {adminSubTab === 'productApprovals' && (
                <div className="space-y-6 animate-fadeIn">
                  {renderAdminProductApprovalQueueSection()}
                </div>
              )}

              {adminSubTab === 'shippingApprove' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* รายการจัดส่งสินค้าและอนุมัติการจัดส่ง */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 font-sans">
                          🚚 รายการจัดส่งสินค้าที่รออนุมัติจัดส่ง (Pending Delivery Queue)
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">อนุมัติจัดส่งพร้อมกรอกข้อมูล ขนส่ง และ เลขพัสดุสำหรับแพ็กเกจและสินค้าทั่วไป</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200 mt-2 md:mt-0 font-mono">
                        รอจัดส่งทั้งหมด: {adminOrders.filter((o: any) => o.status === "Processing").length} บิล
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      {(() => {
                        const processingOrders = adminOrders.filter((o: any) => o.status === "Processing");
                        const itemsPerPage = 20;
                        const startIndex = (adminOrdersProcessingPage - 1) * itemsPerPage;
                        const paginatedProcessingOrders = processingOrders.slice(startIndex, startIndex + itemsPerPage);

                        return (
                          <>
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100 text-[10px]">
                                  <th className="px-4 py-3">รหัสบิล/Bill No</th>
                                  <th className="px-4 py-3">วันเวลาสั่งซื้อ</th>
                                  <th className="px-4 py-3">ผู้สั่งซื้อ (User ID)</th>
                                  <th className="px-4 py-3">รายการสินค้า / ชุดเซ็ต</th>
                                  <th className="px-4 py-3">จำนวน / มูลค่า / PV</th>
                                  <th className="px-4 py-3">ที่อยู่จัดส่งพัสดุ</th>
                                  <th className="px-4 py-3">ข้อมูลขนส่ง & การอนุมัติ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedProcessingOrders.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">ไม่มีรายการสั่งซื้อรอจัดส่งในระบบขณะนี้ค่ะ 🎉</td>
                                  </tr>
                                ) : (
                                  paginatedProcessingOrders.map((order: any) => {
                                    const tracking = shippingTracking[order.id] || { company: 'Flash Express', trackingNo: '', note: '' };
                                    return (
                                      <tr key={order.id} className="hover:bg-slate-50/40 align-top">
                                        <td className="px-4 py-3 font-mono text-[10px] font-bold text-indigo-900">{order.id}</td>
                                        <td className="px-4 py-3 text-[10px] text-slate-500 leading-tight">
                                          {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="font-bold text-slate-800">{order.userId}</span>
                                        </td>
                                        <td className="px-4 py-3 leading-tight">
                                          <div className="font-semibold text-slate-900">{order.productName}</div>
                                          {order.selectedChoiceName && (
                                            <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-100 mt-1">
                                              ชุด: {order.selectedChoiceName}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 leading-tight font-mono text-[11px]">
                                          <div className="font-bold text-slate-800">฿ {order.totalPrice?.toLocaleString()}</div>
                                          <div className="text-purple-600 font-semibold">{order.totalPv || 0} PV</div>
                                          <div className="text-[10px] text-slate-400">จำนวน: {order.quantity || 1} ชิ้น</div>
                                        </td>
                                        <td className="px-4 py-3 text-[10px] text-slate-600 leading-relaxed max-w-[200px] break-words">
                                          {order.shippingAddress || "ไม่ระบุที่อยู่จัดส่ง"}
                                        </td>
                                        <td className="px-4 py-3 space-y-2 bg-indigo-50/10 border-l border-indigo-50/50">
                                          <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                              <label className="text-[9px] font-bold text-slate-500 uppercase">บริษัทขนส่ง</label>
                                              <select
                                                value={tracking.company}
                                                onChange={(e) => setShippingTracking(prev => ({
                                                  ...prev,
                                                  [order.id]: { ...tracking, company: e.target.value }
                                                }))}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold"
                                              >
                                                <option value="Flash Express">Flash Express</option>
                                                <option value="Kerry Express">Kerry Express</option>
                                                <option value="J&T Express">J&T Express</option>
                                                <option value="EMS ไปรษณีย์ไทย">EMS ไปรษณีย์ไทย</option>
                                                <option value="DHL Express">DHL Express</option>
                                                <option value="Best Express">Best Express</option>
                                                <option value="อื่นๆ">อื่นๆ</option>
                                              </select>
                                            </div>
                                            <div>
                                              <label className="text-[9px] font-bold text-slate-500 uppercase">เลขพัสดุ (Tracking)</label>
                                              <input
                                                type="text"
                                                placeholder="กรอกเลขพัสดุ..."
                                                value={tracking.trackingNo}
                                                onChange={(e) => setShippingTracking(prev => ({
                                                  ...prev,
                                                  [order.id]: { ...tracking, trackingNo: e.target.value }
                                                }))}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-mono text-indigo-700 font-bold"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[9px] font-bold text-slate-500 uppercase">หมายเหตุการจัดส่ง</label>
                                            <input
                                              type="text"
                                              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                                              value={tracking.note}
                                              onChange={(e) => setShippingTracking(prev => ({
                                                ...prev,
                                                [order.id]: { ...tracking, note: e.target.value }
                                              }))}
                                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px]"
                                            />
                                          </div>
                                          <button
                                            onClick={() => handleCompleteOrder(order.id, tracking.company, tracking.trackingNo, tracking.note)}
                                            disabled={!tracking.trackingNo}
                                            className={`w-full text-white font-extrabold py-1.5 rounded-xl text-[10px] transition shadow-sm flex items-center justify-center gap-1 cursor-pointer ${
                                              tracking.trackingNo 
                                                ? 'bg-rose-600 hover:bg-rose-500 hover:shadow' 
                                                : 'bg-slate-300 cursor-not-allowed'
                                            }`}
                                          >
                                            🚀 อนุมัติจัดส่งสินค้า
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                            {processingOrders.length > itemsPerPage && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <TablePagination currentPage={adminOrdersProcessingPage} totalItems={processingOrders.length} itemsPerPage={itemsPerPage} onPageChange={setAdminOrdersProcessingPage} />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'manageShops' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* New Seller Store Approval Queue */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      🏪 ตารางคำขออนุมัติเปิดร้านค้าพาร์ทเนอร์รายใหม่ (New Partner Store Approval Queue)
                      {adminMembersList.filter((m: any) => m.sellerStatus === 'Pending').length > 0 && (
                        <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px]">
                          {adminMembersList.filter((m: any) => m.sellerStatus === 'Pending').length}
                        </span>
                      )}
                    </h4>
                    <div className="overflow-x-auto text-xs text-slate-700">
                      {(() => {
                        const pendingSellers = adminMembersList.filter((m: any) => m.sellerStatus === 'Pending');
                        return (
                          <>
                            {pendingSellers.length > 0 ? (
                              <div className="space-y-4">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                                      <th className="py-2.5 px-3">รหัสร้าน / รหัสสมาชิก</th>
                                      <th className="py-2.5 px-3">ชื่อเจ้าของร้าน</th>
                                      <th className="py-2.5 px-3">ชื่อร้านค้า (Store Name)</th>
                                      <th className="py-2.5 px-3">ที่อยู่จัดส่งคลังสินค้า</th>
                                      <th className="py-2.5 px-3 text-right">ดำเนินการ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {pendingSellers.map((m: any) => (
                                      <tr key={m.userId} className="hover:bg-slate-50/50">
                                        <td className="py-3 px-3 font-semibold">
                                          <span className="text-indigo-600 block font-mono font-bold">{m.sellerCode || '-'}</span>
                                          <span className="text-slate-400 block font-mono text-[10px]">ID: {m.userId}</span>
                                        </td>
                                        <td className="py-3 px-3">
                                          <span className="font-bold text-slate-800">{m.name} {m.surname}</span>
                                          <span className="block text-slate-400 text-[10px]">ระดับ: {m.rank}</span>
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-900">
                                          {m.sellerStoreName || 'ไม่ระบุชื่อร้าน'}
                                        </td>
                                        <td className="py-3 px-3">
                                          <p className="text-[11px] text-slate-600 max-w-[280px] break-words line-clamp-2" title={m.sellerAddress}>
                                            {m.sellerAddress || 'ไม่ระบุที่อยู่'}
                                          </p>
                                          {m.warehouseLat && m.warehouseLng && (
                                            <div className="mt-1.5 w-64">
                                              <NateeWarehouseMap 
                                                lat={m.warehouseLat} 
                                                lng={m.warehouseLng} 
                                                readOnly={true}
                                              />
                                              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                                                📍 {Number(m.warehouseLat || 0).toFixed(5)}, {Number(m.warehouseLng || 0).toFixed(5)}
                                              </span>
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                          <div className="flex justify-end gap-2">
                                            <button
                                              onClick={() => handleStoreReject(m.userId)}
                                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition border border-rose-200"
                                            >
                                              ❌ ปฏิเสธคำขอ
                                            </button>
                                            <button
                                              onClick={() => handleStoreApprove(m.userId)}
                                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition shadow-md hover:shadow"
                                            >
                                              ✓ อนุมัติเปิดร้านค้า
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-slate-400 text-center py-8">ไม่มีรายการใบสมัครขอเปิดร้านค้าผู้ขายรายใหม่ค้างอนุมัติในขณะนี้</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Approved Partner Stores Management Section (Admin Control Only) */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                          🏪 รายชื่อร้านค้าพาร์ทเนอร์ที่ได้รับอนุมัติในระบบ (Approved Partner Stores)
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          เฉพาะแอดมินผู้ดูแลระบบเท่านั้นที่มีสิทธิ์รีเซ็ตประวัติร้านค้ากรณีการทดสอบระบบ เพื่อรักษาความถูกต้องของรายงานบัญชีและภาษี
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto text-xs text-slate-700 border border-slate-100 rounded-2xl">
                      {(() => {
                        const approvedSellers = adminMembersList.filter((m: any) => m.sellerStatus === 'Approved' || m.sellerStoreName);
                        return approvedSellers.length > 0 ? (
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase">
                              <tr>
                                <th className="py-2.5 px-3">รหัสร้าน / รหัสสมาชิก</th>
                                <th className="py-2.5 px-3">เจ้าของร้าน</th>
                                <th className="py-2.5 px-3">ชื่อร้านค้า (Store Name)</th>
                                <th className="py-2.5 px-3 text-center">ยอดผู้เข้าชมร้าน</th>
                                <th className="py-2.5 px-3 text-right">สิทธิ์ผู้ดูแลระบบ (Admin Control)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {approvedSellers.map((m: any) => (
                                <tr key={m.userId} className="hover:bg-slate-50/50 transition">
                                  <td className="py-3 px-3">
                                    <span className="text-indigo-600 block font-mono font-bold">{m.sellerCode || m.userId}</span>
                                    <span className="text-slate-400 block font-mono text-[10px]">{m.userId}</span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="font-bold text-slate-800">{m.name} {m.surname}</span>
                                    <span className="block text-slate-400 text-[10px]">เบอร์โทร: {m.phone || '-'}</span>
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-900">
                                    🏪 {m.sellerStoreName || 'ร้านค้าพาร์ทเนอร์'}
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-indigo-600 font-bold">
                                    {(m.storeViews || 0).toLocaleString()} ครั้ง
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleClearSellerHistory(m.userId)}
                                      title="ล้างประวัติการขายสินค้า ออเดอร์ และผู้เข้าชมของร้านค้านี้โดยแอดมิน"
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition active:scale-95 inline-flex items-center gap-1"
                                    >
                                      <RotateCcw size={12} /> ล้างประวัติร้าน (แอดมิน)
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-slate-400 text-center py-6 text-xs">ยังไม่มีร้านค้าพาร์ทเนอร์ที่อนุมัติแล้วในขณะนี้</p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Shop & Product Approvals queue */}
                  {renderAdminProductApprovalQueueSection()}

                  {/* Active Seller Products with edit capabilities */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          🏪 ผลิตภัณฑ์ร้านค้าร่วมที่ได้รับอนุมัติแล้วในระบบ (Active Partner Products)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ค้นหา ปรับปรุงแก้ไขราคาสินค้า หรือลบรูปภาพสินค้าของผู้ขายที่ไม่เหมาะสมออกได้ทันที
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 max-w-md w-full justify-end">
                        <button
                          type="button"
                          onClick={handleRestoreProducts}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-xs"
                          title="ล้างสินค้าตัวอย่างและซิงค์สินค้าของร้านค้าทั้งหมด"
                        >
                          <RefreshCw size={13} className="text-indigo-600" />
                          <span>ซิงค์สินค้าของร้านค้า</span>
                        </button>
                        <div className="relative max-w-xs w-full sm:w-auto flex-1">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                            <Search size={14} />
                          </span>
                          <input 
                            type="text" 
                            placeholder="ค้นหาชื่อสินค้า / รหัสสินค้า..."
                            value={prodSearchQuery}
                            onChange={(e) => setProdSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      {(() => {
                        const filteredSellerProducts = allSellerProducts.filter(p => {
                          const q = prodSearchQuery.toLowerCase().trim();
                          if (!q) return true;
                          return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
                        });
                        const itemsPerPage = 20;
                        const startIndex = (adminActiveProductsPage - 1) * itemsPerPage;
                        const paginatedSellerProducts = filteredSellerProducts.slice(startIndex, startIndex + itemsPerPage);

                        return (
                          <>
                            <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                              <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                                <tr>
                                  <th className="px-4 py-3">รูปสินค้า</th>
                                  <th className="px-4 py-3">รหัส / ชื่อสินค้า</th>
                                  <th className="px-4 py-3 text-center">ราคาขายปัจจุบัน</th>
                                  <th className="px-4 py-3 text-center">คะแนน PV</th>
                                  <th className="px-4 py-3 text-center">ต้นทุน (Cost)</th>
                                  <th className="px-4 py-3 text-center">รูปหลัก</th>
                                  <th className="px-4 py-3 text-center">การจัดการแอดมิน</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {paginatedSellerProducts.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400">
                                      ไม่มีรายการผลิตภัณฑ์ร้านค้าร่วมที่ได้รับอนุมัติแล้วในระบบขณะนี้
                                    </td>
                                  </tr>
                                ) : (
                                  paginatedSellerProducts.map(prod => (
                                    <tr key={prod.id} className="hover:bg-slate-50/50 transition">
                                      <td className="px-4 py-3">
                                        {prod.image ? (
                                          <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">ไม่มีรูป</div>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 font-semibold">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-extrabold border border-indigo-200 shadow-2xs">
                                            🆔 {prod.id}
                                          </span>
                                        </div>
                                        <span className="text-slate-900 font-bold block">{prod.name}</span>
                                        <span className="block text-[10px] text-indigo-500">ร้านค้า: {prod.sellerStoreName || 'ไม่ระบุ'}</span>
                                        {prod.status === 'Pending' ? (
                                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            ⏳ รอแอดมินอนุมัติ (Pending)
                                          </span>
                                        ) : prod.status === 'Rejected' ? (
                                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                            ❌ ไม่อนุมัติ (Rejected)
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            ✅ อนุมัติแล้ว (Approved)
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold text-slate-800">฿ {prod.price?.toLocaleString()}</td>
                                      <td className="px-4 py-3 text-center font-semibold text-indigo-600">{prod.pv} PV</td>
                                      <td className="px-4 py-3 text-center font-mono text-slate-500">฿{prod.cost || 0}</td>
                                      <td className="px-4 py-3 text-center">
                                        {prod.image && (
                                          <button
                                            onClick={() => handleProductDeleteImage(prod.id)}
                                            className="text-rose-600 hover:text-rose-800 font-bold text-[10px] bg-rose-50 px-2 py-1 rounded border border-rose-100 cursor-pointer transition hover:bg-rose-100"
                                          >
                                            🗑️ ลบรูปภาพหลัก
                                          </button>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {prod.status === 'Pending' && (
                                          <button
                                            onClick={() => handleProductApprove(prod.id)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition shadow-sm mr-1.5"
                                          >
                                            ✨ อนุมัติเปิดขายทันที
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            setEditingProduct({
                                              ...prod,
                                              discountPercent: prod.discountPercent || '0',
                                              shippingFeeBase: prod.shippingFeeBase || '35',
                                              shippingDiscount: prod.shippingDiscount || prod.sellerCoPay || '0',
                                              weight: prod.weight || '350',
                                              width: prod.width || '10',
                                              length: prod.length || '10',
                                              height: prod.height || '10'
                                            });
                                            setShowEditProductModal(true);
                                          }}
                                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition"
                                        >
                                          ✏️ แก้ไข / เปลี่ยนรูป
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(prod.id)}
                                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition shadow-xs ml-1.5"
                                          title="ลบสินค้าออกจากร้านค้าและระบบ"
                                        >
                                          🗑️ ลบสินค้า
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                            {filteredSellerProducts.length > itemsPerPage && (
                              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                <TablePagination currentPage={adminActiveProductsPage} totalItems={filteredSellerProducts.length} itemsPerPage={itemsPerPage} onPageChange={setAdminActiveProductsPage} />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'orderStatus' && (
                <div className="space-y-6 animate-fadeIn bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        🚚 ค้นหาสถานะการจัดส่ง และรายการสั่งซื้อทั้งหมด (Orders Shipment Status Console)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        หน้านี้สำหรับจัดการบิลสั่งซื้อ ค้นหารายการ ตรวจสอบสถานะการแพ็กสินค้า พร้อมปุ่มเปลี่ยนสถานะเป็นส่งสินค้าแล้วค่ะ
                      </p>
                    </div>
                  </div>

                  {/* Search & Filter Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">เลขที่บิลสั่งซื้อ (Order ID)</label>
                      <input 
                        type="text" 
                        placeholder="เช่น ORD_..."
                        value={orderSearchId}
                        onChange={(e) => setOrderSearchId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">รหัสผู้สั่งซื้อ (User ID)</label>
                      <input 
                        type="text" 
                        placeholder="เช่น MB_..."
                        value={orderSearchUserId}
                        onChange={(e) => setOrderSearchUserId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">วันที่สั่งซื้อ (ปี-เดือน-วัน)</label>
                      <input 
                        type="text" 
                        placeholder="เช่น 2026-07"
                        value={orderSearchDate}
                        onChange={(e) => setOrderSearchDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">สถานะการจัดส่ง</label>
                      <select
                        value={orderSearchStatus}
                        onChange={(e) => setOrderSearchStatus(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
                      >
                        <option value="">ทั้งหมด</option>
                        <option value="Processing">รอดำเนินการ (Processing)</option>
                        <option value="Completed">จัดส่งเรียบร้อย (Completed)</option>
                        <option value="Cancelled">ยกเลิกแล้ว / ใบลดหนี้ (Cancelled)</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                        <tr>
                          <th className="px-4 py-3">รหัสบิล / วันที่สั่งซื้อ</th>
                          <th className="px-4 py-3">ผู้สั่งซื้อ (User ID)</th>
                          <th className="px-4 py-3">รายการสินค้า / ชุดสินค้าเลือก</th>
                          <th className="px-4 py-3 text-right">ยอดชำระ / PV</th>
                          <th className="px-4 py-3">ที่อยู่จัดส่งสินค้า</th>
                          <th className="px-4 py-3 text-center">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                        {adminOrders.filter(order => {
                          const matchesId = !orderSearchId || order.id.toLowerCase().includes(orderSearchId.toLowerCase());
                          const matchesUserId = !orderSearchUserId || order.userId.toLowerCase().includes(orderSearchUserId.toLowerCase());
                          const matchesDate = !orderSearchDate || order.createdAt.includes(orderSearchDate) || new Date(order.createdAt).toLocaleString('th-TH').includes(orderSearchDate);
                          const matchesStatus = !orderSearchStatus || order.status === orderSearchStatus;
                          return matchesId && matchesUserId && matchesDate && matchesStatus;
                        }).map(order => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-indigo-600 block">{order.id}</span>
                              <span className="text-[9px] text-slate-400 block">{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {order.userId}
                            </td>
                            <td className="px-4 py-3">
                              {order.productId && (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200 mb-1">
                                  🆔 {order.productId}
                                </span>
                              )}
                              <span className="font-bold block text-slate-900">{order.productName}</span>
                              {order.selectedChoiceName && (
                                <span className="inline-block mt-1 bg-amber-50 text-amber-800 border border-amber-100 text-[9px] px-2 py-0.5 rounded font-bold">
                                  🎁 เซ็ตที่เลือก: {order.selectedChoiceName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold">
                              <span className="text-emerald-600 block">฿ {order.totalPrice?.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">+{order.totalPv} PV</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 leading-normal max-w-xs truncate" title={order.shippingAddress}>
                              {order.shippingAddress || "ไม่มีข้อมูลที่อยู่"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {order.status === "Processing" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                                    รอดำเนินการ
                                  </span>
                                  <div className="flex flex-col gap-1 mt-1">
                                    <button 
                                      onClick={() => handleCompleteOrder(order.id)}
                                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded text-[9px] cursor-pointer"
                                    >
                                      ยืนยันการจัดส่งแล้ว
                                    </button>
                                    <button
                                      onClick={() => setCancelOrderModalData({
                                        orderId: order.id,
                                        productName: order.productName || 'สินค้า/แพ็กเกจ',
                                        userId: order.userId,
                                        totalPrice: order.totalPrice || 0
                                      })}
                                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2 py-1 rounded text-[9px] cursor-pointer border border-rose-200"
                                    >
                                      🚫 ยกเลิกบิล / ออกใบลดหนี้
                                    </button>
                                  </div>
                                </div>
                              ) : order.status === "Cancelled" ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="bg-red-100 text-red-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-red-200">
                                    🚫 ยกเลิกบิลแล้ว
                                  </span>
                                  <button
                                    onClick={() => {
                                      const cn = creditNotes.find((c: any) => c.orderId === order.id) || {
                                        id: `CN-${order.id}`,
                                        orderId: order.id,
                                        userId: order.userId,
                                        productName: order.productName || 'สินค้า/แพ็กเกจ',
                                        originalReceiptId: order.taxInvoiceNo || order.id,
                                        originalAmount: order.totalPrice || 0,
                                        amountBeforeVat: parseFloat(((order.totalPrice || 0) / 1.07).toFixed(2)),
                                        vatAmount: parseFloat(((order.totalPrice || 0) * 0.07 / 1.07).toFixed(2)),
                                        reason: order.cancelReason || 'ยกเลิกรายการเนื่องจากออกบิลซ้ำ/ข้อผิดพลาดทางเทคนิค',
                                        createdAt: order.cancelledAt || new Date().toISOString(),
                                        status: 'Approved',
                                        issuedBy: 'Admin'
                                      };
                                      setSelectedCreditNoteForView(cn);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2 py-1 rounded text-[9px] cursor-pointer shadow-sm mt-1"
                                  >
                                    📄 ดู/พิมพ์ใบลดหนี้
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                    จัดส่งเรียบร้อย
                                  </span>
                                  <button
                                    onClick={() => setCancelOrderModalData({
                                      orderId: order.id,
                                      productName: order.productName || 'สินค้า/แพ็กเกจ',
                                      userId: order.userId,
                                      totalPrice: order.totalPrice || 0
                                    })}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded text-[8px] cursor-pointer border border-rose-200 mt-1"
                                  >
                                    🚫 ยกเลิกบิล / ออกใบลดหนี้
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {adminOrders.filter(order => {
                          const matchesId = !orderSearchId || order.id.toLowerCase().includes(orderSearchId.toLowerCase());
                          const matchesUserId = !orderSearchUserId || order.userId.toLowerCase().includes(orderSearchUserId.toLowerCase());
                          const matchesDate = !orderSearchDate || order.createdAt.includes(orderSearchDate) || new Date(order.createdAt).toLocaleString('th-TH').includes(orderSearchDate);
                          const matchesStatus = !orderSearchStatus || order.status === orderSearchStatus;
                          return matchesId && matchesUserId && matchesDate && matchesStatus;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              ไม่มีประวัติการสั่งซื้อสินค้าใดๆ ในขณะนี้
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminSubTab === 'couponPv' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          🎟️ ยอดสะสมคะแนน PV จากส่วนที่ซื้อด้วยคูปองค้างคำนวณ (Pending Coupon PV Queue)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          เมื่อสมาชิกสั่งซื้อสินค้าด้วย E-Coupon ยอด PV จะยังไม่จ่ายเข้าสู่แผนไบนารี่ทันที แต่จะพักสะสมไว้ที่นี่เพื่อคำนวณตัดยอด (ทุกวันที่ 10 ของเดือน หรือตัดจ่ายด้วยตนเอง)
                        </p>
                      </div>
                      
                      <button
                        onClick={handleProcessCouponPv}
                        disabled={processingCouponPv || pendingCouponPv.length === 0}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 ${
                          pendingCouponPv.length === 0 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                        }`}
                      >
                        {processingCouponPv ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> กำลังประมวลผลตัดยอด...
                          </>
                        ) : (
                          <>
                            ⚙️ คำนวณตัดยอด PV คูปองสะสมทันที ({pendingCouponPv.reduce((sum, x) => sum + x.pvAmount, 0).toFixed(2)} PV)
                          </>
                        )}
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      {(() => {
                        const itemsPerPage = 20;
                        const startIndex = (adminPendingCouponPvPage - 1) * itemsPerPage;
                        const paginatedPending = pendingCouponPv.slice(startIndex, startIndex + itemsPerPage);

                        return (
                          <>
                            <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                              <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                                <tr>
                                  <th className="px-4 py-3">รหัสธุรกรรม</th>
                                  <th className="px-4 py-3">รหัสผู้ซื้อ / สมาชิก</th>
                                  <th className="px-4 py-3 text-center">รหัสสั่งซื้อ (Order ID)</th>
                                  <th className="px-4 py-3 text-center">จำนวนคะแนน (PV)</th>
                                  <th className="px-4 py-3 text-center">วันที่บันทึกพักยอด</th>
                                  <th className="px-4 py-3 text-right">สถานะ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {paginatedPending.length > 0 ? (
                                  paginatedPending.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{item.id}</td>
                                      <td className="px-4 py-3 font-semibold text-slate-800">{item.buyerId}</td>
                                      <td className="px-4 py-3 text-center font-mono text-slate-600">{item.orderId}</td>
                                      <td className="px-4 py-3 text-center font-bold text-indigo-600 font-mono">{item.pvAmount.toFixed(2)} PV</td>
                                      <td className="px-4 py-3 text-center text-slate-400 text-[11px]">{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                      <td className="px-4 py-3 text-right">
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                                          รอนำส่งคำนวณ (Pending)
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400">
                                      ไม่มีคะแนน PV คูปองสะสมค้างคำนวณในขณะนี้ ยอดสะสมเป็น 0.00 PV
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            {pendingCouponPv.length > itemsPerPage && (
                              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                <TablePagination currentPage={adminPendingCouponPvPage} totalItems={pendingCouponPv.length} itemsPerPage={itemsPerPage} onPageChange={setAdminPendingCouponPvPage} />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      📜 ประวัติการประมวลผลตัดจ่ายคะแนน PV จากคูปอง (Processed History)
                    </h4>
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      {(() => {
                        const itemsPerPage = 20;
                        const startIndex = (adminCouponPvHistoryPage - 1) * itemsPerPage;
                        const paginatedHistory = couponPvHistory.slice(startIndex, startIndex + itemsPerPage);

                        return (
                          <>
                            <table className="min-w-full divide-y divide-slate-100 text-xs text-left text-slate-700">
                              <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                                <tr>
                                  <th className="px-4 py-3">รหัสธุรกรรม</th>
                                  <th className="px-4 py-3">ผู้ซื้อ / สมาชิก</th>
                                  <th className="px-4 py-3 text-center">รหัสบิลสั่งซื้อ (Order ID)</th>
                                  <th className="px-4 py-3 text-center">จำนวนคะแนน (PV)</th>
                                  <th className="px-4 py-3 text-center">วันที่บันทึกพักยอด</th>
                                  <th className="px-4 py-3 text-right">สถานะประมวลผล</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {paginatedHistory.length > 0 ? (
                                  paginatedHistory.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 bg-slate-50/20">
                                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{item.id}</td>
                                      <td className="px-4 py-3 text-slate-600">{item.buyerId}</td>
                                      <td className="px-4 py-3 text-center font-mono text-slate-500">{item.orderId}</td>
                                      <td className="px-4 py-3 text-center font-bold text-emerald-600 font-mono">{item.pvAmount.toFixed(2)} PV</td>
                                      <td className="px-4 py-3 text-center text-slate-400 text-[11px]">{new Date(item.createdAt).toLocaleString('th-TH')}</td>
                                      <td className="px-4 py-3 text-right">
                                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                          คำนวณและตัดจ่ายแล้ว (Success)
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400">
                                      ยังไม่มีข้อมูลประวัติการตัดยอด PV จากคูปองในระบบ
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            {couponPvHistory.length > itemsPerPage && (
                              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                <TablePagination currentPage={adminCouponPvHistoryPage} totalItems={couponPvHistory.length} itemsPerPage={itemsPerPage} onPageChange={setAdminCouponPvHistoryPage} />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* MEMBER SHOP INFO SUBTAB */}
              {adminSubTab === 'memberShopInfo' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          👥 รายชื่อและข้อมูลสมาชิกร้านค้าในระบบ (Member Partner Database)
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          แสดงข้อมูลและจัดการสถานะของพาร์ทเนอร์ร้านค้า (อนุมัติ / ปฏิเสธคำขอ / ระงับชั่วคราว / ยกเลิก) รวมถึงแก้ไขที่ตั้งพิกัดคลังสินค้า
                        </p>
                      </div>
                    </div>

                    {/* Shop Info Table */}
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                            <th className="p-3">รหัสสมาชิก / User</th>
                            <th className="p-3">ชื่อ - สกุล</th>
                            <th className="p-3">เบอร์โทร</th>
                            <th className="p-3">E-mail</th>
                            <th className="p-3 font-mono">รหัสร้านค้า</th>
                            <th className="p-3">ชื่อร้านค้า</th>
                            <th className="p-3">สถานะร้านค้า</th>
                            <th className="p-3">วันที่ขออนุมัติ</th>
                            <th className="p-3 text-center">จัดการสถานะ / แก้ไข</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Display all members who have applied for seller status (Pending, Active, Suspended, Rejected, etc.)
                            const sellers = adminMembersList.filter((m: any) => m.sellerStatus && m.sellerStatus !== 'NotApplied');
                            if (sellers.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                                    ยังไม่มีสมาชิกที่จดทะเบียนร้านค้าในระบบค่ะ
                                  </td>
                                </tr>
                              );
                            }
                            return sellers.map((m: any) => {
                              // Get status badge colors
                              let statusBadge = null;
                              switch (m.sellerStatus) {
                                case 'Active':
                                  statusBadge = (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                                      ✓ อนุมัติแล้ว (Active)
                                    </span>
                                  );
                                  break;
                                case 'Pending':
                                  statusBadge = (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold animate-pulse shadow-sm">
                                      ⏳ รออนุมัติ (Pending)
                                    </span>
                                  );
                                  break;
                                case 'Rejected':
                                  statusBadge = (
                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                                      ❌ ไม่อนุมัติ (Rejected)
                                    </span>
                                  );
                                  break;
                                case 'Suspended':
                                  statusBadge = (
                                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                                      ⚠️ ระงับชั่วคราว (Suspended)
                                    </span>
                                  );
                                  break;
                                default:
                                  statusBadge = (
                                    <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                                      {m.sellerStatus || 'ไม่ระบุ'}
                                    </span>
                                  );
                              }

                              // Format date of application (sellerAppliedAt or createdAt)
                              const appliedDateStr = m.sellerAppliedAt 
                                ? new Date(m.sellerAppliedAt).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : m.createdAt 
                                ? new Date(m.createdAt).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })
                                : '-';

                              return (
                                <tr key={m.userId} className="hover:bg-slate-50 border-b border-slate-50 font-sans transition-colors duration-150">
                                  {/* รหัสสมาชิก / User */}
                                  <td className="p-3 font-mono font-bold text-slate-800">{m.userId}</td>
                                  
                                  {/* ชื่อ - สกุล */}
                                  <td className="p-3 font-semibold text-slate-800">{m.name} {m.surname || ''}</td>
                                  
                                  {/* เบอร์โทร */}
                                  <td className="p-3 font-mono text-slate-600">{m.phone || '-'}</td>
                                  
                                  {/* E-mail */}
                                  <td className="p-3 text-slate-500">{m.email || '-'}</td>
                                  
                                  {/* รหัสร้านค้า */}
                                  <td className="p-3">
                                    {m.sellerCode ? (
                                      <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100">
                                        {m.sellerCode}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic text-[10px]">รออนุมัติรหัส</span>
                                    )}
                                  </td>
                                  
                                  {/* ชื่อร้านค้า */}
                                  <td className="p-3 font-semibold text-slate-900">{m.sellerStoreName || '-'}</td>
                                  
                                  {/* สถานะร้านค้า */}
                                  <td className="p-3">{statusBadge}</td>
                                  
                                  {/* วันที่ขออนุมัติ */}
                                  <td className="p-3 text-slate-500 text-[11px] font-mono">{appliedDateStr}</td>
                                  
                                  {/* ปุ่ม อนุมัติ / ไม่อนุมัติ / ระงับชั่วคราว / ยกเลิก */}
                                  <td className="p-3">
                                    <div className="flex flex-col gap-1.5 justify-center items-stretch min-w-[200px]">
                                      {/* Row 1 Action Buttons */}
                                      <div className="flex gap-1">
                                        {/* อนุมัติ */}
                                        <button
                                          onClick={() => handleUpdateStoreStatus(m.userId, 'Active')}
                                          disabled={m.sellerStatus === 'Active'}
                                          className={`flex-1 text-[9px] font-black px-1.5 py-1 rounded-lg border text-center transition cursor-pointer ${
                                            m.sellerStatus === 'Active'
                                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                              : 'bg-emerald-550 hover:bg-emerald-600 text-white border-emerald-500 shadow-sm'
                                          }`}
                                          title="อนุมัติเปิดร้านค้า"
                                        >
                                          ✓ อนุมัติ
                                        </button>

                                        {/* ไม่อนุมัติ */}
                                        <button
                                          onClick={() => handleUpdateStoreStatus(m.userId, 'Rejected')}
                                          disabled={m.sellerStatus === 'Rejected'}
                                          className={`flex-1 text-[9px] font-black px-1.5 py-1 rounded-lg border text-center transition cursor-pointer ${
                                            m.sellerStatus === 'Rejected'
                                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                          }`}
                                          title="ไม่อนุมัติ / ปฏิเสธ"
                                        >
                                          ❌ ไม่อนุมัติ
                                        </button>
                                      </div>

                                      {/* Row 2 Action Buttons */}
                                      <div className="flex gap-1">
                                        {/* ระงับชั่วคราว */}
                                        <button
                                          onClick={() => handleUpdateStoreStatus(m.userId, 'Suspended')}
                                          disabled={m.sellerStatus === 'Suspended'}
                                          className={`flex-1 text-[9px] font-black px-1.5 py-1 rounded-lg border text-center transition cursor-pointer ${
                                            m.sellerStatus === 'Suspended'
                                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                              : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                                          }`}
                                          title="ระงับการใช้งานชั่วคราว"
                                        >
                                          ⚠️ ระงับ
                                        </button>

                                        {/* ยกเลิก */}
                                        <button
                                          onClick={() => handleUpdateStoreStatus(m.userId, 'NotApplied')}
                                          className="flex-1 text-[9px] font-black px-1.5 py-1 rounded-lg border text-center bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 transition cursor-pointer"
                                          title="ยกเลิกการเปิดร้าน (กลับสู่ไม่สมัคร)"
                                        >
                                          ⛔ ยกเลิก
                                        </button>
                                      </div>

                                      {/* Row 3: Edit Warehouse Info */}
                                      <button
                                        onClick={() => {
                                          setAdminSelectedSeller(m);
                                          setAdminEditStoreName(m.sellerStoreName || '');
                                          setAdminEditStoreAddress(m.sellerAddress || '');
                                          setAdminEditLat(m.warehouseLat || 13.7563);
                                          setAdminEditLng(m.warehouseLng || 100.5018);
                                        }}
                                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1 rounded-lg text-[9px] font-extrabold transition cursor-pointer text-center mt-0.5"
                                      >
                                        📍 พิกัด / ที่อยู่คลังสินค้า
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN EDIT SELLER STORE MODAL */}
              {adminSelectedSeller && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-indigo-50 animate-scaleUp">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                        🏪 แก้ไขข้อมูลพิกัดคลังสินค้าสมาชิกร้านค้า (ID: {adminSelectedSeller.userId})
                      </h3>
                      <button 
                        onClick={() => setAdminSelectedSeller(null)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleAdminUpdateSellerShop} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">ชื่อร้านค้า (Store Name)</label>
                          <input 
                            type="text"
                            required
                            value={adminEditStoreName}
                            onChange={(e) => setAdminEditStoreName(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">รหัสร้านค้า (Shop Code)</label>
                          <input 
                            type="text"
                            disabled
                            value={adminSelectedSeller.sellerCode || "ยังไม่ได้รับอนุมัติ"}
                            className="w-full border border-slate-100 rounded-xl px-3 py-2 bg-slate-50 font-mono text-slate-400 font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">ที่ตั้งคลังสินค้ารับของส่งคืน</label>
                          <textarea 
                            rows={2}
                            required
                            value={adminEditStoreAddress}
                            onChange={(e) => setAdminEditStoreAddress(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl p-3"
                          />
                        </div>

                        {/* Map coordinate editor */}
                        <NateeWarehouseMap 
                          lat={adminEditLat}
                          lng={adminEditLng}
                          onChange={(lat, lng) => {
                            setAdminEditLat(lat);
                            setAdminEditLng(lng);
                          }}
                          address={adminEditStoreAddress}
                          onAddressChange={(addr) => setAdminEditStoreAddress(addr)}
                        />
                      </div>

                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => setAdminSelectedSeller(null)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold cursor-pointer transition"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold cursor-pointer transition shadow"
                        >
                          ✓ บันทึกการแก้ไข
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ADMIN WRITE REGULATIONS SUBTAB (Admin Console) */}
              {adminSubTab === 'manageRegulations' && (
                <div className="space-y-6 animate-fadeIn max-w-4xl">
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-4">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        📝 จัดการระเบียบข้อบังคับร้านค้าผู้ขายรายใหม่ (Admin Console)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        พิมพ์หรือแก้ไขกฎระเบียบของทางระบบ Natee Plus Partner เพื่อกำหนดให้สมาชิกใหม่ต้องกดยอมรับก่อนสมัครเปิดร้านค้าออนไลน์ได้
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-750">กฎระเบียบ ข้อตกลง และข้อบังคับการหัก GP 20% (Rich Editor Textarea)</label>
                        <textarea 
                          rows={15}
                          value={sellerRegulationsText}
                          onChange={(e) => setSellerRegulationsText(e.target.value)}
                          placeholder="พิมพ์หรือวางข้อตกลง กฎระเบียบข้อบังคับพาร์ทเนอร์ร้านค้าที่นี่..."
                          className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-sans text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed transition"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          💡 ตัวอักษรสะสมในขณะนี้: <strong>{sellerRegulationsText?.length || 0}</strong> ตัวอักษร
                        </span>
                        <div className="flex gap-2">
                          {(profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                            <button
                              type="button"
                              onClick={() => setShowRegulationsPdfModal(true)}
                              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              📥 พรีวิวและพิมพ์เอกสาร PDF (สิทธิ์ Manager/Admin)
                            </button>
                          )}
                          <button
                            onClick={handleAdminSaveRegulations}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            💾 บันทึกระเบียบข้อบังคับใหม่
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'systemReset' && (
                <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
                  {/* Sandbox Mode / Live Data Management Card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-2 border border-rose-100">
                        <Settings size={24} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">🧪 ระบบทดสอบจำลอง (Sandbox Mode)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ระบบของเราแยกฐานข้อมูลออกเป็น 2 กล่องโดยเด็ดขาด: <strong>โหมดทดสอบ (Sandbox)</strong> และ <strong>โหมดข้อมูลจริง (Production)</strong> 
                        เพื่อป้องกันความเสียหายต่อตัวเลขเงินหรือผังสายงานจริงในขณะที่ท่านกำลังทำการปรับจูนหรือคำนวณจำลอง MLM แผนธุรกิจค่ะ
                      </p>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
                      <div className="space-y-1 text-center sm:text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สถานะฐานข้อมูลปัจจุบัน:</span>
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSandboxActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
                          <span className="text-xs font-black text-slate-700">
                            {isSandboxActive ? 'กำลังใช้: ฐานข้อมูลจำลอง (Sandbox Database)' : 'กำลังใช้: ฐานข้อมูลจริง (Production Database)'}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleToggleSandbox(!isSandboxActive, false)}
                        disabled={togglingSandbox}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSandboxActive 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        {togglingSandbox ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : isSandboxActive ? (
                          '🏠 สลับกลับสู่โหมดข้อมูลจริง'
                        ) : (
                          '🧪 เปิดใช้งานโหมดทดสอบ'
                        )}
                      </button>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100/50 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                        📥 ดึงข้อมูลจริงเข้ามาทดสอบ (Clone Real Firestore to Sandbox)
                      </h4>
                      <p className="text-[11px] text-indigo-700 leading-relaxed">
                        เมื่อต้องการนำข้อมูลสมาชิกล่าสุด, โครงสร้างสายงาน และธุรกรรมล่าสุดจากฐานข้อมูลระบบจริงบน Cloud มาจำลองทดสอบ 
                        ท่านสามารถกดปุ่มด้านล่างเพื่อทำการดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์จริงมาบันทึกทับใน Sandbox ได้อย่างปลอดภัยโดยไม่มีผลกระทบใด ๆ ต่อฐานข้อมูลจริงค่ะ
                      </p>
                      <button
                        onClick={() => handleToggleSandbox(true, true)}
                        disabled={togglingSandbox}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        {togglingSandbox ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          '📥 ดึงข้อมูลระบบจริงล่าสุดมาเป็นชุดทดสอบ (Clone Production to Sandbox)'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Backup / JSON Migration Card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-2 border border-indigo-100">
                        <Database size={24} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">💾 นำเข้า / ส่งออกข้อมูลระบบ (Database Migration)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ท่านสามารถย้ายข้อมูล, ทำการสำรองข้อมูล (Backup) หรือโคลนข้อมูลสมาชิกและสายงานทั้งหมดจากระบบจริงมาทดสอบใน Sandbox ได้อย่างปลอดภัย 100% ผ่านไฟล์ JSON โดยไม่ต้องอาศัยสิทธิ์เชื่อมต่อ Cloud ของสองฝั่งค่ะ
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Export Button */}
                      <div className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <span>📤</span> ส่งออกฐานข้อมูล (Export Database)
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                            ดาวน์โหลดฐานข้อมูลสมาชิก, สินค้า, รายการธุรกรรม และสายงานปัจจุบันของโหมดนี้ {isSandboxActive ? '(Sandbox)' : '(Production)'} ออกมาเป็นไฟล์ .json สำรองเก็บไว้ในคอมพิวเตอร์ของคุณ
                          </p>
                        </div>
                        <button
                          onClick={handleExportDatabase}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow mt-2"
                        >
                          📤 ดาวน์โหลดไฟล์สำรองข้อมูล (.json)
                        </button>
                      </div>

                      {/* Import Button */}
                      <div className="border border-slate-100 rounded-2xl p-4 space-y-2 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <span>📥</span> นำเข้าฐานข้อมูล (Import Database)
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                            อัปโหลดไฟล์ข้อมูลสำรอง .json เพื่อเขียนทับฐานข้อมูลสมาชิกและธุรกรรมในโหมดที่เปิดใช้งานอยู่ {isSandboxActive ? '(Sandbox)' : '(Production)'} ทันที เหมาะสำหรับการคัดลอกข้อมูลสายงานมาทดลองอย่างสมบูรณ์แบบ
                          </p>
                        </div>
                        <label className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow text-center inline-block mt-2">
                          {importingDb ? '⏳ กำลังนำเข้าข้อมูล...' : '📥 เลือกไฟล์ .json เพื่อนำเข้า'}
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportDatabase}
                            disabled={importingDb}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Custom Inline React Import Confirmation/Status Modal */}
                    {showImportConfirmModal && (
                      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
                          
                          {importSuccess ? (
                            // Success View
                            <div className="space-y-4 text-center py-2">
                              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-black text-emerald-800">🎉 นำเข้าข้อมูลเสร็จสมบูรณ์!</h3>
                              <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                {importSuccess}
                              </p>
                              <button
                                onClick={() => {
                                  setShowImportConfirmModal(false);
                                  window.location.reload();
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                              >
                                🔄 โหลดหน้าเว็บใหม่เพื่ออัปเดตข้อมูล
                              </button>
                            </div>
                          ) : importError ? (
                            // Error View
                            <div className="space-y-4 text-center py-2">
                              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-100 mb-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-black text-rose-800">❌ เกิดข้อผิดพลาดในการนำเข้า</h3>
                              <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                                {importError}
                              </p>
                              <button
                                onClick={() => {
                                  setShowImportConfirmModal(false);
                                  setImportFile(null);
                                  setImportError(null);
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
                              >
                                ปิดหน้าต่าง
                              </button>
                            </div>
                          ) : (
                            // Confirmation View
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 mt-1 shrink-0">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-base font-black text-slate-800">⚠️ ยืนยันการนำเข้าไฟล์สำรองข้อมูล?</h3>
                                  <p className="text-xs text-rose-600 font-bold">
                                    คำเตือน: ข้อมูลเดิมทั้งหมดจะถูกเขียนทับทันที!
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500 leading-relaxed">
                                การนำเข้าไฟล์นี้จะทำการบันทึกข้อมูลทับระบบปัจจุบัน ({isSandboxActive ? 'ระบบจำลอง Sandbox' : 'ระบบจริง Production'}) ทั้งหมด รวมถึงผังสายงาน ประวัติธุรกรรม รายการสินค้า และประวัติทั้งหมด!
                              </p>

                              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/40 space-y-1">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">ไฟล์สำรองข้อมูลที่เลือก:</p>
                                <p className="text-xs font-black text-slate-700 truncate">{importFile?.name}</p>
                                <p className="text-[11px] text-slate-500">ขนาดไฟล์: {importFile?.size ? (importFile.size / 1024).toFixed(2) + ' KB' : 'ไม่ทราบขนาด'}</p>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => {
                                    setShowImportConfirmModal(false);
                                    setImportFile(null);
                                  }}
                                  disabled={importingDb}
                                  className="w-1/3 border border-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-50 disabled:opacity-50 transition"
                                >
                                  ยกเลิก
                                </button>
                                <button
                                  onClick={executeImportDatabase}
                                  disabled={importingDb}
                                  className="w-2/3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition"
                                >
                                  {importingDb ? (
                                    <>⏳ กำลังเขียนทับฐานข้อมูล...</>
                                  ) : (
                                    <>📥 ยืนยันนำเข้าข้อมูล</>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>

                  {/* Firestore Manual Sync Card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-2 border border-indigo-100">
                        <RefreshCw size={24} className={syncingFirestore ? "animate-spin" : ""} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">🔄 ดึงข้อมูลล่าสุดจาก Cloud Firestore (Real-time Sync)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ในระบบโปรดักชันจริง (nateeplus.com) ข้อมูลอาจถูกเก็บแยกตามเซิร์ฟเวอร์ย่อย (Multi-instance Containers ของ Cloud Run) 
                        เมื่อเกิดความล่าช้าหรือข้อมูลแสดงผลไม่ทันที ท่านสามารถคลิกปุ่มนี้เพื่อสั่งให้เซิร์ฟเวอร์ดึงข้อมูลล่าสุดจากฐานข้อมูลระบบ Cloud Firestore มาแสดงผลโดยสมบูรณ์ได้ทันทีค่ะ
                      </p>
                    </div>

                    {isUsingPollingFallback ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                        <span className="text-xl">🛡️</span>
                        <h4 className="text-xs font-bold text-slate-800">ระบบทำงานบนเซิร์ฟเวอร์หลัก (Direct Server Mode)</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          ระบบกำลังประมวลผลบนเซิร์ฟเวอร์หลักด้วยความเสถียรสูงสุด สมาชิกทุกท่านสามารถทำธุรกรรมได้อย่างราบรื่นและปลอดภัย 100%
                        </p>
                      </div>
                    ) : (
                      <button
                        id="force_sync_firestore_btn"
                        onClick={handleFirestoreSync}
                        disabled={syncingFirestore}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                      >
                        {syncingFirestore ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> กำลังซิงค์ข้อมูลกับฐานข้อมูล Cloud...
                          </>
                        ) : (
                          <>
                            🔄 ซิงค์ฐานข้อมูลสดจาก Cloud Firestore
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Rebuild Binary Tree Card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-2 border border-amber-100">
                        <RefreshCw size={24} className={rebuildingTree ? "animate-spin" : ""} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">🔧 ซ่อมแซมและจัดเรียงโครงสร้างสายงานแผน A (Rebuild Placement Tree)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        หากท่านพบว่ามีสมาชิกสมัครหรืออัปเกรดตำแหน่งเป็น S หรือสูงกว่าแล้ว แต่ข้อมูลคลาดเคลื่อนไม่ปรากฏรายชื่ออยู่ใน <strong>ผังสายงานขยาย 2 (แผน A)</strong> 
                        ท่านสามารถคลิกปุ่มนี้เพื่อสั่งให้ระบบคำนวณและประมวลผลจัดวางตำแหน่งสายงานของสมาชิก S ขึ้นไปทั้งหมดเข้าสู่ผังระบบใหม่อัตโนมัติอย่างถูกต้องสมบูรณ์ พร้อมเซฟบันทึกคลาวด์ทันทีค่ะ
                      </p>
                    </div>

                    <button
                      id="rebuild_binary_tree_btn"
                      onClick={handleRebuildBinaryTree}
                      disabled={rebuildingTree}
                      className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                    >
                      {rebuildingTree ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> กำลังประมวลผลจัดเรียงโครงสร้างสายงานใหม่...
                        </>
                      ) : (
                        <>
                          🔧 ประมวลผลจัดเรียงและซ่อมแซมผังสายงานขยาย 2 แผน A
                        </>
                      )}
                    </button>
                  </div>

                  {/* Go-Live Reset Card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-2">
                        <Settings size={24} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">⚙️ เคลียร์ฐานข้อมูลระบบเพื่อพร้อมใช้งานจริง (Go-Live Reset)</h3>
                      <p className="text-xs text-slate-400">ล้างข้อมูลประวัติและยอดเงินจากการทดสอบระบบ เพื่อเตรียมการเปิดรับเงินและลงทะเบียนสมาชิกจริง</p>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-700 space-y-2">
                      <p className="font-extrabold flex items-center gap-1.5 text-rose-800">
                        🚨 คำเตือนสำคัญด้านความปลอดภัยและกฎหมายภาษี:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-rose-600 font-semibold">
                        <li>การกระทำนี้จะล้างข้อมูลและยอดเงินสะสมในกระเป๋าเงินทั้งหมดของสมาชิกทุกรายให้กลายเป็น <strong>฿ 0.00</strong> บาททันที</li>
                        <li>บัญชีสมาชิกที่ถูกสร้างขึ้นเพื่อทดสอบ (เช่น pizzaone และสมาชิกจำลองอื่น ๆ) จะถูกลบออกอย่างถาวร</li>
                        <li>ประวัติรายการสั่งซื้อสินค้า, ประวัติการฝากเงิน/ถอนเงิน, และบันทึกบัญชีธุรกรรม (Ledger) ทั้งหมดจะถูกเคลียร์เป็นค่าว่าง</li>
                        <li>ข้อมูลสายงานใน <strong>แผนไบนารี่ 20 ชั้น และ แผน B</strong> ทั้งหมดจะถูกจัดระเบียบล้างโครงสร้างเพื่อความถูกต้องสูงสุดทางภาษีสรรพากร</li>
                        <li>บัญชีผู้ดูแลระบบหลักระดับสูงสุด (nateeplus, admin, manager) จะได้รับสิทธิ์คงอยู่ตามเดิมแต่มีเงินสำรองเริ่มต้นเป็น 0.00 บาท</li>
                        <li>แพ็กเกจสินค้าเปิดสิทธิ์ร้านค้ามาตรฐาน (S, M, L, XL, XXL) และรายการผลิตภัณฑ์ของแอดมินจะถูก <strong>อนุรักษ์คงไว้</strong> เช่นเดิม เพื่อให้ระบบพร้อมสแตนด์บายขายสินค้าได้ทันที</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          พิมพ์ข้อความเพื่อยืนยันการทำรายการ:
                        </label>
                        <p className="text-[10px] text-slate-400">กรุณาพิมพ์คำว่า <strong className="text-rose-600 select-all font-mono font-bold">RESET</strong> เพื่อยืนยันว่าท่านเข้าใจและยินยอมรับความเสี่ยงการล้างข้อมูลนี้</p>
                      </div>

                      <input
                        type="text"
                        value={resetConfirmationInput}
                        onChange={(e) => setResetConfirmationInput(e.target.value)}
                        placeholder="พิมพ์ RESET ตรงนี้..."
                        className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-center text-xs font-mono font-black uppercase text-rose-600 focus:outline-none focus:border-rose-500 placeholder-slate-300"
                      />

                      <button
                        onClick={handleSystemReset}
                        disabled={resettingSystem || resetConfirmationInput.trim().toUpperCase() !== "RESET"}
                        className={`w-full font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                          resetConfirmationInput.trim().toUpperCase() === "RESET" 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {resettingSystem ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> กำลังล้างระบบและเริ่มการทำงานใหม่...
                          </>
                        ) : (
                          <>
                            🗑️ ล้างประวัติธุรกรรมและเปิดใช้งานจริงทันที
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'packageChoices' && (
                <div className="space-y-6 animate-fadeIn text-slate-700">
                  {/* Header */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-indigo-600/20 blur-2xl"></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          📦 จัดการสินค้าแพ็กเกจ (Package Choices Manager)
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          ระบบเพิ่ม แก้ไข และลบตัวเลือกชุดของขวัญสินค้าสำหรับแพ็กเกจสมัครสมาชิก (S, M, L, XL, XXL) 
                          พร้อมระบบคำนวณต้นทุนการตั้งราคาวางขายภาษีและค่าจัดส่งสำหรับแอดมินค่ะ
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form to Add/Edit Choice */}
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        {adminEditingChoiceId ? '📝 แก้ไขตัวเลือกสินค้าแพ็กเกจ' : '➕ เพิ่มตัวเลือกสินค้าแพ็กเกจ'}
                      </h4>
                      <form onSubmit={handleAddPackageChoice} className="space-y-3.5 text-xs text-slate-700">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">เลือกแพ็กเกจหลัก</label>
                          <select 
                            value={adminNewChoicePackageId}
                            onChange={(e) => setAdminNewChoicePackageId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                          >
                            <option value="pack_m">M - ชุดครอบครัวประหยัด</option>
                            <option value="pack_l">L - ชุดดูแลสุขภาพแบบองค์รวม</option>
                            <option value="pack_xl">XL - ชุดนักขยายธุรกิจ</option>
                            <option value="pack_xxl">XXL - ชุดผู้ประกอบการ</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">ชื่อเซ็ต / ชุดสินค้า (Set Name)</label>
                          <input 
                            type="text"
                            placeholder="เช่น M-Set A: ชุดของใช้นทีพลัส 3 ชิ้น"
                            value={adminNewChoiceName}
                            onChange={(e) => setAdminNewChoiceName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">สถานะการแสดงผล (สมาชิกเห็นหรือไม่)</label>
                          <div className="flex gap-3 items-center">
                            <label className="inline-flex items-center gap-1 cursor-pointer select-none font-bold text-slate-600">
                              <input 
                                type="radio"
                                name="choiceIsActive"
                                checked={adminNewChoiceIsActive}
                                onChange={() => setAdminNewChoiceIsActive(true)}
                                className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">🟢 เปิดให้เลือก</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer select-none font-bold text-slate-600">
                              <input 
                                type="radio"
                                name="choiceIsActive"
                                checked={!adminNewChoiceIsActive}
                                onChange={() => setAdminNewChoiceIsActive(false)}
                                className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">🔴 ซ่อนไว้</span>
                            </label>
                          </div>
                        </div>

                        {/* Cost Calculation Section */}
                        {(() => {
                          const packagePrices: Record<string, number> = {
                            pack_s: 100,
                            pack_m: 500,
                            pack_l: 1000,
                            pack_xl: 3000,
                            pack_xxl: 5000
                          };
                          const computedSellingPrice = packagePrices[adminNewChoicePackageId] || 0;
                          const computedSalesVat = computedSellingPrice * 7 / 107;
                          const computedProductCost = parseFloat(adminNewChoiceProductPrice) || 0;
                          const computedInputVat = adminNewChoiceHasVat ? (computedProductCost * 0.07) : 0;
                          const computedProductCostWithVat = computedProductCost + computedInputVat;
                          const computedPackagingCost = parseFloat(adminNewChoicePackagingCost) || 0;
                          const computedShippingFee = parseFloat(adminNewChoiceShippingFee) || 0;
                          const computedVatPayable = computedSalesVat - computedInputVat;
                          const computedPvPayout = computedSellingPrice * 0.5; // หัก 50% ของราคาขาย เพื่อเป็น PV
                          const computedTotalExpense = computedProductCostWithVat + computedPackagingCost + computedShippingFee + computedVatPayable + computedPvPayout;
                          const computedRemaining = computedSellingPrice - computedTotalExpense;

                          return (
                            <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl space-y-4">
                              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block border-b border-indigo-100/50 pb-1 flex justify-between items-center">
                                <span>🧮 ระบบคำนวณและประมาณการภาษี</span>
                                <span className="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded text-[8px] font-mono">
                                  VAT & PV SYSTEM
                                </span>
                              </span>
                              
                              {/* 1. ราคาขายตามแพ็กเกจ (ล็อกตำแหน่ง) */}
                              <div className="bg-white p-2.5 rounded-xl border border-slate-100/80 flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-600">ราคาขายตามตำแหน่ง:</span>
                                <span className="font-extrabold text-slate-800 font-mono text-[13px]">
                                  ฿{computedSellingPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                              </div>

                              {/* 2. ภาษีขาย 7% */}
                              <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono px-1">
                                <span>ภาษีขาย (7% ในราคาขาย):</span>
                                <span className="font-bold text-slate-700">
                                  ฿{computedSalesVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                              </div>

                              {/* 3. ราคาทุนสินค้า */}
                              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                  <label className="block text-slate-600 font-semibold text-[11px]">ราคาทุนสินค้า (บาท)</label>
                                  {/* Checkbox สำหรับ มี Vat */}
                                  <label className="inline-flex items-center gap-1 cursor-pointer select-none text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                    <input 
                                      type="checkbox"
                                      checked={adminNewChoiceHasVat}
                                      onChange={(e) => setAdminNewChoiceHasVat(e.target.checked)}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                    />
                                    <span>มี Vat 7%</span>
                                  </label>
                                </div>
                                <input 
                                  type="number"
                                  step="0.01"
                                  placeholder="เช่น 150.00"
                                  value={adminNewChoiceProductPrice}
                                  onChange={(e) => setAdminNewChoiceProductPrice(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                />

                                {/* แสดงผลคำนวณราคาทุนรวม VAT */}
                                <div className="bg-white/80 p-2 rounded-xl border border-slate-100/50 text-[10px] space-y-1 font-mono text-slate-500">
                                  <div className="flex justify-between">
                                    <span>ภาษีซื้อต้นทุน (7%):</span>
                                    <span>
                                      {adminNewChoiceHasVat 
                                        ? `+ ฿${computedInputVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                        : '฿0.00 (ไม่คำนวณ)'
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between font-bold text-slate-700 border-t border-dashed border-slate-100 pt-1">
                                    <span>ทุนรวม VAT:</span>
                                    <span>฿{computedProductCostWithVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 4. ราคาบรรจุภัณฑ์ */}
                              <div>
                                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">ราคาบรรจุภัณฑ์ (Packaging Cost) (฿)</label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  placeholder="เช่น 15.00"
                                  value={adminNewChoicePackagingCost}
                                  onChange={(e) => setAdminNewChoicePackagingCost(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                              </div>

                              {/* 5. ค่าจัดส่ง */}
                              <div>
                                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">ค่าจัดส่ง (Shipping Cost) (฿)</label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  placeholder="เช่น 50.00"
                                  value={adminNewChoiceShippingFee}
                                  onChange={(e) => setAdminNewChoiceShippingFee(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                              </div>

                              {/* 6. หักจ่าย PV (50% ของราคาขาย) */}
                              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50 text-[11px] space-y-1 font-mono text-slate-700">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">หักจ่าย PV (50% ของราคาตั้งขาย):</span>
                                  <span className="font-extrabold text-amber-800">
                                    ฿{computedPvPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>
                              </div>

                              {/* 7. ภาษีนำส่ง ( ภาษีขาย-ภาษีต้นทุน ) */}
                              <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 text-[11px] space-y-1 font-mono text-slate-600">
                                <div className="flex justify-between">
                                  <span>ภาษีนำส่ง (ภาษีขาย - ภาษีต้นทุน):</span>
                                  <span className="font-bold text-indigo-700">
                                    ฿{computedVatPayable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>
                              </div>

                              {/* 8 & 9. รวมค่าใช้จ่าย และ คงเหลือ */}
                              <div className="border-t border-slate-100 pt-3 space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between font-bold text-slate-600">
                                  <span>รวมค่าใช้จ่ายทั้งหมด (รวมจ่าย PV):</span>
                                  <span className="text-rose-600 font-extrabold">
                                    ฿{computedTotalExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>
                                <div className="flex justify-between font-black text-[13px] text-slate-800 bg-emerald-50 border border-emerald-100/80 p-2 rounded-xl">
                                  <span className="text-emerald-800">คงเหลือสุทธิ (Net profit):</span>
                                  <span className="text-emerald-700">
                                    ฿{computedRemaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>
                              </div>

                              <div className="text-[9px] text-slate-400 leading-normal bg-white p-2 rounded-lg border border-slate-100">
                                📌 ระบบจะจัดเก็บข้อมูลลงในรายงานค่าใช้จ่ายบริษัท เพื่อแสดงผลกำไรสุทธิคงเหลือหลังหักภาษีมูลค่าเพิ่มนำส่งและต้นทุนจริงให้บริษัทค่ะ
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex gap-2 pt-2">
                          <button 
                            type="submit" 
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-xl transition shadow cursor-pointer text-center"
                          >
                            {adminEditingChoiceId ? '💾 อัปเดตข้อมูล' : '➕ บันทึกข้อมูล'}
                          </button>
                          {adminEditingChoiceId && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setAdminNewChoiceName('');
                                setAdminNewChoiceCost('');
                                setAdminNewChoiceProductPrice('');
                                setAdminNewChoiceShippingFee('');
                                setAdminNewChoiceHasVat(false);
                                setAdminNewChoicePackagingCost('');
                                setAdminNewChoiceIsActive(true);
                                setAdminEditingChoiceId(null);
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-2 px-3 rounded-xl transition cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* List of Existing Choices grouped by package */}
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-5 lg:col-span-2">
                      <div className="border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-black text-slate-850 uppercase tracking-tight flex items-center gap-1.5">
                          📋 รายการตัวเลือกชุดของขวัญสินค้าแยกตามแพ็กเกจหลัก
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          กล่องสินค้าแต่ละแพ็กเกจจะแยกจากกันเพื่อความสะดวกในการจัดการราคาขายรวมภาษีมูลค่าเพิ่มและค่าจัดส่งค่ะ
                        </p>
                      </div>

                      {/* Package Group Filter Tabs */}
                      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-1">
                        {[
                          { id: 'All', label: '📋 ดูทั้งหมด' },
                          { id: 'pack_m', label: '🏡 กลุ่ม M (1,000 บ.)' },
                          { id: 'pack_l', label: '🥗 กลุ่ม L (5,000 บ.)' },
                          { id: 'pack_xl', label: '⚡ กลุ่ม XL (10,000 บ.)' },
                          { id: 'pack_xxl', label: '💎 กลุ่ม XXL (50,000 บ.)' },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setAdminActivePackageFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                              adminActivePackageFilter === tab.id
                                ? 'bg-slate-850 text-white border-slate-850 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[680px] overflow-y-auto pr-1">
                        {[
                          {
                            id: 'pack_m',
                            name: 'M - ชุดครอบครัวประหยัด',
                            cost: 'ราคาซื้อแพ็กเกจ 500 บาท (250 PV)',
                            themeColor: 'blue',
                            gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
                            borderColor: 'border-blue-200/80',
                            textMuted: 'text-blue-800',
                            bgBadge: 'bg-blue-50 text-blue-800 border-blue-200',
                            accentBar: 'bg-blue-500',
                            desc: 'เซ็ตของใช้อุปโภคบริโภคขนาดประหยัดสำหรับครอบครัว',
                            icon: '🏡'
                          },
                          {
                            id: 'pack_l',
                            name: 'L - ชุดดูแลสุขภาพแบบองค์รวม',
                            cost: 'ราคาซื้อแพ็กเกจ 1,000 บาท (500 PV)',
                            themeColor: 'amber',
                            gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
                            borderColor: 'border-amber-200/80',
                            textMuted: 'text-amber-800',
                            bgBadge: 'bg-amber-50 text-amber-800 border-amber-200',
                            accentBar: 'bg-amber-500',
                            desc: 'เซ็ตสมุนไพรรวมและเครื่องดื่มสุขภาพสกัดเข้มข้น',
                            icon: '🥗'
                          },
                          {
                            id: 'pack_xl',
                            name: 'XL - ชุดนักขยายธุรกิจ',
                            cost: 'ราคาซื้อแพ็กเกจ 3,000 บาท (1,500 PV)',
                            themeColor: 'rose',
                            gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
                            borderColor: 'border-rose-200/80',
                            textMuted: 'text-rose-800',
                            bgBadge: 'bg-rose-50 text-rose-800 border-rose-200',
                            accentBar: 'bg-rose-500',
                            desc: 'ชุดเซ็ตสกินแคร์กู้ผิวพรีเมียมและเครื่องใช้ไฟฟ้าพกพา',
                            icon: '⚡'
                          },
                          {
                            id: 'pack_xxl',
                            name: 'XXL - ชุดผู้ประกอบการจังหวัด',
                            cost: 'ราคาซื้อแพ็กเกจ 5,000 บาท (2,500 PV)',
                            themeColor: 'purple',
                            gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
                            borderColor: 'border-purple-200/80',
                            textMuted: 'text-purple-800',
                            bgBadge: 'bg-purple-50 text-purple-800 border-purple-200',
                            accentBar: 'bg-purple-500',
                            desc: 'เซ็ตเปิดศูนย์โมบายจุดกระจายสินค้าครบวงจร รับสิทธิ์สูงสุด',
                            icon: '💎'
                          }
                        ].filter(pkg => adminActivePackageFilter === 'All' || pkg.id === adminActivePackageFilter).map(pkg => {
                          const choices = packageChoices.filter(c => c.packageId === pkg.id);
                          return (
                            <div 
                              key={pkg.id} 
                              className={`border ${pkg.borderColor} rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between`}
                            >
                              {/* Card Header with Custom Gradient Background */}
                              <div className={`p-4 bg-gradient-to-br ${pkg.gradient} border-b border-slate-100/60 relative`}>
                                <div className="absolute top-3 right-3 text-lg opacity-80">{pkg.icon}</div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-700 animate-pulse"></span>
                                    <h5 className="font-black text-slate-900 text-xs tracking-tight">
                                      {pkg.name}
                                    </h5>
                                  </div>
                                  <p className="text-[10px] font-bold text-indigo-600 font-mono">
                                    {pkg.cost}
                                  </p>
                                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-1">
                                    {pkg.desc}
                                  </p>
                                </div>
                              </div>

                              {/* Card Body - Package Option List */}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-slate-50/20">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>ตัวเลือกสินค้าภายในชุด</span>
                                    <span className={`px-2 py-0.5 rounded-full ${pkg.bgBadge} text-[9px] font-mono`}>
                                      {choices.length} รายการ
                                    </span>
                                  </div>

                                  {choices.length > 0 ? (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                      {choices.map(choice => (
                                        <div 
                                          key={choice.id} 
                                          className="bg-white p-2.5 rounded-xl border border-slate-100/80 hover:border-slate-200 shadow-xs flex flex-col gap-1.5 text-xs transition-all"
                                        >
                                          {/* First Row: Name and Actions */}
                                          <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 flex flex-col space-y-1">
                                              <span className="font-extrabold text-slate-800 leading-tight text-[11px] block">
                                                {choice.name}
                                              </span>
                                              
                                              {/* Toggle Status & View Details Inline Buttons */}
                                              <div className="flex items-center gap-1.5 flex-wrap">
