import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { 
    Alert, 
    StatusBar, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform 
} from 'react-native';
import ApiService from '../utils/apiService';

export default function EditTeacherScreen({ route }) {
    const { teacher } = route.params;
    const [Fname, setFname] = useState(teacher.Fname || '');
    const [Mname, setMname] = useState(teacher.Mname || '');
    const [Lname, setLname] = useState(teacher.Lname || '');
    const [town, setTown] = useState(teacher.town || '');
    const [className, setClassName] = useState(teacher.assignedClass || '');
    const [phone, setPhone] = useState(teacher.phone || '');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const validateClassFormat = (classInput) => {
        if (!classInput) return true;
        const validClassPattern = /^(Basic\s+\d+|KG\d+|JHS\d+)$/i;
        return validClassPattern.test(classInput.trim());
    };

    const handleUpdate = async () => {
        if (!Fname || !Lname) {
            Alert.alert('Missing Fields', 'Please enter first name and last name.');
            return;
        }

        if (className && !validateClassFormat(className)) {
            Alert.alert(
                'Invalid Class Format',
                'Please use the correct format (e.g., Basic 1, KG1, JHS1).'
            );
            return;
        }

        setLoading(true);
        try {
            const updatedData = {
                Fname, Mname, Lname,
                className: className.trim(),
                phone, town
            };
            const result = await ApiService.updateTeacher(teacher.teacherID, updatedData);
            if (result.success) {
                Alert.alert('Success', 'Teacher updated successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', result.message || 'Failed to update teacher');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update teacher. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

                {/* Header - Fixed at Top */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Edit Teacher</Text>
                        <Text style={styles.headerSubtitle}>Update teacher information</Text>
                    </View>
                </View>

                {/* Scrollable Form Area */}
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>First Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter first name"
                                value={Fname}
                                onChangeText={setFname}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Middle Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Optional"
                                value={Mname}
                                onChangeText={setMname}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Last Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter last name"
                                value={Lname}
                                onChangeText={setLname}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Assigned Class</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g., Basic 1, KG1, JHS1"
                                value={className}
                                onChangeText={setClassName}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="+233..."
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Town</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter town"
                                value={town}
                                onChangeText={setTown}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Update Button - Inside ScrollView to ensure visibility */}
                    <TouchableOpacity
                        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.updateButtonText}>Updating...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.updateButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                    {/* Extra space at bottom for scrolling comfort */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    formSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        margin: 20,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F8FAFC',
        color: '#1E293B',
    },
    updateButton: {
        backgroundColor: '#000066',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: 20,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000066',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
    },
    updateButtonDisabled: {
        backgroundColor: '#94A3B8',
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
};