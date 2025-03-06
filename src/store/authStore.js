import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const useAuthStore = create((set) => ({
  user: null,
  userRole: null,
  loading: true,
  error: null,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            set({ 
              user, 
              userRole: userDoc.data().role,
              loading: false,
              error: null
            });
          } else {
            set({ user: null, userRole: null, loading: false, error: 'User data not found' });
          }
        } catch (error) {
          set({ user: null, userRole: null, loading: false, error: error.message });
        }
      } else {
        set({ user: null, userRole: null, loading: false, error: null });
      }
    });

    // Return unsubscribe function
    return unsubscribe;
  },

  signUp: async (email, password, role, userData) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        ...userData,
        createdAt: new Date().toISOString()
      });
      
      set({ user, userRole: role, loading: false, error: null });
      return user;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        set({ 
          user, 
          userRole: userDoc.data().role,
          loading: false,
          error: null
        });
      } else {
        set({ loading: false, error: 'User data not found' });
        throw new Error('User data not found');
      }
      
      return user;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, userRole: null, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  }
}));

export default useAuthStore;