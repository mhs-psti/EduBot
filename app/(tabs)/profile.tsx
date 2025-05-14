import React, { useState } from 'react';
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
} from 'react-native';
import { Pencil, Mail, Phone, GraduationCap, Calendar, Award } from 'lucide-react-native';

// Mock user data - In a real app, this would come from your authentication system
const initialUserData = {
  name: 'Sarah Johnson',
  studentId: 'STU2024001',
  email: 'sarah.j@example.edu',
  phone: '+1 (555) 123-4567',
  program: 'Computer Science',
  semester: '4th Semester',
  batch: '2022-2026',
  gpa: '3.8',
  status: 'Active',
  profileImage: 'https://images.pexels.com/photos/3785424/pexels-photo-3785424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
};

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [editableData, setEditableData] = useState(userData);

  const handleSave = () => {
    setUserData(editableData);
    setIsEditing(false);
    // In a real app, you would make an API call here to update the user data
  };

  const renderField = (label: string, value: string, icon: React.ReactNode, editable = false) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIcon}>{icon}</View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.input}
            value={editableData[label.toLowerCase() as keyof typeof editableData]}
            onChangeText={(text) =>
              setEditableData({ ...editableData, [label.toLowerCase()]: text })
            }
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Student Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: userData.profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.studentId}>ID: {userData.studentId}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.status, { backgroundColor: '#4CAF50' }]}>
              {userData.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          {renderField('Program', userData.program, <GraduationCap size={20} color="#3F51B5" />)}
          {renderField('Semester', userData.semester, <Calendar size={20} color="#3F51B5" />)}
          {renderField('Batch', userData.batch, <Award size={20} color="#3F51B5" />)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {renderField('Email', userData.email, <Mail size={20} color="#3F51B5" />, true)}
          {renderField('Phone', userData.phone, <Phone size={20} color="#3F51B5" />, true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Standing</Text>
          <View style={styles.gpaContainer}>
            <Text style={styles.gpaLabel}>Current GPA</Text>
            <Text style={styles.gpaValue}>{userData.gpa}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#212121',
  },
  editButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#212121',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#757575',
  },
  statusContainer: {
    marginTop: 8,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#212121',
    marginBottom: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF1FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#757575',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#212121',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  gpaContainer: {
    backgroundColor: '#EEF1FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gpaLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3F51B5',
    marginBottom: 8,
  },
  gpaValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#3F51B5',
  },
});