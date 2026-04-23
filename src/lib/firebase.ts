import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized:", firebaseConfig.projectId);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
console.log("Firestore Database Initialized with ID:", firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Connectivity check
export async function checkConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    return false;
  }
}

async function testConnection() {
  try {
    console.log("Testing Firestore connection...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test: SUCCESS");
  } catch (error: any) {
    console.warn("Firestore connection check info:", error.code, error.message);
    if (error?.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("CRITICAL: Could not reach Firestore backend. This often resolves after a few minutes if the database was just created.");
    }
  }
}
testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  };
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null): never {
  const authUser = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType: operation,
    path: path,
    authInfo: {
      userId: authUser?.uid || 'unauthenticated',
      email: authUser?.email || 'none',
      emailVerified: authUser?.emailVerified || false,
      isAnonymous: authUser?.isAnonymous || false,
      providerInfo: authUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })) || [],
    }
  };
  throw new Error(JSON.stringify(errorInfo));
}
