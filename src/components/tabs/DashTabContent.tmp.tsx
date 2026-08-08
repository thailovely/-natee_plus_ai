              {activeTab === 'dash' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm">
                <div className="text-left space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl font-black text-slate-800">ยินดีต้อนรับเข้าสู่</span>
                    <div className="flex items-center gap-2 bg-slate-50/90 px-3 py-1 rounded-2xl border border-slate-100 shadow-sm">
                      <img src="/favicon.svg" alt="Natee Plus Logo" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
                      <span className="text-lg font-extrabold tracking-wider">
                        <span className="text-sky-500">นที</span> <span className="text-orange-500">พลัส</span> <span className="text-sky-400">มาร์เก็ต</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">ภาพรวมความสุขของกระเป๋าร้านค้าออนไลน์ นที พลัส มาร์เก็ต ของคุณวันนี้</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 ml-auto md:ml-0 shrink-0">
                  <button 
                    onClick={() => {
                      setActiveTab('shop');
                      setShopPortalView('store');
                      setShopSubTab('shop');
                    }}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>🛍️</span> นที พลัส มาร์เก็ต
                  </button>
                  <button 
                    onClick={() => setActiveTab('txn')}
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>💰</span> เติมเงิน E-Cash
                  </button>
                </div>
              </div>



              {/* Activation Package Reminder for new Member rank */}
              {profile?.rank === 'Member' && (
                <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-indigo-500/5 border border-amber-500/30 rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm animate-fadeIn">
                  <div className="space-y-3 flex-1 text-left">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                      รหัสสมาชิกยังไม่เปิดใช้งาน (ยังไม่ได้ชำระค่าแพ็กเกจ)
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        เลือกแพ็กเกจเริ่มต้นเพื่อเปิดใช้งานรหัสและเริ่มทำธุรกิจ:
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {products.filter(p => p.category === 'Package').map(pkg => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setActivationPackageId(pkg.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex flex-col items-start ${
                              activationPackageId === pkg.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span>{pkg.name.split(' - ')[0]}</span>
                            <span className={`text-[10px] font-medium ${activationPackageId === pkg.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                              ฿{pkg.price.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {(() => {
                      const selectedPkg = products.find(p => p.id === activationPackageId);
                      if (!selectedPkg) return null;
                      return (
                        <div className="bg-white/50 border border-slate-200 rounded-2xl p-4 mt-2 space-y-1">
                          <p className="text-xs text-slate-700 font-semibold">
                            🎁 {selectedPkg.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {selectedPkg.description}
                          </p>
                          <p className="text-xs text-indigo-600 font-extrabold">
                            ราคา: ฿{selectedPkg.price.toLocaleString()} | ได้รับคะแนนสะสม: {selectedPkg.pv.toLocaleString()} PV | ได้รับสิทธิ์ปันผลสูงสุด: ฿{(selectedPkg.price * 10).toLocaleString()} (สิทธิ์รับรายได้ 10 เท่า)
                          </p>
                        </div>
                      );
                    })()}
                    <p className="text-[10px] text-slate-400">
                      *กรุณาเติมเงิน E-Cash ในกระเป๋าให้เพียงพอ จากนั้นกดปุ่มชำระเงินเพื่อเริ่มต้นสิทธิ์แนะนำสมาชิกและเข้าร่วมสายงานในผังต้นไม้ทันทีค่ะ
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto self-stretch lg:self-center items-stretch justify-center">
                    <button 
                      onClick={() => setActiveTab('txn')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-2xl text-xs transition text-center shrink-0 cursor-pointer flex items-center justify-center"
                    >
                      เติมเงิน E-Cash
                    </button>
                    <button 
                      onClick={() => handlePurchaseProduct(activationPackageId)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition text-center shrink-0 cursor-pointer flex items-center justify-center"
                    >
                      💳 ชำระค่าแพ็กเกจเพื่อเริ่มธุรกิจ
                    </button>
                  </div>
                </div>
              )}

              {/* Bento Grid Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-white/10 p-2.5 rounded-2xl">
                    <Wallet size={24} />
                  </div>
                  <span className="text-xs text-indigo-100 font-medium">E-Cash (บาท)</span>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-3">{profile?.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  <p className="text-[10px] text-indigo-200 mt-4">กระเป๋าเงินฝากเข้าจากภายนอก สำหรับซื้อแพ็กเกจหรือโอนเปลี่ยน</p>
                  <button 
                    onClick={() => { setActiveTab('report'); setReportSubTab('ecash'); }}
                    className="mt-4 text-[9px] bg-white text-indigo-700 font-bold px-3 py-1 rounded-lg hover:bg-indigo-50 transition"
                  >
                    ดูรายงาน E-Cash
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-white/10 p-2.5 rounded-2xl">
                    <Coins size={24} />
                  </div>
                  <span className="text-xs text-purple-100 font-medium font-semibold">E-Money (บาท)</span>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-3">{profile?.balanceEMoney?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200">
                    <span className="font-medium">ยอดรายได้สะสมทั้งหมด:</span>
                    <span className="font-extrabold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-md">฿{(profile?.totalEarnings || profile?.balanceEMoney || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <p className="text-[10px] text-purple-200 mt-3">กระเป๋าเงินรายได้ระบบทั้งหมด สำหรับถอนเงินหรือโอนเปลี่ยน</p>
                  <button 
                    onClick={() => { setActiveTab('report'); setReportSubTab('emoney'); }}
                    className="mt-4 text-[9px] bg-white text-purple-700 font-bold px-3 py-1 rounded-lg hover:bg-purple-50 transition"
                  >
                    ดูรายงาน E-Money
                  </button>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-white/10 p-2.5 rounded-2xl">
                    <ShoppingBag size={24} />
                  </div>
                  <span className="text-xs text-emerald-100 font-medium">E-Coupon (บาท)</span>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-3">{profile?.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-100">
                    <span className="font-medium">ยอดคูปองสะสมทั้งหมด:</span>
                    <span className="font-extrabold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-md">฿{(profile?.totalCouponsEarned || profile?.balanceECoupon || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  <p className="text-[10px] text-emerald-200 mt-3">ใช้เป็นส่วนลดหรือชำระค่าสินค้าหลักบนเว็บนทีมาร์เก็ต</p>
                  <button 
                    onClick={() => { setActiveTab('report'); setReportSubTab('ecoupon'); }}
                    className="mt-4 text-[9px] bg-white text-emerald-700 font-bold px-3 py-1 rounded-lg hover:bg-emerald-50 transition"
                  >
                    ดูรายงาน E-Coupon
                  </button>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-white/10 p-2.5 rounded-2xl">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-xs text-amber-100 font-medium font-semibold">โบนัส All-Share สะสม (สุทธิหักแล้ว 50%)</span>
                  <h3 className="text-2xl font-extrabold tracking-tight mt-3">
                    {((profile?.balanceEShare || 0) * 0.50).toFixed(7)}
                  </h3>
                  <p className="text-[10px] text-amber-100/90 mt-5">ยอดสิทธิ์การเป็นเจ้าของส่วนแบ่งบริษัทหลังจัดสรร Plan B</p>
                  <button 
                    onClick={() => { setActiveTab('report'); setReportSubTab('eshare'); }}
                    className="mt-4 text-[9px] bg-white text-amber-700 font-bold px-3 py-1 rounded-lg hover:bg-amber-50 transition"
                  >
                    ดูรายงาน All-Share
                  </button>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden col-span-1 sm:col-span-2 lg:col-span-1">
                  <div className="absolute right-4 top-4 bg-white/10 p-2.5 rounded-2xl">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">สิทธิ์รับรายได้คงเหลือ (10 เท่า)</span>
                  <h3 className="text-xl font-extrabold tracking-tight mt-3 text-emerald-400">
                    {profile?.role === 'Manager' || profile?.role === 'Admin' 
                      ? 'ไร้ขีดจำกัด (Unlimited)' 
                      : `${getRemainingRights()?.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท`}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-5">ยอดสิทธิ์การรับผลประโยชน์คงเหลือสูงสุดของตำแหน่งรหัส {profile?.rank}</p>
                </div>
              </div>

              {/* Activity Scrolling, Banner, CSR Fund Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CSR Fund Display */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <span className="p-1.5 bg-rose-50 rounded-xl text-rose-500"><Star size={18} /></span>
                      กองทุนปันสุข CSR นทีพลัส
                    </h4>
                    <p className="text-xs text-slate-400">เงินสะสมเพื่อกิจกรรมสาธารณประโยชน์ส่วนรวม</p>
                    <div className="mt-4 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
                      <span className="text-[10px] text-rose-500 font-bold block">ยอดเงินกองทุนรวมล่าสุด</span>
                      <span className="text-3xl font-extrabold text-rose-700">฿ {(csrBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4 flex-1 flex flex-col min-h-[290px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-800">ผู้ร่วมปันสุขล่าสุด 20 อันดับ</span>
                      <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full font-bold animate-pulse">LIVE FEED</span>
                    </div>
                    {csrFeed.length > 0 ? (
                      <div className="relative h-[238px] overflow-hidden rounded-2xl bg-slate-50/60 p-2 border border-slate-100/80 shadow-inner">
                        {/* Smooth top & bottom fade mask */}
                        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-50/90 to-transparent pointer-events-none z-10"></div>
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50/90 to-transparent pointer-events-none z-10"></div>
                        
                        <div 
                          className="animate-scroll-up space-y-2"
                          style={{
                            animationDuration: `${Math.max(15, Math.min(20, csrFeed.length) * 2.5)}s`
                          }}
                        >
                          {(() => {
                            const sortedFeed = [...csrFeed].reverse().slice(0, 20);
                            return [...sortedFeed, ...sortedFeed].map((item, idx) => (
                              <div key={idx} className="h-[38px] flex justify-between items-center text-[11px] text-slate-600 bg-white px-3.5 rounded-xl border border-slate-100 shadow-sm transition hover:scale-[1.01] hover:border-rose-100">
                                <span className="font-semibold flex items-center gap-1.5 min-w-0">
                                  <span className="text-rose-500 shrink-0">💖</span>
                                  <span className="truncate">คุณ {(item.name && item.name !== 'undefined undefined') ? item.name : (item.username && item.username !== 'undefined undefined' ? item.username : 'ผู้ใหญ่ใจดี')}</span>
                                </span>
                                <span className="text-rose-500 font-extrabold shrink-0 bg-rose-50/50 px-2 py-0.5 rounded-lg border border-rose-100/30">฿{(typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : (parseFloat(item.amount || '0') || 0)).toFixed(2)}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                        <span className="text-lg">🌸</span>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">เริ่มต้นแบ่งปันสิ่งดีๆ ด้วยกองทุนปันสุขร่วมกันนะคะ</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Referral Links Copy Utility */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <span className="p-1.5 bg-sky-50 rounded-xl text-sky-500"><Copy size={18} /></span>
                      ลิงก์ขยายธุรกิจสำหรับสปอนเซอร์แนะนำเพื่อน
                    </h4>
                    <p className="text-xs text-slate-400">ผู้แนะนำผู้สมัครจะได้รับสิทธิ์โบนัสแนะนำตรงทันที 50 บาท (50% ของราคาแพ็กเกจ) เมื่อเพื่อนสมัครซื้อแพ็กเกจ S</p>
                    
                    <div className="mt-6 space-y-4">
                      {(['S','M','L','XL','XXL'].includes(profile?.rank || '') || profile?.role === 'Admin' || profile?.username === 'nateeplus' || profile?.userId === 'A260600001' || profile?.userId === 'A260700001') ? (
                        <div>
                          <label className="block text-slate-600 text-xs font-bold mb-2">ลิงก์ลงทะเบียนสัญชาติไทยของคุณ</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly
                              value={`${window.location.origin}/join?sponsor=${profile?.userId}`}
                              onClick={() => {
                                if (profile?.username === 'nateeplus' || profile?.userId === 'A260600001' || profile?.userId === 'A260700001') {
                                  handleLogout();
                                  clearRegisterForm(profile?.userId || '');
                                  setAuthMode('register');
                                  showNotif(`สลับไปหน้าสมัครสมาชิกใหม่โดยมีคุณ (${profile?.userId}) เป็นผู้แนะนำ`, 'success');
                                }
                              }}
                              className={`flex-1 ${
                                (profile?.username === 'nateeplus' || profile?.userId === 'A260600001' || profile?.userId === 'A260700001')
                                  ? 'bg-indigo-50/30 hover:bg-indigo-50 border-indigo-200 text-indigo-700 cursor-pointer'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              } border rounded-xl px-4 py-3 text-xs focus:outline-none transition-all duration-200 font-semibold`}
                              title={
                                (profile?.username === 'nateeplus' || profile?.userId === 'A260600001' || profile?.userId === 'A260700001')
                                  ? "คลิกเพื่อไปยังหน้าสมัครสมาชิกด้วยรหัสสปอนเซอร์ของคุณ"
                                  : "ลิงก์สปอนเซอร์แนะนำเพื่อนของคุณ"
                              }
                            />
                            {(profile?.username === 'nateeplus' || profile?.userId === 'A260600001' || profile?.userId === 'A260700001') && (
                              <button 
                                onClick={() => {
                                  handleLogout();
                                  clearRegisterForm(profile?.userId || '');
                                  setAuthMode('register');
                                  showNotif(`สลับไปหน้าสมัครสมาชิกใหม่โดยมีคุณ (${profile?.userId}) เป็นผู้แนะนำ`, 'success');
                                }}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                title="ไปยังหน้าสมัครสมาชิกใหม่"
                              >
                                <Plus size={14} />
                                สมัครสมาชิก
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/join?sponsor=${profile?.userId}`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                                showNotif('คัดลอกลิงก์แนะนำเข้าคลิปบอร์ดแล้ว!', 'success');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl text-xs space-y-1.5 text-amber-950">
                          <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                            🔒 สมาชิกตำแหน่ง Member จะยังไม่มีลิงก์สปอนเซอร์แนะนำเพื่อนค่ะ
                          </p>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            เพื่อป้องกันการสร้างบัญชีสปอนเซอร์ซ้ำ สมาชิกต้องทำการเลือกสั่งซื้อแพ็กเกจเปิดตำแหน่ง <strong>Silver (S) ขึ้นไป (S, M, L, XL, XXL)</strong> ก่อนนะคะ จึงจะได้รับสิทธิ์และลิงก์สปอนเซอร์เพื่อส่งให้เพื่อนสมัครต่อ
                          </p>
                          <button
                            onClick={() => {
                              setActiveTab('shop');
                              setShopSubTab('packages');
                            }}
                            className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer inline-flex items-center gap-1"
                          >
                            🛒 ไปซื้อแพ็กเกจเปิดตำแหน่ง S ขึ้นไป
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">คู่มือแนะนำธุรกิจเบื้องต้น</h5>
                      <p className="text-[10px] text-slate-500 mt-1">เริ่มจากการเติมเงินเข้ากระเป๋า E-Cash ของท่าน แล้วทำการซื้อแพ็กเกจตำแหน่ง S เพื่อเปิดร้านออนไลน์!</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      )}

          {/* PROFILE & KYC TAB */}
