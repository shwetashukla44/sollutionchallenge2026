/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map as MapIcon, 
  Package, 
  Warehouse, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  Plus,
  AlertTriangle,
  Zap,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  MapPin,
  Navigation,
  ArrowRight,
  Clock,
  Compass,
  Cloud,
  CloudOff,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Globe,
  BrainCircuit,
  Sparkles,
  Activity,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { shipmentService, fleetService, invoiceService, seedDemoData } from './lib/dataService';
import { getLogisticsInsights, getRouteOptimization, type RouteOptimization } from './services/geminiService';
import { auth, checkConnection } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

// --- Types ---
type UserRole = 'admin' | 'customer';
type View = 'dashboard' | 'shipments' | 'fleet' | 'drivers' | 'routes' | 'warehouses' | 'billing' | 'reports' | 'ai' | 'settings' | 'customer_shipments' | 'customer_tracking';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const selectedShipment = useMemo(() => 
    shipments.find(s => s.id === selectedId), 
    [shipments, selectedId]
  );

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const monitorConnectivity = async () => {
      const connected = await checkConnection();
      setIsOnline(connected);
    };

    monitorConnectivity();
    const interval = setInterval(monitorConnectivity, 30000); // Check every 30s

    window.addEventListener('online', monitorConnectivity);
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', monitorConnectivity);
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (user && role === 'admin') {
      const unsubShipments = shipmentService.subscribeToShipments(setShipments);
      const unsubFleet = fleetService.subscribeToVehicles(setVehicles);
      const unsubInvoices = invoiceService.subscribeToInvoices(setInvoices);
      
      return () => {
        unsubShipments();
        unsubFleet();
        unsubInvoices();
      };
    } else if (user && role === 'customer') {
      const unsubShipments = shipmentService.subscribeToCustomerShipments('CUST-001', setShipments);
      return () => unsubShipments();
    }
  }, [user, role]);

  // Telemetry Simulation for Real-time Map Experience
  useEffect(() => {
    if (shipments.length === 0) return;

    const interval = setInterval(() => {
      setShipments(current => current.map(s => {
        if (s.status === 'in_transit' && s.currentLat && s.currentLng) {
          // Move slightly West-to-East (Positive Lng) and North-to-South (Negative Lat) for demo
          const latShift = (Math.random() - 0.5) * 0.01;
          const lngShift = (Math.random() - 0.5) * 0.01;
          
          return {
            ...s,
            currentLat: s.currentLat + latShift,
            currentLng: s.currentLng + lngShift,
            lastTelemetryUpdate: new Date().toISOString()
          };
        }
        return s;
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [shipments.length]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDemoData();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Truck className="w-12 h-12 text-blue-600 animate-bounce" />
          <p className="text-neutral-500 font-medium animate-pulse">Initializing LogiFlow Systems...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="bg-brand-blue p-3 rounded-2xl shadow-xl shadow-blue-500/20">
              <Zap className="w-10 h-10 text-white fill-current" />
            </div>
            <h1 className="text-4xl font-bold ml-4 tracking-tight">LogiFlow AI</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-neutral-200 uppercase tracking-widest text-[14px]">Logistics Network Command</h2>
          <p className="text-neutral-400 mb-10 leading-relaxed text-sm">
            Predictive fleet maintenance, AI-driven route optimization, and real-time customer transparency.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => { setRole('admin'); setView('dashboard'); handleLogin(); }}
              className="w-full bg-slate-900 border border-slate-800 text-white py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              <Truck className="w-5 h-5 text-brand-blue" />
              Sign in as Fleet Administrator
            </button>
            <button 
              onClick={() => { setRole('customer'); setView('customer_shipments'); handleLogin(); }}
              className="w-full bg-brand-blue text-white py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              <Users className="w-5 h-5" />
              Sign in to Customer Portal
            </button>
          </div>
          
          <p className="mt-12 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            LogiFlow Core Platform v4.2 // Enterprise Ready
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-slate text-brand-navy font-sans">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="bg-brand-navy flex flex-col z-20 shadow-xl"
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="bg-brand-blue p-1.5 rounded flex items-center justify-center font-bold text-white w-8 h-8">
                L
              </div>
              <span className="font-bold text-lg tracking-tight text-white italic">LogiCore <span className="text-slate-400 font-normal not-italic text-sm">AI Admin</span></span>
            </div>
          )}
          {!isSidebarOpen && (
             <div className="bg-brand-blue p-1.5 rounded flex items-center justify-center font-bold text-white w-8 h-8 mx-auto">
              L
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-0 space-y-0 text-slate-400 font-medium">
          {role === 'admin' ? (
            <>
              <NavItem icon={<LayoutDashboard />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Package />} label="Orders & Loads" active={view === 'shipments'} onClick={() => setView('shipments')} collapsed={!isSidebarOpen} />
              <NavItem icon={<MapIcon />} label="Dispatch Board" active={view === 'routes'} onClick={() => setView('routes')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Truck />} label="Fleet Assets" active={view === 'fleet'} onClick={() => setView('fleet')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Users />} label="Driver Performance" active={view === 'drivers'} onClick={() => setView('drivers')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Warehouse />} label="Warehouse/Hubs" active={view === 'warehouses'} onClick={() => setView('warehouses')} collapsed={!isSidebarOpen} />
              <div className="pt-4 pb-2 border-t border-slate-800 mt-4">
                {!isSidebarOpen ? <div className="h-px bg-slate-800 mx-2" /> : <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-5 mb-2">Operations Context</p>}
              </div>
              <NavItem icon={<DollarSign />} label="Financials & Billing" active={view === 'billing'} onClick={() => setView('billing')} collapsed={!isSidebarOpen} />
              <NavItem icon={<BarChart3 />} label="Reporting" active={view === 'reports'} onClick={() => setView('reports')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Zap />} label="AI Assistant" active={view === 'ai'} onClick={() => setView('ai')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Settings />} label="Control Center" active={view === 'settings'} onClick={() => setView('settings')} collapsed={!isSidebarOpen} />
            </>
          ) : (
            <>
              <NavItem icon={<Package />} label="My Shipments" active={view === 'customer_shipments'} onClick={() => setView('customer_shipments')} collapsed={!isSidebarOpen} />
              <NavItem icon={<MapIcon />} label="Track Active" active={view === 'customer_tracking'} onClick={() => setView('customer_tracking')} collapsed={!isSidebarOpen} />
              <div className="pt-4 pb-2 border-t border-slate-800 mt-4">
                {!isSidebarOpen ? <div className="h-px bg-slate-800 mx-2" /> : <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-5 mb-2">Account</p>}
              </div>
              <NavItem icon={<FileText />} label="Documents" active={view === 'billing'} onClick={() => setView('billing')} collapsed={!isSidebarOpen} />
              <NavItem icon={<Settings />} label="Preferences" active={view === 'settings'} onClick={() => setView('settings')} collapsed={!isSidebarOpen} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
           {isSidebarOpen && (
             <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">AI Insights</p>
                <p className="text-xs text-blue-400">3 critical route optimizations detected.</p>
             </div>
           )}
          <div className={`mt-4 flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserIcon className="w-4 h-4 text-slate-500" />
              </div>
            )}
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-white">{user.displayName || 'Admin'}</p>
                <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-white transition-colors">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-50 rounded transition-colors text-slate-400"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="font-semibold text-lg tracking-tight capitalize">{view.replace('_', ' ')}</h2>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-100">
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                  isOnline 
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20' 
                  : 'bg-red-50 text-red-600 ring-1 ring-red-500/20 animate-pulse'
                }`}>
                  {isOnline ? <ShieldCheck size={12} /> : <CloudOff size={12} />}
                  {isOnline ? 'DB Connected' : 'Offline Mode'}
                </div>
             </div>

             <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-bounce'}`} />
                System {isOnline ? 'Online' : 'Restricted'}: 242 Fleets
             </div>
             <div className="relative hidden lg:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-border rounded text-xs focus:ring-1 focus:ring-brand-blue w-56 transition-all"
              />
            </div>
             <button className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow-sm">
               New Load
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 bg-bg-slate">
          <AnimatePresence mode="wait">
             <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView(view, { shipments, vehicles, invoices, handleSeed, isSeeding, role, selectedShipment, setSelectedId, setView })}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

// --- Navigation Item Component ---
function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center transition-all duration-200 group relative
        ${collapsed ? 'justify-center py-4' : 'px-6 py-2.5'}
        ${active 
          ? 'bg-slate-800 text-white border-l-[3px] border-brand-blue' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
      `}
    >
      <div className={`${active ? 'text-brand-blue' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      </div>
      {!collapsed && (
        <span className="ml-3 text-[13px]">
          {label}
        </span>
      )}
    </button>
  );
}

// --- View Router ---
function renderView(view: View, data: { shipments: any[], vehicles: any[], invoices: any[], handleSeed: () => void, isSeeding: boolean, role: UserRole, selectedShipment: any, setSelectedId: (id: string | null) => void, setView: (v: View) => void }) {
  switch (view) {
    case 'dashboard': return <DashboardView shipments={data.shipments} vehicles={data.vehicles} invoices={data.invoices} handleSeed={data.handleSeed} isSeeding={data.isSeeding} role={data.role} />;
    case 'shipments': return <ShipmentsView shipments={data.shipments} />;
    case 'routes': return <RoutesView />;
    case 'fleet': return <FleetView vehicles={data.vehicles} />;
    case 'drivers': return <DriversView />;
    case 'warehouses': return <WarehousesView />;
    case 'billing': return <BillingView invoices={data.invoices} />;
    case 'reports': return <ReportsView />;
    case 'ai': return <AIView shipments={data.shipments} vehicles={data.vehicles} />;
    case 'settings': return <SettingsView onSeed={data.handleSeed} isSeeding={data.isSeeding} />;
    case 'customer_shipments': return <CustomerShipmentsView shipments={data.shipments} setView={data.setView} setSelectedId={data.setSelectedId} />;
    case 'customer_tracking': return <CustomerTrackingView shipments={data.shipments} selectedShipment={data.selectedShipment} setSelectedId={data.setSelectedId} />;
    default: return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
        <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-medium">Section "{view}" is under maintenance</p>
        <p className="text-sm mt-1">Operational engineers are optimizing these modules.</p>
      </div>
    );
  }
}

// --- Subviews ---

function DashboardView({ shipments, vehicles, invoices, handleSeed, isSeeding, role }: { shipments: any[], vehicles: any[], invoices: any[], handleSeed: () => void, isSeeding: boolean, role: UserRole }) {
  const activeLoads = shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length;
  const exceptions = shipments.filter(s => s.priority === 'critical').length;
  const availableTrucks = vehicles.filter(v => v.status === 'available').length;
  const revenuePaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {shipments.length === 0 && vehicles.length === 0 && role === 'admin' && (
        <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold italic tracking-tight">Welcome to LogiFlow Neural Command</h2>
            <p className="text-blue-100 max-w-md">The operations environment is currently uninitialized. Initialize the neural gateway to populate the logistics network with high-fidelity telemetry data.</p>
          </div>
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSeeding ? 'Initial Scanning...' : 'Initialize Network Hub'}
          </button>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Active Loads" value={activeLoads} change="+12%" trend="up" />
        <StatCard title="On-Time Delivery" value="94.2%" change="-2.1%" trend="down" />
        <StatCard title="Fleet Status" value={`${availableTrucks}/${vehicles.length}`} subtitle="Trucks Available" />
        <StatCard title="Live Exceptions" value={exceptions} change="High Priority" trend="neutral" variant="warning" />
        <StatCard title="Revenue MTD" value={`$${(revenuePaid / 1000).toFixed(1)}k`} subtitle="Target: $2.1M" />
      </div>

      {/* Map Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden h-[400px] flex flex-col shadow-sm">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-neutral-400" />
              Live Fleet Position
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Transit (84)
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Delayed (7)
              </span>
            </div>
          </div>
          <div className="flex-1 relative group overflow-hidden">
             <DashboardMap shipments={shipments.filter(s => s.status === 'in_transit')} />
             
             <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-xl border border-neutral-200 shadow-xl max-w-[200px]">
              <p className="text-[10px] font-bold text-neutral-400 uppercase mb-2">Focused Vehicle</p>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Truck size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">FLEET-9021</p>
                  <p className="text-[10px] text-neutral-500">I-80 Corridor, NE</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <h3 className="font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-400" />
              Operational Logs
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             <LogItem type="delay" time="Now" msg="Route 452 (DAL-CHI) delayed by storm" urgent />
             <LogItem type="success" time="12m ago" msg="Shipment #9042 delivered in record time" />
             <LogItem type="alert" time="45m ago" msg="Driver Mark S. approaching HOS limit" />
             <LogItem type="info" time="1h ago" msg="Warehouse 04 capacity reached 92%" />
             <LogItem type="success" time="2h ago" msg="Billing cycle for Region North completed" />
          </div>
          <button className="p-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors w-full border-t border-neutral-50">
            View All Exceptions
          </button>
        </div>
      </div>

      {/* Tables Preview */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
         <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold">Next Dispatch Cycles</h3>
            <button className="text-xs text-blue-600 font-bold hover:underline">Manage Dispatch</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">ETA</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <DispatchRow id="#LF-7721" dest="Seattle, WA" status="Loading" driver="Alex Rivera" eta="Tomorrow, 08:30" />
                <DispatchRow id="#LF-7725" dest="Austin, TX" status="Assigned" driver="Jessica Wu" eta="Sat, 14:00" />
                <DispatchRow id="#LF-7801" dest="Miami, FL" status="Pending" driver="---" eta="Pending Assignment" isUrgent />
                <DispatchRow id="#LF-7712" dest="Denver, CO" status="In Transit" driver="Brian O'Connel" eta="Today, 19:45" />
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function ShipmentsView({ shipments }: { shipments: any[] }) {
  return (
    <div className="space-y-6 h-screen flex flex-col">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Load Management</h1>
            <p className="text-sm text-neutral-500">Overview of all active and historical shipments</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50">Export Logs</button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20">Bulk Import</button>
          </div>
       </div>

       <div className="bg-white rounded-2xl border border-neutral-200 flex-1 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 flex items-center gap-4">
             <FilterTab label="All Loads" count={shipments.length} active />
             <FilterTab label="In Transit" count={shipments.filter(s => s.status === 'in_transit').length} />
             <FilterTab label="Delayed" count={shipments.filter(s => s.status === 'delayed').length} />
             <FilterTab label="Completed" count={shipments.filter(s => s.status === 'delivered').length} />
          </div>
          <div className="flex-1 overflow-auto">
             <table className="w-full text-left">
                <thead className="sticky top-0 bg-neutral-50 text-[10px] uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-200 z-10">
                  <tr>
                    <th className="px-6 py-4">Load ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Origin & Destination</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Earnings</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {shipments.map((s, i) => (
                      <ShipmentTableRow key={s.id || i} shipment={s} />
                    ))}
                    {shipments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 italic">No shipments found. Seed data in Settings to get started.</td>
                      </tr>
                    )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
   );
}

function RoutesView() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [result, setResult] = useState<RouteOptimization | null>(null);

  const handlePlanRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    
    setIsPlanning(true);
    const optimization = await getRouteOptimization(origin, destination);
    setResult(optimization);
    setIsPlanning(false);
  };

  return (
    <div className="space-y-6 h-screen flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold italic tracking-tight">Dispatch Board & Routing</h1>
          <p className="text-sm text-neutral-500">Neural route optimization and dispatch mapping</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left: Input & Strategy */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 pb-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-blue" />
              Route Configuration
            </h2>
            <form onSubmit={handlePlanRoute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Origin Hub</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="City, State or Hub Code" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination Hub</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-brand-blue" />
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="City, State or Hub Code" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isPlanning}
                className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPlanning ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse" />
                    Analyzing Neural Paths...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    Calculate Optimization
                  </>
                )}
              </button>
            </form>
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-navy rounded-2xl p-6 text-white space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold tracking-tight text-lg italic">AI Strategy Results</h3>
                <div className="bg-brand-blue px-3 py-1 rounded-full text-[10px] font-bold">
                  {result.optimizationScore}% SCORE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Total Distance</p>
                  <p className="font-bold text-xl">{result.distance}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Neural ETA</p>
                  <p className="font-bold text-xl">{result.duration}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Critical Suggestions</p>
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      s.impact === 'high' ? 'bg-danger' : s.impact === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{s.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Potential Bottlenecks</p>
                <div className="flex flex-wrap gap-2">
                  {result.bottlenecks.map((b, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 font-medium lowercase">
                      #{b.replace(/\s+/g, '_')}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Map Visualization */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
             <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                SATELLITE LINK ACTIVE
             </div>
          </div>

          <div className="flex-1 bg-slate-100 relative overflow-hidden group">
            {/* Grid overlay for tech look */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:20px_20px]" />
            
            {!result ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="bg-slate-200 w-32 h-32 rounded-full flex items-center justify-center animate-pulse">
                   <MapIcon className="w-12 h-12 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500">Waiting for Route Coordinates</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Input origin and destination to initialize visual board</p>
                </div>
              </div>
            ) : (
              <svg viewBox="0 0 1000 600" className="w-full h-full p-20 fill-none stroke-slate-300 stroke-[2]">
                {/* Simulated US Map Path (simplified) */}
                <path d="M100,100 Q300,50 500,150 T900,200 T800,500 T200,450 Z" className="fill-slate-200/50 stroke-slate-300 stroke-[3]" />
                
                {/* Route Line */}
                <motion.path 
                  d="M250,250 L750,350" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  strokeDasharray="0"
                  className="stroke-brand-blue stroke-[4]"
                />

                {/* Animated Flow Dots */}
                <motion.circle r="4" fill="#2563EB">
                  <animateMotion path="M250,250 L750,350" dur="3s" repeatCount="indefinite" />
                </motion.circle>

                {/* Origin Marker */}
                <g>
                   <circle cx="250" cy="250" r="10" className="fill-white stroke-slate-400 stroke-2" />
                   <circle cx="250" cy="250" r="4" className="fill-slate-600" />
                   <text x="250" y="235" textAnchor="middle" className="fill-slate-900 font-bold text-[14px]">{origin.toUpperCase()}</text>
                </g>

                {/* Destination Marker */}
                <g>
                   <circle cx="750" cy="350" r="12" className="fill-brand-blue stroke-white stroke-2" />
                   <circle cx="750" cy="350" r="4" className="fill-white" />
                   <text x="750" y="335" textAnchor="middle" className="fill-brand-blue font-bold text-[14px]">{destination.toUpperCase()}</text>
                </g>

                {/* Info Overlay in SVG */}
                <rect x="250" y="450" width="500" height="80" rx="15" className="fill-white/80 stroke-slate-200" />
                <text x="500" y="485" textAnchor="middle" className="fill-slate-900 font-bold text-[12px] uppercase tracking-widest italic" dominantBaseline="middle">Transit Optimization Pathway Generated</text>
                <text x="500" y="510" textAnchor="middle" className="fill-slate-500 font-medium text-[10px]" dominantBaseline="middle">Confidence Interval: {(result.optimizationScore / 100).toFixed(2)} | Real-time Telemetry Synced</text>
              </svg>
            )}
          </div>

          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex gap-6">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-blue" /> Optimal Route</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Regional Hubs</span>
            </div>
            <span>V4.2 Routing Engine Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIView({ shipments, vehicles }: { shipments: any[], vehicles: any[] }) {
  const [insights, setInsights] = React.useState<any[]>([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [trafficStatus, setTrafficStatus] = React.useState<'nominal' | 'heavy' | 'congested'>('nominal');

  const runAnalysis = async () => {
    setAnalyzing(true);
    const conditions: Array<'nominal' | 'heavy' | 'congested'> = ['nominal', 'heavy', 'congested'];
    setTrafficStatus(conditions[Math.floor(Math.random() * conditions.length)]);
    
    const results = await getLogisticsInsights({ 
      shipments: shipments.map(s => ({ 
        id: s.id, 
        status: s.status, 
        priority: s.priority, 
        pickup: s.pickupLocation, 
        delivery: s.deliveryLocation,
        currentPos: { lat: s.currentLat, lng: s.currentLng }
      })),
      vehicles: vehicles.map(v => ({
        id: v.id,
        status: v.status,
        health: v.healthScore,
        mileage: v.mileage
      }))
    });
    setInsights(results);
    setAnalyzing(false);
  };

  const routeOptimizations = insights.filter(i => i.type === 'route_optimization');

  return (
    <div className="space-y-8">
      {/* Enhanced AI Header */}
      <div className="p-10 bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between relative z-10">
          <div className="flex-1 space-y-6">
             <div className="inline-flex items-center gap-2.5 bg-brand-blue/20 text-brand-blue px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] border border-brand-blue/30 backdrop-blur-md">
                <BrainCircuit size={14} className="text-brand-blue animate-pulse" />
                Neural Command Processor v4.8
             </div>
             
             <h1 className="text-5xl font-black mb-4 tracking-tighter leading-tight max-w-xl">
               Automated <span className="text-brand-blue italic">Route Intelligence</span>
             </h1>
             
             <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-light">
                Synchronizing <span className="text-white font-medium">{vehicles.length} vehicles</span> and 
                <span className="text-white font-medium"> {shipments.length} shipments</span> to identify path efficiencies under current <span className={`font-bold ${trafficStatus === 'nominal' ? 'text-emerald-400' : 'text-amber-400'}`}>{trafficStatus}</span> conditions.
             </p>
             
             <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className={`w-3 h-3 rounded-full ${
                    trafficStatus === 'nominal' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                    trafficStatus === 'heavy' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Network Traffic</p>
                    <p className="text-sm font-bold capitalize">{trafficStatus}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <Globe size={20} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Coverage</p>
                    <p className="text-sm font-bold text-white">99% Active</p>
                  </div>
                </div>
             </div>

             <div className="pt-6">
                <button 
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="bg-brand-blue px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-4 group"
                >
                  {analyzing ? <Zap size={18} className="animate-spin text-white" /> : <Zap size={18} className="text-white group-hover:scale-125 transition-transform" />}
                  {analyzing ? 'Processing...' : 'Run Intelligence Analysis'}
                </button>
             </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-blue/20 rounded-3xl blur-3xl group-hover:bg-brand-blue/30 transition-all" />
            <div className="bg-slate-800/80 backdrop-blur-3xl p-10 rounded-[2rem] border border-white/10 flex flex-col items-center min-w-[280px] shadow-2xl relative">
               <div className="text-7xl font-black text-white tracking-tighter mb-2">94<span className="text-3xl text-brand-blue font-bold tracking-normal ml-1">%</span></div>
               <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 L-IV Protocol
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Insights */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="text-brand-blue" size={24} />
              Strategic Insights
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.length > 0 ? insights.map((insight: any, idx: number) => (
              <AIInsightCard 
                key={idx}
                title={insight.title || insight.type.replace('_', ' ')}
                desc={insight.insight}
                savings={insight.potentialSavings ? `$${insight.potentialSavings}` : undefined}
                confidence={insight.confidence}
                type={insight.type}
                severity={insight.severity}
                recommendation={insight.recommendation}
                trafficImpact={insight.trafficImpact}
              />
            )) : (
              <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                 <Activity className="mx-auto text-slate-300 mb-4" size={48} />
                 <p className="text-slate-500 font-medium italic">Initialize analysis to generate operational insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-neutral-100 bg-slate-50/50 flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                <Navigation className="text-brand-blue" size={16} />
                Route Optimization Hub
              </div>
            </div>
            <div className="p-8 flex-1 space-y-6">
              {routeOptimizations.length > 0 ? (
                routeOptimizations.map((opt, idx) => (
                  <div key={idx} className="border-l-4 border-brand-blue pl-4 py-2 bg-blue-50/50 rounded-r-xl">
                    <p className="text-xs font-bold text-slate-900 mb-1">{opt.title || 'Dynamic Path Update'}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{opt.insight}</p>
                    <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-2 group">
                      Execute Reroute <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-xs text-slate-400 font-medium">No active optimizations detected in current fleet trajectories.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FleetView({ vehicles }: { vehicles: any[] }) {
  const needsMaintenance = vehicles.filter(v => (v.healthScore || 0) < 80 || v.status === 'maintenance');
  
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fleet Assets</h1>
            <p className="text-sm text-slate-500">Asset diagnostics and predictive maintenance command.</p>
          </div>
          <button className="bg-brand-blue text-white px-4 py-2 rounded font-bold text-xs shadow-lg shadow-blue-600/20">Run Diagnostic Scan</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard title="Total Fleet" value={vehicles.length} />
          <StatCard title="Healthy Units" value={vehicles.filter(v => (v.healthScore || 0) >= 80).length} trend="up" />
          <StatCard title="At Risk" value={needsMaintenance.length} variant={needsMaintenance.length > 0 ? 'warning' : 'default'} />
          <StatCard title="Maintenance Cost" value="$12,420" subtitle="This Month" />
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-lg border border-border overflow-hidden shadow-sm">
             <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Asset Inventory</h3>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 border-b border-border">
                   <tr>
                      <th className="px-6 py-3">Vehicle ID</th>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3">Current Mileage</th>
                      <th className="px-6 py-3">Health Score</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {vehicles.map(v => (
                     <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px] font-bold text-brand-blue">{v.id}</td>
                        <td className="px-6 py-4 text-xs font-semibold">{v.model}</td>
                        <td className="px-6 py-4 text-xs font-mono">{v.mileage?.toLocaleString()} mi</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className="flex-1 min-w-[60px] bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${(v.healthScore || 0) < 70 ? 'bg-danger' : (v.healthScore || 0) < 85 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${v.healthScore || 0}%` }} />
                             </div>
                             <span className="text-[10px] font-bold">{v.healthScore || 0}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`tag ${v.status === 'available' ? 'tag-success' : v.status === 'in_use' ? 'bg-blue-50 text-blue-700' : 'tag-danger'} py-1 px-2 rounded text-[10px] font-bold uppercase`}>
                             {v.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-slate-400 hover:text-brand-blue transition-colors"><ChevronRight size={16} /></button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-900 rounded-lg p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                   <ShieldAlert className="text-warning animate-pulse" size={18} />
                   <h3 className="text-sm font-bold tracking-tight uppercase tracking-widest text-[11px]">AI Predictive Engine</h3>
                </div>
                <div className="space-y-4 relative z-10">
                   {needsMaintenance.map(v => (
                     <div key={v.id} className="p-3 bg-slate-800 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-xs font-bold text-white">{v.id}</span>
                           <span className="text-[9px] bg-danger/20 text-danger border border-danger/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Failure Risk</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">{v.model}</p>
                        <div className="bg-slate-900 p-2 rounded text-[10px] border border-slate-700/50">
                           <p className="text-amber-400 font-bold mb-1 underline underline-offset-4 decoration-amber-400/30">Engine Diagnostic Anomaly</p>
                           <p className="text-slate-400 italic leading-snug">Unusual vibration pattern detected (0.45G). Predicted failure of drive belt assembly within 3,200 miles.</p>
                        </div>
                     </div>
                   ))}
                   {needsMaintenance.length === 0 && (
                     <div className="bg-slate-800/50 p-6 rounded-lg text-center">
                        <Zap size={24} className="mx-auto text-slate-700 mb-2" />
                        <p className="text-xs text-slate-500 italic leading-relaxed">Fleet health reporting within nominal bounds.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}

function DriversView() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Driver Hub</h1>
            <p className="text-sm text-neutral-500">Compliance, performance, and HOS tracking</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
             <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-200 font-bold">Active Operators</div>
                <div className="divide-y divide-neutral-100">
                   <DriverCard name="Marcus Johnson" status="active" shipment="#LF-7721" hos="2h 15m remaining" safety={98} />
                   <DriverCard name="Sarah Miller" status="off_duty" hos="Off-Duty" safety={94} />
                   <DriverCard name="Robert Chen" status="active" shipment="#LF-7744" hos="6h 42m remaining" safety={82} warning />
                </div>
             </div>
          </div>
          <div className="space-y-6">
             <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-amber-900">
                  <ShieldAlert className="w-5 h-5" />
                  Compliance Risks
                </h3>
                <p className="text-sm text-amber-800 mb-4">3 drivers are approaching mandatory rest periods within the next 2 hours.</p>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-amber-900">
                      <span>Robert Chen</span>
                      <span>14m remaining</span>
                   </div>
                   <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full w-[95%]" />
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}

function WarehousesView() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Warehouse Status</h1>
            <p className="text-sm text-neutral-500">Capacity and yard monitoring at logistics hubs</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WarehouseCard name="Hub-04 North Chicago" capacity={92} dockActive={4} yardQ={12} />
          <WarehouseCard name="Hub-12 Dallas Logistics" capacity={65} dockActive={2} yardQ={3} />
          <WarehouseCard name="Hub-08 Newark Port" capacity={45} dockActive={8} yardQ={0} />
       </div>
    </div>
  )
}

function BillingView({ invoices }: { invoices: any[] }) {
  const unpaidTotal = invoices.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing & Invoices</h1>
            <p className="text-sm text-neutral-500">Financial records and neural payment tracking</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Generate Statement</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Receivables" value={`$${unpaidTotal.toLocaleString()}`} variant="warning" />
          <StatCard title="Paid MTD" value={`$${paidTotal.toLocaleString()}`} />
          <StatCard title="Overdue" value={`$${invoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`} trend="up" />
          <StatCard title="Disputed" value={invoices.filter(i => i.status === 'disputed').length.toString()} trend="down" />
       </div>

       <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-[10px] uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-200">
                 <tr>
                   <th className="px-6 py-4">Invoice ID</th>
                   <th className="px-6 py-4">Customer</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Due Date</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                 {invoices.map((inv) => (
                   <InvoiceRow 
                    key={inv.id} 
                    id={inv.id} 
                    customer={inv.customerName} 
                    status={inv.status} 
                    date={inv.dueDate} 
                    amount={`$${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
                    isUrgent={inv.status === 'overdue'} 
                   />
                 ))}
                 {invoices.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 italic">No invoices found. Seed data in Settings.</td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  )
}

function ReportsView() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Operational Insights</h1>
            <p className="text-sm text-neutral-500">Deep dive analytics and performance metrics</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 h-[300px] flex flex-col">
             <h3 className="font-bold mb-4">Revenue Trend (6mo)</h3>
             <div className="flex-1 flex items-end gap-2 px-2">
                {[0,1,2,3,4,5,6,7,8,9,10,11].map((_, i) => (
                  <div key={i} className="flex-1 bg-blue-100 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
                ))}
             </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 h-[300px] flex flex-col">
             <h3 className="font-bold mb-4">Delayed Reasons</h3>
             <div className="space-y-4">
                <ReportMetric label="Traffic/Congestion" value="45%" color="bg-blue-600" />
                <ReportMetric label="Weather" value="22%" color="bg-indigo-600" />
                <ReportMetric label="Mechanical" value="18%" color="bg-amber-600" />
                <ReportMetric label="Warehouse Delay" value="15%" color="bg-neutral-600" />
             </div>
          </div>
       </div>
    </div>
  )
}

// --- View Helpers ---

function FleetRow({ id, model, status, mileage, health, driver }: any) {
  const statusColors = {
    in_use: 'text-blue-600 bg-blue-50',
    available: 'text-emerald-600 bg-emerald-50',
    maintenance: 'text-amber-600 bg-amber-50'
  } as any;

  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      <td className="px-6 py-4 text-xs font-bold leading-tight">{id}</td>
      <td className="px-6 py-4 text-xs font-semibold">{model}</td>
      <td className="px-6 py-4 capitalize">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColors[status]}`}>
          {status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-neutral-500 font-mono tracking-tighter">{mileage} mi</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
           <div className="w-12 bg-neutral-100 h-1 rounded-full overflow-hidden">
             <div className={`h-full ${health > 80 ? 'bg-emerald-500' : health > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${health}%` }} />
           </div>
           <span className="text-[10px] font-bold text-neutral-500">{health}%</span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-neutral-600 font-medium">{driver || 'Unassigned'}</td>
      <td className="px-6 py-4 text-right">
        <button className="text-[10px] font-bold text-blue-600 hover:underline">Manage</button>
      </td>
    </tr>
  )
}

function DriverCard({ name, status, shipment, hos, safety, warning }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
             <UserIcon size={18} className="text-neutral-400" />
          </div>
          <div>
             <p className="text-sm font-bold">{name}</p>
             <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
               {status === 'active' ? `Assigned: ${shipment}` : 'Off-Duty'}
             </p>
          </div>
       </div>
       <div className="flex items-center gap-8">
          <div className="hidden md:block">
             <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1">Safety</p>
             <p className={`text-xs font-bold ${safety > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{safety}/100</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-neutral-400 uppercase font-bold mb-1">HOS Status</p>
             <p className={`text-xs font-bold ${warning ? 'text-amber-600' : 'text-neutral-900'}`}>{hos}</p>
          </div>
          <ChevronRight size={18} className="text-neutral-300" />
       </div>
    </div>
  )
}

function WarehouseCard({ name, capacity, dockActive, yardQ }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
       <h3 className="font-bold mb-4">{name}</h3>
       <div className="space-y-4">
          <div>
             <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-neutral-500 uppercase tracking-wider">Utilization</span>
                <span>{capacity}%</span>
             </div>
             <div className="w-full bg-neutral-50 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${capacity > 90 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${capacity}%` }} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-neutral-50 rounded-xl">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Active Docks</p>
                <p className="text-lg font-bold">{dockActive}/12</p>
             </div>
             <div className="p-3 bg-neutral-50 rounded-xl">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Yard Queue</p>
                <p className="text-lg font-bold">{yardQ} Trucks</p>
             </div>
          </div>
       </div>
       <button className="w-full mt-6 py-2 border border-neutral-200 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors">Open Dashboard</button>
    </div>
  )
}

function InvoiceRow({ id, customer, status, date, amount, isUrgent }: any) {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusLabels = {
    paid: 'text-emerald-600 bg-emerald-50',
    pending: 'text-blue-600 bg-blue-50',
    overdue: 'text-red-600 bg-red-50',
    disputed: 'text-amber-600 bg-amber-50'
  } as any;

  const handleUpdate = async (newStatus: 'paid' | 'disputed') => {
    setIsUpdating(true);
    try {
      await invoiceService.updateInvoiceStatus(id, newStatus);
    } catch (e) {
      console.error("Invoice update failed", e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className={`hover:bg-neutral-50 transition-colors ${isUrgent ? 'bg-red-50/20' : ''}`}>
       <td className="px-6 py-4 text-xs font-bold text-blue-600 lowercase tracking-tighter">{id}</td>
       <td className="px-6 py-4 text-xs font-semibold">{customer}</td>
       <td className="px-6 py-4">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusLabels[status]}`}>
            {status}
          </span>
       </td>
       <td className="px-6 py-4 text-xs text-neutral-500 italic">{date}</td>
       <td className="px-6 py-4 text-xs font-bold">{amount}</td>
       <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {status !== 'paid' && (
              <button 
                onClick={() => handleUpdate('paid')}
                disabled={isUpdating}
                title="Mark as Paid"
                className="p-1.5 border border-emerald-100 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={14} />
              </button>
            )}
            {status !== 'disputed' && status !== 'paid' && (
              <button 
                onClick={() => handleUpdate('disputed')}
                disabled={isUpdating}
                title="Mark as Disputed"
                className="p-1.5 border border-amber-100 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                <AlertCircle size={14} />
              </button>
            )}
            <button className="p-1.5 border border-neutral-200 rounded-lg text-neutral-400 hover:bg-neutral-100 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
       </td>
    </tr>
  )
}

function SettingsView({ onSeed, isSeeding }: { onSeed: () => void, isSeeding: boolean }) {
  return (
    <div className="max-w-2xl bg-white border border-border p-8 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 italic tracking-tight">System Configuration</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
             <Zap size={14} className="text-brand-blue" />
             AI Neural Gateway
          </h2>
          <div className="p-5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
            <div className="max-w-md">
              <h3 className="font-bold text-sm mb-1">Operational Simulator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Re-initialize the supply chain environment with high-fidelity vehicle health metrics, localized disruption vectors, and customer shipment histories.
              </p>
            </div>
            <button 
              onClick={onSeed}
              disabled={isSeeding}
              className="bg-brand-blue text-white px-6 py-3 rounded font-bold text-xs uppercase tracking-tight shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSeeding ? 'Calibrating...' : 'Seed Command Cluster'}
            </button>
          </div>
        </section>

        <section className="pt-8 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Autonomous Mechanisms</h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg">
                <div>
                   <p className="font-bold text-sm">Predictive Maintenance Active</p>
                   <p className="text-xs text-slate-500">Monitor multifaceted telemetry to flag potential failure nodes.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 relative">
                   <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                </div>
             </div>
             <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg">
                <div>
                   <p className="font-bold text-sm">Disruption Detection Engine</p>
                   <p className="text-xs text-slate-500">Formulate dynamic mechanisms for optimized route adjustments.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full p-1 relative shadow-inner">
                   <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardMap({ shipments, selectedId, onSelect }: { shipments: any[], selectedId?: string, onSelect?: (id: string) => void }) {
  // Simple projection for US-centric map
  const getPos = (lat: number | undefined, lng: number | undefined, index: number) => {
    if (lat === undefined || lng === undefined) {
      return { 
        top: `${20 + (index * 15)}%`, 
        left: `${15 + (index * 18)}%` 
      };
    }
    // Normalize coordinates to percentage (approx US bounds)
    // Lat: 24 to 49 -> 100% to 0%
    // Lng: -125 to -66 -> 0% to 100%
    const top = 100 - ((lat - 24) / (49 - 24) * 100);
    const left = (lng + 125) / (125 - 66) * 100;
    
    // Clamp values
    return {
      top: `${Math.max(5, Math.min(95, top))}%`,
      left: `${Math.max(5, Math.min(95, left))}%`
    };
  };

  return (
    <div className="w-full h-full bg-slate-900 relative group overflow-hidden border border-slate-800 rounded-xl">
       {/* High-tech grid background */}
       <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),transparent_70%)]" />
       
       <div className="absolute inset-0 flex items-center justify-center p-12 touch-none pointer-events-none opacity-40">
          <Globe className="w-full h-full text-blue-500/20" />
       </div>

       <AnimatePresence>
         {shipments.map((s, idx) => {
            const isSelected = s.id === selectedId;
            const pos = getPos(s.currentLat, s.currentLng, idx);
            const isInTransit = s.status === 'in_transit';

            return (
              <motion.div 
                key={s.id}
                layoutId={`shipment-${s.id}`}
                initial={false}
                animate={{ 
                  top: pos.top, 
                  left: pos.left,
                  scale: isSelected ? 1.2 : 1,
                  zIndex: isSelected ? 50 : 10
                }}
                className="absolute"
                onClick={() => onSelect?.(s.id)}
              >
                 <div className="relative group cursor-pointer">
                    {isInTransit && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-4 bg-blue-500/20 rounded-full" 
                      />
                    )}
                    
                    <div className={`relative p-2 rounded-lg shadow-2xl border transition-all ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-400 scale-110' 
                        : 'bg-slate-800 border-slate-700 group-hover:border-blue-500'
                    }`}>
                       <Truck size={16} className={isSelected ? 'text-white' : 'text-blue-400'} />
                    </div>

                    {/* Label/Tooltip */}
                    <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 p-2 bg-slate-800/95 backdrop-blur-md border border-slate-700 text-white rounded-lg text-[10px] whitespace-nowrap shadow-2xl transition-all ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    } pointer-events-none z-50`}>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-blue-400">{s.id}</span>
                         <span className={`px-1 rounded-[2px] uppercase text-[8px] ${
                           s.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                         }`}>
                           {s.status.replace('_', ' ')}
                         </span>
                       </div>
                       <p className="text-slate-400 font-medium">{s.customerName}</p>
                       <div className="mt-1 flex items-center gap-1 text-slate-500">
                         <Navigation size={8} />
                         <span>{s.currentLat?.toFixed(4)}, {s.currentLng?.toFixed(4)}</span>
                       </div>
                    </div>
                 </div>
              </motion.div>
            );
         })}
       </AnimatePresence>

       {/* Map UI Overlays */}
       <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-lg flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 tracking-wider">LIVE TELEMETRY</span>
             </div>
             <div className="h-4 w-px bg-slate-700" />
             <span className="text-[10px] text-slate-400 font-mono italic">H3-INDEX: 8a2a1072b59ffff</span>
          </div>
       </div>

       <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2">
             <Activity size={12} className="text-blue-500" />
             <span className="text-[10px] font-bold text-slate-300 tracking-tight">DATA STREAM NOMINAL</span>
          </div>
       </div>

       <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-lg space-y-2 min-w-[120px]">
             <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Signal</span>
                <div className="flex gap-0.5">
                   {[1,2,3,4].map(i => <div key={i} className={`w-1 h-2 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />)}
                </div>
             </div>
             <div className="flex items-center justify-between gap-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Satellites</span>
                <span className="text-[10px] text-slate-300 font-mono">08</span>
             </div>
          </div>
       </div>
    </div>
  );
}


// --- Customer Portal Components ---

function CustomerShipmentsView({ shipments, setView, setSelectedId }: { shipments: any[], setView: (v: View) => void, setSelectedId: (id: string | null) => void }) {
  const activeCount = shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Active Supply Chain Monitor</h2>
              <p className="text-xs font-medium text-neutral-500">Global Logistics Tracking & Status Hub</p>
            </div>
          </div>
        </div>
        <div className="h-[400px] relative">
          <DashboardMap 
            shipments={shipments.filter(s => s.status === 'in_transit')} 
            onSelect={(id) => {
              setSelectedId(id);
              setView('customer_tracking');
            }}
          />
        </div>
      </div>
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-navy mb-1 underline decoration-brand-blue/30 decoration-4 underline-offset-8">My Supply Chain Hub</h1>
            <p className="text-sm text-slate-500 font-medium">Real-time transparency and asset tracking for your logistics operations.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="bg-white border border-border p-2.5 rounded text-slate-400 shadow-sm transition-all hover:text-brand-blue"><Bell size={18} /></button>
             <button className="bg-brand-blue text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-95 transition-all">Order New Transit</button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Active Transits" value={activeCount} />
          <StatCard title="Arrival Precision" value="98.2%" trend="up" />
          <StatCard title="Total Completed" value={shipments.filter(s => s.status === 'delivered').length} />
       </div>

       <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-slate-50 flex justify-between items-center">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Order Logs</h3>
             <div className="flex items-center gap-3">
                <Search size={14} className="text-slate-400" />
                <input type="text" placeholder="Search Shipment ID..." className="bg-transparent border-none text-[11px] focus:ring-0 w-48" />
             </div>
          </div>
          <table className="w-full text-left">
             <thead className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-400 border-b border-border">
                <tr>
                   <th className="px-6 py-4">Order ID</th>
                   <th className="px-6 py-4">Network Path</th>
                   <th className="px-6 py-4 text-center">Terminal Status</th>
                   <th className="px-6 py-4 text-right">Visibility</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {shipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-6 py-4 font-mono text-[11px] font-bold text-brand-blue">{s.id || '#LF-NEW'}</td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold">
                           <span className="text-slate-900">{s.pickupLocation}</span>
                           <ChevronRight size={10} className="text-slate-300" />
                           <span className="text-slate-900">{s.deliveryLocation}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className={`tag ${
                          s.status === 'in_transit' ? 'bg-blue-50 text-blue-700' : 
                          s.status === 'delivered' ? 'tag-success' :
                          'bg-slate-100 text-slate-500'
                        } py-1 px-2.5 rounded text-[10px] font-bold uppercase`}>
                          {s.status?.replace('_', ' ') || 'Processing'}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedId(s.id);
                            setView('customer_tracking');
                          }}
                          className="text-brand-blue text-[10px] font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Track live on Map
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function CustomerTrackingView({ shipments, selectedShipment, setSelectedId }: { shipments: any[], selectedShipment: any, setSelectedId: (id: string | null) => void }) {
  const activeShipments = shipments.filter(s => s.status === 'in_transit');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-6">
       <div className="lg:col-span-2 bg-white rounded-lg border border-border relative overflow-hidden shadow-xl min-h-[500px]">
          <DashboardMap 
            shipments={activeShipments} 
            selectedId={selectedShipment?.id}
            onSelect={setSelectedId}
          />
          
          {selectedShipment && (
             <div className="absolute top-6 left-6 bg-slate-900 border border-slate-800 p-5 rounded-lg shadow-2xl max-w-xs text-white">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none">Vessel Location // ACTIVE</p>
                      <h3 className="text-lg font-bold tracking-tight">{selectedShipment.id}</h3>
                   </div>
                   <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">On Schedule</div>
                </div>
                <div className="space-y-3 mb-5 text-[11px] font-medium border-t border-slate-800 pt-3">
                   <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px]">Last Signal:</span>
                      <span className="text-slate-200">2 minutes ago</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px]">ETA Arrival:</span>
                      <span className="text-brand-blue font-bold tracking-tight underline italic font-mono">{selectedShipment.estimatedEta ? new Date(selectedShipment.estimatedEta).toLocaleString() : 'TBD'}</span>
                   </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                   <div className="bg-brand-blue h-full" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                   <span>Origin Hub</span>
                   <span>72% ATTAINED</span>
                   <span>Destination</span>
                </div>
             </div>
          )}
       </div>

       <div className="bg-white rounded-lg border border-border flex flex-col shadow-sm">
          <div className="p-5 border-b border-border bg-slate-50">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Vessel Connectivity
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
             {activeShipments.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full p-5 border-b border-slate-50 text-left hover:bg-slate-50 transition-all ${selectedShipment?.id === s.id ? 'bg-blue-50/50 border-r-4 border-r-brand-blue' : ''}`}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold font-mono text-brand-blue">{s.id || '#LF-NEW'}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">In Motion</span>
                   </div>
                   <p className="text-[11px] font-bold text-slate-700">{s.pickupLocation} to {s.deliveryLocation}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <Truck size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Signal Locked // Reporting ETAs</span>
                   </div>
                </button>
             ))}
          </div>
          <div className="p-5 border-t border-border mt-auto bg-slate-50/30">
             <div className="bg-slate-900 rounded-lg p-4 text-white shadow-xl relative overflow-hidden">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
                   <Zap size={10} className="text-blue-400 fill-current" />
                   AI Transit Adjuster
                </p>
                <p className="text-[11px] text-blue-200 leading-snug font-medium italic">"Autonomous monitoring detected storm cell in mid-reach. ETA recalibrated to preserve safety buffer."</p>
             </div>
          </div>
       </div>
    </div>
  );
}

function ToggleItem({ label, desc, checked }: any) {
  return (
    <div className="flex items-center justify-between py-2">
       <div>
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-neutral-500">{desc}</p>
       </div>
       <div className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-blue-600' : 'bg-neutral-200'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
       </div>
    </div>
  )
}

function ReportMetric({ label, value, color }: any) {
  return (
    <div>
       <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className="text-neutral-500">{label}</span>
          <span>{value}</span>
       </div>
       <div className="w-full bg-neutral-50 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: value }} />
       </div>
    </div>
  )
}


function StatCard({ title, value, change, trend, subtitle, variant = 'default' }: any) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 flex flex-col justify-between shadow-sm">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
      {(change || subtitle) && (
        <p className={`text-[10px] mt-2 font-semibold ${
          trend === 'up' ? 'text-success' : 
          trend === 'down' ? 'text-danger' : 
          variant === 'warning' ? 'text-warning' : 'text-slate-400'
        }`}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {change || subtitle}
        </p>
      )}
    </div>
  );
}

function LogItem({ type, time, msg, urgent }: any) {
  const icons = {
    delay: <AlertTriangle size={14} className="text-amber-500" />,
    success: <ChevronRight size={14} className="text-emerald-500" />,
    alert: <AlertTriangle size={14} className="text-red-500" />,
    info: <FileText size={14} className="text-blue-500" />
  };
  
  return (
    <div className={`flex gap-3 items-start pb-4 border-b border-neutral-50 last:border-0 ${urgent ? 'bg-amber-50' : ''} -mx-1 px-1`}>
      <div className="mt-0.5">{(icons as any)[type]}</div>
      <div className="flex-1">
        <p className="text-xs font-semibold leading-tight">{msg}</p>
        <p className="text-[10px] text-neutral-400 mt-1 font-mono uppercase">{time}</p>
      </div>
    </div>
  );
}

function DispatchRow({ id, dest, status, driver, eta, isUrgent }: any) {
  return (
    <tr className={`hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 ${isUrgent ? 'bg-red-50/10' : ''}`}>
      <td className="px-6 py-3 text-[11px] font-mono text-slate-500 font-bold">{id}</td>
      <td className="px-6 py-3 text-xs font-semibold">{driver}</td>
      <td className="px-6 py-3 text-xs">{dest}</td>
      <td className="px-6 py-3">
        <span className={`tag ${
          status === 'In Transit' ? 'bg-blue-50 text-blue-700' : 
          status === 'Assigned' ? 'tag-success' :
          status === 'Pending' ? 'bg-slate-100 text-slate-500' :
          'bg-indigo-50 text-indigo-700'
        } py-1 px-2 rounded text-[10px] font-bold uppercase`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">{eta}</td>
    </tr>
  );
}

function FilterTab({ label, count, active }: any) {
  return (
    <button className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
      {label} <span className="ml-1 text-[10px] opacity-60">({count})</span>
    </button>
  );
}

function ShipmentTableRow({ shipment }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-all border-b border-slate-100 group">
      <td className="px-6 py-3 font-mono text-[11px] text-slate-500">{shipment.id || '#LD-NEW'}</td>
      <td className="px-6 py-3 text-xs font-semibold">{shipment.customerName}</td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold">{shipment.pickupLocation}</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="font-bold">{shipment.deliveryLocation}</span>
        </div>
      </td>
      <td className="px-6 py-3">
        <span className={`tag ${
          shipment.status === 'in_transit' ? 'bg-blue-50 text-blue-700' : 
          shipment.status === 'delivered' ? 'tag-success' :
          shipment.status === 'delayed' ? 'tag-danger' :
          'bg-slate-100 text-slate-500'
        } py-1 px-2 rounded text-[10px] font-bold uppercase`}>
          {shipment.status?.replace('_', ' ') || 'New'}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className={`text-[10px] font-bold uppercase ${shipment.priority === 'high' || shipment.priority === 'critical' ? 'text-danger' : 'text-slate-400'}`}>
          {shipment.priority || 'Medium'}
        </div>
      </td>
      <td className="px-6 py-3 text-xs font-bold text-right">${shipment.revenue?.toLocaleString() || '0.00'}</td>
      <td className="px-6 py-3 text-right">
        <button className="text-blue-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Details</button>
      </td>
    </tr>
  )
}

function AIInsightCard({ title, desc, savings, confidence, type, severity, recommendation, trafficImpact }: any) {
  const isCritical = severity === 'critical';
  const isWarning = severity === 'warning';
  const isOptimization = type === 'route_optimization';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white p-6 rounded-2xl border ${isCritical ? 'border-red-200 bg-red-50/10' : isWarning ? 'border-amber-200 bg-amber-50/10' : isOptimization ? 'border-blue-200 bg-blue-50/10' : 'border-border'} shadow-sm relative overflow-hidden h-full flex flex-col`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${isCritical ? 'bg-red-100 text-red-600' : isOptimization ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
           {type === 'efficiency' || type === 'route_optimization' ? <Zap size={18} /> : 
            type === 'delay_risk' || type === 'supply_chain_disruption' ? <ShieldAlert size={18} /> : 
            type === 'predictive_maintenance' ? <Settings size={18} /> :
            <BarChart3 size={18} />}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
            {confidence ? `${(confidence * 100).toFixed(0)}%` : '90%'} Confidence
          </div>
          {trafficImpact && (
            <div className="text-[9px] font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded flex items-center gap-1 border border-blue-100">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
               {trafficImpact}
            </div>
          )}
        </div>
      </div>
      
      <h3 className={`font-bold mb-2 tracking-tight ${isCritical ? 'text-red-900 border-red-200' : 'text-slate-900'} capitalize text-[15px]`}>
        {typeof title === 'string' ? title.replace('_', ' ') : (type ? type.replace('_', ' ') : 'AI Insight')}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc || 'Operational telemetry analysis suggests corrective action within the next synchronization window.'}</p>
      
      {recommendation && (
        <div className={`mb-4 p-3 rounded-xl text-[10px] ${isCritical ? 'bg-red-100 text-red-800' : 'bg-slate-900 text-slate-300'}`}>
          <p className="font-bold uppercase tracking-widest mb-1 opacity-70">Strategy Recommendation:</p>
          <p className="italic font-medium leading-normal">{recommendation}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        {savings && (
          <div className="text-emerald-600 font-bold text-[9px] uppercase tracking-wider ring-1 ring-emerald-600/20 px-2.5 py-1 rounded-full bg-emerald-50">
            {savings} Efficient
          </div>
        )}
        <button className={`text-[10px] font-bold uppercase tracking-widest ml-auto p-1 px-2 rounded-lg transition-colors ${isCritical ? 'bg-red-600 text-white hover:bg-red-700' : 'text-brand-blue hover:bg-blue-50'}`}>
          {isCritical ? 'Emergency Override' : 'Apply Meta-Optimization'}
        </button>
      </div>
    </motion.div>
  );
}

