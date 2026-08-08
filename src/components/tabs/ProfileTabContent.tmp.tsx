          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">ข้อมูลสมาชิกและการอนุมัติยืนยันตัวตน (KYC)</h2>
                <p className="text-xs text-slate-400 mt-1">ตรวจสอบความสมบูรณ์ของเอกสารบัตรและหน้าบัญชีธนาคาร</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* KYC Current Status */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">สถานะ KYC ปัจจุบันของคุณ</span>
                    <div className="my-6">
                      {profile?.statusKyc === 'Active' ? (
                        <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-200 animate-pulse">
                          <ShieldCheck size={44} />
                        </div>
                      ) : profile?.statusKyc === 'Pending' ? (
                        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-200">
                          <RefreshCw size={44} className="animate-spin" />
                        </div>
                      ) : (
                        <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                          <AlertCircle size={44} />
                        </div>
                      )}
                    </div>

                    <h4 className={`text-base font-bold ${
                      profile?.statusKyc === 'Active' ? 'text-emerald-500' : profile?.statusKyc === 'Pending' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {profile?.statusKyc === 'Active' ? 'ยืนยันตัวตนสำเร็จแล้ว' : profile?.statusKyc === 'Pending' ? 'รอแอดมินตรวจสอบเอกสาร' : 'ยังไม่ได้ยื่นเอกสาร / ถูกปฏิเสธ'}
                    </h4>
                    {profile?.kycRejectReason && (
                      <p className="text-[11px] text-rose-500 mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                        <b>สาเหตุที่ปฏิเสธ:</b> {profile.kycRejectReason}
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">
                    *หากเอกสารยังไม่ได้รับการอนุมัติ ท่านจะไม่สามารถทำการโอน E-Cash หรือเบิกเงินถอนคอมมิชชันออกจากระบบนทีพลัสได้
                  </p>
                </div>

                {/* KYC Submit Form */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm md:col-span-2">
                  <h4 className="text-base font-bold text-slate-900 mb-4">แนบไฟล์ภาพถ่ายเอกสารประกอบการถอนโบนัส</h4>
                  
                  {profile?.statusKyc === 'Active' ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-emerald-800 space-y-4">
                      <p className="text-xs font-semibold">✓ บัญชีของท่านผ่านการยืนยัน KYC เสร็จสมบูรณ์แล้ว ไม่จำเป็นต้องแนบไฟล์ซ้ำค่ะ</p>
                      <div className="text-xs space-y-1.5 text-slate-600 bg-white/60 p-4 rounded-xl border border-slate-100">
                        <p>ชื่อ-สกุล: <b>{profile?.name} {profile?.surname}</b></p>
                        <p>หมายเลขบัตรประชาชน: <b>{profile?.idCard}</b></p>
                        <p>ธนาคารปลายทาง: <b>{profile?.bankName} ({profile?.bankAccount})</b></p>
                        {profile?.kycBeneficiary && <p>ผู้สืบมรดก: <b>{profile?.kycBeneficiary} ({profile?.kycRelation})</b></p>}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleKycSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 mb-2">
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1.5">🏦 เลือกธนาคารเพื่อรับโอนเงินคอมมิชชัน *</label>
                          <select 
                            value={kycForm.bankName}
                            onChange={(e) => setKycForm(prev => ({ ...prev, bankName: e.target.value }))}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none"
                          >
                            <option value="">-- เลือกธนาคาร --</option>
                            <option value="ธนาคารกสิกรไทย">กสิกรไทย (KBank)</option>
                            <option value="ธนาคารไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                            <option value="ธนาคารกรุงเทพ">กรุงเทพ (BBL)</option>
                            <option value="ธนาคารกรุงไทย">กรุงไทย (KTB)</option>
                            <option value="ธนาคารออมสิน">ออมสิน (GSB)</option>
                            <option value="ธนาคารกรุงศรีอยุธยา">กรุงศรีอยุธยา (BAY)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1.5">💳 หมายเลขบัญชีธนาคาร *</label>
                          <input 
                            type="text" 
                            required
                            value={kycForm.bankAccount}
                            onChange={(e) => setKycForm(prev => ({ ...prev, bankAccount: e.target.value.replace(/\D/g, '') }))}
                            placeholder="กรอกเฉพาะตัวเลขติดกัน"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1.5">📷 รูปถ่ายหน้าบัตรประชาชน</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleKycFile(e, 'idCardFile')}
                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1.5">📷 รูปถ่ายหน้าสมุดบัญชี (Bookbank)</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleKycFile(e, 'bankBookFile')}
                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>
                      </div>



                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1.5">ผู้สืบมรดกมรดกสายงาน (ถ้ามี)</label>
                          <input 
                            type="text" 
                            value={kycForm.beneficiary}
                            onChange={(e) => setKycForm(prev => ({ ...prev, beneficiary: e.target.value }))}
                            placeholder="ชื่อ-สกุลผู้รับผลประโยชน์"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1.5">ความสัมพันธ์สายโลหิต</label>
                          <input 
                            type="text" 
                            value={kycForm.relation}
                            onChange={(e) => setKycForm(prev => ({ ...prev, relation: e.target.value }))}
                            placeholder="บุตร / คู่สมรส / บิดา-มารดา"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={profile?.statusKyc === 'Pending'}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg transition disabled:bg-slate-400"
                      >
                        {profile?.statusKyc === 'Pending' ? 'อยู่ระหว่างตรวจสอบเอกสารประกอบภาพถ่ายจากแอดมิน' : 'ส่งข้อมูลแนบเอกสารเพื่อตรวจสอบอนุมัติ'}
                      </button>
                    </form>
                  )}
                </div>

              </div>

              {/* PERSONAL PROFILE & AUTO ADDRESS EDITOR */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 rounded-xl text-indigo-500"><Settings size={18} /></span>
                    แก้ไขข้อมูลสมาชิกและที่อยู่ (จังหวัด/อำเภอ/ตำบล อัตโนมัติ)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">สมาชิกสามารถปรับปรุงรายละเอียดข้อมูลส่วนตัวและที่อยู่ด้วยตัวเองได้ที่นี่ค่ะ</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Account detail block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Read-only name group */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-600 block">👤 ข้อมูลชื่อ-สกุล (ไม่สามารถแก้ไขได้)</span>
                      <div>
                        <label className="block text-[11px] text-slate-500 font-bold mb-1">ชื่อจริง</label>
                        <input 
                          type="text" 
                          disabled 
                          value={profile?.name || ''} 
                          className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 font-bold mb-1">นามสกุล</label>
                        <input 
                          type="text" 
                          disabled 
                          value={profile?.surname || ''} 
                          className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-rose-500 leading-normal">
                        * เพื่อความปลอดภัยในสายงานและการรับโอน มรดก หากต้องการแก้ชื่อ-สกุลกรุณาติดต่อผู้จัดการหรือแอดมินค่ะ
                      </p>
                    </div>

                    {/* Editable profile core info */}
                    <div className="space-y-3 md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1">Username (ชื่อผู้ใช้)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={editUsername} 
                              onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                                setEditUsername(val);
                                if (val === profile?.username) {
                                  setCheckedEditUsername(true);
                                  setEditUsernameStatus(null);
                                } else {
                                  setCheckedEditUsername(false);
                                  setEditUsernameStatus(null);
                                }
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => checkEditUsername(editUsername)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition"
                            >
                              ตรวจสอบ
                            </button>
                          </div>
                          {editUsernameStatus === 'avail' && <p className="text-emerald-500 text-[10px] mt-1">✓ ชื่อผู้ใช้นี้ใช้งานได้</p>}
                          {editUsernameStatus === 'taken' && <p className="text-rose-500 text-[10px] mt-1">✗ ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว</p>}
                          {!checkedEditUsername && editUsername !== profile?.username && (
                            <p className="text-amber-500 text-[9px] mt-1">⚠ กรุณากดปุ่ม ตรวจสอบ ก่อนบันทึกค่ะ</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1">เบอร์โทรศัพท์มือถือ *</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              required
                              value={editPhone} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditPhone(val);
                                if (val === profile?.phone) {
                                  setCheckedEditPhone(true);
                                  setEditPhoneStatus(null);
                                } else {
                                  setCheckedEditPhone(false);
                                  setEditPhoneStatus(null);
                                }
                              }}
                              placeholder="เช่น 0812345678"
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => checkEditPhone(editPhone)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition shadow-sm cursor-pointer"
                            >
                              ตรวจสอบ
                            </button>
                          </div>
                          {editPhoneStatus === 'avail' && <p className="text-emerald-600 text-[10px] font-bold mt-1">✓ เบอร์โทรศัพท์นี้สามารถใช้งานได้</p>}
                          {editPhoneStatus === 'taken' && <p className="text-rose-600 text-[10px] font-bold mt-1">✗ เบอร์โทรศัพท์นี้ถูกใช้ไปแล้ว</p>}
                          {!checkedEditPhone && editPhone !== profile?.phone && (
                            <p className="text-amber-600 text-[9px] mt-1">⚠ กรุณากดปุ่ม ตรวจสอบ ก่อนบันทึกค่ะ</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-slate-700 text-xs font-bold mb-1">อีเมลหลัก *</label>
                          <div className="flex gap-2">
                            <input 
                              type="email" 
                              required
                              value={editEmail} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditEmail(val);
                                if (val.toLowerCase().trim() === (profile?.email || '').toLowerCase().trim()) {
                                  setCheckedEditEmail(true);
                                  setEditEmailStatus(null);
                                } else {
                                  setCheckedEditEmail(false);
                                  setEditEmailStatus(null);
                                  setEmailOtpSent(false);
                                  setEmailOtpInput('');
                                }
                              }}
                              placeholder="เช่น name@example.com"
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => checkEditEmail(editEmail)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition shadow-sm cursor-pointer"
                            >
                              ตรวจสอบ
                            </button>
                          </div>
                          {editEmailStatus === 'avail' && <p className="text-emerald-600 text-[10px] font-bold mt-1">✓ อีเมลนี้สามารถใช้งานได้</p>}
                          {editEmailStatus === 'taken' && <p className="text-rose-600 text-[10px] font-bold mt-1">✗ อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว</p>}
                          {!checkedEditEmail && editEmail.toLowerCase().trim() !== (profile?.email || '').toLowerCase().trim() && (
                            <p className="text-amber-600 text-[9px] mt-1">⚠ กรุณากดปุ่ม ตรวจสอบ ก่อนบันทึกค่ะ</p>
                          )}

                          {/* Email change OTP verification card */}
                          {editEmail.toLowerCase().trim() !== (profile?.email || '').toLowerCase().trim() && checkedEditEmail && editEmailStatus === 'avail' && (
                            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 space-y-2 text-xs text-amber-900 mt-2 shadow-xs">
                              <div className="flex flex-wrap justify-between items-center gap-2">
                                <span className="font-bold text-[11px] flex items-center gap-1">
                                  ✉️ ยืนยันตัวตนเพื่อเปลี่ยนอีเมล
                                </span>
                                <button
                                  type="button"
                                  disabled={isSendingEmailOtp}
                                  onClick={requestEmailChangeOtp}
                                  className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm disabled:bg-slate-300"
                                >
                                  {isSendingEmailOtp ? 'กำลังส่ง OTP...' : emailOtpSent ? 'ส่ง OTP อีกครั้ง' : `ขอรับ OTP (ส่งไปที่ ${profile?.email})`}
                                </button>
                              </div>
                              <p className="text-[10px] text-amber-800 leading-relaxed">
                                กรณีแก้ไขอีเมล ระบบจะส่งรหัส OTP ยืนยันไปยังอีเมลเดิม (<strong className="text-amber-950 font-bold">{profile?.email}</strong>) เพื่อความปลอดภัย กรุณานำรหัส OTP กลับมากรอกด้านล่างนี้จึงจะเปลี่ยนอีเมลได้ค่ะ
                              </p>

                              {emailOtpSent && (
                                <div className="pt-2 border-t border-amber-200/80 space-y-1.5">
                                  {simulatedEmailOtp && (
                                    <p className="text-[10px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                      💡 [DEMO Simulated OTP]: <strong className="text-indigo-900 font-bold tracking-widest">{simulatedEmailOtp}</strong>
                                    </p>
                                  )}
                                  <label className="block text-[10px] font-bold text-amber-900">กรอกรหัส OTP 6 หลักที่ได้รับจากอีเมลเดิม *</label>
                                  <input
                                    type="text"
                                    maxLength={6}
                                    value={emailOtpInput}
                                    onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, ''))}
                                    placeholder="กรอกรหัส OTP 6 หลัก"
                                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 font-mono text-center text-sm font-bold tracking-widest focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Unlocked Bank Details with warning message */}
                        <div className="md:col-span-2 bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                            <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                              🏦 ข้อมูลธนาคารปลายทางรับคอมมิชชัน
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                              🔓 สามารถแก้ไขได้
                            </span>
                          </div>

                          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-rose-600 font-bold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>ชื่อบัญชีธนาคารต้องตรงกับชื่อสมาชิกเท่านั้น</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 text-xs font-bold mb-1">ธนาคารปลายทาง *</label>
                              <select
                                value={editBankName}
                                onChange={(e) => setEditBankName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                              >
                                <option value="">-- เลือกธนาคาร --</option>
                                <option value="ธนาคารกสิกรไทย">กสิกรไทย (KBank)</option>
                                <option value="ธนาคารไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                                <option value="ธนาคารกรุงเทพ">กรุงเทพ (BBL)</option>
                                <option value="ธนาคารกรุงไทย">กรุงไทย (KTB)</option>
                                <option value="ธนาคารออมสิน">ออมสิน (GSB)</option>
                                <option value="ธนาคารกรุงศรีอยุธยา">กรุงศรีอยุธยา (BAY)</option>
                                <option value="ธนาคารทหารไทยธนชาต">ทหารไทยธนชาต (TTB)</option>
                                <option value="ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร">ธ.ก.ส. (BAAC)</option>
                                <option value="ธนาคารอาคารสงเคราะห์">อาคารสงเคราะห์ (GHB)</option>
                                <option value="ธนาคารเกียรตินาคินภัทร">เกียรตินาคินภัทร (KKP)</option>
                                <option value="ธนาคารซีไอเอ็มบีไทย">ซีไอเอ็มบี ไทย (CIMBT)</option>
                                <option value="ธนาคาร ยูโอบี">ยูโอบี (UOB)</option>
                                <option value="ธนาคารแลนด์ แอนด์ เฮ้าส์">แลนด์ แอนด์ เฮ้าส์ (LHBANK)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-700 text-xs font-bold mb-1">เลขบัญชีธนาคาร *</label>
                              <input 
                                type="text" 
                                value={editBankAccount} 
                                onChange={(e) => setEditBankAccount(e.target.value.replace(/\D/g, ''))}
                                placeholder="ระบุเลขบัญชีธนาคารเฉพาะตัวเลข"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cascading Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    
                    {/* ID Card Address */}
                    <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-3.5">
                      <div className="flex justify-between items-center border-b border-indigo-100/60 pb-2">
                        <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                          <MapPin size={15} className="text-indigo-600" />
                          ที่อยู่ตามบัตรประชาชน {profile?.statusKyc === 'Active' && '(ล็อกตาม KYC)'}
                        </span>
                        {profile?.statusKyc === 'Active' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            🔒 อนุมัติ KYC แล้ว
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                            ค้นหาอัตโนมัติ
                          </span>
                        )}
                      </div>

                      {/* 1. Address Search Auto-complete from Tambon Database */}
                      <div className="relative">
                        <label className="block text-slate-700 text-[10px] font-bold mb-1 flex justify-between items-center">
                          <span>🔍 ค้นหา ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์</span>
                          <span className="text-[9px] text-slate-400 font-normal">(พิมพ์เพื่อเลือกจากฐานข้อมูล)</span>
                        </label>
                        <input 
                          type="text" 
                          value={idAddressSearch}
                          onChange={(e) => {
                            setIdAddressSearch(e.target.value);
                            triggerAddressSearch(e.target.value, setIdSearchSuggestions);
                          }}
                          placeholder="พิมพ์ชื่อตำบล อำเภอ จังหวัด หรือรหัสไปรษณีย์ เช่น 10280..."
                          className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                        />

                        {/* Search Dropdown Suggestions */}
                        {idSearchSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                            {idSearchSuggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setIdProv(sug.province);
                                  setIdDist(sug.district);
                                  setIdSub(sug.subdistrict);
                                  setIdZip(sug.zipcode);
                                  setIdAddressSearch(`${sug.subdistrict} » ${sug.district} » ${sug.province} » ${sug.zipcode}`);
                                  setIdSearchSuggestions([]);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50/80 transition flex items-center justify-between text-slate-800"
                              >
                                <span className="font-medium">{sug.subdistrict} » {sug.district} » {sug.province}</span>
                                <span className="font-mono text-indigo-600 bg-indigo-100/60 px-1.5 py-0.5 rounded text-[10px] font-bold">{sug.zipcode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Auto-filled Location Display Badges */}
                      <div className="grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[9px] block">ตำบล / แขวง</span>
                          <span className="font-semibold text-slate-800">{idSub || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">อำเภอ / เขต</span>
                          <span className="font-semibold text-slate-800">{idDist || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">จังหวัด</span>
                          <span className="font-semibold text-slate-800">{idProv || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">รหัสไปรษณีย์</span>
                          <span className="font-mono font-bold text-indigo-600">{idZip || '—'}</span>
                        </div>
                      </div>

                      {/* 2. Three Dedicated Input Fields requested by user */}
                      <div className="pt-1 space-y-2">
                        <p className="text-[10px] font-bold text-indigo-900 border-t border-indigo-100 pt-2">
                          🏠 สมาชิกกรอกเฉพาะรายละเอียดที่อยู่ (3 ช่อง):
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-700 text-[10px] font-bold mb-1">1. บ้านเลขที่ / อาคาร *</label>
                            <input 
                              type="text" 
                              value={idHouseNo}
                              onChange={(e) => {
                                setIdHouseNo(e.target.value);
                                const details = [e.target.value ? 'บ้านเลขที่ ' + e.target.value : '', idMoo ? 'หมู่ ' + idMoo : '', idRoadSoi].filter(Boolean).join(' ');
                                setIdDetails(details);
                              }}
                              placeholder="เช่น 123/45 หรือ อาคาร A"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 text-[10px] font-bold mb-1">2. หมู่ที่</label>
                            <input 
                              type="text" 
                              value={idMoo}
                              onChange={(e) => {
                                setIdMoo(e.target.value);
                                const details = [idHouseNo ? 'บ้านเลขที่ ' + idHouseNo : '', e.target.value ? 'หมู่ ' + e.target.value : '', idRoadSoi].filter(Boolean).join(' ');
                                setIdDetails(details);
                              }}
                              placeholder="เช่น 5 (ถ้าไม่มีเว้นว่างไว้)"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">3. ถนน / ซอย</label>
                          <input 
                            type="text" 
                            value={idRoadSoi}
                            onChange={(e) => {
                              setIdRoadSoi(e.target.value);
                              const details = [idHouseNo ? 'บ้านเลขที่ ' + idHouseNo : '', idMoo ? 'หมู่ ' + idMoo : '', e.target.value].filter(Boolean).join(' ');
                              setIdDetails(details);
                            }}
                            placeholder="เช่น ถนนสุขุมวิท ซอยสุขุมวิท 101/1"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 space-y-3.5">
                      <div className="flex justify-between items-center border-b border-amber-100/60 pb-2">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <ShoppingBag size={15} className="text-amber-600" />
                          ที่อยู่สำหรับจัดส่งสินค้า (Tambon Database System)
                        </span>
                        <label className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={useSameAddress}
                            onChange={(e) => {
                              setUseSameAddress(e.target.checked);
                              if (e.target.checked) {
                                setShipProv(idProv);
                                setShipDist(idDist);
                                setShipSub(idSub);
                                setShipZip(idZip);
                                setShipHouseNo(idHouseNo);
                                setShipRoadSoi(idRoadSoi);
                                setShipMoo(idMoo);
                                setShipDetails(idDetails);
                                setShipAddressSearch(idAddressSearch);
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          ใช้ที่อยู่เดียวกัน
                        </label>
                      </div>

                      {/* 1. Address Search Auto-complete from Tambon Database */}
                      <div className="relative">
                        <label className="block text-slate-700 text-[10px] font-bold mb-1 flex justify-between items-center">
                          <span>🔍 ค้นหา ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์</span>
                          <span className="text-[9px] text-slate-400 font-normal">(พิมพ์เพื่อเลือกจากฐานข้อมูล)</span>
                        </label>
                        <input 
                          type="text" 
                          disabled={useSameAddress}
                          value={shipAddressSearch}
                          onChange={(e) => {
                            setShipAddressSearch(e.target.value);
                            triggerAddressSearch(e.target.value, setShipSearchSuggestions);
                          }}
                          placeholder="พิมพ์ชื่อตำบล อำเภอ จังหวัด หรือรหัสไปรษณีย์..."
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                        />

                        {/* Search Dropdown Suggestions */}
                        {shipSearchSuggestions.length > 0 && !useSameAddress && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                            {shipSearchSuggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setShipProv(sug.province);
                                  setShipDist(sug.district);
                                  setShipSub(sug.subdistrict);
                                  setShipZip(sug.zipcode);
                                  setShipAddressSearch(`${sug.subdistrict} » ${sug.district} » ${sug.province} » ${sug.zipcode}`);
                                  setShipSearchSuggestions([]);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50/80 transition flex items-center justify-between text-slate-800"
                              >
                                <span className="font-medium">{sug.subdistrict} » {sug.district} » {sug.province}</span>
                                <span className="font-mono text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded text-[10px] font-bold">{sug.zipcode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Auto-filled Location Display Badges */}
                      <div className="grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[9px] block">ตำบล / แขวง</span>
                          <span className="font-semibold text-slate-800">{useSameAddress ? idSub : (shipSub || '—')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">อำเภอ / เขต</span>
                          <span className="font-semibold text-slate-800">{useSameAddress ? idDist : (shipDist || '—')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">จังหวัด</span>
                          <span className="font-semibold text-slate-800">{useSameAddress ? idProv : (shipProv || '—')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">รหัสไปรษณีย์</span>
                          <span className="font-mono font-bold text-amber-600">{useSameAddress ? idZip : (shipZip || '—')}</span>
                        </div>
                      </div>

                      {/* 2. Three Dedicated Input Fields requested by user */}
                      <div className="pt-1 space-y-2">
                        <p className="text-[10px] font-bold text-amber-900 border-t border-amber-100 pt-2">
                          🏠 สมาชิกกรอกเฉพาะรายละเอียดที่อยู่สำหรับส่งของ (3 ช่อง):
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-700 text-[10px] font-bold mb-1">1. บ้านเลขที่ / อาคาร *</label>
                            <input 
                              type="text" 
                              disabled={useSameAddress}
                              value={useSameAddress ? idHouseNo : shipHouseNo}
                              onChange={(e) => {
                                setShipHouseNo(e.target.value);
                                const details = [e.target.value ? 'บ้านเลขที่ ' + e.target.value : '', shipMoo ? 'หมู่ ' + shipMoo : '', shipRoadSoi].filter(Boolean).join(' ');
                                setShipDetails(details);
                              }}
                              placeholder="เช่น 123/45 หรือ อาคาร A"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 text-[10px] font-bold mb-1">2. หมู่ที่</label>
                            <input 
                              type="text" 
                              disabled={useSameAddress}
                              value={useSameAddress ? idMoo : shipMoo}
                              onChange={(e) => {
                                setShipMoo(e.target.value);
                                const details = [shipHouseNo ? 'บ้านเลขที่ ' + shipHouseNo : '', e.target.value ? 'หมู่ ' + e.target.value : '', shipRoadSoi].filter(Boolean).join(' ');
                                setShipDetails(details);
                              }}
                              placeholder="เช่น 5"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">3. ถนน / ซอย</label>
                          <input 
                            type="text" 
                            disabled={useSameAddress}
                            value={useSameAddress ? idRoadSoi : shipRoadSoi}
                            onChange={(e) => {
                              setShipRoadSoi(e.target.value);
                              const details = [shipHouseNo ? 'บ้านเลขที่ ' + shipHouseNo : '', shipMoo ? 'หมู่ ' + shipMoo : '', e.target.value].filter(Boolean).join(' ');
                              setShipDetails(details);
                            }}
                            placeholder="เช่น ถนนสุขุมวิท ซอยสุขุมวิท 101/1"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>


                    </div>

                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Check size={15} />
                      บันทึกข้อมูลส่วนตัวของฉัน
                    </button>
                  </div>
                </form>
              </div>

              {/* CHANGE PASSWORD COMPONENT */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 mt-6">
                <div className="border-b border-slate-100 pb-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="p-1.5 bg-rose-50 rounded-xl text-rose-500"><Lock size={18} /></span>
                    เปลี่ยนรหัสผ่านเพื่อความปลอดภัย 🔐
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">ท่านสามารถเปลี่ยนรหัสผ่านเข้าสู่ระบบใหม่ได้ที่นี่เพื่อป้องกันความเป็นส่วนตัวค่ะ</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1">รหัสผ่านปัจจุบัน *</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="กรอกรหัสผ่านปัจจุบันของท่าน"
                        className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">รหัสผ่านใหม่ *</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="ตั้งรหัสผ่านใหม่"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">ยืนยันรหัสผ่านใหม่ *</label>
                      <div className="relative">
                        <input 
                          type={showConfirmNewPassword ? "text" : "password"}
                          required
                          value={confirmNewPasswordInput}
                          onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                          placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5 text-center md:text-left">
                      ยืนยันด้วยรหัสธุรกรรม PIN (6 หลัก) *
                    </label>
                    <div className="flex justify-center md:justify-start gap-2 py-1">
                      {Array(6).fill(0).map((_, idx) => (
                        <input
                          key={idx}
                          id={`password-change-pin-${idx}`}
                          type="password"
                          maxLength={1}
                          value={passwordChangePinDigits[idx] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newDigits = [...passwordChangePinDigits];
                            newDigits[idx] = val.slice(-1);
                            setPasswordChangePinDigits(newDigits);
                            if (val && idx < 5) {
                              const nextInput = document.getElementById(`password-change-pin-${idx + 1}`);
                              if (nextInput) nextInput.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !passwordChangePinDigits[idx] && idx > 0) {
                              const prevInput = document.getElementById(`password-change-pin-${idx - 1}`);
                              if (prevInput) {
                                prevInput.focus();
                                const newDigits = [...passwordChangePinDigits];
                                newDigits[idx - 1] = '';
                                setPasswordChangePinDigits(newDigits);
                              }
                            }
                          }}
                          className="w-10 h-10 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-center rounded-xl text-lg font-bold font-mono transition shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 space-y-1">
                    <p className="font-bold text-slate-600">🔒 เงื่อนไขความปลอดภัยรหัสผ่าน:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>ต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป</li>
                      <li>ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว</li>
                      <li>ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว</li>
                      <li>ต้องประกอบด้วยตัวเลข (0-9) อย่างน้อย 1 ตัว</li>
                      <li>ต้องประกอบด้วยอักขระพิเศษ (เช่น !, @, #, $, %, ^, &, *, _) อย่างน้อย 1 ตัว</li>
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <Lock size={14} />
                      {isChangingPassword ? 'กำลังดำเนินการ...' : 'เปลี่ยนรหัสผ่านใหม่'}
                    </button>
                  </div>
                </form>
              </div>

              {/* CHANGE TRANSACTION PIN COMPONENT */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 mt-6">
                <div className="border-b border-slate-100 pb-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 rounded-xl text-indigo-500"><Lock size={18} /></span>
                    เปลี่ยนรหัสธุรกรรม PIN 🔐
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    กำหนดรหัสธุรกรรม PIN 6 หลักใหม่สำหรับการโอนเงินและทำรายการถอนคอมมิชชันค่ะ (ระบบจะส่งรหัส OTP ไปที่เมลที่ลงทะเบียนเพื่อยืนยันสิทธิ์)
                  </p>
                </div>

                <form onSubmit={handleChangePin} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">รหัสธุรกรรม PIN เดิม *</label>
                      <div className="relative">
                        <input 
                          type={showProfileOldPin ? "text" : "password"}
                          required
                          maxLength={6}
                          value={oldPinInput}
                          onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="PIN เดิม 6 หลัก"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfileOldPin(!showProfileOldPin)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          title={showProfileOldPin ? "ซ่อนรหัส PIN" : "แสดงรหัส PIN"}
                        >
                          {showProfileOldPin ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">รหัสธุรกรรม PIN ใหม่ *</label>
                      <div className="relative">
                        <input 
                          type={showProfileNewPin ? "text" : "password"}
                          required
                          maxLength={6}
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="PIN ใหม่ 6 หลัก"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfileNewPin(!showProfileNewPin)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          title={showProfileNewPin ? "ซ่อนรหัส PIN" : "แสดงรหัส PIN"}
                        >
                          {showProfileNewPin ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">ยืนยัน PIN ใหม่ *</label>
                      <div className="relative">
                        <input 
                          type={showProfileConfirmPin ? "text" : "password"}
                          required
                          maxLength={6}
                          value={confirmNewPinInput}
                          onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="ยืนยัน PIN ใหม่อีกครั้ง"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfileConfirmPin(!showProfileConfirmPin)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          title={showProfileConfirmPin ? "ซ่อนรหัส PIN" : "แสดงรหัส PIN"}
                        >
                          {showProfileConfirmPin ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* OTP requesting button or field */}
                  <div className="pt-2">
                    {!isPinOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendPinOtp}
                        disabled={isSendingPinOtp}
                        className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        {isSendingPinOtp ? 'กำลังส่งรหัส OTP...' : 'ขอรับรหัส OTP ทางอีเมลเพื่อเปลี่ยน PIN'}
                      </button>
                    ) : (
                      <div className="space-y-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl animate-fadeIn">
                        <div className="text-center md:text-left">
                          <label className="block text-indigo-950 text-xs font-bold mb-1.5">
                            กรอกรหัส OTP 6 หลักที่ได้รับทางเมลของท่าน *
                          </label>
                          <div className="flex justify-center md:justify-start gap-2 py-1">
                            {Array(6).fill(0).map((_, idx) => (
                              <input
                                key={idx}
                                id={`pin-otp-${idx}`}
                                type="text"
                                maxLength={1}
                                value={pinChangeOtpDigits[idx] || ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const newDigits = [...pinChangeOtpDigits];
                                  newDigits[idx] = val.slice(-1);
                                  setPinChangeOtpDigits(newDigits);
                                  if (val && idx < 5) {
                                    const nextInput = document.getElementById(`pin-otp-${idx + 1}`);
                                    if (nextInput) nextInput.focus();
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !pinChangeOtpDigits[idx] && idx > 0) {
                                    const prevInput = document.getElementById(`pin-otp-${idx - 1}`);
                                    if (prevInput) {
                                      prevInput.focus();
                                      const newDigits = [...pinChangeOtpDigits];
                                      newDigits[idx - 1] = '';
                                      setPinChangeOtpDigits(newDigits);
                                    }
                                  }
                                }}
                                className="w-10 h-10 bg-white border-2 border-slate-200 focus:border-indigo-500 text-center rounded-xl text-lg font-bold font-mono transition shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            รหัสผ่านจะถูกจัดส่งไปที่อีเมลที่ระบุในประวัติประวัติส่วนตัว: <b className="text-slate-600">{profile?.email}</b>
                          </p>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={isChangingPin}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                          >
                            <Check size={14} />
                            {isChangingPin ? 'กำลังเปลี่ยน PIN...' : 'ยืนยันรหัส OTP และบันทึกรหัส PIN ใหม่'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

            </div>
          )}

