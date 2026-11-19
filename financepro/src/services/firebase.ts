import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfDBgesnFZdVqFD-8GNEXi6d6F-GVWI3E",
  authDomain: "future-c0758.firebaseapp.com",
  projectId: "future-c0758",
  storageBucket: "future-c0758.firebasestorage.app",
  messagingSenderId: "353883971087",
  appId: "1:353883971087:web:de39846a5f7567b85a8d7a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export functions
export const register = async (name: string, email: string, password: string) => {
  try {
    console.log("Firebase: Iniciando criação de conta...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Firebase: Conta criada com sucesso:", user.uid);

    // Get ID token for API
    const idToken = await user.getIdToken();
    console.log("Firebase: ID Token obtido");

    return {
      user: {
        uid: user.uid,
        email: user.email,
        name: name,
      },
      idToken,
    };
  } catch (error: any) {
    console.log("Firebase: Erro no registro:", error);
    // Handle specific Firebase errors
    if (error.code === "auth/email-already-in-use") {
      throw new Error("Este e-mail já está cadastrado");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("E-mail inválido");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Senha fraca - use pelo menos 6 caracteres");
    } else if (error.code === "auth/configuration-not-found") {
      throw new Error("Configuração do Firebase não encontrada. Verifique se a Authentication está habilitada.");
    } else {
      throw new Error("Falha ao criar conta: " + error.message);
    }
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token for API
    const idToken = await user.getIdToken();

    return {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split("@")[0],
      },
      idToken,
    };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new Error("Usuário não encontrado");
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Senha incorreta");
    } else if (error.code === "auth/invalid-credential") {
      throw new Error("E-mail ou senha incorretos");
    } else {
      throw new Error("Falha ao autenticar: " + error.message);
    }
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const subscribeAuth = (callback: (user: User | null, idToken: string | null) => void) => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken();
      callback(user, idToken);
    } else {
      callback(null, null);
    }
  });

  return unsubscribe;
};

export default { register, login, logout, subscribeAuth };
