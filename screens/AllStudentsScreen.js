import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    FlatList, 
    Image, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View, 
    Platform 
} from 'react-native';
import Config from '../config';
import ApiService from '../utils/apiService';

export default function AllStudentsScreen() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchStudents();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchStudents();
        }, [])
    );

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const result = await ApiService.getAllStudents();

            if (result && result.success) {
                // Adjusting for different possible data structures
                const data = Array.isArray(result.data) ? result.data : result.data.students;
                setStudents(data || []);
            } else {
                setStudents([]);
                Alert.alert('Notice', result?.message || 'No student data available');
            }
        } catch (err) {
            console.error('❌ Error fetching students:', err);
            setStudents([]);
            Alert.alert('Connection Error', 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePhoto = async (student) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera roll access is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.IMAGES,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0];
            const formData = new FormData();
            const uri = selectedImage.uri;
            const name = uri.split('/').pop();
            const type = `image/${name.split('.').pop() || 'jpeg'}`;

            formData.append('profilePic', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: name,
                type: type,
            });
            formData.append('studentID', student.studentID.toString());

            setLoading(true);
            try {
                const response = await ApiService.updateStudentPhoto(formData);
                if (response.success) {
                    Alert.alert('Success', 'Profile photo updated');
                    fetchStudents();
                } else {
                    Alert.alert('Error', response.message);
                }
            } catch (err) {
                Alert.alert('Server Error', 'Could not connect to the server.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDelete = (studentID) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this student?', [
            { text: 'Cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const result = await ApiService.deleteStudent(studentID);
                        if (result.success) {
                            Alert.alert('Success', 'Student deleted successfully');
                            fetchStudents();
                        } else {
                            Alert.alert('Error', result.message || 'Failed to delete student');
                        }
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete student');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
                {/* Interactive Profile Image */}
                <TouchableOpacity onPress={() => handleUpdatePhoto(item)} style={styles.imageWrapper}>
                    <Image
                        style={styles.profileImage}
                        source={
                            item.profilePic
                                ? { uri: `${Config.API_BASE_URL}/uploads/${item.profilePic}` }
                                : require('../assets/default-profile.png')
                        }
                    />
                    <View style={styles.cameraBadge}>
                        <Ionicons name="camera" size={10} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>

                <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>{item.Fname} {item.Lname}</Text>
                    
                    <Text style={styles.studentMeta}>
                        <Ionicons name="finger-print" size={14} color="#94A3B8" /> ID: {item.studentID}
                    </Text>
                    
                    <Text style={styles.studentMeta}>
                        <Ionicons name="school" size={14} color="#94A3B8" /> {item.class}
                    </Text>

                    <Text style={[styles.studentMeta, { marginBottom: 8 }]}>
                        <Ionicons name="location" size={14} color="#94A3B8" /> {item.town}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditStudent', { student: item })}
                >
                    <Ionicons name="pencil" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.studentID)}
                >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Students Directory</Text>
                        <Text style={styles.headerSubtitle}>Manage all students in the system</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddStudent')}
            >
                <Ionicons name="person-add" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add New Student</Text>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading students...</Text>
                </View>
            ) : students.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                    </View>
                    <Text style={styles.emptyTitle}>No Students Found</Text>
                    <Text style={styles.emptySubtitle}>Student records will appear here once they are added</Text>
                </View>
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.studentID.toString()}
                    renderItem={renderItem}
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
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        elevation: 2,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 16,
        elevation: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 10,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 10,
    },
    studentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
    },
    studentInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 16,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: '#E2E8F0',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3B82F6',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    studentMeta: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 2,
    },
    actionButtons: {
        flexDirection: 'column',
        gap: 12,
        marginLeft: 10,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        color: '#64748B',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#64748B',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});