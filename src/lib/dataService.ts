import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';

export const shipmentService = {
  subscribeToShipments: (callback: (shipments: any[]) => void) => {
    const q = query(collection(db, 'shipments'));
    return onSnapshot(q, (snapshot) => {
      const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(shipments);
    }, (error) => handleFirestoreError(error, 'list', 'shipments'));
  },

  subscribeToCustomerShipments: (customerId: string, callback: (shipments: any[]) => void) => {
    const q = query(collection(db, 'shipments'), where('customerId', '==', customerId));
    return onSnapshot(q, (snapshot) => {
      const shipments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(shipments);
    }, (error) => handleFirestoreError(error, 'list', 'shipments'));
  },

  createShipment: async (shipmentData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'shipments'), {
        ...shipmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', 'shipments');
    }
  },

  updateShipment: async (id: string, data: any) => {
    try {
      const docRef = doc(db, 'shipments', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `shipments/${id}`);
    }
  }
};

export const fleetService = {
  subscribeToVehicles: (callback: (vehicles: any[]) => void) => {
    const q = query(collection(db, 'vehicles'));
    return onSnapshot(q, (snapshot) => {
      const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(vehicles);
    }, (error) => handleFirestoreError(error, 'list', 'vehicles'));
  }
};

export const invoiceService = {
  subscribeToInvoices: (callback: (invoices: any[]) => void) => {
    const q = query(collection(db, 'invoices'));
    return onSnapshot(q, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(invoices);
    }, (error) => handleFirestoreError(error, 'list', 'invoices'));
  },

  updateInvoiceStatus: async (id: string, status: 'pending' | 'paid' | 'overdue' | 'disputed') => {
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `invoices/${id}`);
    }
  }
};

export async function seedDemoData() {
  const shipments = [
    { customerId: "CUST-001", customerName: "TechCore Global", status: "in_transit", priority: "high", pickupLocation: "Chicago, IL", deliveryLocation: "Seattle, WA", revenue: 2450, currentLat: 45.523062, currentLng: -122.676482, estimatedEta: "2026-04-23T14:00:00Z" },
    { customerId: "CUST-002", customerName: "EcoBuild Systems", status: "loading", priority: "medium", pickupLocation: "Austin, TX", deliveryLocation: "Denver, CO", revenue: 1800, currentLat: 30.2672, currentLng: -97.7431, estimatedEta: "2026-04-24T09:00:00Z" },
    { customerId: "CUST-001", customerName: "Prime Retailers", status: "unassigned", priority: "critical", pickupLocation: " Miami, FL", deliveryLocation: "New York, NY", revenue: 3200, currentLat: 25.7617, currentLng: -80.1918, estimatedEta: "2026-04-23T18:00:00Z" },
  ];

  for (const s of shipments) {
    const id = `LF-${Math.floor(1000 + Math.random() * 9000)}`;
    await setDoc(doc(db, 'shipments', id), {
      ...s,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  const vehicles = [
    { 
      id: "FLEET-9021", 
      model: "Freightliner Cascadia", 
      status: "in_use", 
      mileage: 45000, 
      healthScore: 92,
      sensorData: { engineTemp: 195, oilPressure: 55, fuelEfficiency: 7.2, vibrationLevel: 0.12 },
      lastMaintenance: "2026-01-15T00:00:00Z"
    },
    { 
      id: "FLEET-4491", 
      model: "Kenworth T680", 
      status: "available", 
      mileage: 12000, 
      healthScore: 98,
      sensorData: { engineTemp: 190, oilPressure: 60, fuelEfficiency: 8.1, vibrationLevel: 0.08 },
      lastMaintenance: "2026-03-20T00:00:00Z"
    },
    { 
      id: "FLEET-1102", 
      model: "Volvo VNL 860", 
      status: "maintenance", 
      mileage: 112000, 
      healthScore: 64,
      sensorData: { engineTemp: 215, oilPressure: 42, fuelEfficiency: 6.4, vibrationLevel: 0.45 },
      lastMaintenance: "2025-08-10T00:00:00Z"
    },
  ];

  for (const v of vehicles) {
    await setDoc(doc(db, 'vehicles', v.id), v);
  }

  const invoices = [
    { id: "INV-3301", customerName: "TechCore Global", status: "paid", dueDate: "2026-04-12", amount: 2450.00 },
    { id: "INV-3305", customerName: "EcoBuild Systems", status: "pending", dueDate: "2026-04-22", amount: 1800.00 },
    { id: "INV-3312", customerName: "RetailPlus", status: "overdue", dueDate: "2026-04-15", amount: 4200.00 },
    { id: "INV-3320", customerName: "Prime Retailers", status: "disputed", dueDate: "2026-04-20", amount: 3200.00 },
  ];

  for (const inv of invoices) {
    await setDoc(doc(db, 'invoices', inv.id), {
      ...inv,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}
