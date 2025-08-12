// Firebase Authentication service
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } = require('firebase/auth');
const { auth } = require('./firebaseConfig');

class FirebaseAuthService {
  // Register new user
  async registerUser(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout user
  async logoutUser() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'User logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    }
    return null;
  }
}

module.exports = new FirebaseAuthService();
