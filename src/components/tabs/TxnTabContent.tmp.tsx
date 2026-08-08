          {activeTab === 'txn' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">ธุรกรรมการเงินกระเป๋า นที พลัส 💳</h2>
                <p className="text-xs text-slate-400 mt-1">บริหารจัดการยอดเงิน E-Cash โอน ย้ายกระเป๋า และ ส่งคำสั่งถอนยอดรายได้</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: Deposit E-Cash */}
                <div className="space-y-6">
                  {/* Deposit E-Cash Mock */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <Wallet size={16} /> แจ้งฝากเงินหลักฐานโอนเงิน E-Cash 💸
                    </h4>
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center space-y-4 shadow-sm">
                      
                      {/* Step 1: ยอดเงินต้องการเติม */}
                      <div className="space-y-3 text-left">
                        <div>
                          <label className="block text-slate-700 font-bold text-xs mb-1.5">💵 1. ยอดเงินต้องการเติม (บาท) *</label>
                          <div className="flex gap-2">
                            <input 
                              type="number"
                              value={topupAmount}
                              onChange={(e) => {
                                setTopupAmount(e.target.value);
                                // Clear confirmed decimal/actual amount on edit to force re-confirm
                                setTopupDecimal('');
                                setTopupActualAmount('');
                              }}
                              className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                              placeholder="ระบุจำนวนเงินที่ต้องการเติม"
                            />
                            <button
                              type="button"
                              onClick={handleTopupRequest}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition shadow-sm"
                            >
                              ยืนยันยอดที่จะโอน
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 1.5: Big randomized transfer amount shown once confirmed */}
                      {topupDecimal ? (
                        <div className="space-y-4 animate-fadeIn">
                          
                          {/* BIG TEXT TOTAL AMOUNT */}
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center shadow-inner">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">ยอดเงินที่ท่านต้องโอนจริง (รวมเศษทศนิยมสุ่ม)</span>
                            <span className="text-3xl font-black text-indigo-700 font-mono block">
                              {topupActualAmount} บาท
                            </span>
                            <span className="text-[10px] text-rose-600 font-extrabold block mt-1.5 leading-normal">
                              ⚠️ กรุณาโอนยอดเงินตรงตามทศนิยมด้านบนนี้ เพื่อความถูกต้องรวดเร็วในการอนุมัติค่ะ
                            </span>
                          </div>

                          {/* SHOW QR Code and Bank info configured by Manager */}
                          <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-3 shadow-sm text-left">
                            <div className="text-center font-bold text-xs text-slate-700 border-b border-slate-100 pb-2">
                              รายละเอียดช่องทางชำระเงิน
                            </div>

                            <div className="flex flex-col items-center gap-3">
                              {bankSettings.qrCodeUrl ? (
                                <div className="w-36 h-36 border border-slate-100 rounded-xl p-1 bg-white shadow-inner flex items-center justify-center">
                                  <img 
                                    src={bankSettings.qrCodeUrl} 
                                    alt="Bank QR Code" 
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="mx-auto w-36 h-36 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-inner">
                                  <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase text-center p-2">QR CODE SIMULATED</span>
                                </div>
                              )}
                              <p className="text-[10px] text-slate-500 font-bold leading-normal text-center">
                                สแกน QR Code ด้านบนเพื่อสแกนจ่ายเงินผ่านแอปธนาคารของท่าน
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">🏦 ธนาคาร:</span>
                                <strong className="text-slate-800">{bankSettings.bankName}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">💳 เลขที่บัญชี:</span>
                                <strong className="text-indigo-600 font-mono">{bankSettings.bankAccount}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">👤 ชื่อบัญชี:</span>
                                <strong className="text-slate-800">{bankSettings.bankAccountName}</strong>
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center text-xs text-amber-800 font-semibold leading-relaxed">
                          💡 กรุณากรอกยอดเงินต้องการเติม และกดปุ่ม <strong className="text-indigo-600">"ยืนยันยอดที่จะโอน"</strong> เพื่อให้ระบบสุ่มตัวเลขจุดทศนิยมและแสดง QR Code / บัญชีธนาคารสำหรับโอนเงินค่ะ
                        </div>
                      )}

                      {/* Step 2, 3, 4 Inputs */}
                      <div className="space-y-4 border-t border-slate-200/60 pt-4 text-left">
                        <div>
                          <label className="block text-slate-700 font-bold text-xs mb-1.5">💰 2. ยอดโอนเงินจริง (บาท) *</label>
                          <input 
                            type="number"
                            step="0.01"
                            disabled={!topupDecimal}
                            value={topupActualAmount}
                            onChange={(e) => setTopupActualAmount(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-55"
                            placeholder="จะแสดงอัตโนมัติเมื่อกดยืนยันยอดด้านบน"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold text-xs mb-1.5">📅 3. วันที่ทำรายการโอนเงิน *</label>
                          <input 
                            type="date"
                            disabled={!topupDecimal}
                            value={topupTransferDate}
                            onChange={(e) => setTopupTransferDate(e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-55"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold text-xs mb-1.5">🕒 4. เวลาที่โอนเงิน *</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="block text-slate-400 text-[10px] mb-1">ชั่วโมง *</span>
                              <select
                                disabled={!topupDecimal}
                                value={topupTransferHour}
                                onChange={(e) => setTopupTransferHour(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-55 cursor-pointer"
                              >
                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-[10px] mb-1">นาที *</span>
                              <select
                                disabled={!topupDecimal}
                                value={topupTransferMinute}
                                onChange={(e) => setTopupTransferMinute(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-55 cursor-pointer"
                              >
                                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-slate-200/60 pt-4 text-left">
                        <label className="block text-slate-700 font-bold text-xs mb-1">📷 5. อัปโหลดรูปสลิปทำรายการโอน *</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            disabled={!topupDecimal}
                            id="custom-slip-upload"
                            onChange={handleSlipFileChange}
                            className="hidden"
                          />
                          <label 
                            htmlFor="custom-slip-upload"
                            className={`flex flex-col items-center justify-center border border-dashed border-indigo-300 bg-indigo-50/10 hover:bg-indigo-50/40 rounded-2xl p-4 cursor-pointer transition text-center space-y-1.5 ${!topupDecimal ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                          >
                            <Upload size={24} className="text-indigo-500 animate-pulse" />
                            <span className="text-xs font-bold text-rose-600 leading-relaxed max-w-[240px]">
                              {topupSlip ? `✓ เลือกไฟล์สำเร็จ: ${topupSlip}` : "กรุณาใส่สลิปจริง หากพบการทุจริต อาจถูกดำเนินคดีตามกฎหมาย"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              (คลิกเพื่ออัปโหลดไฟล์รูปภาพ)
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      {qrScanMessage && (
                        <div className={`p-3 rounded-2xl text-[11px] leading-normal font-semibold text-left ${
                          detectedQrCode 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : isScanningQr 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {qrScanMessage}
                        </div>
                      )}
                      
                      <button 
                        onClick={handleTopupSubmit}
                        disabled={isSubmittingTopup || !topupSlip || !topupAmount || parseFloat(topupAmount) <= 0 || !topupActualAmount || parseFloat(topupActualAmount) <= 0 || !topupTransferDate}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs disabled:text-slate-500 cursor-pointer shadow-sm transition"
                      >
                        {isSubmittingTopup ? 'กำลังส่งข้อมูล...' : 'ยืนยันส่งหลักฐานโอนเงินเพื่อตรวจสอบ'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2: Separate Frames for Transfer, Exchange, Withdrawal */}
                <div className="space-y-6">
                  
                  {/* Frame 1: โอนเงิน E-Cash ระหว่างสมาชิก */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <UserCheck size={16} className="text-indigo-600" /> โอนเงิน E-Cash ระหว่างสมาชิก 💸
                    </h4>
                    <form onSubmit={initiateTransferECashMember} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Recipient Input with Check Button */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">รหัสผู้ใช้ / เบอร์โทรศัพท์ปลายทาง *</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              required
                              value={transferUser}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTransferUser(val);
                                setTransferRecipientInfo(null);
                                setTransferRecipientChecked(false);
                                setTransferRecipientError(null);
                              }}
                              placeholder="ไอดีผู้รับ หรือ เบอร์โทรศัพท์"
                              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleCheckTransferRecipient}
                              disabled={isVerifyingRecipient}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer disabled:bg-slate-300 flex items-center gap-1 shrink-0"
                            >
                              {isVerifyingRecipient ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
                            </button>
                          </div>

                          {/* Recipient Status Messages */}
                          {transferRecipientChecked && transferRecipientInfo && (
                            <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] font-medium flex items-center justify-between">
                              <span className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-emerald-700 font-bold">✓ ผู้รับเงิน:</span>
                                <strong className="font-bold text-slate-900">{transferRecipientInfo.name}</strong>
                                <span className="text-slate-500 font-mono text-[10px]">({transferRecipientInfo.userId})</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                ยืนยันแล้ว
                              </span>
                            </div>
                          )}

                          {transferRecipientError && (
                            <p className="text-rose-600 text-[10px] font-bold mt-1.5 flex items-center gap-1">
                              <span>✗</span> {transferRecipientError}
                            </p>
                          )}

                          {!transferRecipientChecked && transferUser.trim() && !transferRecipientError && (
                            <p className="text-amber-600 text-[9px] mt-1">
                              ⚠ กรุณากดปุ่ม "ตรวจสอบ" เพื่อยืนยันชื่อผู้รับโอนเงินก่อนค่ะ
                            </p>
                          )}
                        </div>

                        {/* Amount Input */}
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">จำนวนยอดเงิน (E-Cash) *</label>
                          <input 
                            type="number" 
                            required
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="ระบุจำนวนเงินที่ต้องการโอน"
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* PIN and Submit */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">รหัส PIN 6 หลัก *</label>
                          <input 
                            type="password" 
                            required
                            maxLength={6}
                            value={transferPin}
                            onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="ใส่รหัสธุรกรรม PIN 6 หลัก"
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <button 
                            type="submit" 
                            disabled={isVerifyingRecipient} 
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-6 rounded-xl text-xs font-bold transition shadow-sm disabled:bg-slate-300 cursor-pointer"
                          >
                            ยืนยันการโอนเงิน
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Frame 2: โอนย้ายสลับกระเป๋าเงินภายในระบบ */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <Coins size={16} className="text-purple-600" /> โอนย้ายสลับกระเป๋าเงินภายในระบบ 🔁
                    </h4>
                    
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-4 text-xs shadow-inner">
                      
                      {/* Option A: E-Cash to E-Money (10% fee) */}
                      <div className="border-b border-slate-200 pb-4">
                        <span className="font-bold text-slate-800 block mb-1">1. โอน E-Cash ไปกระเป๋า E-Money (มีค่าบริการ 10%)</span>
                        <p className="text-[10px] text-slate-400 mb-2">หักค่าบริการจัดสรร All-Share 5% และสิทธิบริษัท 5% รวม 10%</p>
                        <form onSubmit={initiateTransferECashToEMoney} className="grid grid-cols-3 gap-2">
                          <input 
                            type="number" 
                            required
                            value={ecashToEmoneyAmount}
                            onChange={(e) => setEcashToEmoneyAmount(e.target.value)}
                            placeholder="จำนวนเงิน"
                            className="border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] bg-white"
                          />
                          <input 
                            type="password" 
                            required
                            maxLength={6}
                            value={ecashToEmoneyPin}
                            onChange={(e) => setEcashToEmoneyPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="PIN 6 หลัก"
                            className="border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] text-center font-mono tracking-widest bg-white"
                          />
                          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-[10px] transition cursor-pointer">
                            โอนเข้า E-Money
                          </button>
                        </form>
                      </div>

                      {/* Option B: E-Money to E-Cash (1:1 no fee) */}
                      <div className="border-b border-slate-200 pb-4">
                        <span className="font-bold text-slate-800 block mb-1">2. โอน E-Money ไปกระเป๋า E-Cash (อัตรา 1:1)</span>
                        <p className="text-[10px] text-slate-400 mb-2">ย้ายรายได้เข้ากระเป๋าหลัก เพื่อชำระค่าสิทธิ์แพ็กเกจหรือส่งต่อสมาชิก</p>
                        <form onSubmit={initiateTransferEMoneyToECash} className="grid grid-cols-3 gap-2">
                          <input 
                            type="number" 
                            required
                            value={emoneyToEcashAmount}
                            onChange={(e) => setEmoneyToEcashAmount(e.target.value)}
                            placeholder="จำนวนเงิน"
                            className="border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] bg-white"
                          />
                          <input 
                            type="password" 
                            required
                            maxLength={6}
                            value={emoneyToEcashPin}
                            onChange={(e) => setEmoneyToEcashPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="PIN 6 หลัก"
                            className="border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] text-center font-mono tracking-widest bg-white"
                          />
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] transition cursor-pointer">
                            ย้ายเข้า E-Cash
                          </button>
                        </form>
                      </div>

                      {/* Option C: E-Money to E-Coupon (1:1 no fee) */}
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">3. โอน E-Money ไปกระเป๋า E-Coupon (อัตรา 1:1)</span>
                        <p className="text-[10px] text-slate-400 mb-2">แลกรับเป็นแต้มคูปองซื้อสินค้าและสิทธิประโยชน์ในการช้อปปิ้ง</p>
                        <form onSubmit={initiateTransferEMoneyToECoupon} className="grid grid-cols-3 gap-2">
                          <input 
                            type="number" 
                            required
                            value={emoneyToEcouponAmount}
                            onChange={(e) => setEmoneyToEcouponAmount(e.target.value)}
                            placeholder="จำนวนเงิน"
                            className="border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] bg-white"
                          />
                          <input 
                            type="password" 
                            required
                            maxLength={6}
                            value={emoneyToEcouponPin}
                            onChange={(e) => setEmoneyToEcouponPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="PIN 6 หลัก"
                            className="border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] text-center font-mono tracking-widest bg-white"
                          />
                          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-[10px] transition cursor-pointer">
                            ย้ายเข้า E-Coupon
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>

                  {/* Frame 3: แลกเปลี่ยนคูปอง */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <CreditCard size={16} /> แลกเปลี่ยนยอด E-Cash ซื้อคูปอง E-Coupon 🛍️
                    </h4>
                    <form onSubmit={initiateBuyCoupon} className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">ยอดเงินที่ต้องการแลกเปลี่ยน (E-Cash)</label>
                        <input 
                          type="number" 
                          required
                          value={exchangeAmount}
                          onChange={(e) => setExchangeAmount(e.target.value)}
                          placeholder="จำนวนเงินที่ต้องการแลก"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">รหัส PIN ธุรกรรม 6 หลัก</label>
                        <input 
                          type="password" 
                          required
                          maxLength={6}
                          value={exchangePin}
                          onChange={(e) => setExchangePin(e.target.value.replace(/\D/g, ''))}
                          placeholder="PIN ธุรกรรม"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest"
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-100 mb-2">
                          ⚠️ เมื่อแลกยอด E-Cash ไปเป็น E-Coupon ช้อปปิ้งแล้ว จะไม่สามารถแลกกลับคืนมาเป็นยอดเงินเงินสดได้
                        </p>
                        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-xl cursor-pointer">
                          แลกสิทธิ์ E-Coupon คูปองช้อปปิ้งพอร์ทัล
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Frame 4: ถอนรายได้เข้าบัญชีธนาคารจากกระเป๋า E-Money */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <Star size={16} className="text-rose-500" /> ถอนยอดรายได้เข้าบัญชีธนาคาร (จากกระเป๋า E-Money) 🏦
                    </h4>
                    <form onSubmit={initiateWithdrawECash} className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">ยอดเงินต้องการถอน (E-Money)</label>
                        <input 
                          type="number" 
                          required
                          min={200}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="ยอดถอน E-Money (ขั้นต่ำ ฿200)"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">รหัส PIN ธุรกรรม 6 หลัก</label>
                        <input 
                          type="password" 
                          required
                          maxLength={6}
                          value={withdrawPin}
                          onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="PIN ธุรกรรม"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest"
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200/50 mb-1 font-medium">
                          ⚠️ การถอนเงินเข้าธนาคาร ต้องมียอดเงินใน E-Money ขั้นต่ำ 200 บาทขึ้นไป และยอดถอนขั้นต่ำคือ 200 บาทขึ้นไปค่ะ
                        </p>
                      </div>
                      <div className="col-span-2 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-[10px] space-y-1 text-slate-500">
                        <p>ชื่อผู้รับโอนเงินปลายทาง: <b>{profile?.name} {profile?.surname}</b></p>
                        <p>ธนาคาร: <b>{profile?.bankName} (เลขที่: {profile?.bankAccount})</b></p>
                        <p className="text-rose-600 font-bold">✓ หักสำรองกองทุนระบบ 20% (ฐานคำนวณภาษี 80%), หักภาษี ณ ที่จ่าย 3% (2.4%), ค่าแพลตฟอร์ม 2% (1.6%) รวมหัก 24% + ค่าธรรมเนียมโอน 25 บาท</p>
                        {withdrawAmount && parseFloat(withdrawAmount) >= 200 && (
                          <div className="mt-2 pt-2 border-t border-slate-200 text-xs font-bold text-slate-800 flex justify-between">
                            <span>ยอดเงินที่จะเข้าบัญชีจริง (สุทธิ 76% - 25 บาท):</span>
                            <span className="text-emerald-600 font-mono">฿ {Math.max(0, parseFloat(withdrawAmount) * 0.76 - 25).toFixed(2)} บาท</span>
                          </div>
                        )}
                      </div>
                      <button type="submit" className="col-span-2 w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl shadow-lg cursor-pointer">
                        ส่งคำขอถอนเงินรายได้ E-Money
                      </button>
                    </form>
                  </div>

                </div>
              </div>

              {/* Transactions list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers size={16} /> ประวัติและคิวการทำธุรกรรมของคุณ
                    </h4>
                    <p className="text-[10px] text-slate-400">รายการธุรกรรมการรับเงินคอมมิชชัน ค่าแนะนำ และยอดถอนสะสมเรียงล่าสุด</p>
                  </div>

                  {/* Rows per page selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">แสดงผล:</span>
                    <select
                      value={txnPerPage}
                      onChange={(e) => {
                        setTxnPerPage(parseInt(e.target.value, 10));
                        setTxnCurrentPage(1); // reset to page 1
                      }}
                      className="border border-slate-200 rounded-xl px-2 py-1 text-xs focus:outline-none bg-slate-50 text-slate-700 font-bold"
                    >
                      <option value={10}>10 แถว</option>
                      <option value={20}>20 แถว</option>
                      <option value={50}>50 แถว</option>
                      <option value={100}>100 แถว</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                        <th className="p-3">รหัสธุรกรรม</th>
                        <th className="p-3">ประเภทธุรกรรม</th>
                        <th className="p-3">ยอดเงินรายการ</th>
                        <th className="p-3">รายละเอียดบัญชีทำรายการ</th>
                        <th className="p-3">สถานะรายการ</th>
                        <th className="p-3">เวลาทำรายการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const sortedTxns = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        const totalTxns = sortedTxns.length;
                        const startIndex = (txnCurrentPage - 1) * txnPerPage;
                        const displayedTxns = sortedTxns.slice(startIndex, startIndex + txnPerPage);

                        if (displayedTxns.length > 0) {
                          return displayedTxns.map(t => (
                            <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-slate-700">{t.id}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  t.type === 'Bonus' || t.type === 'Deposit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  t.type === 'Exchange' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                                  'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {t.type === 'Deposit' ? 'เงินเข้า (E-Cash)' :
                                   t.type === 'Bonus' ? 'โบนัส MLM / คอมมิชชัน' :
                                   t.type === 'Exchange' ? 'แลกเปลี่ยนคูปอง' :
                                   t.type === 'WithdrawalRequest' ? 'ขอถอนเงินสด' : t.type}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-slate-800">฿ {t.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="p-3 text-slate-500">{t.details}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {t.status === 'Approved' ? 'อนุมัติเรียบร้อย' : 'รอตรวจสอบ'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400 text-[10px]">{new Date(t.createdAt).toLocaleString('th-TH')}</td>
                            </tr>
                          ));
                        } else {
                          return (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400">ยังไม่มีรายงานประวัติทำธุรกรรมในขณะนี้</td>
                            </tr>
                          );
                        }
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {(() => {
                  const sortedTxns = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  const totalTxns = sortedTxns.length;
                  const totalPages = Math.ceil(totalTxns / txnPerPage) || 1;
                  const startIndex = (txnCurrentPage - 1) * txnPerPage;
                  const endIndex = Math.min(startIndex + txnPerPage, totalTxns);

                  if (totalTxns === 0) return null;

                  return (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 text-xs text-slate-500 border-t border-slate-100">
                      <div>
                        แสดงผล <b>{startIndex + 1}-{endIndex}</b> จากทั้งหมด <b>{totalTxns}</b> รายการ
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTxnCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={txnCurrentPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
                        >
                          ก่อนหน้า
                        </button>
                        <span className="font-semibold text-slate-800">
                          หน้า {txnCurrentPage} จาก {totalPages}
                        </span>
                        <button
                          onClick={() => setTxnCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={txnCurrentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
                        >
                          ถัดไป
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Terms and conditions notes */}
                <div className="mt-6 p-5 bg-indigo-50/20 border border-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-2">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1">
                    📌 หมายเหตุเงื่อนไขและนโยบายกองทุนร่วมปันสุข:
                  </h5>
                  <p>1. <b>สิทธิ์การรับรายได้โบนัสสูงสุด (Quota Rights Limit):</b> จำกัดการรับโบนัสสะสมรวมสูงสุดไม่เกิน 10 เท่าของมูลค่าแพ็กเกจที่คุณสั่งซื้อ (เช่น แพ็กเกจ S (100 บ.) รับสิทธิ์ได้สูงสุด 1,000 บาท | M: 5,000 บาท | L: 10,000 บาท | XL: 30,000 บาท | XXL: 50,000 บาท) เมื่อสิทธิ์โบนัสครบกำหนด ระบบจะตัดยอดและโอนสิทธิ์ระดับถัดไปโดยอัตโนมัติ</p>
                  <p>2. <b>ความลึกชั้นสายงานแผน A (ไบนารี่):</b> สมาชิกจะได้รับผลประโยชน์คำนวณตามจำนวนชั้นลึกสูงสุดตามแพ็กเกจปัจจุบันของคุณ ได้แก่ S รับลึก 1 ชั้น | M ลึก 5 ชั้น | L ลึก 10 ชั้น | XL ลึก 15 ชั้น | XXL ลึก 20 ชั้นลึก</p>
                  <p>3. <b>ค่าบริหารจัดการและภาษีหัก ณ ที่จ่าย:</b> การขอถอนเงินปันผลจากยอดเงินสด (E-Cash) จะถูกหักค่าบริการบำรุงรักษาระบบหลังบ้าน 15% และภาษีเงินได้หัก ณ ที่จ่าย 5% รวมหักทั้งสิ้น 20% เพื่อประโยชน์สูงสุดในการรักษาเสถียรภาพระบบ</p>
                </div>
              </div>

            </div>
          )}

          {/* REPORTS PORTAL */}
