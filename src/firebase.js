// =====================================================
// firebase.js — Shared Firebase initialization
// Single source of truth untuk auth, db, dan appId
// Digunakan oleh App.jsx dan AdminPanel.jsx
// =====================================================
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/* global __firebase_config, __app_id, __initial_auth_token */

// === Parse Firebase Config ===
let firebaseConfig = null;
try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        if (typeof __firebase_config === 'object') {
            firebaseConfig = __firebase_config;
        } else if (typeof __firebase_config === 'string' && __firebase_config !== 'undefined') {
            firebaseConfig = JSON.parse(__firebase_config);
        }
    }
} catch (e) {
    console.error("firebase.js: Error parsing firebaseConfig:", e);
}

// === Initialize Firebase App (singleton) ===
const app = firebaseConfig
    ? (getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig))
    : null;

// === Export shared instances ===
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// === Parse App ID ===
let _appId = 'default-app-id';
try {
    if (typeof __app_id !== 'undefined' && __app_id && __app_id !== 'undefined') {
        _appId = __app_id;
    }
} catch (e) {
    console.error("firebase.js: Error parsing appId:", e);
}
export const appId = _appId;

// === Check initial auth token ===
let _initialAuthToken = null;
try {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        _initialAuthToken = __initial_auth_token;
    }
} catch (e) {
    // Not available, will use anonymous auth
}
export const initialAuthToken = _initialAuthToken;

// === Auth ready promise ===
// Resolves when the first auth state is determined (logged in or not)
// This prevents race conditions where components try to use auth before it's ready
let _authReadyResolve = null;
export const authReadyPromise = new Promise((resolve) => {
    _authReadyResolve = resolve;
});

// === Initialize Auth (runs once at module load) ===
if (auth) {
    // Attempt sign-in
    const doSignIn = async () => {
        try {
            if (_initialAuthToken) {
                const { signInWithCustomToken } = await import('firebase/auth');
                const cred = await signInWithCustomToken(auth, _initialAuthToken);
                _authReadyResolve(cred.user);
            } else if (!auth.currentUser) {
                const cred = await signInAnonymously(auth);
                _authReadyResolve(cred.user);
            } else {
                _authReadyResolve(auth.currentUser);
            }
            console.log("firebase.js: Auth berhasil (anonymous/custom token)");
        } catch (e) {
            console.error("firebase.js: Auth GAGAL:", e);
            _authReadyResolve(auth.currentUser || null);
        }
    };
    doSignIn();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            _authReadyResolve(user);
        }
    });
} else {
    // No auth available — resolve immediately with null
    _authReadyResolve(null);
    console.warn("firebase.js: Firebase tidak terinisialisasi — __firebase_config tidak tersedia");
}

console.log("firebase.js: Loaded. Config:", !!firebaseConfig, "AppId:", _appId);
