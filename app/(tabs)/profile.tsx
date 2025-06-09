import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Pencil, Mail, Phone, GraduationCap, Calendar, Award } from 'lucide-react-native';
import { getCurrentUser, signOut } from '../../utils/auth';
import { useRouter } from 'expo-router';
import { AlertModal } from '../../components/AlertModal';
import { useAlertModal } from '../../hooks/useAlertModal';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const router = useRouter();
  const { alertState, showAlert, hideAlert } = useAlertModal();

  // Mock student data (keep as fallback)
  const mockStudentData = {
    name: 'John Doe',
    studentId: 'STU2024001',
    email: 'john.doe@university.edu',
    major: 'Computer Science',
    year: 'Junior',
    gpa: '3.85',
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data, error } = await getCurrentUser();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('Sign out button pressed!');
    console.log('Using fallback confirmation UI...');
    setShowSignOutConfirm(true);
  };

  const performSignOut = async () => {
    console.log('performSignOut called');
    setSigningOut(true);
    setShowSignOutConfirm(false);
    
    try {
      console.log('Starting sign out process...');
      console.log('Calling signOut() function...');
      
      const result = await signOut();
      console.log('SignOut function returned:', result);
      
      const { error } = result || {};
      console.log('Sign out response - error:', error);
      
      if (error) {
        console.log('Sign out error details:', error.message, error);
        showAlert('Error', 'Failed to sign out. Please try again.');
      } else {
        console.log('Sign out successful! Clearing state and navigating...');
        
        // Clear user state immediately
        console.log('Clearing user state...');
        setUser(null);
        
        console.log('Attempting navigation...');
        // Try multiple navigation methods as fallback
        try {
          console.log('Trying router.replace("../user/signin")...');
          router.replace('../user/signin');
          console.log('Navigation successful!');
        } catch (routeError) {
          console.log('First route attempt failed:', routeError);
          console.log('Trying alternative routing...');
          try {
            router.push('../user/signin');
            console.log('Alternative navigation successful!');
          } catch (secondRouteError) {
            console.log('Second route attempt failed:', secondRouteError);
            console.log('Trying direct navigation to root...');
            // Force navigation by reloading the app state
            router.replace('/');
          }
        }
        
        // Also show a success message
        setTimeout(() => {
          showAlert('Success', 'You have been signed out successfully.');
        }, 500);
      }
    } catch (error: any) {
      console.log('Sign out exception details:', error.message, error);
      showAlert('Error', 'Failed to sign out. Please try again.');
    } finally {
      console.log('Setting signingOut to false...');
      setSigningOut(false);
    }
  };

  const userData = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email,
    studentId: user.user_metadata?.student_id || 'STU2024001',
    major: user.user_metadata?.major || 'Computer Science',
    year: user.user_metadata?.year || 'Junior',
    gpa: user.user_metadata?.gpa || '3.85',
  } : mockStudentData;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{userData.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Student ID</Text>
              <Text style={styles.value}>{userData.studentId}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Major</Text>
              <Text style={styles.value}>{userData.major}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Year</Text>
              <Text style={styles.value}>{userData.year}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>GPA</Text>
              <Text style={styles.value}>{userData.gpa}</Text>
            </View>
          </View>
          
          {user && (
            <TouchableOpacity 
              style={[styles.signOutButton, signingOut && { opacity: 0.6 }]} 
              onPress={() => {
                console.log('Button touched!');
                handleSignOut();
              }}
              disabled={signingOut}
            >
              <Text style={styles.signOutButtonText}>
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignOutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>Are you sure you want to sign out?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => {
                  console.log('Sign out cancelled via modal');
                  setShowSignOutConfirm(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={() => {
                  console.log('Sign out confirmed via modal');
                  performSignOut();
                }}
              >
                <Text style={styles.modalConfirmButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Modal for notifications */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onRequestClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#757575',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666666',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#212121',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
  },
  modalConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});