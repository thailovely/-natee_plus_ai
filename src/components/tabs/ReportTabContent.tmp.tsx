          {activeTab === 'report' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">รายงานข้อมูลระบบ นที พลัส 📊</h2>
                  <p className="text-xs text-slate-400 mt-1">สรุปข้อมูลการเงิน คูปอง รายรับออลแชร์ และโครงสร้างสายงานในระบบของคุณ</p>
                </div>

                {/* Live Real-time Refresh Button */}
                <button
                  onClick={() => {
                    fetchProfile(true);
                    fetchTransactions();
                    fetchReports();
                    showNotif('อัปเดตรายงานและค่าคอมมิชชันเป็นปัจจุบันเรียบร้อยแล้วค่ะ 🔄', 'success');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 border border-emerald-400/30"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>🔄 อัปเดตข้อมูลปัจจุบัน</span>
                </button>

                {/* Report Sub-tabs Selector */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => setReportSubTab('ecash')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'ecash' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💳 รายงาน E-Cash
                  </button>
                  <button 
                    onClick={() => setReportSubTab('emoney')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'emoney' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🪙 รายงาน E-Money
                  </button>
                  <button 
                    onClick={() => setReportSubTab('ecoupon')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'ecoupon' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎟️ รายงาน E-Coupon
                  </button>
                  <button 
                    onClick={() => setReportSubTab('eshare')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'eshare' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 รายงาน All-Share
                  </button>
                  <button 
                    onClick={() => setReportSubTab('referrals')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'referrals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👥 แนะนำตรง
                  </button>
                  <button 
                    onClick={() => setReportSubTab('binary')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'binary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🕸️ ผังไบนารี
                  </button>
                  <button 
                    onClick={() => setReportSubTab('memberTax')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reportSubTab === 'memberTax' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 ภาษี & 50 ทวิ (สมาชิก)
                  </button>
                  {profile?.sellerStatus === 'Active' && (
                    <button 
                      onClick={() => setReportSubTab('sellerTax')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        reportSubTab === 'sellerTax' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏪 ภาษี & 50 ทวิ (ร้านค้า)
                    </button>
                  )}
                </div>
              </div>

              {/* REPORT E-CASH SUB-VIEW */}
              {reportSubTab === 'ecash' && (
                <div className="space-y-6">
                  {/* Ledger Balance Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-emerald-100 font-medium">เครดิตคงเหลือ E-Cash ปัจจุบัน</span>
                      <h3 className="text-3xl font-extrabold tracking-tight flex items-baseline gap-2">
                        <span>฿ {profile?.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-sm font-bold text-emerald-200">บาท</span>
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setActiveTab('txn')}
                        className="bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        ➕ เติมเงิน E-Cash
                      </button>
                      <div className="text-[11px] bg-white/10 px-3.5 py-2 rounded-2xl backdrop-blur-sm space-y-1">
                        <div>• ยอดรวมเงินหมุนเวียน E-Cash ทั้งระบบประมวลผลเรียลไทม์</div>
                        <div>• ปลอดภัยด้วยรหัส PIN และระบบยืนยันตนสองชั้น</div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Ledger Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <CreditCard size={16} className="text-emerald-500" /> สมุดบันทึกรายการบัญชี E-Cash Ledger
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">อัปเดตข้อมูลล่าสุดเมื่อ: {new Date().toLocaleTimeString()}</span>
                    </div>

                    {(() => {
                      const eCashTxns = transactions.filter((t) => {
                        if (t.userId !== currentUser?.userId) return false;
                        if (t.type === 'Deposit_System') return false;
                        if (t.currency && t.currency !== 'E-Cash') return false;
                        
                        // ซ่อนรายการที่เป็นโบนัสหรือค่าแนะนำที่มาจากตนเอง (userId === senderId)
                        const detailsText = t.details || t.description || t.remarks || '';
                        const senderIdMatch = detailsText.match(/(A26\d{6,})/);
                        const senderId = senderIdMatch ? senderIdMatch[1] : null;
                        if (senderId && senderId === t.userId && (t.type === 'Bonus' || t.type === 'EShare' || t.type === 'Commission')) {
                          return false;
                        }
                        return true;
                      });

                      const itemsPerPage = 20;
                      const startIndex = (eCashPage - 1) * itemsPerPage;
                      const sortedECashTxns = [...eCashTxns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                      const paginatedTxns = sortedECashTxns.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">รหัสรายการ</th>
                                  <th className="px-4 py-3">วัน-เวลาทำรายการ</th>
                                  <th className="px-4 py-3">ประเภทรายการ</th>
                                  <th className="px-4 py-3">จำนวนเงิน (บาท)</th>
                                  <th className="px-4 py-3">รายละเอียดบัญชี</th>
                                  <th className="px-4 py-3">สถานะรายการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedTxns.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-400">ยังไม่มีรายงานประวัติทำธุรกรรมในขณะนี้</td>
                                  </tr>
                                ) : (
                                  paginatedTxns.map((t) => {
                                    const isCredit = t.type === 'Deposit' || t.type === 'EShare' || t.type === 'Commission' || t.type === 'Receive' || t.type === 'Bonus' || t.type === 'Deposit_System';
                                    const detailsText = t.details || t.description || t.remarks || '';
                                    const senderIdMatch = detailsText.match(/(A26\d{6,})/);
                                    const senderId = senderIdMatch ? senderIdMatch[1] : null;

                                    return (
                                      <tr key={t.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-mono text-[10px] font-bold text-indigo-600">{t.id}</td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                          <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                              t.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' :
                                              t.type === 'Withdraw' ? 'bg-rose-50 text-rose-600' :
                                              t.type === 'Transfer' ? 'bg-amber-50 text-amber-600' :
                                              t.type === 'Commission' || t.type === 'Bonus' ? 'bg-blue-50 text-blue-600' :
                                              t.type === 'EShare' ? 'bg-indigo-50 text-indigo-600' :
                                              t.type === 'Exchange' ? 'bg-purple-50 text-purple-600' :
                                              'bg-slate-50 text-slate-600'
                                            }`}>
                                              {t.type === 'Deposit' ? '💵 เงินฝากเข้า' :
                                               t.type === 'Withdraw' ? '💸 ถอนเงินสด' :
                                               t.type === 'Transfer' ? '🔁 โอนไปสมาชิก' :
                                               t.type === 'Commission' || t.type === 'Bonus' ? '💰 โบนัสค่าแนะนำ' + (senderId ? ' (จากรหัส ' + senderId + ')' : '') :
                                               t.type === 'EShare' ? '🌐 ออลแชร์โบนัส' + (senderId ? ' (จากรหัส ' + senderId + ')' : '') :
                                               t.type === 'Exchange' ? '🎟️ แลกคูปอง' : t.type}
                                            </span>
                                            {senderId && (
                                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md mt-1">
                                                {t.type === 'Withdraw' || t.type === 'Transfer' || detailsText.includes('โอนเงินออก') ? 'ส่งให้รหัส: ' : 'จากรหัส: '}
                                                {senderId}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {isCredit ? '+' : '-'}{(t.transferAmount || t.amount)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate" title={detailsText || '-'}>
                                          {detailsText || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${t.status === 'Approved' || t.status === 'Completed' || !t.status ? 'bg-emerald-500' : t.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                                            <span className="text-[11px]">
                                              {t.status === 'Approved' || t.status === 'Completed' || !t.status ? 'เสร็จสมบูรณ์' : t.status === 'Pending' ? 'รอดำเนินการ' : 'ปฏิเสธ/ยกเลิก'}
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          <TablePagination currentPage={eCashPage} totalItems={eCashTxns.length} itemsPerPage={itemsPerPage} onPageChange={setECashPage} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT E-MONEY SUB-VIEW */}
              {reportSubTab === 'emoney' && (
                <div className="space-y-6">
                  {/* Ledger Balance Card */}
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-purple-100 font-medium">ยอดคงเหลือ E-Money ปัจจุบัน</span>
                      <h3 className="text-3xl font-extrabold tracking-tight">฿ {profile?.balanceEMoney?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="text-[11px] bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm space-y-1">
                      <div>• แหล่งสะสมรายได้ระบบภายในทั้งหมด เช่น ค่าแนะนำ ปันสุข และส่วนแบ่งออลแชร์</div>
                      <div>• ใช้ทำธุรกรรมโอนเงินออกบัญชีธนาคาร หรือเปลี่ยนเป็น E-Cash, E-Coupon 1:1 ได้โดยไม่มีค่าธรรมเนียม</div>
                    </div>
                  </div>

                  {/* Transaction Ledger Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Coins size={16} className="text-purple-500" /> สมุดบันทึกรายการบัญชี E-Money Ledger
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">อัปเดตข้อมูลล่าสุดเมื่อ: {new Date().toLocaleTimeString()}</span>
                    </div>

                    {(() => {
                      const eMoneyTxns = transactions.filter((t) => {
                        if (t.userId !== currentUser?.userId) return false;
                        if (t.type === 'Deposit_System') return false;
                        if (t.currency && t.currency !== 'E-Money' && t.currency !== 'M-Cash') return false;
                        return (
                          t.currency === 'E-Money' ||
                          t.currency === 'M-Cash' ||
                          t.type === 'Bonus' ||
                          t.type === 'AllShare' ||
                          t.type === 'EShare' ||
                          t.type === 'Commission' ||
                          t.type === 'Withdraw' ||
                          t.type === 'WithdrawalRequest'
                        );
                      });

                      const itemsPerPage = 20;
                      const startIndex = (eMoneyPage - 1) * itemsPerPage;
                      const sortedEMoneyTxns = [...eMoneyTxns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                      const paginatedTxns = sortedEMoneyTxns.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">รหัสรายการ</th>
                                  <th className="px-4 py-3">วัน-เวลาทำรายการ</th>
                                  <th className="px-4 py-3">ประเภทรายการ</th>
                                  <th className="px-4 py-3">จำนวนเงิน (บาท)</th>
                                  <th className="px-4 py-3">รายละเอียดบัญชี</th>
                                  <th className="px-4 py-3">สถานะรายการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedTxns.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-400">ยังไม่มีรายงานประวัติทำธุรกรรม E-Money ในขณะนี้</td>
                                  </tr>
                                ) : (
                                  paginatedTxns.map((t) => {
                                    const isCredit = t.type === 'Deposit' || t.type === 'EShare' || t.type === 'Commission' || t.type === 'Receive' || t.type === 'Bonus' || t.type === 'Deposit_System';
                                    const detailsText = t.details || t.description || t.remarks || '';
                                    const senderIdMatch = detailsText.match(/(A26\d{6,})/);
                                    const senderId = senderIdMatch ? senderIdMatch[1] : null;

                                    return (
                                      <tr key={t.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-mono text-[10px] font-bold text-indigo-600">{t.id}</td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                          <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                              t.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' :
                                              t.type === 'Withdraw' ? 'bg-rose-50 text-rose-600' :
                                              t.type === 'Transfer' ? 'bg-amber-50 text-amber-600' :
                                              t.type === 'Commission' || t.type === 'Bonus' ? 'bg-purple-50 text-purple-600' :
                                              t.type === 'EShare' ? 'bg-indigo-50 text-indigo-600' :
                                              t.type === 'WithdrawalRequest' ? 'bg-red-50 text-red-600' :
                                              'bg-slate-50 text-slate-600'
                                            }`}>
                                              {t.type === 'Deposit' ? '💵 รับเงินโอนเข้า' :
                                               t.type === 'Withdraw' ? '💸 ถอน/จ่ายเงิน' :
                                               t.type === 'Transfer' ? '🔁 สลับเปลี่ยนกระเป๋า' :
                                               t.type === 'Commission' || t.type === 'Bonus' ? '🎁 โบนัสรายได้ระบบ' :
                                               t.type === 'EShare' ? '🌐 ออลแชร์รายได้' : 
                                               t.type === 'WithdrawalRequest' ? '🏦 คำขอถอนเงินสดเข้าธนาคาร' : t.type}
                                            </span>
                                            {senderId && (
                                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md mt-1">
                                                จากรหัส: {senderId}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {isCredit ? '+' : '-'}{(t.transferAmount || t.amount)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate" title={detailsText || '-'}>
                                          {detailsText || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${t.status === 'Approved' || t.status === 'Completed' || !t.status ? 'bg-emerald-500' : t.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                                            <span className="text-[11px]">
                                              {t.status === 'Approved' || t.status === 'Completed' || !t.status ? 'เสร็จสมบูรณ์' : t.status === 'Pending' ? 'รอดำเนินการอนุมัติ' : 'ปฏิเสธ/ยกเลิก'}
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          <TablePagination currentPage={eMoneyPage} totalItems={eMoneyTxns.length} itemsPerPage={itemsPerPage} onPageChange={setEMoneyPage} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT E-COUPON SUB-VIEW */}
              {reportSubTab === 'ecoupon' && (
                <div className="space-y-6">
                  {/* Coupon Balance Card */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-indigo-100 font-medium">ยอดคงเหลือ Point (E-Coupon)</span>
                      <h3 className="text-3xl font-extrabold tracking-tight">฿ {profile?.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="text-[11px] bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm space-y-1">
                      <div>• แลกจาก E-Cash ได้ที่แถบธุรกรรมการเงิน (โอนกลับเป็นเงินสดไม่ได้)</div>
                      <div>• ใช้เสมือนเงินสดสำหรับการแลกซื้อสินค้าและตำแหน่งภายในร้านค้าพอร์ทัล</div>
                    </div>
                  </div>

                  {/* Transaction Ledger Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Coins size={16} className="text-purple-500" /> สมุดบันทึกรายการบัญชี E-Coupon Ledger
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">อัปเดตข้อมูลล่าสุดเมื่อ: {new Date().toLocaleTimeString()}</span>
                    </div>

                    {(() => {
                      const eCouponTxns = transactions.filter((t) => {
                        if (t.userId !== currentUser?.userId) return false;
                        return (
                          t.currency === 'E-Coupon' ||
                          t.type === 'Coupon' ||
                          (t.details && (t.details.includes('คูปอง') || t.details.includes('Coupon')))
                        );
                      });

                      const sortedECouponTxns = [...eCouponTxns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                      const itemsPerPage = 20;
                      const startIndex = (eCouponPage - 1) * itemsPerPage;
                      const paginatedTxns = sortedECouponTxns.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">รหัสรายการ</th>
                                  <th className="px-4 py-3">วัน-เวลาทำรายการ</th>
                                  <th className="px-4 py-3">ประเภทรายการ</th>
                                  <th className="px-4 py-3">จำนวนเงิน/คะแนน (คูปอง)</th>
                                  <th className="px-4 py-3">รายละเอียดบัญชี</th>
                                  <th className="px-4 py-3">สถานะรายการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedTxns.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-400">ยังไม่มีรายงานประวัติทำธุรกรรม E-Coupon ในขณะนี้</td>
                                  </tr>
                                ) : (
                                  paginatedTxns.map((t) => {
                                    const isCredit = t.type === 'Deposit' || t.type === 'Receive' || t.type === 'Bonus' || t.type === 'Deposit_System' || (t.details && t.details.includes('ได้รับ'));
                                    const detailsText = t.details || t.description || t.remarks || '';
                                    return (
                                      <tr key={t.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-mono text-[10px] font-bold text-indigo-600">{t.id}</td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                            isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                          }`}>
                                            {isCredit ? '💵 รับคะแนนคูปอง' : '🛍️ ใช้คะแนนคูปอง'}
                                          </span>
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {isCredit ? '+' : '-'}{(t.amount || t.transferAmount)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ.
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate" title={detailsText || '-'}>
                                          {detailsText || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${t.status === 'Approved' || t.status === 'Completed' || !t.status ? 'bg-emerald-500' : t.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                                            <span className="text-[11px]">
                                              {t.status === 'Approved' || t.status === 'Completed' || !t.status ? 'เสร็จสมบูรณ์' : t.status === 'Pending' ? 'รอดำเนินการอนุมัติ' : 'ปฏิเสธ/ยกเลิก'}
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          <TablePagination currentPage={eCouponPage} totalItems={sortedECouponTxns.length} itemsPerPage={itemsPerPage} onPageChange={setECouponPage} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT E-SHARE SUB-VIEW */}
              {reportSubTab === 'eshare' && (
                <div className="space-y-6">
                  {/* All share Stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl p-6 text-white shadow-sm space-y-1">
                      <span className="text-xs text-amber-100 font-medium">ยอดรายรับสะสม E-Share สุทธิ (฿) (หักแล้ว 50%)</span>
                      <h3 className="text-3xl font-extrabold tracking-tight">฿ {((profile?.balanceEShare || 0) * 0.50).toFixed(6)}</h3>
                      <p className="text-[10px] text-amber-200 pt-2">• ยอดสุทธิหลังจากหักแบ่งจัดสรรเข้าระบบ Plan B แล้ว 50% และโอนเข้ากระเป๋า E-Money ของคุณ</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">ตำแหน่งเกียรติยศและคุณสมบัติรับ E-Share</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600`}>
                            {profile?.rank || "Member"}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {(profile?.eligibleRights || 0) > 0 ? 'คุณสมบัติรับออลแชร์ปันสุข (Active)' : 'กรุณาซื้อแพ็กเกจเปิดสิทธิ์รับออลแชร์'}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight pt-3 border-t border-slate-100 mt-3">
                        * E-Share คำนวณจากยอดขายออพชั่นกลางระบบ และกระจายทันทีให้สมาชิกผู้มีส่วนร่วมในโครงการ
                      </div>
                    </div>
                  </div>

                  {/* All Share History Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-amber-500" /> ประวัติการรับโบนัส E-Share โครงสร้างกองทุนรวม
                    </h4>

                    {(() => {
                      const allShareTxns = transactions.filter((t) => {
                        if (t.userId !== currentUser?.userId) return false;
                        return t.type === 'EShare';
                      });
                      const itemsPerPage = 20;
                      const startIndex = (allSharePage - 1) * itemsPerPage;
                      const sortedAllShareTxns = [...allShareTxns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                      const paginatedTxns = sortedAllShareTxns.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">เลขอ้างอิงรายการ</th>
                                  <th className="px-4 py-3">วันเวลาประมวลผล</th>
                                  <th className="px-4 py-3">คำอธิบายโบนัสออลแชร์</th>
                                  <th className="px-4 py-3">ยอดได้รับเข้ารายได้ E-Money (50%)</th>
                                  <th className="px-4 py-3">ยอดสะสมคะแนนรันระบบ Plan B (50%)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedTxns.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="p-6 text-center text-slate-400">ยังไม่มีรายงานประวัติ E-Share โบนัสปันผลเข้าบัญชีในขณะนี้</td>
                                  </tr>
                                ) : (
                                  paginatedTxns.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-mono text-[10px] font-bold text-amber-700">{t.id}</td>
                                      <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                                      <td className="px-4 py-3 font-medium text-slate-800">{t.description || "รับปันผลร่วมออลแชร์กองกลาง"}</td>
                                      <td className="px-4 py-3 text-emerald-600 font-bold">+{t.amount?.toFixed(4)} บ.</td>
                                      <td className="px-4 py-3 text-purple-600 font-bold">+{t.amount?.toFixed(4)} คะแนน</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                          <TablePagination currentPage={allSharePage} totalItems={allShareTxns.length} itemsPerPage={itemsPerPage} onPageChange={setESharePage} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT DIRECT REFERRALS SUB-VIEW */}
              {reportSubTab === 'referrals' && (
                <div className="space-y-6">
                  {/* Referrals summary metrics */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">แนะนำตรงทั้งหมด (คน)</span>
                      <h4 className="text-2xl font-extrabold text-indigo-950">{directReferrals.length} สมาชิก</h4>
                    </div>
                    {/* Status legends */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-slate-400 block" />
                        <span className="text-slate-600">สีเทา: สมัครยังไม่ซื้อแพ็กเกจ</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                        <span className="text-slate-600">สีเหลือง: รอตรวจสอบ/อนุมัติ KYC</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-blue-500 block" />
                        <span className="text-slate-600">สีน้ำเงิน: สมาชิกสมบูรณ์</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-slate-900 block" />
                        <span className="text-slate-600">สีดำ: สิ้นสภาพสมาชิก</span>
                      </div>
                    </div>
                  </div>

                  {/* Referrals Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                      <Users size={16} className="text-indigo-500" /> ตารางสายงานตรงและประวัติการแนะนำของท่าน
                    </h4>

                    {(() => {
                      const itemsPerPage = 20;
                      const startIndex = (referralsPage - 1) * itemsPerPage;
                      const paginatedReferrals = directReferrals.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">รหัสสมาชิก/ID</th>
                                  <th className="px-4 py-3">รหัสผู้แนะนำ</th>
                                  <th className="px-4 py-3">ชื่อผู้ใช้งาน/Username</th>
                                  <th className="px-4 py-3">ชื่อ-นามสกุลจริง</th>
                                  <th className="px-4 py-3">ตำแหน่งแพ็กเกจ</th>
                                  <th className="px-4 py-3">วันที่เข้าร่วมระบบ</th>
                                  <th className="px-4 py-3">สถานะบัญชี</th>
                                  <th className="px-4 py-3 text-center">ดูตำแหน่งผัง</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedReferrals.length === 0 ? (
                                  <tr>
                                    <td colSpan={8} className="p-6 text-center text-slate-400">ยังไม่พบข้อมูลผู้แนะนำตรงในประวัติของท่านในขณะนี้</td>
                                  </tr>
                                ) : (
                                  paginatedReferrals.map((member) => {
                                    // Define status conditions
                                    const isTerminated = member.status === 'Terminated' || member.status === 'Suspended' || member.status === 'Inactive';
                                    const isPending = member.statusKyc === 'Pending' || member.status === 'Pending';
                                    const isNoRank = member.rank === 'Member' || !member.rank;
                                    const isComplete = !isNoRank && member.statusKyc === 'Active';

                                    let statusColor = 'bg-slate-400';
                                    let statusText = 'สมัครยังไม่ซื้อสินค้า';
                                    if (isTerminated) {
                                      statusColor = 'bg-slate-900';
                                      statusText = 'สิ้นสภาพการสมัคร';
                                    } else if (isPending) {
                                      statusColor = 'bg-amber-400';
                                      statusText = 'รอตรวจสอบอนุมัติ';
                                    } else if (isComplete) {
                                      statusColor = 'bg-blue-500';
                                      statusText = 'สมาชิกสมบูรณ์';
                                    } else if (!isNoRank) {
                                      statusColor = 'bg-emerald-500';
                                      statusText = `เปิดสิทธิ์แพ็กเกจ ${member.rank} แล้ว`;
                                    }

                                    return (
                                      <tr key={member.userId} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3">
                                          <button 
                                            onClick={() => viewMemberInTree(member.userId, 'referral')}
                                            className="font-mono text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                          >
                                            {member.userId}
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{member.sponsorId || '-'}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{member.username}</td>
                                        <td className="px-4 py-3">{formatPdpaFirstName(member.name)}</td>
                                        <td className="px-4 py-3 font-bold">
                                          <span className={`px-2.5 py-0.5 rounded text-[10px] ${
                                            member.rank === 'XXL' ? 'bg-purple-100 text-purple-700' :
                                            member.rank === 'XL' ? 'bg-indigo-100 text-indigo-700' :
                                            member.rank === 'L' ? 'bg-blue-100 text-blue-700' :
                                            member.rank === 'M' ? 'bg-emerald-100 text-emerald-700' :
                                            member.rank === 'S' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-500'
                                          }`}>
                                            {member.rank || "Member"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                          <span className="flex items-center gap-1.5">
                                            <span className={`w-3 h-3 rounded-full ${statusColor}`} />
                                            <span className="text-[11px] font-medium">{statusText}</span>
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <button 
                                            onClick={() => viewMemberInTree(member.userId, 'referral')}
                                            className="bg-sky-50 hover:bg-sky-100 text-sky-600 px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer"
                                          >
                                            ลิงก์ไปผัง
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          <TablePagination currentPage={referralsPage} totalItems={directReferrals.length} itemsPerPage={itemsPerPage} onPageChange={setReferralsPage} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT BINARY TREE SUB-VIEW */}
              {reportSubTab === 'binary' && (
                <div className="space-y-6">
                  {/* Binary tree summary metrics */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">โครงข่ายสมาชิกที่อยู่ใต้สายงานไบนารีทั้งหมด (คน)</span>
                      <h4 className="text-2xl font-extrabold text-indigo-950">{binaryDescendants.length} สมาชิก</h4>
                    </div>
                    {/* Status legends */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-slate-400 block" />
                        <span className="text-slate-600">สีเทา: สมัครยังไม่สั่งซื้อ</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-amber-400 block" />
                        <span className="text-slate-600">สีเหลือง: รออนุมัติ KYC</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-blue-500 block" />
                        <span className="text-slate-600">สีน้ำเงิน: สมบูรณ์</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        <span className="w-3 h-3 rounded-full bg-slate-900 block" />
                        <span className="text-slate-600">สีดำ: สิ้นสภาพ</span>
                      </div>
                    </div>
                  </div>

                  {/* Binary Descendants Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                      <Layers size={16} className="text-indigo-500" /> สมาชิกโครงข่ายภายใต้รหัสของท่าน (ไบนารีแผน A)
                    </h4>

                    {(() => {
                      const itemsPerPage = 20;
                      const startIndex = (binaryPage - 1) * itemsPerPage;
                      const paginatedBinary = binaryDescendants.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">รหัสสมาชิก/ID</th>
                                  <th className="px-4 py-3">รหัสผู้แนะนำ</th>
                                  <th className="px-4 py-3">ชื่อผู้ใช้งาน/Username</th>
                                  <th className="px-4 py-3">ชื่อ-นามสกุลจริง</th>
                                  <th className="px-4 py-3">ฝั่งสายงาน</th>
                                  <th className="px-4 py-3">ตำแหน่งแพ็กเกจ</th>
                                  <th className="px-4 py-3">วันที่เริ่มลงผัง</th>
                                  <th className="px-4 py-3">สถานะสี</th>
                                  <th className="px-4 py-3 text-center">ดูตำแหน่งผัง</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {paginatedBinary.length === 0 ? (
                                  <tr>
                                    <td colSpan={9} className="p-6 text-center text-slate-400">ยังไม่พบสายงานองค์กรไบนารีใต้สายงานของท่านในขณะนี้</td>
                                  </tr>
                                ) : (
                                  paginatedBinary.map((member) => {
                                    const isTerminated = member.status === 'Terminated' || member.status === 'Suspended' || member.status === 'Inactive';
                                    const isPending = member.statusKyc === 'Pending' || member.status === 'Pending';
                                    const isNoRank = member.rank === 'Member' || !member.rank;
                                    const isComplete = !isNoRank && member.statusKyc === 'Active';

                                    let statusColor = 'bg-slate-400';
                                    let statusText = 'สมัครยังไม่ซื้อสินค้า';
                                    if (isTerminated) {
                                      statusColor = 'bg-slate-900';
                                      statusText = 'สิ้นสภาพการสมัคร';
                                    } else if (isPending) {
                                      statusColor = 'bg-amber-400';
                                      statusText = 'รอตรวจสอบอนุมัติ';
                                    } else if (isComplete) {
                                      statusColor = 'bg-blue-500';
                                      statusText = 'สมบูรณ์';
                                    } else if (!isNoRank) {
                                      statusColor = 'bg-emerald-500';
                                      statusText = `เปิดสิทธิ์แพ็กเกจ ${member.rank} แล้ว`;
                                    }

                                    return (
                                      <tr key={member.userId} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3">
                                          <button 
                                            onClick={() => viewMemberInTree(member.userId, 'binary')}
                                            className="font-mono text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                          >
                                            {member.userId}
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{member.sponsorId || '-'}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{member.username}</td>
                                        <td className="px-4 py-3">{formatPdpaFirstName(member.name)}</td>
                                        <td className="px-4 py-3">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            member.side === 'Left' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                                          }`}>
                                            {member.side === 'Left' ? 'ฝั่งซ้าย (Left)' : 'ฝั่งขวา (Right)'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold">
                                          <span className={`px-2.5 py-0.5 rounded text-[10px] ${
                                            member.rank === 'XXL' ? 'bg-purple-100 text-purple-700' :
                                            member.rank === 'XL' ? 'bg-indigo-100 text-indigo-700' :
                                            member.rank === 'L' ? 'bg-blue-100 text-blue-700' :
                                            member.rank === 'M' ? 'bg-emerald-100 text-emerald-700' :
                                            member.rank === 'S' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-500'
                                          }`}>
                                            {member.rank || "Member"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                          <span className="flex items-center gap-1.5">
                                            <span className={`w-3 h-3 rounded-full ${statusColor}`} />
                                            <span className="text-[11px] font-medium">{statusText}</span>
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <button 
                                            onClick={() => viewMemberInTree(member.userId, 'binary')}
                                            className="bg-sky-50 hover:bg-sky-100 text-sky-600 px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer"
                                          >
                                            ลิงก์ไปผัง
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                          <TablePagination currentPage={binaryPage} totalItems={binaryDescendants.length} itemsPerPage={itemsPerPage} onPageChange={setBinaryPage} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT MEMBER TAX SUB-VIEW */}
              {reportSubTab === 'memberTax' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white shadow-sm space-y-4">
                    <div>
                      <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">แผงรายงานภาษีบุคคลธรรมดา (มาตรา 40(2))</span>
                      <h3 className="text-2xl font-extrabold mt-1">รายงานภาษี & หนังสือรับรอง 50 ทวิ สมาชิก 📄</h3>
                      <p className="text-[11px] text-indigo-200 mt-1 leading-normal">
                        สรุปรายการหักภาษี ณ ที่จ่าย 5% ที่ระบบหักนำส่งสรรพากรเมื่อท่านกดถอนเงินออกจากกระเป๋า E-Money (โบนัส/คอมมิชชัน)
                      </p>
                    </div>

                    {(() => {
                      const approvedWithdrawals = transactions.filter(t => t.userId === currentUser?.userId && t.type === 'WithdrawalRequest' && t.status === 'Approved');
                      const grossIncome = approvedWithdrawals.reduce((sum, t) => sum + t.amount, 0);
                      const autoReserve = grossIncome * 0.20;
                      const taxableIncome = grossIncome - autoReserve; // 80% remaining
                      const totalWithholdingTax = taxableIncome * 0.03; // 3%
                      const totalNetReceived = approvedWithdrawals.reduce((sum, t) => sum + (t.netAmount || (t.amount * 0.76)), 0);

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <span className="text-[11px] text-indigo-200 block mb-1">ยอดรายได้สุทธิสะสม (หลังหัก 20%)</span>
                            <strong className="text-lg font-bold font-mono text-sky-200">฿ {taxableIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                            <span className="text-[11px] text-indigo-200 block mb-1">ภาษีหัก ณ ที่จ่ายสะสม (3%)</span>
                            <strong className="text-lg font-bold font-mono text-rose-300">฿ {totalWithholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-emerald-500/30 p-4 rounded-2xl border border-emerald-500/20">
                            <span className="text-[11px] text-emerald-200 block mb-1">รายได้คงเหลือรับสุทธิ์สะสม</span>
                            <strong className="text-lg font-bold font-mono text-emerald-300">฿ {totalNetReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Withdrawals Tax Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      📂 ประวัติการถอนโบนัสระบบและการยื่นหักภาษี ณ ที่จ่าย (50 ทวิ) ของคุณ
                    </h4>

                    {(() => {
                      const rawUserWithdrawals = transactions.filter(t => t.userId === currentUser?.userId && t.type === 'WithdrawalRequest');
                      const userWithdrawals = [...rawUserWithdrawals].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
                      const approvedWithdrawals = userWithdrawals.filter(t => t.status === 'Approved');
                      
                      return (
                        <>
                          {/* Annual 50 Tawi Summary Download Widget */}
                          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-indigo-900 font-medium">
                            <div className="space-y-1 text-left">
                              <h5 className="font-bold text-indigo-950 flex items-center gap-1.5">
                                📅 หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) ประจำปี พ.ศ. 2569 (ม.ค. - ธ.ค. 2569)
                              </h5>
                              <p className="text-[11px] text-indigo-700">
                                สรุปยอดรวมรายได้ค่านายหน้าสะสมและภาษีนำส่งสรรพากรทั้งหมดตลอดปี พ.ศ. 2569 ในเอกสารฉบับเดียว
                              </p>
                            </div>
                            {approvedWithdrawals.length > 0 ? (
                              <button
                                onClick={() => openAnnualTaxDoc(approvedWithdrawals)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer whitespace-nowrap"
                              >
                                <Printer size={14} /> พิมพ์ ทวิ 50 ประจำปี
                              </button>
                            ) : (
                              <span className="text-slate-400 italic">ไม่มีข้อมูลรายได้ที่อนุมัติในปีภาษีนี้</span>
                            )}
                          </div>

                          <div className="overflow-x-auto rounded-2xl border border-slate-100">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px]">
                                  <th className="p-3">วันที่/เวลาโอนเงิน</th>
                                  <th className="p-3">รหัสบิล/Txn ID</th>
                                  <th className="p-3 text-right">ยอดรายได้สุทธิ (บาท)</th>
                                  <th className="p-3 text-right">ภาษีหัก ณ.ที่จ่ายสะสม (บาท)</th>
                                  <th className="p-3 text-right">รายได้คงเหลือรับสุทธิ์ (บาท)</th>
                                  <th className="p-3 text-center">สถานะธุรกรรม</th>
                                  <th className="p-3 text-right">หนังสือ ทวิ 50</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                                {userWithdrawals.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="p-6 text-center italic text-slate-400">ยังไม่เคยทำรายการถอนเงินออกจากระบบ E-Money ค่ะ</td>
                                  </tr>
                                ) : (
                                  userWithdrawals.map(txn => {
                                    const autoReserve = txn.autoReserve !== undefined ? txn.autoReserve : (txn.amount * 0.20);
                                    const taxable = txn.taxableAmount !== undefined ? txn.taxableAmount : (txn.amount - autoReserve);
                                    const tax = txn.withholdingTax !== undefined ? txn.withholdingTax : (taxable * 0.03);
                                    const compFee = txn.companyFee !== undefined ? txn.companyFee : (taxable * 0.02);
                                    const net = txn.netAmount !== undefined ? txn.netAmount : (taxable - tax - compFee);
                                    
                                    return (
                                      <tr key={txn.id} className="hover:bg-slate-50/40 font-sans">
                                        <td className="p-3">{new Date(txn.createdAt).toLocaleString('th-TH')}</td>
                                        <td className="p-3 font-mono font-bold text-[10px]">{txn.id}</td>
                                        <td className="p-3 text-right font-semibold text-slate-900">฿ {taxable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right font-bold text-rose-600">฿ {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right font-extrabold text-emerald-600">฿ {net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-center">
                                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                            txn.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                          }`}>
                                            {txn.status === 'Approved' ? '✓ สำเร็จแล้ว' : 'รอแอนมินอนุมัติ'}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right">
                                          {txn.status === 'Approved' ? (
                                            <button
                                              onClick={() => openTaxDoc('member', txn)}
                                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm hover:shadow ml-auto"
                                            >
                                              <FileText size={12} /> ใบ 50 ทวิ
                                            </button>
                                          ) : (
                                            <span className="text-[10px] text-slate-400 italic">พร้อมพิมพ์เมื่อสำเร็จ</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* REPORT SELLER TAX SUB-VIEW */}
              {reportSubTab === 'sellerTax' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-sm space-y-4">
                    <div>
                      <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">แผงรายงานภาษีร้านค้า/แบรนด์สินค้า (มาตรา 40(8))</span>
                      <h3 className="text-2xl font-extrabold mt-1">รายงานภาษีและส่วนแบ่งกำไร ทวิ 50 ร้านค้า 🏪</h3>
                      <p className="text-[11px] text-indigo-200 mt-1 leading-normal">
                        สรุปข้อมูลรายได้และภาษีหัก ณ ที่จ่าย 3% ที่ระบบนทีพลัสออกหนังสือรับรองและหักนำส่งในนามบริษัทร่วมทุน สำหรับออเดอร์จัดส่งสินค้าที่อนุมัติสำเร็จ
                      </p>
                    </div>

                    {(() => {
                      const completedOrders = sellerOrders.filter(o => o.status === 'Completed');
                      const grossSales = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
                      const vatAmount = grossSales * 7 / 107;
                      const platformGpFee = grossSales * 0.2;
                      const rawShopEarnings = grossSales * 0.8;
                      const shopWithholdingTax = rawShopEarnings * 0.03;
                      const netPayout = rawShopEarnings - shopWithholdingTax;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
                          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                            <span className="text-[10px] text-indigo-200 block">ยอดขายสะสม (Gross)</span>
                            <strong className="text-base font-bold font-mono">฿ {grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                            <span className="text-[10px] text-indigo-200 block">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                            <strong className="text-base font-bold font-mono text-amber-300">฿ {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                            <span className="text-[10px] text-indigo-200 block">ค่าธรรมเนียม GP 20%</span>
                            <strong className="text-base font-bold font-mono text-sky-200">฿ {platformGpFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                            <span className="text-[10px] text-indigo-200 block">ฐานรายรับร้านก่อนภาษี</span>
                            <strong className="text-base font-bold font-mono text-indigo-100">฿ {rawShopEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                            <span className="text-[10px] text-indigo-200 block">ภาษีหัก ณ ที่จ่าย 3%</span>
                            <strong className="text-base font-bold font-mono text-rose-300">฿ {shopWithholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-emerald-500/30 p-3.5 rounded-2xl border border-emerald-500/20 col-span-2 md:col-span-1">
                            <span className="text-[10px] text-emerald-200 block">โอนจ่ายสุทธิเข้าธนาคาร</span>
                            <strong className="text-base font-bold font-mono text-emerald-300">฿ {netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Shop Sales Tax Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      📂 รายละเอียดบิลพัสดุสินค้าจัดส่งนำส่งและภาษีสะสม 50 ทวิ (สำหรับแบรนด์ของคุณ)
                    </h4>

                    {(() => {
                      const completedOrders = sellerOrders.filter(o => o.status === 'Completed');
                      
                      return (
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px]">
                                <th className="p-3">วันที่จัดส่งสำเร็จ</th>
                                <th className="p-3">หมายเลขออเดอร์</th>
                                <th className="p-3">รายการสินค้า</th>
                                <th className="p-3 text-right">ยอดรวมบิล (Gross)</th>
                                <th className="p-3 text-right">แวตในราคาสินค้า 7%</th>
                                <th className="p-3 text-right">หัก GP 20%</th>
                                <th className="p-3 text-right">รายรับร้านก่อนภาษี</th>
                                <th className="p-3 text-right">ภาษีหัก ณ ที่จ่าย (3%)</th>
                                <th className="p-3 text-right">รับโอนสุทธิ (Net)</th>
                                <th className="p-3 text-right">หนังสือ ทวิ 50</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                              {completedOrders.length === 0 ? (
                                <tr>
                                  <td colSpan={10} className="p-6 text-center italic text-slate-400">ยังไม่มีรายการบิลจัดส่งพัสดุที่สำเร็จสมบูรณ์ในระบบนทีมาร์เก็ตค่ะ</td>
                                </tr>
                              ) : (
                                completedOrders.map(order => {
                                  const vat = order.totalPrice * 7 / 107;
                                  const gp = order.totalPrice * 0.2;
                                  const rawEarnings = order.totalPrice * 0.8;
                                  const tax = rawEarnings * 0.03;
                                  const net = rawEarnings - tax;
                                  
                                  return (
                                    <tr key={order.id} className="hover:bg-slate-50/40 font-sans">
                                      <td className="p-3">{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                                      <td className="p-3 font-mono font-bold text-[10px]">{order.id}</td>
                                      <td className="p-3 font-medium text-slate-900">{order.productName} (x{order.quantity})</td>
                                      <td className="p-3 text-right font-semibold">฿ {order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="p-3 text-right text-slate-400">฿ {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="p-3 text-right text-amber-600">฿ {gp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="p-3 text-right text-sky-700">฿ {rawEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="p-3 text-right font-bold text-rose-600">฿ {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="p-3 text-right font-extrabold text-emerald-600">฿ {net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                      <td className="p-3 text-right">
                                        <button
                                          onClick={() => openTaxDoc('seller', order)}
                                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm hover:shadow ml-auto"
                                        >
                                          <FileText size={12} /> ใบ 50 ทวิ
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SELLER CENTER PORTAL */}
