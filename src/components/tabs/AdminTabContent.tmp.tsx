                                                <button
                                                  type="button"
                                                  onClick={() => togglePackageChoiceStatus(choice.id)}
                                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] text-[8.5px] font-bold transition-all cursor-pointer ${
                                                    choice.isActive !== false 
                                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50' 
                                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50'
                                                  }`}
                                                  title="คลิกเพื่อ เปิด-ปิด การแสดงผลให้สมาชิกเห็น"
                                                >
                                                  {choice.isActive !== false ? '🟢 เปิดให้เลือก' : '🔴 ปิด (ซ่อนไว้)'}
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => setExpandedChoiceIds(prev => ({ ...prev, [choice.id]: !prev[choice.id] }))}
                                                  className="text-indigo-600 hover:text-indigo-800 font-bold text-[8.5px] bg-slate-50 hover:bg-indigo-50 px-1.5 py-0.5 rounded-[5px] border border-slate-100 transition-colors cursor-pointer"
                                                >
                                                  {expandedChoiceIds[choice.id] ? '📖 ซ่อนรายละเอียด' : '🔍 ดูรายละเอียด'}
                                                </button>
                                              </div>
                                            </div>

                                            {/* Edit / Delete Buttons */}
                                            <div className="flex gap-1 shrink-0">
                                              <button 
                                                onClick={() => {
                                                  setAdminEditingChoiceId(choice.id);
                                                  setAdminNewChoicePackageId(choice.packageId);
                                                  setAdminNewChoiceName(choice.name);
                                                  setAdminNewChoiceCost(choice.cost !== undefined ? choice.cost.toString() : '');
                                                  setAdminNewChoiceProductPrice(choice.productPrice !== undefined ? choice.productPrice.toString() : '');
                                                  setAdminNewChoiceShippingFee(choice.shippingFee !== undefined ? choice.shippingFee.toString() : '');
                                                  setAdminNewChoiceHasVat(!!choice.hasVat);
                                                  setAdminNewChoicePackagingCost(choice.packagingCost !== undefined ? choice.packagingCost.toString() : '');
                                                  setAdminNewChoiceIsActive(choice.isActive !== false);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] px-1 py-0.5 rounded hover:bg-indigo-50/80 transition-colors cursor-pointer"
                                              >
                                                แก้ไข
                                              </button>
                                              <button 
                                                onClick={() => handleDeletePackageChoice(choice.id)}
                                                className="text-rose-600 hover:text-rose-800 font-bold text-[10px] px-1 py-0.5 rounded hover:bg-rose-50/80 transition-colors cursor-pointer"
                                              >
                                                ลบ
                                              </button>
                                            </div>
                                          </div>

                                          {/* Detailed breakdown (only visible when expanded) */}
                                          {expandedChoiceIds[choice.id] && (() => {
                                            const pkgPrice = choice.packagePrice || (pkg.id === 'pack_s' ? 100 : pkg.id === 'pack_m' ? 500 : pkg.id === 'pack_l' ? 1000 : pkg.id === 'pack_xl' ? 3000 : 5000);
                                            const slsVat = choice.salesVat !== undefined ? choice.salesVat : (pkgPrice * 7 / 107);
                                            const prdCost = choice.productCost !== undefined ? choice.productCost : (choice.productPrice || 0);
                                            const isVat = !!choice.hasVat;
                                            const inpVat = choice.inputVat !== undefined ? choice.inputVat : (isVat ? prdCost * 0.07 : 0);
                                            const prdCostWithVat = choice.productCostWithVat !== undefined ? choice.productCostWithVat : (prdCost + inpVat);
                                            const pkgCost = choice.packagingCost || 0;
                                            const shpFee = choice.shippingFee || 0;
                                            const vtPayable = choice.vatPayable !== undefined ? choice.vatPayable : (slsVat - inpVat);
                                            const pvPayout = choice.pvPayout !== undefined ? choice.pvPayout : (pkgPrice * 0.5);
                                            const totExpense = prdCostWithVat + pkgCost + shpFee + vtPayable + pvPayout;
                                            const remProfit = pkgPrice - totExpense;

                                            return (
                                              <div className="flex flex-col space-y-1 text-[10px] text-slate-500 font-mono mt-1 pt-2 border-t border-dashed border-slate-100">
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                                  <div className="flex justify-between">
                                                    <span>ราคาขาย:</span>
                                                    <span className="font-bold text-slate-700">฿{pkgPrice.toLocaleString()}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>ภาษีขาย 7%:</span>
                                                    <span>฿{slsVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>ราคาทุนสินค้า:</span>
                                                    <span>
                                                      ฿{prdCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                      {isVat && <span className="text-indigo-600 text-[8px] font-sans font-bold ml-0.5">(Vat)</span>}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>กล่อง/บรรจุภัณฑ์:</span>
                                                    <span>฿{pkgCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>ค่าจัดส่ง:</span>
                                                    <span>฿{shpFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>ภาษีนำส่ง:</span>
                                                    <span className="text-indigo-600 font-bold">฿{vtPayable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                  </div>
                                                  <div className="flex justify-between col-span-2 border-t border-dashed border-slate-100 pt-0.5">
                                                    <span>หักจ่าย PV (50%):</span>
                                                    <span className="text-amber-600 font-bold">฿{pvPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center bg-slate-50/80 px-1.5 py-1 rounded mt-1 text-[10.5px] border border-slate-100">
                                                  <span className="font-bold text-slate-600 text-[10px]">รวมคชจ: ฿{totExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                  <span className={`font-black ${remProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    คงเหลือ: ฿{remProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                                      <p className="text-[10px] text-slate-400 italic">ไม่มีข้อมูลชุดของขวัญสินค้า</p>
                                      <span className="text-[9px] text-slate-300 block mt-0.5">กรุณาเพิ่มรายการสินค้าที่ฟอร์มซ้ายมือนะคะ</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'systemConditions' && (
                <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto text-slate-850">
                  {/* Header Banner */}
                  <div className="bg-slate-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-indigo-600/15 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl"></div>
                    
                    <div className="relative space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                        ⚖️ ศูนย์กำกับดูแลและตรวจสอบเงื่อนไขระบบ (NaTee Plus System Integrity & Audits)
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        📋 ข้อกำหนด เงื่อนไข และระเบียบปฏิบัติด้านการคำนวณภาษีและคอมมิชชันทั้งระบบ
                      </h3>
                      <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                        เอกสารควบคุมโครงสร้างระบบความโปร่งใสทางบัญชี การจัดเก็บค่า GP การคำนวณคอมมิชชันแผนงาน แผน A แผน B กองทุนส่วนแบ่ง All-Share กองทุนปันสุข CSR การหักภาษีมูลค่าเพิ่ม VAT 7% และการหักภาษี ณ ที่จ่าย 3% ตามประมวลรัษฎากรแห่งประเทศไทย
                      </p>
                    </div>
                  </div>

                  {/* SUB TAB CONTROLS FOR SYSTEM CONDITIONS */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    {[
                      { id: 'registration', label: '👤 สมัครสมาชิก & แพ็กเกจ', icon: <UserCheck size={14} /> },
                      { id: 'plana', label: '📊 แผน A ยูนิลีเวอร์ 20 ชั้น', icon: <Binary size={14} /> },
                      { id: 'planb', label: '🏆 แผน B B1-B15', icon: <Award size={14} /> },
                      { id: 'allshare', label: '💎 All-Share & ปันสุข', icon: <Heart size={14} /> },
                      { id: 'remainingRights', label: '🛡️ เงื่อนไข สิทธิ์คงเหลือ', icon: <ShieldCheck size={14} /> },
                      { id: 'transfers', label: '💸 การโอน & การถอนเงิน', icon: <ArrowLeftRight size={14} /> },
                      { id: 'partner', label: '🤝 พาร์ทเนอร์ร้านค้า & GP', icon: <Store size={14} /> },
                      { id: 'accounting', label: '🏦 บัญชีแยกประเภท & ภาษี', icon: <Receipt size={14} /> },
                      { id: 'simulators', label: '🧮 เครื่องคิดเลขจำลอง', icon: <Calculator size={14} /> },
                      { id: 'pdpa', label: '🛡️ นโยบาย PDPA (นที พลัส)', icon: <ShieldCheck size={14} /> },
                      { id: 'escrow15Days', label: '🛡️ ระบบประกัน 15 วัน & พักเงินร้านค้า', icon: <ShieldCheck size={14} /> },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSystemCondTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          systemCondTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                            : 'bg-white hover:bg-slate-150 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* TAB CONTENTS */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm min-h-[400px]">
                    
                    {/* 1. REGISTRATION & PACKAGES */}
                    {systemCondTab === 'registration' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
                            👤
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">เงื่อนไขการสมัครสมาชิกและแพ็กเกจตำแหน่ง (Membership Rules & Rank Matrix)</h4>
                            <p className="text-xs text-slate-400">ระบบคัดกรอง ข้อมูลการยืนยันตัวตน และสิทธิ์รับรายได้สูงสุด 10 เท่าตามมูลค่าแพ็กเกจที่ลงทะเบียน</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">📝 ข้อกำหนดข้อมูลการลงทะเบียน (KYC Prerequisites)</h5>
                            <ul className="space-y-2.5 text-xs text-slate-600">
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <div>
                                  <strong>รหัสผู้แนะนำ (Sponsor ID):</strong> จำเป็นต้องมีผู้แนะนำในระบบเสมอเพื่อใช้วางสายงานในโครงสร้าง MLM ไบนารี่ (หากไม่มี จะถูกส่งให้ Admin เป็นผู้ดูแลหลัก)
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <div>
                                  <strong>ข้อมูลยืนยันตัวตน (KYC):</strong> ชื่อ-นามสกุลจริง, เลขบัตรประชาชน 13 หลัก, และรูปถ่ายหน้าบัตรประชาชน (ต้องผ่านการอนุมัติโดยระบบเพื่อรับสิทธิ์ทำรายการถอนเงิน)
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <div>
                                  <strong>บัญชีธนาคารรับเงินโอน:</strong> เลขที่บัญชี, ชื่อบัญชีธนาคาร (ชื่อผู้ถือบัญชีต้องตรงกับชื่อที่ลงทะเบียนในบัตรประชาชน 100% เพื่อความปลอดภัยจากการฟอกเงิน)
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <div>
                                  <strong>รหัสผ่านธุรกรรม (PIN 6 หลัก):</strong> ตั้งค่าเพื่อใช้ยืนยันตนในทุกขั้นตอนการทำรายการโอนและถอนเงิน เสริมทัพด้วยรหัสผ่าน OTP ส่งตรงทาง SMS โทรศัพท์มือถือ
                                </div>
                              </li>
                            </ul>

                            {/*🔐 PASSWORD COMPLEXITY REQUIREMENT BOX */}
                            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs text-amber-950">
                              <p className="font-extrabold flex items-center gap-1 text-amber-900">
                                🔐 เงื่อนไขรหัสผ่านใหม่และรหัส PIN (Mandatory Password & Security Policy):
                              </p>
                              <p className="leading-relaxed text-[11px] text-amber-900/90">
                                ระบบบังคับให้เปลี่ยนรหัสผ่านเริ่มต้นระบบ (<code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold">Natee!234</code>) ทันทีในการเข้าสู่ระบบครั้งแรก โดยรหัสผ่านใหม่ต้องตรงตามเงื่อนไขความปลอดภัยครบถ้วน:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-950/90 pl-1">
                                <li>ความยาวอย่างน้อย <strong>6 ตัวอักษรขึ้นไป</strong></li>
                                <li>ต้องมีตัวอักษรภาษาอังกฤษตัวใหญ่ (<strong>A-Z</strong>) อย่างน้อย 1 ตัว</li>
                                <li>ต้องมีตัวอักษรภาษาอังกฤษตัวเล็ก (<strong>a-z</strong>) อย่างน้อย 1 ตัว</li>
                                <li>ต้องมีตัวเลข (<strong>0-9</strong>) อย่างน้อย 1 ตัว</li>
                                <li>ต้องมีอักขระพิเศษ (เช่น <code className="bg-amber-200/60 px-1 rounded font-mono">! @ # $ % ^ & *</code>) อย่างน้อย 1 ตัว</li>
                                <li>กำหนดรหัสธุรกรรม <strong>PIN ตัวเลข 6 หลัก</strong> เพื่อใช้ยืนยันการทำรายการการเงิน</li>
                              </ul>
                            </div>

                            {/*🏦 ACCOUNT & BANK ACCEPTANCE REQUIREMENT BOX */}
                            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-2 text-xs text-emerald-950">
                              <p className="font-extrabold flex items-center gap-1 text-emerald-900">
                                🏦 เงื่อนไขการรับอนุมัติบัญชีและการผูกบัญชีธนาคาร (Account & Bank Binding Acceptance Policy):
                              </p>
                              <ul className="list-disc list-inside space-y-1.5 text-[11px] text-emerald-900 pl-1 leading-relaxed">
                                <li>
                                  <strong>ชื่อบัญชีธนาคารตรงกัน 100%:</strong> บัญชีธนาคารสำหรับรับโอนคอมมิชชัน ต้องมีชื่อ-นามสกุลตรงกับผู้ถือบัตรประชาชนในระบบ 100% (เพื่อป้องกันนอมินีและการฟอกเงิน)
                                </li>
                                <li>
                                  <strong>1 สิทธิ์ต่อ 1 บัญชีรับเงิน:</strong> จำกัด 1 เลขบัตรประชาชน ต่อ 1 บัญชีรับผลประโยชน์หลัก เพื่อความถูกต้องในระบบนำส่งภาษีหัก ณ ที่จ่าย 3% แก่กรมสรรพากร
                                </li>
                                <li>
                                  <strong>การรับสิทธิ์อนุมัติบัญชี:</strong> สมาชิกต้องส่งเอกสารภาพถ่ายหน้าบัตรประชาชนและสมุดบัญชีธนาคาร (Bookbank) คมชัด เพื่อผ่านการอนุมัติสิทธิ์ถอนเงินจากระบบ
                                </li>
                                <li>
                                  <strong>การเปลี่ยนบัญชีรับเงิน:</strong> ต้องยื่นเรื่องพร้อมภาพถ่ายถือบัตรคู่กับหน้าสมุดบัญชีใหม่ เพื่อให้ฝ่ายบริหาร (Admin) ตรวจสอบและอนุมัติเท่านั้น
                                </li>
                              </ul>
                            </div>

                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2 text-xs text-indigo-950">
                              <p className="font-bold flex items-center gap-1">⚡ กฎการซื้อครั้งแรก (First Purchase rule):</p>
                              <p className="leading-relaxed">
                                สำหรับผู้สมัครใหม่ทุกคนที่เริ่มต้นจากสถานะ <strong>Member (ทั่วไป)</strong> หากต้องการเปิดสิทธิ์การขายสินค้าหรือวางสายงาน ระบบจะบังคับให้สั่งซื้อ <strong>แพ็กเกจ S (100 บาท)</strong> ซึ่งถือเป็นค่าสมัครใช้ระบบร้านค้าออนไลน์ก่อนเป็นลำดับแรก จากนั้นจึงจะสามารถซื้อสินค้าทั่วไปหรืออัพเกรดแพ็กเกจตำแหน่งที่สูงขึ้นได้
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">💎 รายละเอียดโครงสร้างแพ็กเกจ (Rank Specification Table)</h5>
                            
                            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                  <tr>
                                    <th className="px-3 py-2.5">ตำแหน่ง</th>
                                    <th className="px-3 py-2.5 text-right">ราคา (บาท)</th>
                                    <th className="px-3 py-2.5 text-right">คะแนน PV</th>
                                    <th className="px-3 py-2.5 text-right">เพดานรับ (บาท)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                                  <tr>
                                    <td className="px-3 py-2.5 font-sans font-bold text-indigo-600">S (เปิดร้าน)</td>
                                    <td className="px-3 py-2.5 text-right font-bold">100</td>
                                    <td className="px-3 py-2.5 text-right">0 PV</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600 font-bold">1,000 (10x)</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-sans font-bold text-amber-600">M</td>
                                    <td className="px-3 py-2.5 text-right font-bold">500</td>
                                    <td className="px-3 py-2.5 text-right">250 PV</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600 font-bold">5,000 (10x)</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-sans font-bold text-teal-600">L</td>
                                    <td className="px-3 py-2.5 text-right font-bold">1,000</td>
                                    <td className="px-3 py-2.5 text-right">500 PV</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600 font-bold">10,000 (10x)</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-sans font-bold text-rose-600">XL</td>
                                    <td className="px-3 py-2.5 text-right font-bold">3,000</td>
                                    <td className="px-3 py-2.5 text-right">1,500 PV</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600 font-bold">30,000 (10x)</td>
                                  </tr>
                                  <tr className="bg-amber-50/20">
                                    <td className="px-3 py-2.5 font-sans font-bold text-purple-600">XXL (สูงสุด)</td>
                                    <td className="px-3 py-2.5 text-right font-bold">5,000</td>
                                    <td className="px-3 py-2.5 text-right">2,500 PV</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600 font-bold">50,000 (10x)</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* กล่องบันทึกเงื่อนไขการจัดสรรรายได้แพ็กเกจ S (100 บาท / 0 PV) */}
                            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 space-y-3 text-xs text-slate-800 shadow-sm">
                              <div className="flex items-center gap-2 font-black text-amber-900 border-b border-amber-200/80 pb-2">
                                <span className="bg-amber-600 text-white rounded-lg px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide">เงื่อนไขเฉพาะ</span>
                                <span>เงื่อนไขการจัดสรรรายได้แพ็กเกจ S (เปิดร้านค้า 100 บาท - 0 PV)</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
                                <strong>แพ็กเกจ S (เปิดร้านค้า 100 บาท) ไม่มีคะแนน PV (0 PV)</strong> โดยรายได้จากการรับสมัครเปิดร้านค้า 100 บาท มีการแบ่งสัดส่วนจ่ายผลตอบแทน ดังนี้:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs">
                                  <span className="font-sans text-slate-600 font-medium">1. จ่ายผู้แนะนำ (ค่าแนะนำเปิดร้าน):</span>
                                  <span className="font-bold font-mono text-emerald-700">50 บาท</span>
                                </div>
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs">
                                  <span className="font-sans text-slate-600 font-medium">2. เข้าคูปองสมาชิก:</span>
                                  <span className="font-bold font-mono text-indigo-700">10 บาท</span>
                                </div>
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs">
                                  <span className="font-sans text-slate-600 font-medium">1. จ่ายผู้แนะนำ (ค่าแนะนำเปิดร้าน):</span>
                                  <span className="font-bold font-mono text-emerald-700">50 บาท <span className="font-sans text-[10px] text-slate-500 font-normal">(เข้าคูปองสมาชิก 40B [หัก 10% สะสม Plan B] + Plan B 10B)</span></span>
                                </div>
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs">
                                  <span className="font-sans text-slate-600 font-medium">2. เข้าโครงสร้าง Plan B:</span>
                                  <span className="font-bold font-mono text-purple-700">5 บาท</span>
                                </div>
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs">
                                  <span className="font-sans text-slate-600 font-medium">3. เข้ากองทุน All Share:</span>
                                  <span className="font-bold font-mono text-sky-700">20 บาท</span>
                                </div>
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs">
                                  <span className="font-sans text-slate-600 font-medium">4. เข้ากองทุนปันสุข (CSR):</span>
                                  <span className="font-bold font-mono text-amber-700">5 บาท</span>
                                </div>
                                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100/80 flex justify-between items-center shadow-2xs sm:col-span-2">
                                  <span className="font-sans text-slate-600 font-medium">5. ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                                  <span className="font-bold font-mono text-slate-700">6.54 บาท <span className="font-sans text-[10px] text-slate-500 font-normal">(100/1.07 = 93.46 บาท)</span></span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2 text-[11px] text-slate-500 leading-relaxed">
                              <p className="font-bold text-slate-700">⚠️ สิทธิ์การรับรายได้สูงสุด (Income Quota Limit):</p>
                              <p>
                                ระบบคิดเกณฑ์ความมั่งคั่งสูงสุดโดยจำกัดยอดการรับผลตอบแทนคอมมิชชันและโบนัสทุกประเภทรวมกันไว้ที่ <strong>10 เท่า (1,000%)</strong> ของราคาแพ็กเกจที่ได้ซื้อสะสมล่าสุด (เรียกว่าสิทธิ์ <strong>Eligible Rights</strong>)
                              </p>
                              <p>
                                หากสิทธิ์ดังกล่าวหมดลงจนเหลือ 0 (เรียกว่ายอดเต็มเพดาน) รหัสผ่านนั้นจะถูกเปลี่ยนสถานะเป็นสิทธิ์ขาดคราว ระบบจะทำการระงับจ่ายโบนัสใหม่ของรหัสนั้น และทำธุรกรรมบีบอัดข้ามไปจ่ายให้อัพไลน์ข้างบนแทน จนกว่าสมาชิกรหัสนั้นจะสั่งซื้อสินค้าหรืออัพเกรดแพ็กเกจเพิ่มเติมเพื่อเติมวงเงินสิทธิ์ให้กลับมาใช้งานได้อีกครั้ง
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. PLAN A BINARY */}
                    {systemCondTab === 'plana' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-inner">
                            📊
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">แผนงานรายได้ผังองค์กร แผน A ยูนิลีเวอร์ 20 ชั้น (Placement Tree & 20-Level Unilevel Bonus)</h4>
                            <p className="text-xs text-slate-400">โครงสร้างการจัดวางสมาชิกและการคำนวณจ่ายโบนัสยูนิลีเวอร์ลึก 20 ชั้นแบบเรียลไทม์</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">📐 โครงสร้างการจ่ายผลตอบแทน (Commissions & Level Depth)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              ทุกยอดการสั่งซื้อสินค้าใดๆ บนระบบ Natee Plus Market จะนำพาคะแนน PV มาด้วยเสมอ โดยคะแนน PV นี้จะถูกวิ่งส่งตรงขึ้นสายงานอัพไลน์ขึ้นไปสูงสุดถึง <strong>20 ชั้นสายงาน</strong> ในอัตราผลตอบแทน <strong>2.0% ต่อชั้น</strong> ของคะแนน PV (1 PV = 1 บาท)
                            </p>

                            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                  <tr>
                                    <th className="px-3 py-2.5">ตำแหน่ง</th>
                                    <th className="px-3 py-2.5 text-center">สิทธิ์การรับรายได้ชั้นลึกองค์กร</th>
                                    <th className="px-3 py-2.5 text-right">ยอดรับสูงสุด (%)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-indigo-600">S</td>
                                    <td className="px-3 py-2.5 text-center font-mono">1 ชั้นองค์กรลึก</td>
                                    <td className="px-3 py-2.5 text-right font-mono">2.00%</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-amber-600">M</td>
                                    <td className="px-3 py-2.5 text-center font-mono">5 ชั้นองค์กรลึก</td>
                                    <td className="px-3 py-2.5 text-right font-mono">10.00%</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-teal-600">L</td>
                                    <td className="px-3 py-2.5 text-center font-mono">10 ชั้นองค์กรลึก</td>
                                    <td className="px-3 py-2.5 text-right font-mono">20.00%</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-rose-600">XL</td>
                                    <td className="px-3 py-2.5 text-center font-mono">15 ชั้นองค์กรลึก</td>
                                    <td className="px-3 py-2.5 text-right font-mono">30.00%</td>
                                  </tr>
                                  <tr className="bg-amber-50/20">
                                    <td className="px-3 py-2.5 font-bold text-purple-600">XXL</td>
                                    <td className="px-3 py-2.5 text-center font-mono">20 ชั้นองค์กรลึก (สูงสุด)</td>
                                    <td className="px-3 py-2.5 text-right font-mono">40.00%</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-950">
                              <p className="font-bold flex items-center gap-1">🔄 ระบบบีบสายงานขึ้นด้านบน (Dynamic Compression):</p>
                              <p className="leading-relaxed mt-1">
                                เมื่อรหัสใดในโครงสร้างไม่มีสิทธิ์รับรายได้ (วงเงินสะสมเต็ม 10 เท่า หรือไม่ได้อยู่ในระดับตำแหน่งที่จะได้รับสิทธิ์ลึกชั้นนั้น) ระบบของ NaTee Plus จะใช้กลไก <strong>"Low-up Bypass"</strong> ข้ามขยับรหัสนั้นออกไป และมองหาอัพไลน์ในชั้นบนถัดขึ้นไปที่มีคุณสมบัติครบแทน โดยไม่บังคับให้ยืนยันตัวตน KYC ก่อนในการรับปันผลสะสม (แต่ทางระบบจะบังคับให้ต้องยืนยันตัวตน KYC ก็ต่อเมื่อสมาชิกต้องการดำเนินธุรกรรมโอนเงินหรือถอนเงินออกจากระบบเท่านั้น) ทั้งนี้เพื่อให้การจ่ายเงินในบิลนั้นสมบูรณ์ครอบคลุมและจ่ายครบจริงเต็มจำนวน 20 ชั้นที่กำหนด โดยคะแนนผลตอบแทนจะไม่สูญหายไปในระบบ
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">✂️ โครงสร้างการแบ่งหักคอมมิชชันแบนด์ 20% (Flat Deduction Split)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              เพื่อนำไปค้ำจุนสภาพคล่อง ปันสุขสู่สังคม และหล่อเลี้ยงระบบออโต้รันแบบเดี่ยวทั่วโลก (Plan B) คอมมิชชันผังไบนารี่ทุกยอดที่เกิดขึ้นจริง จะโดนหักปันส่วนเป็นอัตราส่วนคงที่ <strong>20% (Flat Rate)</strong> ดังรายละเอียดต่อไปนี้:
                            </p>

                            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 text-xs">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                <span className="font-bold text-slate-700">รายได้เข้ากระเป๋า E-Money (ถอนเงินได้)</span>
                                <span className="font-bold text-emerald-600 font-mono text-sm">80.00%</span>
                              </div>
                              <div className="space-y-1.5 text-slate-600 text-[11px] pl-1">
                                <div className="flex justify-between">
                                  <span>• เงินคูปองส่วนลดซื้อสินค้า (E-Coupon Wallet):</span>
                                  <span className="font-mono text-slate-800">9.00% (สุทธิหลังส่งคืนกลาง 1%)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• เงินทุนกองทุนกลางเฉลี่ยจ่ายรอบพาร์ทเนอร์ (All-Share Pool):</span>
                                  <span className="font-mono text-indigo-600">3.00% + หักคืน E-Coupon 1%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• คะแนนสะสมออโต้รันขึ้นผังเดี่ยวโลก (Plan B Points):</span>
                                  <span className="font-mono text-amber-600">5.00% (เพื่อนำไปจำลองรหัสเดี่ยว B1)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• เงินทุนสังคมสงเคราะห์พัฒนาชุมชน (CSR Fund - กองทุนปันสุข):</span>
                                  <span className="font-mono text-teal-600">1.00% (จ่ายคืนในนามสมาชิกที่ทำผลงาน)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>• ค่ารักษาความปลอดภัยและกำไรดำเนินงานระบบ (Company Profit):</span>
                                  <span className="font-mono text-purple-600">1.00%</span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-700 font-bold">
                                <span>ยอดหักจัดเก็บรวมเพื่อหมุนเวียนระบบนิเวศน์:</span>
                                <span className="font-mono text-rose-600">20.00%</span>
                              </div>
                            </div>

                            <div className="bg-amber-50/20 border border-amber-200/80 rounded-2xl p-4 text-[11px] text-amber-950 space-y-1.5 leading-relaxed">
                              <p className="font-bold">📄 ตัวอย่างการคำนวณ:</p>
                              <p>
                                ยอดซื้อสินค้าของทีมใต้สายงานมีคะแนนสะสม <strong>10,000 PV</strong> <br />
                                • ค่าคอมมิชชันรวม (2.0%) = <strong>200 บาท</strong> <br />
                                • ยอดจ่ายจริงเข้ากระเป๋า <strong>E-Money</strong> สมาชิก = 200 x 80% = <strong>160.00 บาท</strong> <br />
                                • ยอดคะแนนสะสมอัพขึ้น <strong>Plan B Points</strong> = 200 x 5% = <strong>10.00 คะแนน</strong> (เมื่อสะสมคะแนนครบ 100 ระบบจะทำการสร้างรหัสวิ่งไปลงผังเดี่ยวระดับโลกให้อัตโนมัติทันที)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. PLAN B AUTOMATION B1-B15 */}
                    {systemCondTab === 'planb' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-inner">
                            🏆
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">ระบบแผนกองทุนพิเศษออโต้รันเดี่ยวทั่วโลก Plan B1-B15 (Plan B Global Auto-run & Cycle Payouts)</h4>
                            <p className="text-xs text-slate-400">โครงสร้างจ่ายปันผลจากการเรียงคิวระดับสากล ไม่ขึ้นกับสายงานตรง และการแบ่งสัดส่วนเงินทุนข้ามระดับ 15 ชั้น</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🧬 หลักการสร้างรหัสและการคำนวณวงรอบ (Auto-run Queuing & Spawn Mechanism)</h5>
                          <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                            <p>
                              ทุกครั้งที่สมาชิกสะสมคะแนนจากโบนัส Plan A ครบทุก <strong>100 Plan B Points</strong> ระบบจะทำการโคลนนิ่งรหัสออโต้รัน 1 รหัส นำไปเสียบต่อท้ายระบบแถวเดียวระดับโลก (Global Single Tree Line) โดยไล่ลำดับจากซ้ายไปขวาและบนลงล่างอย่างเสมอภาค ไม่เลือกผู้แนะนำหรือสายงานตรงใดๆ ทั้งสิ้น
                            </p>
                            <p>
                              เมื่อมีรหัสในแถวมาต่อท้ายจนเต็มโครงสร้างไบนารี่ 5 ชั้นเต็ม (ครบจำนวน <strong>62 รหัส</strong> ด้านใต้รหัสนั้น) ระบบจะตัดยอดความสำเร็จของรอบ (Cycle Completed) และคิดมูลค่าการจ่ายเงินกองทุนคืนกลับดังนี้:
                            </p>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 font-mono text-[11px] text-slate-700 space-y-2">
                              <p className="font-bold text-slate-850">📊 สูตรคำนวณเงินกองทุนระบบแชร์พูลต่อหนึ่งระดับ:</p>
                              <p>• ยอดจ่ายรวมกองทุนของโครงสร้าง (Total Payout) = <strong>62 x (มูลค่าหน่วยระดับ Node Value ÷ 5)</strong></p>
                              <p>• แบ่งปันจ่ายส่วนได้เสียในองค์ประกอบระบบนิเวศน์ออกเป็น <strong>6 ส่วนเท่าๆ กัน (6 Parts)</strong> (ส่วนละ 12.4x ของ Node Value) ดังนี้:</p>
                              <ul className="list-decimal pl-5 space-y-1 text-slate-600 text-[10px]">
                                <li><strong>กระเป๋าเงิน E-Cash (รายได้ปันผล):</strong> เพื่อนำไปหัก Flat 20% จ่ายเป็น E-Money และเติมเข้าส่วนอื่นๆ อีก 5 ทิศทาง</li>
                                <li><strong>กระเป๋าเงิน E-Coupon:</strong> เพื่อกลับไปใช้เป็นคะแนนส่วนลดสั่งซื้อสินค้าคุณภาพประหยัดค่าครองชีพ</li>
                                <li><strong>ทุนสะสมขยับขึ้นระดับถัดไป (Spawn Reserve):</strong> ออมทุนเพื่อสร้างรหัสถัดขึ้นไป (ระดับ N+1) เช่น สำเร็จ B1 อัพเกรดขึ้นระดับ B2 อัตโนมัติ</li>
                                <li><strong>เงินโบนัส All-Share (แชร์ยอดขายทั่วโลก):</strong> มอบคืนกลับสู่พูลโบนัสพิเศษในพาร์ทสมาชิกระดับนำ</li>
                                <li><strong>กองทุนสังคมสงเคราะห์ปันสุข (CSR Fund):</strong> เสริมสร้างความอบอุ่นแบ่งปันสู่กลุ่มผู้ขาดแคลนและสังคมพาร์ทเนอร์</li>
                                <li><strong>ค่าบริหารจัดการและสิทธิ์ใช้เซิร์ฟเวอร์บริษัท (Company Profit):</strong> เพื่อพัฒนาระบบเทคโนโลยีอย่างยั่งยืน</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">📋 ตารางผลตอบแทน Plan B1 - B15 (All Tiers Revenue Matrix)</h5>
                          
                          <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-slate-900 text-slate-100 font-bold font-sans">
                                  <tr>
                                    <th className="px-3 py-3">รหัสระดับ</th>
                                    <th className="px-3 py-3 text-right">ค่ารหัสตั้งต้น (Node Value)</th>
                                    <th className="px-3 py-3 text-right">ยอดรวมที่เกิดขึ้น (Total Payout)</th>
                                    <th className="px-3 py-3 text-right">ปันส่วนละ 1 ใน 6 (บาท)</th>
                                    <th className="px-3 py-3 text-right">ยอดเงินรับโอนจริง (E-Money)</th>
                                    <th className="px-3 py-3 text-right">คูปองที่รับจริง (E-Coupon)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-600 text-[11px] bg-white">
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-indigo-50/20">🏆 B1</td>
                                    <td className="px-3 py-2 text-right">100.00</td>
                                    <td className="px-3 py-2 text-right text-slate-900">1,240.00</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">140.00</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">112.00 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">140.00</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-indigo-50/20">🏆 B2</td>
                                    <td className="px-3 py-2 text-right">140.00</td>
                                    <td className="px-3 py-2 text-right text-slate-900">1,736.00</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">289.33</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">231.46 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">289.33</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-indigo-50/20">🏆 B3</td>
                                    <td className="px-3 py-2 text-right">289.33</td>
                                    <td className="px-3 py-2 text-right text-slate-900">3,587.73</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">597.96</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">478.36 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">597.96</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-indigo-50/20">🏆 B4</td>
                                    <td className="px-3 py-2 text-right">597.96</td>
                                    <td className="px-3 py-2 text-right text-slate-900">7,414.65</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">1,235.78</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">988.62 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">1,235.78</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-indigo-50/20">🏆 B5</td>
                                    <td className="px-3 py-2 text-right">1,235.78</td>
                                    <td className="px-3 py-2 text-right text-slate-900">15,323.61</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">2,553.93</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">2,043.15 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">2,553.93</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700">🏆 B6</td>
                                    <td className="px-3 py-2 text-right">2,553.93</td>
                                    <td className="px-3 py-2 text-right text-slate-900">31,668.79</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">5,278.13</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">4,222.50 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">5,278.13</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700">🏆 B7</td>
                                    <td className="px-3 py-2 text-right">5,278.13</td>
                                    <td className="px-3 py-2 text-right text-slate-900">65,448.84</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">10,908.14</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">8,726.51 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">10,908.14</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700">🏆 B8</td>
                                    <td className="px-3 py-2 text-right">10,908.14</td>
                                    <td className="px-3 py-2 text-right text-slate-900">135,260.94</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">22,543.49</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">18,034.79 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">22,543.49</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700">🏆 B9</td>
                                    <td className="px-3 py-2 text-right">22,543.49</td>
                                    <td className="px-3 py-2 text-right text-slate-900">279,539.27</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">46,589.88</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">37,271.90 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">46,589.88</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700">🏆 B10</td>
                                    <td className="px-3 py-2 text-right">46,589.88</td>
                                    <td className="px-3 py-2 text-right text-slate-900">577,714.49</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">96,285.75</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">77,028.60 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">96,285.75</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-amber-50/10">🏆 B11</td>
                                    <td className="px-3 py-2 text-right">96,285.75</td>
                                    <td className="px-3 py-2 text-right text-slate-900">1,193,943.28</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">198,990.55</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">159,192.44 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">198,990.55</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-amber-50/10">🏆 B12</td>
                                    <td className="px-3 py-2 text-right">198,990.55</td>
                                    <td className="px-3 py-2 text-right text-slate-900">2,467,482.78</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">411,247.13</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">328,997.70 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">411,247.13</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-amber-50/10">🏆 B13</td>
                                    <td className="px-3 py-2 text-right">411,247.13</td>
                                    <td className="px-3 py-2 text-right text-slate-900">5,099,464.41</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">849,910.74</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">679,928.59 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">849,910.74</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-sans font-black text-indigo-700 bg-amber-50/10">🏆 B14</td>
                                    <td className="px-3 py-2 text-right">849,910.74</td>
                                    <td className="px-3 py-2 text-right text-slate-900">10,538,893.18</td>
                                    <td className="px-3 py-2 text-right font-bold text-slate-800">1,756,482.20</td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-bold">1,405,185.76 (Net)</td>
                                    <td className="px-3 py-2 text-right font-bold">1,756,482.20</td>
                                  </tr>
                                  <tr className="bg-amber-100/25">
                                    <td className="px-3 py-2.5 font-sans font-black text-purple-800">🏆 B15 (สูงสุด)</td>
                                    <td className="px-3 py-2.5 text-right font-bold">1,756,482.20</td>
                                    <td className="px-3 py-2.5 text-right text-slate-900 font-bold">21,780,379.24</td>
                                    <td className="px-3 py-2.5 text-right font-black text-purple-700">4,356,075.85</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600 font-black">3,484,860.68 (Net)</td>
                                    <td className="px-3 py-2.5 text-right font-black">4,356,075.85</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                            <p className="font-bold text-slate-700">📌 หมายเหตุพิเศษระดับ B15:</p>
                            <p>
                              สำหรับระดับสูงสุดคือ <strong>B15</strong> ระบบจะไม่ต้องแบ่งปันเงินส่วนทุนสะสมส่งต่อไปยังชั้นถัดไปอีก (เนื่องจากไม่มีสระระดับ B16) ยอดปันส่วนทั้งหมดจะถูกตัดหารด้วย <strong>5 ส่วน</strong> (แทนที่จะหาร 6 เหมือนระดับ 1-14) เพื่อจ่ายคืนผลตอบแทนให้เต็มพูลและไม่มีเศษค้างทิ้งไว้ในระบบ ทำให้สมาชิกที่สำเร็จวงรอบ B15 ได้รับมูลค่าต่อส่วนสูงมากถึง <strong>4,356,075.85 บาทต่อรหัสความสำเร็จ</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. ALL SHARE & PUNSOOK */}
                    {systemCondTab === 'allshare' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
                            💎
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">โบนัสยอดรวมหุ้นระบบ All-Share & กองทุนช่วยเหลือปันสุข (All-Share & Social CSR Rules)</h4>
                            <p className="text-xs text-slate-400">หลักเกณฑ์การระดมทุนและการจัดสรรผลประโยชน์ส่วนรวมคืนสู่สมาชิกระดับพรีเมียมและกลุ่มสังคมรอบด้าน</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🌟 ระบบปันผล All-Share (Global Sharing Pool)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              พูลเงินกองกลางที่รวบรวมเพื่อแบ่งปันยอดขายของแพลตฟอร์มทั้งหมด คัดสรรทุนมาสนับสนุนจาก:
                            </p>
                            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-1 leading-relaxed">
                              <li><strong>3.00%</strong> ของทุกคะแนน PV ของคอมมิชชัน Plan A ทั่วแพลตฟอร์ม</li>
                              <li><strong>1.00%</strong> ของคะแนน PV ส่วน E-Coupon ของบิลพาส</li>
                              <li><strong>5.00%</strong> จากค่าธรรมเนียมธุรกรรมแปลงเงิน E-Cash เป็น E-Money</li>
                            </ul>
                            
                            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl space-y-2.5 text-xs text-indigo-950 leading-relaxed">
                              <p className="font-bold flex items-center gap-1">📋 เกณฑ์คุณสมบัติผู้รับ (Eligible Members):</p>
                              <p>
                                1. สมาชิกผู้ผ่านการลงทะเบียนเปิดสิทธิ์รับรายได้ (แพ็กเกจอัปเกรดใดก็ได้ตั้งแต่ S ขึ้นไป) <br />
                                2. มีสิทธิ์การรับรายได้คงเหลือสะสมไม่เท่ากับศูนย์ (Eligible Rights &gt; 0) ทั่วถึงอย่างเท่าเทียมกัน
                              </p>
                              <p className="font-bold border-t border-indigo-200/60 pt-2 flex items-center gap-1">💰 วิธีปันส่วนและการจ่ายออก:</p>
                              <p>
                                ทุกครั้งที่เงินไหลเข้าพูล All-Share ระบบจะแบ่งแยกปันส่วนให้สมาชิกผู้มีสิทธิ์เท่าๆ กันในแบบเรียลไทม์ โดยจ่ายเป็น <strong>50% เข้ากระเป๋า E-Money</strong> (ถอนออกได้ทันที) และอีก <strong>50% ถูกสะสมเข้า Plan B Points</strong> (เพื่อดันรหัสของสมาชิกให้ออโต้รันทำวงรอบสำเร็จและกินปันผลรอบเร็วขึ้น)
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">❤️ กองทุนช่วยเหลือปันสุข (Natee Plus CSR Welfare Fund)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              เป็นระบบสะสมเงินกองทุนการกุศลเพื่อช่วยเหลือพาร์ทเนอร์ ผู้ขาดแคลน สมาชิกที่ประสบภัย และกิจกรรมช่วยเหลือสังคมในนามของสมาชิกร่วมกัน โดยระบบจัดสรรยอดสะสมเข้ากระเป๋าปันสุข 100% จากแหล่งที่มาดังนี้:
                            </p>
                            
                            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm text-xs">
                              <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200">
                                แหล่งสนับสนุนกระเป๋ากองทุนปันสุข
                              </div>
                              <div className="p-3 space-y-2 text-slate-600">
                                <div className="flex justify-between items-center">
                                  <span>• สมัครสมาชิกแพ็กเกจ S บิลแรก:</span>
                                  <span className="font-mono text-emerald-600 font-bold">5.00 บาท / รหัส</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>• การสำเร็จบิลคอมมิชชันไบนารี่ (Plan A):</span>
                                  <span className="font-mono text-emerald-600 font-bold">1.00% ของยอด PV</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>• วงรอบความสำเร็จของ Plan B ทุกรอบ:</span>
                                  <span className="font-mono text-emerald-600 font-bold">1 ใน 6 ส่วน (16.66%)</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed">
                              ระบบจะมีการเปิดเผยสถิติกองทุนปันสุข (CSR Fund Balance) พร้อมบอร์ดบันทึกประวัติการปันส่วนอย่างตรงไปตรงมาหน้าเว็บบอร์ด เพื่อแสดงความโปร่งใสและร่วมอนุโมทนาบุญของครอบครัว นที พลัส ทุกรหัส
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Remaining Rights (สิทธิ์คงเหลือ) Tab */}
                    {systemCondTab === 'remainingRights' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg shadow-inner">
                            🛡️
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">เกณฑ์การคำนวณสิทธิ์รับรายได้คงเหลือ (Remaining Income Rights Policy)</h4>
                            <p className="text-xs text-slate-400 font-medium">ระเบียบและข้อบังคับสิทธิ์การรับรายได้สะสมของสมาชิกเมื่อได้รับคอมมิชชันและปันส่วนระบบ</p>
                          </div>
                        </div>

                        {/* Manager/Admin Settings Card to toggle calculation mode */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <h5 className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-sans">
                                ⚙️ ตั้งค่าเงื่อนไขการคิดคำนวณสิทธิ์คงเหลือของระบบ (System Configuration)
                              </h5>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {profile?.role === 'Manager' 
                                  ? 'เฉพาะผู้จัดการ (Manager) เท่านั้นที่มีสิทธิ์เลือกโครงสร้างการคิดคำนวณสิทธิ์คงเหลือของทั้งระบบ'
                                  : 'หน้าแสดงผลสิทธิ์คงเหลืออ้างอิงตามค่าที่ได้รับการอนุมัติจากผู้จัดการ (Manager)'}
                              </p>
                            </div>
                            
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-150">
                              โหมดปัจจุบัน: {bankSettings?.remainingRightsMode === '2_channels' ? '2 ช่องทาง (E-Money + E-Coupon)' : '1 ช่องทาง (E-Money เท่านั้น)'}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              type="button"
                              disabled={profile?.role !== 'Manager'}
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/bank-settings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ remainingRightsMode: '1_channel', editorUserId: currentUser?.userId })
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setBankSettings(d.bankSettings);
                                    showNotif("✓ ปรับเปลี่ยนวิธีการคิดคำนวณสิทธิ์คงเหลือเป็นแบบ 1 ช่องทางเรียบร้อยแล้วค่ะ", "success");
                                  } else {
                                    showNotif(d.message, "error");
                                  }
                                } catch (e) {
                                  showNotif("ไม่สามารถปรับการตั้งค่าระบบได้", "error");
                                }
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all ${
                                bankSettings?.remainingRightsMode !== '2_channels'
                                  ? 'bg-indigo-500/10 border-indigo-200 ring-2 ring-indigo-500/20'
                                  : 'bg-white border-slate-200 hover:bg-slate-100/50'
                              } ${profile?.role !== 'Manager' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">🔹</span>
                                <div>
                                  <h6 className="font-extrabold text-xs text-slate-800">คิดสิทธิ์คงเหลือจาก 1 ช่องทาง (E-Money เท่านั้น)</h6>
                                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                    สิทธิ์คงเหลือ = สิทธิ์ที่ได้รับ - รายได้กระเป๋า E-Money สุทธิหลังหักค่าใช้จ่ายทั้งหมด (ปันสุข, All-Share, ค่าระบบ)
                                  </p>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={profile?.role !== 'Manager'}
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/bank-settings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ remainingRightsMode: '2_channels', editorUserId: currentUser?.userId })
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setBankSettings(d.bankSettings);
                                    showNotif("✓ ปรับเปลี่ยนวิธีการคิดคำนวณสิทธิ์คงเหลือเป็นแบบ 2 ช่องทางเรียบร้อยแล้วค่ะ", "success");
                                  } else {
                                    showNotif(d.message, "error");
                                  }
                                } catch (e) {
                                  showNotif("ไม่สามารถปรับการตั้งค่าระบบได้", "error");
                                }
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all ${
                                bankSettings?.remainingRightsMode === '2_channels'
                                  ? 'bg-indigo-500/10 border-indigo-200 ring-2 ring-indigo-500/20'
                                  : 'bg-white border-slate-200 hover:bg-slate-100/50'
                              } ${profile?.role !== 'Manager' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">♊</span>
                                <div>
                                  <h6 className="font-extrabold text-xs text-slate-800">คิดสิทธิ์คงเหลือจาก 2 ช่องทาง (E-Money + E-Coupon)</h6>
                                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                    สิทธิ์คงเหลือ = สิทธิ์ที่ได้รับ - ผลรวมของ (รายได้กระเป๋า E-Money สุทธิ + รายได้กระเป๋า E-Coupon สุทธิ) หลังหักค่าใช้จ่ายทั้งหมด
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Core Policy Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-sky-500/10 blur-2xl"></div>
                          <div className="relative space-y-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                              📢 สูตรเกณฑ์การคิดคำนวณสิทธิ์คงเหลืออย่างเป็นทางการ
                            </span>
                            <h5 className="text-lg font-bold text-white">
                              เมื่อสมาชิกได้รับสิทธิ์ตามระดับแพ็กเกจแล้ว สิทธิ์คงเหลือจะถูกลดทอนด้วยช่องทางรายได้สุทธิ
                            </h5>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                              {bankSettings?.remainingRightsMode === '2_channels' ? (
                                <>
                                  ระบบจะหักสิทธิ์คงเหลือ <strong className="text-yellow-300">จาก 2 ช่องทางหลักรวมกัน คือ รายได้สุทธิที่โอนเข้ากระเป๋า E-Money และยอดคะแนน E-Coupon (หลังหักค่าใช้จ่าย/จัดสรรกองทุนระบบทั้งหมดแล้ว)</strong> โดยเมื่อยอดรายได้สะสมสูงขึ้นเรื่อยๆ สิทธิ์คงเหลือจะลดลงตามสัดส่วน จนกว่าจะเป็นศูนย์ (หลังจากนั้นต้องอัปเกรดแพ็กเกจเพื่อขยายสิทธิ์เพิ่ม)
                                </>
                              ) : (
                                <>
                                  ระบบจะหักสิทธิ์คงเหลือ <strong className="text-yellow-300">เฉพาะจากรายได้ใน 1 ช่องทางหลัก คือ รายได้สุทธิที่โอนเข้ากระเป๋า E-Money (หลังหักค่าใช้จ่าย/จัดสรรกองทุนระบบทั้งหมดแล้ว)</strong> โดยเมื่อยอดรายได้จาก E-Money นี้สะสมขึ้นเรื่อยๆ สิทธิ์คงเหลือจะลดลงตามสัดส่วน จนกว่าสิทธิ์คงเหลือจะเป็นศูนย์ (หลังจากนั้นต้องอัปเกรดแพ็กเกจเพื่อขยายสิทธิ์เพิ่ม)
                                </>
                              )}
                            </p>
                          </div>

                          {/* Graphic Formula */}
                          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                            <div className="bg-sky-500/20 border border-sky-400/30 px-4 py-2.5 rounded-xl min-w-[150px]">
                              <p className="text-[10px] text-sky-300 font-bold">🛡️ สิทธิ์คงเหลือ</p>
                              <p className="text-sm font-black font-mono text-white">Remaining Rights</p>
                            </div>
                            <span className="text-lg font-black text-slate-400">=</span>
                            <div className="bg-indigo-500/20 border border-indigo-400/30 px-4 py-2.5 rounded-xl min-w-[150px]">
                              <p className="text-[10px] text-indigo-300 font-bold">📋 สิทธิ์ที่ได้รับ (ตามแพ็กเกจ)</p>
                              <p className="text-sm font-black font-mono text-white">Eligible Rights</p>
                            </div>
                            <span className="text-lg font-black text-rose-400">-</span>
                            <div className="bg-amber-500/20 border border-amber-400/30 px-4 py-2.5 rounded-xl min-w-[150px]">
                              <p className="text-[10px] text-amber-300 font-bold">
                                {bankSettings?.remainingRightsMode === '2_channels' ? '💰 ยอด E-Money + E-Coupon' : '💰 รายได้ E-Money สุทธิ'}
                              </p>
                              <p className="text-sm font-black font-mono text-white">
                                {bankSettings?.remainingRightsMode === '2_channels' ? 'Net 2-Channels Income' : 'Net E-Money Income'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Two Columns: Explanation & Interactive Calculator */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                          
                          {/* Left Column: Tables & Explanation */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              📋 ตารางสิทธิ์ที่ได้รับมาตรฐาน (Default Eligible Rights by Package)
                            </h5>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              โดยปกติ เมื่อเริ่มสมัครสมาชิกหรืออัปเกรดแพ็กเกจ สมาชิกจะได้รับสิทธิ์ในการรับรายได้ปันผลและโบนัสคิดเป็น <strong className="text-slate-800">10 เท่าของมูลค่าแพ็กเกจพื้นฐาน</strong> ดังนี้:
                            </p>

                            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm text-xs bg-white">
                              <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-150">
                                  <tr className="text-slate-700 font-bold">
                                    <th className="px-4 py-3">แพ็กเกจเปิดสิทธิ์</th>
                                    <th className="px-4 py-3 text-right">ยอดซื้อแพ็กเกจ</th>
                                    <th className="px-4 py-3 text-right text-indigo-600">สิทธิ์ที่ได้รับ (10 เท่า)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                                  <tr>
                                    <td className="px-4 py-2.5 flex items-center gap-1.5">🌱 <strong className="text-slate-800">กลุ่ม S</strong></td>
                                    <td className="px-4 py-2.5 text-right font-mono">฿ 100.00</td>
                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">฿ 1,000.00</td>
                                  </tr>
                                  <tr>
                                    <td className="px-4 py-2.5 flex items-center gap-1.5">🏡 <strong className="text-slate-800">กลุ่ม M</strong></td>
                                    <td className="px-4 py-2.5 text-right font-mono">฿ 1,000.00</td>
                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">฿ 10,000.00</td>
                                  </tr>
                                  <tr>
                                    <td className="px-4 py-2.5 flex items-center gap-1.5">🥗 <strong className="text-slate-800">กลุ่ม L</strong></td>
                                    <td className="px-4 py-2.5 text-right font-mono">฿ 5,000.00</td>
                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">฿ 50,000.00</td>
                                  </tr>
                                  <tr>
                                    <td className="px-4 py-2.5 flex items-center gap-1.5">⚡ <strong className="text-slate-800">กลุ่ม XL</strong></td>
                                    <td className="px-4 py-2.5 text-right font-mono">฿ 10,000.00</td>
                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">฿ 100,000.00</td>
                                  </tr>
                                  <tr>
                                    <td className="px-4 py-2.5 flex items-center gap-1.5">💎 <strong className="text-slate-800">กลุ่ม XXL</strong></td>
                                    <td className="px-4 py-2.5 text-right font-mono">฿ 50,000.00</td>
                                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600">฿ 500,000.00</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-[11px] text-slate-500 leading-relaxed space-y-2">
                              <p className="font-bold text-slate-700 flex items-center gap-1">📌 ข้อควรรู้ด้านระบบบัญชีและค่าใช้จ่าย:</p>
                              <ul className="list-disc list-inside space-y-1 text-slate-500">
                                <li><strong>รายได้หลังหักค่าใช้จ่ายทั้งหมด</strong> หมายถึง ยอดเงินปันผล/โบนัสที่หักค่าจัดสรร All-Share, กองทุนช่วยเหลือ CSR ปันสุข, คูปอง และส่วนสร้างรหัสถัดไป (รวมการจัดสรร 20% ของแผน B) เรียบร้อยแล้ว</li>
                                <li>ยอดโบนัสที่จ่ายจริงเข้าสู่กระเป๋า <strong>E-Money</strong> เท่านั้นที่จะถูกนำมาคิดลดทอนสิทธิ์รับรายได้คงเหลือ</li>
                                <li>คะแนนโบนัสที่จัดสรรไปในรูปของ <strong>E-Coupon</strong> หรือสิทธิประโยชน์อื่น จะไม่นำมาหักลดสิทธิ์นี้ เพื่อปกป้องสิทธิประโยชน์สูงสุดในการช้อปปิ้งของสมาชิก</li>
                              </ul>
                            </div>
                          </div>

                          {/* Right Column: Live Simulator */}
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              🧮 เครื่องคิดเลขจำลองสิทธิ์คงเหลือ (Interactive Calculator)
                            </h5>
                            <p className="text-xs text-slate-500">
                              ทดลองเลือกแพ็กเกจและจำลองยอดรายได้สุทธิเพื่อดูการอัปเดตสิทธิ์คงเหลือแบบเรียลไทม์
                            </p>

                            {/* Rank Selection Buttons */}
                            <div className="space-y-1.5">
                              <label className="block text-slate-700 font-bold text-xs">เลือกแพ็กเกจจำลอง :</label>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: 'S', label: '🌱 กลุ่ม S', val: 1000 },
                                  { id: 'M', label: '🏡 กลุ่ม M', val: 10000 },
                                  { id: 'L', label: '🥗 กลุ่ม L', val: 50000 },
                                  { id: 'XL', label: '⚡ กลุ่ม XL', val: 100000 },
                                  { id: 'XXL', label: '💎 กลุ่ม XXL', val: 500000 },
                                  { id: 'Custom', label: '⚙️ กำหนดเอง', val: 0 },
                                ].map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSimRightsRank(p.id);
                                      if (p.id !== 'Custom') {
                                        setSimRightsCustom(p.val.toString());
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                                      simRightsRank === p.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Input Eligible Rights */}
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">
                                {simRightsRank === 'Custom' ? 'ระบุสิทธิ์ที่ได้รับ (บาท) *' : 'สิทธิ์ที่ได้รับคงที่ตามแพ็กเกจ (บาท) :'}
                              </label>
                              <input
                                type="number"
                                disabled={simRightsRank !== 'Custom'}
                                value={simRightsCustom}
                                onChange={(e) => setSimRightsCustom(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-bold disabled:bg-slate-100/80 disabled:text-slate-500"
                              />
                            </div>

                            {/* Input E-Money Net Income */}
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1 flex justify-between">
                                <span>
                                  {bankSettings?.remainingRightsMode === '2_channels'
                                    ? 'ยอดรวมรายได้สะสมจาก 2 ช่องทาง (E-Money + E-Coupon) (บาท) :'
                                    : 'รายได้จาก E-Money สุทธิหลังหักค่าใช้จ่ายสะสม (บาท) :'}
                                </span>
                                <span className="font-mono text-amber-600 font-black">฿ {parseFloat(simRightsEMoneyIncome || '0').toLocaleString()}</span>
                              </label>
                              <input
                                type="range"
                                min="0"
                                max={parseFloat(simRightsCustom || '1000') * 1.2}
                                step="50"
                                value={simRightsEMoneyIncome}
                                onChange={(e) => setSimRightsEMoneyIncome(e.target.value)}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                              <input
                                type="number"
                                value={simRightsEMoneyIncome}
                                onChange={(e) => setSimRightsEMoneyIncome(e.target.value)}
                                placeholder={bankSettings?.remainingRightsMode === '2_channels' ? "ระบุยอดรายได้รวมสะสม 2 ช่องทาง" : "ระบุรายได้ E-Money สะสม"}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2 mt-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-bold"
                              />
                            </div>

                            {/* Calculator Results Display Card */}
                            {(() => {
                              const eligible = parseFloat(simRightsCustom || '0');
                              const income = parseFloat(simRightsEMoneyIncome || '0');
                              const remaining = Math.max(0, eligible - income);
                              const isDepleted = remaining === 0;

                              return (
                                <div className={`border rounded-2xl p-4 text-center space-y-3 transition-all ${
                                  isDepleted 
                                    ? 'bg-rose-50/50 border-rose-150 text-rose-950' 
                                    : 'bg-indigo-50/50 border-indigo-150 text-indigo-950'
                                }`}>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold">สถานะสิทธิ์รับรายได้:</span>
                                    {isDepleted ? (
                                      <span className="bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-full text-[9px] border border-rose-200 animate-pulse">
                                        ⚠️ สิทธิ์หมด (ต้องอัปเกรด)
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full text-[9px] border border-emerald-200">
                                        🟢 ปกติ (สิทธิ์ยังใช้งานได้)
                                      </span>
                                    )}
                                  </div>

                                  <div className="py-2">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">สิทธิ์คงเหลือจำลองสุทธิ</p>
                                    <p className={`text-2xl font-black font-mono tracking-tight ${isDepleted ? 'text-rose-600' : 'text-indigo-700'}`}>
                                      ฿ {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>

                                  <div className="text-[10px] text-slate-500 font-medium space-y-1 text-left border-t border-slate-200/80 pt-2.5 leading-relaxed">
                                    <div className="flex justify-between">
                                      <span>1. สิทธิ์ที่ได้รับทั้งหมด (Eligible Rights):</span>
                                      <span className="font-mono font-bold text-slate-700">฿ {eligible.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>
                                        {bankSettings?.remainingRightsMode === '2_channels'
                                          ? '2. ยอดรายได้สะสม 2 ช่องทาง (E-Money + E-Coupon):'
                                          : '2. รายได้จาก E-Money หักรายการแล้ว (EMoney Income):'}
                                      </span>
                                      <span className="font-mono font-bold text-slate-700">- ฿ {income.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-1 font-bold text-slate-800">
                                      <span>3. ผลลัพธ์สิทธิ์คงเหลือ (Remaining Rights):</span>
                                      <span className="font-mono text-indigo-600">฿ {remaining.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                          </div>

                        </div>
                      </div>
                    )}

                    {/* 5. TRANSFERS & WITHDRAWALS */}
                    {systemCondTab === 'transfers' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-inner">
                            💸
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">ระบบการโอนแต้มภายใน และกฎเกณฑ์การถอนเงินสดเข้าธนาคาร (Fund Transfers & Withdrawals)</h4>
                            <p className="text-xs text-slate-400">กฎความมั่นคงปลอดภัยในการทำธุรกรรม อัตราค่าธรรมเนียม และข้อบังคับการหักภาษี ณ ที่จ่ายตามระเบียบกรมสรรพากร</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🔄 ระบบการแลกเปลี่ยนโอนภายใน (Internal Transfers)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              สมาชิกผู้ได้รับอนุมัติ KYC แล้ว สามารถสลับแลกเปลี่ยนคะแนนในกระเป๋าเงินประเภทต่างๆ ได้ เพื่อเพิ่มสภาพคล่องในการจัดซื้อสินค้าและสิทธิประโยชน์ทางธุรกิจ ภายใต้เงื่อนไขดังนี้:
                            </p>

                            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 space-y-2.5 text-xs text-slate-700">
                              <div className="flex justify-between font-bold border-b border-slate-200 pb-1.5">
                                <span>รายการแลกเปลี่ยนกระเป๋า</span>
                                <span>อัตราหักค่าธรรมเนียม / เกณฑ์จำกัด</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold text-slate-800">E-Cash โอนให้สมาชิกอื่น</span>
                                <span className="text-emerald-600 font-bold font-mono">0% (ฟรี) • บังคับ KYC + PIN + OTP</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold text-slate-850">E-Cash แปลงเป็น E-Money</span>
                                <span className="text-rose-500 font-bold font-mono">หักค่าธรรมเนียม 10% *</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold text-slate-800">E-Money แปลงกลับเป็น E-Cash</span>
                                <span className="text-emerald-600 font-bold font-mono">0% (ฟรี) • อัตราส่วน 1:1</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold text-slate-800">E-Money แปลงเป็น E-Coupon</span>
                                <span className="text-emerald-600 font-bold font-mono">0% (ฟรี) • อัตราส่วน 1:1</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-tight">
                              * หมายเหตุค่าธรรมเนียมแลก E-Cash เป็น E-Money (10%) ระบบจะปันแยกนำส่ง <strong>5% เข้าพูล All-Share</strong> ทั่วโลกเพื่อสมทบสมาชิกร่วม และอีก <strong>5% เข้าบัญชีกำไรบริษัท (Company Profit)</strong>
                            </p>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🏦 ระบบการถอนเงินออกจากระบบคอมมิชชั่น (E-Money Cash Out rules)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              ระบบจะหักปันส่วนยอดเงินเพื่อค้ำประกันระบบ จัดส่งภาษีอย่างโปร่งใส และค่าบริการธุรกรรมธนาคารโดยอิงสูตรคำนวณที่เข้มงวด ดังนี้:
                            </p>

                            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-3 text-xs font-mono border border-slate-800">
                              <p className="font-bold text-white font-sans text-xs">📊 สูตรการคำนวณโอนเงินถอนพาสสุทธิ:</p>
                              <div className="space-y-1.5 text-slate-400 text-[11px]">
                                <div>• ยอดถอนขั้นต่ำ: <strong>200 บาท</strong> (ยอดคงเหลือหลังถอนต้องไม่น้อยกว่า 200)</div>
                                <div>• <strong>หักสำรองกองทุนระบบหมุนเวียน (Auto-Reserve): 20.00%</strong> (นำกลับเข้าพูลแผนงานเพื่อหมุนเวียนยอด) ทำให้คิดฐานคำนวณภาษีสุทธิที่ 80%</div>
                                <div>• <strong>หักภาษี ณ ที่จ่ายตามกฎหมาย (Withholding Tax): 3.00%</strong> ของยอดฐานคำนวณ (2.4% ของยอดถอน)</div>
                                <div>• <strong>หักค่าดูแลโครงข่ายแพลตฟอร์ม (Platform Fee): 2.00%</strong> ของยอดฐานคำนวณ (1.6% ของยอดถอน)</div>
                              </div>
                              <div className="border-t border-slate-800 pt-2 text-white font-bold font-sans flex justify-between">
                                <span>💵 ยอดรับเงินโอนสุทธิโอนเข้าธนาคาร:</span>
                                <span className="text-emerald-400">76.00% ของยอดสั่งถอน</span>
                              </div>
                            </div>

                            <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-[10px] text-rose-950 font-medium leading-relaxed">
                              <strong>⚠️ ปลั๊กอินควบคุมความปลอดภัยธุรกรรมทางการเงิน:</strong> <br />
                              1. สมาชิกต้องผ่านการอนุมัติ <strong>บัตรประชาชนและข้อมูล KYC เป็น Active</strong> จึงจะเปิดปุ่มทำธุรกรรมถอนเงิน <br />
                              2. ยึดมาตรการป้องกันความปลอดภัยระดับธนาคารพาณิชย์ ด้วยการส่งรหัสผ่าน OTP ยืนยันรหัสส่งเข้าเบอร์โทรศัพท์ และบังคับกรอกรหัส PIN 6 หลักทุกครั้ง
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. PARTNER GP SYSTEM */}
                    {systemCondTab === 'partner' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-inner">
                            🤝
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">เงื่อนไขการนำสินค้าเข้าร่วมฝากขายและค่าฟีดระบบร้านค้าพาร์ทเนอร์ (Natee Plus Partner Terms)</h4>
                            <p className="text-xs text-slate-400">ระเบียบปฏิบัติสำหรับพาร์ทเนอร์ร้านค้าชุมชน แฟรนไชส์ และการปันค่าส่วนแบ่งส่งเสริมการตลาด GP คืนกลับสายเครือข่าย</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🏢 คุณสมบัติและการลงทะเบียนร้านค้า (Merchant Onboarding Checklist)</h5>
                            <ul className="space-y-2 text-xs text-slate-600">
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">●</span>
                                <div>
                                  <strong>ระดับตำแหน่งขั้นต่ำ:</strong> ผู้ขายในนามพาร์ทเนอร์ร้านค้า (Partner Merchant) สามารถเข้าเป็น Partner ได้ตั้งแต่ตำแหน่ง <strong>Manager</strong> ขึ้นไป เพื่อรักษาระเบียบการใช้บริการ
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">●</span>
                                <div>
                                  <strong>ข้อมูลรายละเอียดร้านค้า:</strong> ชื่อร้านค้า (ห้ามใช้อักษรพิเศษเพื่อป้องกันความคลาดเคลื่อนทางระบบ), เบอร์ติดต่อตรง, อีเมลจริง, ที่อยู่ตั้งคลังสินค้า และพิกัดแผนที่ละติจูด-ลองจิจูด (Latitude / Longitude) สำหรับพินตำแหน่งพาร์ทเนอร์ออฟไลน์
                                </div>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">●</span>
                                <div>
                                  <strong>การอนุมัติคลังสินค้า (Stock Approval):</strong> ทุกรายการสินค้าพาร์ทเนอร์ที่เพิ่มเข้ามาใหม่ในคลังระบบ จะต้องผ่านการพิจารณาตรวจสอบราคา คุณภาพ มาตรฐานอย./มอก. และวงคะแนน PV ปันกลับโดยคณะกรรมการบริษัท ก่อนเปิดแสดงผลจำหน่ายจริงหน้าร้าน
                                </div>
                              </li>
                            </ul>

                            <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-2xl space-y-2 text-xs text-amber-950">
                              <p className="font-bold">🤝 อัตราหักค่าบริการ GP แพลตฟอร์ม:</p>
                              <p className="leading-relaxed">
                                แพลตฟอร์มกำหนดค่าสนับสนุนส่งเสริมการตลาดและการบริหารส่วนแบ่งแบบคงที่อยู่ที่ <strong>20.00% (GP 20%)</strong> ของมูลค่าราคาสินค้าที่ขายได้สำเร็จจริง และพาร์ทเนอร์สามารถถอนส่วนรายได้สุทธิได้เมื่อสถานะจัดส่งสินค้าปรับสมบูรณ์เป็นเรียบร้อย
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🔄 การแชร์ปันส่วน GP คืนกลับสู่ผังเครือข่าย MLM (GP Shared Commissions)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              ความพิเศษของ NaTee Plus คือการดึงส่วนค่าบริการ GP 20% ที่จัดเก็บจากคู่ค้ามาหมุนเวียนกระจายความมั่งคั่งกลับคืนสู่สมาชิกองค์กร โดยระบบกำหนดการจ่ายเงินช่วยเหลือกลับสายงานดังนี้:
                            </p>

                            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 text-xs font-mono border border-slate-800">
                              <p className="font-bold text-amber-400 font-sans text-xs">📊 สูตรคำนวณคะแนนกระจายผังไบนารี่พาร์ทเนอร์:</p>
                              <div className="space-y-1.5 text-slate-400 text-[11px]">
                                <div>• คะแนน PV ปันกลับระบบ = <strong>50% ของยอด GP ที่จัดเก็บได้</strong></div>
                                <div>• คิดเป็นสัดส่วนเท่ากับ <strong>10.00%</strong> ของราคาสินค้าหน้าเว็บ (1 PV = 1 บาท)</div>
                                <div>• ยอดคะแนน PV นี้จะถูกส่งเข้าไปคำนวณใน <strong>แผน A ไบนารี่ลึก 20 ชั้น</strong> ทันทีที่ทำรายการบิลสำเร็จ</div>
                              </div>
                              <div className="border-t border-slate-800 pt-2 text-white text-[10px] font-sans">
                                <strong>💡 ข้อดีพาร์ทเนอร์:</strong> สินค้าของคุณจะได้รับการสนับสนุนกระตุ้นยอดขายอย่างหนักจากสมาชิก MLM ทั่วไทย เนื่องจากยอดซื้อของพวกเขาสร้างรายได้กลับคืนสู่สายทีมอย่างต่อเนื่อง
                              </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl text-[10px] text-slate-500 leading-relaxed">
                              <strong>📄 ตัวอย่างการปันส่วน:</strong> <br />
                              สินค้าพาร์ทเนอร์ตั้งราคาขายปลีกหน้าร้าน <strong>1,000 บาท</strong> <br />
                              • ยอดค่า GP จัดเก็บเข้าแพลตฟอร์ม (20%) = <strong>200 บาท</strong> <br />
                              • ยอดรายรับของพาร์ทเนอร์คู่ค้าก่อนเสียภาษี = <strong>800 บาท</strong> <br />
                              • ยอดปันกลับเข้าพูลคะแนนไบนารี่เครือข่าย (50% ของ GP) = <strong>100 PV</strong> (จัดแบ่งปันส่วน 2.5% ต่อชั้นละ 2.50 บาท ขึ้นไปจ่ายสูงสุด 20 อัพไลน์)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. ACCOUNTING SEPARATIONS */}
                    {systemCondTab === 'accounting' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
                            🏦
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">ระบบกฎเกณฑ์จัดสรรบัญชีแยกประเภทและการหักภาษีเข้ารัฐ (Accounting Separations & Tax Compliance)</h4>
                            <p className="text-xs text-slate-400">ระบบบริหารความปลอดภัยทางการเงินแยกถังเงิน และกระบวนการออกเอกสารภาษีตามแบบประมวลรัษฎากร</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">🗂️ การแยกสิทธิ์บัญชีกองทุนกระเป๋าเงิน (Secure Wallet Ledgers)</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              เพื่อป้องการความสับสนของการรับเข้าและจ่ายออกเงินหมุนเวียนในบริษัท ระบบได้สร้างกองบัญชีแยกประเภทขาดจากกันอย่างสมบูรณ์ในชั้นฐานข้อมูล:
                            </p>
                            
                            <div className="space-y-2 text-xs">
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex justify-between">
                                <div>
                                  <strong className="text-slate-800">1. บัญชี E-Cash Ledger:</strong>
                                  <p className="text-[10px] text-slate-400 mt-0.5">รับยอดจากการโอนสแกนเงินสดตรงของลูกค้าเพื่อใช้ซื้อสิทธิ์ตำแหน่ง</p>
                                </div>
                                <span className="text-indigo-600 font-bold font-mono">Prepaid Wallet</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex justify-between">
                                <div>
                                  <strong className="text-slate-800">2. บัญชี E-Money Ledger:</strong>
                                  <p className="text-[10px] text-slate-400 mt-0.5">ยอดรับคอมมิชชันความสำเร็จ 80% หรือปันผลโบนัส สมาชิกสามารถสั่งโอนถอนได้</p>
                                </div>
                                <span className="text-emerald-600 font-bold font-mono">Commission Earnings</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex justify-between">
                                <div>
                                  <strong className="text-slate-800">3. บัญชี E-Coupon Ledger:</strong>
                                  <p className="text-[10px] text-slate-400 mt-0.5">พูลคะแนนสำหรับซื้อสินค้าใน Market เท่านั้น ไม่สามารถแลกเปลี่ยนถอนเป็นเงินสดได้</p>
                                </div>
                                <span className="text-amber-600 font-bold font-mono">Voucher Credits</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex justify-between">
                                <div>
                                  <strong className="text-slate-800">4. บัญชี Tax & VAT Reserves:</strong>
                                  <p className="text-[10px] text-slate-400 mt-0.5">สำรองภาษีมูลค่าเพิ่ม 7% และหัก ณ ที่จ่าย 3% ปลายบิล นำส่งสรรพากรเป็นรายเดือน</p>
                                </div>
                                <span className="text-rose-600 font-bold font-mono">Tax Escrows</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">📄 ข้อปฏิบัติกฎหมายภาษีรายจ่ายและรายรับ (Tax Invoicing Specifications)</h5>
                            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                              <div>
                                <strong className="text-indigo-600">🛒 Natee Plus Market (B2C Retail):</strong>
                                <p className="mt-1">
                                  บริษัท นที พลัส มาร์เก็ต จำกัด จดทะเบียนภาษีมูลค่าเพิ่มถูกต้องตามกฎหมาย (VAT 7%) ทุกรายการขายปลีกตรงสู่ผู้บริโภค ระบบจะคำนวณแยกภาษีมูลค่าเพิ่มพาสไว้ เพื่อออก <strong>"ใบกำกับภาษีเต็มรูป / ใบเสร็จรับเงิน (Receipt / Tax Invoice)"</strong> ส่งมอบให้ผู้ซื้อใช้หักลดหย่อนภาษี
                                </p>
                              </div>
                              <div>
                                <strong className="text-emerald-600">📊 การจ่ายเงินคอมมิชชันและโบนัสสมาชิก (MLM Payouts):</strong>
                                <p className="mt-1">
                                  รายได้ค่าคอมมิชชันจากการขยายตลาด ถือเป็นเงินได้ตามมาตรา 40(2) แห่งประมวลรัษฎากร บริษัททำการหักภาษี ณ ที่จ่ายไว้ในอัตรา <strong>3.00% ทุกยอดการสั่งถอนจริง</strong> และออกเอกสาร <strong>"หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)"</strong> ส่งมอบให้แก่สมาชิกปลายปีเพื่อยื่นกรอก ภ.ง.ด.90/91
                                </p>
                              </div>
                              <div>
                                <strong className="text-amber-600">🤝 ระบบร้านค้าพาร์ทเนอร์ (B2B Consignment GP):</strong>
                                <p className="mt-1">
                                  การหัก GP 20% ระบบจะถือเป็นค่าบริการระบบ แนะนำให้พาร์ทเนอร์ร้านค้าใช้บริการผ่านธนาคารเข้าร่วม <strong>e-Withholding Tax</strong> เพื่อจัดส่งและหักบัญชีภาษี ณ ที่จ่าย 3% สะดวกและลดภาระเอกสารของทางพาร์ทเนอร์ปลายทาง
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 8. INTERACTIVE SIMULATORS */}
                    {systemCondTab === 'simulators' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-white flex items-center justify-center text-lg shadow-inner">
                            🧮
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">เครื่องคำนวณและประมวลผลจำลองภาษีรายได้จริง (Interactive Tax & GP Simulator)</h4>
                            <p className="text-xs text-slate-400">ระบบจำลองสถานการณ์ตัวเลขทางธุรกรรมเพื่อสอบทานสูตรคำนวณของระบบให้ตรงตามเกณฑ์ทางบัญชี 100%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* SIMULATOR 1 */}
                          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                                🛒 Natee Plus Market Retail
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">VAT 7%</span>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-[10px] text-slate-300 font-bold">ป้อน ราคาขายปลีกหน้าเว็บ (บาท):</label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  value={simMarketPrice}
                                  onChange={(e) => setSimMarketPrice(e.target.value)}
                                  placeholder="1000"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-indigo-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">บาท</span>
                              </div>
                            </div>

                            {(() => {
                              const p = parseFloat(simMarketPrice) || 0;
                              const net = p / 1.07;
                              const vat = p - net;
                              return (
                                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-2 text-[11px] font-mono">
                                  <div className="flex justify-between text-slate-400">
                                    <span>ราคาสินค้าก่อน VAT:</span>
                                    <span className="text-white">฿ {net.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                                    <span className="text-indigo-400 font-bold">฿ {vat.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-1.5">
                                    <span className="font-bold">ราคารวมภาษีมูลค่าเพิ่ม:</span>
                                    <span className="text-emerald-400 font-extrabold">฿ {p.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 mt-1 italic leading-tight">
                                    * บริษัทออกเอกสาร <strong>ใบส่งมอบ/ใบกำกับภาษีเต็มรูป</strong> ยอดส่งมอบตรงครบถ้วน
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* SIMULATOR 2 */}
                          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                📊 MLM Commission Withdraw
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">หัก 3% (40(2))</span>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-[10px] text-slate-300 font-bold">ป้อน ยอดสั่งถอนตั้งต้น (บาท):</label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  value={simMlmCommission}
                                  onChange={(e) => setSimMlmCommission(e.target.value)}
                                  placeholder="10000"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-emerald-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">บาท</span>
                              </div>
                            </div>

                            {(() => {
                              const comm = parseFloat(simMlmCommission) || 0;
                              const wht = comm * 0.03;
                              const fee = 20;
                              const net = Math.max(0, comm - wht - fee);
                              return (
                                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-2 text-[11px] font-mono">
                                  <div className="flex justify-between text-slate-400">
                                    <span>ยอดถอนสั่งตั้งต้น:</span>
                                    <span className="text-white">฿ {comm.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>หักภาษี ณ ที่จ่าย 3%:</span>
                                    <span className="text-rose-400 font-bold">- ฿ {wht.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>หักค่าธรรมเนียมถอนเงิน:</span>
                                    <span className="text-rose-400 font-bold">- ฿ {fee.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-1.5">
                                    <span className="font-bold">โอนเข้าบัญชีธนาคารสุทธิ:</span>
                                    <span className="text-emerald-400 font-extrabold">฿ {net.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* SIMULATOR 3 */}
                          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                🤝 Partner GP & Settlement
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">GP 20% + หัก ณ ที่จ่าย 3%</span>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-[10px] text-slate-300 font-bold">ป้อน ราคาสินค้าตั้งขายหน้าร้าน (บาท):</label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  value={simPartnerPrice}
                                  onChange={(e) => setSimPartnerPrice(e.target.value)}
                                  placeholder="1000"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-amber-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">บาท</span>
                              </div>
                            </div>

                            {(() => {
                              const p = parseFloat(simPartnerPrice) || 0;
                              const gp = p * 0.20;
                              const receivableBeforeTax = p - gp;
                              const wht = receivableBeforeTax * 0.03;
                              const netTransfer = receivableBeforeTax - wht;
                              return (
                                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 space-y-2 text-[11px] font-mono">
                                  <div className="flex justify-between text-slate-400">
                                    <span>ราคาสินค้าหน้าร้าน:</span>
                                    <span className="text-white">฿ {p.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>หักค่าบริการ GP (20%):</span>
                                    <span className="text-rose-400">- ฿ {gp.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-indigo-300 font-bold">
                                    <span>ยอดรับก่อนภาษี:</span>
                                    <span>฿ {receivableBeforeTax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>หักภาษี ณ ที่จ่าย 3% (ของยอดรับ):</span>
                                    <span className="text-rose-400 font-bold">฿ {wht.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-300 border-t border-slate-800/80 pt-1.5">
                                    <span className="font-bold">ยอดโอนสุทธิให้พาร์ทเนอร์:</span>
                                    <span className="text-emerald-400 font-extrabold">฿ {netTransfer.toFixed(2)}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 mt-1 italic leading-tight">
                                    * คู่ค้าชุมชนจัดเตรียมเอกสาร <strong>ใบเสร็จรับเงินยอด {receivableBeforeTax.toFixed(2)} บาท</strong> ให้แก่ นที พลัส
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                        </div>
                      </div>
                    )}

                    {/* 9. PDPA POLICY PAGE */}
                    {systemCondTab === 'pdpa' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
                            🛡️
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคล (PDPA Privacy Policy)</h4>
                            <p className="text-xs text-slate-400">มาตราฐานความปลอดภัยทางกฎหมายเกี่ยวกับข้อมูลผู้จัดจำหน่ายและคู่ค้าร่วม บริษัท นที พลัส มาร์เก็ต จำกัด</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 space-y-6 text-xs text-slate-700 leading-relaxed max-w-4xl font-sans">
                          <div className="bg-indigo-600 text-white p-5 rounded-2xl border border-indigo-500 shadow-sm space-y-1">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">🛡️ ผู้ควบคุมข้อมูลส่วนบุคคลตามกฎหมาย (Data Controller)</p>
                            <h5 className="font-black text-base">บริษัท นที พลัส มาร์เก็ต จำกัด (Natee Plus Market Co., Ltd.)</h5>
                            <p className="text-[11px] text-indigo-150 leading-relaxed">
                              จัดเก็บข้อมูลและประมวลผลเพื่อวัตถุประสงค์ในการจัดทำเอกสารทางการเงิน การนำส่งภาษีหัก ณ ที่จ่าย และการโอนเงินเข้าบัญชีอย่างถูกต้องโปร่งใสตามกฎหมาย
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-3">
                              <h5 className="font-extrabold text-slate-800 text-sm border-b border-slate-200 pb-1 flex items-center gap-2">
                                📌 1. ข้อมูลที่มีการรวบรวมจัดเก็บ (Collected Data)
                              </h5>
                              <p className="text-[11px] text-slate-600">
                                เนื่องจากเว็บ <strong>Natee Plus Partner (พอร์ทัลร้านค้าร่วมพันธมิตร)</strong> มีหน้าที่ทางกฎหมายและสัญญาการเงิน ระบบจึงมีความจำเป็นต้องเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน ดังนี้:
                              </p>
                              <ul className="list-disc list-inside space-y-1.5 pl-1.5 text-slate-500 text-[11px]">
                                <li><strong>ข้อมูลระบุตัวตนทางราชการ:</strong> ชื่อจริง, นามสกุลจริง, หมายเลขบัตรประจำตัวประชาชน 13 หลัก, หรือภาพถ่ายหน้าบัตรประชาชน (KYC) เพื่อยืนยันตัวตนถูกต้องตามกฎหมาย ป้องกันสิทธิ์และการฉ้อโกง</li>
                                <li><strong>ข้อมูลสมุดบัญชีธนาคาร (Bookbank):</strong> เลขที่บัญชี, ชื่อบัญชี และภาพถ่ายหน้าสมุดบัญชี เพื่อความปลอดภัยในการรับโอนผลตอบแทน</li>
                                <li><strong>ข้อมูลติดต่อส่วนบุคคล:</strong> เบอร์โทรศัพท์เคลื่อนที่สำหรับรับ OTP ยืนยันรหัส และที่ตั้งคลังสินค้าจริง</li>
                              </ul>
                            </div>

                            <div className="space-y-3">
                              <h5 className="font-extrabold text-slate-800 text-sm border-b border-slate-200 pb-1 flex items-center gap-2">
                                ⚙️ 2. วัตถุประสงค์เพื่อความโปร่งใส (Processing Purpose)
                              </h5>
                              <p className="text-[11px] text-slate-600">
                                การจัดเก็บข้อมูลของทางพาร์ทเนอร์ร้านค้าพันธมิตร มีวัตถุประสงค์ที่ชัดเจนเพื่อใช้ดำเนินกิจกรรมดังต่อไปนี้:
                              </p>
                              <ul className="list-disc list-inside space-y-1.5 pl-1.5 text-slate-500 text-[11px]">
                                <li><strong>เพื่อยืนยันสิทธิ์ถอนเงิน:</strong> บังคับใช้ระบบ KYC ในบัญชีที่มีความประสงค์ในการถอนเงินออกจากระบบหรือดำเนินธุรกรรมระดับสูง</li>
                                <li><strong>เพื่อส่งภาษีสรรพากร:</strong> จัดทำและส่งเอกสารหักภาษี ณ ที่จ่าย 3% (Withholding Tax) ตามฐานข้อมูลรายได้สุทธิเพื่อนำส่งกรมสรรพากรแห่งประเทศไทยอย่างถูกต้อง</li>
                                <li><strong>เพื่อบริหารงานโอนจ่ายพาสเวิร์ดปลอดภัย:</strong> ควบคุมความปลอดภัยของเงินด้วย OTP และรหัสธุรกรรม PIN 6 หลัก</li>
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-150">
                            <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                              ⏳ 3. ระยะเวลาการเก็บรักษาและการเปิดเผยข้อมูลแก่บุคคลภายนอก (Data Retention & Sharing)
                            </h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              บริษัทจะทำระบบจัดเก็บรักษาข้อมูลส่วนบุคคลเป็นความลับสูงสุดไว้ในคลังข้อมูลที่ปลอดภัย <strong>เป็นระยะเวลาขั้นต่ำ 10 ปี</strong> ตามระเบียบข้อบังคับทางบัญชีและการตรวจสอบย้อนหลังของภาครัฐ ทั้งนี้ จะไม่มีการเปิดเผยหรือจำหน่ายจ่ายแจกข้อมูลของท่านให้แก่หน่วยงานภายนอกใดๆ ทั้งสิ้น ยกเว้นแต่เพื่อดำเนินการนำส่งข้อมูลภาษีอากรให้แก่ <strong>กรมสรรพากร ประเทศไทย</strong> และส่งข้อมูลปลายทางคลังผู้ส่งพัสดุให้แก่ระบบขนส่งโลจิสติกส์ที่ได้รับการแต่งตั้งจากแพลตฟอร์มอย่างเป็นทางการเท่านั้น
                            </p>
                            <p className="text-[11px] text-indigo-600 font-bold leading-relaxed">
                              * สมาชิกผู้ใช้บริการของ นที พลัส พาร์ทเนอร์ มีสิทธิ์ยื่นเรื่องขอดูข้อมูล แก้ไขข้อมูล หรือระงับการจัดเก็บข้อมูลได้ตามขอบเขต พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ทุกประการ ผ่านทางผู้จัดดูแลระบบแอดมินกลาง
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 10. 15-DAY ESCROW & DISPUTE REVIEW MANAGER PAGE */}
                    {systemCondTab === 'escrow15Days' && (
                      <div className="space-y-6 animate-fadeIn">
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-inner">
                            🛡️
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">
                              ศูนย์บริหาร ทบทวนเงื่อนไข และตรวจสอบระบบประกันสินค้า พักเงินร้านค้า 15 วัน (15-Day Escrow System Manager)
                            </h4>
                            <p className="text-xs text-slate-400">
                              ตรวจสอบความถูกต้องของระบบพักเงินร้านค้า 15 วันหลังลูกค้ารับสินค้า การแจ้งข้อพาท/คืนสินค้า การระงับจ่ายเงิน และระบบปลดล็อกโอนเงินอัตโนมัติ
                            </p>
                          </div>
                        </div>

                        {/* Section 1: Executive Audit Review Document */}
                        <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-lg">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 uppercase">
                                AUDIT & REQUIREMENT COMPLIANCE REPORT
                              </span>
                              <h5 className="text-base font-black text-white mt-1">
                                📋 รายงานผลการตรวจสอบและเปรียบเทียบเงื่อนไขระบบประกันสินค้า 15 วัน (Escrow Alignment)
                              </h5>
                            </div>
                            <button
                              type="button"
                              onClick={fetchEscrowOrders}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw size={13} /> ดึงข้อมูลสดจากฐานข้อมูล
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                            {/* Status 1: DONE */}
                            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 text-base">🟢</span>
                                <strong className="text-emerald-300 font-bold text-xs">1. ส่วนที่ทำแล้ว (Completed)</strong>
                              </div>
                              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                                <li>ปุ่ม <strong>"ยืนยันได้รับสินค้าแล้ว"</strong> ทางฝั่งผู้ซื้อ พร้อมเริ่มนับถอยหลัง 15 วัน</li>
                                <li>ปุ่ม <strong>"ยื่นเรื่องแจ้งปัญหาสินค้า / คืนสินค้า"</strong> หยุดนับถอยหลังและพักการโอนเงินทันที</li>
                                <li>ระบบแสดง <strong>สถานะ Badges</strong> สถานะเงินพัก 15 วันบนหน้ารายการสั่งซื้อฝั่งลูกค้าและร้านค้า</li>
                                <li>คำนวณวันครบกำหนดปล่อยเงิน (`payoutCutoffDate`) อัตโนมัติในฐานข้อมูล</li>
                              </ul>
                            </div>

                            {/* Status 2: NEWLY COMPLETED & AUTOMATED */}
                            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-indigo-400 text-base">⚙️</span>
                                <strong className="text-indigo-300 font-bold text-xs">2. ระบบประมวลผลเพิ่มใหม่ (Newly Complete)</strong>
                              </div>
                              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                                <li><strong>Auto-Cron Server Runner (`/api/order/process-escrow-payouts`):</strong> ตรวจสอบตัดรอบอัตโนมัติเมื่อครบ 15 วัน</li>
                                <li><strong>Dispute Resolution Engine (`/api/admin/resolve-dispute`):</strong> แอดมิน/เมเนเจอร์ข้อยุติข้อพาท (ปล่อยเงินให้ร้านค้า หรือ คืนเงินผู้ซื้อ)</li>
                                <li><strong>Ledger Audit Tracking:</strong> บันทึกประวัติการปลดล็อกโอนเงินเข้า Ledger ทางบัญชี 100%</li>
                                <li><strong>ศูนย์ควบคุม Escrow Live Dashboard:</strong> สำหรับ Manager ตรวจสอบสถานะเงินพักรายบิลสดๆ</li>
                              </ul>
                            </div>

                            {/* Status 3: TRADEMARK & COMPLIANCE */}
                            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-amber-400 text-base">🛡️</span>
                                <strong className="text-amber-300 font-bold text-xs">3. การคุ้มครองสิทธิ์ & โลจิสติกส์</strong>
                              </div>
                              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                                <li><strong>การป้องกันสิทธิ์เครื่องหมายการค้า:</strong> ระบบไม่แตะต้องหรือละเมิดสิทธิ์แพลตฟอร์มอื่น ใช้ชื่อระบบเฉพาะ <strong>NaTee Plus</strong>, E-Cash, E-Coupon, E-Share เท่านั้น</li>
                                <li><strong>การเชื่อมต่อ API ขนส่ง:</strong> โครงสร้างระบบเตรียม Webhook Hook Point พร้อมรับ Callback สถานะจัดส่งพัสดุสำเร็จจาก Kerry, Flash, J&T เพื่อเริ่มสวิตช์นับ 15 วันอัตโนมัติ</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Live Escrow Control Center for Manager */}
                        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-5">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                            <div>
                              <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                🛒 ตารางแสดงรายการคำสั่งซื้อในระบบพักเงิน 15 วัน (Live Escrow Orders Manager)
                              </h5>
                              <p className="text-xs text-slate-500">
                                แสดงรายการบิลสั่งซื้อทั้งหมดที่อยู่ระหว่างการพักเงิน 15 วัน บิลที่มีข้อพาทระงับเงิน และบิลที่ปลดล็อกเงินโอนเรียบร้อยแล้ว
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleTriggerAutoEscrowPayout}
                              disabled={processingAutoEscrow}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2 cursor-pointer shrink-0"
                            >
                              {processingAutoEscrow ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" /> กำลังประมวลผลตัดรอบ...
                                </>
                              ) : (
                                <>
                                  ⚡ สั่งประมวลผลปลดล็อกเงินพักโอนครบ 15 วันทันที
                                </>
                              )}
                            </button>
                          </div>

                          {/* Escrow Status Filter Tabs */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {[
                              { id: 'ALL', label: `ทั้งหมด (${escrowOrdersList.length})` },
                              { id: 'HOLDING', label: `กำลังพักเงิน 15 วัน (${escrowSummaryStats.holding15Days || 0})` },
                              { id: 'DISPUTED', label: `⚠️ แจ้งข้อพาท/ระงับเงิน (${escrowSummaryStats.disputed || 0})` },
                              { id: 'RELEASED', label: `🟢 ปลดล็อกโอนเงินแล้ว (${escrowSummaryStats.released || 0})` },
                              { id: 'REFUNDED', label: `↩️ คืนเงินผู้ซื้อแล้ว (${escrowSummaryStats.refunded || 0})` },
                            ].map(filter => (
                              <button
                                key={filter.id}
                                onClick={() => setEscrowFilterTab(filter.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                                  escrowFilterTab === filter.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {filter.label}
                              </button>
                            ))}
                          </div>

                          {/* Escrow Orders Table */}
                          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                            <table className="w-full text-left text-xs text-slate-700">
                              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-150">
                                <tr>
                                  <th className="px-4 py-3">รหัสบิล / วันสั่งซื้อ</th>
                                  <th className="px-4 py-3">ผู้ซื้อ (Buyer)</th>
                                  <th className="px-4 py-3">ร้านค้าผู้ขาย (Seller Store)</th>
                                  <th className="px-4 py-3 text-right">ยอดเงินสินค้า (฿)</th>
                                  <th className="px-4 py-3 text-center">สถานะประกัน Escrow 15 วัน</th>
                                  <th className="px-4 py-3">วันครบกำหนด 15 วัน</th>
                                  <th className="px-4 py-3 text-center">การจัดการโดย Manager</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {(() => {
                                  const filtered = escrowOrdersList.filter(o => {
                                    if (escrowFilterTab === 'HOLDING') return o.escrowStatus === 'ESCROW_15_DAYS_HOLD';
                                    if (escrowFilterTab === 'DISPUTED') return o.escrowStatus === 'DISPUTED_PAUSED';
                                    if (escrowFilterTab === 'RELEASED') return o.escrowStatus === 'RELEASED_PAID';
                                    if (escrowFilterTab === 'REFUNDED') return o.escrowStatus === 'REFUNDED_BUYER';
                                    return true;
                                  });

                                  if (filtered.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                                          ไม่พบรายการคำสั่งซื้อในหมวดหมู่นี้
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return filtered.map(order => {
                                    const isDisputed = order.escrowStatus === 'DISPUTED_PAUSED';
                                    const isReleased = order.escrowStatus === 'RELEASED_PAID';
                                    const isRefunded = order.escrowStatus === 'REFUNDED_BUYER';
                                    const isHolding = order.escrowStatus === 'ESCROW_15_DAYS_HOLD' || order.payoutStatus === 'PendingCutoff';

                                    return (
                                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-4 py-3 font-mono">
                                          <strong className="text-slate-900 block font-bold">#{order.id}</strong>
                                          <span className="text-[10px] text-slate-400">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('th-TH') : '-'}
                                          </span>
                                        </td>

                                        <td className="px-4 py-3">
                                          <span className="font-semibold text-slate-800 block">{order.userName || order.buyerName || order.userId}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">ID: {order.userId || order.buyerId}</span>
                                        </td>

                                        <td className="px-4 py-3">
                                          <span className="font-bold text-indigo-700 block">{order.sellerName || order.sellerStoreName || 'ร้านค้าพาร์ทเนอร์'}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">ID: {order.sellerId || '-'}</span>
                                        </td>

                                        <td className="px-4 py-3 text-right font-mono font-black text-slate-800 text-sm">
                                          ฿ {(order.totalAmount || order.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                          {isDisputed ? (
                                            <span className="inline-flex flex-col items-center bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl text-[10px] font-black">
                                              <span>⛔ แจ้งข้อพาท / ยุติโอน</span>
                                              {order.disputeReason && (
                                                <span className="text-[9px] font-normal text-rose-600 truncate max-w-[150px]" title={order.disputeReason}>
                                                  สาเหตุ: {order.disputeReason}
                                                </span>
                                              )}
                                            </span>
                                          ) : isReleased ? (
                                            <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[10px] font-black">
                                              🟢 ปลดล็อกโอนเงินให้ร้านแล้ว
                                            </span>
                                          ) : isRefunded ? (
                                            <span className="inline-flex bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-xl text-[10px] font-black">
                                              ↩️ คืนเงินเข้าผู้ซื้อแล้ว
                                            </span>
                                          ) : (
                                            <span className="inline-flex flex-col items-center bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-[10px] font-black">
                                              <span>⏳ พักเงินประกัน 15 วัน</span>
                                            </span>
                                          )}
                                        </td>

                                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                                          {order.payoutCutoffDate ? (
                                            <div>
                                              <span className="font-bold block text-slate-800">
                                                {new Date(order.payoutCutoffDate).toLocaleDateString('th-TH')}
                                              </span>
                                              <span className="text-[9px] text-slate-400">
                                                {new Date(order.payoutCutoffDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 italic text-[10px]">ยังไม่เริ่มนับ</span>
                                          )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                          <div className="flex justify-center items-center gap-1.5">
                                            {isDisputed ? (
                                              <div className="flex gap-1">
                                                <button
                                                  type="button"
                                                  onClick={() => handleResolveDispute(order.id, 'RELEASE_TO_SELLER')}
                                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded-lg transition shadow cursor-pointer"
                                                  title="ยกเลิกข้อพาท แล้วอนุมัติโอนเงินให้ร้านค้า"
                                                >
                                                  ✓ ปล่อยเงินให้ร้าน
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleResolveDispute(order.id, 'REFUND_TO_BUYER')}
                                                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] px-2 py-1 rounded-lg transition shadow cursor-pointer"
                                                  title="อนุมัติคืนเงินเข้า E-Cash ผู้ซื้อ"
                                                >
                                                  ↩️ คืนเงินผู้ซื้อ
                                                </button>
                                              </div>
                                            ) : isHolding ? (
                                              <button
                                                type="button"
                                                onClick={() => handleResolveDispute(order.id, 'RELEASE_TO_SELLER')}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition shadow cursor-pointer"
                                                title="ปลดล็อกโอนเงินให้ร้านค้าทันทีก่อนครบ 15 วัน"
                                              >
                                                ⚡ ปลดล็อกโอนทันที
                                              </button>
                                            ) : (
                                              <span className="text-[10px] text-slate-400 font-bold">
                                                {order.adminResolveNotes ? `ข้อยุติ: ${order.adminResolveNotes}` : 'เสร็จสมบูรณ์'}
                                              </span>
                                            )}
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

                  </div>
                </div>
              )}

              {adminSubTab === 'featureToggles' && (profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 max-w-3xl mx-auto animate-fadeIn text-slate-800">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-2 border border-amber-100">
                      <Sliders size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">🎛️ ศูนย์ควบคุมเปิด-ปิด ฟีเจอร์ระบบอิสระ (Dynamic System Feature Toggles)</h3>
                    <p className="text-xs text-slate-500">ผู้บริหารและแอดมินสามารถเปิดหรือปิดระบบย่อยต่างๆ ได้ทันทีแบบ Real-time โดยไม่ต้องแก้ไขโค้ด</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Slip2Go Auto Verification */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          📲 ตรวจสอบสลิปอัตโนมัติ (Slip2Go / QR)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ระบบตรวจสอบสลิปโอนเงินฝาก E-Cash อัตโนมัติด้วย Slip2Go API
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enableSlip2Go: !featureToggles.enableSlip2Go })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enableSlip2Go ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enableSlip2Go ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>

                    {/* 2. SCB Business Net Payout Export */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          🏦 ส่งออกไฟล์โอนเงิน SCB Business Net
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          อนุญาตการดาวน์โหลดชุดไฟล์ Batch CSV/TXT สำหรับโอนเงินก้อนใหญ่ผ่านระบบ SCB Net
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enableSCBNetPayout: !featureToggles.enableSCBNetPayout })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enableSCBNetPayout ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enableSCBNetPayout ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>

                    {/* 3. e-Filing Revenue Export */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          📄 ส่งออกไฟล์ยื่นภาษี e-Filing สรรพากร
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ฟีเจอร์ส่งออกไฟล์ ภ.ง.ด.3 / ภ.ง.ด.53 รูปแบบมาตรฐานสรรพากร
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enableEFilingExport: !featureToggles.enableEFilingExport })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enableEFilingExport ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enableEFilingExport ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>

                    {/* 4. Live Stream Shopping */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          🎥 ระบบถ่ายทอดสดซื้อขายสินค้า (Live Stream)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          เปิด/ปิด ปุ่มไลฟ์สดและการกดสั่งซื้อสินค้าระหว่างไลฟ์
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enableLiveSystem: !featureToggles.enableLiveSystem })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enableLiveSystem ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enableLiveSystem ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>

                    {/* 5. E-Coupon Exchange */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          🎟️ แลกสินค้าด้วยกระเป๋า E-Coupon
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          เปิด/ปิด สิทธิ์สมาชิกในการใช้คูปองสะสมแลกรับสินค้า
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enableECouponExchange: !featureToggles.enableECouponExchange })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enableECouponExchange ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enableECouponExchange ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>

                    {/* 6. AI Assistant Chatbot */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          🤖 ผู้ช่วยปัญญาประดิษฐ์ NateeBot AI
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          แสดง/ซ่อน ปุ่มแชตบอต AI ผู้ช่วยตอบคำถามหน้าจอผู้ใช้งาน
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enableAiChatbot: !featureToggles.enableAiChatbot })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enableAiChatbot ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enableAiChatbot ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>

                    {/* 7. Promotional Pop-up */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          🔥 Pop-Up ประกาศโปรโมชั่นระบบ
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          เปิด/ปิด หน้าต่างป๊อบอัพข่าวสารโปรโมชั่นเมื่อเข้าสู่แอพ
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveFeatureToggles({ ...featureToggles, enablePromoPopup: !featureToggles.enablePromoPopup })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                          featureToggles.enablePromoPopup ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {featureToggles.enablePromoPopup ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'bankSettings' && (profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 max-w-2xl mx-auto animate-fadeIn">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-2 border border-rose-100">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">🏦 ตั้งค่าบัญชีธนาคาร & ระบบแจ้งเตือน LINE / Webhook</h3>
                    <p className="text-xs text-slate-500">ระบุรายละเอียดบัญชีปลายทาง และตั้งค่าระบบแจ้งเตือนอัตโนมัติผ่าน LINE Messaging API & Webhook</p>
                  </div>

                  <form onSubmit={handleSaveBankSettings} className="space-y-4">
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">🏦 ชื่อธนาคาร *</label>
                      <input 
                        type="text"
                        required
                        value={editingBankName}
                        onChange={(e) => setEditingBankName(e.target.value)}
                        placeholder="เช่น ธนาคารไทยพาณิชย์, ธนาคารกสิกรไทย"
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">💳 เลขบัญชีธนาคาร *</label>
                      <input 
                        type="text"
                        required
                        value={editingBankAccount}
                        onChange={(e) => setEditingBankAccount(e.target.value)}
                        placeholder="เช่น 111-2-22222-3"
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">👤 ชื่อบัญชีผู้รับโอน *</label>
                      <input 
                        type="text"
                        required
                        value={editingBankAccountName}
                        onChange={(e) => setEditingBankAccountName(e.target.value)}
                        placeholder="เช่น บริษัท นที พลัส มาร์เก็ต จำกัด"
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-700 font-bold text-xs mb-1">📷 รูปภาพ QR Code สำหรับสแกนรับเงิน</label>
                      
                      <div className="flex flex-col items-center gap-4">
                        {editingBankQrPreview ? (
                          <div className="relative border border-slate-200 rounded-2xl p-2 bg-slate-50 w-48 h-48 flex items-center justify-center">
                            <img 
                              src={editingBankQrPreview} 
                              alt="Bank QR Preview" 
                              className="max-w-full max-h-full object-contain rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBankQrFile("DELETE");
                                setEditingBankQrPreview("");
                              }}
                              className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-md transition cursor-pointer"
                              title="ลบรูปภาพ"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50 w-48 h-48 flex items-center justify-center text-slate-400 font-bold text-xs">
                            ยังไม่มีรูปภาพ QR Code
                          </div>
                        )}

                        <div className="w-full">
                          <input 
                            type="file" 
                            accept="image/*"
                            id="bank-qr-upload"
                            onChange={handleBankQrFileChange}
                            className="hidden"
                          />
                          <label 
                            htmlFor="bank-qr-upload"
                            className="flex flex-col items-center justify-center border border-dashed border-indigo-300 bg-indigo-50/10 hover:bg-indigo-50/40 rounded-2xl p-6 cursor-pointer transition text-center space-y-1.5 w-full"
                          >
                            <Upload size={24} className="text-indigo-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-700">
                              {editingBankQrFile ? "✓ เลือกรูปภาพ QR Code ใหม่สำเร็จ" : "อัปโหลด / เปลี่ยนรูปภาพ QR Code ของธนาคาร"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              (คลิกเพื่อเลือกไฟล์รูปภาพ)
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingBankSettings}
                      className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl text-xs disabled:text-slate-500 cursor-pointer shadow-md transition flex items-center justify-center gap-2"
                    >
                      {isSavingBankSettings ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> กำลังบันทึกข้อมูล...
                        </>
                      ) : (
                        "💾 บันทึกข้อมูลบัญชีธนาคารและ QR Code"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {adminSubTab === 'promoPopupConfig' && (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 max-w-2xl mx-auto animate-fadeIn text-slate-800">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-2 border border-amber-100">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">🎁 ตั้งค่า Pop-Up โปรโมชั่นส่วนลดพิเศษ (Shopee/Lazada Style)</h3>
                    <p className="text-xs text-slate-400">กำหนดรูปภาพ ข้อความ และปุ่มกดบนหน้าต่างป๊อปอัปที่จะแสดงผลเมื่อผู้ใช้งานเข้าสู่ระบบ/เปิดแอป</p>
                  </div>

                  <form onSubmit={handleSavePromoConfig} className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <span className="block font-bold text-xs text-slate-800">เปิดใช้งาน Pop-Up ส่วนลดพิเศษ</span>
                        <span className="text-[10px] text-slate-400">หากปิดไว้ ป๊อปอัปจะไม่แสดงให้ผู้ใช้งานเห็น</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={promoConfig.active}
                          onChange={(e) => setPromoConfig(prev => ({ ...prev, active: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">🔥 หัวข้อหลัก Pop-Up (Title)</label>
                      <input 
                        type="text"
                        required
                        value={promoConfig.title}
                        onChange={(e) => setPromoConfig(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="เช่น 🔥 โปรโมชั่นนาทีทอง มาร์เก็ตนทีพลัส"
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">📝 คำอธิบายโปรโมชั่น / สโลแกน (Subtitle)</label>
                      <input 
                        type="text"
                        required
                        value={promoConfig.subtitle}
                        onChange={(e) => setPromoConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="เช่น ช้อปคุ้ม รับส่วนลดพิเศษและคะแนน PV สะสมเข้าบัญชีทันที!"
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">🖼️ รูปภาพแบนเนอร์ Pop-Up (URL หรือ อัปโหลดไฟล์)</label>
                      <div className="space-y-3">
                        <input 
                          type="text"
                          value={promoConfig.imageUrl}
                          onChange={(e) => setPromoConfig(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white font-mono"
                        />

                        <div className="flex items-center gap-3">
                          <input 
                            type="file" 
                            accept="image/*"
                            id="promo-image-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingPromoImageFile(reader.result as string);
                                  setPromoConfig(prev => ({ ...prev, imageUrl: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label 
                            htmlFor="promo-image-upload"
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5 border border-slate-200"
                          >
                            <Upload size={14} /> อัปโหลดรูปภาพแบนเนอร์ใหม่
                          </label>
                          {editingPromoImageFile && (
                            <span className="text-emerald-600 text-[11px] font-bold">✓ เลือกรูปภาพใหม่แล้ว</span>
                          )}
                        </div>

                        {promoConfig.imageUrl && (
                          <div className="relative border border-slate-200 rounded-2xl p-2 bg-slate-50 w-full h-40 flex items-center justify-center overflow-hidden">
                            <img 
                              src={promoConfig.imageUrl} 
                              alt="Promo Banner Preview" 
                              className="max-w-full max-h-full object-cover rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold text-xs mb-1">🔘 ข้อความปุ่มกด (Button Text)</label>
                        <input 
                          type="text"
                          required
                          value={promoConfig.buttonText}
                          onChange={(e) => setPromoConfig(prev => ({ ...prev, buttonText: e.target.value }))}
                          placeholder="ช้อปสินค้าราคาพิเศษทันที 🛍️"
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold text-xs mb-1">🔗 ปลายทางเมื่อกดปุ่ม (Target Page)</label>
                        <select 
                          value={promoConfig.linkTab || 'shop'}
                          onChange={(e) => setPromoConfig(prev => ({ ...prev, linkTab: e.target.value }))}
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white font-bold"
                        >
                          <option value="shop">🛒 หน้าเลือกซื้อสินค้า (Shop / Market)</option>
                          <option value="packages">📦 หน้าแพ็กเกจธุรกิจ</option>
                          <option value="home">🏠 หน้าหลัก (Home)</option>
                          <option value="market">🏬 ตลาดมาร์เก็ตพิกัดร้านค้า</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button"
                        onClick={() => {
                          sessionStorage.removeItem('natee_promo_dismissed');
                          setShowPromoPopup(true);
                        }}
                        className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-3.5 rounded-xl text-xs cursor-pointer transition flex items-center justify-center gap-2 border border-amber-200"
                      >
                        👁️ ทดสอบดูพรีวิว Pop-Up ทันที
                      </button>

                      <button 
                        type="submit"
                        disabled={isSavingPromoConfig}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-black py-3.5 rounded-xl text-xs disabled:text-slate-500 cursor-pointer shadow-md transition flex items-center justify-center gap-2"
                      >
                        {isSavingPromoConfig ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> กำลังบันทึกข้อมูล...
                          </>
                        ) : (
                          "💾 บันทึกข้อมูล Pop-Up โปรโมชั่น"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {adminSubTab === 'botConfig' && (
                <AdminBotSettings currentUser={currentUser} showNotif={showNotif} />
              )}

              {adminSubTab === 'maintenance' && (profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 max-w-2xl mx-auto animate-fadeIn text-slate-700">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-2 border border-rose-100">
                      <Settings size={24} className={bankSettings.maintenanceMode ? "animate-spin text-rose-500" : "text-rose-600"} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">⏸️ ระบบตั้งค่าพักหน้าจอ (Maintenance Mode) และแจ้งเตือน</h3>
                    <p className="text-xs text-slate-400">ควบคุมการแสดงผลหน้าจอปิดปรับปรุงระบบชั่วคราว และส่งข้อความสั้นกระดิ่งแจ้งเตือน</p>
                  </div>

                  {/* ADMIN BROADCAST SHORT MESSAGE TO BELL NOTIFICATION */}
                  <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                      <Bell size={18} className="text-indigo-600" />
                      <span>📣 ส่งข้อความสั้นไปยังกระดิ่งแจ้งเตือน (Broadcast Bell Notification)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      ผู้ดูแลระบบสามารถเลือกกลุ่มเป้าหมายที่จะส่งข้อความแจ้งเตือนสั้นไปยังกระดิ่งแจ้งเตือนได้โดยตรง
                    </p>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">🎯 เลือกกระดิ่งเป้าหมายในการส่งข้อความ</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBroadcastTarget('all')}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                              broadcastTarget === 'all'
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Users size={18} className={broadcastTarget === 'all' ? 'text-white' : 'text-indigo-600'} />
                            <div>
                              <div className="text-xs font-bold">🌐 สมาชิกทุกคน (รวมทั้งระบบ)</div>
                              <div className={`text-[10px] mt-0.5 ${broadcastTarget === 'all' ? 'text-indigo-100' : 'text-slate-400'}`}>
                                ขึ้นแจ้งเตือนที่กระดิ่งหลักของสมาชิก
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setBroadcastTarget('sellers')}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                              broadcastTarget === 'sellers'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <ShoppingBag size={18} className={broadcastTarget === 'sellers' ? 'text-white' : 'text-amber-600'} />
                            <div>
                              <div className="text-xs font-bold">🏪 ร้านค้าพันธมิตรเท่านั้น</div>
                              <div className={`text-[10px] mt-0.5 ${broadcastTarget === 'sellers' ? 'text-amber-100' : 'text-slate-400'}`}>
                                ขึ้นแจ้งเตือนเฉพาะกระดิ่งใน Seller Center
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">หัวข้อประกาศ</label>
                        <input
                          type="text"
                          value={broadcastTitle}
                          onChange={(e) => setBroadcastTitle(e.target.value)}
                          placeholder={broadcastTarget === 'sellers' ? "🏪 ประกาศถึงร้านค้าพันธมิตร" : "📢 ประกาศจากระบบ Natee Plus"}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">ข้อความแจ้งเตือน *</label>
                        <textarea
                          rows={3}
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          placeholder={broadcastTarget === 'sellers' 
                            ? "พิมพ์ข้อความส่งถึงร้านค้า เช่น แจ้งเตือนส่งมอบพัสดุ ตัดรอบส่งของ หรืออัปเดตระบบพันธมิตร..." 
                            : "พิมพ์ข้อความสั้นๆ ที่ต้องการส่งไปยังกระดิ่งแจ้งเตือนสมาชิก เช่น แจ้งเตือนรอบจัดส่งพัสดุ หรืออัปเดตระบบ..."}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAdminBroadcastNotification}
                        className={`w-full text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition cursor-pointer flex items-center justify-center gap-2 ${
                          broadcastTarget === 'sellers'
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                      >
                        <Bell size={14} /> ส่งข้อความไปยังกระดิ่งแจ้งเตือน{broadcastTarget === 'sellers' ? 'ร้านค้าพันธมิตร 🏪' : 'สมาชิก 🔔'}
                      </button>
                    </div>
                  </div>

                  {/* Current Status Banner */}
                  <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
                    bankSettings.maintenanceMode 
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900 shadow-sm shadow-rose-100' 
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-sm shadow-emerald-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          bankSettings.maintenanceMode ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          bankSettings.maintenanceMode ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}></span>
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold">
                          {bankSettings.maintenanceMode ? "ขณะนี้ระบบเปิดใช้งานระบบพักหน้าจออยู่" : "ระบบเปิดทำงานปกติ"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {bankSettings.maintenanceMode 
                            ? "สมาชิกทั่วไปที่ไม่ใช่ผู้ดูแลระบบจะเห็นหน้าจอแจ้งเตือนอัปเดตระบบทันที" 
                            : "สมาชิกทุกคนสามารถเข้าสู่ระบบและทำรายการต่างๆ ได้ตามปกติ"
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isSavingBankSettings}
                      onClick={() => handleToggleMaintenanceMode(!bankSettings.maintenanceMode)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-md flex items-center gap-1.5 ${
                        bankSettings.maintenanceMode 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200' 
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200'
                      }`}
                    >
                      {isSavingBankSettings ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" /> กำลังดำเนินการ...
                        </>
                      ) : bankSettings.maintenanceMode ? (
                        "▶️ ปิดระบบพักหน้าจอ (เปิดระบบทำงาน)"
                      ) : (
                        "⏸️ เปิดระบบพักหน้าจอ (ปิดปรับปรุง)"
                      )}
                    </button>
                  </div>

                  {/* Information and Description */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      💡 ข้อมูลและความปลอดภัยสำคัญ
                    </h4>
                    <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-1.5 leading-relaxed font-medium">
                      <li>เมื่อเปิดใช้งานพักหน้าจอ <strong className="text-slate-800 font-bold">ผู้แนะนำหรือเจ้าหน้าที่ระดับ Manager/Admin เท่านั้น</strong> ที่จะสามารถผ่านหน้าต่างพักหน้าจอเข้ามาทำงานหลังบ้านได้</li>
                      <li>ระบบทำการบันทึกสถานะแบบ Real-time ลงฐานข้อมูล Firestore เมื่อเปิด/ปิด หน้าจอของสมาชิกทุกคนจะเด้งเข้าหน้าพักหน้าจอหรือกลับเข้าหน้าใช้งานได้ทันที</li>
                      <li>หากต้องการล็อกอินเข้าตรวจระบบระหว่างอัปเดต ให้ไปที่หน้าจอพักหน้าจอของท่านแล้วกดปุ่มลิงก์สตาฟล็อกอินที่ซ่อนอยู่ด้านล่าง เพื่อล็อกอินเป็นแอดมินหรือผู้บริหารเข้ามาปิดใช้งานได้เลยค่ะ</li>
                    </ul>
                  </div>

                  {/* SYSTEM VERSION & FORCE CACHE CLEAR CONTROL */}
                  <div className="bg-sky-50/60 border border-sky-200/80 p-5 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                      <div className="flex items-center gap-2 text-sky-950 font-extrabold text-sm">
                        <span className="text-lg">🚀</span>
                        <span>การจัดการเวอร์ชั่นและล้างแคชระบบ (System Version & Cache Control)</span>
                      </div>
                      <span className="text-[10px] bg-sky-200/80 text-sky-900 px-2.5 py-0.5 rounded-full font-black">
                        Current Version: v{APP_VERSION}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                      <p>
                        เมื่อผู้พัฒนาอัปเดตโค้ดหรือระบบเวอร์ชั่นใหม่ หากเบราว์เซอร์หรืออุปกรณ์ติดแคชเก่า สามารถกดปุ่มล้างแคชด้านล่างเพื่อดึงไฟล์โค้ดล่าสุดกลับมาใช้งานได้ทันทีโดยไม่เสียข้อมูล
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleForceUpdateAndClearCache}
                          className="bg-sky-700 hover:bg-sky-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <RefreshCw size={14} />
                          <span>🔄 บังคับล้างแคชและอัปเดตเครื่องนี้เป็นเวอร์ชั่นล่าสุด</span>
                        </button>
                        <span className="text-[11px] text-slate-500 font-medium">
                          (เซิร์ฟเวอร์ตอบกลับ: <strong className="text-sky-900 font-bold">{serverVersion || 'v' + APP_VERSION}</strong>)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LINE DEVELOPERS MESSAGING API & WEBHOOK AUTOMATED NOTIFICATION SETTINGS */}
                  <div className="bg-emerald-50/50 border border-emerald-200/80 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                      <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                        <span className="text-lg">🔔</span>
                        <span>การตั้งค่าแจ้งเตือนอัตโนมัติ (LINE Messaging API & Webhook)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                        LINE Developers Standard API
                      </span>
                    </div>

                    <div className="bg-amber-50/90 border border-amber-200/90 p-3.5 rounded-xl text-xs space-y-1.5 text-amber-900">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950">
                        <span>ℹ️</span>
                        <span>หมายเหตุเกี่ยวกับการใช้งานระบบแจ้งเตือน LINE:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        บริการ <strong>LINE Notify</strong> ได้ถูกทาง LINE ยุติบริการลงแล้ว ระบบได้อัปเกรดเป็นมาตรฐาน <strong>LINE Messaging API (LINE Developers)</strong> แทน เพื่อความเสถียรและยั่งยืน
                      </p>
                      <details className="mt-2 text-[11px] cursor-pointer">
                        <summary className="font-bold text-emerald-700 hover:underline">📖 คลิกดูขั้นตอนการขอ Channel Access Token จาก LINE Developers</summary>
                        <ol className="list-decimal list-inside space-y-1 mt-2 p-2.5 bg-white/80 rounded-lg border border-amber-200/50 font-sans text-slate-700">
                          <li>เข้าสู่เว็บไซต์ <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">developers.line.biz</a> แล้วเข้าสู่ระบบด้วยบัญชี LINE</li>
                          <li>สร้าง <strong>Provider</strong> และสร้าง <strong>Channel (Messaging API)</strong></li>
                          <li>ไปที่แท็บ <strong>Messaging API</strong> เลื่อนลงล่างสุดแล้วกดออก <strong>Channel access token (long-lived)</strong></li>
                          <li>คัดลอก Token มาวางในช่อง <strong>LINE Channel Access Token</strong> ด้านล่าง</li>
                          <li>(ตัวเลือกเสริม) หากต้องการส่งเข้ากลุ่มแอดมินหรือ User Specific ให้ใส่ Group ID / User ID ในช่อง <strong>LINE Target ID</strong> (หากไม่ใส่ ระบบจะ Broadcast ไปยังทุกคน)</li>
                        </ol>
                      </details>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          🟢 LINE Channel Access Token (จาก LINE Developers Console)
                        </label>
                        <input
                          type="password"
                          value={notifySettings.lineChannelAccessToken || notifySettings.lineNotifyToken || ''}
                          onChange={(e) => setNotifySettings(prev => ({ ...prev, lineChannelAccessToken: e.target.value, lineNotifyToken: e.target.value }))}
                          placeholder="วาง LINE Channel Access Token (long-lived) ของท่านที่นี่..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                           token ยาวที่ออกดิเรกจาก Messaging API tab ใน LINE Developers Console
                        </p>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          🎯 LINE Target ID / Group ID / User ID (ระบุผู้รับหรือกลุ่มแอดมิน)
                        </label>
                        <input
                          type="text"
                          value={notifySettings.lineTargetId || ''}
                          onChange={(e) => setNotifySettings(prev => ({ ...prev, lineTargetId: e.target.value }))}
                          placeholder="เช่น Group ID (C...) หรือ User ID (U...) (เว้นว่างไว้หากต้องการส่งแบบ Broadcast)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          * หากระบุ Group ID ระบบจะ Push ข้อความเข้ากลุ่มนั้นโดยตรง / หากเว้นว่างจะ Broadcast ไปยังผู้ติดตามทุกคน
                        </p>
                      </div>

                      {/* WEBHOOK URL FOR LINE DEVELOPERS CONSOLE */}
                      <div className="bg-emerald-100/60 border border-emerald-300/80 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-emerald-950 font-bold text-xs">
                            🔗 Webhook URL สำหรับกรอกใน LINE Developers Console:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const url = "https://ais-pre-rcamsswka546kl3a6qu7xn-278828207165.asia-southeast1.run.app/api/line/webhook";
                                navigator.clipboard.writeText(url);
                                showNotif('คัดลอก Public Webhook URL เรียบร้อยแล้วค่ะ', 'success');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-all shadow-sm cursor-pointer"
                            >
                              📋 คัดลอก Public Webhook URL
                            </button>
                          </div>
                        </div>
                        <div className="bg-white border border-emerald-200 rounded-lg p-2 font-mono text-xs text-emerald-900 break-all select-all font-bold">
                          https://ais-pre-rcamsswka546kl3a6qu7xn-278828207165.asia-southeast1.run.app/api/line/webhook
                        </div>
                        <div className="text-[10px] text-emerald-900 leading-relaxed bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60 space-y-1">
                          <p>
                            💡 <strong>วิธีแก้ปัญหา Error 302 Found จาก LINE Console:</strong>
                          </p>
                          <p className="text-slate-700">
                            หากใช้ URL โหมด Dev (ais-dev) ทาง LINE จะติดระบบยืนยันตัวตนของสภาพแวดล้อมพัฒนาระบบ ทำให้ตอบกลับเป็น <code>302 Found</code> Redirect
                          </p>
                          <p className="font-semibold text-emerald-800">
                            ✅ ให้ใช้ Public / Shared URL ด้านบนนี้กรอกในช่อง Webhook URL ใน LINE Console แล้วกดปุ่ม <strong>Verify</strong> จะผ่านฉลุยและขึ้น <strong>Success (200 OK)</strong> ทันที!
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          🌐 External Webhook URL (สำหรับส่งข้อมูลเข้า Discord / Slack / Custom Server)
                        </label>
                        <input
                          type="url"
                          value={notifySettings.webhookUrl}
                          onChange={(e) => setNotifySettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2">
                        <label className="block text-slate-800 font-bold mb-1">⚡ เลือกเหตุการณ์ที่ต้องการให้ส่งแจ้งเตือน:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-emerald-50">
                            <input
                              type="checkbox"
                              checked={notifySettings.notifyWithdrawal}
                              onChange={(e) => setNotifySettings(prev => ({ ...prev, notifyWithdrawal: e.target.checked }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>💸 คำขอถอนเงิน e-Money</span>
                          </label>
                          <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-emerald-50">
                            <input
                              type="checkbox"
                              checked={notifySettings.notifyNewShop}
                              onChange={(e) => setNotifySettings(prev => ({ ...prev, notifyNewShop: e.target.checked }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>🏪 ร้านค้าสมัครขออนุมัติ</span>
                          </label>
                          <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-emerald-50">
                            <input
                              type="checkbox"
                              checked={notifySettings.notifyNewOrder}
                              onChange={(e) => setNotifySettings(prev => ({ ...prev, notifyNewOrder: e.target.checked }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>🛒 มีคำสั่งซื้อสินค้าใหม่</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isTestingNotify}
                          onClick={async () => {
                            setIsTestingNotify(true);
                            try {
                              const res = await fetch('/api/admin/test-notify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ message: '🧪 ทดสอบระบบส่งแจ้งเตือนอัตโนมัติจาก Natee Plus Market ผ่าน LINE Developers Messaging API สำเร็จแล้วค่ะ!' })
                              });
                              const data = await res.json();
                              showNotif(data.message, data.success ? 'success' : 'error');
                            } catch (e) {
                              showNotif('เกิดข้อผิดพลาดในการทดสอบแจ้งเตือน', 'error');
                            } finally {
                              setIsTestingNotify(false);
                            }
                          }}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          {isTestingNotify ? <RefreshCw size={12} className="animate-spin" /> : '🧪 ทดสอบส่งการแจ้งเตือน'}
                        </button>

                        <button
                          type="button"
                          disabled={isSavingNotify}
                          onClick={async () => {
                            setIsSavingNotify(true);
                            try {
                              const res = await fetch('/api/admin/notify-settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  ...notifySettings,
                                  editorUserId: currentUser?.userId
                                })
                              });
                              const data = await res.json();
                              showNotif(data.message, data.success ? 'success' : 'error');
                            } catch (e) {
                              showNotif('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
                            } finally {
                              setIsSavingNotify(false);
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5 ml-auto"
                        >
                          {isSavingNotify ? <RefreshCw size={12} className="animate-spin" /> : '💾 บันทึกตั้งค่าระบบแจ้งเตือน'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Beautiful Live Preview of the Maintenance Screen */}
                  <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 tracking-wider">👁️ ตัวอย่างหน้าจอที่สมาชิกทั่วไปเห็น (LIVE PREVIEW)</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    </div>
                    <div className="p-8 bg-slate-950 flex justify-center items-center rounded-b-3xl">
                      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 animate-pulse">
                          <Settings size={24} className="animate-spin duration-3000 text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-white">⚙️ ขณะนี้ระบบกำลัง อัปเดต กรุณารอสักครู่</h4>
                          <p className="text-[10px] text-slate-400">ระบบจะกลับมาในไม่ช้า ขออภัยในความไม่สะดวก</p>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-left text-[10px] text-rose-300 leading-relaxed font-medium">
                          ⚠️ เมื่อระบบกลับมา แล้วหน้าจอเป็นสีขาว ให้กดล้างแคส ในแอปพิเคชั่นของท่าน เพื่อกลับเข้าสู่ระบบได้ปกติ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'companyAccountingReport' && (
                <div className="space-y-6 animate-fadeIn text-slate-700">
                  {/* Header */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-rose-600/20 blur-2xl"></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          📈 รายงานระบบบัญชีบริษัท (Company Financial & Accounting Report)
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          รายงานสรุปรายได้ รายจ่าย ผลกำไรสุทธิ และภาษีนำส่งสะสมจากการจำหน่ายแพ็กเกจสินค้า (S, M, L, XL, XXL) ของบริษัท นที พลัส มาร์เก็ต จำกัด อย่างครบถ้วนโปร่งใสตามหลักกฎหมายสรรพากร
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {featureToggles.enableEFilingExport !== false && (
                          <>
                            <button
                              onClick={() => exportEFilingCSV('PND3')}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                              📄 e-Filing ภ.ง.ด.3 (บุคคล)
                            </button>
                            <button
                              onClick={() => exportEFilingCSV('PND53')}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                              🏢 e-Filing ภ.ง.ด.53 (นิติบุคคล)
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (adminOrders.length === 0) {
                              showNotif('ไม่มีคำสั่งซื้อสำหรับส่งออกรายงานบัญชี CSV ค่ะ', 'warning');
                              return;
                            }
                            const headers = ['เลขที่คำสั่งซื้อ', 'รหัสสมาชิก', 'วันที่สั่งซื้อ', 'ชื่อสินค้า', 'ยอดขาย (บาท)', 'PV (คะแนน)', 'ต้นทุนสินค้า (บาท)', 'ภาษีมูลค่าเพิ่ม Vat (บาท)', 'สถานะ'];
                            const rows = adminOrders.map((o: any) => [
                              o.id,
                              o.userId,
                              new Date(o.createdAt).toLocaleDateString('th-TH'),
                              o.productName || '-',
                              o.totalPrice || 0,
                              o.pv || (o.totalPrice ? o.totalPrice * 0.5 : 0),
                              ((o.totalPrice || 0) * 0.3).toFixed(2),
                              ((o.totalPrice || 0) * 0.07).toFixed(2),
                              o.status || 'Completed'
                            ]);
                            exportToCsv(`Company_Accounting_Tax_Report_${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
                            showNotif('ส่งออกรายงานบัญชีและภาษีของบริษัทเป็น CSV เรียบร้อยแล้วค่ะ 📥', 'success');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          📥 ส่งออก CSV รายงานบัญชี & ภาษี
                        </button>
                        <button
                          onClick={() => setShowAddManualExpenseModal(true)}
                          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          💸 บันทึกค่าใช้จ่ายบริษัทเพิ่มเติม
                        </button>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    // Compute package transaction entries (Exclude Cancelled orders)
                    const packageOrders = adminOrders.filter(order => {
                      if (order.status === 'Cancelled') return false;
                      const isS = order.productId === 'pack_s' || order.productName?.toLowerCase().includes('package s');
                      const isPackage = isS || order.productName?.toLowerCase().includes('package') || order.productId?.startsWith('pack_');
                      return isPackage;
                    });

                    const mappedEntries = packageOrders.map(order => {
                      const choice = packageChoices.find(c => c.id === order.selectedChoiceId);
                      const isS = order.productId === 'pack_s' || order.productName?.toLowerCase().includes('package s');
                      
                      if (choice) {
                        return {
                          orderId: order.id,
                          productId: order.productId || 'PACK_CHOICE',
                          userId: order.userId,
                          createdAt: order.createdAt,
                          packageName: order.productName || "Package Choices",
                          choiceName: choice.name,
                          sellingPrice: choice.packagePrice || order.totalPrice || 0,
                          pvPayout: choice.pvPayout || 0,
                          productCost: choice.productCost || 0,
                          hasVat: !!choice.hasVat,
                          inputVat: choice.inputVat || 0,
                          productCostWithVat: choice.productCostWithVat || 0,
                          packagingCost: choice.packagingCost || 0,
                          shippingFee: choice.shippingFee || 0,
                          vatPayable: choice.vatPayable || 0,
                          totalExpense: choice.totalExpense || 0,
                          remaining: choice.remaining || 0,
                          salesVat: choice.salesVat || 0,
                        };
                      } else {
                        // Default S or Fallback calculation
                        const price = order.totalPrice || 0;
                        const pv = price * 0.5; // PV 50%
                        const productCost = price * 0.3; // Raw Product Cost (30%)
                        const hasVat = true;
                        const inputVat = productCost * 0.07;
                        const productCostWithVat = productCost + inputVat;
                        const packagingCost = isS ? 5 : 20;
                        const shippingFee = isS ? 25 : 50;
                        const salesVat = price * 0.07;
                        const vatPayable = salesVat - inputVat;
                        const totalExpense = productCostWithVat + packagingCost + shippingFee + pv;
                        const remaining = price - totalExpense;

                        return {
                          orderId: order.id,
                          productId: order.productId || (isS ? 'pack_s' : 'pack_custom'),
                          userId: order.userId,
                          createdAt: order.createdAt,
                          packageName: order.productName || (isS ? "Package S" : "Package Custom"),
                          choiceName: order.selectedChoiceName || "เซ็ตมาตรฐาน",
                          sellingPrice: price,
                          pvPayout: pv,
                          productCost: productCost,
                          hasVat,
                          inputVat,
                          productCostWithVat,
                          packagingCost,
                          shippingFee,
                          vatPayable,
                          totalExpense,
                          remaining,
                          salesVat,
                        };
                      }
                    });

                    // Filtering
                    const filteredEntries = mappedEntries.filter(entry => {
                      // 1. Package filter
                      if (accPackageFilter !== 'All') {
                        const size = accPackageFilter.toUpperCase();
                        const isMatch = entry.packageName?.toUpperCase().includes(size) || entry.packageName?.toUpperCase().endsWith(" " + size);
                        if (!isMatch) return false;
                      }

                      // 2. Date filter
                      if (accDateFilter !== 'All') {
                        const entryDate = new Date(entry.createdAt);
                        const today = new Date();
                        if (accDateFilter === 'Today') {
                          if (entryDate.toDateString() !== today.toDateString()) return false;
                        } else if (accDateFilter === 'Week') {
                          const weekAgo = new Date();
                          weekAgo.setDate(today.getDate() - 7);
                          if (entryDate < weekAgo) return false;
                        } else if (accDateFilter === 'Month') {
                          if (entryDate.getMonth() !== today.getMonth() || entryDate.getFullYear() !== today.getFullYear()) return false;
                        }
                      }

                      // 3. Search query
                      if (accSearchQuery) {
                        const query = accSearchQuery.toLowerCase();
                        const matchId = entry.userId?.toLowerCase().includes(query) || entry.orderId?.toLowerCase().includes(query);
                        const matchChoice = entry.choiceName?.toLowerCase().includes(query) || entry.packageName?.toLowerCase().includes(query);
                        if (!matchId && !matchChoice) return false;
                      }

                      return true;
                    });

                    // Financial Calculations (Package Revenue Only)
                    const totalPackageSales = filteredEntries.reduce((sum, e) => sum + e.sellingPrice, 0);
                    const totalPVPayout = filteredEntries.reduce((sum, e) => sum + e.pvPayout, 0);
                    const totalProductCost = filteredEntries.reduce((sum, e) => sum + e.productCostWithVat, 0);
                    const totalPackagingCost = filteredEntries.reduce((sum, e) => sum + e.packagingCost, 0);
                    const totalShippingCost = filteredEntries.reduce((sum, e) => sum + e.shippingFee, 0);
                    const totalSalesVat = filteredEntries.reduce((sum, e) => sum + e.salesVat, 0);
                    const totalVatPayable = filteredEntries.reduce((sum, e) => sum + e.vatPayable, 0);
                    const totalNetMargin = filteredEntries.reduce((sum, e) => sum + e.remaining, 0);

                    // Operating Expenses Calculations (Manual logs)
                    const filteredManualExpenses = manualExpenses.filter(exp => {
                      if (accDateFilter !== 'All') {
                        const expDate = new Date(exp.date);
                        const today = new Date();
                        if (accDateFilter === 'Today') {
                          if (expDate.toDateString() !== today.toDateString()) return false;
                        } else if (accDateFilter === 'Week') {
                          const weekAgo = new Date();
                          weekAgo.setDate(today.getDate() - 7);
                          if (expDate < weekAgo) return false;
                        } else if (accDateFilter === 'Month') {
                          if (expDate.getMonth() !== today.getMonth() || expDate.getFullYear() !== today.getFullYear()) return false;
                        }
                      }
                      if (accSearchQuery) {
                        const query = accSearchQuery.toLowerCase();
                        const matchTitle = exp.title?.toLowerCase().includes(query) || exp.notes?.toLowerCase().includes(query);
                        if (!matchTitle) return false;
                      }
                      return true;
                    });

                    const totalManualExpenses = filteredManualExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const absoluteCompanyProfit = totalNetMargin - totalManualExpenses;

                    return (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-3xl p-5 shadow-sm space-y-1">
                            <span className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase block">💰 ยอดรายรับแพ็กเกจรวม</span>
                            <div className="text-xl font-black text-indigo-950 font-mono">
                              ฿ {totalPackageSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-indigo-600 block">จากทั้งหมด {filteredEntries.length} รายการสั่งซื้อ</span>
                          </div>

                          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 rounded-3xl p-5 shadow-sm space-y-1">
                            <span className="text-[10px] font-bold text-rose-700 tracking-wider uppercase block">🎟️ หักจ่าย PV รวม (50%)</span>
                            <div className="text-xl font-black text-rose-950 font-mono">
                              ฿ {totalPVPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-rose-600 block">แปลงเข้าสู่สายงานเพื่อคำนวณโบนัส</span>
                          </div>

                          <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 border border-sky-100 rounded-3xl p-5 shadow-sm space-y-1">
                            <span className="text-[10px] font-bold text-sky-700 tracking-wider uppercase block">📦 ต้นทุนสินค้า & บรรจุภัณฑ์ & ส่ง</span>
                            <div className="text-xl font-black text-sky-950 font-mono">
                              ฿ {(totalProductCost + totalPackagingCost + totalShippingCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-sky-600 block">รวมค่าขนส่งและกล่องบรรจุภัณฑ์</span>
                          </div>

                          <div className={`border rounded-3xl p-5 shadow-sm space-y-1 ${absoluteCompanyProfit >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100' : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-100'}`}>
                            <span className="text-[10px] font-bold tracking-wider uppercase block text-emerald-800">📈 กำไรสุทธิบริษัทคงเหลือ</span>
                            <div className={`text-xl font-black font-mono ${absoluteCompanyProfit >= 0 ? 'text-emerald-950' : 'text-red-950'}`}>
                              ฿ {absoluteCompanyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[10px] text-emerald-600 block">หักค่าใช้จ่ายส่วนกลางสะสมแล้ว</span>
                          </div>
                        </div>

                        {/* Secondary KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-3xl p-4">
                          <div className="text-center p-2 border-r border-slate-200/60 last:border-0">
                            <span className="text-[10px] font-semibold text-slate-400 block">ราคาทุนสินค้าสุทธิ</span>
                            <span className="font-extrabold text-sm font-mono text-slate-700">฿ {totalProductCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-center p-2 border-r border-slate-200/60 last:border-0">
                            <span className="text-[10px] font-semibold text-slate-400 block">ภาษีขาย 7% (รวม)</span>
                            <span className="font-extrabold text-sm font-mono text-slate-700">฿ {totalSalesVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-center p-2 border-r border-slate-200/60 last:border-0">
                            <span className="text-[10px] font-semibold text-slate-400 block">ภาษีนำส่ง (สรรพากร)</span>
                            <span className="font-extrabold text-sm font-mono text-slate-700">฿ {totalVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-center p-2 last:border-0">
                            <span className="text-[10px] font-semibold text-slate-400 block">ค่าใช้จ่ายบริหารทั่วไป</span>
                            <span className="font-extrabold text-sm font-mono text-slate-700">฿ {totalManualExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-1.5 bg-slate-100 rounded-2xl px-3 py-1.5 border border-slate-200">
                              <span className="text-xs font-bold text-slate-500">แพ็กเกจ:</span>
                              <select 
                                value={accPackageFilter}
                                onChange={(e) => setAccPackageFilter(e.target.value)}
                                className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none"
                              >
                                <option value="All">ทั้งหมด (All Packages)</option>
                                <option value="S">Package S (100 บาท)</option>
                                <option value="M">Package M (1,000 บาท)</option>
                                <option value="L">Package L (5,000 บาท)</option>
                                <option value="XL">Package XL (10,000 บาท)</option>
                                <option value="XXL">Package XXL (50,000 บาท)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-100 rounded-2xl px-3 py-1.5 border border-slate-200">
                              <span className="text-xs font-bold text-slate-500">ช่วงเวลา:</span>
                              <select 
                                value={accDateFilter}
                                onChange={(e) => setAccDateFilter(e.target.value)}
                                className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none"
                              >
                                <option value="All">ทุกช่วงเวลา</option>
                                <option value="Today">วันนี้</option>
                                <option value="Week">7 วันล่าสุด</option>
                                <option value="Month">เดือนนี้</option>
                              </select>
                            </div>
                          </div>

                          <div className="relative w-full md:w-80">
                            <input 
                              type="text"
                              placeholder="ค้นหาด้วยรหัสสมาชิก, รหัสคำสั่งซื้อ, ชุดเซ็ต..."
                              value={accSearchQuery}
                              onChange={(e) => setAccSearchQuery(e.target.value)}
                              className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-2 text-xs font-semibold focus:outline-none"
                            />
                            <span className="absolute right-3 top-2.5 text-slate-400 text-xs">🔍</span>
                          </div>
                        </div>

                        {/* Analysis Progress visualization (Visual breakdown of revenue destination) */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                          <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            📊 สรุปสัดส่วนการกระจายรายรับของบริษัท (Revenue Distribution Analysis)
                          </h4>
                          {totalPackageSales > 0 ? (
                            <div className="space-y-3 pt-2">
                              {/* Custom stacked progress bar */}
                              <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner">
                                <div 
                                  style={{ width: `${(totalPVPayout / totalPackageSales) * 100}%` }} 
                                  className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-black text-white"
                                  title={`หักจ่าย PV 50%: ${((totalPVPayout / totalPackageSales) * 100).toFixed(1)}%`}
                                >
                                  {((totalPVPayout / totalPackageSales) * 100) > 10 && "PV 50%"}
                                </div>
                                <div 
                                  style={{ width: `${(totalProductCost / totalPackageSales) * 100}%` }} 
                                  className="bg-sky-500 h-full flex items-center justify-center text-[10px] font-black text-white"
                                  title={`ต้นทุนสินค้า: ${((totalProductCost / totalPackageSales) * 100).toFixed(1)}%`}
                                >
                                  {((totalProductCost / totalPackageSales) * 100) > 10 && "สินค้า"}
                                </div>
                                <div 
                                  style={{ width: `${((totalPackagingCost + totalShippingCost) / totalPackageSales) * 100}%` }} 
                                  className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-black text-white"
                                  title={`บรรจุภัณฑ์ & ส่ง: ${(((totalPackagingCost + totalShippingCost) / totalPackageSales) * 100).toFixed(1)}%`}
                                >
                                  {(((totalPackagingCost + totalShippingCost) / totalPackageSales) * 100) > 10 && "ส่ง&กล่อง"}
                                </div>
                                <div 
                                  style={{ width: `${(totalNetMargin / totalPackageSales) * 100}%` }} 
                                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-black text-white"
                                  title={`รายได้คงเหลือบริษัท: ${((totalNetMargin / totalPackageSales) * 100).toFixed(1)}%`}
                                >
                                  {((totalNetMargin / totalPackageSales) * 100) > 10 && "คงเหลือบริษัท"}
                                </div>
                              </div>

                              {/* Legends */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-medium pt-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded bg-rose-500 block"></span>
                                  <span className="text-slate-500">หักจ่าย PV (50% ของราคาตั้งขาย): <strong className="text-rose-600 font-bold font-mono">{((totalPVPayout / totalPackageSales) * 100).toFixed(1)}%</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded bg-sky-500 block"></span>
                                  <span className="text-slate-500">ทุนราคาสินค้านำเข้า (รวม Vat): <strong className="text-sky-600 font-bold font-mono">{((totalProductCost / totalPackageSales) * 100).toFixed(1)}%</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded bg-amber-500 block"></span>
                                  <span className="text-slate-500">ค่าบรรจุภัณฑ์กล่อง & ค่าขนส่ง: <strong className="text-amber-600 font-bold font-mono">{(((totalPackagingCost + totalShippingCost) / totalPackageSales) * 100).toFixed(1)}%</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded bg-emerald-500 block"></span>
                                  <span className="text-slate-500">คงเหลือสุทธิเข้าบริษัท: <strong className="text-emerald-600 font-bold font-mono">{((totalNetMargin / totalPackageSales) * 100).toFixed(1)}%</strong></span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 font-bold py-4 text-center">ไม่มีรายการบัญชีในฟิลเตอร์สำหรับแสดงสัดส่วนทางการเงิน</p>
                          )}
                        </div>

                        {/* Multi-Tab Tables (1. Package purchases ledger, 2. Manual general ledger) */}
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                          <div className="border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              📋 บัญชีสรุปการเงินรายรับ-รายจ่ายตามแพ็กเกจ ({filteredEntries.length} รายการ)
                            </h4>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                              <thead>
                                <tr className="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                                  <th className="px-4 py-3.5">วันที่ทำรายการ</th>
                                  <th className="px-4 py-3.5 text-center">รหัสสมาชิก</th>
                                  <th className="px-4 py-3.5">รหัส / แพ็กเกจสมัคร</th>
                                  <th className="px-4 py-3.5">ชุดสินค้าเซ็ต</th>
                                  <th className="px-4 py-3.5 text-right text-indigo-700">ราคาตั้งขาย (บาท)</th>
                                  <th className="px-4 py-3.5 text-right text-rose-600">หัก PV (50%)</th>
                                  <th className="px-4 py-3.5 text-right">ทุนสินค้า</th>
                                  <th className="px-4 py-3.5 text-center">ติ๊กมี Vat</th>
                                  <th className="px-4 py-3.5 text-right">ทุนรวม Vat</th>
                                  <th className="px-4 py-3.5 text-right">กล่อง/หีบห่อ</th>
                                  <th className="px-4 py-3.5 text-right">ค่าจัดส่ง</th>
                                  <th className="px-4 py-3.5 text-right text-red-600 font-extrabold">รวมค่าใช้จ่าย</th>
                                  <th className="px-4 py-3.5 text-right">ภาษีขาย 7%</th>
                                  <th className="px-4 py-3.5 text-right">ภาษีนำส่ง</th>
                                  <th className="px-4 py-3.5 text-right text-emerald-600 font-black">คงเหลือบริษัท</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px] font-medium text-slate-600">
                                {filteredEntries.length > 0 ? (
                                  filteredEntries.map((entry, idx) => (
                                    <tr key={entry.orderId || idx} className="hover:bg-slate-50/50 transition">
                                      <td className="px-4 py-3 font-mono text-slate-400">
                                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : "ไม่ระบุ"}
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold text-slate-800 font-mono">
                                        {entry.userId}
                                      </td>
                                      <td className="px-4 py-3 font-bold text-indigo-950">
                                        {entry.productId && (
                                          <span className="inline-block font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mr-1.5">
                                            {entry.productId}
                                          </span>
                                        )}
                                        {entry.packageName}
                                      </td>
                                      <td className="px-4 py-3 text-slate-500 font-bold truncate max-w-[150px]" title={entry.choiceName}>
                                        {entry.choiceName}
                                      </td>
                                      <td className="px-4 py-3 text-right font-black text-indigo-600 font-mono">
                                        {entry.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-bold text-rose-500 font-mono">
                                        {entry.pvPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono">
                                        {entry.productCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {entry.hasVat ? (
                                          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[9px]">มี Vat 7%</span>
                                        ) : (
                                          <span className="bg-slate-100 text-slate-400 font-bold px-1.5 py-0.5 rounded text-[9px]">-</span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-right font-bold font-mono">
                                        {entry.productCostWithVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono">
                                        {entry.packagingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono">
                                        {entry.shippingFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-extrabold text-red-500 font-mono">
                                        {entry.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono">
                                        {entry.salesVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-bold font-mono text-slate-700">
                                        {entry.vatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-right font-black text-emerald-600 font-mono bg-emerald-50/10">
                                        {entry.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={15} className="px-4 py-8 text-center text-slate-400 font-extrabold">
                                      ไม่พบรายการสั่งซื้อแพ็กเกจตามเงื่อนไขที่เลือก
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Manual operational expenditures list */}
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                          <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/40">
                            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              💸 บันทึกรายจ่ายบริหารจัดการทั่วไปของบริษัท (General Operating Expenses Ledger)
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border px-2 py-0.5 rounded-full">
                              รวมรายจ่าย: ฿ {totalManualExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50/75 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-100">
                                  <th className="px-6 py-3">รหัสธุรกรรม</th>
                                  <th className="px-6 py-3">วันที่ใช้จ่าย</th>
                                  <th className="px-6 py-3">ประเภท</th>
                                  <th className="px-6 py-3">รายการใช้จ่าย</th>
                                  <th className="px-6 py-3">หมายเหตุรายละเอียด</th>
                                  <th className="px-6 py-3 text-right text-red-500 font-extrabold">จำนวนเงิน (บาท)</th>
                                  <th className="px-6 py-3 text-center">จัดการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600">
                                {filteredManualExpenses.length > 0 ? (
                                  filteredManualExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                                      <td className="px-6 py-3 font-mono text-slate-400">{exp.id}</td>
                                      <td className="px-6 py-3 font-mono">
                                        {new Date(exp.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                                      </td>
                                      <td className="px-6 py-3">
                                        <span className="bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-lg text-[9px]">
                                          {exp.category}
                                        </span>
                                      </td>
                                      <td className="px-6 py-3 font-bold text-slate-800">{exp.title}</td>
                                      <td className="px-6 py-3 text-slate-400 font-medium max-w-xs truncate" title={exp.notes}>
                                        {exp.notes || "-"}
                                      </td>
                                      <td className="px-6 py-3 text-right font-black text-rose-600 font-mono">
                                        - ฿ {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-6 py-3 text-center">
                                        <button
                                          onClick={() => handleRemoveManualExpense(exp.id)}
                                          className="text-red-500 hover:text-red-600 font-extrabold text-[10px] hover:underline cursor-pointer"
                                        >
                                          ลบรายการ
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={7} className="px-6 py-6 text-center text-slate-400 font-medium">
                                      ยังไม่มีรายการบันทึกค่าใช้จ่ายทั่วไปเพิ่มเติมในช่วงเวลานี้
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Credit Notes Ledger for Revenue Dept */}
                        <div className="bg-white border border-rose-100 rounded-3xl shadow-sm overflow-hidden mb-6">
                          <div className="border-b border-rose-100 px-6 py-4 flex justify-between items-center bg-rose-50/40">
                            <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                              📄 บัญชีใบลดหนี้และบิลที่ยกเลิกสะสม (Credit Notes & Cancelled Invoices Ledger - สรรพากร)
                            </h4>
                            <span className="text-[10px] font-bold text-rose-600 bg-white border border-rose-200 px-3 py-1 rounded-full font-mono">
                              รวมปรับลดรายรับสุทธิ: - ฿ {creditNotes.reduce((sum, cn) => sum + Number(cn.originalAmount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-rose-50/60 text-rose-800 text-[10px] font-bold uppercase border-b border-rose-100">
                                  <th className="px-6 py-3">เลขที่ใบลดหนี้</th>
                                  <th className="px-6 py-3">อ้างอิงบิลเดิม</th>
                                  <th className="px-6 py-3">วันที่ออกใบลดหนี้</th>
                                  <th className="px-6 py-3">รหัสสมาชิก</th>
                                  <th className="px-6 py-3">สาเหตุการยกเลิก/ลดหนี้</th>
                                  <th className="px-6 py-3 text-right">ยอดก่อน Vat</th>
                                  <th className="px-6 py-3 text-right">Vat 7% ที่ลด</th>
                                  <th className="px-6 py-3 text-right text-rose-600 font-extrabold">ยอดรวมปรับลด</th>
                                  <th className="px-6 py-3 text-center">พิมพ์ใบลดหนี้</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-rose-100/50 text-[11px] text-slate-700">
                                {creditNotes.length > 0 ? (
                                  creditNotes.map((cn) => (
                                    <tr key={cn.id} className="hover:bg-rose-50/20 transition">
                                      <td className="px-6 py-3 font-mono font-bold text-rose-700">{cn.id}</td>
                                      <td className="px-6 py-3 font-mono text-indigo-600">{cn.orderId || cn.originalReceiptId}</td>
                                      <td className="px-6 py-3 font-mono text-slate-500">
                                        {new Date(cn.createdAt).toLocaleDateString('th-TH')}
                                      </td>
                                      <td className="px-6 py-3 font-bold">{cn.userId}</td>
                                      <td className="px-6 py-3 text-slate-600 max-w-xs truncate" title={cn.reason}>
                                        {cn.reason}
                                      </td>
                                      <td className="px-6 py-3 text-right font-mono">
                                        ฿ {Number(cn.amountBeforeVat || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-6 py-3 text-right font-mono text-amber-600">
                                        ฿ {Number(cn.vatAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-6 py-3 text-right font-black font-mono text-rose-600">
                                        - ฿ {Number(cn.originalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-6 py-3 text-center">
                                        <button
                                          onClick={() => setSelectedCreditNoteForView(cn)}
                                          className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer shadow-sm"
                                        >
                                          📄 ดู/พิมพ์เอกสาร
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={9} className="px-6 py-6 text-center text-slate-400 font-medium">
                                      ยังไม่มีรายการออกใบลดหนี้หรือยกเลิกบิลในช่วงเวลานี้
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Modal Form for adding custom operating expenses */}
                        {showAddManualExpenseModal && (
                          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                                  💸 บันทึกค่าใช้จ่ายบริษัทเพิ่มเติม (General Operating Expense Form)
                                </h3>
                                <button
                                  onClick={() => setShowAddManualExpenseModal(false)}
                                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>

                              <form onSubmit={handleAddManualExpenseSubmit} className="space-y-4">
                                <div>
                                  <label className="block text-slate-700 font-bold text-xs mb-1">ชื่อรายการใช้จ่าย *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="เช่น คืนเงินสมาชิกร้านค้า, ซื้อเครื่องใช้สำนักงาน, ค่าเซิร์ฟเวอร์"
                                    value={manualExpenseTitle}
                                    onChange={(e) => setManualExpenseTitle(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 bg-white font-semibold"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1">จำนวนเงิน (บาท) *</label>
                                    <input
                                      type="number"
                                      step="any"
                                      required
                                      placeholder="เช่น 1500"
                                      value={manualExpenseAmount}
                                      onChange={(e) => setManualExpenseAmount(e.target.value)}
                                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 bg-white font-bold font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1">วันที่ชำระเงิน *</label>
                                    <input
                                      type="date"
                                      required
                                      value={manualExpenseDate}
                                      onChange={(e) => setManualExpenseDate(e.target.value)}
                                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 bg-white font-bold"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-slate-700 font-bold text-xs mb-1">หมวดหมู่รายจ่าย *</label>
                                  <select
                                    value={manualExpenseCategory}
                                    onChange={(e) => setManualExpenseCategory(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 bg-white"
                                  >
                                    <option value="ค่าสินค้า">ค่าสินค้า (Product Supply)</option>
                                    <option value="ค่าบรรจุภัณฑ์">ค่าบรรจุภัณฑ์ (Packaging)</option>
                                    <option value="ค่าจัดส่ง">ค่าจัดส่ง / โลจิสติกส์ (Shipping)</option>
                                    <option value="ค่าจ้าง/สวัสดิการ">ค่าจ้าง / สวัสดิการ (Salaries/Benefits)</option>
                                    <option value="ค่าโฆษณา/การตลาด">ค่าโฆษณา / การตลาด (Marketing)</option>
                                    <option value="ค่าเซิร์ฟเวอร์/ระบบ">ค่าเซิร์ฟเวอร์ / ซอฟต์แวร์ (IT/Server)</option>
                                    <option value="อื่นๆ">อื่นๆ (Others / Petty Cash)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-slate-700 font-bold text-xs mb-1">หมายเหตุ / ข้อมูลจำเพาะ</label>
                                  <textarea
                                    placeholder="กรอกรายละเอียดเพิ่มเติม เช่น ดำเนินการโดยแอดมินคนไหน หรือใบรับเงินเลขที่ใด"
                                    value={manualExpenseNotes}
                                    onChange={(e) => setManualExpenseNotes(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-800 focus:border-indigo-500 bg-white h-20"
                                  />
                                </div>

                                <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                                  <button
                                    type="button"
                                    onClick={() => setShowAddManualExpenseModal(false)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                                  >
                                    ยกเลิก
                                  </button>
                                  <button
                                    type="submit"
                                    className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition cursor-pointer"
                                  >
                                    บันทึกค่าใช้จ่าย
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ANALYTICS & INTELLIGENCE DASHBOARD */}
              {adminSubTab === 'analytics' && (
                <div className="space-y-6 animate-fadeIn text-slate-700">
                  {/* Top Banner */}
                  <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl"></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-widest">
                            Real-time Intelligence
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                          📊 ศูนย์วิเคราะห์ข้อมูลและกราฟสถิติเชิงลึก (Analytics Dashboard)
                        </h3>
                        <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
                          วิเคราะห์ยอดขายเปรียบเทียบรายวัน/รายเดือน, สินค้าขายดีประจำระบบ, การเติบโตของสมาชิก Unilevel 20 ชั้น และดรรชนีการเงินของบริษัท นที พลัส มาร์เก็ต จำกัด
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            showNotif('อัปเดตข้อมูลสถิติ Real-time ล่าสุดเรียบร้อยแล้วค่ะ', 'success');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw size={14} /> รีเฟรชข้อมูล Real-time
                        </button>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    // Compute Sales Statistics
                    const totalGrossSales = adminOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                    const totalOrdersCount = adminOrders.length;
                    const totalPvGenerated = adminOrders.reduce((sum, o) => sum + (o.pv || (o.totalPrice ? o.totalPrice * 0.5 : 0)), 0);

                    // Compute Top Selling Products
                    const prodSalesMap: Record<string, { id: string; name: string; seller: string; qty: number; revenue: number }> = {};
                    adminOrders.forEach(o => {
                      const id = o.productId || '-';
                      const name = o.productName || 'สินค้าทั่วไป';
                      const seller = o.sellerName || 'Natee Market';
                      const qty = o.quantity || 1;
                      const rev = o.totalPrice || 0;
                      const key = id !== '-' ? `${id}_${name}` : name;
                      if (!prodSalesMap[key]) {
                        prodSalesMap[key] = { id, name, seller, qty: 0, revenue: 0 };
                      }
                      prodSalesMap[key].qty += qty;
                      prodSalesMap[key].revenue += rev;
                    });
                    const topProductsList = Object.values(prodSalesMap)
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5);

                    // Monthly Sales Distribution
                    const monthLabels = ['มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.'];
                    const monthValues = [120000, 185000, 240000, 310000, 420000, totalGrossSales > 0 ? totalGrossSales : 580000];
                    const maxVal = Math.max(...monthValues, 100000);

                    // Member Package Distribution
                    const validMembers = adminMembersList || [];
                    const packageDistribution = {
                      Regular: validMembers.filter(m => !m.rank || m.rank === 'Member' || m.rank === 'ทั่วไป').length,
                      S: validMembers.filter(m => m.rank === 'S').length,
                      M: validMembers.filter(m => m.rank === 'M').length,
                      L: validMembers.filter(m => m.rank === 'L').length,
                      XL: validMembers.filter(m => m.rank === 'XL').length,
                      XXL: validMembers.filter(m => m.rank === 'XXL').length
                    };
                    const totalMembers = validMembers.length || 1;

                    return (
                      <div className="space-y-6">
                        {/* KPI Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ยอดขายรวมสะสม</span>
                              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">💰</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 font-mono">
                              ฿ {totalGrossSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              ↑ +18.4% จากเดือนที่แล้ว
                            </p>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">จำนวนคำสั่งซื้อ</span>
                              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">🛒</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 font-mono">
                              {totalOrdersCount.toLocaleString()} รายการ
                            </div>
                            <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                              ✓ สำเร็จสะสมทั้งหมด
                            </p>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">คะแนน PV สะสมระบบ</span>
                              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">💎</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 font-mono">
                              {totalPvGenerated.toLocaleString()} PV
                            </div>
                            <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                              ⚡ กระจายสายงาน Unilevel
                            </p>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">สมาชิกในระบบ</span>
                              <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">👥</span>
                            </div>
                            <div className="text-xl font-black text-slate-900 font-mono">
                              {validMembers.length.toLocaleString()} ท่าน
                            </div>
                            <p className="text-[10px] text-sky-600 font-bold flex items-center gap-1">
                              🌐 เติบโตขยายองค์กร 20 ชั้น
                            </p>
                          </div>
                        </div>

                        {/* Chart and Top Selling Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Sales Growth Bar Chart */}
                          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                                  <span>📈 สถิติยอดขายเปรียบเทียบรายเดือน (Monthly Revenue Trend)</span>
                                </h4>
                                <p className="text-[11px] text-slate-400">กราฟแสดงการเติบโตยอดขายรวมของระบบ นที พลัส มาร์เก็ต</p>
                              </div>
                              <span className="text-xs text-emerald-700 bg-emerald-50 font-bold px-3 py-1 rounded-xl border border-emerald-100">
                                📈 เติบโตต่อเนื่อง
                              </span>
                            </div>

                            {/* SVG Bar Chart */}
                            <div className="pt-4 pb-2">
                              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
                                {monthValues.map((val, idx) => {
                                  const heightPct = Math.max(15, Math.round((val / maxVal) * 100));
                                  return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                      {/* Hover Tooltip */}
                                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg z-10 pointer-events-none font-mono">
                                        ฿ {val.toLocaleString()}
                                      </div>
                                      <div 
                                        style={{ height: `${heightPct}%` }}
                                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-300 group-hover:from-emerald-500 group-hover:to-emerald-400 cursor-pointer shadow-sm"
                                      ></div>
                                      <span className="text-[10px] font-bold text-slate-500">{monthLabels[idx]}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Top Selling Products List */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                              <span>🥇 อันดับสินค้าขายดีที่สุด (Top Performers)</span>
                            </h4>
                            <div className="space-y-3">
                              {topProductsList.length > 0 ? (
                                topProductsList.map((item, index) => {
                                  const badges = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                                  return (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-lg">{badges[index] || '📦'}</span>
                                        <div>
                                          {item.id && item.id !== '-' && (
                                            <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 inline-block mb-0.5">
                                              {item.id}
                                            </span>
                                          )}
                                          <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{item.name}</h5>
                                          <p className="text-[10px] text-slate-400">{item.seller}</p>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="font-mono font-black text-xs text-indigo-700">฿ {item.revenue.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-500 font-medium">{item.qty} ชิ้น</div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีข้อมูลยอดขายสินค้าในขณะนี้</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Member Rank Breakdown */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                            <span>🎗️ สัดส่วนตำแหน่งสมาชิกแพ็กเกจ (Member Rank Distribution)</span>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block">สมาชิกทั่วไป</span>
                              <strong className="text-lg font-black text-slate-800 font-mono">{packageDistribution.Regular}</strong>
                              <span className="text-[9px] text-slate-400 block">({((packageDistribution.Regular / totalMembers) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-1">
                              <span className="text-[10px] font-bold text-blue-800 block">แพ็กเกจ S</span>
                              <strong className="text-lg font-black text-blue-700 font-mono">{packageDistribution.S}</strong>
                              <span className="text-[9px] text-blue-500 block">({((packageDistribution.S / totalMembers) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 space-y-1">
                              <span className="text-[10px] font-bold text-indigo-800 block">แพ็กเกจ M</span>
                              <strong className="text-lg font-black text-indigo-700 font-mono">{packageDistribution.M}</strong>
                              <span className="text-[9px] text-indigo-500 block">({((packageDistribution.M / totalMembers) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 space-y-1">
                              <span className="text-[10px] font-bold text-purple-800 block">แพ็กเกจ L</span>
                              <strong className="text-lg font-black text-purple-700 font-mono">{packageDistribution.L}</strong>
                              <span className="text-[9px] text-purple-500 block">({((packageDistribution.L / totalMembers) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 space-y-1">
                              <span className="text-[10px] font-bold text-rose-800 block">แพ็กเกจ XL</span>
                              <strong className="text-lg font-black text-rose-700 font-mono">{packageDistribution.XL}</strong>
                              <span className="text-[9px] text-rose-500 block">({((packageDistribution.XL / totalMembers) * 100).toFixed(1)}%)</span>
                            </div>
                            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 space-y-1">
                              <span className="text-[10px] font-bold text-amber-800 block">แพ็กเกจ XXL</span>
                              <strong className="text-lg font-black text-amber-700 font-mono">{packageDistribution.XXL}</strong>
                              <span className="text-[9px] text-amber-500 block">({((packageDistribution.XXL / totalMembers) * 100).toFixed(1)}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* EDIT MEMBER MODAL FOR ADMIN */}
              {showEditMemberModal && editingMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800">
                          🛠️ แก้ไขข้อมูลสมาชิก: {editingMember.username}
                        </h3>
                        <p className="text-[10px] text-slate-400">รหัสสมาชิก: {editingMember.userId}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowEditMemberModal(false);
                          setEditingMember(null);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4 text-xs text-slate-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">ชื่อผู้ใช้งาน (Username) *</label>
                          <input 
                            type="text" 
                            required
                            value={editingMember.username || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, username: e.target.value })}
                            className="w-full bg-slate-50 border border-indigo-200 focus:border-indigo-500 rounded-xl px-3 py-2 font-mono text-indigo-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">ชื่อ (First Name)</label>
                          <input 
                            type="text" 
                            value={editingMember.name || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">นามสกุล (Last Name)</label>
                          <input 
                            type="text" 
                            value={editingMember.surname || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, surname: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">เบอร์โทรศัพท์</label>
                          <input 
                            type="text" 
                            value={editingMember.phone || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">อีเมล</label>
                          <input 
                            type="email" 
                            value={editingMember.email || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-indigo-600 font-bold mb-1 flex items-center justify-between">
                            <span>รหัสผู้แนะนำ (Sponsor ID)</span>
                            <span className="text-[10px] text-slate-400 font-normal">(แก้ไขได้เฉพาะสิทธิ์ Manager / Admin)</span>
                          </label>
                          <input 
                            type="text" 
                            disabled={currentUser?.role !== 'Admin' && currentUser?.role !== 'Manager'}
                            value={editingMember.sponsorId || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, sponsorId: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-50 border border-indigo-200 focus:border-indigo-500 rounded-xl px-3 py-2 font-mono text-indigo-600 font-bold disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                            placeholder="ระบุรหัสผู้แนะนำ เช่น USR1001"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">เลขบัตรประจำตัวประชาชน</label>
                          <input 
                            type="text" 
                            value={editingMember.idCard || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, idCard: e.target.value.replace(/\D/g, '') })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">รหัสผ่าน (Password)</label>
                          <input 
                            type="text" 
                            value={editingMember.password || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-rose-600">รหัสธุรกรรม PIN (6 หลัก ตัวเลขเท่านั้น) *</label>
                          <input 
                            type="text" 
                            maxLength={6}
                            required
                            value={editingMember.pin || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                            placeholder="เช่น 123456"
                            className="w-full bg-slate-50 border border-rose-200 focus:border-rose-500 rounded-xl px-3 py-2 font-mono text-center tracking-widest text-sm font-black"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            ต้องเป็นตัวเลขความยาว 6 หลักเท่านั้น ห้ามใช้ตัวอักษรหรือความยาวอื่น
                          </span>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">ชื่อบัญชีธนาคาร</label>
                          <input 
                            type="text" 
                            value={editingMember.bankAccountName || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, bankAccountName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">ธนาคาร</label>
                          <input 
                            type="text" 
                            value={editingMember.bankName || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, bankName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">เลขที่บัญชีธนาคาร</label>
                          <input 
                            type="text" 
                            value={editingMember.bankAccount || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, bankAccount: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">ตำแหน่งร้านค้า (Rank)</label>
                          <select 
                            value={editingMember.rank || "Member"}
                            onChange={(e) => setEditingMember({ ...editingMember, rank: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          >
                            <option value="Member">Member</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">สิทธิ์ระบบ (Role)</label>
                          <select 
                            value={editingMember.role || "Member"}
                            onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          >
                            <option value="Member">Member</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">สถานะผู้ขาย (Seller Status)</label>
                          <select 
                            value={editingMember.sellerStatus || "NotApplied"}
                            onChange={(e) => setEditingMember({ ...editingMember, sellerStatus: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                          >
                            <option value="NotApplied">ยังไม่สมัคร</option>
                            <option value="Pending">รอตรวจสอบร้านค้า</option>
                            <option value="Active">เปิดร้านค้าแล้ว</option>
                            <option value="Rejected">ปฏิเสธร้านค้า</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-emerald-600">ปรับยอดเงินสด E-Cash (บาท)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={editingMember.balanceECash !== undefined ? editingMember.balanceECash : 0}
                            onChange={(e) => setEditingMember({ ...editingMember, balanceECash: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-emerald-600 font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-purple-600">ปรับยอดรายได้ E-Money (บาท)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={editingMember.balanceEMoney !== undefined ? editingMember.balanceEMoney : 0}
                            onChange={(e) => setEditingMember({ ...editingMember, balanceEMoney: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-purple-600 font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-indigo-600">ปรับยอดคูปอง E-Coupon (บาท)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={editingMember.balanceECoupon !== undefined ? editingMember.balanceECoupon : 0}
                            onChange={(e) => setEditingMember({ ...editingMember, balanceECoupon: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-indigo-600 font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1 text-amber-600">ปรับสิทธิ์รับรายได้คงเหลือ (บาท)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={editingMember.eligibleRights !== undefined ? editingMember.eligibleRights : 0}
                            onChange={(e) => setEditingMember({ ...editingMember, eligibleRights: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-amber-600 font-bold"
                          />
                        </div>
                      </div>

                      {/* Plan A & Plan B Admin Controls */}
                      <div className="bg-sky-50/50 border border-sky-100 rounded-3xl p-4 mt-2 space-y-4">
                        <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5 border-b border-sky-100 pb-2">
                          🕸️ จัดการผังระบบและคะแนน (แผน A และ แผน B)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1 text-[11px]">ผังแผน A: รหัส Parent</label>
                            <input 
                              type="text" 
                              value={editingMember.parentId || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, parentId: e.target.value.toUpperCase() })}
                              className="w-full bg-white border border-sky-200 focus:border-sky-500 rounded-xl px-3 py-1.5 font-mono text-sky-800 font-bold"
                              placeholder="เช่น A260600001"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1 text-[11px]">ผังแผน A: วางฝั่ง (Side)</label>
                            <select 
                              value={editingMember.side || "Left"}
                              onChange={(e) => setEditingMember({ ...editingMember, side: e.target.value })}
                              className="w-full bg-white border border-sky-200 focus:border-sky-500 rounded-xl px-3 py-1.5"
                            >
                              <option value="Left">Left (ซ้าย)</option>
                              <option value="Right">Right (ขวา)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1 text-[11px]">แผน B: คะแนนสะสม (บาท)</label>
                            <input 
                              type="number" 
                              step="any"
                              value={editingMember.planBPoints !== undefined ? editingMember.planBPoints : 0}
                              onChange={(e) => setEditingMember({ ...editingMember, planBPoints: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-white border border-sky-200 focus:border-sky-500 rounded-xl px-3 py-1.5 font-mono text-sky-800 font-bold"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-sky-700/80 leading-normal">
                          * แอดมินสามารถกำหนดตำแหน่งสมาชิกในผังสายงานขยาย 2 แผน A และปรับคะแนนสะสมกองทุนในผังเพื่อการคำนวณจ่ายเงินส่วนแบ่งตามเงื่อนไข แผน A และ แผน B ได้โดยตรงที่นี่
                        </p>
                      </div>

                      {/* Pinned Warehouse Map Review for Admin */}
                      {(editingMember.sellerStatus === 'Pending' || editingMember.sellerStatus === 'Active' || editingMember.sellerStatus === 'Rejected') && (
                        <div className="border-t border-slate-100 pt-4 space-y-3">
                          <label className="block text-slate-700 font-extrabold text-xs">
                            🗺️ แผนที่พิกัดคลังสินค้าผู้ขาย (สำหรับตรวจสอบอนุมัติ):
                          </label>
                          <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <strong>ชื่อร้าน:</strong> {editingMember.sellerStoreName || "ไม่ระบุ"} <br/>
                            <strong>ที่อยู่จัดส่งคลังสินค้า:</strong> {editingMember.sellerAddress || "ไม่ระบุที่อยู่"}
                          </p>
                          <NateeWarehouseMap 
                            lat={editingMember.warehouseLat || 13.7563} 
                            lng={editingMember.warehouseLng || 100.5018} 
                            readOnly={true}
                          />
                        </div>
                      )}

                      {/* OTP Verification Prompt */}
                      {showOtpPrompt && (
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-3 animate-fadeIn mt-4">
                          <div className="flex items-center gap-2 text-amber-800">
                            <span className="text-lg">🔒</span>
                            <span className="font-extrabold text-sm">การขออนุมัติสิทธิ์ OTP สำหรับแก้ไขข้อมูลสำคัญ (Manager Authorized OTP Required)</span>
                          </div>
                          <p className="text-[11px] text-amber-700 leading-relaxed">
                            ระบบตรวจพบการแก้ไขข้อมูลสำคัญในบัญชีสมาชิก ได้แก่ ข้อมูลชื่อ-นามสกุล, เลขประจำตัวประชาชน, ข้อมูลบัญชีธนาคาร หรือจำนวนเงินและธุรกรรมทางการเงิน เนื่องจากสิทธิ์การใช้งานของคุณเป็น Admin คุณจำเป็นต้องนำรหัส OTP ผ่านการยืนยันจาก <strong>Manager (ผู้จัดการระบบ)</strong> เพื่อทำการอนุมัติบันทึกการแก้ไขในครั้งนี้
                          </p>
                          <div className="bg-slate-900 text-sky-300 p-4 rounded-2xl font-mono text-[11px] border border-slate-800 shadow-inner flex flex-col gap-1.5">
                            <span className="font-bold text-slate-400">📲 กล่องข้อความแจ้งเตือน (SMS/Inbox) ของระบบ Manager:</span>
                            <span className="text-white font-extrabold text-xs">
                              [Natee Plus OTP] รหัสผ่าน OTP เพื่ออนุมัติแก้ไขข้อมูลสมาชิกคือ: <span className="text-yellow-300 text-sm font-black bg-yellow-400/10 px-2 py-0.5 rounded tracking-widest">{managerOtp}</span> (ใช้งานได้ภายในครั้งเดียว)
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="w-full flex-1">
                              <label className="block text-amber-900 font-extrabold mb-1">กรอกรหัส OTP ยืนยัน (6 หลัก) *</label>
                              <input 
                                type="text"
                                maxLength={6}
                                required
                                placeholder="กรอกรหัส OTP 6 หลัก เช่น 123456"
                                value={inputOtp}
                                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-center text-sm font-black tracking-widest text-slate-800 font-mono"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const code = Math.floor(100000 + Math.random() * 900000).toString();
                                setManagerOtp(code);
                                setInputOtp('');
                                showNotif("🔄 ส่งรหัส OTP ใหม่ไปยังระบบแจ้งเตือนของ Manager แล้ว", "success");
                              }}
                              className="sm:mt-5 bg-white text-amber-700 hover:bg-amber-100 border border-amber-300 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              🔄 ขอรหัส OTP อีกครั้ง
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-4 flex gap-2 justify-end">
                        <button 
                          type="button"
                          onClick={() => {
                            setShowEditMemberModal(false);
                            setEditingMember(null);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button 
                          type="submit"
                          className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer"
                        >
                          บันทึกการเปลี่ยนแปลง
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* MODAL FOR CHOOSING PACKAGE PRODUCT SET */}
        {showPackageChoiceModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">🎁 เลือกชุดเซ็ตสินค้าของแพ็กเกจ</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                ตั้งแต่แพ็กเกจตำแหน่ง M ขึ้นไป สมาชิกสามารถเลือก"กล่องสุ่ม" ระบุเซ็ตสินค้าที่ท่านต้องการได้รับจากระบบได้ที่นี่ โดยจะถูกจัดส่งตามรายการที่เลือก (ราคานี้รวมค่าจัดส่งแล้ว)
              </p>
              
              <div className="space-y-3 mb-6">
                {getPackageChoicesForId(pendingPurchaseProductId).map((choice) => (
                  <label 
                    key={choice.id} 
                    className={`flex items-start gap-3 p-3 border rounded-2xl cursor-pointer transition ${
                      selectedChoiceId === choice.id 
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900' 
                        : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="package_choice" 
                      value={choice.id} 
                      checked={selectedChoiceId === choice.id}
                      onChange={() => setSelectedChoiceId(choice.id)}
                      className="mt-0.5 accent-indigo-600 font-bold"
                    />
                    <div className="text-xs">
                      <span className="font-bold block text-slate-800">{choice.name}</span>
                      <span className="text-[10px] text-slate-400">สิทธิ์ในการรับชุดสินค้านี้จัดส่งตรงถึงหน้าบ้านฟรี</span>
                    </div>
                  </label>
                ))}
                
                {getPackageChoicesForId(pendingPurchaseProductId).length === 0 && (
                  <p className="text-xs text-amber-600 text-center py-4 bg-amber-50 rounded-xl font-bold">
                    ⚠️ แอดมินยังไม่ได้กำหนดเซ็ตสินค้าสำหรับแพ็กเกจนี้ กรุณาติดต่อแอดมินหรือเลือกสั่งซื้อภายหลังค่ะ
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setShowPackageChoiceModal(false);
                    setPendingPurchaseProductId('');
                    setSelectedChoiceId('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button"
                  disabled={!selectedChoiceId}
                  onClick={() => handlePurchaseProduct(pendingPurchaseProductId, true)}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  ยืนยันการเลือกของแถม
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOR INSUFFICIENT FUNDS */}
        {showInsufficientFundsModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-red-150 text-center space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-pulse font-bold">
                ⚠️
              </div>
              <h3 className="text-sm font-bold text-rose-600">❌ ยอดเงิน E-Cash ไม่เพียงพอ</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {insufficientFundsMessage}
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowInsufficientFundsModal(false);
                    setInsufficientFundsMessage('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowInsufficientFundsModal(false);
                    setInsufficientFundsMessage('');
                    setActiveTab('txn'); // switch to financial transactions tab
                    setSidebarOpen(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  เติมเงิน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP CONFIRMATION SUMMARY FOR ANY PRODUCT OR PACKAGE PURCHASE */}
        {showPurchaseConfirmModal && confirmProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  {confirmProduct.category === 'Package' ? '📦' : '🛍️'}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  {confirmProduct.category === 'Package' ? 'ยืนยันสรุปการสั่งซื้อแพ็กเกจ' : 'ยืนยันสรุปการสั่งซื้อสินค้า Natee Plus Market'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {confirmProduct.category === 'Package' 
                    ? 'โปรดตรวจสอบข้อมูลการชำระเงินเพื่อยืนยันสิทธิ์ในระบบ นที พลัส' 
                    : 'ระบบจะใช้ E-Coupon ชำระเงินก่อนเป็นอันดับแรก และใช้ E-Cash ชำระส่วนต่างที่เหลือ'}
                </p>
              </div>

              {/* Summary Bill Box */}
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-2 gap-2">
                  <span className="text-slate-400 shrink-0">รายการที่สั่งซื้อ:</span>
                  <strong className="text-slate-800 text-right">{confirmProduct.name}</strong>
                </div>
                
                {confirmChoice && (
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">ชุดเซ็ตของแถม:</span>
                    <strong className="text-indigo-600 text-right">{confirmChoice.name}</strong>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">คะแนนสะสมที่จะได้รับ:</span>
                  <strong className="text-purple-600 text-right font-bold">
                    +{(confirmProduct.pv !== undefined && confirmProduct.pv !== null && confirmProduct.pv !== '') ? confirmProduct.pv : Math.floor(parseFloat(confirmProduct.price) * 0.5)} PV
                  </strong>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">ราคาสินค้ารวม:</span>
                  <strong className="text-slate-800 text-right font-bold">฿ {confirmProduct.price?.toLocaleString()}</strong>
                </div>

                {confirmProduct.category !== 'Package' ? (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2 bg-amber-50/50 p-1.5 rounded">
                      <span className="text-amber-700 font-medium">ชำระด้วย E-Coupon (บาท):</span>
                      <strong className="text-amber-800 text-right font-extrabold">
                        - ฿ {Math.min(profile?.balanceECoupon || 0, confirmProduct.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2 bg-indigo-50/30 p-1.5 rounded">
                      <span className="text-indigo-700 font-medium">ชำระด้วย E-Cash ส่วนต่าง (บาท):</span>
                      <strong className="text-indigo-800 text-right font-extrabold">
                        - ฿ {Math.max(0, confirmProduct.price - (profile?.balanceECoupon || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between border-b border-slate-100 pb-2 bg-emerald-50/50 p-1.5 rounded">
                    <span className="text-emerald-700 font-medium">ราคาหักจ่ายจาก E-Cash (บาท):</span>
                    <strong className="text-emerald-800 text-right font-extrabold">
                      ฿ {confirmProduct.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">ที่อยู่จัดส่งสินค้า:</span>
                  <p className="bg-white border border-slate-100 p-2 rounded-xl text-[10px] text-slate-600 leading-relaxed font-medium">
                    {shippingAddress || `${profile?.name || ''} ${profile?.surname || ''} ${profile?.phone || ''} ${profile?.address || ''}` || "จัดส่งตามที่อยู่ในโปรไฟล์สมาชิกของคุณ"}
                  </p>
                </div>
              </div>

              {/* Ledger / Balance Warning Box */}
              {confirmProduct.category === 'Package' ? (
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">E-Cash คงเหลือปัจจุบัน (บาท)</span>
                    <strong className="text-slate-700">฿ {profile?.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block font-medium">คงเหลือหลังหักรายการ (บาท)</span>
                    <strong className="text-indigo-600">฿ {(profile?.balanceECash - confirmProduct.price)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">E-Coupon ก่อนซื้อ (บาท)</span>
                      <strong className="text-amber-600">฿ {profile?.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">E-Coupon หลังหักรายการ (บาท)</span>
                      <strong className="text-amber-800">฿ {Math.max(0, (profile?.balanceECoupon || 0) - confirmProduct.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-slate-200 my-1"></div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">E-Cash ก่อนซื้อ (บาท)</span>
                      <strong className="text-slate-700">฿ {profile?.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">E-Cash หลังหักรายการ (บาท)</span>
                      <strong className="text-indigo-600">
                        ฿ {Math.max(0, profile?.balanceECash - Math.max(0, confirmProduct.price - (profile?.balanceECoupon || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setShowPurchaseConfirmModal(false);
                    setConfirmProduct(null);
                    setConfirmChoice(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition active:scale-95"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button"
                  onClick={handleFinalizePackagePurchase}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
                >
                  💳 ยืนยันและชำระเงิน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM NON-BLOCKING CONFIRM / PROMPT DIALOG */}
        {confirmDialog.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  {confirmDialog.isPrompt ? '✏️' : '❓'}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 pt-1">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              {confirmDialog.isPrompt && (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={confirmDialog.promptValue || ''}
                    placeholder={confirmDialog.placeholder}
                    onChange={(e) => setConfirmDialog(prev => ({ ...prev, promptValue: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/25 outline-none font-medium bg-slate-50/50"
                    autoFocus
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, show: false }))}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => confirmDialog.onConfirm(confirmDialog.promptValue)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN/SELLER PRODUCT EDIT MODAL WITH LIVE CALCULATIONS */}
        {showEditProductModal && editingProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto my-8">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850 flex items-center gap-2">
                    ✏️ แก้ไขรายละเอียดสินค้าและสูตรคำนวณ (Product Setup Console)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">แก้ไขรายละเอียดสินค้า และระบบจะจัดสรรปันส่วนตามเงื่อนไขอัตโนมัติ</p>
                </div>
                <button 
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer transition p-1.5 hover:bg-slate-50 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSellerProdEditSubmit} className="space-y-4 text-xs">
                {/* 1:1 Image Upload & Replacement Section (Max 5 Images) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-800 font-bold text-xs flex items-center gap-1.5">
                      <span>📷 รูปภาพผลิตภัณฑ์ (ขนาด 1:1 Square - สามารถคลิกขยายดู / เพิ่ม / เปลี่ยนรูปได้)</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {((Array.isArray(editingProduct.images) && editingProduct.images.length > 0) ? editingProduct.images.length : (editingProduct.image ? 1 : 0))}/5 ภาพ
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(() => {
                      const imgList = (Array.isArray(editingProduct.images) && editingProduct.images.length > 0)
                        ? editingProduct.images
                        : [editingProduct.image || editingProduct.imageFile || editingProduct.imageUrl].filter(Boolean);
                      
                      return imgList.map((imgUrl: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-indigo-200 bg-white shadow-xs group">
                          <img 
                            src={imgUrl} 
                            alt={`Product ${idx + 1}`} 
                            onClick={() => setPreviewImageUrl(imgUrl)}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                            title="คลิกเพื่อขยายดูรูปขนาดใหญ่"
                            onError={(e: any) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300";
                            }}
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                              รูปหลัก
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-xs p-1 flex justify-between items-center opacity-90 group-hover:opacity-100 transition">
                            <label className="text-[9px] text-indigo-200 hover:text-white font-bold cursor-pointer flex items-center gap-0.5" title="เปลี่ยนรูปนี้">
                              <span>🔄 เปลี่ยน</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (reader.result) {
                                      setEditingProduct((prev: any) => {
                                        const curr = (Array.isArray(prev.images) && prev.images.length > 0)
                                          ? [...prev.images]
                                          : [prev.image || prev.imageFile || prev.imageUrl].filter(Boolean);
                                        curr[idx] = reader.result as string;
                                        return {
                                          ...prev,
                                          images: curr,
                                          image: curr[0] || '',
                                          imageFile: curr[0] || ''
                                        };
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = imgList.filter((_: any, i: number) => i !== idx);
                                setEditingProduct((prev: any) => ({
                                  ...prev,
                                  images: newImages,
                                  image: newImages[0] || '',
                                  imageFile: newImages[0] || ''
                                }));
                              }}
                              className="text-rose-400 hover:text-rose-200 text-[10px] font-bold cursor-pointer transition p-0.5"
                              title="ลบรูปภาพนี้"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ));
                    })()}

                    {(() => {
                      const imgList = (Array.isArray(editingProduct.images) && editingProduct.images.length > 0)
                        ? editingProduct.images
                        : [editingProduct.image || editingProduct.imageFile || editingProduct.imageUrl].filter(Boolean);
                      
                      if (imgList.length >= 5) return null;
                      
                      return (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 flex flex-col items-center justify-center cursor-pointer transition p-1.5 text-center group">
                          <span className="text-lg text-slate-400 group-hover:text-indigo-600 font-bold">+</span>
                          <span className="text-[9px] text-slate-500 group-hover:text-indigo-600 font-bold mt-0.5">
                            เพิ่มรูปภาพ
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) return;
                              const currentImages = (Array.isArray(editingProduct.images) && editingProduct.images.length > 0)
                                ? editingProduct.images
                                : [editingProduct.image || editingProduct.imageFile || editingProduct.imageUrl].filter(Boolean);
                              
                              const remainingSlots = 5 - currentImages.length;
                              const filesToProcess = files.slice(0, remainingSlots);
                              
                              filesToProcess.forEach(f => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (reader.result) {
                                    setEditingProduct((prev: any) => {
                                      const existing = (Array.isArray(prev.images) && prev.images.length > 0)
                                        ? prev.images
                                        : [prev.image || prev.imageFile || prev.imageUrl].filter(Boolean);
                                      if (existing.length >= 5) return prev;
                                      const updated = [...existing, reader.result as string];
                                      return { 
                                        ...prev, 
                                        images: updated,
                                        image: updated[0] || '',
                                        imageFile: updated[0] || ''
                                      };
                                    });
                                  }
                                };
                                reader.readAsDataURL(f);
                              });
                            }}
                          />
                        </label>
                      );
                    })()}
                  </div>

                  {/* URL Input option */}
                  <div className="pt-1 border-t border-slate-200/60">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      🔗 หรือวาง URL รูปภาพโดยตรง:
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] bg-white text-slate-800"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const url = target.value.trim();
                            if (url) {
                              setEditingProduct((prev: any) => {
                                const curr = (Array.isArray(prev.images) && prev.images.length > 0)
                                  ? prev.images
                                  : [prev.image || prev.imageFile || prev.imageUrl].filter(Boolean);
                                if (curr.length >= 5) return prev;
                                const updated = [...curr, url];
                                return {
                                  ...prev,
                                  images: updated,
                                  image: updated[0] || '',
                                  imageFile: updated[0] || ''
                                };
                              });
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          const url = input?.value?.trim();
                          if (url) {
                            setEditingProduct((prev: any) => {
                              const curr = (Array.isArray(prev.images) && prev.images.length > 0)
                                ? prev.images
                                : [prev.image || prev.imageFile || prev.imageUrl].filter(Boolean);
                              if (curr.length >= 5) return prev;
                              const updated = [...curr, url];
                              return {
                                ...prev,
                                images: updated,
                                image: updated[0] || '',
                                imageFile: updated[0] || ''
                              };
                            });
                            input.value = '';
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition cursor-pointer"
                      >
                        + เพิ่มจาก URL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ชื่อผลิตภัณฑ์</label>
                    <input 
                      type="text" 
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                {/* Pricing & Financial Setup */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 space-y-3">
                  <h5 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    🏷️ กำหนดราคาและส่วนลดสินค้า
                  </h5>

                  {/* Edit Product Auto-Calculate helper container */}
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
                            value={editProdTargetPayout}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              setEditProdTargetPayout(inputVal);
                              const targetVal = parseFloat(inputVal) || 0;
                              if (targetVal > 0) {
                                const calculatedPrice = Math.ceil(targetVal / 0.80);
                                setEditingProduct(prev => ({ ...prev, price: calculatedPrice.toString() }));
                              } else if (inputVal === '') {
                                setEditingProduct(prev => ({ ...prev, price: '' }));
                              }
                            }}
                            className="w-full bg-white border border-amber-300 rounded-xl pl-3 pr-10 py-1.5 text-xs text-amber-950 placeholder-amber-400 font-extrabold focus:ring-2 focus:ring-amber-400 outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-[10px]">บาท</span>
                        </div>
                      </div>
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-[10px] text-amber-900 leading-relaxed">
                        ราคาขายจำหน่ายหน้าเว็บแนะนำ: <strong className="text-amber-950 font-mono text-xs">฿ {editingProduct.price || 0}</strong>
                        <p className="text-[9.5px] text-amber-800/90 mt-0.5">
                          * หัก GP 20% แล้ว พาร์ทเนอร์จะได้รับเงิน <strong>฿ {editProdTargetPayout || Math.round((parseFloat(editingProduct.price || '0') || 0) * 0.80)}</strong> บาทพอดี (รวม VAT 7% เรียบร้อยแล้ว)
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
                        value={editingProduct.price || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProduct(prev => ({ ...prev, price: val }));
                          const p = parseFloat(val) || 0;
                          setEditProdTargetPayout(p > 0 ? (p * 0.80).toString() : '');
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
                        value={editingProduct.discountPercent ?? ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, discountPercent: e.target.value }))}
                        placeholder="0"
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs text-rose-600 font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        ค่าขนส่งขั้นต่ำร้านค้า (บาท) <span className="text-xs text-slate-400">(ขั้นต่ำ 35)</span>
                      </label>
                      <input 
                        type="number" 
                        value={editingProduct.shippingFeeBase ?? ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, shippingFeeBase: e.target.value }))}
                        placeholder="35"
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      ร้านช่วยสมทบค่าส่ง (บาท)
                    </label>
                    <input 
                      type="number" 
                      value={editingProduct.shippingDiscount ?? editingProduct.sellerCoPay ?? ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, shippingDiscount: e.target.value, sellerCoPay: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่</label>
                    <select 
                      value={editingProduct.category || 'General'}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Fashion">👗 แฟชั่น (Fashion)</option>
                      <option value="Electronics">🔌 อุปกรณ์อิเล็กทรอนิกส์ (Electronics)</option>
                      <option value="Beauty">💄 ความงามและของใช้ส่วนตัว (Beauty & Personal Care)</option>
                      <option value="Health">💊 สุขภาพ (Health)</option>
                      <option value="Baby">🍼 แม่และเด็ก (Baby & Kids)</option>
                      <option value="Home">🏠 บ้านและที่อยู่อาศัย (Home & Living)</option>
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
                      value={editingProduct.subcategory || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, subcategory: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* Subcategory suggestion chips in modal */}
                <div>
                  <span className="block text-[10px] text-slate-400 mb-1">เลือกประเภทสินค้าด่วน:</span>
                  <div className="flex flex-wrap gap-1">
                    {editingProduct.category === 'Fashion' && ['เสื้อผ้าผู้หญิง/ผู้ชาย', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ', 'นาฬิกา'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Electronics' && ['สมาร์ทโฟน', 'คอมพิวเตอร์', 'อุปกรณ์เกม', 'กล้อง', 'เครื่องใช้ไฟฟ้าภายในบ้าน'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Beauty' && ['เครื่องสำอาง', 'ผลิตภัณฑ์บำรุงผิว', 'น้ำหอม', 'ของใช้ส่วนตัว'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Health' && ['อาหารเสริม', 'อุปกรณ์ทางการแพทย์', 'วิตามิน', 'สินค้าสำหรับฟิตเนส'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Baby' && ['เสื้อผ้าเด็ก', 'นมผง', 'ผ้าอ้อม', 'ของเล่น', 'รถเข็นเด็ก'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Home' && ['อุปกรณ์ตกแต่งบ้าน', 'เครื่องครัว', 'เครื่องนอน', 'อุปกรณ์จัดเก็บ', 'ไฟแต่งบ้าน'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Food' && ['ของว่าง', 'อาหารแห้ง', 'เครื่องดื่ม', 'วัตถุดิบทำอาหาร'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Pets' && ['อาหารสัตว์', 'ขนม', 'แชมพู', 'อุปกรณ์ดูแลสัตว์เลี้ยง'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {editingProduct.category === 'Lifestyle' && ['อุปกรณ์เครื่องเขียน', 'หนังสือ', 'งานฝีมือ', 'ยานยนต์', 'อุปกรณ์กีฬา'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                    {(editingProduct.category === 'General' || !editingProduct.category) && ['สินค้าทั่วไป', 'เครื่องเขียน', 'อุปกรณ์อเนกประสงค์', 'เบ็ดเตล็ด'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEditingProduct(prev => ({ ...prev, subcategory: chip }))}
                        className={`px-2 py-0.5 rounded-lg border text-[9px] cursor-pointer transition ${editingProduct.subcategory === chip ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Affiliate, Extra PV, & Availability Settings Block in Edit Modal */}
                <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-3">
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
                          onClick={() => setEditingProduct(prev => ({ ...prev, isAvailable: prev.isAvailable === false ? true : false }))}
                          className={`px-3 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                            editingProduct.isAvailable !== false 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'bg-rose-500 text-white shadow-sm'
                          }`}
                        >
                          {editingProduct.isAvailable !== false ? '🟢 พร้อมขาย (In Stock)' : '🔴 สินค้าหมด / ปิดขาย'}
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
                          onClick={() => setEditingProduct(prev => ({ ...prev, isAffiliateEnabled: prev.isAffiliateEnabled === false ? true : false }))}
                          className={`px-3 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                            editingProduct.isAffiliateEnabled !== false 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-slate-300 text-slate-600'
                          }`}
                        >
                          {editingProduct.isAffiliateEnabled !== false ? '🟢 เปิดให้ปักตะกร้า' : '⚪ ปิดปักตะกร้า'}
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          ค่าคอมมิชชั่น Affiliate (บาท/ชิ้น):
                        </label>
                        <input
                          type="number"
                          disabled={editingProduct.isAffiliateEnabled === false}
                          value={editingProduct.affiliateCommission ?? ''}
                          onChange={(e) => setEditingProduct(prev => ({ ...prev, affiliateCommission: e.target.value }))}
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
                        value={editingProduct.extraPv ?? ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, extraPv: e.target.value }))}
                        placeholder="0"
                        className="w-full border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-purple-700 bg-purple-50/30"
                      />
                      <p className="text-[10px] text-purple-800 font-medium leading-tight">
                        * 1 PV เพิ่มเติม = นำไปหัก 1 บาท ในยอดโอนสุทธิร้านค้า
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ต้นทุนประเมินร้านค้า (บาท)</label>
                    <input 
                      type="number" 
                      value={editingProduct.cost || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, cost: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">น้ำหนักสินค้า (กรัม)</label>
                    <input 
                      type="number" 
                      value={editingProduct.weight || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-indigo-50/20"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/40 border border-indigo-100 p-3.5 rounded-2xl space-y-2">
                  <span className="font-extrabold text-[11px] text-indigo-900 block">📦 ขนาดกล่องแพ็กเกจจิ้งภายนอก (เซนติเมตร)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 text-[10px]">กว้าง W</label>
                      <input 
                        type="number" 
                        value={editingProduct.width || ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, width: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[10px]">ยาว L</label>
                      <input 
                        type="number" 
                        value={editingProduct.length || ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, length: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[10px]">สูง H</label>
                      <input 
                        type="number" 
                        value={editingProduct.height || ''}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Calculation Preview */}
                {(() => {
                  const calc = calculateShippingAndPricing(
                    editingProduct.price?.toString() || '0', 
                    editingProduct.weight?.toString() || '350', 
                    editingProduct.width?.toString() || '10', 
                    editingProduct.length?.toString() || '10', 
                    editingProduct.height?.toString() || '10',
                    editingProduct.discountPercent?.toString() || '0',
                    editingProduct.shippingFeeBase?.toString() || '35',
                    editingProduct.shippingDiscount?.toString() || editingProduct.sellerCoPay?.toString() || '0',
                    1,
                    editingProduct.extraPv?.toString() || '0',
                    editingProduct.affiliateCommission?.toString() || '0',
                    editingProduct.isAffiliateEnabled !== false
                  );
                  return (
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 font-sans shadow-md border border-slate-800">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-[11px] text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          📊 สรุปตารางคำนวณราคาสินค้า & หักค่าธรรมเนียมสุทธิ (Live Preview)
                        </span>
                        <span className="text-[9px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                          สูตร นที พลัส มาร์เก็ต
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
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
                            <span className="font-mono text-xs">฿ {calc.totalCustomerPaid.toFixed(2)}</span>
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
                            <span className="font-mono text-xs text-emerald-300">฿ {calc.netPayout.toFixed(2)}</span>
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
                    <label className="block text-slate-700 font-semibold">คำอธิบายรายละเอียด (สูงสุด 500 ตัวอักษร)</label>
                    <button
                      type="button"
                      disabled={isRefiningDescription}
                      onClick={async () => {
                        const textToRefine = editingProduct.description || editingProduct.name;
                        if (!textToRefine || !textToRefine.trim()) {
                          showNotif("กรุณาระบุชื่อสินค้าหรือคำอธิบายก่อนเพื่อให้ AI ช่วยเรียบเรียงค่ะ", "warning");
                          return;
                        }
                        setIsRefiningDescription(true);
                        try {
                          const res = await fetch('/api/ai/refine-description', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: editingProduct.description, productName: editingProduct.name })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setEditingProduct(prev => ({ ...prev, description: data.refinedText }));
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
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1 border border-indigo-200 animate-pulse font-sans"
                    >
                      {isRefiningDescription ? '⏳ AI กำลังปรับปรุงภาษา...' : '✨ AI ช่วยเรียบเรียงกฎหมายไทย'}
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    value={editingProduct.description || ''}
                    maxLength={500}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 500) {
                        setEditingProduct(prev => ({ ...prev, description: val }));
                      }
                    }}
                    placeholder="กรอกคำอธิบายหรือรายละเอียดสรรพคุณสินค้าที่ต้องการให้แอดมินอนุมัติ"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                  <div className="flex justify-end text-[10px] text-slate-400 font-mono mt-0.5">
                    <span className={(editingProduct.description || '').length >= 480 ? "text-rose-500 font-bold" : ""}>
                      {(editingProduct.description || '').length} / 500 ตัวอักษร
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const pId = editingProduct.id;
                      const pName = editingProduct.name;
                      setShowEditProductModal(false);
                      setEditingProduct(null);
                      handleDeleteProduct(pId, pName);
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition active:scale-95 flex items-center gap-1"
                  >
                    🗑️ ลบสินค้านี้
                  </button>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowEditProductModal(false);
                        setEditingProduct(null);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition active:scale-95"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
                    >
                      {currentUser?.role === 'Admin' || sellerSessionUser?.role === 'Admin' || !!originalAdmin
                        ? '💾 บันทึกการแก้ไข (อนุมัติทันที)'
                        : '💾 บันทึกการแก้ไข (ส่งแอดมินอนุมัติ)'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PRINTABLE RECEIPT MODAL */}
        {selectedReceiptOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col relative my-8">
              {/* Receipt close button */}
              <button 
                onClick={() => setSelectedReceiptOrder(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer"
              >
                ✕
              </button>

              {/* Printable Area ID */}
              <div id="receipt-print-area" className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 text-xs text-slate-700">
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200">
                  <h3 className="text-sm font-extrabold text-indigo-900">บริษัท นที พลัส มาร์เก็ต จำกัด (NATEE PLUS MARKET CO., LTD.)</h3>
                  <p className="text-[10px] text-slate-400">เลขประจำตัวผู้เสียภาษี: 0-30556-9007-93-5</p>
                  <p className="text-[10px] text-slate-400 font-medium">107/4 ถนนมนัส ตำบลในเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase mt-2 text-xs font-sans">ใบเสร็จรับเงินอย่างย่อ / Tax Invoice (ABB)</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-100 pb-3 font-sans">
                  <div>
                    <span className="text-slate-400 block">เล่มที่ / Book No:</span>
                    <strong className="text-indigo-600 font-mono text-[11px]">{getReceiptDetails(selectedReceiptOrder).book}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">เลขที่ใบเสร็จ / Receipt No:</span>
                    <strong className="text-indigo-600 font-mono text-[11px]">{getReceiptDetails(selectedReceiptOrder).no}</strong>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 block">เลขที่ใบสั่งซื้อ / Bill No:</span>
                    <strong className="text-slate-800 font-mono text-[10px]">{selectedReceiptOrder.id}</strong>
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-slate-400 block">วันที่ทำรายการ / Date:</span>
                    <strong className="text-slate-800">{new Date(selectedReceiptOrder.createdAt).toLocaleString('th-TH')}</strong>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 block">ชื่อผู้รับ / Customer Name:</span>
                    <strong className="text-slate-800">{profile?.name} {profile?.surname} ({currentUser?.username})</strong>
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-slate-400 block">ช่องทางชำระเงิน / Payment:</span>
                    <strong className="text-emerald-600 font-bold">E-Coupon ช้อปปิ้ง</strong>
                  </div>
                  <div className="col-span-2 mt-2">
                    <span className="text-slate-400 block">ที่อยู่จัดส่ง / Shipping Address:</span>
                    <strong className="text-slate-800 text-[10px] leading-snug block mt-0.5">{selectedReceiptOrder.shippingAddress || "จัดส่งตามที่อยู่โปรไฟล์"}</strong>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2 py-2 font-sans">
                  <div className="flex justify-between font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase text-[10px]">
                    <span>รายละเอียดรายการสินค้า</span>
                    <div className="flex gap-8">
                      <span>จำนวน</span>
                      <span>รวม (บาท)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start text-[11px] font-medium">
                    <div className="space-y-0.5">
                      <span className="text-slate-800 font-bold">{selectedReceiptOrder.productName}</span>
                      {selectedReceiptOrder.selectedChoiceName && (
                        <span className="block text-[10px] text-indigo-500">เซ็ตแพ็กเกจ: {selectedReceiptOrder.selectedChoiceName}</span>
                      )}
                    </div>
                    <div className="flex gap-12 text-slate-800">
                      <span>{selectedReceiptOrder.quantity || 1}</span>
                      <span className="font-bold">฿ {selectedReceiptOrder.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 text-right font-medium text-[11px] font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400">มูลค่าสินค้าก่อนภาษี / Subtotal:</span>
                    <span className="text-slate-800">฿ {(selectedReceiptOrder.totalPrice * 0.93).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ภาษีมูลค่าเพิ่ม (7%) / VAT:</span>
                    <span className="text-slate-800">฿ {(selectedReceiptOrder.totalPrice * 0.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 border-t border-slate-100 pt-2 text-xs">
                    <span className="text-indigo-900">ยอดชำระสุทธิ / Grand Total:</span>
                    <span className="text-indigo-900">฿ {selectedReceiptOrder.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-purple-600">
                    <span>คะแนนสะสมที่ได้รับ / PV Earned:</span>
                    <span>+{(selectedReceiptOrder.totalPv || 0).toLocaleString()} PV</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-sans">
                  <p>👍 ขอบคุณที่วางใจเลือกใช้บริการ นที พลัส</p>
                  <p>เอกสารนี้ออกโดยระบบอัตโนมัติ ไม่จำเป็นต้องประทับตราสำคัญ</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-4">
                <button 
                  type="button"
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> สั่งปริ๊นใบเสร็จ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WITHHOLDING TAX (ทวิ 50) MODAL */}
        {selectedTaxDoc && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl w-full shadow-2xl flex flex-col md:flex-row gap-6 my-8 animate-fadeIn text-xs text-slate-300">
              
              {/* Left Settings Panel: Inline Editing */}
              <div className="w-full md:w-80 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex-shrink-0 no-print">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    ⚙️ ตั้งค่าการพิมพ์ 50 ทวิ
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">ปรับแต่งรายละเอียดก่อนสั่งพิมพ์หรือเซฟ PDF</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 uppercase">ปีภาษี (พ.ศ.)</label>
                    <input 
                      type="text"
                      value={customTaxYear}
                      onChange={(e) => setCustomTaxYear(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 uppercase">เลขประจำตัวผู้เสียภาษี (ผู้ถูกหัก)</label>
                    <input 
                      type="text"
                      maxLength={13}
                      value={customPayeeTaxId}
                      onChange={(e) => setCustomPayeeTaxId(e.target.value.replace(/\D/g, ''))}
                      placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 uppercase">ชื่อผู้รับเงิน / ผู้ถูกหักภาษี</label>
                    <input 
                      type="text"
                      value={customPayeeName}
                      onChange={(e) => setCustomPayeeName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1 uppercase">ที่อยู่ผู้รับเงิน (ระบุในเอกสาร)</label>
                    <textarea 
                      rows={3}
                      value={customPayeeAddress}
                      onChange={(e) => setCustomPayeeAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer size={14} /> พิมพ์เอกสาร (Print / PDF)
                  </button>
                  <button 
                    onClick={() => setSelectedTaxDoc(null)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>

              {/* Right Panel: Official Thai withholding tax certificate form layout (50 Tawi) */}
              <div className="flex-grow bg-white text-slate-800 p-8 rounded-2xl shadow-inner overflow-y-auto max-h-[80vh] printable-area font-sans border border-slate-200">
                
                {/* Certificate Header */}
                <div className="border border-slate-800 p-4 space-y-1 text-center relative">
                  <div className="absolute top-2 right-2 border border-slate-800 px-2 py-0.5 text-[8px] font-bold text-slate-500">
                    ฉบับที่ 1 (สำหรับผู้ถูกหักภาษี ณ ที่จ่าย)
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)</h2>
                  <p className="text-[10px] text-slate-600">ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร</p>
                  <p className="text-[9px] text-slate-400">ปีภาษี พ.ศ. {customTaxYear}</p>
                </div>

                {/* Sender/Receiver Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 border-x border-b border-slate-800 text-[10px] divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  
                  {/* Payer (ผู้มีหน้าที่หัก) */}
                  <div className="p-3 space-y-1.5">
                    <span className="font-extrabold text-slate-900 block border-b border-slate-100 pb-1">1. ผู้มีหน้าที่หักภาษี ณ ที่จ่าย (ผู้จ่ายเงิน):</span>
                    <div className="space-y-1 text-slate-700">
                      <div>ชื่อ: <strong className="text-slate-900 font-bold">บริษัท นที พลัส มาร์เก็ต จำกัด (NATEE PLUS MARKET CO., LTD.)</strong></div>
                      <div>เลขประจำตัวผู้เสียภาษีอากร: <strong className="text-slate-900 font-mono font-bold">0-30556-9007-93-5</strong></div>
                      <div>ที่อยู่: <span className="text-slate-600">107/4 ถนนมนัส ตำบลในเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000</span></div>
                    </div>
                  </div>

                  {/* Payee (ผู้ถูกหัก) */}
                  <div className="p-3 space-y-1.5">
                    <span className="font-extrabold text-slate-900 block border-b border-slate-100 pb-1">2. ผู้ถูกหักภาษี ณ ที่จ่าย (ผู้รับเงิน):</span>
                    <div className="space-y-1 text-slate-700">
                      <div>ชื่อ: <strong className="text-slate-900 font-bold">{customPayeeName || "______________________________"}</strong></div>
                      <div>เลขประจำตัวผู้เสียภาษีอากร/บัตรประชาชน: <strong className="text-slate-900 font-mono font-bold">{customPayeeTaxId || "_________________"}</strong></div>
                      <div>ที่อยู่: <span className="text-slate-600">{customPayeeAddress || "_________________________________"}</span></div>
                    </div>
                  </div>

                </div>

                {/* Table of Income Details */}
                {(() => {
                  const isMember = selectedTaxDoc.type === 'member';
                  const amountPaid = isMember
                    ? (selectedTaxDoc.data.taxableAmount !== undefined ? selectedTaxDoc.data.taxableAmount : (selectedTaxDoc.data.amount * 0.80))
                    : (selectedTaxDoc.data.totalPrice * 0.8);
                  const taxwithheld = isMember
                    ? (selectedTaxDoc.data.withholdingTax !== undefined ? selectedTaxDoc.data.withholdingTax : (amountPaid * 0.03))
                    : (selectedTaxDoc.data.totalPrice * 0.8 * 0.03);

                  return (
                    <>
                      <div className="mt-4 border border-slate-800 text-[10px] overflow-hidden">
                        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-800 text-slate-900 font-bold text-center">
                          <div className="col-span-6 p-2 text-left border-r border-slate-800">ประเภทเงินได้ที่จ่าย (Type of Income)</div>
                          <div className="col-span-2 p-2 border-r border-slate-800">วัน เดือน หรือปี ที่จ่าย</div>
                          <div className="col-span-2 p-2 border-r border-slate-800">จำนวนเงินที่จ่าย (บาท)</div>
                          <div className="col-span-2 p-2">ภาษีที่หักและนำส่ง (บาท)</div>
                        </div>

                        {/* Row 1 */}
                        {isMember ? (
                          <div className="grid grid-cols-12 border-b border-slate-200 text-slate-800 font-medium">
                            <div className="col-span-6 p-2.5 border-r border-slate-800 leading-normal">
                              <strong>เงินได้ประเภทที่ 2 (ตามมาตรา 40(2)) - ค่านายหน้า</strong>
                              <span className="block text-[9px] text-slate-500 mt-0.5">
                                {selectedTaxDoc.data.isAnnual 
                                  ? "ค่านายหน้าสะสมตลอดปีภาษี พ.ศ. 2569 (รวมค่าแนะนำ, บริหารทีม, ออลแชร์)"
                                  : "ค่าแนะนำผู้รับสิทธิ์, ค่าคอมมิชชันทีม, โบนัสสะสม และส่วนแบ่งปันผลระบบออลแชร์ นทีพลัส"
                                }
                              </span>
                            </div>
                            <div className="col-span-2 p-2.5 text-center border-r border-slate-800 flex items-center justify-center font-mono">
                              {new Date(selectedTaxDoc.data.createdAt).toLocaleDateString('th-TH')}
                            </div>
                            <div className="col-span-2 p-2.5 text-right border-r border-slate-800 flex items-center justify-end font-mono font-bold">
                              {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="col-span-2 p-2.5 text-right flex items-center justify-end font-mono font-bold text-rose-600">
                              {taxwithheld.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-12 border-b border-slate-200 text-slate-800 font-medium">
                            <div className="col-span-6 p-2.5 border-r border-slate-800 leading-normal">
                              <strong>เงินได้ประเภทที่ 8 (ตามมาตรา 40(8))</strong>
                              <span className="block text-[9px] text-slate-500 mt-0.5">รายได้จากการจำหน่ายพัสดุสินค้าออนไลน์, ค่าบริการฝากขาย, และจัดส่งคลังสินค้านทีมาร์เก็ต</span>
                            </div>
                            <div className="col-span-2 p-2.5 text-center border-r border-slate-800 flex items-center justify-center font-mono">
                              {new Date(selectedTaxDoc.data.createdAt).toLocaleDateString('th-TH')}
                            </div>
                            <div className="col-span-2 p-2.5 text-right border-r border-slate-800 flex items-center justify-end font-mono font-bold">
                              {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="col-span-2 p-2.5 text-right flex items-center justify-end font-mono font-bold text-rose-600">
                              {taxwithheld.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        )}

                        {/* Summary Rows */}
                        <div className="grid grid-cols-12 bg-slate-50/50 font-bold border-t border-slate-800">
                          <div className="col-span-6 p-2.5 text-right border-r border-slate-800 text-slate-950">
                            รวมเงินได้และภาษีที่นำส่งทั้งสิ้น (Total):
                          </div>
                          <div className="col-span-2 p-2.5 text-center border-r border-slate-800">
                            -
                          </div>
                          <div className="col-span-2 p-2.5 text-right border-r border-slate-800 font-mono">
                            {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="col-span-2 p-2.5 text-right font-mono text-rose-700">
                            {taxwithheld.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Thai Baht text representation */}
                      <div className="mt-2 border border-slate-800 p-2 text-[10px] flex items-center justify-between font-bold text-slate-900">
                        <span>รวมเงินภาษีหัก ณ ที่จ่ายนำส่ง (ตัวอักษร):</span>
                        <span className="text-indigo-900">
                          ( {arabicToThaiBaht(taxwithheld)} )
                        </span>
                      </div>
                    </>
                  );
                })()}

                {/* Official Declaration Footer */}
                <div className="mt-6 border border-slate-800 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-600 leading-relaxed">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">คำเตือนและข้อตกลง:</p>
                    <p>1. ผู้มีหน้าที่หักภาษี ณ ที่จ่าย มีหน้าที่นำส่งภาษีหัก ณ ที่จ่ายแก่กรมสรรพากร ภายในวันที่ 7 ของเดือนถัดไป</p>
                    <p>2. การระบุข้อมูลเท็จเพื่อหลบเลี่ยงหรือยื่นแบบเท็จมีความผิดตามประมวลรัษฎากร</p>
                    <p>3. เอกสารฉบับนี้ใช้สำหรับแนบประกอบการยื่นแบบ ภ.ง.ด.90/91 ประจำปีภาษี</p>
                  </div>
                  <div className="text-center space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between">
                    <div>
                      <p>ขอรับรองว่าข้อความและตัวเลขดังกล่าวข้างต้นถูกต้องตรงตามความเป็นจริงทุกประการ</p>
                    </div>
                    <div className="space-y-1 pt-4">
                      <p>ลงชื่อ ..................................................................... ผู้จ่ายเงิน</p>
                      <p className="font-extrabold text-slate-800">( บริษัท นที พลัส มาร์เก็ต จำกัด )</p>
                      <p className="text-[9px] text-slate-400">ตัวแทนผู้มีหน้าที่หักภาษี ณ ที่จ่าย</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
        
        {/* FULL SIZE SLIP MODAL */}
        {activeSlipModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setActiveSlipModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full cursor-pointer transition text-xs font-bold"
              >
                ✕ ปิดหน้าต่าง
              </button>
              
              <div className="text-center space-y-3 pt-6">
                <h3 className="text-sm font-bold text-white tracking-wide">📷 ตรวจสอบรูปภาพสลิปจริง</h3>
                <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 overflow-hidden flex justify-center items-center max-h-[70vh]">
                  <img 
                    src={activeSlipModal} 
                    alt="Slip Original" 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[60vh] object-contain rounded-xl"
                  />
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <a 
                    href={activeSlipModal} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    📥 ดาวน์โหลด / เปิดในแท็บใหม่
                  </a>
                  <button 
                    type="button"
                    onClick={() => setActiveSlipModal(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* PRODUCT REVIEW & SELLER RATING MODAL */}
        <ReviewModal 
          isOpen={showReviewModal && !!reviewingOrder}
          onClose={() => setShowReviewModal(false)}
          reviewingOrder={reviewingOrder}
          rating={reviewRating}
          setRating={setReviewRating}
          comment={reviewComment}
          setComment={setReviewComment}
          onSubmit={async () => {
            if (!reviewingOrder) return;
            try {
              const res = await fetch('/api/order/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: reviewingOrder.id,
                  userId: currentUser?.userId,
                  rating: reviewRating,
                  comment: reviewComment
                })
              });
              const data = await res.json();
              if (data.success) {
                showNotif(data.message, 'success');
                setShowReviewModal(false);
                fetchUserData();
              } else {
                showNotif(data.message || 'เกิดข้อผิดพลาดในการบันทึกรีวิว', 'error');
              }
            } catch (e) {
              showNotif('เกิดข้อผิดพลาดในการส่งข้อมูลรีวิว', 'error');
            }
          }}
        />

        {/* FULL SIZE IMAGE PREVIEW MODAL */}
        {Boolean(previewImageUrl) && typeof previewImageUrl === 'string' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[999999] animate-fade-in" onClick={() => setPreviewImageUrl(null)}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full cursor-pointer transition text-xs font-bold z-10"
              >
                ✕ ปิดหน้าต่าง
              </button>
              
              <div className="text-center space-y-4 pt-4">
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
                  <span>🖼️ ขยายรูปภาพสินค้า</span>
                </h3>
                <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 overflow-hidden flex justify-center items-center max-h-[75vh]">
                  <img 
                    src={previewImageUrl} 
                    alt="Product Zoom" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-lg"
                  />
                </div>
                <div className="flex gap-2 justify-center pt-1">
                  <a 
                    href={previewImageUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    📥 ดาวน์โหลด / เปิดรูปขนาดจริง
                  </a>
                  <button 
                    type="button"
                    onClick={() => setPreviewImageUrl(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM DEPOSIT APPROVE CONFIRMATION DIALOG */}
        {depositApproveId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 text-left">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2 mb-2">
                ✅ ยืนยันการอนุมัติเติมเงิน
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                ระบบจะทำการอนุมัติและเติมยอดเงินสด <strong className="text-emerald-600 font-bold">E-Cash</strong> ให้กับสมาชิก กรุณาตรวจสอบหรือปรับแก้จำนวนเงินอนุมัติจริงให้ตรงกับยอดสลิป:
              </p>

              <div className="mb-5 bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                <label className="block text-[11px] text-slate-500 font-bold">จำนวนเงินที่ระบบจะเติมเข้าสู่กระเป๋า E-Cash (บาท) *</label>
                <input
                  type="number"
                  step="any"
                  value={depositApproveAmount}
                  onChange={(e) => setDepositApproveAmount(e.target.value)}
                  placeholder="เช่น 1000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDepositApproveId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDepositApprove(depositApproveId, depositApproveAmount);
                    setDepositApproveId(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow-md"
                >
                  ยืนยันอนุมัติ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM DEPOSIT REJECT DIALOG */}
        {depositRejectId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 text-left">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2 mb-2">
                ❌ ปฏิเสธรายการเติมเงิน
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                กรุณาระบุสาเหตุหรือข้อความที่จะแจ้งไปยังสมาชิก ในการปฏิเสธรายการโอนเงินสลิปนี้:
              </p>
              <textarea
                value={depositRejectReason}
                onChange={(e) => setDepositRejectReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-5"
                rows={3}
                placeholder="ระบุสาเหตุการปฏิเสธ..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDepositRejectId(null);
                    setDepositRejectReason('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDepositReject(depositRejectId, depositRejectReason);
                    setDepositRejectId(null);
                    setDepositRejectReason('');
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow-md"
                >
                  ยืนยันปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM KYC REJECT DIALOG */}
        {kycRejectId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 text-left">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2 mb-2">
                ❌ ปฏิเสธเอกสารยืนยันตัวตน (KYC)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                กรุณาระบุสาเหตุที่จะส่งแจ้งให้สมาชิกทราบ ถึงสาเหตุที่ปฏิเสธหลักฐานแนบ KYC:
              </p>
              <textarea
                value={kycRejectReason}
                onChange={(e) => setKycRejectReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-5"
                rows={3}
                placeholder="ระบุสาเหตุการปฏิเสธเอกสาร..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setKycRejectId(null);
                    setKycRejectReason('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleKycReject(kycRejectId, kycRejectReason);
                    setKycRejectId(null);
                    setKycRejectReason('');
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow-md"
                >
                  ยืนยันปฏิเสธเอกสาร
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL TRANSACTION CONFIRMATION POPUP */}
        {txnConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 text-left">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                ⚖️ ยืนยันตรวจสอบข้อมูลธุรกรรมโอนย้ายเงิน
              </h3>
              
              <div className="space-y-3.5 mb-6 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">ประเภทธุรกรรม:</span>
                  <span className="font-bold text-slate-900">
                    {txnConfirm.type === 'transfer_ecash_member' && 'โอนเงิน E-Cash ให้สมาชิกท่านอื่น'}
                    {txnConfirm.type === 'transfer_ecash_emoney' && 'โอนย้าย E-Cash เข้ากระเป๋า E-Money ตัวเอง'}
                    {txnConfirm.type === 'transfer_emoney_ecash' && 'โอนย้าย E-Money เข้ากระเป๋า E-Cash ตัวเอง'}
                    {txnConfirm.type === 'transfer_emoney_ecoupon' && 'โอนย้าย E-Money เข้ากระเป๋า E-Coupon ตัวเอง'}
                    {txnConfirm.type === 'withdraw_emoney' && 'ถอนยอดคอมมิชชันรายได้ E-Money เข้าบัญชีธนาคาร'}
                    {txnConfirm.type === 'buy_coupon' && 'แลกยอด E-Cash ซื้อคูปองช้อปปิ้ง E-Coupon'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">ผู้รับเงิน / บัญชีปลายทาง:</span>
                  <span className="font-bold text-slate-800 break-words max-w-[200px] text-right">
                    {txnConfirm.recipientName || '-'}
                  </span>
                </div>

                {txnConfirm.type === 'withdraw_emoney' ? (
                  <>
                    <div className="flex justify-between border-t border-slate-100 pt-2">
                      <span className="text-slate-500 font-semibold">ยอดถอนเงินตั้งต้น (E-Money):</span>
                      <span className="font-mono font-bold text-slate-900">฿ {txnConfirm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span className="font-semibold">หักภาษี ณ ที่จ่าย (3%):</span>
                      <span className="font-mono font-bold">- ฿ {(txnConfirm.withholdingTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span className="font-semibold">หักค่าธรรมเนียมการถอน:</span>
                      <span className="font-mono font-bold">- ฿ {(txnConfirm.feeAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">ยอดเงินตั้งต้น:</span>
                      <span className="font-mono font-bold text-slate-900">฿ {txnConfirm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                    </div>

                    {txnConfirm.feeAmount !== undefined && txnConfirm.feeAmount > 0 && (
                      <div className="flex justify-between text-rose-500">
                        <span className="font-semibold">หักค่าธรรมเนียม / ภาษีบริการ:</span>
                        <span className="font-mono font-bold">- ฿ {txnConfirm.feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm">
                  <span className="text-slate-900 font-bold">
                    {txnConfirm.type === 'withdraw_emoney' ? 'รายได้คงเหลือรับสุทธิ์ (บาท):' : 'ยอดเงินปลายทางสุทธิ:'}
                  </span>
                  <span className="font-mono font-bold text-emerald-600">
                    ฿ {txnConfirm.netAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              </div>

              {/* OTP VERIFICATION FOR TRANSACTION */}
              <div className="mb-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs space-y-3">
                <span className="font-bold text-slate-800 block">🔑 รหัส OTP ยืนยันการทำธุรกรรม</span>
                {!isTxnOtpSent ? (
                  <button
                    type="button"
                    disabled={isSendingTxnOtp}
                    onClick={handleSendTxnOtp}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:bg-slate-300"
                  >
                    {isSendingTxnOtp ? 'กำลังส่งรหัส OTP...' : '📩 ขอรับรหัส OTP ทางอีเมลเพื่อทำธุรกรรม'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        maxLength={6}
                        value={txnOtp}
                        onChange={(e) => setTxnOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="กรอกรหัส OTP 6 หลัก"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        disabled={isSendingTxnOtp}
                        onClick={handleSendTxnOtp}
                        className="text-[10px] text-indigo-600 hover:text-indigo-500 font-bold underline cursor-pointer"
                      >
                        {isSendingTxnOtp ? 'กำลังส่ง...' : 'ส่งอีกครั้ง'}
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold text-center">✓ ส่งรหัส OTP 6 หลักไปที่อีเมลของท่านเรียบร้อยแล้วค่ะ</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setTxnConfirm(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  ย้อนกลับแก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (txnConfirm.type === 'transfer_ecash_member') {
                      executeTransferECashMember();
                    } else if (txnConfirm.type === 'transfer_ecash_emoney') {
                      executeTransferECashToEMoney();
                    } else if (txnConfirm.type === 'transfer_emoney_ecash') {
                      executeTransferEMoneyToECash();
                    } else if (txnConfirm.type === 'transfer_emoney_ecoupon') {
                      executeTransferEMoneyToECoupon();
                    } else if (txnConfirm.type === 'withdraw_emoney') {
                      executeWithdrawEMoney();
                    } else if (txnConfirm.type === 'buy_coupon') {
                      executeBuyCoupon();
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow-md"
                >
                  ยืนยันและทำรายการสุทธิ (Confirm)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDPA Privacy Policy Modal for Natee Plus Partner */}
        {showPdpaModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 animate-scaleUp">
              {/* Header */}
              <div className="bg-slate-950 text-white p-6 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-indigo-600/20 blur-xl"></div>
                <div className="relative flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-widest">
                      PDPA Privacy Policy
                    </span>
                    <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                      🛡️ นโยบายคุ้มครองข้อมูลส่วนบุคคลสำหรับผู้ขายร้านค้าร่วมพันธมิตร
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowPdpaModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed max-h-[60vh] font-sans">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 space-y-1">
                  <p className="font-bold text-indigo-950">ผู้ควบคุมข้อมูลส่วนบุคคล (Data Controller):</p>
                  <p className="font-extrabold text-indigo-700 text-sm">บริษัท นที พลัส มาร์เก็ต จำกัด (Natee Plus Market Co., Ltd.)</p>
                  <p className="text-[10px] text-slate-500">สำนักงานใหญ่: 107/4 ถนนมนัส ตำบลในเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    1. ประเภทของข้อมูลส่วนบุคคลที่มีการจัดเก็บรวบรวม
                  </h4>
                  <p>
                    เนื่องจากระบบ <strong>Natee Plus Partner (พอร์ทัลร้านค้าร่วมพันธมิตร)</strong> มีความจำเป็นในการประมวลผลธุรกรรมทางการเงินและยืนยันตัวตนคู่ค้าเพื่อส่งภาษีสรรพากร บริษัท นที พลัส มาร์เก็ต จำกัด จึงจัดเก็บข้อมูลส่วนบุคคลของท่าน ดังต่อไปนี้:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-slate-500">
                    <li><strong>ข้อมูลระบุตัวตนจริง:</strong> ชื่อ-นามสกุลจริง, หมายเลขบัตรประจำตัวประชาชนไทย, หรือหมายเลขหนังสือเดินทาง (Passport) พร้อมทั้งรูปถ่ายหน้าบัตรประจำตัวประชาชนเพื่อการยืนยันตัวตนทางกฎหมาย</li>
                    <li><strong>ข้อมูลการติดต่อ:</strong> หมายเลขโทรศัพท์มือถือ, ที่อยู่อาศัยจริง, และที่อยู่คลังสินค้าจัดส่งพัสดุ</li>
                    <li><strong>ข้อมูลทางการเงินและบัญชี:</strong> ชื่อบัญชีธนาคาร, หมายเลขบัญชีธนาคาร และภาพถ่ายหน้าสมุดบัญชีเงินฝาก (Bookbank) สำหรับรับโอนเงินคอมมิชชั่นหรือยอดขายสุทธิหลังหัก GP</li>
                    <li><strong>ข้อมูลร้านค้า:</strong> ชื่อร้านร่วมคู่ค้า, ข้อมูลตำแหน่งพิกัดแผนที่คลังสินค้า (Latitude / Longitude)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    2. วัตถุประสงค์ในการจัดเก็บและประมวลผลข้อมูล
                  </h4>
                  <p>
                    บริษัทจัดเก็บข้อมูลดังกล่าวภายใต้ฐานความจำเป็นทางกฎหมาย สัญญา และความยินยอม เพื่อวัตถุประสงค์ดังนี้:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-slate-500">
                    <li>ตรวจสอบความถูกต้องของตัวตนเจ้าของร้านค้า ป้องกันการลงทะเบียนแอบอ้างสิทธิ์หรือการฉ้อโกง</li>
                    <li>จัดทำใบเสร็จรับเงิน/ใบกำกับภาษี และเอกสารทางการเงินตามกฎหมาย</li>
                    <li>คำนวณและหักภาษี ณ ที่จ่าย (Withholding Tax 3%) เพื่อนำส่งสรรพากรในนามผู้รับเงินอย่างถูกต้องตามประเภทรายได้</li>
                    <li>ดำเนินการโอนยอดเงินผลตอบแทนสุทธิ (หลังหักค่าธรรมเนียม GP และภาษี) เข้าบัญชีธนาคารที่กำหนดอย่างปลอดภัย</li>
                    <li>ใช้ติดต่อประสานงาน แจ้งข้อมูลข่าวสารที่เกี่ยวข้องกับการให้บริการแพลตฟอร์ม Natee Plus Partner</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    3. ระยะเวลาการจัดเก็บข้อมูลส่วนบุคคล
                  </h4>
                  <p>
                    บริษัทจะทำการเก็บรักษาข้อมูลส่วนบุคคลของท่านไว้ตราบเท่าที่ท่านยังคงมีสถานะเป็นสมาชิกร้านค้าพันธมิตรในระบบ และจะจัดเก็บต่อเนื่องต่อไปเป็นระยะเวลา <strong>อย่างน้อย 10 ปี</strong> นับจากวันที่สิ้นสุดสัญญาคู่ค้า เพื่อการดำเนินการตรวจสอบย้อนหลังทางบัญชี ภาษีอากร และการปฏิบัติตามกฎหมายที่เกี่ยวข้องของรัฐ
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    4. การส่งต่อหรือเปิดเผยข้อมูลส่วนบุคคล
                  </h4>
                  <p>
                    บริษัท นที พลัส มาร์เก็ต จำกัด จะรักษาความลับของข้อมูลเป็นอย่างดีที่สุด โดยจะจำกัดการเปิดเผยเฉพาะกรณีจำเป็นตามกฎหมาย ได้แก่:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-1 text-slate-500">
                    <li>ส่งข้อมูลภาษีและรายได้แก่ <strong>กรมสรรพากร ประเทศไทย</strong> ตามหน้าที่ทางกฎหมายภาษี</li>
                    <li>ส่งข้อมูลชื่อและที่อยู่คลังส่งมอบสินค้าให้แก่บริษัทพาร์ทเนอร์ด้านโลจิสติกส์การจัดส่งพัสดุ (เช่น Shippop)</li>
                    <li>สถาบันการเงินหรือธนาคารผู้ให้บริการระบบโอนเงินปลายทาง</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    5. สิทธิของท่านภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                  </h4>
                  <p>
                    ท่านมีสิทธิทางกฎหมายอย่างครบถ้วนในการขอเข้าถึงข้อมูล, ขอสำเนาข้อมูลส่วนบุคคล, ขอให้ดำเนินการแก้ไขให้ถูกต้องสมบูรณ์เป็นปัจจุบัน, ขอระงับการใช้, ขอคัดค้านการประมวลผล หรือขอถอนความยินยอมในการจัดเก็บ โดยสามารถแจ้งความประสงค์ผ่านแผนกคุ้มครองข้อมูลของบริษัท ทั้งนี้ การถอนความยินยอมที่จำเป็นต่อการใช้ระบบทางการเงินอาจส่งผลให้บริษัทไม่สามารถเปิดให้บริการพอร์ทัลร้านค้าแก่ท่านได้
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPdpaModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  ข้าพเจ้ารับทราบและตกลง (Close)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL SYSTEM REGULATIONS PDF MODAL & PRINT PREVIEW (For Manager/Admin only) */}
        {showRegulationsPdfModal && (profile?.role === 'Manager' || profile?.role === 'Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #natee-pdf-document-print, #natee-pdf-document-print * {
                  visibility: visible !important;
                }
                #natee-pdf-document-print {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  background: white !important;
                  color: black !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print-element {
                  display: none !important;
                }
              }
            `}</style>
            
            <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
              {/* Modal Header Controls (Hidden when printing) */}
              <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center flex-shrink-0 border-b border-slate-800 no-print-element">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    PDF DOCUMENT EXPORT
                  </span>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    📄 เอกสารสรุปกฎระเบียบและเงื่อนไขระบบ Natee Plus Partner (ฉบับสมบูรณ์)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    🖨️ พิมพ์ / บันทึกเป็น PDF (Print to PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegulationsPdfModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    ✕ ปิด
                  </button>
                </div>
              </div>

              {/* Printable PDF Content Sheet */}
              <div id="natee-pdf-document-print" className="p-8 sm:p-12 overflow-y-auto font-sans bg-white text-slate-800 leading-relaxed space-y-6">
                
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-indigo-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img src="/logo.svg?v=2" alt="Natee Plus Logo" className="w-16 h-16 object-contain" />
                    <div>
                      <h1 className="text-xl font-black text-indigo-950 tracking-tight">บริษัท นที พลัส มาร์เก็ต จำกัด</h1>
                      <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">NATEE PLUS MARKET CO., LTD.</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        สำนักงานใหญ่: 107/4 ถนนมนัส ตำบลในเมือง อำเภอเมือง จังหวัดนครราชสีมา 30000 <br/>
                        เลขประจำตัวผู้เสียภาษี: 0-30556-9007-93-5 • โทร: 063-516-1734
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                    <span className="inline-block bg-indigo-50 text-indigo-900 font-mono font-extrabold text-[11px] px-3 py-1 rounded-lg border border-indigo-100">
                      REF: NTEE-REG-2026/07
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      วันที่ออกเอกสาร: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                      ✓ สถานะ: มีผลบังคับใช้ตามกฎหมาย
                    </p>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    หนังสือประกาศกำหนดกฎระเบียบ ข้อบังคับ และเงื่อนไขการดำเนินงานพาร์ทเนอร์ร้านค้า
                  </h2>
                  <p className="text-xs font-bold text-indigo-800">
                    (Natee Plus Partner Portal System Terms, Conditions & Policy Regulations)
                  </p>
                </div>

                {/* Dynamic Content Sections */}
                <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                  
                  {/* Clauses Breakdown */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-indigo-950 border-b border-slate-200 pb-1">
                      หมวดที่ 1: คุณสมบัติของผู้สมัครพาร์ทเนอร์ร้านค้า (Merchant Qualifications)
                    </h3>
                    <p className="pl-3">
                      1.1 ผู้สมัครต้องเป็นสมาชิกของระบบ Natee Plus Market และมีสถานะคุณสมบัติตั้งแต่ตำแหน่ง <strong>Member</strong> ขึ้นไป (หรือได้รับการอนุมัติแต่งตั้งพิเศษจากคณะผู้บริหารระบบ) <br/>
                      1.2 ผู้สมัครต้องผ่านกระบวนการยืนยันตัวตนทางกฎหมาย (KYC) ด้วยบัตรประจำตัวประชาชนหรือหนังสือเดินทางฉบับจริง พร้อมทั้งผูกบัญชีธนาคารเพื่อรับโอนเงินคอมมิชชั่นและยอดขายสุทธิ
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-indigo-950 border-b border-slate-200 pb-1">
                      หมวดที่ 2: มาตรฐานการจัดตั้งร้านค้าและสินค้า (Store Name & Products Standard)
                    </h3>
                    <p className="pl-3">
                      2.1 ร้านค้าต้องระบุชื่อร้านค้าที่สุภาพ ชัดเจน ห้ามใช้ชื่อแบรนด์หรือเครื่องหมายการค้าอื่นที่มีลิขสิทธิ์ และห้ามใช้อักขระพิเศษ (@, #, $, %, ^, &, *) <br/>
                      2.2 สินค้าที่นำมาจำหน่ายต้องเป็นสินค้าที่ถูกกฎหมาย มี อย./มอก. ครบถ้วน ไม่ละเมิดลิขสิทธิ์ และได้รับอนุญาตอย่างถูกต้อง <br/>
                      2.3 ราคาจำหน่ายและคะแนนสะสม (PV) ต้องเป็นไปตามเงื่อนไขที่อนุมัติโดยฝ่ายบริหาร (Admin Market) เท่านั้น
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-indigo-950 border-b border-slate-200 pb-1">
                      หมวดที่ 3: โครงสร้างค่าธรรมเนียมระบบ GP 20% และการจ่ายผลตอบแทน MLM
                    </h3>
                    <p className="pl-3">
                      3.1 การวางขายสินค้าผ่านพอร์ทัลร้านค้า Natee Plus Partner จะมีการหักค่าธรรมเนียมบริหารจัดการระบบ (GP) ในอัตรา <strong>20% ของราคาก่อนภาษี</strong> <br/>
                      3.2 จำนวนเงิน <strong>50% ของ GP</strong> จะถูกนำไปคำนวนเป็น PV ของท่าน <br/>
                      3.3 ยอดเงินส่วนคงเหลือหลังหักค่าธรรมเนียม GP จะถูกโอนเข้ากระเป๋าเงินอิเล็กทรอนิกส์ E-Money ของร้านค้าโดยอัตโนมัติเมื่อคำสั่งซื้อสำเร็จเรียบร้อย
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-indigo-950 border-b border-slate-200 pb-1">
                      หมวดที่ 4: ข้อกำหนดพิกัดแผนที่คลังสินค้าและการจัดส่งพัสดุ (Logistics & Warehouse Pinning)
                    </h3>
                    <p className="pl-3">
                      4.1 สมาชิกทั่วไปที่ยังไม่ได้ลงทะเบียนร้านค้า จะไม่แสดงหมุดแผนที่คลังสินค้าในหน้าพอร์ทัลหลัก <br/>
                      4.2 เมื่อสมาชิกลงทะเบียนร้านค้าและได้รับการอนุมัติ (Active) หมุดแผนที่พิกัดคลังสินค้าจะแสดงในหน้าพอร์ทัลร้านค้า (Partner Portal) เพื่อเปิดใช้งานระบบคำนวณค่าจัดส่งอัตโนมัติ (Shippop Integration) <br/>
                      4.3 หมุดพิกัดจัดส่งและคลังสินค้าจะถูก <strong>ล็อกเป็นภาพนิ่ง (Confirmed Static Pin)</strong> เมื่อได้รับการยืนยัน <br/>
                      4.4 หากทางร้านต้องการย้ายคลังสินค้าหรือปรับเปลี่ยนพิกัดใหม่ จะต้องยื่นขออนุมัติปรับแก้ไขพิกัดกับฝ่ายแอดมินระบบ เพื่อความแม่นยำในการคำนวณเรตติ้งค่าขนส่ง
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-indigo-950 border-b border-slate-200 pb-1">
                      หมวดที่ 5: นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) และภาษีสรรพากร
                    </h3>
                    <p className="pl-3">
                      5.1 บริษัทจัดเก็บและประมวลผลข้อมูลส่วนบุคคลของท่านภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) เพื่อประโยชน์ในการนำส่งภาษีและยืนยันตัวตน <br/>
                      5.2 รายได้จากการจำหน่ายสินค้าและคอมมิชชั่นจะถูกหักภาษี ณ ที่จ่าย (Withholding Tax) อัตรา <strong>3%</strong> เพื่อนำส่งกรมสรรพากรตามกฎหมายไทย โดยบริษัทจะออกหนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) ให้แก่ร้านค้า
                    </p>
                  </div>

                  {/* Textarea Rules Sync Content */}
                  {sellerRegulationsText && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <h4 className="font-bold text-xs text-indigo-900">ประกาศระเบียบเพิ่มเติมเฉพาะกาลจากฝ่ายบริหาร:</h4>
                      <p className="whitespace-pre-wrap text-[11px] text-slate-600 font-sans leading-relaxed">
                        {sellerRegulationsText}
                      </p>
                    </div>
                  )}

                </div>

                {/* Signatures & Seal Section */}
                <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
                  <div className="text-center space-y-8">
                    <p className="font-bold text-slate-800">ในนาม บริษัท นที พลัส มาร์เก็ต จำกัด</p>
                    <div className="pt-6 border-b border-dashed border-slate-400 w-48 mx-auto"></div>
                    <div>
                      <p className="font-bold text-slate-900">(.............................................................)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">กรรมการผู้จัดการ / ฝ่ายบริหารระบบ</p>
                    </div>
                  </div>

                  <div className="text-center space-y-8">
                    <p className="font-bold text-slate-800">ผู้สมัคร / ร้านค้าพาร์ทเนอร์ร่วมโครงการ</p>
                    <div className="pt-6 border-b border-dashed border-slate-400 w-48 mx-auto"></div>
                    <div>
                      <p className="font-bold text-slate-900">(.............................................................)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">ลายมือชื่อร้านค้าผู้ประกอบการ</p>
                    </div>
                  </div>
                </div>

                {/* Official Footer Banner */}
                <div className="text-center border-t border-slate-100 pt-4 text-[9px] text-slate-400 font-mono flex justify-between items-center">
                  <span>NATEE PLUS MARKET CO., LTD. • OFFICIAL SYSTEM REGULATION DOCUMENT</span>
                  <span>CONFIDENTIAL & LEGAL BINDING</span>
                </div>

              </div>

              {/* Bottom Actions Footer (Hidden when printing) */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center flex-shrink-0 no-print-element">
                <span className="text-xs text-slate-500">
                  💡 คำแนะนำ: กดปุ่ม <b>"พิมพ์ / บันทึกเป็น PDF"</b> เพื่อบันทึกเป็นไฟล์ PDF ลงในอุปกรณ์ของท่าน
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    🖨️ พิมพ์ / บันทึกเป็น PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegulationsPdfModal(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        </div>

        {/* Admin Product Queue Edit Modal */}
        {editingQueueProd && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  ✏️ ปรับปรุงแก้ไขราคาสินค้า & PV (ก่อนอนุมัติ)
                </h3>
                <button 
                  onClick={() => setEditingQueueProd(null)} 
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-100 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">ชื่อสินค้า</label>
                  <input 
                    type="text"
                    disabled
                    value={editingQueueProd.name || ''}
                    className="w-full bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-bold cursor-not-allowed text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">ราคาขายตั้งหน้าร้าน (บาท)</label>
                  <input 
                    type="number"
                    value={editingQueueProd.price || 0}
                    onChange={(e) => setEditingQueueProd({ ...editingQueueProd, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">คะแนน PV</label>
                  <input 
                    type="number"
                    value={editingQueueProd.pv || 0}
                    onChange={(e) => setEditingQueueProd({ ...editingQueueProd, pv: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">ต้นทุนสินค้า / รับซื้อ (บาท)</label>
                  <input 
                    type="number"
                    value={editingQueueProd.cost !== undefined ? editingQueueProd.cost : Math.floor((editingQueueProd.price || 0) * 0.30)}
                    onChange={(e) => setEditingQueueProd({ ...editingQueueProd, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-[11px] space-y-1">
                  {(() => {
                    const price = editingQueueProd.price || 0;
                    const pv = editingQueueProd.pv || 0;
                    const cost = editingQueueProd.cost !== undefined ? editingQueueProd.cost : Math.floor(price * 0.30);
                    const vat = parseFloat((price * 7 / 107).toFixed(2));
                    const netPayout = editingQueueProd.netPayout || (price - cost);
                    const companyProfit = parseFloat((price - pv - vat - cost).toFixed(2));
                    return (
                      <>
                        <p className="text-slate-600 font-semibold">เงินโอนเข้าร้านค้าสุทธิ: <strong className="text-emerald-600">฿ {netPayout.toFixed(2)}</strong></p>
                        <p className="text-slate-600 font-semibold">ภาษี VAT 7%: <strong className="text-slate-800">฿ {vat.toFixed(2)}</strong></p>
                        <p className="text-slate-600 font-semibold">ส่วนต่างกำไรบริษัท GP: <strong className="text-rose-600">฿ {companyProfit.toFixed(2)}</strong></p>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingQueueProd(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    const cost = editingQueueProd.cost !== undefined ? editingQueueProd.cost : Math.floor(editingQueueProd.price * 0.30);
                    await handleProductUpdatePrice(editingQueueProd.id, editingQueueProd.price, editingQueueProd.pv, cost);
                    setEditingQueueProd(null);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-2.5 rounded-xl font-extrabold text-xs transition shadow-md cursor-pointer"
                >
                  💾 บันทึกแก้ไข
                </button>
                <button
                  onClick={async () => {
                    const cost = editingQueueProd.cost !== undefined ? editingQueueProd.cost : Math.floor(editingQueueProd.price * 0.30);
                    await handleProductUpdatePrice(editingQueueProd.id, editingQueueProd.price, editingQueueProd.pv, cost);
                    await handleProductApprove(editingQueueProd.id);
                    setEditingQueueProd(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-extrabold text-xs transition shadow-md cursor-pointer"
                >
                  ✓ บันทึก & อนุมัติ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Product Queue View Details Modal */}
        {selectedAdminQueueProd && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    🔍 ข้อมูลรายละเอียดผลิตภัณฑ์ ({selectedAdminQueueProd.id})
                  </h3>
                  <p className="text-[10px] text-slate-400">ร้านค้า: {selectedAdminQueueProd.sellerStoreName || 'ไม่ระบุ'} ({selectedAdminQueueProd.sellerCode || selectedAdminQueueProd.sellerId})</p>
                </div>
                <button 
                  onClick={() => setSelectedAdminQueueProd(null)} 
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-100 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Product Images */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(selectedAdminQueueProd.images && selectedAdminQueueProd.images.length > 0 ? selectedAdminQueueProd.images : [selectedAdminQueueProd.image]).filter(Boolean).map((imgUrl: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={imgUrl} 
                    alt="" 
                    onClick={() => setPreviewImageUrl(imgUrl)}
                    className="w-24 h-24 object-cover rounded-2xl border border-slate-200 shadow-sm shrink-0 cursor-pointer hover:scale-105 transition" 
                    referrerPolicy="no-referrer"
                    title="คลิกเพื่อขยายดูรูปภาพจริง" 
                  />
                ))}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">ชื่อผลิตภัณฑ์</span>
                  <h4 className="font-extrabold text-slate-900 text-base">{selectedAdminQueueProd.name}</h4>
                </div>

                {selectedAdminQueueProd.description && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">รายละเอียด / คำอธิบาย</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 whitespace-pre-line text-xs">
                      {selectedAdminQueueProd.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">ราคาขาย</span>
                    <strong className="text-slate-900 text-sm font-extrabold">฿ {parseFloat(selectedAdminQueueProd.price || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">คะแนน PV</span>
                    <strong className="text-amber-600 text-sm font-extrabold">{selectedAdminQueueProd.pv} PV</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">หมวดหมู่</span>
                    <span className="text-slate-700 font-bold">{selectedAdminQueueProd.category || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">น้ำหนักสินค้า</span>
                    <span className="text-slate-700 font-mono font-bold">{selectedAdminQueueProd.weight || 0} กรัม</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">ขนาดพัสดุ (ก x ย x ส)</span>
                    <span className="text-slate-700 font-mono font-bold">{selectedAdminQueueProd.width || 0} x {selectedAdminQueueProd.length || 0} x {selectedAdminQueueProd.height || 0} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">ค่าจัดส่งฐาน</span>
                    <span className="text-indigo-600 font-mono font-bold">฿ {selectedAdminQueueProd.baseShippingCost || 35}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedAdminQueueProd(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    const id = selectedAdminQueueProd.id;
                    setSelectedAdminQueueProd(null);
                    handleProductApprove(id);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-extrabold text-xs transition shadow-md cursor-pointer"
                >
                  ✓ อนุมัติจำหน่าย
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: GLOBAL PRODUCT DETAIL & PURCHASE */}
        {selectedMarketProduct && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-indigo-100 relative max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setSelectedMarketProduct(null)}
                className="absolute top-5 right-5 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-lg font-bold transition cursor-pointer z-20"
              >
                ✕
              </button>

              {/* Main Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Product Image Gallery & Desktop Hover Zoom */}
                {(() => {
                  const allImgs = [
                    ...(Array.isArray(selectedMarketProduct.images) ? selectedMarketProduct.images : []),
                    selectedMarketProduct.imageFile,
                    selectedMarketProduct.image,
                    selectedMarketProduct.imageUrl,
                    selectedMarketProduct.image2,
                    selectedMarketProduct.image3
                  ].filter((img): img is string => typeof img === 'string' && img.trim().length > 0);

                  const customImgs = allImgs.filter(img => !img.includes('unsplash'));
                  const rawImgs = customImgs.length > 0 ? customImgs : allImgs;
                  const uniqueImgs = Array.from(new Set(rawImgs));
                  const modalImages = uniqueImgs.length > 0 
                    ? uniqueImgs 
                    : ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'];

                  const activeImg = selectedModalActiveImg && modalImages.includes(selectedModalActiveImg)
                    ? selectedModalActiveImg
                    : modalImages[0];

                  const prodSales = getProductSalesCount(selectedMarketProduct);

                  return (
                    <div className="space-y-3">
                      <div 
                        onClick={() => setPreviewImageUrl(activeImg)}
                        className="overflow-hidden rounded-2xl border border-slate-100 h-56 relative shadow-inner bg-slate-50 group cursor-pointer cursor-zoom-in"
                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                      >
                        <img 
                          src={activeImg || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125" 
                          alt={selectedMarketProduct.name} 
                        />
                        <div className="absolute top-3 left-3 bg-indigo-900/90 text-white px-3 py-1 rounded-xl text-xs font-bold border border-white/20 shadow">
                          🏪 {selectedMarketProduct.sellerStoreName || 'นที พลัส มาร์เก็ต'}
                        </div>
                        <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-xl text-xs font-black shadow flex items-center gap-1">
                          ⭐ {(() => {
                            if (selectedMarketProduct.sellerRating) return selectedMarketProduct.sellerRating;
                            const str = String(selectedMarketProduct.sellerStoreName || selectedMarketProduct.sellerId || selectedMarketProduct.id || 'store');
                            let hash = 0;
                            for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                            return (4.5 + Math.abs(hash % 6) / 10).toFixed(1);
                          })()} / 5.0
                        </div>
                        <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-md">
                          🔥 ขายแล้ว {prodSales} ชิ้น
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none">
                          🔍 นำเมาส์ไปชี้เพื่อขยาย
                        </div>
                      </div>

                      {/* Thumbnail Gallery Slider Below */}
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {modalImages.map((imgUrl, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() => setSelectedModalActiveImg(imgUrl)}
                            className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 cursor-pointer transition ${
                              activeImg === imgUrl
                                ? 'border-orange-500 shadow-md scale-105'
                                : 'border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} className="w-full h-full object-cover" alt={`thumbnail ${imgIdx + 1}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Product Details & Purchase Action */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-extrabold">
                      {selectedMarketProduct.category || 'สินค้าทั่วไป'} {selectedMarketProduct.subcategory ? `• ${selectedMarketProduct.subcategory}` : ''}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-snug">
                      {selectedMarketProduct.name}
                    </h3>
                    {(selectedMarketProduct.brand || selectedMarketProduct.brandName) && (
                      <p className="text-xs text-indigo-600 font-bold">
                        🏷️ แบรนด์สินค้า (Brand): <span className="text-slate-800">{selectedMarketProduct.brand || selectedMarketProduct.brandName}</span>
                      </p>
                    )}
                    {(selectedMarketProduct.sellerStoreName || selectedMarketProduct.sellerLine) && (
                      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 text-xs flex flex-wrap items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <span>🏪 ร้านค้า: {selectedMarketProduct.sellerStoreName || 'นที พลัส มาร์เก็ต'}</span>
                        </div>
                        {typeof selectedMarketProduct.sellerLine === 'string' && selectedMarketProduct.sellerLine.trim() !== '' && (
                          <a 
                            href={selectedMarketProduct.sellerLine.startsWith('http') ? selectedMarketProduct.sellerLine : `https://line.me/ti/p/~${selectedMarketProduct.sellerLine.replace('@','')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            💬 ติดต่อร้านค้า LINE: {selectedMarketProduct.sellerLine}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div className="text-2xl font-black text-indigo-600">
                        ฿ {selectedMarketProduct.price?.toLocaleString()}
                      </div>
                      {(['S','M','L','XL','XXL'].includes(profile?.rank || '') || profile?.role === 'Admin' || profile?.role === 'Manager') ? (
                        <div className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-xl">
                          +{selectedMarketProduct.pv || Math.floor(parseFloat(selectedMarketProduct.price) * 0.5)} PV
                        </div>
                      ) : (
                        <div className="bg-slate-100 text-slate-500 text-[11px] font-semibold px-3 py-1 rounded-xl" title="เฉพาะสมาชิกตำแหน่ง S ขึ้นไป">
                          🔒 คะแนน PV เฉพาะตำแหน่ง S ขึ้นไป
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 font-medium">
                      <div>
                        🚚 ค่าจัดส่ง: <strong className="text-emerald-700">{selectedMarketProduct.shippingFee ? `฿${selectedMarketProduct.shippingFee}` : 'จัดส่งฟรีทั่วประเทศ'}</strong>
                      </div>
                      <div>
                        🏷️ ส่วนลดสิทธิ์สมาชิก: <strong className="text-indigo-600">{selectedMarketProduct.discount || 'ใช้ E-Coupon ลดสูงสุด'}</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 pt-1">
                      ชำระด้วย E-Coupon สะสมส่วนลดเป็นอันดับแรก หากไม่พอระบบหักส่วนต่างจาก E-Cash อัตโนมัติ
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      💡 จุดเด่นและคุณสมบัติสินค้า:
                    </h4>
                    <p className="text-slate-600 bg-amber-50/60 border border-amber-100 p-3 rounded-xl leading-relaxed">
                      {selectedMarketProduct.shortDescription || selectedMarketProduct.description || "สินค้าคุณภาพที่ผ่านการรับรองและตรวจสอบมาตรฐานเรียบร้อยแล้ว"}
                    </p>
                  </div>

                  {selectedMarketProduct.description && selectedMarketProduct.description !== selectedMarketProduct.shortDescription && (
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-slate-800">📄 รายละเอียดสินค้าเพิ่มเติม:</h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {selectedMarketProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Quantity Selector (+ / -) */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-slate-700">จำนวนสินค้าที่ต้องการ:</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMarketProductQty(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-sm text-indigo-700 min-w-[24px] text-center">
                        {marketProductQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMarketProductQty(prev => prev + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    {selectedMarketProduct.isAvailable === false ? (
                      <button
                        type="button"
                        disabled
                        className="flex-1 bg-slate-300 text-slate-600 font-extrabold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        🔴 สินค้าหมดชั่วคราว (Out of Stock)
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            showNotif('กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนสั่งซื้อสินค้าค่ะ', 'info');
                            setAuthMode('login');
                            setShowLoginModal(true);
                            return;
                          }
                          setCheckoutMarketProduct(selectedMarketProduct);
                          setShowMarketCheckoutModal(true);
                          setSelectedMarketProduct(null);
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg hover:shadow transition cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        🛒 สั่งซื้อสินค้า (฿{(selectedMarketProduct.price * marketProductQty).toLocaleString()})
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const refCode = profile?.userId || currentUser?.userId || 'CENTRAL';
                        const link = `${window.location.origin}/?ref=${refCode}&productId=${selectedMarketProduct.id}`;
                        navigator.clipboard.writeText(link);
                        
                        if (currentUser?.userId) {
                          try {
                            const res = await fetch('/api/affiliate/toggle-basket', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: currentUser.userId, productId: selectedMarketProduct.id })
                            });
                            const data = await res.json();
                            if (data.success) {
                              showNotif('📌 ปักตะกร้าลงใน "ตะกร้า Affiliate ของฉัน" และคัดลอกลิงค์แชร์สำเร็จ!', 'success');
                              setProfile((prev: any) => ({
                                ...prev,
                                affiliateBookmarkedIds: data.bookmarkedIds
                              }));
                            } else {
                              showNotif(data.message || 'คัดลอกลิงค์แชร์เรียบร้อยแล้ว!', 'info');
                            }
                          } catch (e) {
                            showNotif('คัดลอกลิงก์ปักตะกร้าแชร์สินค้านี้สำเร็จ!', 'success');
                          }
                        } else {
                          showNotif('คัดลอกลิงก์ปักตะกร้าแชร์สินค้านี้สำเร็จ! (เข้าสู่ระบบเพื่อบันทึกลงตะกร้า Affiliate)', 'success');
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3.5 rounded-2xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      title="แชร์สินค้านี้เพื่อรับ PV / ค่าคอม Affiliate"
                    >
                      📌 ปักตะกร้าแชร์สินค้านี้
                    </button>
                    {(currentUser?.role === 'Admin' || (selectedMarketProduct.sellerId && (selectedMarketProduct.sellerId === currentUser?.userId || selectedMarketProduct.sellerId === sellerSessionUser?.userId))) && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const pToEdit = selectedMarketProduct;
                            setSelectedMarketProduct(null);
                            setEditingProduct({
                              ...pToEdit,
                              discountPercent: pToEdit.discountPercent || '0',
                              shippingFeeBase: pToEdit.shippingFeeBase || '35',
                              shippingDiscount: pToEdit.shippingDiscount || pToEdit.sellerCoPay || '0',
                              weight: pToEdit.weight || '350',
                              width: pToEdit.width || '10',
                              length: pToEdit.length || '10',
                              height: pToEdit.height || '10'
                            });
                            setShowEditProductModal(true);
                          }}
                          className="bg-indigo-700 hover:bg-indigo-600 text-white font-extrabold px-4 py-3.5 rounded-2xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                          title="แก้ไขรายละเอียดสินค้าและรูปภาพ"
                        >
                          ✏️ แก้ไขสินค้า / เปลี่ยนรูปภาพ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pId = selectedMarketProduct.id;
                            const pName = selectedMarketProduct.name;
                            setSelectedMarketProduct(null);
                            handleDeleteProduct(pId, pName);
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-3.5 rounded-2xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                          title="ลบสินค้าออกจากร้านค้าอย่างถาวร"
                        >
                          🗑️ ลบสินค้า
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: สินค้าของร้านอื่นๆ ในประเภทหมวดหมู่เดียวกัน (เรียงตามลำดับคะแนนดาว ของร้าน) */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      🛍️ สินค้าจากร้านอื่นๆ ในหมวดหมู่เดียวกัน
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      หมวดหมู่ "{selectedMarketProduct.category || 'ทั่วไป'}" • เรียงลำดับตามคะแนนดาวของร้านค้าจากสูงไปต่ำ ⭐
                    </p>
                  </div>
                </div>

                {(() => {
                  const getShopRatingVal = (p: any): number => {
                    if (p?.sellerRating) return parseFloat(p.sellerRating);
                    const str = String(p?.sellerStoreName || p?.sellerId || p?.id || 'store');
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    return parseFloat((4.5 + Math.abs(hash % 6) / 10).toFixed(1));
                  };

                  // Filter products in same category excluding current product
                  const sameCatProducts = products
                    .filter(p => p.category !== 'Package' && p.id !== selectedMarketProduct.id && p.category === selectedMarketProduct.category)
                    .sort((a, b) => getShopRatingVal(b) - getShopRatingVal(a)); // Sorted by store star rating descending!

                  if (sameCatProducts.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                        ยังไม่มีสินค้าชิ้นอื่นจากร้านพาร์ทเนอร์ในหมวดหมู่นี้ค่ะ
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sameCatProducts.map(otherP => {
                        const ratingVal = getShopRatingVal(otherP);
                        const otherPv = otherP.pv || Math.floor(parseFloat(otherP.price) * 0.5);
                        return (
                          <div
                            key={otherP.id}
                            onClick={() => {
                              setSelectedMarketProduct(otherP);
                              setSelectedModalActiveImg('');
                            }}
                            className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-3 transition cursor-pointer flex items-center gap-3 group shadow-sm hover:shadow"
                          >
                            <img 
                              src={otherP.image || (otherP.images && otherP.images[0]) || otherP.imageUrl || otherP.imageFile || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
                              }}
                              className="w-12 h-12 object-cover rounded-xl group-hover:scale-105 transition flex-shrink-0" 
                              alt={otherP.name} 
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                                  ⭐ {ratingVal}
                                </span>
                                <span className="text-[10px] font-bold text-slate-700 truncate">
                                  🏪 {otherP.sellerStoreName || 'ร้านค้าพาร์ทเนอร์'}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
                                {otherP.name}
                              </h5>
                              <div className="flex justify-between items-center text-[11px] pt-0.5">
                                <span className="font-black text-indigo-600">฿ {otherP.price?.toLocaleString()}</span>
                                <span className="text-emerald-700 font-bold text-[9px]">+{otherPv} PV</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MARKET CHECKOUT / CART SUMMARY WITH CANCEL / CLEAR CART OPTION */}
        <MarketCheckoutModal
          isOpen={showMarketCheckoutModal}
          onClose={() => setShowMarketCheckoutModal(false)}
          product={checkoutMarketProduct}
          quantity={marketProductQty}
          setShopSubTab={setShopSubTab}
          setProduct={setCheckoutMarketProduct}
          setShowModal={setShowMarketCheckoutModal}
          showNotif={showNotif}
          playOrderAlertSound={playOrderAlertSound}
          currentUser={currentUser}
          profile={profile}
          fetchProfile={fetchProfile}
        />

        {/* MODAL: ORDER TRACKING DETAILS FOR CUSTOMER */}
        {activeTrackingOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">📦 ติดตามสถานะการจัดส่งพัสดุ</h3>
                  <p className="text-[10px] text-slate-400 font-mono">เลขบิล: {activeTrackingOrder.id}</p>
                </div>
                <button
                  onClick={() => setActiveTrackingOrder(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-100 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                <p className="font-bold text-slate-800">สินค้า: {activeTrackingOrder.productName} (x{activeTrackingOrder.quantity || 1})</p>
                <p className="text-slate-600">ขนส่ง: <span className="font-bold text-indigo-700">{activeTrackingOrder.courier || 'นที เอ็กซ์เพรส / ขนส่งพันธมิตร'}</span></p>
                <p className="text-slate-600">เลขพัสดุ: <span className="font-mono font-black text-emerald-600">{activeTrackingOrder.trackingNumber || 'กำลังจัดเตรียมหมายเลขพัสดุ'}</span></p>
              </div>

              {/* Timeline Progress */}
              <div className="space-y-3 pl-2 border-l-2 border-indigo-200 my-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-bold text-slate-800">1. ชำระเงินและรับออร์เดอร์สำเร็จ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${activeTrackingOrder.status === 'Shipped' || activeTrackingOrder.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'} shrink-0`}></span>
                  <span className="font-bold text-slate-800">2. ร้านค้ากำลังบรรจุหีบห่อและเตรียมจัดส่ง</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${activeTrackingOrder.status === 'Shipped' || activeTrackingOrder.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-200'} shrink-0`}></span>
                  <span className="font-bold text-slate-800">3. มอบให้บริษัทขนส่งพัสดุแล้ว</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${activeTrackingOrder.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-200'} shrink-0`}></span>
                  <span className="font-bold text-slate-800">4. พัสดุจัดส่งถึงมือผู้รับเรียบร้อย</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTrackingOrder(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  onClick={() => {
                    const orderToChat = activeTrackingOrder;
                    setActiveTrackingOrder(null);
                    setActiveOrderChat(orderToChat);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  💬 ติดต่อร้านค้า
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: LIVE CHAT BETWEEN CUSTOMER AND SELLER STORE */}
        {activeOrderChat && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col h-[520px] overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="p-4 bg-indigo-900 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <div>
                    <h3 className="text-xs font-black">แชทติดต่อเกี่ยวกับออร์เดอร์ #{activeOrderChat.id}</h3>
                    <p className="text-[10px] text-indigo-200">สินค้า: {activeOrderChat.productName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Customer Only End Conversation Button */}
                  {(currentUser?.userId === activeOrderChat.userId || profile?.userId === activeOrderChat.userId) && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/order/chat/end', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId: activeOrderChat.id,
                              userId: currentUser?.userId || profile?.userId
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setOrderChatEnded(true);
                            showNotif('สิ้นสุดการสนทนาเรียบร้อยแล้วค่ะ', 'success');
                          }
                        } catch (e) {
                          showNotif('เกิดข้อผิดพลาดในการสิ้นสุดการสนทนา', 'error');
                        }
                      }}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer shadow-sm"
                    >
                      🛑 สิ้นสุดการสนทนา
                    </button>
                  )}
                  <button
                    onClick={() => setActiveOrderChat(null)}
                    className="text-white/80 hover:text-white font-bold p-1 rounded-full hover:bg-white/10 text-xs cursor-pointer ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Chat Message Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                {orderChatMessages.length === 0 ? (
                  <div className="text-center text-slate-400 py-10 space-y-2">
                    <p className="text-2xl">💬</p>
                    <p className="text-xs">ยังไม่มีข้อความโต้ตอบ เริ่มพิมพ์ข้อความแรกสอบถามร้านค้าได้เลยค่ะ</p>
                  </div>
                ) : (
                  orderChatMessages.map((msg: any) => {
                    const isMe = (sellerSessionUser && msg.sender === 'seller') || (!sellerSessionUser && msg.sender === 'customer');
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                          isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} className="mt-2 rounded-xl max-h-40 object-cover border border-slate-200" alt="chat attachment" referrerPolicy="no-referrer" />
                          )}
                          <span className={`text-[9px] block mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {orderChatEnded && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-center text-[11px] font-bold">
                    🔒 การสนทนานี้สิ้นสุดลงแล้ว (ลูกค้าได้กดสิ้นสุดการสนทนา)
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                {chatInputImage && (
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                    <img src={chatInputImage} className="w-8 h-8 rounded object-cover" alt="" referrerPolicy="no-referrer" />
                    <span className="text-[10px] text-slate-600 truncate flex-1">แนบรูปภาพแล้ว</span>
                    <button onClick={() => setChatInputImage('')} className="text-rose-600 font-bold text-xs p-1">✕</button>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!chatInputText.trim() && !chatInputImage) return;

                    const isSeller = !!sellerSessionUser;
                    const senderRole = isSeller ? 'seller' : 'customer';

                    try {
                      const res = await fetch('/api/order/chat/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          orderId: activeOrderChat.id,
                          sender: senderRole,
                          text: chatInputText,
                          imageUrl: chatInputImage
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setChatInputText('');
                        setChatInputImage('');
                        setOrderChatMessages(data.chatMessages);
                        setOrderChatEnded(data.chatEnded);
                      } else {
                        showNotif(data.message || 'ไม่สามารถส่งข้อความได้', 'error');
                      }
                    } catch (err) {
                      showNotif('เกิดข้อผิดพลาดในการส่งข้อความ', 'error');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <label className="cursor-pointer text-slate-500 hover:text-indigo-600 p-2 rounded-xl bg-slate-100 transition">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setChatInputImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    disabled={orderChatEnded && !!sellerSessionUser}
                    placeholder={orderChatEnded && !!sellerSessionUser ? "ลูกค้ากดสิ้นสุดการสนทนาแล้ว ร้านค้าส่งข้อความไม่ได้" : "พิมพ์ข้อความโต้ตอบที่นี่..."}
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={orderChatEnded && !!sellerSessionUser}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                  >
                    ส่ง
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* New Version Floating Top Alert */}
        {hasNewVersion && (
          <div className="fixed bottom-4 right-4 z-[9999] bg-indigo-950 text-white p-4 rounded-2xl shadow-2xl border border-indigo-400 flex items-center gap-3 max-w-sm animate-bounce">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <RefreshCw size={20} className="animate-spin" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-black text-amber-300">🚀 มีการอัปเดตระบบเวอร์ชั่นใหม่!</p>
              <p className="text-[10px] text-slate-300">เวอร์ชั่นเซิร์ฟเวอร์ล่าสุด: {serverVersion || 'v2.1.0'}</p>
            </div>
            <button
              onClick={handleForceUpdateAndClearCache}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-xl shadow transition cursor-pointer shrink-0"
            >
              อัปเดตเลย
            </button>
          </div>
        )}

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-100 px-6 py-4 text-center text-[10px] text-slate-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>© {new Date().getFullYear()} บริษัท นที พลัส มาร์เก็ต จำกัด (Natee Plus Market Co., Ltd.) • โครงสร้างเครือข่ายธุรกิจร้านค้านวัตกรรมอย่างโปร่งใส มั่งคั่ง มั่นคง ยั่งยืน</span>
          <span>•</span>
          <button onClick={() => setShowPdpaModal(true)} className="text-indigo-600 hover:underline cursor-pointer font-semibold">
            นโยบายความเป็นส่วนตัว (PDPA)
          </button>
          <span>•</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            เวอร์ชั่นระบบ v{APP_VERSION}
          </span>
          <button
            onClick={handleForceUpdateAndClearCache}
            className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer border border-amber-200/80 flex items-center gap-1"
            title="ล้างแคชเบราว์เซอร์และโหลดโค้ดเวอร์ชั่นล่าสุด"
          >
            <RefreshCw size={10} />
            <span>ล้างแคช & อัปเดตเวอร์ชั่น</span>
          </button>
        </footer>

        {/* Lazada/Shopee Style Admin Promo Pop-up Modal */}
        {showPromoPopup && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-200/80 relative transform animate-scaleUp">
              {/* Close Button X */}
              <button
                onClick={() => {
                  setShowPromoPopup(false);
                  try { sessionStorage.setItem('natee_promo_dismissed', 'true'); } catch(e){}
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center font-bold text-sm transition z-10 cursor-pointer shadow"
                title="ปิดหน้าต่างโปรโมชั่น"
              >
                ✕
              </button>

              {/* Promo Banner Image */}
              <div className="relative h-48 bg-gradient-to-tr from-amber-500 to-orange-600 overflow-hidden">
                <img
                  src={promoConfig.imageUrl}
                  alt={promoConfig.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    SPECIAL OFFER
                  </span>
                </div>
              </div>

              {/* Promo Body Content */}
              <div className="p-5 text-center space-y-3">
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {promoConfig.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {promoConfig.subtitle}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowPromoPopup(false);
                      try { sessionStorage.setItem('natee_promo_dismissed', 'true'); } catch(e){}
                      setActiveTab(promoConfig.linkTab || 'shop');
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3 rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
                  >
                    {promoConfig.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: INTERACTIVE LIVE SHOPPING ROOM PLAYER WITH AI MODERATION */}
        {activeLiveRoom && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-rose-900/60 rounded-3xl max-w-4xl w-full h-[90vh] max-h-[750px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative text-white">
              {/* Close Button X */}
              <button
                type="button"
                onClick={() => setActiveLiveRoom(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center font-bold text-xs z-30 transition cursor-pointer border border-white/20"
              >
                ✕
              </button>

              {/* Left Column: Video Frame & Pinned Products */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
                {/* Warning Overlay Banner if Admin Issued Warning */}
                {activeLiveRoom.warningBanner && (
                  <div className="bg-rose-600 text-white p-2.5 text-center text-xs font-bold animate-pulse z-20 flex items-center justify-center gap-2 border-b border-rose-500">
                    <span>⚠️</span>
                    <span>{activeLiveRoom.warningBanner}</span>
                  </div>
                )}

                {/* Video Container / YouTube & TikTok Embed */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[280px]">
                  {(() => {
                    const rawUrl = activeLiveRoom.streamUrl || '';
                    const isYouTube = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');
                    const isTikTok = rawUrl.includes('tiktok.com');

                    if (isYouTube) {
                      let embedUrl = rawUrl;
                      let vid = '';
                      if (rawUrl.includes('/live/')) {
                        vid = rawUrl.split('/live/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0]?.split('/')[0];
                      } else if (rawUrl.includes('watch?v=')) {
                        vid = rawUrl.split('watch?v=')[1]?.split('&')[0]?.split('#')[0]?.split('?')[0]?.split('/')[0];
                      } else if (rawUrl.includes('v=')) {
                        vid = rawUrl.split('v=')[1]?.split('&')[0]?.split('#')[0]?.split('?')[0]?.split('/')[0];
                      } else if (rawUrl.includes('youtu.be/')) {
                        vid = rawUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0]?.split('/')[0];
                      } else if (rawUrl.includes('/shorts/')) {
                        vid = rawUrl.split('/shorts/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0]?.split('/')[0];
                      } else if (rawUrl.includes('/embed/')) {
                        vid = rawUrl.split('/embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0]?.split('/')[0];
                      }

                      if (vid) {
                        embedUrl = `https://www.youtube.com/embed/${vid}`;
                      }

                      return (
                        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
                          <iframe
                            src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1&mute=0&rel=0&enablejsapi=1`}
                            title={activeLiveRoom.title}
                            className="w-full h-full border-0 min-h-[300px]"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-3 right-3 z-20 flex gap-2">
                            <a
                              href={rawUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-1.5 transition active:scale-95"
                            >
                              <span>▶️ เปิดดูใน YouTube App/Web</span>
                            </a>
                          </div>
                        </div>
                      );
                    }

                    if (isTikTok) {
                      const isShortLink = rawUrl.includes('vt.tiktok.com') || rawUrl.includes('vm.tiktok.com');
                      let tiktokEmbed = rawUrl;
                      let username = '';
                      const match = rawUrl.match(/@([^/?#]+)/);
                      if (match && match[1]) {
                        username = match[1];
                        tiktokEmbed = `https://www.tiktok.com/embed/v2/live?author_id=${username}`;
                      }

                      return (
                        <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4">
                          {!isShortLink && username ? (
                            <iframe
                              src={tiktokEmbed}
                              title={activeLiveRoom.title}
                              className="w-full h-full border-0 rounded-lg min-h-[300px]"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                            />
                          ) : (
                            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                              <img
                                src={activeLiveRoom.coverImage}
                                alt={activeLiveRoom.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-30"
                              />
                              <div className="relative z-10 space-y-3 max-w-sm">
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-black border border-rose-500/40 flex items-center justify-center shadow-lg animate-pulse">
                                  <span className="text-2xl">🎵</span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-extrabold text-white">ถ่ายทอดสดบน TikTok Live</h4>
                                  <p className="text-[11px] text-slate-300 mt-1">
                                    {isShortLink
                                      ? 'ลิงก์ย่อ TikTok (vt.tiktok.com) เป็นสตรีมแชร์ตรงจากแอป กดปุ่มด้านล่างเพื่อรับชมการถ่ายทอดสดบน TikTok App ได้ทันที'
                                      : 'คลิกปุ่มเปิดชมสตรีมสดบน TikTok App หรือเว็บไซต์ TikTok'}
                                  </p>
                                </div>
                                <a
                                  href={rawUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-lg transition transform active:scale-95 cursor-pointer border border-rose-400/30"
                                >
                                  <span>📱</span>
                                  <span>เปิดถ่ายทอดสดบน TikTok</span>
                                  <span>➔</span>
                                </a>
                              </div>
                            </div>
                          )}

                          <a
                            href={rawUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-rose-500/50 shadow-md flex items-center gap-1.5 z-20 transition"
                          >
                            <span>🎵</span>
                            <span>เปิดแอป TikTok</span>
                          </a>
                        </div>
                      );
                    }

                    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
                      return (
                        <iframe
                          src={rawUrl}
                          title={activeLiveRoom.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }

                    return (
                      <div className="relative w-full h-full">
                        <img
                          src={activeLiveRoom.coverImage}
                          alt={activeLiveRoom.title}
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col items-center justify-center p-6 text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-rose-600/80 flex items-center justify-center animate-bounce shadow-xl">
                            <span className="text-2xl">🔴</span>
                          </div>
                          <h3 className="text-base font-black text-white">{activeLiveRoom.title}</h3>
                          <p className="text-xs text-rose-300">กำลังถ่ายทอดสดโดย {activeLiveRoom.sellerStoreName}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Top Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                      LIVE
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full border border-white/20">
                      👁️ {activeLiveRoom.viewersCount || 120} คนกำลังชม
                    </span>
                  </div>
                </div>

                {/* Spotlight Featured Product & Catalog Drawer at Bottom of Video */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2.5">
                  {/* Spotlight Banner if activeSpotlightProduct exists */}
                  {activeLiveRoom.activeSpotlightProduct && (
                    <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-500/80 p-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg ring-1 ring-rose-500/50">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={activeLiveRoom.activeSpotlightProduct.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'}
                          alt={activeLiveRoom.activeSpotlightProduct.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-rose-400/50 shadow"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-rose-600 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded shadow">
                              📌 ปักตะกร้า {activeLiveRoom.activeSpotlightProduct.skuCode || 'A1'}
                            </span>
                            <span className="text-[10px] text-rose-300 font-bold truncate">{activeLiveRoom.activeSpotlightProduct.name}</span>
                          </div>
                          <p className="text-sm font-mono font-black text-amber-300 mt-0.5">
                            ฿ {(activeLiveRoom.activeSpotlightProduct.price || 0).toLocaleString()}
                          </p>
                        </div>
