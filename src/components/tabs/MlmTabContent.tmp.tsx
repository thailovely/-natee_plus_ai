          {activeTab === 'mlm' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">ระบบผังองค์กรขยายเครือข่าย นที พลัส 🕸️</h2>
                  <p className="text-xs text-slate-400 mt-1">บริหารจัดการผังสายงานขยาย 2 (1 แตก 2), สายผู้แนะนำตรง และคำนวณโบนัสยูนิลีเวอร์ 20 ชั้น</p>
                </div>

                {/* Sub-menu buttons for MLM */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => setMlmSubTab('binary')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mlmSubTab === 'binary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🕸️ ผังสายงานขยาย 2 (1 แตก 2)
                  </button>
                  <button 
                    onClick={() => setMlmSubTab('referral')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mlmSubTab === 'referral' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👥 สายแนะนำตรง (Sponsor)
                  </button>
                  <button 
                    onClick={() => setMlmSubTab('planb')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mlmSubTab === 'planb' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💎 กองทุนพิเศษ Plan B1-B15
                  </button>
                </div>
              </div>

              {/* BINARY SUB-TAB */}
              {mlmSubTab === 'binary' && (
                profile?.rank === 'Member' ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm mx-auto">
                      <Lock size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">🔒 เฉพาะส่วนนี้ ท่านยังไม่ได้รับสิทธิ์การเข้ามาในผังนี้</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      สิทธิ์การเข้าผังโครงสร้างสายงานนี้ ต้องมีตำแหน่งอย่างน้อย <b className="text-indigo-600">S (ตำแหน่งสมัครเปิดร้านค้า)</b> ขึ้นไปเท่านั้นค่ะ สมาชิกทั่วไป (Member) จะยังไม่มีชื่อเข้าสู่ระบบผังโครงสร้างสายงานนี้จนกว่าจะสมัครเปิดแพ็กเกจค่ะ
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => { setActiveTab('shop'); setShopPortalView('packages'); setShopSubTab('packages'); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        🛍️ ไปที่หน้าซื้อแพ็กเกจ (Market)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">🕸️ แผนผังโครงสร้างสายงาน 1 แตก 2 (Placement Plan A)</h3>
                        <p className="text-xs text-slate-400 mt-0.5">แสดงผังโครงสร้างการจัดวางสายงานขยาย 2 (1 แตก 2) ใต้องค์กร เพื่อคำนวณจ่ายโบนัสยูนิลีเวอร์ 20 ชั้น และค่าแนะนำ</p>
                      </div>

                      <div className="relative flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <input 
                            type="text" 
                            placeholder="พิมพ์ชื่อ/ชื่อผู้ใช้/รหัส 3 ตัวหลัง..."
                            value={mlmSearchId}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setMlmSearchId(val);
                              handleSearchMlmDownline(val);
                            }}
                            onFocus={() => {
                              if (mlmSearchResults.length > 0) setShowMlmSearchDropdown(true);
                            }}
                            className="border border-slate-200 rounded-xl px-4 py-2 text-xs bg-white focus:outline-none focus:border-indigo-500 w-full"
                          />

                          {/* Autocomplete Dropdown List */}
                          {showMlmSearchDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 max-h-64 overflow-y-auto min-w-[280px]">
                              <div className="p-2 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                                <span className="text-[10px] font-extrabold text-slate-600">
                                  🔍 ผลการค้นหาสมาชิกใต้สายงาน ({mlmSearchResults.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowMlmSearchDropdown(false)}
                                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>

                              {isSearchingMlm ? (
                                <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
                                  กำลังค้นหาสมาชิกใต้สายงาน...
                                </div>
                              ) : mlmSearchResults.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400">
                                  ไม่พบข้อมูลสมาชิกตรงกับคำค้นหานี้ใต้สายงาน
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-100">
                                  {mlmSearchResults.map((m: any) => (
                                    <div
                                      key={m.userId}
                                      onClick={() => {
                                        setMlmSearchId(m.userId);
                                        setShowMlmSearchDropdown(false);
                                        fetchMlmTrees(m.userId);
                                        showNotif(`แสดงผังของ ${m.username} (${formatPdpaFirstName(m.name)}) เรียบร้อยค่ะ`, 'success');
                                      }}
                                      className="p-2.5 hover:bg-indigo-50/70 cursor-pointer transition flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-extrabold text-xs text-slate-900">{m.username}</span>
                                          <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                                            {m.userId}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium">
                                          {formatPdpaFirstName(m.name)} • ผู้แนะนำ: {m.sponsorId || '-'}
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-extrabold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                        {m.rank || 'Member'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => handleSearchMlmDownline(mlmSearchId)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Search size={14} /> ค้นหา
                        </button>
                        {mlmSearchId && (
                          <button 
                            onClick={() => { 
                              setMlmSearchId(''); 
                              setMlmSearchResults([]); 
                              setShowMlmSearchDropdown(false); 
                              setTimeout(() => fetchMlmTrees(currentUser?.userId), 50); 
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                          >
                            ล้าง
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Navigation controls & Legend */}
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {/* Back/Up navigation */}
                      <div className="flex gap-2">
                        {binaryTree && binaryTree.userId !== currentUser.userId && (
                          <button 
                            onClick={() => {
                              setMlmSearchId('');
                              fetchMlmTrees(currentUser.userId);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            ⬅️ กลับสู่รหัสของฉัน
                          </button>
                        )}
                        {binaryTree && binaryTree.userId !== currentUser.userId && binaryTreeParentId && binaryTreeParentId !== "SYSTEM" && (
                          <button 
                            onClick={() => {
                              setMlmSearchId(binaryTreeParentId);
                              fetchMlmTrees(binaryTreeParentId);
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            ⬆️ ขึ้นไป 1 ชั้น ({binaryTreeParentId})
                          </button>
                        )}
                      </div>

                      {/* Zoom & Depth controls */}
                      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 justify-between lg:justify-start">
                        {/* Zoom */}
                        <div className="flex items-center gap-1.5 border-r border-slate-100 pr-3 mr-1">
                          <span className="font-bold flex items-center gap-1 text-[11px]"><Search size={12} className="text-slate-400" /> ย่อ-ขยายผัง:</span>
                          <button 
                            type="button"
                            onClick={() => setTreeScale(prev => Math.max(0.4, parseFloat((prev - 0.1).toFixed(2))))}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
                            title="ย่อออก"
                          >
                            ➖
                          </button>
                          <input 
                            type="range" 
                            min="0.4" 
                            max="1.5" 
                            step="0.05" 
                            value={treeScale} 
                            onChange={(e) => setTreeScale(parseFloat(e.target.value))}
                            className="w-20 lg:w-24 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <button 
                            type="button"
                            onClick={() => setTreeScale(prev => Math.min(1.5, parseFloat((prev + 0.1).toFixed(2))))}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
                            title="ขยายเข้า"
                          >
                            ➕
                          </button>
                          <span className="font-mono font-bold min-w-[36px] text-center text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 hidden">
                            {Math.round(treeScale * 100)}%
                          </span>
                          <button 
                            type="button"
                            onClick={() => setTreeScale(0.85)}
                            className="text-[10px] px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg transition-all cursor-pointer font-bold border border-indigo-100"
                          >
                            รีเซ็ต
                          </button>
                        </div>

                        {/* Depth Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[11px] text-slate-500">แสดงลึก:</span>
                          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                            {[2, 3, 4].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setMaxTreeDepth(d)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  maxTreeDepth === d
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {d} ชั้น
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Color-coding status legend */}
                      <div className="flex flex-wrap gap-2.5 text-[10px] text-slate-500 lg:justify-end">
                        <span className="font-bold text-slate-400">คำอธิบาย:</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> สมัครยังไม่ซื้อ</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> รออนุมัติ KYC</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> สมบูรณ์</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-900 inline-block"></span> สิ้นสภาพ</span>
                      </div>
                    </div>

                    <div className="overflow-auto py-8 bg-slate-50 border border-slate-100 rounded-2xl min-h-[420px] flex justify-center items-start">
                      <div 
                        style={{ 
                          zoom: treeScale,
                          display: 'inline-block'
                        }}
                        className="transition-all duration-150 ease-out p-4 min-w-max flex justify-center"
                      >
                        {binaryTree ? renderBinaryNode(binaryTree) : (
                          <p className="text-xs text-slate-400 text-center my-auto">ไม่พบผังสายงาน หรือไม่ได้อยู่ในสายงานของคุณ</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* REFERRAL SUB-TAB */}
              {mlmSubTab === 'referral' && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">👥 แผนสายงานโครงสร้างแนะนำตรง (Direct Sponsor)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">แสดงแผนผังโครงสร้างสายงานความสัมพันธ์แนะนำตรงใต้องค์กรของท่าน</p>
                  </div>

                  <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50">
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users size={16} /> โครงสร้างสายเลือดแนะนำตรง (Sponsor Lineage Tree)
                    </h4>
                    <div className="max-h-[500px] overflow-y-auto pr-2 text-xs">
                      {referralTree ? renderReferralNode(referralTree) : (
                        <p className="text-slate-400">ไม่มีสมาชิกสมัครตรงภายใต้รหัสของคุณ</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PLAN B SUB-TAB */}
              {mlmSubTab === 'planb' && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers size={18} className="text-indigo-600" /> 
                      แผนโบนัสกองทุนพิเศษออโต้รันทั่วโลก Plan B1 - B15 (Global Single Tree)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      หักคอมมิชชัน Plan A 5% เพื่อปั่นรหัสเสริมออโต้ของคนทั้งระบบไปกองร่วม เมื่อสมาชิกสะสมครบ 100 คะแนนพอยท์
                    </p>
                  </div>

                  {/* Horizontal Scroll sub-menus B1 - B15 */}
                  <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                    {Array.from({ length: 15 }).map((_, i) => {
                      const tierNum = i + 1;
                      const isSelected = planBSelectedTier === tierNum;
                      
                      return (
                        <button
                          key={tierNum}
                          onClick={() => setPlanBSelectedTier(tierNum)}
                          className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition-all border flex flex-col items-center min-w-[90px] cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10 scale-105' 
                              : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-[10px] opacity-75">กองทุนวงล้อ</span>
                          <span className="text-sm mt-0.5 font-bold">Plan B{tierNum}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Display of Selected Plan B Tier */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-100 text-indigo-600 font-extrabold rounded-2xl flex items-center justify-center text-sm shadow-inner">
                          B{planBSelectedTier}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            ความคืบหน้าโบนัสวงล้อระดับ Plan B{planBSelectedTier}
                          </h4>
                          {(() => {
                            const firstB1Node = planBData?.b1Nodes?.[0];
                            const progressVal = firstB1Node ? (firstB1Node.progress || 0) : 0;
                            const nodesCount = firstB1Node ? Math.round((progressVal * 510) / 100) : 0;
                            const b1Percentage = parseFloat(((nodesCount * 100) / 510).toFixed(2));
                            const isSuccess = planBSelectedTier === 1 ? b1Percentage >= 100 : false;
                            
                            return (
                              <span className={`mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold inline-block ${
                                isSuccess 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {isSuccess ? '🟢 Success' : '🟡 Planing'}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        กองทุนรันระบบขั้นต้นสำหรับผู้สมัครสมาชิกทุกระดับ มอบสิทธิ์ในการปันผลเมื่อคิวสายงาน Global ขยายถึง 100% ระบบจ่ายรับคอมมิชชั่น E-Money จ่ายครั้งเดียวต่อรอบปันผล +คูปอง + E-Share + สิทธิ์ระดับถัดไป จะโอนโดยอัตโนมัติ
                      </p>

                      {planBSelectedTier === 1 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-900">✨ ยอดสะสมจริงพอยท์ระบบ PLAN B</span>
                            <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                              {(planBData?.points || 0).toFixed(4)} Point
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, planBData?.points || 0)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 leading-normal">
                            *สะสมพอยท์จาก 5% ของคอมมิชชัน Plan A และ 50% ของ E-Share ครบทุกๆ 100 Point ระบบจะปั่นรหัสอัตโนมัติขึ้นสายงานกองทุน Plan B1
                          </p>
                        </div>
                      )}

                      {/* Progress calculation display */}
                      <div className="space-y-1.5">
                        {(() => {
                          const currentTierNodes = planBData?.[`b${planBSelectedTier}Nodes`] || [];
                          const firstNode = currentTierNodes[0];
                          const progressVal = firstNode ? (firstNode.progress || 0) : 0;
                          
                          return (
                            <>
                              <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>คะแนนสะสม (รหัสใต้สายงาน B{planBSelectedTier})</span>
                                <span className="text-indigo-600">
                                  {progressVal.toFixed(2)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="bg-indigo-600 h-full transition-all duration-500" 
                                  style={{ 
                                    width: `${progressVal}%` 
                                  }}
                                ></div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {(() => {
                        const getPlanBDetailsForTier = (tier: number) => {
                          let nodeValue = 100.00;
                          let totalPayout = 840.00; // Tier 1 total payout is 840 Baht
                          let partsCount = 6;
                          let partValue = totalPayout / partsCount; // 140 Baht
                          
                          if (tier > 1) {
                            for (let t = 2; t <= tier; t++) {
                              nodeValue = partValue; // nodeValue of next tier is the partValue of previous tier
                              totalPayout = 62 * (nodeValue / 5); // 62 codes under 5 layers
                              partsCount = t === 15 ? 5 : 6;
                              partValue = totalPayout / partsCount;
                            }
                          }

                          const eCashGross = partValue;
                          const eCashNet = eCashGross * 0.80;
                          
                          return {
                            nodeValue,
                            totalPayout,
                            partsCount,
                            partValue,
                            eCashGross,
                            eCashNet,
                            coupon: partValue,
                            spawnReserve: tier === 15 ? 0 : partValue,
                            allShare: partValue,
                            csr: partValue,
                            company: partValue
                          };
                        };

                        const details = getPlanBDetailsForTier(planBSelectedTier);
                        const currentTierNodes = planBData?.[`b${planBSelectedTier}Nodes`] || [];

                        const accumulatedIncome = currentTierNodes.reduce((sum: number, node: any) => {
                          const basePayout = details.eCashNet;
                          if (node.status === "Success" || (node.progress || 0) >= 100) {
                            return sum + basePayout;
                          } else {
                            const progressFactor = (node.progress || 0) / 100;
                            return sum + (basePayout * progressFactor);
                          }
                        }, 0);

                        return (
                          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[10px] text-slate-400 block font-bold">จำนวนรหัสของคุณในระดับนี้</span>
                              <strong className="text-sm text-slate-800 mt-0.5 block">
                                {`${planBData?.[`b${planBSelectedTier}Nodes`]?.length || 0} รหัส`}
                              </strong>
                            </div>
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="text-[10px] text-slate-400 block font-bold">รายได้สะสม B{planBSelectedTier}</span>
                              <strong className="text-sm text-indigo-600 mt-0.5 block font-mono">
                                ฿ {accumulatedIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </strong>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        💰 มูลค่ารับปันผลและสิทธิประโยชน์ระดับ Plan B{planBSelectedTier}
                      </h4>

                      {(() => {
                        const getPlanBDetailsForTier = (tier: number) => {
                          let nodeValue = 100.00;
                          let totalPayout = 840.00; // Tier 1 total payout is 840 Baht
                          let partsCount = 6;
                          let partValue = totalPayout / partsCount; // 140 Baht
                          
                          if (tier > 1) {
                            for (let t = 2; t <= tier; t++) {
                              nodeValue = partValue; // nodeValue of next tier is the partValue of previous tier
                              totalPayout = 62 * (nodeValue / 5); // 62 codes under 5 layers
                              partsCount = t === 15 ? 5 : 6;
                              partValue = totalPayout / partsCount;
                            }
                          }

                          const eCashGross = partValue;
                          const eCashNet = eCashGross * 0.80;
                          
                          return {
                            nodeValue,
                            totalPayout,
                            partsCount,
                            partValue,
                            eCashGross,
                            eCashNet,
                            coupon: partValue,
                            spawnReserve: tier === 15 ? 0 : partValue,
                            allShare: partValue,
                            csr: partValue,
                            company: partValue
                          };
                        };

                        const details = getPlanBDetailsForTier(planBSelectedTier);
                        return (
                          <>
                            <div className="space-y-3">
                              {(currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50 bg-rose-50/50 px-2.5 py-1.5 rounded-xl border border-rose-100">
                                  <span className="text-rose-600 font-bold">ยอดเงินสะสมในระบบ (ก่อนหัก) ★</span>
                                  <span className="font-extrabold text-rose-600 text-sm">
                                    ฿ {details.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">ยอดสุทธิเข้า E-Money (หลังหัก 20%)</span>
                                <span className="font-extrabold text-emerald-600 text-sm">
                                  ฿ {details.eCashNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / รอบ
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500">ส่วนที่ไป คูปอง ของสมาชิก (E-Coupon)</span>
                                <span className="font-bold text-slate-800">
                                  ฿ {details.coupon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              {planBSelectedTier < 15 && (
                                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                  <span className="text-slate-500">ส่วนสร้างรหัสเสริมถัดไปที่ B{planBSelectedTier + 1}</span>
                                  <span className="font-bold text-indigo-600">
                                    ฿ {details.spawnReserve.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500">ส่วน All - Share</span>
                                <span className="font-bold text-slate-800">
                                  ฿ {details.allShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500">ส่วนกองทุนปันสุข CSR</span>
                                <span className="font-bold text-slate-800">
                                  ฿ {details.csr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              {(currentUser?.role === 'Admin' || currentUser?.role === 'Manager') && (
                                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50 bg-rose-50/50 px-2.5 py-1.5 rounded-xl border border-rose-100">
                                  <span className="text-rose-600 font-bold">ส่วนรายได้ของบริษัท ★</span>
                                  <span className="font-extrabold text-rose-600">
                                    ฿ {details.company.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500">ตำแหน่งแนะนำขั้นต่ำที่ต้องการ</span>
                                <span className="font-bold text-slate-800">S ขึ้นไป</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">เมื่อสำเร็จ ลูปออโต้รันต่อไป</span>
                                <span className="font-semibold text-indigo-600">Plan B{planBSelectedTier === 15 ? 15 : planBSelectedTier + 1}</span>
                              </div>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 leading-relaxed">
                              📌 <b>หมายเหตุเงื่อนไข:</b> เมื่อสายงานของคุณได้รับการเติมเต็มอัตโนมัติ เมื่อครบ 100% ระบบจะตัดรอบจ่ายและโอนสิทธิ์คุณไปขึ้นระดับถัดไปโดยอัตโนมัติ ไม่ต้องกดทำรายการใดๆ
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Sub-nodes list table for Plan B */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        📋 ตารางรายชื่อรหัสเสริมของคุณในกองทุน Plan B{planBSelectedTier}
                      </h4>
                      {(() => {
                        const currentTierNodes = planBData?.[`b${planBSelectedTier}Nodes`] || [];
                        return (
                          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full font-bold self-start">
                            รวมทั้งหมด {currentTierNodes.length} รหัส
                          </span>
                        );
                      })()}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3.5">รหัสเสริม</th>
                              <th className="px-4 py-3.5">วันที่เข้า (สะสมครบ 100 Point)</th>
                              <th className="px-4 py-3.5 min-w-[200px]">คะแนนสะสม (รหัสใต้สายงาน)</th>
                              <th className="px-4 py-3.5 text-center">เปอร์เซ็น %</th>
                              <th className="px-4 py-3.5 text-center">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(() => {
                              const currentTierNodes = planBData?.[`b${planBSelectedTier}Nodes`] || [];
                              
                              if (currentTierNodes.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-medium">
                                      ไม่มีข้อมูลรหัสเสริมสำหรับระดับ Plan B{planBSelectedTier} ในขณะนี้
                                    </td>
                                  </tr>
                                );
                              }

                              return currentTierNodes.map((node: any, idx: number) => {
                                const progress = node.progress || 0;
                                const isSuccess = progress >= 100;
                                return (
                                  <tr key={node.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                                      {node.id || `B${planBSelectedTier}_MEMBER_${idx + 1}`}
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-500">
                                      {node.createdAt ? new Date(node.createdAt).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : '-'}
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            isSuccess ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                          }`}
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-bold text-slate-800 font-mono">
                                      {progress.toFixed(2)}%
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                        isSuccess 
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {isSuccess ? 'Success' : 'Planning'}
                                      </span>
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
                </div>
              )}
            </div>
          )}

          {/* FINANCIAL OPERATIONS */}
