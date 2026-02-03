// screens/StudentsByClassScreen.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ApiService from '../utils/apiService';

export default function StudentsByClassScreen() {
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const classOptions = ['KG1', 'KG2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'JHS1', 'JHS2', 'JHS3'];
    const navigation = useNavigation();

    useEffect(() => {
        if (selectedClass) {
            fetchStudentsByClass(selectedClass);
        }
    }, [selectedClass]);

    const fetchStudentsByClass = async (className) => {
        setLoading(true);
        try {

            const result = await ApiService.getStudentsByClass(className);
            if (result.success) {

                setStudents(result.data);
            } else {
                Alert.alert('Error', `Failed to fetch students: ${result.message}`);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            console.error('Error details:', err.response?.data);
            Alert.alert('Error', `Failed to fetch students: ${err.message}`);
        }
        setLoading(false);
    };

    const handleDeleteStudent = (student) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${student.fullName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await ApiService.deleteStudent(student.studentID);
                            if (result.success) {
                                Alert.alert('Success', 'Student deleted successfully');
                                fetchStudentsByClass(selectedClass); // Refresh the list
                            } else {
                                Alert.alert('Error', result.message || 'Failed to delete student');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete student');
                        }
                    },
                },
            ]
        );
    };

    const renderStudentCard = ({ item }) => (
        <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.details}>Town: {item.town}</Text>
                <Text style={styles.details}>Class: {item.class}</Text>
                <Text style={styles.details}>ID: {item.studentID}</Text>
            </View>
            
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditStudent', { student: item })}
                >
                    <Ionicons name="pencil" size={18} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteStudent(item)}
                >
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.heading}>Students by Class</Text>
            </View>
            <Picker
                selectedValue={selectedClass}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedClass(itemValue)}
            >
                <Picker.Item label="Select Class" value="" />
                {classOptions.map((cls) => (
                    <Picker.Item key={cls} label={cls} value={cls} />
                ))}
            </Picker>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000066" />
                    <Text style={styles.loadingText}>Loading students...</Text>
                </View>
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.studentID}
                    renderItem={renderStudentCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff6e9',
        padding: 20 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 10
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 8,
        backgroundColor: '#F1F5F9'
    },
    heading: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#000066'
    },
    picker: { 
        height: 50, 
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    listContainer: {
        paddingBottom: 20,
    },
    studentCard: { 
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    studentInfo: {
        marginBottom: 12,
    },
    name: { 
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        color: '#000066'
    },
    details: { 
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    editButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },
});
