import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside React tree:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Sarabun']">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
              เกิดข้อผิดพลาดในการโหลดระบบ (Application Error)
            </h1>
            
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto mb-8">
              ขออภัยค่ะ ระบบพบปัญหาด้านเทคนิคชั่วคราวขณะแสดงผลข้อมูล 
              เพื่อความปลอดภัยและความถูกต้อง กรุณาลองทำตามคำแนะนำด้านล่างนี้เพื่อแก้ไขเบื้องต้นค่ะ
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  🔄 รีโหลดหน้าจอใหม่
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  กดปุ่ม "โหลดหน้าเว็บอีกครั้ง" หรือลองเปิดใหม่อีกครั้งเพื่อโหลดข้อมูลล่าสุดจากระบบหลังบ้านค่ะ
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                  🧹 ล้างหน่วยความจำแคช
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  กดปุ่ม "รีเซ็ตและล้างข้อมูล" หากท่านเพิ่งออกจากระบบ หรือมีเซสชันเก่าค้างอยู่ในเบราว์เซอร์
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl transition cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                โหลดหน้าเว็บอีกครั้ง
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold text-sm px-6 py-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                รีเซ็ตเซสชันและล้างข้อมูลเก่า
              </button>
            </div>

            {this.state.error && (
              <div className="text-left border-t border-slate-100 pt-6 mt-6">
                <details className="group">
                  <summary className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none flex items-center gap-1">
                    <span className="transition-transform group-open:rotate-90">▶</span>
                    แสดงรายละเอียดทางเทคนิคสำหรับนักพัฒนา (Developer Logs)
                  </summary>
                  <div className="mt-3 bg-slate-900 text-rose-400 font-mono text-[11px] p-4 rounded-xl overflow-x-auto max-h-40 leading-normal border border-slate-800">
                    <p className="font-bold text-white mb-1">Error: {this.state.error.message}</p>
                    <p className="text-slate-500 whitespace-pre-wrap">{this.state.error.stack}</p>
                  </div>
                </details>
              </div>
            )}
          </div>
          <div className="mt-6 text-[10px] text-slate-400">
            © {new Date().getFullYear()} NaTee Plus (นที พลัส) • ระบบกู้คืนข้อผิดพลาดอัตโนมัติ
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
