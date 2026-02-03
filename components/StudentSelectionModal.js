import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet 
} from 'react-native';

const StudentSelectionModal = ({ 
  visible, 
  onClose, 
  students, 
  onSelectStudent, 
  title,
  currentGroupStudents 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Safety check: ensure students is always an array
  const safeStudents = Array.isArray(students) ? students : [];
  const safeCurrentGroupStudents = Array.isArray(currentGroupStudents) ? currentGroupStudents : [];
  
  // Filter out students already in the target group
  const availableStudents = safeStudents.filter(student => 
    !safeCurrentGroupStudents.some(groupStudent => 
      groupStudent.studentID === student.studentID
    )
  );
  
  // Filter by search query
  const filteredStudents = availableStudents.filter(student =>
    `${student.Fname} ${student.Lname}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.studentID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.studentItem}
              onPress={() => onSelectStudent(item)}
            >
              <Text style={styles.studentName}>
                {item.Fname} {item.Lname}
              </Text>
              <Text style={styles.studentClass}>{item.class}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No students available</Text>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
  },
  studentItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

export default StudentSelectionModal;
