import React, { useState, useEffect } from 'react';
import { 
  Users, Wallet, ShoppingBag, CreditCard, LayoutDashboard, 
  UserCheck, ShieldCheck, Settings, LogOut, Copy, Check, 
  TrendingUp, HelpCircle, ArrowRight, Upload, Search, 
  Trash2, Plus, Star, AlertCircle, RefreshCw, Layers, MapPin,
  Eye, EyeOff, X, ClipboardList, Printer, Lock, FileSpreadsheet,
  Coins
} from 'lucide-react';
import { thaiAddressData } from './thaiAddressData';
import { NateeWarehouseMap } from './components/NateeWarehouseMap';
import {
  initGoogleSheetsAuth,
  signInWithGoogleSheets,
  exportMembersToGoogleSheets,
  logoutGoogleSheets
} from './lib/googleSheets';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 text-xs text-slate-500 border-t border-slate-100">
      <div>
        แสดงผล <b>{totalItems === 0 ? 0 : startIndex + 1}-{endIndex}</b> จากทั้งหมด <b>{totalItems}</b> รายการ
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
        >
          ก่อนหน้า
        </button>
        <span className="font-semibold text-slate-800">
          หน้า {currentPage} จาก {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('natee_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('natee_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('natee_user');
    }
  }, [currentUser]);



  const [isUsingPollingFallback, setIsUsingPollingFallback] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dash');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isFirstLoginModal, setIsFirstLoginModal] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('natee_user');
      if (saved) {
        const u = JSON.parse(saved);
        return !!u.firstLogin;
      }
    } catch {}
    return false;
  });
  
  // Auth Form States
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sponsorId, setSponsorId] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorError, setSponsorError] = useState('');



  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regIdCard, setRegIdCard] = useState('');
  const [regBankName, setRegBankName] = useState('');
  const [regBankAccount, setRegBankAccount] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'avail' | 'taken' | null>(null);
  const [checkedSponsor, setCheckedSponsor] = useState(false);
  const [checkedUsername, setCheckedUsername] = useState(false);

  const [idCardStatus, setIdCardStatus] = useState<'checking' | 'valid' | 'dup' | 'invalid' | null>(null);
  const [idCardMessage, setIdCardMessage] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'checking' | 'valid' | 'dup' | 'invalid' | null>(null);
  const [phoneMessage, setPhoneMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState<'checking' | 'valid' | 'dup' | 'invalid' | null>(null);
  const [emailMessage, setEmailMessage] = useState('');

  // Registration Address States
  const [regIdProv, setRegIdProv] = useState('');
  const [regIdDist, setRegIdDist] = useState('');
  const [regIdSub, setRegIdSub] = useState('');
  const [regIdZip, setRegIdZip] = useState('');
  const [regIdDetails, setRegIdDetails] = useState('');
  const [regShipProv, setRegShipProv] = useState('');
  const [regShipDist, setRegShipDist] = useState('');
  const [regShipSub, setRegShipSub] = useState('');
  const [regShipZip, setRegShipZip] = useState('');
  const [regShipDetails, setRegShipDetails] = useState('');
  const [regUseSameAddress, setRegUseSameAddress] = useState(false);

  // Registration Package States
  const [regSelectedPackageId, setRegSelectedPackageId] = useState('pack_s');
  const [regSelectedTrialItems, setRegSelectedTrialItems] = useState<string[]>([]);
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  
  // Security Modal (First login PIN / pass change)
  const [newPass, setNewPass] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [firstLoginOtpSent, setFirstLoginOtpSent] = useState(false);
  const [firstLoginOtp, setFirstLoginOtp] = useState('');
  const [firstLoginSentOtp, setFirstLoginSentOtp] = useState('');
  const [isFirstLoginSendingOtp, setIsFirstLoginSendingOtp] = useState(false);
  const [isFirstLoginOtpVerified, setIsFirstLoginOtpVerified] = useState(false);
  
  
  const clearRegisterForm = (keepSponsorId?: string) => {
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegName('');
    setRegSurname('');
    setRegPhone('');
    setRegEmail('');
    setRegIdCard('');
    setRegBankName('');
    setRegBankAccount('');
    setUsernameStatus(null);
    setCheckedUsername(false);
    setIdCardStatus(null);
    setIdCardMessage('');
    setPhoneStatus(null);
    setPhoneMessage('');
    setEmailStatus(null);
    setEmailMessage('');

    if (keepSponsorId) {
      setSponsorId(keepSponsorId);
      verifySponsor(keepSponsorId);
    } else {
      setSponsorId('');
      setSponsorName('');
      setSponsorError('');
      setCheckedSponsor(false);
    }

    setRegIdProv('');
    setRegIdDist('');
    setRegIdSub('');
    setRegIdZip('');
    setRegIdDetails('');
    setRegShipProv('');
    setRegShipDist('');
    setRegShipSub('');
    setRegShipZip('');
    setRegShipDetails('');
    setRegUseSameAddress(false);
    setRegSelectedPackageId('pack_s');
    setRegSelectedTrialItems([]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setIsFirstLoginModal(false);
    setNewPin('');
    setNewPinConfirm('');
    clearRegisterForm();
  };

  // Member Profile States
  const [profile, setProfile] = useState<any>(null);
  const [isSandboxActive, setIsSandboxActive] = useState(false);
  const [togglingSandbox, setTogglingSandbox] = useState(false);

  const handleToggleSandbox = async (active: boolean, resetFromProduction: boolean = false) => {
    setTogglingSandbox(true);
    try {
      const res = await fetch('/api/admin/sandbox-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, resetFromProduction })
      });
      const data = await res.json();
      if (data.success) {
        setIsSandboxActive(data.isSandboxActive);
        showNotif(data.message, 'success');
        
        // Refresh all states
        if (currentUser) {
          fetchProfile(true);
          fetchAdminQueues();
        }
      } else {
        showNotif(data.message, 'error');
      }
    } catch (e: any) {
      showNotif("เกิดข้อผิดพลาดในการปรับสถานะโหมดทดสอบ", "error");
    } finally {
      setTogglingSandbox(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txnPerPage, setTxnPerPage] = useState<number>(20);
  const [txnCurrentPage, setTxnCurrentPage] = useState<number>(1);

  // Pagination states for reports
  const [eCashPage, setECashPage] = useState<number>(1);
  const [eMoneyPage, setEMoneyPage] = useState<number>(1);
  const [allSharePage, setESharePage] = useState<number>(1);
  const [referralsPage, setReferralsPage] = useState<number>(1);
  const [binaryPage, setBinaryPage] = useState<number>(1);

  // Pagination states for admin subtabs
  const [adminWithQueuePage, setAdminWithQueuePage] = useState<number>(1);
  const [adminMembersPage, setAdminMembersPage] = useState<number>(1);
  const [adminKycPage, setAdminKycPage] = useState<number>(1);
  const [adminKycQueuePage, setAdminKycQueuePage] = useState<number>(1);
  const [adminDepositQueuePage, setAdminDepositQueuePage] = useState<number>(1);
  const [adminOrdersProcessingPage, setAdminOrdersProcessingPage] = useState<number>(1);
  const [adminProductQueuePage, setAdminProductQueuePage] = useState<number>(1);
  const [adminActiveProductsPage, setAdminActiveProductsPage] = useState<number>(1);
  const [adminOrdersSearchPage, setAdminOrdersSearchPage] = useState<number>(1);
  const [adminPendingCouponPvPage, setAdminPendingCouponPvPage] = useState<number>(1);
  const [adminCouponPvHistoryPage, setAdminCouponPvHistoryPage] = useState<number>(1);
  const [kycForm, setKycForm] = useState({
    idCardFile: '',
    bankBookFile: '',
    address: '',
    beneficiary: '',
    relation: '',
    bankName: '',
    bankAccount: ''
  });

  // Profile Edit States
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [idProv, setIdProv] = useState('');
  const [idDist, setIdDist] = useState('');
  const [idSub, setIdSub] = useState('');
  const [idZip, setIdZip] = useState('');
  const [idDetails, setIdDetails] = useState('');
  const [shipProv, setShipProv] = useState('');
  const [shipDist, setShipDist] = useState('');
  const [shipSub, setShipSub] = useState('');
  const [shipZip, setShipZip] = useState('');
  const [shipDetails, setShipDetails] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [editUsernameStatus, setEditUsernameStatus] = useState<'avail' | 'taken' | null>(null);
  const [checkedEditUsername, setCheckedEditUsername] = useState(true);

  // Address search auto-complete states
  const [idAddressSearch, setIdAddressSearch] = useState('');
  const [shipAddressSearch, setShipAddressSearch] = useState('');
  const [idSearchSuggestions, setIdSearchSuggestions] = useState<any[]>([]);
  const [shipSearchSuggestions, setShipSearchSuggestions] = useState<any[]>([]);

  const [regIdAddressSearch, setRegIdAddressSearch] = useState('');
  const [regShipAddressSearch, setRegShipAddressSearch] = useState('');
  const [regIdSearchSuggestions, setRegIdSearchSuggestions] = useState<any[]>([]);
  const [regShipSearchSuggestions, setRegShipSearchSuggestions] = useState<any[]>([]);

  const triggerAddressSearch = (query: string, setSuggestions: (sugs: any[]) => void) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const cleanQuery = query.trim().toLowerCase();
    const results: any[] = [];
    let count = 0;
    const limit = 6;
    
    for (const prov of thaiAddressData) {
      for (const dist of prov.districts) {
        for (const sub of dist.subdistricts) {
          if (
            sub.name.toLowerCase().includes(cleanQuery) ||
            dist.name.toLowerCase().includes(cleanQuery) ||
            prov.name.toLowerCase().includes(cleanQuery) ||
            sub.zipcode.includes(cleanQuery)
          ) {
            results.push({
              province: prov.name,
              district: dist.name,
              subdistrict: sub.name,
              zipcode: sub.zipcode
            });
            count++;
            if (count >= limit) break;
          }
        }
        if (count >= limit) break;
      }
      if (count >= limit) break;
    }
    setSuggestions(results);
  };
  
  // Shop States
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ product: any; qty: number } | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [packageChoices, setPackageChoices] = useState<any[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>('');
  const [showPackageChoiceModal, setShowPackageChoiceModal] = useState<boolean>(false);
  const [pendingPurchaseProductId, setPendingPurchaseProductId] = useState<string>('');
  const [showPurchaseConfirmModal, setShowPurchaseConfirmModal] = useState<boolean>(false);
  const [confirmProduct, setConfirmProduct] = useState<any>(null);
  const [confirmChoice, setConfirmChoice] = useState<any>(null);
  const [activeSlipModal, setActiveSlipModal] = useState<string | null>(null);
  
  // Custom dialog states to replace window.confirm and window.prompt in iframe
  const [depositApproveId, setDepositApproveId] = useState<string | null>(null);
  const [depositApproveAmount, setDepositApproveAmount] = useState<string>('');
  const [depositRejectId, setDepositRejectId] = useState<string | null>(null);
  const [depositRejectReason, setDepositRejectReason] = useState<string>('');
  const [kycRejectId, setKycRejectId] = useState<string | null>(null);
  const [kycRejectReason, setKycRejectReason] = useState<string>('');
  
  // Transactions States
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [topupDecimal, setTopupDecimal] = useState<string>('');
  const [topupSlip, setTopupSlip] = useState<string>('');
  const [topupSlipBase64, setTopupSlipBase64] = useState<string>('');
  const [topupActualAmount, setTopupActualAmount] = useState<string>('');
  
  // System Bank Settings State
  const [bankSettings, setBankSettings] = useState<any>({
    bankName: "ธนาคารไทยพาณิชย์",
    bankAccount: "111-222-3333",
    bankAccountName: "บริษัท นที พลัส จำกัด",
    qrCodeUrl: ""
  });
  const [editingBankName, setEditingBankName] = useState("");
  const [editingBankAccount, setEditingBankAccount] = useState("");
  const [editingBankAccountName, setEditingBankAccountName] = useState("");
  const [editingBankQrFile, setEditingBankQrFile] = useState<string | null>(null);
  const [editingBankQrPreview, setEditingBankQrPreview] = useState<string | null>(null);
  const [isSavingBankSettings, setIsSavingBankSettings] = useState(false);
  const [isSubmittingTopup, setIsSubmittingTopup] = useState<boolean>(false);
  const [topupTransferDate, setTopupTransferDate] = useState<string>(() => {
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const DD = String(today.getDate()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD}`;
  });
  const [topupTransferHour, setTopupTransferHour] = useState<string>(() => {
    const today = new Date();
    return String(today.getHours()).padStart(2, '0');
  });
  const [topupTransferMinute, setTopupTransferMinute] = useState<string>(() => {
    const today = new Date();
    return String(today.getMinutes()).padStart(2, '0');
  });
  const [transferUser, setTransferUser] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangePin, setExchangePin] = useState('');

  // E-Money transaction form states
  const [ecashToEmoneyAmount, setEcashToEmoneyAmount] = useState('');
  const [ecashToEmoneyPin, setEcashToEmoneyPin] = useState('');
  const [emoneyToEcashAmount, setEmoneyToEcashAmount] = useState('');
  const [emoneyToEcashPin, setEmoneyToEcashPin] = useState('');
  const [emoneyToEcouponAmount, setEmoneyToEcouponAmount] = useState('');
  const [emoneyToEcouponPin, setEmoneyToEcouponPin] = useState('');
  const [withdrawEmoneyAmount, setWithdrawEmoneyAmount] = useState('');
  const [withdrawEmoneyPin, setWithdrawEmoneyPin] = useState('');
  
  // MLM Trees States
  const [binaryTree, setBinaryTree] = useState<any>(null);
  const [binaryTreeParentId, setBinaryTreeParentId] = useState<string | null>(null);
  const [referralTree, setReferralTree] = useState<any>(null);
  const [planBData, setPlanBData] = useState<any>(null);
  const [mlmSearchId, setMlmSearchId] = useState('');
  const [treeScale, setTreeScale] = useState<number>(0.85);
  const [maxTreeDepth, setMaxTreeDepth] = useState<number>(3);
  const [planBSubTab, setPlanBSubTab] = useState<'b1' | 'b2'>('b1');
  const [adminSubTab, setAdminSubTab] = useState<'queues' | 'members' | 'couponPv' | 'systemReset' | 'memberApprovals' | 'shippingApprove' | 'manageShops' | 'orderStatus' | 'bankSettings' | 'depositApprove'>('queues');
  const [allSellerProducts, setAllSellerProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [mlmSubTab, setMlmSubTab] = useState<'referral' | 'binary' | 'planb'>('binary');
  const [planBSelectedTier, setPlanBSelectedTier] = useState<number>(1);
  const [showMlmRegisterModal, setShowMlmRegisterModal] = useState(false);
  
  // Seller States
  const [sellerStoreName, setSellerStoreName] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [warehouseLat, setWarehouseLat] = useState<number | null>(13.7563);
  const [warehouseLng, setWarehouseLng] = useState<number | null>(100.5018);
  const [pdpaAgreed, setPdpaAgreed] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    pv: '',
    description: '',
    shortDescription: '',
    category: 'General',
    imageFile: '',
    cost: ''
  });
  const [shopSubTab, setShopSubTab] = useState<'packages' | 'shop'>('packages');
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [sellerPortalTab, setSellerPortalTab] = useState<'products' | 'orders'>('products');
  const [sellerShippingTracking, setSellerShippingTracking] = useState<{[key: string]: { company: string, trackingNo: string, note: string }}>({});
  
  // CSR scrolling text state
  const [csrFeed, setCsrFeed] = useState<any[]>([]);
  const [csrBalance, setCsrBalance] = useState<number>(0);
  const [csrWithAmt, setCsrWithAmt] = useState('');
  const [csrWithPurpose, setCsrWithPurpose] = useState('');
  const [csrManagerOtp, setCsrManagerOtp] = useState('');
  
  // Admin queues
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [storeQueue, setStoreQueue] = useState<any[]>([]);
  const [prodQueue, setProdQueue] = useState<any[]>([]);
  const [withQueue, setWithQueue] = useState<any[]>([]);
  const [depositQueue, setDepositQueue] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [shippingTracking, setShippingTracking] = useState<{[key: string]: { company: string, trackingNo: string, note: string }}>({});

  // Coupon PV Management States
  const [pendingCouponPv, setPendingCouponPv] = useState<any[]>([]);
  const [couponPvHistory, setCouponPvHistory] = useState<any[]>([]);
  const [processingCouponPv, setProcessingCouponPv] = useState<boolean>(false);

  // Registration OTP States
  const [regOtp, setRegOtp] = useState('');
  const [sentRegOtp, setSentRegOtp] = useState('');
  const [isRegOtpSent, setIsRegOtpSent] = useState(false);
  const [isRegOtpVerified, setIsRegOtpVerified] = useState(false);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);

  // Profile Change Password States
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangePinDigits, setPasswordChangePinDigits] = useState<string[]>(Array(6).fill(''));

  // Profile Change PIN States
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinChangeOtpDigits, setPinChangeOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [isPinOtpSent, setIsPinOtpSent] = useState(false);
  const [sentPinOtp, setSentPinOtp] = useState('');
  const [isSendingPinOtp, setIsSendingPinOtp] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // System Reset States
  const [resetConfirmationInput, setResetConfirmationInput] = useState<string>('');
  const [resettingSystem, setResettingSystem] = useState<boolean>(false);
  const [syncingFirestore, setSyncingFirestore] = useState<boolean>(false);
  const [rebuildingTree, setRebuildingTree] = useState<boolean>(false);

  // Admin Member Management
  const [adminMembersList, setAdminMembersList] = useState<any[]>([]);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [adminNewChoicePackageId, setAdminNewChoicePackageId] = useState('pack_m');
  const [adminNewChoiceName, setAdminNewChoiceName] = useState('');
  const [adminNewChoiceCost, setAdminNewChoiceCost] = useState('');
  const [withDeductions, setWithDeductions] = useState<{[key: string]: string}>({});

  // Google Sheets Export States
  const [googleSheetsToken, setGoogleSheetsToken] = useState<string | null>(null);
  const [googleSheetsUser, setGoogleSheetsUser] = useState<any | null>(null);
  const [isExportingToSheets, setIsExportingToSheets] = useState(false);
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleSheetsAuth(
      (user, token) => {
        setGoogleSheetsUser(user);
        setGoogleSheetsToken(token);
      },
      () => {
        setGoogleSheetsUser(null);
        setGoogleSheetsToken(null);
      }
    );
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleExportToGoogleSheets = async () => {
    let token = googleSheetsToken;
    let user = googleSheetsUser;

    try {
      if (!token) {
        const result = await signInWithGoogleSheets();
        if (result) {
          token = result.accessToken;
          user = result.user;
          setGoogleSheetsToken(token);
          setGoogleSheetsUser(user);
          showNotif('เชื่อมต่อบัญชี Google สำเร็จ!', 'success');
        } else {
          showNotif('ไม่สามารถเชื่อมต่อบัญชี Google ได้', 'error');
          return;
        }
      }

      setIsExportingToSheets(true);
      setExportedSheetUrl(null);

      // Prepare member data
      const dataToExport = adminMembersList.map((m: any) => ({
        userId: m.userId || '',
        username: m.username || '',
        name: m.name || '',
        surname: m.surname || '',
        phone: m.phone || '',
        email: m.email || '',
        rank: m.rank || 'S',
        role: m.role || 'Member',
        balanceECash: m.balanceECash || 0,
        balanceECoupon: m.balanceECoupon || 0,
        totalEarnings: m.totalEarnings || 0,
        totalCouponsEarned: m.totalCouponsEarned || 0,
        sponsorId: m.sponsorId || '',
        createdAt: m.createdAt || ''
      }));

      const result = await exportMembersToGoogleSheets(dataToExport, token);
      setExportedSheetUrl(result.spreadsheetUrl);
      showNotif('แชร์รายชื่อสมาชิกลง Google Sheet สำเร็จแล้วค่ะ!', 'success');
    } catch (err: any) {
      console.error('Export Google Sheets Error:', err);
      showNotif(err.message || 'เกิดข้อผิดพลาดในการส่งออกข้อมูล', 'error');
    } finally {
      setIsExportingToSheets(false);
    }
  };

  const handleDisconnectGoogleSheets = async () => {
    try {
      await logoutGoogleSheets();
      setGoogleSheetsToken(null);
      setGoogleSheetsUser(null);
      setExportedSheetUrl(null);
      showNotif('ยกเลิกการเชื่อมต่อบัญชี Google สำเร็จ', 'info');
    } catch (err: any) {
      showNotif('เกิดข้อผิดพลาดในการยกเลิกการเชื่อมต่อ', 'error');
    }
  };
  
  // Order Search States
  const [orderSearchId, setOrderSearchId] = useState('');
  const [orderSearchDate, setOrderSearchDate] = useState('');
  const [orderSearchUserId, setOrderSearchUserId] = useState('');
  const [orderSearchStatus, setOrderSearchStatus] = useState('');
  
  // Report States
  const [reportSubTab, setReportSubTab] = useState<'ecash' | 'emoney' | 'ecoupon' | 'eshare' | 'referrals' | 'binary'>('ecash');
  const [memberOrders, setMemberOrders] = useState<any[]>([]);
  const [directReferrals, setDirectReferrals] = useState<any[]>([]);
  const [binaryDescendants, setBinaryDescendants] = useState<any[]>([]);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any | null>(null);

  // Financial Transaction Confirmation Modal state
  const [txnConfirm, setTxnConfirm] = useState<{
    type: 'transfer_ecash_member' | 'transfer_ecash_emoney' | 'transfer_emoney_ecash' | 'transfer_emoney_ecoupon' | 'withdraw_emoney' | 'buy_coupon';
    amount: number;
    pin: string;
    recipientIdOrPhone?: string;
    recipientName?: string;
    feeAmount?: number;
    netAmount?: number;
  } | null>(null);
  const [isVerifyingRecipient, setIsVerifyingRecipient] = useState(false);
  const [txnOtp, setTxnOtp] = useState('');
  const [isSendingTxnOtp, setIsSendingTxnOtp] = useState(false);
  const [sentTxnOtp, setSentTxnOtp] = useState('');
  const [isTxnOtpSent, setIsTxnOtpSent] = useState(false);

  useEffect(() => {
    setTxnOtp('');
    setSentTxnOtp('');
    setIsTxnOtpSent(false);
  }, [txnConfirm]);

  // Reset pagination pages to 1 when search queries or tabs change
  useEffect(() => {
    setECashPage(1);
    setEMoneyPage(1);
    setESharePage(1);
    setReferralsPage(1);
    setBinaryPage(1);
    setAdminWithQueuePage(1);
    setAdminMembersPage(1);
    setAdminKycQueuePage(1);
    setAdminDepositQueuePage(1);
    setAdminOrdersProcessingPage(1);
    setAdminProductQueuePage(1);
    setAdminActiveProductsPage(1);
    setAdminOrdersSearchPage(1);
    setAdminPendingCouponPvPage(1);
    setAdminCouponPvHistoryPage(1);
  }, [searchMemberQuery, prodSearchQuery, orderSearchId, orderSearchUserId, orderSearchDate, orderSearchStatus, activeTab, reportSubTab, adminSubTab]);

  // Sound on money (E-Cash) deposit addition (cha-ching money sound effect + actual net amount)
  const playMoneySound = (amount?: number, messageType: 'deposit' | 'bonus' | 'general' = 'general') => {
    try {
      const AudioCtxClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
      if (AudioCtxClass && typeof AudioCtxClass === 'function') {
        try {
          const audioCtx = new AudioCtxClass();
          const now = audioCtx.currentTime;

          // Double high-pitch coin clink (cha-ching effect)
          const osc1 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(1500, now);
          osc1.frequency.exponentialRampToValueAtTime(2000, now + 0.05);
          gain1.gain.setValueAtTime(0.15, now);
          gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc1.connect(gain1);
          gain1.connect(audioCtx.destination);
          osc1.start(now);
          osc1.stop(now + 0.08);

          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1800, now + 0.08);
          osc2.frequency.exponentialRampToValueAtTime(2500, now + 0.15);
          gain2.gain.setValueAtTime(0.15, now + 0.08);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.22);

          const osc3 = audioCtx.createOscillator();
          const gain3 = audioCtx.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(1200, now + 0.12);
          gain3.gain.setValueAtTime(0.08, now + 0.12);
          gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc3.connect(gain3);
          gain3.connect(audioCtx.destination);
          osc3.start(now + 0.12);
          osc3.stop(now + 0.6);
        } catch (err) {
          console.log("AudioContext failed:", err);
        }
      }

      // Voice synthesis after a short delay (0.6s) so the sound effect finishes first
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function') {
        setTimeout(() => {
          try {
            // Cancel any currently speaking voices to prevent overlapping
            window.speechSynthesis.cancel();

            let text = "";
            if (messageType === 'deposit') {
              text = amount ? `เติมเงินสำเร็จแล้ว ยอดเงินเข้า ${amount} บาทค่ะ` : "เติมเงินสำเร็จแล้วค่ะ";
            } else if (messageType === 'bonus') {
              text = amount ? `มีโบนัสเข้า ยอดเงิน ${amount} บาทค่ะ` : "มีโบนัสเข้าค่ะ";
            } else {
              text = amount ? `มีโบนัสเข้า ยอดเงิน ${amount} บาทค่ะ` : "มีโบนัสเข้าค่ะ";
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'th-TH';
            utterance.rate = 1.0; // Standard natural rate
            utterance.pitch = 1.05; // Slightly pleasant pitch
            utterance.volume = 1.0;
            
            // Explicitly look for a Thai female voice
            const voices = window.speechSynthesis.getVoices();
            const thVoices = voices.filter(v => v.lang.startsWith('th') || v.lang === 'th-TH' || v.lang === 'th_TH');
            if (thVoices.length > 0) {
              // Standard names for iOS/macOS/Windows/Android female voices: 'kanya', 'narisa', 'google', 'online', 'female', etc.
              const femaleVoice = thVoices.find(v => 
                v.name.toLowerCase().includes('kanya') || 
                v.name.toLowerCase().includes('narisa') ||
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('google') ||
                v.name.toLowerCase().includes('siri') ||
                v.name.toLowerCase().includes('pattara') ||
                v.name.toLowerCase().includes('online') ||
                v.name.toLowerCase().includes('premium')
              );
              utterance.voice = femaleVoice || thVoices[0];
            }

            window.speechSynthesis.speak(utterance);
          } catch (err) {
            console.log("Speech synthesis failed:", err);
          }
        }, 600);
      }
    } catch (e) {
      console.log("Audio play failed:", e);
    }
  };

  // Trigger temporary notification
  const showNotif = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotif({ message: msg, type });
    setTimeout(() => setNotif(null), 5000);
  };

  // Handle URL sponsor parameter on mount
  useEffect(() => {
    // Warm up/preload speechSynthesis voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        const handleVoicesChanged = () => {
          window.speechSynthesis.getVoices();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        return () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
      } catch (err) {
        console.log("Failed to initialize speechSynthesis listener:", err);
      }
    }
  }, []);

  useEffect(() => {
    // Check initial sandbox status
    fetch('/api/admin/sandbox-status')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.isSandboxActive !== undefined) {
          setIsSandboxActive(d.isSandboxActive);
        }
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const sponsor = params.get('sponsor');
    
    if (window.location.pathname.includes('/join') || window.location.pathname.includes('/register') || sponsor) {
      setAuthMode('register');
    }
    
    if (sponsor) {
      setSponsorId(sponsor);
      // Look up sponsor name
      fetch(`/api/auth/sponsor/${sponsor}`)
        .then(res => res.json())
        .then(d => {
          if (d.success) {
            setSponsorName(d.name);
            setSponsorError('');
          } else {
            setSponsorName('');
            setSponsorError('ไม่พบรหัสผู้แนะนำนี้ในระบบ');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Fetch initial profile & dashboard data on login
  useEffect(() => {
    if (currentUser) {
      fetchProfile(true);
      fetchTransactions();
      fetchProducts();
      fetchMlmTrees();
      fetchCsrFeed();
      fetchReports();
      fetchBankSettings();
      if (currentUser.role === 'Admin' || currentUser.role === 'Manager') {
        fetchAdminQueues();
      }
    }
  }, [currentUser]);

  // Fetch reports when reports tab is active
  useEffect(() => {
    if (currentUser && activeTab === 'report') {
      fetchReports();
    }
  }, [activeTab, currentUser]);

  // Fetch seller data when seller tab is active
  useEffect(() => {
    if (currentUser && activeTab === 'seller') {
      fetchSellerData();
    }
  }, [activeTab, currentUser]);

  // Handle real-time Firestore synchronization for all application data
  useEffect(() => {
    if (!currentUser) return;
    setIsUsingPollingFallback(false);

    let activeUnsubscribes: (() => void)[] = [];
    let fallbackInterval: NodeJS.Timeout | null = null;
    let usingPollingFallback = false;

    const activateFallbackPolling = (reason: string) => {
      if (usingPollingFallback) return;
      usingPollingFallback = true;
      setIsUsingPollingFallback(true);
      console.warn(`⚠️ Firestore Real-time listener failed (${reason}). Activating fallback HTTP polling...`);
      
      // Clear any current Firestore subscriptions to save network/resources
      activeUnsubscribes.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
      activeUnsubscribes = [];

      // Start Polling Fallback immediately and then periodically
      let prevBalance = 0;
      if (profile) {
        prevBalance = profile.balanceECash;
      }

      const runPoll = () => {
        fetch('/api/sync-state')
          .then(res => res.json())
          .then(resData => {
            if (resData.success && resData.data) {
              const data = resData.data;
              if (resData.isSandboxActive !== undefined) {
                setIsSandboxActive(resData.isSandboxActive);
              }

              // 1. Sync Members
              const members = data.members || [];
              setAdminMembersList(members);
              const currentMember = members.find((m: any) => m.userId === currentUser.userId);
              if (currentMember) {
                setProfile((prevProfile: any) => {
                  if (prevProfile) {
                    const prevB = prevProfile.balanceECash;
                    const newBalance = currentMember.balanceECash;
                    if (newBalance > prevB && prevB > 0) {
                      const diff = parseFloat((newBalance - prevB).toFixed(4));
                      showNotif(`ยอดเงิน E-Cash ของคุณเพิ่มขึ้น +${diff.toLocaleString()} บาท`, 'success');
                      playMoneySound(diff, 'general');
                    }
                  }
                  return currentMember;
                });
                if (currentMember.firstLogin) {
                  setIsFirstLoginModal(true);
                }
              }
              if (currentUser.role === 'Admin' || currentUser.role === 'Manager') {
                setKycQueue(members.filter((m: any) => m.statusKyc === 'Pending'));
              }

              // 2. Sync Transactions & Queues
              const transactions = data.transactions || [];
              setTransactions(transactions.filter((t: any) => t.userId === currentUser.userId));
              setWithQueue(transactions.filter((t: any) => t.type === 'WithdrawalRequest' && t.status === 'Pending'));
              setDepositQueue(transactions.filter((t: any) => t.type === 'Deposit' && t.status === 'Pending'));

              // 3. Sync Orders
              const orders = data.orders || [];
              setMemberOrders(orders.filter((o: any) => o.userId === currentUser.userId));
              setAdminOrders(orders);
              setSellerOrders(orders.filter((o: any) => o.sellerId === currentUser.userId));

              // 4. Sync Products
              setProducts(data.products || []);

              // 5. Sync Seller Products
              const sellerProducts = data.sellerProducts || [];
              setSellerProducts(sellerProducts.filter((p: any) => p.sellerId === currentUser.userId));
              setAllSellerProducts(sellerProducts);
              setProdQueue(sellerProducts.filter((p: any) => p.status === 'Pending'));

              // 6. Sync CSR Fund
              const csrFund = data.csrFund || { balance: 0, history: [] };
              setCsrFeed(csrFund.history || []);
              setCsrBalance(csrFund.balance || 0);

              // 7. Sync System Stats
              setAdminStats(data.systemStats || null);

              // 8. Sync Package Choices
              setPackageChoices(data.packageProductChoices || []);

              // 9. Sync Bank Settings
              if (data.bankSettings) {
                setBankSettings(data.bankSettings);
              }
            }
          })
          .catch(e => console.error("Poll sync-state error:", e));
      };

      runPoll();
      fallbackInterval = setInterval(runPoll, 7000);
    };

    const setupRealTimeSync = async () => {
      try {
        const resConfig = await fetch('/api/firebase-config');
        const dConfig = await resConfig.json();
        if (!dConfig.success || !dConfig.config) {
          throw new Error("No Firebase config returned from server");
        }

        if (dConfig.isFirestoreQuotaExceeded) {
          console.warn("⚠️ Firestore daily write quota is exceeded on the server. Activating local polling fallback directly!");
          setIsUsingPollingFallback(true);
          activateFallbackPolling("Firestore write quota exceeded on server");
          return;
        }

        const config = dConfig.config;
        const firebaseApp = initializeApp(config);
        const dbFirestore = getFirestore(firebaseApp, config.firestoreDatabaseId);

        const collectionName = isSandboxActive ? 'app_sections_sandbox' : 'app_sections';
        console.log(`🔥 [Client] Initializing Firestore onSnapshot real-time listener on collection: ${collectionName}`);

        // Safe helper to subscribe and add to unsubscribe list
        const safeSubscribe = (docName: string, onNext: (snapshot: any) => void) => {
          if (usingPollingFallback) return;
          
          let unsub: (() => void) | null = null;
          const onError = (error: any) => {
            console.error(`onSnapshot ${docName} error:`, error);
            const isQuota = error.message && (
              error.message.includes("RESOURCE_EXHAUSTED") ||
              error.message.includes("quota") ||
              error.message.includes("Quota") ||
              error.message.includes("exhausted")
            );
            if (isQuota) {
              fetch('/api/report-quota-exceeded', { method: 'POST' }).catch(() => {});
            }
            activateFallbackPolling(`${docName} failed: ${error.message}`);
            if (unsub) {
              try { unsub(); } catch (e) {}
            }
          };

          try {
            unsub = onSnapshot(doc(dbFirestore, collectionName, docName), onNext, onError);
            if (usingPollingFallback) {
              if (unsub) {
                try { unsub(); } catch (e) {}
              }
            } else if (unsub) {
              activeUnsubscribes.push(unsub);
            }
          } catch (err: any) {
            console.error(`Error subscribing to ${docName}:`, err);
            activateFallbackPolling(`${docName} catch failed: ${err.message}`);
          }
        };

        // 1. Members document listener
        safeSubscribe('members', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || [];
            setAdminMembersList(data);
            
            const currentMember = data.find((m: any) => m.userId === currentUser.userId);
            if (currentMember) {
              setProfile((prevProfile: any) => {
                if (prevProfile) {
                  const prevBalance = prevProfile.balanceECash;
                  const newBalance = currentMember.balanceECash;
                  if (newBalance > prevBalance && prevBalance > 0) {
                    const diff = parseFloat((newBalance - prevBalance).toFixed(4));
                    
                    // Look up transactions for recent approved deposit vs bonus
                    fetch(`/api/member/transactions/${currentUser.userId}`)
                      .then(tRes => tRes.json())
                      .then(tData => {
                        let isDeposit = false;
                        let depositAmount = diff;

                        if (tData.success && tData.transactions) {
                          const recentDeposit = tData.transactions.find((t: any) => {
                            const isDepType = t.type === "Deposit" || t.type === "Deposit_System";
                            const isApproved = t.status === "Approved";
                            const isRecent = (new Date().getTime() - new Date(t.createdAt).getTime()) < 60000;
                            return isDepType && isApproved && isRecent;
                          });

                          if (recentDeposit) {
                            isDeposit = true;
                            depositAmount = recentDeposit.transferAmount || recentDeposit.amount || diff;
                          }
                        }

                        if (isDeposit) {
                          showNotif(`เติมเงิน E-Cash สำเร็จแล้ว! +${depositAmount.toLocaleString()} บาท (ได้รับยอดจริงครบถ้วนแล้วค่ะ)`, 'success');
                          playMoneySound(depositAmount, 'deposit');
                        } else {
                          showNotif(`ได้รับปันผลสำเร็จ! +${diff.toLocaleString()} บาท จาก Bonus/E-Share`, 'success');
                          playMoneySound(diff, 'bonus');
                        }
                      })
                      .catch(() => {
                        showNotif(`ยอดเงิน E-Cash ของคุณเพิ่มขึ้น +${diff.toLocaleString()} บาท`, 'success');
                        playMoneySound(diff, 'general');
                      });
                  }
                }
                return currentMember;
              });
              
              if (currentMember.firstLogin) {
                setIsFirstLoginModal(true);
              }
            }

            // Update kycQueue for admins
            if (currentUser.role === 'Admin' || currentUser.role === 'Manager') {
              setKycQueue(data.filter((m: any) => m.statusKyc === 'Pending'));
            }
          }
        });

        // 2. Transactions document listener
        safeSubscribe('transactions', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || [];
            setTransactions(data.filter((t: any) => t.userId === currentUser.userId));
            setWithQueue(data.filter((t: any) => t.type === 'WithdrawalRequest' && t.status === 'Pending'));
            setDepositQueue(data.filter((t: any) => t.type === 'Deposit' && t.status === 'Pending'));
          }
        });

        // 3. Orders document listener
        safeSubscribe('orders', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || [];
            setMemberOrders(data.filter((o: any) => o.userId === currentUser.userId));
            setAdminOrders(data);
            setSellerOrders(data.filter((o: any) => o.sellerId === currentUser.userId));
          }
        });

        // 4. Products document listener
        safeSubscribe('products', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || [];
            setProducts(data);
          }
        });

        // 5. Seller Products document listener
        safeSubscribe('sellerProducts', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || [];
            setSellerProducts(data.filter((p: any) => p.sellerId === currentUser.userId));
            setAllSellerProducts(data);
            setProdQueue(data.filter((p: any) => p.status === 'Pending'));
          }
        });

        // 6. CSR Fund document listener
        safeSubscribe('csrFund', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || { balance: 0, history: [] };
            setCsrFeed(data.history || []);
            setCsrBalance(data.balance || 0);
          }
        });

        // 7. System Stats document listener
        safeSubscribe('systemStats', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || null;
            setAdminStats(data);
          }
        });

        // 8. Package product choices document listener
        safeSubscribe('packageProductChoices', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || [];
            setPackageChoices(data);
          }
        });

        // 9. Bank settings document listener
        safeSubscribe('bankSettings', (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data || null;
            if (data) {
              setBankSettings(data);
            }
          }
        });

      } catch (err: any) {
        activateFallbackPolling(err?.message || "initial setup failed");
      }
    };

    setupRealTimeSync();

    return () => {
      console.log("🧹 Tearing down real-time active listeners / timers");
      activeUnsubscribes.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [currentUser, isSandboxActive]);

  const getRemainingRights = () => {
    if (profile?.role === 'Manager' || profile?.role === 'Admin') return 999999999;
    if (profile?.rank === 'Member') return 0;

    if (profile?.eligibleRights !== undefined) {
      return profile.eligibleRights;
    }

    let basePackage = 0;
    const r = profile?.rank || 'S';
    if (r === 'S') basePackage = 100;
    else if (r === 'M') basePackage = 500;
    else if (r === 'L') basePackage = 1000;
    else if (r === 'XL') basePackage = 3000;
    else if (r === 'XXL') basePackage = 5000;
    else basePackage = 100;

    const maxRights = basePackage * 10;
    const totalWithdrawn = transactions
      .filter(t => t.type === 'Withdrawal' && t.status === 'Approved')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Remaining rights decreases based on withdrawals. 
    // To match user's explicit example: XXL (5000) -> 10x is 50000. 
    // If withdrawn 500, remaining rights displays 45500.
    // Formula matches: maxRights - (totalWithdrawn * 9)
    const remaining = maxRights - (totalWithdrawn * 9);
    return Math.max(0, remaining);
  };

  const fetchProfile = async (shouldSyncEditStates = false) => {
    try {
      const res = await fetch(`/api/member/profile/${currentUser.userId}`);
      const data = await res.json();
      if (data.success) {
        if (data.isSandboxActive !== undefined) {
          setIsSandboxActive(data.isSandboxActive);
        }
        setProfile(data.profile);
        setShippingAddress(data.profile.kycAddress || '');
        if (data.profile.firstLogin) {
          setIsFirstLoginModal(true);
        }

        if (shouldSyncEditStates) {
          const p = data.profile;
          setEditUsername(p.username || '');
          setEditEmail(p.email || '');
          setEditPhone(p.phone || '');
          setEditBankName(p.bankName || '');
          setEditBankAccount(p.bankAccount || '');
          
          const idAddr = p.idAddress || {};
          setIdProv(idAddr.province || '');
          setIdDist(idAddr.district || '');
          setIdSub(idAddr.subdistrict || '');
          setIdZip(idAddr.zipcode || '');
          setIdDetails(idAddr.details || '');
          
          if (idAddr.subdistrict && idAddr.district && idAddr.province && idAddr.zipcode) {
            setIdAddressSearch(`${idAddr.subdistrict} » ${idAddr.district} » ${idAddr.province} » ${idAddr.zipcode}`);
          } else {
            setIdAddressSearch('');
          }

          const shipAddr = p.shippingAddress || {};
          setShipProv(shipAddr.province || '');
          setShipDist(shipAddr.district || '');
          setShipSub(shipAddr.subdistrict || '');
          setShipZip(shipAddr.zipcode || '');
          setShipDetails(shipAddr.details || '');

          if (shipAddr.subdistrict && shipAddr.district && shipAddr.province && shipAddr.zipcode) {
            setShipAddressSearch(`${shipAddr.subdistrict} » ${shipAddr.district} » ${shipAddr.province} » ${shipAddr.zipcode}`);
          } else {
            setShipAddressSearch('');
          }

          setUseSameAddress(p.useSameAddress ?? false);
          setEditUsernameStatus(null);
          setCheckedEditUsername(true);

          setKycForm({
            idCardFile: '',
            bankBookFile: '',
            address: p.kycAddress || '',
            beneficiary: p.kycBeneficiary || '',
            relation: p.kycRelation || '',
            bankName: p.bankName || '',
            bankAccount: p.bankAccount || ''
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync ID address to Shipping Address if useSameAddress is checked
  useEffect(() => {
    if (useSameAddress) {
      setShipProv(idProv);
      setShipDist(idDist);
      setShipSub(idSub);
      setShipZip(idZip);
      setShipDetails(idDetails);
    }
  }, [useSameAddress, idProv, idDist, idSub, idZip, idDetails]);

  // Sync registration ID address to Shipping Address if regUseSameAddress is checked
  useEffect(() => {
    if (regUseSameAddress) {
      setRegShipProv(regIdProv);
      setRegShipDist(regIdDist);
      setRegShipSub(regIdSub);
      setRegShipZip(regIdZip);
      setRegShipDetails(regIdDetails);
    }
  }, [regUseSameAddress, regIdProv, regIdDist, regIdSub, regIdZip, regIdDetails]);

  // Handle checking edit username
  const checkEditUsername = async (u: string) => {
    if (!u) {
      showNotif('กรุณากรอกชื่อผู้ใช้ที่ต้องการตรวจสอบ', 'error');
      return;
    }
    if (u === profile?.username) {
      setEditUsernameStatus('avail');
      setCheckedEditUsername(true);
      showNotif('ชื่อผู้ใช้นี้เป็นของคุณอยู่แล้ว', 'success');
      return;
    }
    if (u.length < 4) {
      showNotif('ชื่อผู้ใช้ต้องยาวอย่างน้อย 4 ตัวอักษร', 'error');
      setEditUsernameStatus('taken');
      setCheckedEditUsername(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u })
      });
      const d = await res.json();
      if (d.success) {
        setEditUsernameStatus('avail');
        setCheckedEditUsername(true);
        showNotif('ชื่อผู้ใช้นี้สามารถใช้งานได้!', 'success');
      } else {
        setEditUsernameStatus('taken');
        setCheckedEditUsername(false);
        showNotif('ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาใช้ชื่ออื่น', 'error');
      }
    } catch (err) {
      setCheckedEditUsername(false);
      showNotif('เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้', 'error');
    }
  };

  // Save/Update user profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername || !editEmail || !editPhone) {
      showNotif('กรุณากรอก Username, อีเมล และเบอร์โทรศัพท์ให้ครบถ้วนค่ะ', 'error');
      return;
    }
    if (!checkedEditUsername && editUsername !== profile?.username) {
      showNotif('กรุณากดปุ่มตรวจสอบชื่อผู้ใช้และตรวจสอบให้ผ่านก่อนทำการบันทึกค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          username: editUsername,
          email: editEmail,
          phone: editPhone,
          bankName: editBankName,
          bankAccount: editBankAccount,
          idAddress: {
            province: idProv,
            district: idDist,
            subdistrict: idSub,
            zipcode: idZip,
            details: idDetails
          },
          shippingAddress: {
            province: shipProv,
            district: shipDist,
            subdistrict: shipSub,
            zipcode: shipZip,
            details: shipDetails
          },
          useSameAddress
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        if (data.profile) {
          setCurrentUser((prev: any) => {
            const updated = { ...prev, username: data.profile.username };
            localStorage.setItem('natee_user', JSON.stringify(updated));
            return updated;
          });
        }
        fetchProfile(true); // Refresh profile state with sync
      } else {
        showNotif(data.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว', 'error');
    }
  };

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = passwordChangePinDigits.join('');
    if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
      showNotif('กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วนค่ะ', 'error');
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      showNotif('รหัสผ่านใหม่สองช่องไม่ตรงกันค่ะ', 'error');
      return;
    }
    if (pinStr.length !== 6) {
      showNotif('กรุณากรอกรหัสธุรกรรม PIN 6 หลักให้ครบทั้ง 6 ช่องค่ะ', 'error');
      return;
    }
    
    const hasUpper = /[A-Z]/.test(newPasswordInput);
    const hasLower = /[a-z]/.test(newPasswordInput);
    const hasNum = /[0-9]/.test(newPasswordInput);
    const hasSpec = /[^A-Za-z0-9]/.test(newPasswordInput);
    const isEng = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(newPasswordInput);
    const isLen = newPasswordInput.length >= 6;
    
    if (!hasUpper || !hasLower || !hasNum || !hasSpec || !isEng || !isLen) {
      showNotif('รหัสผ่านใหม่ไม่ปลอดภัยตามเงื่อนไขความปลอดภัยค่ะ (ต้องประกอบด้วย A-Z, a-z, 0-9, อักขระพิเศษ อย่างน้อย 6 ตัวอักษร)', 'error');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
          pin: pinStr
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotif('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้วค่ะ', 'success');
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmNewPasswordInput('');
        setPasswordChangePinDigits(Array(6).fill(''));
      } else {
        showNotif(data.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Send transaction OTP handler
  const handleSendTxnOtp = async () => {
    if (!currentUser) return;
    setIsSendingTxnOtp(true);
    try {
      const res = await fetch('/api/member/send-transaction-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.userId })
      });
      const d = await res.json();
      if (d.success) {
        setSentTxnOtp(d.otp);
        setIsTxnOtpSent(true);
        showNotif(d.message, 'success');
        alert(`📧 [จำลองการส่งอีเมล] รหัส OTP สำหรับยืนยันการทำธุรกรรมของคุณคือ: ${d.otp}`);
      } else {
        showNotif(d.message || 'เกิดข้อผิดพลาดในการส่ง OTP', 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย', 'error');
    } finally {
      setIsSendingTxnOtp(false);
    }
  };

  // Change PIN OTP requested handler
  const handleSendPinOtp = async () => {
    if (!profile?.email) {
      showNotif('ไม่พบอีเมลของท่านในระบบ กรุณากรอกและบันทึกอีเมลในข้อมูลส่วนตัวก่อนค่ะ', 'error');
      return;
    }
    if (!oldPinInput || oldPinInput.length !== 6 || !/^\d+$/.test(oldPinInput)) {
      showNotif('กรุณากรอกรหัส PIN เดิม 6 หลักให้ถูกต้องก่อนขอ OTP ค่ะ', 'error');
      return;
    }
    if (!newPinInput || newPinInput.length !== 6 || !/^\d+$/.test(newPinInput)) {
      showNotif('กรุณากรอกรหัส PIN ใหม่ 6 หลักก่อนขอ OTP ค่ะ', 'error');
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      showNotif('รหัส PIN ใหม่สองช่องไม่ตรงกันค่ะ', 'error');
      return;
    }
    if (oldPinInput === newPinInput) {
      showNotif('รหัส PIN ใหม่ต้องไม่ซ้ำกับรหัส PIN เดิมค่ะ', 'error');
      return;
    }

    setIsSendingPinOtp(true);
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await fetch('/api/member/send-pin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.userId, email: profile.email, otp: generatedOtp })
      });
      const data = await res.json();
      if (data.success) {
        setSentPinOtp(generatedOtp);
        setIsPinOtpSent(true);
        showNotif(`ระบบได้ส่งรหัส OTP 6 หลักสำหรับยืนยันการเปลี่ยน PIN ไปที่เมล ${profile.email} แล้วค่ะ`, 'success');
        alert(`📧 [จำลองการส่งอีเมล] รหัส OTP สำหรับเปลี่ยนรหัสธุรกรรม PIN ของคุณคือ: ${generatedOtp}`);
      } else {
        showNotif(data.message || 'เกิดข้อผิดพลาดในการส่ง OTP', 'error');
      }
    } catch (err) {
      showNotif('ไม่สามารถส่ง OTP ได้เนื่องจากเครือข่าย', 'error');
    } finally {
      setIsSendingPinOtp(false);
    }
  };

  // Change PIN submission handler
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = pinChangeOtpDigits.join('');
    if (otpStr.length !== 6) {
      showNotif('กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วนในช่อง 6 ช่องค่ะ', 'error');
      return;
    }
    if (otpStr !== sentPinOtp) {
      showNotif('รหัส OTP ไม่ถูกต้อง กรุณากรอกรหัสใหม่อีกครั้งค่ะ', 'error');
      return;
    }

    setIsChangingPin(true);
    try {
      const res = await fetch('/api/member/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          oldPin: oldPinInput,
          newPin: newPinInput,
          confirmNewPin: confirmNewPinInput,
          otp: otpStr
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotif('เปลี่ยนรหัสธุรกรรม PIN 6 หลักสำเร็จเรียบร้อยแล้วค่ะ', 'success');
        setOldPinInput('');
        setNewPinInput('');
        setConfirmNewPinInput('');
        setPinChangeOtpDigits(Array(6).fill(''));
        setIsPinOtpSent(false);
        setSentPinOtp('');
        fetchProfile(true);
      } else {
        showNotif(data.message || 'เปลี่ยน PIN ไม่สำเร็จ', 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการเปลี่ยน PIN', 'error');
    } finally {
      setIsChangingPin(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/member/transactions/${currentUser.userId}`);
      const data = await res.json();
      if (data.success) setTransactions(data.transactions);
    } catch (err) {}
  };

  const fetchReports = async () => {
    if (!currentUser) return;
    try {
      // Fetch user's orders
      const res1 = await fetch(`/api/member/orders/${currentUser.userId}`);
      const d1 = await res1.json();
      if (d1.success) setMemberOrders(d1.orders || []);

      // Fetch direct referrals
      const res2 = await fetch(`/api/mlm/direct-referrals/${currentUser.userId}`);
      const d2 = await res2.json();
      if (d2.success) setDirectReferrals(d2.members || []);

      // Fetch binary tree descendants
      const res3 = await fetch(`/api/mlm/binary-members/${currentUser.userId}`);
      const d3 = await res3.json();
      if (d3.success) setBinaryDescendants(d3.members || []);
    } catch (err) {}
  };

  const fetchSellerData = async () => {
    if (!currentUser) return;
    try {
      const resProds = await fetch(`/api/seller/products/${currentUser.userId}`);
      const dataProds = await resProds.json();
      if (dataProds.success) {
        setSellerProducts(dataProds.products || []);
      }
      const resOrders = await fetch(`/api/seller/orders/${currentUser.userId}`);
      const dataOrders = await resOrders.json();
      if (dataOrders.success) {
        setSellerOrders(dataOrders.orders || []);
      }
    } catch (err) {
      console.error("Error fetching seller data:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/shop/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
      
      const resChoices = await fetch('/api/shop/package-choices');
      const dChoices = await resChoices.json();
      if (dChoices.success) setPackageChoices(dChoices.packageProductChoices || []);
    } catch (err) {}
  };

  const fetchCsrFeed = async () => {
    try {
      const res = await fetch('/api/csr/feed');
      const data = await res.json();
      if (data.success) {
        setCsrFeed(data.feed);
        setCsrBalance(data.balance);
      }
    } catch (err) {}
  };

  const fetchMlmTrees = async (overrideId?: string) => {
    const targetId = overrideId || mlmSearchId || currentUser.userId;
    try {
      // Plan A Binary Tree
      const res1 = await fetch(`/api/mlm/binary-tree/${targetId}?callerId=${currentUser.userId}`);
      const d1 = await res1.json();
      if (d1.success) {
        setBinaryTree(d1.tree);
        setBinaryTreeParentId(d1.parentId || null);
      } else {
        showNotif(d1.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผังไบนารี", "error");
      }

      // Sponsor Tree
      const res2 = await fetch(`/api/mlm/referral-tree/${targetId}?callerId=${currentUser.userId}`);
      const d2 = await res2.json();
      if (d2.success) {
        setReferralTree(d2.tree);
      } else {
        if (mlmSearchId) {
          showNotif(d2.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผังแนะนำตรง", "error");
        }
      }

      // Plan B progression
      const res3 = await fetch(`/api/mlm/plan-b/${currentUser.userId}`);
      const d3 = await res3.json();
      if (d3.success) setPlanBData(d3.planB);
    } catch (err) {}
  };

  const viewMemberInTree = (userId: string, treeType: 'binary' | 'referral') => {
    setMlmSearchId(userId);
    setActiveTab('mlm');
    setMlmSubTab(treeType === 'binary' ? 'binary' : 'referral');
    fetchMlmTrees(userId);
  };

  const fetchAdminMembers = async () => {
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (data.success) {
        setAdminMembersList(data.members);
      }
    } catch (err) {
      console.error("Error fetching admin members", err);
    }
  };

  const fetchAdminQueues = async () => {
    try {
      const r1 = await fetch('/api/admin/kyc-queue');
      const d1 = await r1.json();
      if (d1.success) setKycQueue(d1.queue);

      const r2 = await fetch('/api/admin/store-queue');
      const d2 = await r2.json();
      if (d2.success) setStoreQueue(d2.queue);

      const r3 = await fetch('/api/admin/products-queue');
      const d3 = await r3.json();
      if (d3.success) setProdQueue(d3.queue);

      const r4 = await fetch('/api/admin/withdrawal-queue');
      const d4 = await r4.json();
      if (d4.success) setWithQueue(d4.queue);

      const rDep = await fetch('/api/admin/deposit-queue');
      const dDep = await rDep.json();
      if (dDep.success) setDepositQueue(dDep.queue || []);

      const r5 = await fetch('/api/admin/stats');
      const d5 = await r5.json();
      if (d5.success) setAdminStats(d5.stats);

      const r6 = await fetch('/api/admin/orders');
      const d6 = await r6.json();
      if (d6.success) setAdminOrders(d6.orders || []);

      // Fetch all products for admin management
      const rProds = await fetch('/api/admin/all-products');
      const dProds = await rProds.json();
      if (dProds.success) setAllSellerProducts(dProds.products || []);

      // Fetch Pending Coupon PV data
      const r7 = await fetch('/api/admin/pending-coupon-pv');
      const d7 = await r7.json();
      if (d7.success) {
        setPendingCouponPv(d7.pending || []);
        setCouponPvHistory(d7.history || []);
      }

      fetchAdminMembers();
    } catch (err) {}
  };

  const handleProcessCouponPv = async () => {
    setProcessingCouponPv(true);
    try {
      const res = await fetch('/api/admin/process-pending-coupon-pv', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        fetchAdminQueues();
      } else {
        showNotif(data.message, 'error');
      }
    } catch (e) {
      showNotif("เกิดข้อผิดพลาดในการประมวลผล", "error");
    } finally {
      setProcessingCouponPv(false);
    }
  };

  const handleSystemReset = async () => {
    if (resetConfirmationInput.trim().toUpperCase() !== "RESET") {
      showNotif("กรุณาพิมพ์คำว่า RESET ตัวใหญ่ทั้งหมดเพื่อยืนยันการเคลียร์ฐานข้อมูลเป็นศูนย์", "error");
      return;
    }
    
    setResettingSystem(true);
    try {
      const res = await fetch('/api/admin/system-reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        setResetConfirmationInput('');
        setAdminSubTab('queues');
        
        // Refresh after reset
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showNotif(data.message, 'error');
      }
    } catch (e) {
      showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์เพื่อรีเซ็ตระบบ", "error");
    } finally {
      setResettingSystem(false);
    }
  };

  const handleFirestoreSync = async () => {
    setSyncingFirestore(true);
    try {
      const res = await fetch('/api/admin/sync-firestore', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showNotif(data.message, 'error');
      }
    } catch (e) {
      showNotif("เกิดข้อผิดพลาดในการดึงข้อมูลล่าสุดจาก Cloud Firestore", "error");
    } finally {
      setSyncingFirestore(false);
    }
  };

  const handleRebuildBinaryTree = async () => {
    if (!currentUser?.userId) return;
    setRebuildingTree(true);
    try {
      const res = await fetch('/api/admin/rebuild-binary-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: currentUser.userId })
      });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showNotif(data.message || 'เกิดข้อผิดพลาดในการจัดเรียงผังสายงาน', 'error');
      }
    } catch (e) {
      showNotif("เกิดข้อผิดพลาดในการจัดเรียงและซ่อมแซมผังสายงาน", "error");
    } finally {
      setRebuildingTree(false);
    }
  };

  const handleUpdateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    // PIN validation: exactly 6 digits, numeric
    if (editingMember.pin) {
      if (editingMember.pin.length !== 6 || !/^\d+$/.test(editingMember.pin)) {
        showNotif('รหัส PIN ต้องไม่ต่ำกว่า และ ไม่เกิน 6 หลัก และต้องเป็นตัวเลขเท่านั้น', 'error');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/member-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingMember, editorUserId: currentUser?.userId })
      });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        setShowEditMemberModal(false);
        setEditingMember(null);
        fetchAdminMembers();
        if (currentUser && editingMember.userId === currentUser.userId) {
          fetchProfile(true);
        }
      } else {
        showNotif(data.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
  };

  // Handle Username Check
  const checkUsername = async (u: string) => {
    if (!u) {
      showNotif('กรุณากรอกชื่อผู้ใช้', 'error');
      return;
    }
    if (u.length < 4) {
      showNotif('ชื่อผู้ใช้ต้องยาวอย่างน้อย 4 ตัวอักษร', 'error');
      setUsernameStatus('taken');
      setCheckedUsername(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u })
      });
      const d = await res.json();
      if (d.success) {
        setUsernameStatus('avail');
        setCheckedUsername(true);
        showNotif('ชื่อผู้ใช้นี้สามารถใช้งานได้!', 'success');
      } else {
        setUsernameStatus('taken');
        setCheckedUsername(false);
        showNotif('ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาใช้ชื่ออื่น', 'error');
      }
    } catch (err) {
      setCheckedUsername(false);
      showNotif('เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้', 'error');
    }
  };

  // Handle Sponsor Verification
  const verifySponsor = async (s: string) => {
    if (!s) {
      showNotif('กรุณากรอกรหัสผู้แนะนำ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/check-sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId: s })
      });
      const d = await res.json();
      if (d.success) {
        setSponsorName(d.name);
        setSponsorError('');
        setCheckedSponsor(true);
        showNotif(`พบผู้แนะนำ: ${d.name}`, 'success');
      } else {
        setSponsorName('');
        setSponsorError('ไม่พบผู้แนะนำในระบบ');
        setCheckedSponsor(false);
        showNotif('ไม่พบผู้แนะนำในระบบ กรุณาตรวจสอบรหัสแนะนำอีกครั้ง', 'error');
      }
    } catch (err) {
      setCheckedSponsor(false);
      showNotif('เกิดข้อผิดพลาดในการตรวจสอบผู้แนะนำ', 'error');
    }
  };

  // Real-time Citizen ID check
  useEffect(() => {
    if (!regIdCard) {
      setIdCardStatus(null);
      setIdCardMessage('');
      return;
    }
    if (regIdCard.length < 13) {
      setIdCardStatus('invalid');
      setIdCardMessage('กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก');
      return;
    }
    if (regIdCard.length === 13) {
      if (!/^\d{13}$/.test(regIdCard)) {
        setIdCardStatus('invalid');
        setIdCardMessage('เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น');
        return;
      }
      setIdCardStatus('checking');
      setIdCardMessage('กำลังตรวจสอบข้อมูลในระบบ...');
      
      const controller = new AbortController();
      fetch('/api/auth/check-idcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCard: regIdCard }),
        signal: controller.signal
      })
        .then(res => res.json())
        .then(d => {
          if (d.success) {
            setIdCardStatus('valid');
            setIdCardMessage('✓ เลขบัตรประชาชนนี้สามารถใช้งานได้');
          } else {
            setIdCardStatus('dup');
            setIdCardMessage(`✗ ${d.message}`);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setIdCardStatus('invalid');
            setIdCardMessage('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
          }
        });
        
      return () => controller.abort();
    }
  }, [regIdCard]);

  // Real-time Phone Number check
  useEffect(() => {
    if (!regPhone) {
      setPhoneStatus(null);
      setPhoneMessage('');
      return;
    }
    if (regPhone.length < 10) {
      setPhoneStatus('invalid');
      setPhoneMessage('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
      return;
    }
    if (regPhone.length === 10) {
      if (!/^\d{10}$/.test(regPhone)) {
        setPhoneStatus('invalid');
        setPhoneMessage('เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น');
        return;
      }
      setPhoneStatus('checking');
      setPhoneMessage('กำลังตรวจสอบข้อมูลในระบบ...');
      
      const controller = new AbortController();
      fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: regPhone }),
        signal: controller.signal
      })
        .then(res => res.json())
        .then(d => {
          if (d.success) {
            setPhoneStatus('valid');
            setPhoneMessage('✓ เบอร์โทรศัพท์นี้สามารถใช้งานได้');
          } else {
            setPhoneStatus('dup');
            setPhoneMessage(`✗ ${d.message}`);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setPhoneStatus('invalid');
            setPhoneMessage('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
          }
        });
        
      return () => controller.abort();
    }
  }, [regPhone]);

  // Real-time Email check
  useEffect(() => {
    if (!regEmail) {
      setEmailStatus(null);
      setEmailMessage('');
      return;
    }
    if (!regEmail.includes('@')) {
      setEmailStatus('invalid');
      setEmailMessage('อีเมลต้องมีเครื่องหมาย @ ในข้อความด้วยค่ะ');
      return;
    }
    
    setEmailStatus('checking');
    setEmailMessage('กำลังตรวจสอบข้อมูลในระบบ...');
    
    const controller = new AbortController();
    fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: regEmail }),
      signal: controller.signal
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setEmailStatus('valid');
          setEmailMessage('✓ อีเมลนี้สามารถใช้งานได้');
        } else {
          setEmailStatus('dup');
          setEmailMessage(`✗ ${d.message}`);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setEmailStatus('invalid');
          setEmailMessage('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
        }
      });
      
    return () => controller.abort();
  }, [regEmail]);

  // Handle Auth Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const d = await res.json();
      if (d.success) {
        setCurrentUser(d);
        if (d.firstLogin) {
          setIsFirstLoginModal(true);
        }
        showNotif(`ยินดีต้อนรับกลับเข้าสู่ระบบ นทีพลัส! คุณ ${d.name}`, 'success');
      } else {
        showNotif(d.message || 'รหัสผ่านหรือชื่อผู้ใช้ไม่ถูกต้อง', 'error');
      }
    } catch (err) {
      showNotif('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
  };

  // Handle Registration Submit
  const [showRegModal, setShowRegModal] = useState(false);
  const handleRegister = async () => {
    if (!checkedSponsor) {
      showNotif('กรุณากดตรวจสอบผู้แนะนำสปอนเซอร์และตรวจสอบให้ผ่านก่อนทำการสมัครค่ะ', 'error');
      return;
    }
    if (!checkedUsername) {
      showNotif('กรุณากดตรวจสอบชื่อผู้ใช้และตรวจสอบให้ผ่านก่อนทำการสมัครค่ะ', 'error');
      return;
    }

    if (!regUsername || !regName || !regSurname || !regPhone || !regIdCard) {
      showNotif('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'error');
      return;
    }

    if (idCardStatus === 'dup') {
      showNotif('เลขบัตรประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว กรุณาใช้เลขอื่นค่ะ', 'error');
      return;
    }

    if (phoneStatus === 'dup') {
      showNotif('เบอร์โทรศัพท์นี้ถูกใช้สมัครสมาชิกแล้ว กรุณาใช้เบอร์อื่นค่ะ', 'error');
      return;
    }

    if (emailStatus === 'dup') {
      showNotif('อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว กรุณาใช้อีเมลอื่นค่ะ', 'error');
      return;
    }

    // Validate Citizen ID Card: Exactly 13 digits
    if (!/^\d{13}$/.test(regIdCard)) {
      showNotif('เลขบัตรประจำตัวประชาชนต้องครบ 13 หลัก และเป็นตัวเลขเท่านั้นค่ะ', 'error');
      return;
    }

    // Validate Phone Number: Exactly 10 digits
    if (!/^\d{10}$/.test(regPhone)) {
      showNotif('เบอร์โทรศัพท์ต้องครบ 10 หลัก และเป็นตัวเลขเท่านั้นค่ะ', 'error');
      return;
    }

    // Validate Email: Must contain '@'
    if (regEmail && !regEmail.includes('@')) {
      showNotif('อีเมลต้องมีเครื่องหมาย @ ในข้อความด้วยค่ะ', 'error');
      return;
    }
    
    // Validate Username: lowercase English letters and numbers only, 4-20 chars
    if (!/^[a-z0-9]{4,20}$/.test(regUsername)) {
      showNotif('ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษตัวเล็ก (a-z) และตัวเลข (0-9) เท่านั้น (4-20 ตัวอักษร)', 'error');
      return;
    }

    // Validate Password requirements
    const hasUppercase = /[A-Z]/.test(regPassword);
    const hasLowercase = /[a-z]/.test(regPassword);
    const hasNumber = /[0-9]/.test(regPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(regPassword);
    const isEnglishOnly = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(regPassword);

    if (regPassword.length < 6) {
      showNotif('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }
    if (!hasUppercase) {
      showNotif('รหัสผ่านต้องมีอักษรตัวใหญ่ (A-Z) อย่างน้อย 1 ตัว', 'error');
      return;
    }
    if (!hasLowercase) {
      showNotif('รหัสผ่านต้องมีอักษรตัวเล็ก (a-z) อย่างน้อย 1 ตัว', 'error');
      return;
    }
    if (!hasNumber) {
      showNotif('รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว', 'error');
      return;
    }
    if (!hasSpecial) {
      showNotif('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (เช่น @, #, $, !)', 'error');
      return;
    }
    if (!isEnglishOnly) {
      showNotif('รหัสผ่านต้องใช้เฉพาะภาษาอังกฤษและอักขระพิเศษสากลเท่านั้น', 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showNotif('รหัสผ่านสองช่องไม่ตรงกัน', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          name: regName,
          surname: regSurname,
          phone: regPhone,
          email: regEmail,
          idCard: regIdCard,
          sponsorId,
          idAddress: {
            province: regIdProv,
            district: regIdDist,
            subdistrict: regIdSub,
            zipcode: regIdZip,
            details: regIdDetails
          },
          shippingAddress: {
            province: regShipProv,
            district: regShipDist,
            subdistrict: regShipSub,
            zipcode: regShipZip,
            details: regShipDetails
          },
          useSameAddress: regUseSameAddress,
          selectedPackageId: regSelectedPackageId,
          selectedPackageItems: regSelectedTrialItems
        })
      });
      const d = await res.json();
      if (d.success) {
        setShowRegModal(false);
        // Popup with full credentials
        alert(`🎉 สมัครสมาชิก นที พลัส สำเร็จเรียบร้อย!\n\nรหัสสมาชิกของคุณคือ: ${d.userId}\nชื่อผู้ใช้: ${d.username}\nรหัสผ่านชั่วคราว: ${d.defaultPassword}\nผู้แนะนำ: ${d.sponsorName}\n\nกรุณาจดจำรหัสสมาชิกเพื่อใช้ในการเข้าสู่ระบบครั้งแรกค่ะ`);
        setAuthMode('login');
        setUsername('');
        setPassword('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else {
        showNotif(d.message || 'การสมัครสมาชิกล้มเหลว', 'error');
      }
    } catch (err) {
      showNotif('การสมัครสมาชิกล้มเหลวจากเครือข่าย', 'error');
    }
  };

  // Request OTP for firstLogin Security Update
  const handleSendFirstLoginOtp = async () => {
    if (!newPass) {
      showNotif('กรุณาระบุกำหนดรหัสผ่านใหม่ส่วนตัวของท่านค่ะ', 'error');
      return;
    }
    if (newPass === "Netee!234") {
      showNotif('ห้ามใช้รหัสผ่านเริ่มต้นระบบเพื่อความปลอดภัยค่ะ', 'error');
      return;
    }
    if (!newPin || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      showNotif('กรุณากรอกรหัสธุรกรรม PIN 6 หลักให้ครบถ้วนก่อนค่ะ', 'error');
      return;
    }
    if (newPin !== newPinConfirm) {
      showNotif('รหัสธุรกรรม PIN 6 หลักไม่ตรงกัน กรุณาตรวจสอบอีกครั้งค่ะ', 'error');
      return;
    }

    const email = profile?.email || currentUser?.email || 'member@gmail.com';
    setIsFirstLoginSendingOtp(true);
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await fetch('/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: generatedOtp })
      });
      const data = await res.json();
      if (data.success) {
        setFirstLoginSentOtp(generatedOtp);
        setFirstLoginOtpSent(true);
        showNotif(`ระบบได้ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้วค่ะ`, 'success');
        alert(`📧 [จำลองการส่งอีเมล] รหัส OTP สำหรับยืนยันรหัสธุรกรรม PIN ของคุณคือ: ${generatedOtp}`);
      } else {
        showNotif(data.message || 'เกิดข้อผิดพลาดในการส่ง OTP', 'error');
      }
    } catch (err) {
      showNotif('ไม่สามารถส่ง OTP ได้เนื่องจากเครือข่าย', 'error');
    } finally {
      setIsFirstLoginSendingOtp(false);
    }
  };

  // Security configuration on firstLogin
  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== newPinConfirm) {
      showNotif('รหัสธุรกรรม PIN 6 หลักไม่ตรงกัน', 'error');
      return;
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      showNotif('รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/update-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          newPin
        })
      });
      const d = await res.json();
      if (d.success) {
        // Update currentUser state and localStorage to prevent modal re-appearing
        const updatedUser = { ...currentUser, firstLogin: false };
        setCurrentUser(updatedUser);
        setIsFirstLoginModal(false);
        
        // Show prominent warning popup
        alert(`🔒 ตั้งค่ารหัส PIN สำเร็จเรียบร้อยแล้วค่ะ!\n\n⚠️ โปรดเก็บรหัส PIN 6 หลักนี้ไว้เป็นความลับสูงสุดของท่าน ห้ามเปิดเผยข้อมูลนี้ให้บุคคลอื่นทราบเด็ดขาด เนื่องจากรหัสนี้จะถูกใช้เพื่อยืนยันการทำธุรกรรมทางการเงิน โอนเงิน และถอนเงินทุกรายการในระบบ นที พลัส ค่ะ`);
        
        showNotif('ยินดีด้วย! บัญชีสมาชิกของท่านได้รับการเปิดใช้งานสมบูรณ์เรียบร้อยแล้วค่ะ', 'success');
        fetchProfile(true);
      } else {
        showNotif(d.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      }
    } catch (err) {
      showNotif('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้', 'error');
    }
  };

  // Convert files helper for KYC
  const handleKycFile = (e: React.ChangeEvent<HTMLInputElement>, field: 'idCardFile' | 'bankBookFile') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycForm(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycForm.bankName || !kycForm.bankAccount) {
      showNotif('กรุณากรอกข้อมูลธนาคารเพื่อรับเงินคอมมิชชัน', 'error');
      return;
    }
    if (!kycForm.idCardFile || !kycForm.bankBookFile) {
      showNotif('กรุณาอัปโหลดรูปภาพเอกสารทั้ง 2 รายการให้ครบถ้วน', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          idCardFile: kycForm.idCardFile,
          bankBookFile: kycForm.bankBookFile,
          address: kycForm.address,
          beneficiary: kycForm.beneficiary,
          relation: kycForm.relation,
          bankName: kycForm.bankName,
          bankAccount: kycForm.bankAccount
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif('ส่งหลักฐานเอกสารเรียบร้อย รอแอดมินอนุมัติ!', 'success');
        fetchProfile(true);
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  // Top up Wallet simulation (adds real E-Cash on approval)
  const handleTopupRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      showNotif('จำนวนเงินที่ระบุต้องมากกว่า 0 บาท', 'error');
      return;
    }
    // Randomize a decimal between .01 and .99
    const cents = (Math.floor(Math.random() * 99) + 1);
    const decStr = "." + cents.toString().padStart(2, '0');
    setTopupDecimal(decStr);
    
    const finalAmount = (parseFloat(topupAmount) + parseFloat("0" + decStr)).toFixed(2);
    setTopupActualAmount(finalAmount);
    showNotif(`ยืนยันยอดสำเร็จ! กรุณาโอนเงินยอด: ${finalAmount} บาท`, 'success');
  };

  const fetchBankSettings = async () => {
    try {
      const res = await fetch('/api/bank-settings');
      const data = await res.json();
      if (data.success && data.bankSettings) {
        setBankSettings(data.bankSettings);
        setEditingBankName(data.bankSettings.bankName || '');
        setEditingBankAccount(data.bankSettings.bankAccount || '');
        setEditingBankAccountName(data.bankSettings.bankAccountName || '');
        setEditingBankQrPreview(data.bankSettings.qrCodeUrl || '');
      }
    } catch (err) {
      console.error("Error fetching bank settings", err);
    }
  };

  const handleBankQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBankQrFile(reader.result as string);
        setEditingBankQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBankName || !editingBankAccount || !editingBankAccountName) {
      showNotif("กรุณากรอกข้อมูลธนาคารให้ครบถ้วน", "error");
      return;
    }
    setIsSavingBankSettings(true);
    try {
      const res = await fetch('/api/bank-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: editingBankName,
          bankAccount: editingBankAccount,
          bankAccountName: editingBankAccountName,
          qrCodeFile: editingBankQrFile,
          editorUserId: currentUser.userId
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotif(data.message, 'success');
        setBankSettings(data.bankSettings);
        setEditingBankQrFile(null);
      } else {
        showNotif(data.message || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (err) {
      console.error("Error saving bank settings", err);
      showNotif("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSavingBankSettings(false);
    }
  };

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTopupSlip(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTopupSlipBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Finalize slip upload
  const handleTopupSubmit = async () => {
    if (isSubmittingTopup) return;
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      showNotif('กรุณาระบุจำนวนเงินเติมเงินให้ถูกต้อง', 'error');
      return;
    }
    if (!topupActualAmount || parseFloat(topupActualAmount) <= 0) {
      showNotif('กรุณาระบุยอดโอนเงินจริงให้ถูกต้อง', 'error');
      return;
    }
    if (!topupTransferDate) {
      showNotif('กรุณาระบุวันที่ทำรายการโอนเงิน', 'error');
      return;
    }
    if (!topupSlip || !topupSlipBase64) {
      showNotif('กรุณาอัปโหลดรูปภาพสลิปจริงเพื่อยืนยันการทำรายการ', 'error');
      return;
    }

    setIsSubmittingTopup(true);
    try {
      const res = await fetch('/api/member/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          amount: topupAmount,
          transferAmount: topupActualAmount,
          transferDate: `${topupTransferDate} ${topupTransferHour}:${topupTransferMinute}`,
          slipFile: topupSlipBase64
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif('ส่งหลักฐานสลิปเรียบร้อยแล้วค่ะ รอการตรวจสอบและอนุมัติยอด E-Cash จากแอดมินหลังบ้าน!', 'success');
        setTopupSlip('');
        setTopupSlipBase64('');
        setTopupDecimal('');
        setTopupActualAmount('');
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotif('เกิดข้อผิดพลาดในระบบเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setIsSubmittingTopup(false);
    }
  };

  // Convert E-Cash to E-Coupon (Initiate confirmation)
  const initiateBuyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(exchangeAmount);
    if (!exchangeAmount || amt <= 0) {
      showNotif('กรุณาระบุจำนวนยอดที่ต้องการแลกเปลี่ยน', 'error');
      return;
    }
    if (!exchangePin || exchangePin.length !== 6) {
      showNotif('กรุณากรอกรหัส PIN 6 หลัก', 'error');
      return;
    }
    setTxnConfirm({
      type: 'buy_coupon',
      amount: amt,
      pin: exchangePin,
      recipientIdOrPhone: currentUser.userId,
      recipientName: 'คูปองช้อปปิ้งพอร์ทัล E-Coupon (แลกแล้วไม่สามารถแลกคืนได้)',
      feeAmount: 0,
      netAmount: amt
    });
  };

  const executeBuyCoupon = async () => {
    if (!txnConfirm) return;
    if (!txnOtp) {
      showNotif('กรุณากรอกรหัส OTP สำหรับยืนยันการทำธุรกรรมค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/buy-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          amount: txnConfirm.amount,
          pin: txnConfirm.pin,
          otp: txnOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(`แลกคูปองช้อปปิ้งสำเร็จ! รับสิทธิ์คงเหลือ ${d.newECoupon} คูปอง`, 'success');
        setExchangeAmount('');
        setExchangePin('');
        setTxnConfirm(null);
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการทำรายการ', 'error');
    }
  };

  // Transfer E-Cash to another member (Initiate confirmation)
  const initiateTransferECashMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferUser || !transferAmount || parseFloat(transferAmount) <= 0) {
      showNotif('กรุณากรอกข้อมูลรหัสผู้รับและจำนวนเงินให้ถูกต้อง', 'error');
      return;
    }
    if (!transferPin || transferPin.length !== 6) {
      showNotif('กรุณากรอกรหัส PIN 6 หลักให้ครบถ้วน', 'error');
      return;
    }

    setIsVerifyingRecipient(true);
    try {
      const res = await fetch('/api/member/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transferUser })
      });
      const d = await res.json();
      if (d.success && d.member) {
        setTxnConfirm({
          type: 'transfer_ecash_member',
          amount: parseFloat(transferAmount),
          pin: transferPin,
          recipientIdOrPhone: d.member.userId,
          recipientName: `${d.member.name} ${d.member.surname}`,
          feeAmount: 0,
          netAmount: parseFloat(transferAmount)
        });
      } else {
        showNotif(d.message || 'ไม่พบสมาชิกปลายทาง กรุณาตรวจสอบรหัสผู้ใช้หรือเบอร์โทรศัพท์อีกครั้ง', 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการตรวจสอบผู้รับ', 'error');
    } finally {
      setIsVerifyingRecipient(false);
    }
  };

  const executeTransferECashMember = async () => {
    if (!txnConfirm) return;
    if (!txnOtp) {
      showNotif('กรุณากรอกรหัส OTP สำหรับยืนยันการทำธุรกรรมค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/transfer-e-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.userId,
          receiverPhoneOrUser: txnConfirm.recipientIdOrPhone,
          amount: txnConfirm.amount,
          pin: txnConfirm.pin,
          otp: txnOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setTransferUser('');
        setTransferAmount('');
        setTransferPin('');
        setTxnConfirm(null);
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการทำรายการ', 'error');
    }
  };

  // Withdraw E-Money / E-Cash to Bank (Initiate confirmation)
  const initiateWithdrawECash = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!withdrawAmount || amt <= 0) {
      showNotif('กรุณาระบุจำนวนเงินต้องการถอน', 'error');
      return;
    }
    if (amt < 300) {
      showNotif('การถอนเงินขั้นต่ำต้องเป็น 300 บาทขึ้นไปค่ะ', 'error');
      return;
    }
    if ((profile?.balanceEMoney || 0) < 300) {
      showNotif('การถอนเงินเข้าธนาคาร ต้องมียอดเงินใน E-Money ขั้นต่ำ 300 บาทขึ้นไปค่ะ', 'error');
      return;
    }
    if ((profile?.balanceEMoney || 0) < amt) {
      showNotif('ยอดเงินในกระเป๋า E-Money ของคุณไม่เพียงพอสำหรับยอดที่ระบุค่ะ', 'error');
      return;
    }
    if (!withdrawPin || withdrawPin.length !== 6) {
      showNotif('กรุณากรอกรหัส PIN 6 หลัก', 'error');
      return;
    }
    const fee = amt * 0.20;
    const net = amt - fee;
    setTxnConfirm({
      type: 'withdraw_emoney',
      amount: amt,
      pin: withdrawPin,
      recipientIdOrPhone: currentUser.userId,
      recipientName: `บัญชีธนาคารของคุณ: ${profile?.bankName} (เลขที่: ${profile?.bankAccount})`,
      feeAmount: fee,
      netAmount: net
    });
  };

  const executeWithdrawEMoney = async () => {
    if (!txnConfirm) return;
    if (!txnOtp) {
      showNotif('กรุณากรอกรหัส OTP สำหรับยืนยันการทำธุรกรรมค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          amount: txnConfirm.amount,
          pin: txnConfirm.pin,
          otp: txnOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setWithdrawAmount('');
        setWithdrawPin('');
        setTxnConfirm(null);
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการทำรายการ', 'error');
    }
  };

  // Self E-Cash to E-Money Transfer
  const initiateTransferECashToEMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(ecashToEmoneyAmount);
    if (!ecashToEmoneyAmount || amt <= 0) {
      showNotif('กรุณาระบุจำนวนเงินที่ต้องการโอน', 'error');
      return;
    }
    if (!ecashToEmoneyPin || ecashToEmoneyPin.length !== 6) {
      showNotif('กรุณากรอกรหัส PIN 6 หลัก', 'error');
      return;
    }
    const fee = amt * 0.10;
    const net = amt - fee;
    setTxnConfirm({
      type: 'transfer_ecash_emoney',
      amount: amt,
      pin: ecashToEmoneyPin,
      recipientIdOrPhone: currentUser.userId,
      recipientName: 'บัญชีกระเป๋า E-Money ของคุณ (หักค่าธรรมเนียมจัดสรร All-Share 10%)',
      feeAmount: fee,
      netAmount: net
    });
  };

  const executeTransferECashToEMoney = async () => {
    if (!txnConfirm) return;
    if (!txnOtp) {
      showNotif('กรุณากรอกรหัส OTP สำหรับยืนยันการทำธุรกรรมค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/transfer-ecash-to-emoney', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          amount: txnConfirm.amount,
          pin: txnConfirm.pin,
          otp: txnOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setEcashToEmoneyAmount('');
        setEcashToEmoneyPin('');
        setTxnConfirm(null);
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการทำรายการ', 'error');
    }
  };

  // Self E-Money to E-Cash Transfer
  const initiateTransferEMoneyToECash = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(emoneyToEcashAmount);
    if (!emoneyToEcashAmount || amt <= 0) {
      showNotif('กรุณาระบุจำนวนเงินที่ต้องการโอน', 'error');
      return;
    }
    if (!emoneyToEcashPin || emoneyToEcashPin.length !== 6) {
      showNotif('กรุณากรอกรหัส PIN 6 หลัก', 'error');
      return;
    }
    setTxnConfirm({
      type: 'transfer_emoney_ecash',
      amount: amt,
      pin: emoneyToEcashPin,
      recipientIdOrPhone: currentUser.userId,
      recipientName: 'บัญชีกระเป๋า E-Cash ของคุณ (อัตรา 1:1 ไม่มีค่าธรรมเนียม)',
      feeAmount: 0,
      netAmount: amt
    });
  };

  const executeTransferEMoneyToECash = async () => {
    if (!txnConfirm) return;
    if (!txnOtp) {
      showNotif('กรุณากรอกรหัส OTP สำหรับยืนยันการทำธุรกรรมค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/transfer-emoney-to-ecash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          amount: txnConfirm.amount,
          pin: txnConfirm.pin,
          otp: txnOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setEmoneyToEcashAmount('');
        setEmoneyToEcashPin('');
        setTxnConfirm(null);
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการทำรายการ', 'error');
    }
  };

  // Self E-Money to E-Coupon Transfer
  const initiateTransferEMoneyToECoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(emoneyToEcouponAmount);
    if (!emoneyToEcouponAmount || amt <= 0) {
      showNotif('กรุณาระบุจำนวนเงินที่ต้องการโอน', 'error');
      return;
    }
    if (!emoneyToEcouponPin || emoneyToEcouponPin.length !== 6) {
      showNotif('กรุณากรอกรหัส PIN 6 หลัก', 'error');
      return;
    }
    setTxnConfirm({
      type: 'transfer_emoney_ecoupon',
      amount: amt,
      pin: emoneyToEcouponPin,
      recipientIdOrPhone: currentUser.userId,
      recipientName: 'บัญชีกระเป๋า E-Coupon ของคุณ (อัตรา 1:1 ไม่มีค่าธรรมเนียม)',
      feeAmount: 0,
      netAmount: amt
    });
  };

  const executeTransferEMoneyToECoupon = async () => {
    if (!txnConfirm) return;
    if (!txnOtp) {
      showNotif('กรุณากรอกรหัส OTP สำหรับยืนยันการทำธุรกรรมค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/member/transfer-emoney-to-ecoupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          amount: txnConfirm.amount,
          pin: txnConfirm.pin,
          otp: txnOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setEmoneyToEcouponAmount('');
        setEmoneyToEcouponPin('');
        setTxnConfirm(null);
        fetchProfile();
        fetchTransactions();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการทำรายการ', 'error');
    }
  };

  // Purchase Package or General Product
  const handlePurchaseProduct = async (prodId: string, bypassChoice = false, customChoiceId?: string) => {
    const product = products.find(p => p.id === prodId);
    if (!product) return;

    // Check if the current user rank is "Member" or not set, then they must purchase pack_s first
    const currentRank = profile?.rank || 'Member';
    if (currentRank === 'Member' && prodId !== 'pack_s') {
      showNotif('สำหรับการสั่งซื้อครั้งแรกเพื่อเปิดสิทธิ์ร้านค้า ท่านต้องสั่งซื้อสิทธิ์แพ็กเกจ S (100 บาท) ก่อนสั่งซื้อตำแหน่งอื่นหรือสินค้าทั่วไปค่ะ', 'error');
      return;
    }

    const isPkg = product.category === 'Package';
    let couponToUse = 0;
    let cashToUse = product.price;

    if (!isPkg) {
      couponToUse = Math.min(profile?.balanceECoupon || 0, product.price);
      cashToUse = product.price - couponToUse;
    }

    if (isPkg) {
      if (profile?.balanceECash < product.price) {
        showNotif('ยอดเงินคงเหลือในกระเป๋า E-Cash ไม่เพียงพอสำหรับชำระเงินค่าแพ็กเกจ กรุณาเติมเงินก่อนทำรายการค่ะ', 'error');
        return;
      }
    } else {
      if (profile?.balanceECash < cashToUse) {
        showNotif(`ยอดเงินคงเหลือไม่พอสำหรับชำระเงิน (ราคารวม ฿${product.price?.toLocaleString()} • หักจ่ายด้วย E-Coupon ฿${couponToUse?.toLocaleString()} • ต้องใช้ E-Cash ชำระส่วนต่าง ฿${cashToUse?.toLocaleString()} แต่ท่านมี E-Cash เพียง ฿${profile?.balanceECash?.toLocaleString()})`, 'error');
        return;
      }
    }

    // Since position M and above require selecting a product set
    if (isPkg && prodId !== 'pack_s' && !bypassChoice) {
      // Find package choices for this package ID
      const filteredChoices = packageChoices.filter(c => c.packageId === prodId);
      if (filteredChoices.length > 0) {
        setPendingPurchaseProductId(prodId);
        setSelectedChoiceId(filteredChoices[0].id); // default select the first one
        setShowPackageChoiceModal(true);
        return;
      }
    }

    const choiceToUse = customChoiceId || selectedChoiceId;
    const choiceObj = isPkg ? packageChoices.find(c => c.id === choiceToUse) : null;
    
    // Set the product and choices to confirm
    setConfirmProduct(product);
    setConfirmChoice(choiceObj || null);
    setShowPurchaseConfirmModal(true);
    setShowPackageChoiceModal(false);
  };

  const handleFinalizePackagePurchase = async () => {
    if (!confirmProduct) return;
    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          productId: confirmProduct.id,
          quantity: 1,
          shippingAddress: shippingAddress || `${profile?.name || ''} ${profile?.surname || ''} ${profile?.phone || ''} ${profile?.address || ''}`,
          selectedChoiceId: confirmChoice ? confirmChoice.id : undefined
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(`สั่งซื้อ ${confirmProduct.name} เรียบร้อยแล้วค่ะ! 🎉`, 'success');
        
        // 1. Immediately close the modal and reset states to keep UI fast & snappy
        setShowPurchaseConfirmModal(false);
        setConfirmProduct(null);
        setConfirmChoice(null);
        setSelectedChoiceId('');
        setPendingPurchaseProductId('');
        
        // 2. Route back to the Dashboard/Main page first!
        setActiveTab('dash');
        
        // 3. Trigger updates in background to refresh balances and tables with robust safety wraps
        setTimeout(() => {
          fetchProfile().catch(console.error);
          fetchTransactions().catch(console.error);
          fetchMlmTrees().catch(console.error);
          fetchReports().catch(console.error);
          if (currentUser?.role === 'Admin' || currentUser?.role === 'Manager') {
            fetchAdminQueues().catch(console.error);
          }
        }, 50);
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif('เกิดข้อผิดพลาดในการสั่งซื้อ', 'error');
    }
  };

  // Admin Queue Action Handlers
  const handleKycApprove = async (uId: string) => {
    try {
      const res = await fetch('/api/admin/kyc-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uId })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      }
    } catch (err) {}
  };

  const handleKycReject = async (uId: string, reason: string) => {
    if (!reason) return;
    try {
      const res = await fetch('/api/admin/kyc-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uId, reason })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'info');
        fetchAdminQueues();
      }
    } catch (err) {}
  };

  const handleDepositApprove = async (txnId: string, approvedAmount?: string) => {
    try {
      const res = await fetch('/api/admin/deposit-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, approvedAmount })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      } else {
        showNotif(d.message || 'เกิดข้อผิดพลาดในการอนุมัติ', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepositReject = async (txnId: string, reason: string) => {
    try {
      const res = await fetch('/api/admin/deposit-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, reason: reason || 'ข้อมูลหรือสลิปไม่ถูกต้อง' })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'info');
        fetchAdminQueues();
      } else {
        showNotif(d.message || 'เกิดข้อผิดพลาดในการปฏิเสธ', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithApprove = async (txnId: string, deductionType: string) => {
    try {
      const res = await fetch('/api/admin/withdrawal-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, deductionType })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      }
    } catch (err) {}
  };

  const handleProductApprove = async (productId: string) => {
    try {
      const res = await fetch('/api/admin/product-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  const handleStoreApprove = async (userId: string) => {
    if (!window.confirm("คุณต้องการอนุมัติเปิดร้านค้าให้กับสมาชิกรายนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch('/api/admin/store-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  const handleStoreReject = async (userId: string) => {
    if (!window.confirm("คุณต้องการปฏิเสธคำขอเปิดร้านค้าของสมาชิกรายนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch('/api/admin/store-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'info');
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  const handleProductReject = async (productId: string) => {
    const reason = prompt('กรุณาระบุสาเหตุที่ปฏิเสธสินค้าชิ้นนี้:');
    if (reason === null) return;
    try {
      const res = await fetch('/api/admin/product-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reason: reason || 'ข้อมูลสินค้าไม่ชัดเจนหรือไม่ครบถ้วน' })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'info');
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  const handleProductUpdatePrice = async (productId: string, price: number, pv: number, cost: number) => {
    try {
      const res = await fetch('/api/admin/product-update-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, price, pv, cost })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  const handleProductDeleteImage = async (productId: string) => {
    if (!window.confirm("คุณต้องการลบรูปภาพผลิตภัณฑ์ชิ้นนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch('/api/admin/product-delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      showNotif("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  const handleAddPackageChoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewChoiceName.trim()) {
      showNotif('กรุณาระบุชื่อชุดสินค้า', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/package-choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: adminNewChoicePackageId,
          name: adminNewChoiceName,
          cost: adminNewChoiceCost
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setAdminNewChoiceName('');
        setAdminNewChoiceCost('');
        // Refresh product choices
        fetchProducts();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  const handleDeletePackageChoice = async (choiceId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตัวเลือกชุดสินค้านี้?')) return;
    try {
      const res = await fetch(`/api/admin/package-choices/${choiceId}`, {
        method: 'DELETE'
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchProducts();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  const handleCompleteOrder = async (orderId: string, customCompany?: string, customTrackingNo?: string, customNote?: string) => {
    try {
      const stateData = shippingTracking[orderId];
      const trackingCompany = customCompany !== undefined ? customCompany : (stateData?.company || 'Flash Express');
      const trackingNo = customTrackingNo !== undefined ? customTrackingNo : (stateData?.trackingNo || '');
      const shippingNote = customNote !== undefined ? customNote : (stateData?.note || '');

      const res = await fetch('/api/admin/order-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          trackingCompany,
          trackingNo,
          shippingNote
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setShippingTracking(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  // Seller Dashboard products and applications
  const handleSellerApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdpaAgreed) {
      showNotif('กรุณากดยอมรับและอนุญาตใช้เงื่อนไข PDPA ก่อนยื่นคำขอ', 'error');
      return;
    }
    if (!warehouseLat || !warehouseLng) {
      showNotif('กรุณาทำการปักหมุดที่ตั้งคลังสินค้าในแผนที่ (Google Map) ก่อนส่งใบสมัครค่ะ', 'error');
      return;
    }
    try {
      const res = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          storeName: sellerStoreName,
          storeAddress: sellerAddress,
          warehouseLat,
          warehouseLng
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        fetchProfile();
      }
    } catch (err) {}
  };

  const handleSellerProdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/seller/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          productName: newProd.name,
          price: newProd.price,
          pv: newProd.pv,
          description: newProd.description,
          category: newProd.category,
          imageFile: newProd.imageFile,
          cost: newProd.cost
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setNewProd({ name: '', price: '', pv: '', description: '', shortDescription: '', category: 'General', imageFile: '', cost: '' });
        // Refresh products list for seller
        const r = await fetch(`/api/seller/products/${currentUser.userId}`);
        const data = await r.json();
        if (data.success) setSellerProducts(data.products);
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  const handleSellerProdEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch('/api/seller/product/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          productId: editingProduct.id,
          productName: editingProduct.name,
          price: editingProduct.price,
          pv: editingProduct.pv,
          description: editingProduct.description,
          category: editingProduct.category,
          imageFile: editingProduct.imageFile,
          cost: editingProduct.cost
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setShowProductEditModal(false);
        setEditingProduct(null);
        // Refresh products list for seller
        const r = await fetch(`/api/seller/products/${currentUser.userId}`);
        const data = await r.json();
        if (data.success) setSellerProducts(data.products);
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  const handleSellerShipOrder = async (orderId: string) => {
    try {
      const tracking = sellerShippingTracking[orderId] || { company: 'Flash Express', trackingNo: '', note: '' };
      if (!tracking.trackingNo) {
        showNotif("กรุณากรอกเลขพัสดุ (Tracking Number) ก่อนทำการยืนยันการจัดส่งค่ะ", "error");
        return;
      }
      const res = await fetch('/api/seller/order-ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          sellerId: currentUser.userId,
          trackingCompany: tracking.company,
          trackingNo: tracking.trackingNo,
          shippingNote: tracking.note
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setSellerShippingTracking(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
        fetchSellerData();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCsrWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/csr-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: csrWithAmt,
          purpose: csrWithPurpose,
          managerOtp: csrManagerOtp
        })
      });
      const d = await res.json();
      if (d.success) {
        showNotif(d.message, 'success');
        setCsrWithAmt('');
        setCsrWithPurpose('');
        setCsrManagerOtp('');
        fetchCsrFeed();
        fetchAdminQueues();
      } else {
        showNotif(d.message, 'error');
      }
    } catch (err) {}
  };

  // Render Binary Tree Nodes Recursively
  const renderBinaryNode = (node: any, depth = 1) => {
    if (!node) return (
      <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 w-28 text-xs text-slate-400">
        ว่าง
      </div>
    );
    
    const isTerminated = node.status === 'Terminated' || node.status === 'Suspended' || node.status === 'Inactive';
    const isPendingKyc = node.statusKyc === 'Pending';
    const isNoRank = node.rank === 'Member' || !node.rank;
    const isComplete = !isNoRank && node.statusKyc === 'Active';

    let cardBg = "from-slate-50 to-slate-100 border-slate-300 text-slate-700 hover:from-slate-100 hover:to-slate-200"; // Grey default
    let statusText = "สมัครยังไม่ซื้อ";
    let badgeColor = "bg-slate-400";

    if (isTerminated) {
      cardBg = "from-slate-800 to-slate-900 border-slate-950 text-slate-100 hover:from-slate-900 hover:to-slate-950";
      statusText = "สิ้นสภาพ";
      badgeColor = "bg-slate-900";
    } else if (isPendingKyc) {
      cardBg = "from-amber-50 to-amber-100 border-amber-300 text-amber-800 hover:from-amber-100 hover:to-amber-200";
      statusText = "รออนุมัติ KYC";
      badgeColor = "bg-amber-500";
    } else if (isComplete) {
      cardBg = "from-blue-50 to-indigo-50 border-blue-300 text-blue-800 hover:from-blue-100 hover:to-indigo-100";
      statusText = "สมบูรณ์";
      badgeColor = "bg-blue-500";
    } else if (!isNoRank) {
      cardBg = "from-indigo-50/50 to-slate-50 border-indigo-200 text-indigo-800 hover:from-indigo-100/50 hover:to-slate-100";
      statusText = "รออนุมัติ KYC";
      badgeColor = "bg-indigo-400";
    }

    const isOwnNode = node.userId === profile?.userId;
    const hasChildren = node.left || node.right;

    return (
      <div className="flex flex-col items-center">
        <div 
          onClick={() => {
            fetchMlmTrees(node.userId);
            showNotif(`โฟกัสไปที่รหัส: ${node.userId} เพื่อดูองค์กรสายงานใต้ล่างค่ะ`, 'success');
          }}
          className={`p-2 bg-gradient-to-b ${cardBg} border rounded-xl shadow-sm w-32 text-center relative cursor-pointer hover:scale-[1.05] hover:shadow-md transition-all duration-250`}
        >
          <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-white font-mono text-[8px] px-1.5 py-0.5 rounded font-bold shadow-sm ${badgeColor}`}>
            {node.userId}
          </div>
          <div className="text-xs font-bold mt-1.5 truncate">
            @{node.username}
          </div>
          <div className="text-[10px] font-medium opacity-90 truncate">
            {node.name}
          </div>
          <div className="text-[9px] mt-1 bg-white/70 px-1 py-0.5 rounded font-bold inline-block border border-slate-200/50">
            ตำแหน่ง: {node.rank || 'Member'}
          </div>
          <div className="text-[9px] mt-1.5 flex justify-center items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded text-slate-600 border border-slate-100">
            <span className="font-bold text-[8px]">{node.side === 'Left' ? 'ฝั่งซ้าย' : node.side === 'Right' ? 'ฝั่งขวา' : '-'}</span>
          </div>
          {depth === maxTreeDepth && hasChildren && (
            <div className="text-[8px] text-indigo-600 font-bold mt-1 animate-pulse">
              🔍 คลิกเพื่อดูสายใต้ล่าง
            </div>
          )}
        </div>

        {depth < maxTreeDepth && hasChildren && (
          <div className="flex gap-2 mt-5 relative before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:w-[85%] before:h-0.5 before:bg-slate-300">
            <div className="flex flex-col items-center relative before:absolute before:-top-3 before:left-1/2 before:w-0.5 before:h-3 before:bg-slate-300">
              {renderBinaryNode(node.left, depth + 1)}
            </div>
            <div className="flex flex-col items-center relative before:absolute before:-top-3 before:left-1/2 before:w-0.5 before:h-3 before:bg-slate-300">
              {renderBinaryNode(node.right, depth + 1)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Referral direct tree
  const renderReferralNode = (node: any) => {
    if (!node) return null;
    return (
      <div key={node.userId} className="ml-6 border-l-2 border-indigo-100 pl-4 mt-2">
        <div 
          onClick={() => {
            handleLogout();
            clearRegisterForm(node.userId);
            setAuthMode('register');
            showNotif(`ตั้งค่าผู้แนะนำเป็น: ${node.name} (${node.userId}) และสลับไปหน้าสมัครสมาชิกใหม่`, 'success');
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-100 max-w-sm cursor-pointer hover:bg-indigo-50/50 hover:scale-[1.01] transition-all"
        >
          <div className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
            {node.userId}
          </div>
          <div className="text-xs font-medium text-slate-800">{node.username || node.name}</div>
          <div className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-500">
            {node.rank}
          </div>
          {/* Plus button next to member card */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
              clearRegisterForm(node.userId);
              setAuthMode('register');
              showNotif(`ตั้งค่าผู้แนะนำเป็น: ${node.name} (${node.userId}) และสลับไปหน้าสมัครสมาชิกใหม่`, 'success');
            }}
            className="ml-auto p-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded transition text-[10px] font-bold cursor-pointer"
            title="กดเพื่อสมัครสมาชิกแนะนำตรงต่อใต้รหัสนี้"
          >
            <Plus size={12} />
          </button>
        </div>
        {node.children && node.children.map((child: any) => renderReferralNode(child))}
      </div>
    );
  };

  // NOT LOGGED IN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col justify-center items-center px-4 py-8">
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] p-5 rounded-2xl shadow-2xl border-2 text-base max-w-md w-[90%] flex items-center gap-3 backdrop-blur-md transition-all duration-300 animate-slideDown ${
            notif.type === 'success' 
              ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/20' 
              : notif.type === 'error'
              ? 'bg-rose-600/95 text-white border-rose-400 shadow-rose-500/30 font-bold'
              : 'bg-slate-800/95 text-white border-slate-600 shadow-slate-950/40'
          }`}>
            <AlertCircle size={22} className="shrink-0" />
            <span className="flex-1 leading-snug">{notif.message}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Logo Brand heading */}
          <div className="text-center mb-8 relative">
            <h1 className="text-3xl font-extrabold tracking-wider text-white">
              เปิดร้านค้า <span className="text-sky-400">นที</span> <span className="text-amber-500">พลัส</span>
            </h1>
            <p className="text-slate-400 text-xs mt-2 font-medium">
              ระบบร้านค้าอัจฉริยะ สัญชาติไทย
            </p>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2">Username / รหัสสมาชิก</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  placeholder="กรอกชื่อผู้ใช้หรือรหัสสมาชิก"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2">รหัสผ่าน</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="กรอกรหัสผ่านเพื่อเข้าสู่ระบบ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:border-sky-400 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/20 active:scale-[0.98] transition cursor-pointer text-sm"
              >
                เข้าสู่ระบบหลังบ้าน
              </button>

              <div className="flex justify-between items-center text-xs text-sky-400 mt-4">
                <span onClick={() => setAuthMode('forgot')} className="hover:underline cursor-pointer">ลืมรหัสผ่านใช่หรือไม่?</span>
                <span onClick={() => { clearRegisterForm(); setAuthMode('register'); }} className="hover:underline cursor-pointer font-semibold text-amber-500">สมัครสมาชิกใหม่</span>
              </div>
            </form>
          ) : authMode === 'register' ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <h3 className="text-white text-sm font-bold border-b border-slate-800 pb-2">กรอกข้อมูลผู้สมัครใหม่</h3>
              
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">ผู้แนะนำสปอนเซอร์ (รหัสสมาชิก)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={sponsorId}
                    onChange={(e) => {
                      setSponsorId(e.target.value.toUpperCase());
                      setSponsorName('');
                      setSponsorError('');
                      setCheckedSponsor(false);
                    }}
                    placeholder="เช่น A260600001"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => verifySponsor(sponsorId)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    ตรวจสอบผู้แนะนำ
                  </button>
                </div>
                {sponsorName && <p className="text-emerald-400 text-[10px] mt-1">ผู้แนะนำ: {sponsorName}</p>}
                {sponsorError && <p className="text-rose-400 text-[10px] mt-1">{sponsorError}</p>}
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">Username (ชื่อผู้ใช้ภาษาอังกฤษและตัวเลขเท่านั้น)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      setUsernameStatus(null);
                      setCheckedUsername(false);
                    }}
                    placeholder="ตั้งชื่อผู้ใช้ เช่น natee99"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => checkUsername(regUsername)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    ตรวจสอบชื่อผู้ใช้
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] mt-1 leading-normal">
                  ⚠️ ใช้เฉพาะ **ภาษาอังกฤษตัวพิมพ์เล็ก (a-z)** และ **ตัวเลข (0-9)** เท่านั้น (ความยาว 4-20 ตัวอักษร)
                </p>
                {usernameStatus === 'avail' && <p className="text-emerald-400 text-[10px] mt-1">✓ ชื่อผู้ใช้นี้สามารถใช้ได้</p>}
                {usernameStatus === 'taken' && <p className="text-rose-400 text-[10px] mt-1">✗ ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 text-xs font-bold mb-1">ชื่อจริง</label>
                  <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="ภาษาไทย"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-bold mb-1">นามสกุล</label>
                  <input 
                    type="text" 
                    value={regSurname}
                    onChange={(e) => setRegSurname(e.target.value)}
                    placeholder="ภาษาไทย"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">เลขบัตรประจำตัวประชาชน (13 หลัก)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={13}
                    value={regIdCard}
                    onChange={(e) => setRegIdCard(e.target.value.replace(/\D/g, ''))}
                    placeholder="กรอกเลขบัตรประชาชน"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                  {idCardStatus === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">✓</span>
                  )}
                  {(idCardStatus === 'dup' || idCardStatus === 'invalid') && regIdCard.length === 13 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">✗</span>
                  )}
                  {idCardStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs animate-pulse">Checking</span>
                  )}
                </div>
                {idCardMessage && (
                  <p className={`text-[10px] mt-1 ${idCardStatus === 'valid' ? 'text-emerald-400' : idCardStatus === 'checking' ? 'text-slate-400' : 'text-rose-400'}`}>
                    {idCardMessage}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">เบอร์โทรศัพท์มือถือ (10 หลัก)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="เช่น 0812345678"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                  {phoneStatus === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">✓</span>
                  )}
                  {(phoneStatus === 'dup' || phoneStatus === 'invalid') && regPhone.length === 10 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">✗</span>
                  )}
                  {phoneStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs animate-pulse">Checking</span>
                  )}
                </div>
                {phoneMessage && (
                  <p className={`text-[10px] mt-1 ${phoneStatus === 'valid' ? 'text-emerald-400' : phoneStatus === 'checking' ? 'text-slate-400' : 'text-rose-400'}`}>
                    {phoneMessage}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1">อีเมล *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="เช่น user@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                  {emailStatus === 'valid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">✓</span>
                  )}
                  {(emailStatus === 'dup' || emailStatus === 'invalid') && regEmail && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-sm">✗</span>
                  )}
                  {emailStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs animate-pulse">Checking</span>
                  )}
                </div>
                {emailMessage && (
                  <p className={`text-[10px] mt-1 ${emailStatus === 'valid' ? 'text-emerald-400' : emailStatus === 'checking' ? 'text-slate-400' : 'text-rose-400'}`}>
                    {emailMessage}
                  </p>
                )}
              </div>

               <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 text-xs font-bold mb-1">กำหนดรหัสผ่าน</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="รหัสผ่าน"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-10 py-2.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-slate-300 text-xs font-bold">ยืนยันรหัสผ่าน</label>
                      {regConfirmPassword && (() => {
                        const hasUpper = /[A-Z]/.test(regPassword);
                        const hasLower = /[a-z]/.test(regPassword);
                        const hasNum = /[0-9]/.test(regPassword);
                        const hasSpec = /[^A-Za-z0-9]/.test(regPassword);
                        const isEng = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(regPassword);
                        const isLen = regPassword.length >= 6;
                        const isSecure = hasUpper && hasLower && hasNum && hasSpec && isEng && isLen;
                        
                        if (regPassword !== regConfirmPassword) {
                          return <span className="text-rose-400 text-[10px] font-bold animate-pulse">✖ ไม่ตรงกัน</span>;
                        } else if (!isSecure) {
                          return <span className="text-amber-400 text-[10px] font-bold animate-pulse">⚠ รหัสผ่านไม่ปลอดภัย</span>;
                        } else {
                          return <span className="text-emerald-400 text-[10px] font-bold animate-pulse">✔ ตรงกันและปลอดภัย</span>;
                        }
                      })()}
                    </div>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="ยืนยันรหัสผ่าน"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-16 py-2.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {regConfirmPassword && (() => {
                          const hasUpper = /[A-Z]/.test(regPassword);
                          const hasLower = /[a-z]/.test(regPassword);
                          const hasNum = /[0-9]/.test(regPassword);
                          const hasSpec = /[^A-Za-z0-9]/.test(regPassword);
                          const isEng = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(regPassword);
                          const isLen = regPassword.length >= 6;
                          const isSecure = hasUpper && hasLower && hasNum && hasSpec && isEng && isLen;

                          if (regPassword === regConfirmPassword && isSecure) {
                            return <span className="text-emerald-400 font-bold text-sm" title="รหัสผ่านตรงกันและปลอดภัย">✔</span>;
                          } else {
                            return <span className="text-rose-500 font-bold text-sm" title={regPassword === regConfirmPassword ? "รหัสผ่านไม่ปลอดภัยตามเงื่อนไข" : "รหัสผ่านไม่ตรงกัน"}>✖</span>;
                          }
                        })()}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[10px] space-y-1">
                  <p className="text-slate-300 font-bold mb-1">🔒 เงื่อนไขความปลอดภัยรหัสผ่าน (ภาษาอังกฤษเท่านั้น):</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <span className={/[A-Z]/.test(regPassword) ? "text-emerald-400 font-medium" : "text-slate-400"}>
                      {/[A-Z]/.test(regPassword) ? "✓" : "•"} มีตัวอักษรพิมพ์ใหญ่ (A-Z)
                    </span>
                    <span className={/[a-z]/.test(regPassword) ? "text-emerald-400 font-medium" : "text-slate-400"}>
                      {/[a-z]/.test(regPassword) ? "✓" : "•"} มีตัวอักษรพิมพ์เล็ก (a-z)
                    </span>
                    <span className={/[0-9]/.test(regPassword) ? "text-emerald-400 font-medium" : "text-slate-400"}>
                      {/[0-9]/.test(regPassword) ? "✓" : "•"} มีตัวเลข (0-9)
                    </span>
                    <span className={(/[^A-Za-z0-9]/.test(regPassword) && regPassword.length > 0) ? "text-emerald-400 font-medium" : "text-slate-400"}>
                      {(/[^A-Za-z0-9]/.test(regPassword) && regPassword.length > 0) ? "✓" : "•"} มีอักขระพิเศษ (เช่น @, #, $, !, %, *, ?, &)
                    </span>
                    <span className={(/^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(regPassword) && regPassword.length > 0) ? "text-emerald-400 font-medium" : "text-slate-400"}>
                      {(/^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]*$/.test(regPassword) && regPassword.length > 0) ? "✓" : "•"} ใช้ภาษาอังกฤษเท่านั้น
                    </span>
                    <span className={regPassword.length >= 6 ? "text-emerald-400 font-medium" : "text-slate-400"}>
                      {regPassword.length >= 6 ? "✓" : "•"} ความยาวอย่างน้อย 6 ตัวอักษร
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Package Selection removed */}

              <button 
                onClick={() => {
                  if (!checkedSponsor) {
                    showNotif('กรุณากดตรวจสอบผู้แนะนำสปอนเซอร์และตรวจสอบให้ผ่านก่อนทำการสมัครค่ะ', 'error');
                    return;
                  }
                  if (!checkedUsername) {
                    showNotif('กรุณากดตรวจสอบชื่อผู้ใช้และตรวจสอบให้ผ่านก่อนทำการสมัครค่ะ', 'error');
                    return;
                  }
                  setShowRegModal(true);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition cursor-pointer text-xs"
              >
                ตรวจสอบข้อมูลและสมัครสมาชิก
              </button>

              <div className="text-center text-xs text-sky-400">
                <span onClick={() => setAuthMode('login')} className="hover:underline cursor-pointer">กลับไปหน้าล็อกอิน</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {forgotStep === 'request' ? (
                <>
                  <h3 className="text-white text-sm font-bold pb-2 border-b border-slate-800">ลืมรหัสผ่าน (ขอรับรหัสผ่านชั่วคราว)</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    กรุณากรอกชื่อผู้ใช้หรือรหัสสมาชิก และอีเมลที่ท่านลงทะเบียนไว้ ระบบจะส่งรหัสความปลอดภัย OTP ไปยังอีเมลของท่าน
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold mb-1">Username / รหัสสมาชิก</label>
                      <input 
                        type="text" 
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="ชื่อผู้ใช้ หรือ รหัสสมาชิก เช่น nateeplus"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-bold mb-1">อีเมลที่ลงทะเบียน</label>
                      <input 
                        type="email" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="เช่น email@example.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      if (!forgotUsername || !forgotEmail) {
                        showNotif('กรุณากรอกชื่อผู้ใช้และอีเมลให้ครบถ้วน', 'error');
                        return;
                      }
                      try {
                        const res = await fetch('/api/auth/forgot', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ username: forgotUsername, email: forgotEmail })
                        });
                        const d = await res.json();
                        if (d.success) {
                          alert(d.message);
                          setForgotStep('verify');
                        } else {
                          showNotif(d.message, 'error');
                        }
                      } catch (err) {
                        showNotif('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ', 'error');
                      }
                    }}
                    className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl transition text-xs"
                  >
                    ขอรับรหัส OTP ทางอีเมล
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-white text-sm font-bold pb-2 border-b border-slate-800 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    ยืนยันรหัส OTP
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล <span className="text-white font-semibold">{forgotEmail}</span> แล้ว กรุณานำรหัสผ่านมากรอกเพื่อรับรหัสผ่านชั่วคราว
                  </p>
                  
                  <div>
                    <label className="block text-slate-300 text-xs font-bold mb-1">รหัสความปลอดภัย OTP (6 หลัก)</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="กรอกรหัส OTP 6 หลัก"
                      className="w-full text-center bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-widest focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <button 
                    onClick={async () => {
                      if (forgotOtp.length !== 6) {
                        showNotif('กรุณากรอกรหัส OTP 6 หลักให้ครบถ้วน', 'error');
                        return;
                      }
                      try {
                        const res = await fetch('/api/auth/forgot-verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ username: forgotUsername, otp: forgotOtp })
                        });
                        const d = await res.json();
                        if (d.success) {
                          alert(d.message);
                          setAuthMode('login');
                          setUsername(forgotUsername);
                          setPassword('Natee!234');
                          // Reset state
                          setForgotStep('request');
                          setForgotUsername('');
                          setForgotEmail('');
                          setForgotOtp('');
                        } else {
                          showNotif(d.message, 'error');
                        }
                      } catch (err) {
                        showNotif('เกิดข้อผิดพลาดในการยืนยันรหัส OTP', 'error');
                      }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition text-xs"
                  >
                    ยืนยันรหัส OTP และรับรหัสผ่านชั่วคราว
                  </button>

                  <div className="text-center text-xs">
                    <button 
                      onClick={() => setForgotStep('request')}
                      className="text-slate-400 hover:text-white transition"
                    >
                      ← ย้อนกลับไปขอรหัส OTP ใหม่
                    </button>
                  </div>
                </>
              )}

              <div className="text-center text-xs text-sky-400 border-t border-slate-800/60 pt-3">
                <span onClick={() => {
                  setAuthMode('login');
                  setForgotStep('request');
                }} className="hover:underline cursor-pointer">กลับไปหน้าล็อกอิน</span>
              </div>
            </div>
          )}
        </div>

        {/* Double-check dialog modal on sign up */}
        {showRegModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-white space-y-4">
              <h4 className="text-base font-bold text-sky-400 flex items-center gap-2">
                <ShieldCheck size={20} />
                ตรวจสอบรายละเอียดให้เรียบร้อย
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                ชื่อผู้ใช้: <b className="text-white">{username}</b><br />
                ชื่อ-นามสกุล: <b className="text-white">{regName} {regSurname}</b><br />
                เลขบัตรประจำตัว: <b className="text-white">{regIdCard}</b><br />
                ผู้แนะนำ: <b className="text-white">{sponsorName || 'SYSTEM'}</b>
              </p>
              <p className="text-[10px] text-rose-400 leading-normal">
                ⚠️ บัญชี 1 ท่านต่อ 1 บัตรประชาชนเท่านั้น ข้อมูลบัญชีธนาคารกรุณาไปเพิ่มภายหลังตอนทำ KYC เพื่อความปลอดภัย
              </p>
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setShowRegModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  ย้อนกลับเพื่อแก้ไข
                </button>
                <button 
                  onClick={handleRegister}
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  ยืนยันการสมัคร
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // FORCE PIN SETUP ON FIRST LOGIN
  if (currentUser && isFirstLoginModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] p-5 rounded-2xl shadow-2xl border-2 text-base max-w-md w-[90%] flex items-center gap-3 backdrop-blur-md transition-all duration-300 animate-slideDown ${
            notif.type === 'success' 
              ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/20' 
              : notif.type === 'error'
              ? 'bg-rose-600/95 text-white border-rose-400 shadow-rose-500/30 font-bold'
              : 'bg-slate-800/95 text-white border-slate-600 shadow-slate-950/40'
          }`}>
            <AlertCircle size={22} className="shrink-0" />
            <span className="flex-1 leading-snug">{notif.message}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-500"></div>
          
          <form onSubmit={handleSecurityUpdate} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-wide">🔒 ตั้งรหัสธุรกรรม (PIN 6 หลัก)</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                เนื่องจากเป็นการเข้าสู่ระบบครั้งแรก โปรดกำหนดรหัสธุรกรรม PIN 6 หลักของท่าน เพื่อความปลอดภัยและเปิดใช้งานบัญชีอย่างสมบูรณ์ค่ะ
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2">
                  รหัสธุรกรรม PIN (6 หลัก) *
                </label>
                <input 
                  type="password" 
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="กรอกตัวเลข 6 หลัก"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm text-center font-mono tracking-[1em] focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-2">
                  ยืนยัน PIN อีกครั้ง *
                </label>
                <input 
                  type="password" 
                  required
                  maxLength={6}
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ''))}
                  placeholder="กรอกตัวเลข 6 หลักให้ตรงกัน"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm text-center font-mono tracking-[1em] focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
                />
              </div>
            </div>

            <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <AlertCircle size={14} /> คำเตือนความปลอดภัยสำคัญ
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                โปรดเก็บรักษารหัส PIN 6 หลักนี้ไว้เป็นความลับสูงสุด ห้ามบอกรหัสนี้กับบุคคลอื่นโดยเด็ดขาด เนื่องจากรหัสนี้ใช้สำหรับยืนยันการทำธุรกรรมทางการเงิน ซื้อคูปอง และการถอนเงินออกจากระบบ นที พลัส ค่ะ
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition cursor-pointer text-xs shadow-lg shadow-sky-500/10"
              >
                บันทึกรหัส PIN เพื่อเปิดใช้งานบัญชี
              </button>
              
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer text-xs border border-slate-700"
              >
                กลับหน้าเข้าสู่ระบบ (ออกจากระบบ)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // LOGGED IN VIEW
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      {/* Global alert bar */}
      {notif && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] p-5 rounded-2xl shadow-2xl border-2 text-base max-w-md w-[90%] flex items-center gap-3 backdrop-blur-md transition-all duration-300 animate-slideDown ${
          notif.type === 'success' 
            ? 'bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-500/20' 
            : notif.type === 'error'
            ? 'bg-rose-600/95 text-white border-rose-400 shadow-rose-500/30 font-bold'
            : 'bg-slate-800/95 text-white border-slate-600 shadow-slate-950/40'
        }`}>
          <AlertCircle size={22} className="shrink-0" />
          <span className="flex-1 leading-snug">{notif.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative inset-y-0 left-0 bg-slate-900 text-white w-64 p-5 z-40 transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-0 md:translate-x-0 hidden md:flex flex-col'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-extrabold tracking-wider text-white">
            นที <span className="text-sky-400">พลัส</span>
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">✕</button>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button 
            onClick={() => { setActiveTab('dash'); setSidebarOpen(false); }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              activeTab === 'dash' ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} /> หน้าหลัก (Dashboard)
          </button>

          <button 
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              activeTab === 'profile' ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <UserCheck size={16} /> ข้อมูลส่วนตัว / ยืนยัน KYC
          </button>

          <button 
            onClick={() => { setActiveTab('shop'); setSidebarOpen(false); }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              activeTab === 'shop' ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <ShoppingBag size={16} /> ร้านค้าแพ็กเกจ (Shop)
          </button>

          <button 
            onClick={() => { setActiveTab('mlm'); setSidebarOpen(false); }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              activeTab === 'mlm' ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Layers size={16} /> ผังโครงสร้าง / สายงาน
          </button>

          <button 
            onClick={() => { setActiveTab('txn'); setSidebarOpen(false); }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              activeTab === 'txn' ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <CreditCard size={16} /> ธุรกรรมฝาก-ถอน-โอน
          </button>

          <button 
            onClick={() => { setActiveTab('report'); setSidebarOpen(false); }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
              activeTab === 'report' ? 'bg-sky-500/20 text-sky-400 border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <ClipboardList size={16} /> รายงาน (Report)
          </button>

          {profile && (
            <button 
              onClick={() => { setActiveTab('seller'); setSidebarOpen(false); }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                activeTab === 'seller' ? 'bg-indigo-500/20 text-indigo-400 border-l-4 border-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Star size={16} /> Natee Plus Seller Center
            </button>
          )}

          {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
            <>
              <button 
                onClick={() => { setActiveTab('admin'); setAdminSubTab('members'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                  activeTab === 'admin' && adminSubTab === 'members' ? 'bg-rose-500/20 text-rose-400 border-l-4 border-rose-400' : 'text-rose-400 hover:bg-slate-800/50 hover:text-rose-300'
                }`}
              >
                <UserCheck size={16} /> 👥 ข้อมูลสมาชิก (Admin)
              </button>
              <button 
                onClick={() => { setActiveTab('admin'); setAdminSubTab('queues'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                  activeTab === 'admin' && adminSubTab === 'queues' ? 'bg-rose-500/20 text-rose-400 border-l-4 border-rose-400' : 'text-rose-400 hover:bg-slate-800/50 hover:text-rose-300'
                }`}
              >
                <Settings size={16} /> Admin Console (หลังบ้านระบบ)
              </button>
              <button 
                onClick={() => { setActiveTab('admin'); setAdminSubTab('depositApprove'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition ${
                  activeTab === 'admin' && adminSubTab === 'depositApprove' ? 'bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-400' : 'text-emerald-400 hover:bg-slate-800/50 hover:text-emerald-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base">💰</span> อนุมัติเติมเงิน E-Cash
                </span>
                {depositQueue.length > 0 && (
                  <span className="bg-red-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                    {depositQueue.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => { setActiveTab('admin'); setAdminSubTab('manageShops'); setSidebarOpen(false); }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${
                  activeTab === 'admin' && adminSubTab === 'manageShops' ? 'bg-indigo-500/20 text-indigo-400 border-l-4 border-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <ShieldCheck size={16} /> Admin Seller Center (อนุมัติร้านค้า/สินค้า)
              </button>
            </>
          )}
        </nav>

        <div className="border-t border-slate-800 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold border border-sky-400/30">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">{profile?.name} {profile?.surname}</p>
              <p className="text-[10px] text-slate-400 mt-1">รหัสสมาชิก: {profile?.userId}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 border border-rose-500/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
          >
            <LogOut size={14} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        {/* Top Header Navigation */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600 hover:text-indigo-600">
            <LayoutDashboard size={24} />
          </button>

          {/* Dynamic CSR Donor Scrolling Feed */}
          <div className="hidden lg:flex items-center gap-2 bg-rose-50 text-rose-800 text-xs px-4 py-2 rounded-full border border-rose-100 max-w-lg overflow-hidden relative h-9">
            <div className="font-bold flex items-center gap-1.5 shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
               CSR ปันสุข:
            </div>
            <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-medium">
              {csrFeed.length > 0 ? (
                csrFeed.map((item, idx) => (
                  <span key={idx}>💖 ร่วมบริจาค คุณ {item.name || 'ผู้ใหญ่ใจดี'} ยอด {parseFloat(item.amount).toFixed(2)} บาท</span>
                ))
              ) : (
                <span>กองทุนร่วมปันความสุขคืนสู่สังคม นทีพลัส</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Remaining Rights Quota Display */}
            <div className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-emerald-200 shadow-sm flex flex-col items-center">
              <span className="text-[9px] text-emerald-500 uppercase tracking-wider block font-medium leading-none mb-0.5">ยอดสิทธิ์คงเหลือ</span>
              <span>
                {profile?.role === 'Manager' || profile?.role === 'Admin' 
                  ? 'ไร้ขีดจำกัด' 
                  : `฿ ${getRemainingRights()?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{profile?.name} {profile?.surname}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mt-1 ${
                profile?.statusKyc === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {profile?.statusKyc === 'Active' ? '✓ KYC APPROVED' : '⌛ WAITING KYC'}
              </span>
            </div>
            <div className="bg-slate-100 text-indigo-600 font-bold px-3 py-1.5 rounded-xl text-xs border border-slate-200">
              ตำแหน่ง: {profile?.rank || 'S'}
            </div>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-6 md:p-8 flex-1">
          
          {/* Firestore Quota Exceeded Local Backup Mode Warning */}
          {isUsingPollingFallback && (
            <div className="mb-6 bg-amber-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm text-left flex gap-3.5 items-start">
              <span className="text-amber-500 text-xl leading-none mt-0.5">⚠️</span>
              <div>
                <h4 className="text-sm font-semibold text-amber-900 leading-tight">
                  ระบบกำลังเชื่อมต่อโหมดสำรองข้อมูลท้องถิ่น (Local Failover Mode)
                </h4>
                <p className="text-xs text-amber-700/95 mt-1 leading-relaxed">
                  เนื่องจากปริมาณการเขียนข้อมูลของ Cloud Database ประจำวันของโควตาฟรี (Firebase Spark Plan) เต็มพิกัดแล้ว 
                  ระบบได้เปิดใช้งานระบบรักษาเสถียรภาพและเปลี่ยนมาจัดเก็บข้อมูลบนเซิร์ฟเวอร์สำรองในทันที 
                  <strong> สมาชิกทุกท่านยังสามารถเข้าใช้งาน ทำธุรกรรม สมัครสมาชิก ฝากถอน แนะนำตำแหน่ง และซื้อขายได้เต็มประสิทธิภาพ 100% ตามปกติ </strong> 
                  โดยข้อมูลทั้งหมดจะได้รับการจัดเก็บบันทึกอย่างปลอดภัยบนเซิร์ฟเวอร์ นที พลัส และจะทำการซิงก์กลับขึ้นสู่ระบบคลาวด์โดยอัตโนมัติเมื่อพ้นกำหนดรีเซ็ตโควตาประจำวันค่ะ
                </p>
              </div>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dash' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-slate-900">ยินดีต้อนรับเข้าสู่ นที พลัส 🌟</h2>
                  <p className="text-xs text-slate-500 mt-1">ภาพรวมความสุขของกระเป๋าร้านค้าออนไลน์ นทีพลัส ของคุณวันนี้</p>
                </div>
              </div>



              {/* Activation Package Reminder for new Member rank */}
              {profile?.rank === 'Member' && (
                <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-indigo-500/5 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm animate-fadeIn">
                  <div className="space-y-1.5 flex-1 text-left">
                    <span className="bg-amber-50 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                      รหัสสมาชิกยังไม่เปิดใช้งาน (ยังไม่ได้ชำระค่าแพ็กเกจ)
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      แพ็กเกจที่เลือกไว้ตอนสมัคร: <span className="text-indigo-600">{
                        products.find(p => p.id === profile?.selectedPackageId)?.name || 'กำลังโหลดข้อมูล...'
                      }</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      ราคาแพ็กเกจ: <b className="text-slate-800 font-extrabold">฿{products.find(p => p.id === profile?.selectedPackageId)?.price?.toLocaleString() || '...'}</b> | ได้รับคะแนนสะสม: <b className="text-indigo-600 font-extrabold">{products.find(p => p.id === profile?.selectedPackageId)?.pv || '...'} PV</b>
                    </p>
                    {profile?.selectedPackageItems?.length > 0 && (
                      <p className="text-xs text-indigo-600 font-medium">
                        🎁 รายการของสมนาคุณที่คุณเลือก: <span className="text-slate-700">{profile.selectedPackageItems.join(', ')}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      *กรุณาเติมเงิน E-Cash ในกระเป๋าให้เพียงพอ จากนั้นกดปุ่มชำระเงินเพื่อเริ่มต้นสิทธิ์แนะนำสมาชิกและขยายสายงานทันทีค่ะ
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => setActiveTab('txn')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs transition text-center shrink-0 cursor-pointer"
                    >
                      เติมเงิน E-Cash
                    </button>
                    <button 
                      onClick={() => handlePurchaseProduct(profile?.selectedPackageId || 'pack_s')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition text-center shrink-0 cursor-pointer"
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

                  <p className="text-[10px] text-emerald-200 mt-3">ใช้เป็นส่วนลดหรือชำระค่าสินค้าหลักบนเว็ปนทีช็อป</p>
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
                      <span className="text-3xl font-extrabold text-rose-700">฿ {csrBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                            animationDuration: `${Math.max(15, Math.min(20, csrFeed.slice(0, 20).length) * 2.5)}s`
                          }}
                        >
                          {[...csrFeed.slice(0, 20), ...csrFeed.slice(0, 20)].map((item, idx) => (
                            <div key={idx} className="h-[38px] flex justify-between items-center text-[11px] text-slate-600 bg-white px-3.5 rounded-xl border border-slate-100 shadow-sm transition hover:scale-[1.01] hover:border-rose-100">
                              <span className="font-semibold flex items-center gap-1.5 min-w-0">
                                <span className="text-rose-500 shrink-0">💖</span>
                                <span className="truncate">คุณ {item.name || item.username || 'ผู้ใหญ่ใจดี'}</span>
                              </span>
                              <span className="text-rose-500 font-extrabold shrink-0 bg-rose-50/50 px-2 py-0.5 rounded-lg border border-rose-100/30">฿{parseFloat(item.amount || '0').toFixed(2)}</span>
                            </div>
                          ))}
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
                    <p className="text-xs text-slate-400">ผู้แนะนำผู้สมัครจะได้รับสิทธิ์โบนัสทันที 50% ของคะแนน PV แรกเข้าสั่งซื้อแพ็กเกจ S</p>
                    
                    <div className="mt-6 space-y-4">
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

          {/* PROFILE & KYC TAB */}
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
                          <input 
                            type="text" 
                            required
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="เช่น 0812345678"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1">อีเมลหลัก *</label>
                          <input 
                            type="email" 
                            required
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="เช่น name@example.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-xs font-bold mb-1">ธนาคารปลายทาง</label>
                          <select
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          >
                            <option value="">-- ไม่ระบุ --</option>
                            <option value="ธนาคารกสิกรไทย">กสิกรไทย (KBank)</option>
                            <option value="ธนาคารไทยพาณิชย์">ไทยพาณิชย์ (SCB)</option>
                            <option value="ธนาคารกรุงเทพ">กรุงเทพ (BBL)</option>
                            <option value="ธนาคารกรุงไทย">กรุงไทย (KTB)</option>
                            <option value="ธนาคารออมสิน">ออมสิน (GSB)</option>
                            <option value="ธนาคารกรุงศรีอยุธยา">กรุงศรีอยุธยา (BAY)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-700 text-xs font-bold mb-1">เลขบัญชีธนาคาร</label>
                          <input 
                            type="text" 
                            value={editBankAccount} 
                            onChange={(e) => setEditBankAccount(e.target.value.replace(/\D/g, ''))}
                            placeholder="ระบุเลขบัญชีธนาคารเฉพาะตัวเลข"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cascading Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    
                    {/* ID Card Address (Cascading Selector) */}
                    <div className="bg-indigo-50/30 p-5 rounded-2xl border border-slate-100/80 space-y-3">
                      <span className="text-xs font-bold text-indigo-700 block flex items-center gap-1">
                        <MapPin size={14} />
                        ที่อยู่ตามบัตรประชาชน
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">จังหวัด *</label>
                          <input 
                            type="text" 
                            value={idProv}
                            onChange={(e) => setIdProv(e.target.value)}
                            placeholder="ระบุจังหวัด"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">อำเภอ/เขต *</label>
                          <input 
                            type="text" 
                            value={idDist}
                            onChange={(e) => setIdDist(e.target.value)}
                            placeholder="ระบุอำเภอ/เขต"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">ตำบล/แขวง *</label>
                          <input 
                            type="text" 
                            value={idSub}
                            onChange={(e) => setIdSub(e.target.value)}
                            placeholder="ระบุตำบล/แขวง"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">รหัสไปรษณีย์ *</label>
                          <input 
                            type="text" 
                            value={idZip}
                            onChange={(e) => setIdZip(e.target.value.replace(/\D/g, ''))}
                            placeholder="ระบุรหัสไปรษณีย์"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 text-[10px] font-bold mb-1">รายละเอียดที่อยู่ (บ้านเลขที่, ถนน, ซอย) *</label>
                        <textarea 
                          rows={2}
                          value={idDetails}
                          onChange={(e) => setIdDetails(e.target.value)}
                          placeholder="เช่น 123/45 หมู่ 6 ซอยพัฒนา ถนนสุขุมวิท"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-amber-50/10 p-5 rounded-2xl border border-slate-100/80 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-600 block flex items-center gap-1">
                          <ShoppingBag size={14} />
                          ที่อยู่สำหรับจัดส่งสินค้า
                        </span>
                        <label className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={useSameAddress}
                            onChange={(e) => setUseSameAddress(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          ใช้ที่อยู่เดียวกัน
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">จังหวัด *</label>
                          <input 
                            type="text" 
                            value={shipProv}
                            onChange={(e) => setShipProv(e.target.value)}
                            disabled={useSameAddress}
                            placeholder="ระบุจังหวัด"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">อำเภอ/เขต *</label>
                          <input 
                            type="text" 
                            value={shipDist}
                            onChange={(e) => setShipDist(e.target.value)}
                            disabled={useSameAddress}
                            placeholder="ระบุอำเภอ/เขต"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">ตำบล/แขวง *</label>
                          <input 
                            type="text" 
                            value={shipSub}
                            onChange={(e) => setShipSub(e.target.value)}
                            disabled={useSameAddress}
                            placeholder="ระบุตำบล/แขวง"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 text-[10px] font-bold mb-1">รหัสไปรษณีย์ *</label>
                          <input 
                            type="text" 
                            value={shipZip}
                            onChange={(e) => setShipZip(e.target.value.replace(/\D/g, ''))}
                            disabled={useSameAddress}
                            placeholder="ระบุรหัสไปรษณีย์"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 text-[10px] font-bold mb-1">รายละเอียดที่อยู่สำหรับจัดส่งสินค้า *</label>
                        <textarea 
                          rows={2}
                          value={shipDetails}
                          onChange={(e) => setShipDetails(e.target.value)}
                          disabled={useSameAddress}
                          placeholder="กรอกรายละเอียดที่อยู่ปลายทางสำหรับส่งของ"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
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
                      <input 
                        type="password"
                        required
                        maxLength={6}
                        value={oldPinInput}
                        onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="PIN เดิม 6 หลัก"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">รหัสธุรกรรม PIN ใหม่ *</label>
                      <input 
                        type="password"
                        required
                        maxLength={6}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="PIN ใหม่ 6 หลัก"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">ยืนยัน PIN ใหม่ *</label>
                      <input 
                        type="password"
                        required
                        maxLength={6}
                        value={confirmNewPinInput}
                        onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="ยืนยัน PIN ใหม่อีกครั้ง"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                      />
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

          {/* SHOP TAB */}
          {activeTab === 'shop' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-950">ระบบสั่งซื้อ นที พลัส ช็อป 🛍️</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    เลือกซื้อแพ็กเกจขยายตำแหน่งด้วย <span className="font-bold text-indigo-600">E-Cash</span> หรือเลือกซื้อสินค้าทั่วไปจากร้านค้า <span className="font-bold text-amber-600">Natee Plus Shop</span> โดยหักจ่ายผ่าน <span className="font-bold text-amber-600">E-Coupon</span> เป็นอันดับแรก
                  </p>
                </div>

                {/* Sub-Tabs */}
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl shadow-sm border border-slate-200/50">
                  <button 
                    onClick={() => setShopSubTab('packages')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      shopSubTab === 'packages' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📦 (ส่วนที่ 1) แพ็กเกจอัปเกรดตำแหน่ง
                  </button>
                  <button 
                    onClick={() => setShopSubTab('shop')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      shopSubTab === 'shop' ? 'bg-white text-amber-700 shadow-sm border border-slate-200/40' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏪 (ส่วนที่ 2) เว็บร้านค้า Natee Plus Shop
                  </button>
                </div>
              </div>

              {shopSubTab === 'packages' ? (
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
                      <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
                        <div>
                          <div className="overflow-hidden rounded-2xl mb-3 h-32">
                            <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{p.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs mb-3">
                            <span className="text-indigo-600 font-black">฿ {p.price?.toLocaleString()}</span>
                            <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold">+{p.pv} PV</span>
                          </div>
                          <button 
                            onClick={() => handlePurchaseProduct(p.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-[10px] font-bold transition cursor-pointer"
                          >
                            สั่งซื้อแพ็กเกจทันที
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* NATEE PLUS SHOPPING */
                <div>
                  {/* Gatekeeper Check: "คนที่ยังไม่สมัคร จะกดเข้าช้อปไม่ได้" */}
                  {!profile?.rank || profile?.rank === '' ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-sm">
                        <ShieldCheck size={32} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">🔒 สำหรับสมาชิก นที พลัส เท่านั้น</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ระบบร้านค้าช้อปปิ้งจำกัดสิทธิ์การเข้าใช้งานเฉพาะสมาชิกที่สมัครเปิดสิทธิ์อัปเกรดรหัสเรียบร้อยแล้วเท่านั้นค่ะ โปรดทำการซื้อแพ็กเกจ S, M, L, XL หรือ XXL ของท่านก่อนเปิดเข้าช็อปปิ้งสินค้าร้านร่วมค่ะ
                      </p>
                      <button 
                        onClick={() => setShopSubTab('packages')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                      >
                        ไปซื้อแพ็กเกจเปิดตำแหน่งสมาชิก
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Informational Banner about Seller center and Coupon payment rules */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 p-5 rounded-3xl space-y-2 text-xs shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-sm">🏪</span>
                          <h3 className="text-sm font-extrabold text-amber-950">เว็บร้านค้า "Natee Plus Shop"</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          แหล่งศูนย์รวมสินค้าคุณภาพที่ผ่านการคัดสรรจากระบบร้านร่วมค้า ซึ่งลงทะเบียนและสมัครวางจำหน่ายโดยสมาชิกผ่านระบบเว็บ 
                          <span className="font-extrabold text-indigo-600"> "Natee Plus Seller Center"</span> (สงวนสิทธิ์เฉพาะสมาชิกที่อัปเกรดตำแหน่งร้านค้าระดับ M ขึ้นไปเท่านั้น ถึงจะมีสิทธิ์สมัครเปิดร้านเพื่อลงขายสินค้าและรับยอดขายได้)
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-amber-900/95 font-bold border-t border-amber-200/40 mt-1">
                          <span className="flex items-center gap-1">
                            💳 ชำระด้วย: <span className="underline decoration-amber-500 font-extrabold">E-Coupon เป็นอันดับแรก</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            หากไม่พอ: <span className="underline decoration-indigo-500 font-extrabold">หักส่วนต่างอัตโนมัติจาก E-Cash</span>
                          </span>
                        </div>
                      </div>

                      {/* Shopee-style Category Selector */}
                      <div className="flex flex-wrap gap-2 pb-2">
                        {[
                          { id: 'All', label: 'ทั้งหมด (All)' },
                          { id: 'Electronics', label: '🔌 เครื่องใช้ไฟฟ้าและมือถือ' },
                          { id: 'Fashion', label: '🧥 เสื้อผ้าแฟชั่น' },
                          { id: 'Beauty', label: '🧴 สุขภาพและความงาม' },
                          { id: 'Home', label: '☕ ของใช้ในบ้าน' },
                          { id: 'Food', label: '🍜 อาหารและเครื่องดื่ม' },
                          { id: 'General', label: '📦 หมวดหมู่อื่นๆ' }
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              // We will use a local state or simple component variable
                              (window as any)._shopCategory = cat.id;
                              fetchProducts(); // Refresh products
                              setMlmSearchId(prev => prev); // Force re-render trick
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                              ((window as any)._shopCategory || 'All') === cat.id 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Shopee Product List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products
                          .filter(p => p.category !== 'Package')
                          .filter(p => {
                            const currentCat = (window as any)._shopCategory || 'All';
                            return currentCat === 'All' || p.category === currentCat;
                          })
                          .map(p => {
                            // Automatically calculate dynamic PV (50% of Price) if PV is empty/0
                            const displayPv = p.pv || Math.floor(parseFloat(p.price) * 0.5);
                            
                            return (
                              <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between group hover:shadow-md transition relative">
                                {p.sellerStoreName && (
                                  <span className="absolute top-3 left-3 bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] z-10 border border-indigo-100/60 shadow-sm">
                                    🏪 {p.sellerStoreName}
                                  </span>
                                )}

                                <div>
                                  <div className="overflow-hidden rounded-2xl mb-3 h-40 relative">
                                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">{p.name}</h4>
                                  
                                  {/* Short Description Field shown prominently */}
                                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-[10px] text-slate-600 my-2 leading-relaxed">
                                    💡 <b>จุดเด่นย่อ:</b> {p.shortDescription || "ไม่มีข้อมูลคำอธิบายย่อ"}
                                  </div>

                                  <details className="text-[10px] text-slate-400 cursor-pointer focus:outline-none mb-2">
                                    <summary className="font-semibold text-slate-500 hover:text-slate-800">อ่านรายละเอียดเพิ่ม...</summary>
                                    <p className="mt-1 bg-slate-50/50 p-2 rounded text-[10px] leading-normal">{p.description}</p>
                                  </details>
                                </div>

                                <div className="mt-2 pt-3 border-t border-slate-100">
                                  <div className="flex justify-between items-center text-xs mb-3">
                                    <span className="text-indigo-600 font-black text-sm">฿ {p.price?.toLocaleString()}</span>
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold">
                                      +{displayPv} PV
                                    </span>
                                  </div>
                                  <button 
                                    onClick={() => handlePurchaseProduct(p.id)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                                  >
                                    สั่งซื้อสินค้าชิ้นนี้
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        
                        {products.filter(p => p.category !== 'Package').filter(p => {
                          const currentCat = (window as any)._shopCategory || 'All';
                          return currentCat === 'All' || p.category === currentCat;
                        }).length === 0 && (
                          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                            ยังไม่มีสินค้าจำหน่ายร่วมในหมวดหมู่นี้ค่ะ
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NETWORK TREES */}
          {activeTab === 'mlm' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">ระบบผังองค์กรขยายเครือข่าย นที พลัส 🕸️</h2>
                  <p className="text-xs text-slate-400 mt-1">บริหารจัดการผังสายงาน Binary แผน A, สายผู้แนะนำตรง และประเมินสถานะกองทุน Plan B1-B15</p>
                </div>

                {/* Sub-menu buttons for MLM */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => setMlmSubTab('binary')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      mlmSubTab === 'binary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🕸️ ผังไบนารี Plan A
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
                        onClick={() => setActiveTab('shop')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        🛍️ ไปที่หน้าซื้อแพ็กเกจ (Shop)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">🕸️ แผนผังไบนารีสองสายงาน (Binary Plan A)</h3>
                        <p className="text-xs text-slate-400 mt-0.5">แสดงแผนผังโครงสร้างสายงานระบบสองสายงาน (Binary Plan A) ใต้องค์กรของท่าน</p>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <input 
                          type="text" 
                          placeholder="ค้นหารหัสสมาชิกใต้สายงาน"
                          value={mlmSearchId}
                          onChange={(e) => setMlmSearchId(e.target.value.toUpperCase())}
                          className="border border-slate-200 rounded-xl px-4 py-2 text-xs bg-white focus:outline-none w-full md:w-56"
                        />
                        <button 
                          onClick={fetchMlmTrees}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Search size={14} /> ค้นหา
                        </button>
                        {mlmSearchId && (
                          <button 
                            onClick={() => { setMlmSearchId(''); setTimeout(() => fetchMlmTrees(), 50); }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-xl text-xs font-bold"
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
                        {planBSelectedTier === 1 
                          ? 'กองทุนรันระบบขั้นต้นสำหรับผู้สมัครสมาชิกทุกระดับ มอบสิทธิ์ในการปันผลเมื่อคิวสายงาน Global ขยายถึง 100% ระบบจ่ายรับคอมมิชชั่น E-Cash สุทธิ = 850.00 บาท ต่อรอบปันผล +คูปอง + E-Share + สิทธิ์ระดับถัดไป จะโอนโดยอัตโนมัติ'
                          : `กองทุนอัปเกรดออโต้รันระดับสูง ผู้ร่วมสายงานจะได้รับสิทธิ์ปันผลเมื่อสายงาน Global ขยายตัวครบตามรอบระบบ และจะโอนสิทธิ์ไปสู่ระดับถัดไปโดยอัตโนมัติเมื่อปันผลครบถ้วน`
                        }
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
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">ยอดเงินสะสมในระบบ (ก่อนหัก)</span>
                                <span className="font-bold text-slate-700 text-sm">
                                  ฿ {details.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                <span className="text-slate-500 font-medium">ยอดสุทธิเข้า E-Cash (หลังหัก 20%)</span>
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
                                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                                  <span className="text-slate-500">ส่วนรายได้ของบริษัท</span>
                                  <span className="font-bold text-slate-800">
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
                              📌 <b>หมายเหตุเงื่อนไข:</b> เมื่อสายงานของคุณได้รับการเติมเต็ม {planBSelectedTier === 1 ? '8 ชั้นลึก (510 รหัส)' : '5 ชั้นลึก (62 รหัส)'} ระบบจะตัดรอบจ่ายและโอนสิทธิ์คุณไปขึ้นระดับถัดไปโดยอัตโนมัติ ไม่ต้องกดทำรายการใดๆ ค่ะ
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
                    <form onSubmit={initiateTransferECashMember} className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">รหัสผู้ใช้ / เบอร์โทรศัพท์ปลายทาง</label>
                        <input 
                          type="text" 
                          required
                          value={transferUser}
                          onChange={(e) => setTransferUser(e.target.value)}
                          placeholder="ไอดีผู้รับปลายทาง"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">จำนวนยอดเงิน (E-Cash)</label>
                        <input 
                          type="number" 
                          required
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="จำนวนเงิน"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <input 
                          type="password" 
                          required
                          maxLength={6}
                          value={transferPin}
                          onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="ใส่รหัสธุรกรรม PIN 6 หลัก"
                          className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest focus:border-indigo-500"
                        />
                        <button type="submit" disabled={isVerifyingRecipient} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl text-xs font-bold disabled:bg-slate-300 cursor-pointer">
                          {isVerifyingRecipient ? 'กำลังตรวจสอบ...' : 'ยืนยันการโอนเงิน'}
                        </button>
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
                          min={300}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="ยอดถอน E-Money (ขั้นต่ำ ฿300)"
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
                          ⚠️ การถอนเงินเข้าธนาคาร ต้องมียอดเงินใน E-Money ขั้นต่ำ 300 บาทขึ้นไป และยอดถอนขั้นต่ำคือ 300 บาทขึ้นไปค่ะ
                        </p>
                      </div>
                      <div className="col-span-2 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-[10px] space-y-1 text-slate-500">
                        <p>ชื่อผู้รับโอนเงินปลายทาง: <b>{profile?.name} {profile?.surname}</b></p>
                        <p>ธนาคาร: <b>{profile?.bankName} (เลขที่: {profile?.bankAccount})</b></p>
                        <p className="text-rose-500 font-bold">✓ หักค่าบริการระบบหลังบ้าน 15% และหักภาษี ณ ที่จ่าย 5% รวมหักทั้งสิ้น 20% เพื่อรักษาเสถียรภาพ</p>
                        {withdrawAmount && (
                          <div className="mt-2 pt-2 border-t border-slate-200 text-xs font-bold text-slate-800 flex justify-between">
                            <span>ยอดเงินที่จะเข้าบัญชีจริง:</span>
                            <span className="text-emerald-600">฿ {(parseFloat(withdrawAmount) * 0.80).toFixed(2)} บาท</span>
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
          {activeTab === 'report' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">รายงานข้อมูลระบบ นที พลัส 📊</h2>
                  <p className="text-xs text-slate-400 mt-1">สรุปข้อมูลการเงิน คูปอง รายรับออลแชร์ และโครงสร้างสายงานในระบบของคุณ</p>
                </div>

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
                </div>
              </div>

              {/* REPORT E-CASH SUB-VIEW */}
              {reportSubTab === 'ecash' && (
                <div className="space-y-6">
                  {/* Ledger Balance Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-emerald-100 font-medium">ยอดคงเหลือ E-Cash ปัจจุบัน</span>
                      <h3 className="text-3xl font-extrabold tracking-tight">฿ {profile?.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="text-[11px] bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm space-y-1">
                      <div>• ยอดรวมเงินหมุนเวียน E-Cash ทั้งระบบประมวลผลเรียลไทม์</div>
                      <div>• ปลอดภัยด้วยรหัส PIN และระบบยืนยันตนสองชั้น</div>
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
                      const paginatedTxns = eCashTxns.slice(startIndex, startIndex + itemsPerPage);

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
                        if (t.type === 'Deposit_System') return false;
                        return (
                          t.currency === 'E-Money' ||
                          t.type === 'Bonus' ||
                          t.type === 'AllShare' ||
                          t.type === 'EShare' ||
                          t.type === 'Commission'
                        );
                      });

                      const itemsPerPage = 20;
                      const startIndex = (eMoneyPage - 1) * itemsPerPage;
                      const paginatedTxns = eMoneyTxns.slice(startIndex, startIndex + itemsPerPage);

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
                      <p className="text-[10px] text-amber-200 pt-2">• ยอดสุทธิหลังจากหักแบ่งจัดสรรเข้าระบบ Plan B แล้ว 50% และโอนเข้ากระเป๋า E-Cash ของคุณ</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">ตำแหน่งเกียรติยศและคุณสมบัติรับ E-Share</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600`}>
                            {profile?.rank || "Member"}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {profile?.rank === 'XXL' ? 'คุณสมบัติรับออลแชร์สูงสุด (Active)' : 'ต้องการแพ็กเกจระดับสูงเพื่อสิทธิ์เต็มจำนวน'}
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
                      const allShareTxns = transactions.filter(t => t.type === 'EShare');
                      const itemsPerPage = 20;
                      const startIndex = (allSharePage - 1) * itemsPerPage;
                      const paginatedTxns = allShareTxns.slice(startIndex, startIndex + itemsPerPage);

                      return (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-100">
                                  <th className="px-4 py-3">เลขอ้างอิงรายการ</th>
                                  <th className="px-4 py-3">วันเวลาประมวลผล</th>
                                  <th className="px-4 py-3">คำอธิบายโบนัสออลแชร์</th>
                                  <th className="px-4 py-3">ยอดได้รับเข้ารายได้ E-Cash (50%)</th>
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
                                        <td className="px-4 py-3">{member.name}</td>
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
                                        <td className="px-4 py-3">{member.name}</td>
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
            </div>
          )}

          {/* SELLER CENTER PORTAL */}
          {activeTab === 'seller' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-indigo-950">Natee Plus Seller Center 🛒</h2>
                <p className="text-xs text-slate-400 mt-1">แผงควบคุมร้านค้าออนไลน์เพื่อการค้าปลีก-ส่ง และเพิ่มคะแนนผลิตภัณฑ์พรีเมียม</p>
              </div>

              {!profile?.rank || profile?.rank === 'Member' || profile?.rank === 'S' ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center max-w-2xl">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">🔒 จำกัดสิทธิ์เฉพาะสมาชิกตำแหน่งระดับ M ขึ้นไปเท่านั้น</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mt-2">
                    คุณยังไม่ได้ทำการสั่งซื้อสิทธิ์แพ็กเกจร้านค้าหรือระดับตำแหน่งสมาชิกของ นที พลัส ถึงเกณฑ์ที่กำหนดค่ะ
                    สงวนสิทธิ์เฉพาะสมาชิกที่ถือตำแหน่งเปิดร้านค้าระดับ M ขึ้นไป (M, L, XL, XXL) เท่านั้น จึงจะมีสิทธิ์เข้าสู่ระบบพอร์ทัลและสมัครเปิดร้านขายสินค้าบน Natee Plus Seller Center ได้ค่ะ
                  </p>
                  <button 
                    onClick={() => { setActiveTab('shop'); setShopSubTab('packages'); }}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    ไปอัปเกรดตำแหน่งสมาชิก (เริ่มต้นระดับ M 500 บาท)
                  </button>
                </div>
              ) : profile?.sellerStatus === 'Pending' ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-center max-w-2xl space-y-6">
                  <div>
                    <RefreshCw size={44} className="text-indigo-600 mx-auto animate-spin mb-4" />
                    <h3 className="text-base font-bold text-slate-900">อยู่ระหว่างตรวจสอบร้านค้าและคลังสินค้า</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
                      เอกสารคำขอเปิดร้านค้า นทีเซลเลอร์เซ็นเตอร์ ได้ถูกส่งไปที่ระบบแอดมินหลังบ้านเรียบร้อยแล้ว แอดมินจะทำการตรวจสอบที่อยู่จัดส่งและแผนที่พิกัดที่ปักหมุดไว้ของร้านเพื่ออนุมัติโดยเร็วค่ะ
                    </p>
                  </div>
                  
                  {/* Read-only map representation of user's pending application */}
                  <div className="text-left border-t border-slate-100 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">📍 ที่ตั้งและพิกัดแผนที่คลังสินค้าที่ท่านยื่นขออนุมัติ:</h4>
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">{profile?.sellerAddress}</p>
                    <NateeWarehouseMap 
                      lat={profile?.warehouseLat || 13.7563} 
                      lng={profile?.warehouseLng || 100.5018} 
                      readOnly={true}
                    />
                  </div>
                </div>
              ) : (profile?.sellerStatus === 'NotApplied' || !profile?.sellerStatus) ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm max-w-2xl">
                  <h3 className="text-base font-bold text-indigo-950 mb-2">สมัครเป็นพาร์ทเนอร์ร้านค้าเปิดขายของกับ นที พลัส</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    ยินดีต้อนรับเข้าสู่ระบบพาร์ทเนอร์ร้านค้านทีพลัส! ร้านค้าที่เปิดจำหน่ายผลิตภัณฑ์ร่วมทุนในระบบนทีช็อป จะได้รับสิทธิ์หักค่าฟีระบบ GP 20% โดยที่คะแนน PV อีก 50% ของ GP จะถูกดึงย้อนกลับมาคำนวณจ่ายปันผลคอมมิชชันแก่สายงาน MLM ของท่านทันที!
                  </p>

                  <form onSubmit={handleSellerApply} className="space-y-5 text-xs text-slate-700">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1.5">ตั้งชื่อร้านค้าออนไลน์ (ชื่อแบรนด์)</label>
                      <input 
                        type="text" 
                        required
                        value={sellerStoreName}
                        onChange={(e) => setSellerStoreName(e.target.value)}
                        placeholder="ชื่อร้าน เช่น นทีเครื่องแกงใต้"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">ที่ตั้งคลังสินค้าและจัดส่ง</label>
                        <textarea 
                          rows={3}
                          required
                          value={sellerAddress}
                          onChange={(e) => setSellerAddress(e.target.value)}
                          placeholder="กรอกข้อมูลที่อยู่สำหรับรับพัสดุคืน"
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                        />
                      </div>

                      {/* Interactive Google Map Pinning */}
                      <NateeWarehouseMap 
                        lat={warehouseLat} 
                        lng={warehouseLng} 
                        onChange={(lat, lng) => {
                          setWarehouseLat(lat);
                          setWarehouseLng(lng);
                        }}
                        address={sellerAddress}
                        onAddressChange={(addr) => setSellerAddress(addr)}
                      />
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 leading-relaxed">
                      <p className="font-bold text-slate-800 text-[11px]">📝 เงื่อนไขและข้อตกลงการเปิดบัญชีร้านร่วม (PDPA Consent):</p>
                      <p className="text-[10px] text-slate-500">
                        ข้าพเจ้าอนุญาตให้ นที พลัส จัดเก็บประวัติ รูปภาพสแกนใบหน้าเพื่อความปลอดภัย และข้อมูลที่อยู่ส่งคืนคลังสินค้า เพื่อใช้สำหรับการตรวจสอบสิทธิการจัดจำหน่ายและเชื่อมต่อระบบจัดส่งขนส่งในอนาคตตามกฎหมาย PDPA ทุกประการ
                      </p>
                      <label className="flex items-center gap-2 text-[10px] text-slate-700 font-bold mt-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pdpaAgreed}
                          onChange={(e) => setPdpaAgreed(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        ข้าพเจ้าได้ยอมรับเงื่อนไขและข้อบังคับทั้งหมดเรียบร้อยแล้ว
                      </label>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg text-xs cursor-pointer"
                    >
                      ส่งเอกสารคำสมัครเปิดร้านค้าออนไลน์
                    </button>
                  </form>
                </div>
              ) : profile?.sellerStatus === 'Active' ? (
                <div className="space-y-6">
                  {/* Navigation Tabs inside Seller Center */}
                  <div className="flex border-b border-slate-200 gap-4 mb-4">
                    <button
                      id="seller_tab_products_btn"
                      onClick={() => setSellerPortalTab('products')}
                      className={`pb-3 px-6 text-sm font-bold transition-all relative cursor-pointer ${
                        sellerPortalTab === 'products'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 font-extrabold'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      🛍️ สินค้าและจัดส่งอนุมัติ
                    </button>
                    <button
                      id="seller_tab_orders_btn"
                      onClick={() => setSellerPortalTab('orders')}
                      className={`pb-3 px-6 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                        sellerPortalTab === 'orders'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 font-extrabold'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      📦 ออเดอร์และส่งสินค้าของร้าน
                      {sellerOrders.filter((o: any) => o.status === 'Processing').length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                          {sellerOrders.filter((o: any) => o.status === 'Processing').length}
                        </span>
                      )}
                    </button>
                  </div>

                  {sellerPortalTab === 'products' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Column: Seller Store Stats & Warehouse Map */}
                      <div className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                              <Star size={20} />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">ร้านค้าออนไลน์ระดับแชมป์</span>
                              <h4 className="text-sm font-bold text-slate-900">{profile?.sellerStoreName}</h4>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">รหัสร้านผู้ขาย</span>
                              <strong className="text-xs font-bold text-indigo-600">{profile?.sellerCode}</strong>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">คะแนนดาวร้าน</span>
                              <strong className="text-xs font-bold text-amber-500">100.00 %</strong>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-normal">
                            *คะแนนร้านร่วมของคุณจะปรับลดลงตามระบบคะแนนรีวิวหากผู้ซื้อกดคะแนนให้ร้านต่ำกว่า 5 ดาว!
                          </p>
                        </div>

                        {/* Active Warehouse Map Box */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                            🗺️ แผนที่พิกัดคลังสินค้าที่ปักหมุด
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                            {profile?.sellerAddress}
                          </p>
                          <NateeWarehouseMap 
                            lat={profile?.warehouseLat || 13.7563} 
                            lng={profile?.warehouseLng || 100.5018} 
                            readOnly={true}
                          />
                        </div>
                      </div>

                      {/* Right Column: Add Product Board & My Products List */}
                      <div className="space-y-6 lg:col-span-2">
                        {/* Add Product Board */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                            <Plus size={16} /> ส่งสินค้าใหม่เข้าพิจารณาจัดขึ้นนทีช็อป (Shop Listing)
                          </h4>

                          <form onSubmit={handleSellerProdSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">ชื่อผลิตภัณฑ์ใหม่</label>
                                <input 
                                  type="text" 
                                  required
                                  value={newProd.name}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="เช่น ยาสีฟันนทีปันสุขสูตรชาเขียว"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">ราคาตั้งขาย (บาท)</label>
                                <input 
                                  type="number" 
                                  required
                                  value={newProd.price}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, price: e.target.value }))}
                                  placeholder="ราคาขายสินค้า"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">คะแนน PV สินค้า (ใช้จ่ายคอมมิชชัน)</label>
                                <input 
                                  type="number" 
                                  required
                                  value={newProd.pv}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, pv: e.target.value }))}
                                  placeholder="คะแนน PV"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">ต้นทุนสินค้า (บาท)</label>
                                <input 
                                  type="number" 
                                  required
                                  value={newProd.cost}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, cost: e.target.value }))}
                                  placeholder="ต้นทุนสินค้า เช่น 150"
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-700 font-semibold mb-1">หมวดหมู่ผลิตภัณฑ์</label>
                                <select 
                                  value={newProd.category}
                                  onChange={(e) => setNewProd(prev => ({ ...prev, category: e.target.value }))}
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                >
                                  <option value="General">ทั่วไป (General)</option>
                                  <option value="Supplement">อาหารเสริมฟื้นฟูสุขภาพ</option>
                                  <option value="Household">สินค้าอุปโภคครัวเรือน</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">คำอธิบายรายละเอียดสรรพคุณ</label>
                              <textarea 
                                rows={2}
                                value={newProd.description}
                                onChange={(e) => setNewProd(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="อธิบายสรรพคุณสินค้าสั้นๆ"
                                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-semibold mb-1">📷 รูปภาพสินค้า</label>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    const r = new FileReader();
                                    r.onloadend = () => setNewProd(prev => ({ ...prev, imageFile: r.result as string }));
                                    r.readAsDataURL(f);
                                  }
                                }}
                                className="w-full text-xs"
                              />
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] space-y-1 text-slate-500">
                              <p>✓ หักค่าบริการพอร์ทัล GP 20% เผื่อย้อนกลับมาจ่ายโบนัส MLM ในองค์กรสมาชิก</p>
                              {newProd.price && (
                                <p className="font-bold text-slate-800">ยอดเงินโอนเข้าบัญชีผู้จัดส่งสุทธิ: ฿ {(parseFloat(newProd.price) * 0.80).toFixed(2)} บาทต่อชิ้น</p>
                              )}
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">
                              เพิ่มรายการและส่งแอดมินอนุมัติผลิตภัณฑ์
                            </button>
                          </form>
                        </div>

                        {/* Seller's Submitted Products List */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                            🛍️ รายการสินค้าของคุณทั้งหมด ({sellerProducts.length} รายการ)
                          </h4>
                          {sellerProducts.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-6">คุณยังไม่ได้ส่งผลิตภัณฑ์เข้าพิจารณาค่ะ</p>
                          ) : (
                            <div className="space-y-4">
                              {sellerProducts.map((p) => {
                                let badgeColor = "bg-amber-100 text-amber-800";
                                let statusTxt = "รอแอดมินอนุมัติ";
                                if (p.status === "Approved") {
                                  badgeColor = "bg-emerald-100 text-emerald-800";
                                  statusTxt = "เปิดจำหน่ายแล้ว";
                                } else if (p.status === "Rejected") {
                                  badgeColor = "bg-rose-100 text-rose-800";
                                  statusTxt = "ปฏิเสธ";
                                }

                                return (
                                  <div key={p.id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition">
                                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                          {statusTxt}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-1 truncate">{p.description || "ไม่มีคำอธิบาย"}</p>
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px]">
                                        <span className="text-slate-600 font-medium">ราคา: <strong className="text-indigo-600">฿{p.price.toLocaleString()}</strong></span>
                                        <span className="text-slate-600 font-medium">คะแนน: <strong className="text-teal-600">{p.pv} PV</strong></span>
                                        <span className="text-slate-600 font-medium">ส่วนแบ่งร้านค้า (80%): <strong className="text-emerald-600">฿{(p.price * 0.8).toFixed(2)}</strong></span>
                                      </div>
                                      {p.status === "Rejected" && p.rejectReason && (
                                        <div className="mt-2 text-[10px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2 leading-relaxed">
                                          <strong>เหตุผลที่ไม่อนุมัติ:</strong> {p.rejectReason}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* My Store Orders Tab */
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          📦 รายการสั่งซื้อสินค้าแบรนด์คุณ ({sellerOrders.length} รายการ)
                        </h4>
                        <button
                          onClick={fetchSellerData}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={12} /> รีเฟรชข้อมูลออเดอร์
                        </button>
                      </div>

                      {sellerOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 italic">
                          <p className="text-xs">ยังไม่มีสมาชิกสั่งซื้อสินค้าจากแบรนด์ของคุณในขณะนี้ค่ะ 🛒</p>
                          <p className="text-[10px] text-slate-400 mt-1">เมื่อมีบิลสั่งซื้อเข้ามา รายชื่อและที่อยู่สำหรับจัดส่งพัสดุจะแสดงขึ้นที่นี่!</p>
                        </div>
                      ) : (
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
                              {sellerOrders.map((order) => {
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
                                      ) : (
                                        <div className="space-y-1.5 max-w-[180px]">
                                          <select
                                            value={tracking.company}
                                            onChange={(e) => setSellerShippingTracking(prev => ({
                                              ...prev,
                                              [order.id]: { ...(prev[order.id] || { company: 'Flash Express', trackingNo: '', note: '' }), company: e.target.value }
                                            }))}
                                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
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
                                            onClick={() => handleSellerShipOrder(order.id)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer"
                                          >
                                            ยืนยันการจัดส่งพัสดุ
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

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
          {(activeTab === 'admin' && (currentUser.role === 'Admin' || currentUser.role === 'Manager')) && (
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

              {/* Admin Submenu */}
              <div className="flex flex-wrap gap-2 mb-4">
                  <button 
                    onClick={() => setAdminSubTab('queues')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative ${
                      adminSubTab === 'queues' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      adminSubTab === 'members' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    👥 ข้อมูลสมาชิก
                  </button>

                  <button 
                    onClick={() => setAdminSubTab('memberApprovals')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative ${
                      adminSubTab === 'memberApprovals' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    📋 ตรวจสอบอนุมัติสมัครใหม่
                    {kycQueue.length > 0 && (
                      <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                        {kycQueue.length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setAdminSubTab('depositApprove')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative ${
                      adminSubTab === 'depositApprove' 
                        ? 'bg-rose-600 text-white shadow-md' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50'
                    }`}
                  >
                    💰 อนุมัติเติมเงิน E-Cash
                    {depositQueue.length > 0 && (
                      <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                        {depositQueue.length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setAdminSubTab('shippingApprove')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative ${
                      adminSubTab === 'shippingApprove' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    🚚 อนุมัติ การจัดส่งสินค้า A
                    {adminOrders.filter((o: any) => o.status === "Processing").length > 0 && (
                      <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                        {adminOrders.filter((o: any) => o.status === "Processing").length}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setAdminSubTab('manageShops')} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative ${
                      adminSubTab === 'manageShops' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    🏪 จัดการร้านค้า
                    {prodQueue && prodQueue.length > 0 && (
                      <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                        {prodQueue.length}
                      </span>
                    )}
                  </button>

                  <button onClick={() => setAdminSubTab('orderStatus')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${adminSubTab === 'orderStatus' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>📦 จัดสถานะสินค้า</button>
                  <button onClick={() => setAdminSubTab('couponPv')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${adminSubTab === 'couponPv' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    🎟️ ยอด PV คูปอง ({pendingCouponPv.length})
                  </button>
                  <button onClick={() => setAdminSubTab('systemReset')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${adminSubTab === 'systemReset' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    ⚙️ รีเซ็ตระบบ
                  </button>
                  {profile?.role === 'Manager' && (
                    <button onClick={() => setAdminSubTab('bankSettings')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${adminSubTab === 'bankSettings' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                      🏦 ตั้งค่าธนาคาร & QR Code (Manager)
                    </button>
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
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  💸 ตารางอนุมัติเบิกยอดเงินรายได้สมาชิก (Bank Withdrawal Queue)
                </h4>
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
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
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
                                      <span className="block text-emerald-600 font-bold text-xs">E-Cash: ฿{member.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-purple-600 font-bold text-[10px]">E-Money: ฿{(member.balanceEMoney || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-indigo-500 font-bold text-[10px]">Coupon: ฿{member.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="pt-1 border-t border-slate-100">
                                      <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none mb-0.5">สะสมทั้งหมด</span>
                                      <span className="block text-emerald-700 font-bold text-[11px]">รายได้สะสม: ฿{(member.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                      <span className="block text-indigo-600 font-bold text-[10px]">คูปองสะสม: ฿{(member.totalCouponsEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button 
                                      onClick={() => {
                                        setEditingMember({ ...member });
                                        setShowEditMemberModal(true);
                                      }}
                                      className="bg-slate-800 hover:bg-rose-600 text-white hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer"
                                    >
                                      แก้ไขข้อมูล
                                    </button>
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

              {/* ADMIN PACKAGE ITEMS MANAGER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to Add New Choice */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    📦 เพิ่มตัวเลือกสินค้าแพ็กเกจ (Add Package Item Option)
                  </h4>
                  <form onSubmit={handleAddPackageChoice} className="space-y-3 text-xs text-slate-700">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">เลือกแพ็กเกจหลัก</label>
                      <select 
                        value={adminNewChoicePackageId} 
                        onChange={(e) => setAdminNewChoicePackageId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                      >
                        <option value="pack_m">M - ชุดครอบครัวประหยัด</option>
                        <option value="pack_l">L - ชุดดูแลสุขภาพแบบองค์รวม</option>
                        <option value="pack_xl">XL - ชุดนักขยายธุรกิจ</option>
                        <option value="pack_xxl">XXL - ชุดผู้ประกอบการ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">ชื่อเซ็ตสินค้า (ภาษาไทย / รายการสินค้า)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="เช่น มะหาดสบู่สมุนไพรออร์แกนิก 2 กล่อง + ยาสีฟัน"
                        value={adminNewChoiceName}
                        onChange={(e) => setAdminNewChoiceName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">ต้นทุนสินค้า (Cost / บาท)</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="กรอกต้นทุนสินค้า เช่น 150"
                        value={adminNewChoiceCost}
                        onChange={(e) => setAdminNewChoiceCost(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl transition shadow-sm text-xs cursor-pointer"
                    >
                      บันทึกเพิ่มรายการชุดสินค้า
                    </button>
                  </form>
                </div>

                {/* List of Existing Choices grouped by package */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    📋 รายการตัวเลือกชุดสินค้าแยกตามตำแหน่งปัจจุบัน
                  </h4>
                  <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 text-xs text-slate-700">
                    {['pack_m', 'pack_l', 'pack_xl', 'pack_xxl'].map(pkgId => {
                      const pkgName = products.find(p => p.id === pkgId)?.name || pkgId.toUpperCase();
                      const choices = packageChoices.filter(c => c.packageId === pkgId);
                      return (
                        <div key={pkgId} className="border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                          <h5 className="font-extrabold text-indigo-900 border-b border-indigo-100 pb-1 mb-2">
                            {pkgName}
                          </h5>
                          {choices.length > 0 ? (
                            <div className="space-y-1.5">
                              {choices.map(choice => (
                                <div key={choice.id} className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 flex justify-between items-center text-[11px]">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-800">{choice.name}</span>
                                    {choice.cost !== undefined && (
                                      <span className="text-[10px] text-emerald-600 font-semibold font-mono">ต้นทุน: ฿{parseFloat(choice.cost).toLocaleString()} บาท</span>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => handleDeletePackageChoice(choice.id)}
                                    className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-[10px]"
                                  >
                                    ลบออก
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">ไม่มีข้อมูลชุดสินค้า แนะนำให้เพิ่มเซ็ตสินค้า</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                            {paginatedOrders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-400">
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
                          <th className="px-4 py-3">ผู้แนะนำ (Sponsor)</th>
                          <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                          <th className="px-4 py-3">เบอร์โทร / อีเมล</th>
                          <th className="px-4 py-3">ระดับ / สิทธิ์</th>
                          <th className="px-4 py-3 text-right">E-Cash / E-Coupon</th>
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
                            m.sponsorId?.toLowerCase().includes(q) ||
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
                              <span className="block text-emerald-600 font-bold">฿ {member.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              <span className="block text-[10px] text-indigo-500 font-bold">฿ {member.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => {
                                  setEditingMember({ ...member });
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
                            <td colSpan={7} className="text-center py-8 text-slate-400">
                              ไม่พบข้อมูลสมาชิกในระบบ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
                            <th className="px-4 py-3 text-right">E-Cash / E-Coupon</th>
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
                                <span className="block text-emerald-600 font-bold">฿ {member.balanceECash?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="block text-[10px] text-indigo-500 font-bold">฿ {member.balanceECoupon?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => {
                                    setEditingMember({ ...member });
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
                        <span className="bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-xl text-xs font-black animate-pulse">
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

              {adminSubTab === 'shippingApprove' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Package choices manager */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        📦 เพิ่มตัวเลือกสินค้าแพ็กเกจ
                      </h4>
                      <form onSubmit={handleAddPackageChoice} className="space-y-3 text-xs text-slate-700">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">เลือกแพ็กเกจหลัก</label>
                          <select 
                            value={adminNewChoicePackageId} 
                            onChange={(e) => setAdminNewChoicePackageId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          >
                            <option value="pack_m">M - ชุดครอบครัวประหยัด</option>
                            <option value="pack_l">L - ชุดดูแลสุขภาพแบบองค์รวม</option>
                            <option value="pack_xl">XL - ชุดนักขยายธุรกิจ</option>
                            <option value="pack_xxl">XXL - ชุดผู้ประกอบการ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">ชื่อเซ็ตสินค้า (ภาษาไทย / รายการสินค้า)</label>
                          <input 
                            type="text" 
                            required
                            placeholder="เช่น มะหาดสบู่สมุนไพรออร์แกนิก 2 กล่อง + ยาสีฟัน"
                            value={adminNewChoiceName}
                            onChange={(e) => setAdminNewChoiceName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">ต้นทุนสินค้า (Cost / บาท)</label>
                          <input 
                            type="number" 
                            step="any"
                            placeholder="กรอกต้นทุนสินค้า เช่น 150"
                            value={adminNewChoiceCost}
                            onChange={(e) => setAdminNewChoiceCost(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition shadow-sm text-xs cursor-pointer"
                        >
                          บันทึกเพิ่มรายการชุดสินค้า
                        </button>
                      </form>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        📋 รายการตัวเลือกชุดสินค้าแยกตามตำแหน่งปัจจุบัน
                      </h4>
                      <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2 text-xs text-slate-700">
                        {['pack_m', 'pack_l', 'pack_xl', 'pack_xxl'].map(pkgId => {
                          const pkgName = products.find(p => p.id === pkgId)?.name || pkgId.toUpperCase();
                          const choices = packageChoices.filter(c => c.packageId === pkgId);
                          return (
                            <div key={pkgId} className="border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                              <h5 className="font-extrabold text-indigo-900 border-b border-indigo-100 pb-1 mb-2 text-[11px]">
                                {pkgName}
                              </h5>
                              {choices.length > 0 ? (
                                <div className="space-y-1.5">
                                  {choices.map(choice => (
                                    <div key={choice.id} className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 flex justify-between items-center text-[11px]">
                                      <div className="flex flex-col">
                                        <span className="font-medium text-slate-800">{choice.name}</span>
                                        {choice.cost !== undefined && (
                                          <span className="text-[10px] text-emerald-600 font-semibold font-mono">ต้นทุน: ฿{parseFloat(choice.cost).toLocaleString()} บาท</span>
                                        )}
                                      </div>
                                      <button 
                                        onClick={() => handleDeletePackageChoice(choice.id)}
                                        className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-[10px]"
                                      >
                                        ลบออก
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">ไม่มีข้อมูลชุดสินค้า แนะนำให้เพิ่มเซ็ตสินค้า</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

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
                  {/* Shop & Product Approvals queue */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      📦 ตารางอนุมัติเปิดจำหน่ายผลิตภัณฑ์จากร้านค้าร่วม (Product Approval Queue)
                    </h4>
                    <div className="overflow-x-auto text-xs text-slate-700">
                      {(() => {
                        const itemsPerPage = 20;
                        const startIndex = (adminProductQueuePage - 1) * itemsPerPage;
                        const paginatedProdQueue = (prodQueue || []).slice(startIndex, startIndex + itemsPerPage);

                        return (
                          <>
                            {prodQueue && prodQueue.length > 0 ? (
                              <>
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                                      <th className="py-2.5">รูปสินค้า</th>
                                      <th className="py-2.5">ชื่อสินค้า / ร้านค้า</th>
                                      <th className="py-2.5 text-center">ราคาขาย</th>
                                      <th className="py-2.5 text-center">คะแนน PV</th>
                                      <th className="py-2.5 text-center">ต้นทุนสินค้า</th>
                                      <th className="py-2.5 text-center text-rose-500">ส่วนต่างบริษัท (กำไร)</th>
                                      <th className="py-2.5 text-right">ดำเนินการ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {paginatedProdQueue.map((item) => {
                                      const cost = item.cost !== undefined ? item.cost : Math.floor(item.price * 0.30);
                                      const companyProfit = parseFloat((item.price - (item.pv || 0) - (item.price * 7 / 107) - cost).toFixed(2));
                                      return (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                          <td className="py-3">
                                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100" referrerPolicy="no-referrer" />
                                          </td>
                                          <td className="py-3">
                                            <h5 className="font-bold text-slate-800">{item.name}</h5>
                                            <p className="text-[10px] text-slate-400">ร้านค้า: {item.sellerStoreName || 'ไม่ระบุ'} ({item.sellerCode || item.sellerId})</p>
                                          </td>
                                          <td className="py-3 text-center font-bold">฿{item.price?.toLocaleString()}</td>
                                          <td className="py-3 text-center font-semibold text-indigo-600">{item.pv} PV</td>
                                          <td className="py-3 text-center font-semibold text-amber-600">฿{cost?.toLocaleString()}</td>
                                          <td className="py-3 text-center font-extrabold text-emerald-600">
                                            ฿{companyProfit?.toLocaleString()}
                                            <span className="block text-[8px] text-slate-400 font-normal">หักแวต 7% (~฿{parseFloat((item.price * 7 / 107).toFixed(2))}) แล้ว</span>
                                          </td>
                                          <td className="py-3 text-right">
                                            <button
                                              onClick={() => handleProductApprove(item.id)}
                                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-sm hover:shadow"
                                            >
                                              อนุมัติจำหน่าย
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {prodQueue.length > itemsPerPage && (
                                  <div className="mt-4 pt-4 border-t border-slate-100">
                                    <TablePagination currentPage={adminProductQueuePage} totalItems={prodQueue.length} itemsPerPage={itemsPerPage} onPageChange={setAdminProductQueuePage} />
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-slate-400 text-center py-8">ไม่มีรายการผลิตภัณฑ์ใหม่รอแอดมินอนุมัติในขณะนี้</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

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
                      <div className="relative max-w-xs w-full">
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
                                        <span className="text-slate-400 block font-mono text-[9px]">{prod.id}</span>
                                        <span className="text-slate-900 font-bold">{prod.name}</span>
                                        <span className="block text-[10px] text-indigo-500">ร้านค้า: {prod.sellerStoreName || 'ไม่ระบุ'}</span>
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
                                        <button
                                          onClick={() => {
                                            setEditingProduct({ ...prod });
                                            setShowEditProductModal(true);
                                          }}
                                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition"
                                        >
                                          แก้ไขราคา / รายละเอียด
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

              {adminSubTab === 'systemReset' && (
                <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
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
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
                        <span className="text-xl">⚠️</span>
                        <h4 className="text-xs font-bold text-amber-900">ระงับการซิงค์ Cloud ชั่วคราว (เนื่องจากโควตาฐานข้อมูลบน Cloud เต็ม)</h4>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          ขณะนี้ระบบหลักกำลังรันงานอยู่บนเซิร์ฟเวอร์สำรองท้องถิ่น (Local Failover Mode) อย่างปลอดภัยและอัปเดตแบบเรียลไทม์ 100% 
                          ท่านสามารถใช้งานระบบและทำธุรกรรมได้ตามปกติโดยไม่ต้องกดปุ่มนี้ค่ะ ระบบจะยกเลิกการระงับและซิงค์กลับอัตโนมัติเมื่อพ้นกำหนดรีเซ็ตโควตาประจำวันของ Cloud ค่ะ
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
                      <h3 className="text-lg font-black text-slate-800">🔧 ซ่อมแซมและจัดเรียงโครงสร้างสายงานแผน A (Rebuild Binary Tree)</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        หากท่านพบว่ามีสมาชิกสมัครหรืออัปเกรดตำแหน่งเป็น S หรือสูงกว่าแล้ว แต่ข้อมูลคลาดเคลื่อนไม่ปรากฏรายชื่ออยู่ใน <strong>ผังไบนารี่ (แผน A)</strong> 
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
                          🔧 ประมวลผลจัดเรียงและซ่อมแซมผังไบนารีแผน A
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

              {adminSubTab === 'bankSettings' && profile?.role === 'Manager' && (
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 max-w-2xl mx-auto animate-fadeIn">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-2 border border-rose-100">
                      <CreditCard size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">🏦 ตั้งค่าบัญชีธนาคารและ QR Code (Manager เท่านั้น)</h3>
                    <p className="text-xs text-slate-400">ระบุรายละเอียดบัญชีปลายทางและรูปภาพ QR Code ที่จะนำไปแสดงให้สมาชิกสแกนเมื่อแจ้งฝากเงิน</p>
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
                        placeholder="เช่น บริษัท นที พลัส จำกัด"
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
                                setEditingBankQrFile("");
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
                ตั้งแต่แพ็กเกจตำแหน่ง M ขึ้นไป สมาชิกสามารถระบุเซ็ตสินค้าที่ท่านต้องการได้รับจากระบบได้ที่นี่ โดยแอดมินจะดำเนินการจัดส่งตามรายการที่เลือกค่ะ
              </p>
              
              <div className="space-y-3 mb-6">
                {packageChoices.filter(c => c.packageId === pendingPurchaseProductId).map((choice) => (
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
                
                {packageChoices.filter(c => c.packageId === pendingPurchaseProductId).length === 0 && (
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

        {/* POPUP CONFIRMATION SUMMARY FOR ANY PRODUCT OR PACKAGE PURCHASE */}
        {showPurchaseConfirmModal && confirmProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  {confirmProduct.category === 'Package' ? '📦' : '🛍️'}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  {confirmProduct.category === 'Package' ? 'ยืนยันสรุปการสั่งซื้อแพ็กเกจ' : 'ยืนยันสรุปการสั่งซื้อสินค้า Natee Plus Shop'}
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
                  <h3 className="text-sm font-extrabold text-indigo-900">บริษัท นที พลัส จำกัด (NATEE PLUS CO., LTD.)</h3>
                  <p className="text-[10px] text-slate-400">เลขประจำตัวผู้เสียภาษี: 0105565123456</p>
                  <p className="text-[10px] text-slate-400 font-medium">99/99 อาคารรุ่งเรืองทาวเวอร์ ถนนสุขุมวิท กรุงเทพมหานคร 10110</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase mt-2 text-xs font-sans">ใบเสร็จรับเงินอย่างย่อ / Tax Invoice (ABB)</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-100 pb-3 font-sans">
                  <div>
                    <span className="text-slate-400 block">เลขที่ใบสั่งซื้อ / Bill No:</span>
                    <strong className="text-slate-800 font-mono text-[10px]">{selectedReceiptOrder.id}</strong>
                  </div>
                  <div className="text-right">
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

                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm">
                  <span className="text-slate-900 font-bold">ยอดเงินปลายทางสุทธิ:</span>
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
                    <p className="text-[10px] text-emerald-600 font-semibold text-center">✓ ส่งรหัส OTP 6 หลักไปที่เมลของท่านแล้ว (กรณีจำลองรหัสจะแสดงในกล่อง Alert)</p>
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

        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-100 px-6 py-4 text-center text-[10px] text-slate-400">
          © {new Date().getFullYear()} NaTee Plus (นที พลัส) • โครงสร้างเครือข่ายธุรกิจร้านค้านวัตกรรมอย่างโปร่งใส มั่งคั่ง มั่นคง ยั่งยืน
        </footer>
      </main>
    </div>
  );
}
