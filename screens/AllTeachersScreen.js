import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
    SafeAreaView, 
    TextInput 
} from 'react-native';
import Config from '../config';
import ApiService from '../utils/apiService';

export default function AllTeachersScreen() {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchTeachers();
    }, []);

    // Handle Search Filtering
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTeachers(teachers);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = teachers.filter(teacher => 
                teacher.fullName.toLowerCase().includes(query) || 
                (teacher.assignedClass && teacher.assignedClass.toLowerCase().includes(query)) ||
                (teacher.town && teacher.town.toLowerCase().includes(query))
            );
            setFilteredTeachers(filtered);
        }
    }, [searchQuery, teachers]);

    useFocusEffect(
        useCallback(() => {
            fetchTeachers();
        }, [])
    );

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const result = await ApiService.getAllTeachers();

            if (result && result.success && result.data && Array.isArray(result.data.teachers)) {
                setTeachers(result.data.teachers);
                setFilteredTeachers(result.data.teachers);
            } else {
                setTeachers([]);
                setFilteredTeachers([]);
                if (result?.message) Alert.alert('Notice', result.message);
            }
        } catch (err) {
            console.error('❌ Error fetching teachers:', err);
            setTeachers([]);
            setFilteredTeachers([]);
            Alert.alert('Connection Error', 'Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (teacherID) => {
        Alert.alert('Confirm Delete', 'This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete Teacher',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const result = await ApiService.deleteTeacher(teacherID);
                        if (result.success) {
                            Alert.alert('Success', 'Teacher removed.');
                            fetchTeachers();
                        }
                    } catch (err) {
                        Alert.alert('Error', 'Failed to delete teacher');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.teacherCard}>
            <Image
                style={styles.profileImage}
                source={
                    item.profilePic
                        ? { uri: `${Config.API_BASE_URL}/uploads/${item.profilePic}` }
                        : require('../assets/default-profile.png')
                }
            />
            
            <View style={styles.teacherDetails}>
                <Text style={styles.teacherName} numberOfLines={1}>{item.fullName}</Text>
                
                <View style={styles.metaRow}>
                    <Ionicons name="school-outline" size={14} color="#64748B" />
                    <Text style={styles.teacherMeta}>{item.assignedClass || 'No Class'}</Text>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.teacherMeta}>{item.town || 'Unknown'}</Text>
                </View>
            </View>

            <View style={styles.verticalActions}>
                <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => navigation.navigate('EditTeacher', { teacher: item })}
                >
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
                
                <View style={styles.actionDivider} />

                <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => handleDelete(item.teacherID)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Staff Registry</Text>
                    <Text style={styles.headerSubtitle}>{teachers.length} Registered Teachers</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, class or town..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94A3B8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddTeacher')}
            >
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Register New Teacher</Text>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={filteredTeachers}
                    keyExtractor={(item) => item.teacherID.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons 
                                name={searchQuery ? "search-outline" : "people-outline"} 
                                size={80} 
                                color="#CBD5E1" 
                            />
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? "No results found" : "No Staff Registered"}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery 
                                    ? `We couldn't find anything matching "${searchQuery}"`
                                    : "Start by adding your first teacher to the system."}
                            </Text>
                            {searchQuery.length > 0 && (
                                <TouchableOpacity 
                                    style={styles.clearSearchButton}
                                    onPress={() => setSearchQuery('')}
                                >
                                    <Text style={styles.clearSearchText}>Clear Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    searchSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },
    teacherCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    profileImage: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: '#F1F5F9',
    },
    teacherDetails: {
        flex: 1,
        marginLeft: 15,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    teacherMeta: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 5,
    },
    verticalActions: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    actionIcon: {
        padding: 8,
    },
    actionDivider: {
        height: 1,
        width: '60%',
        backgroundColor: '#E2E8F0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#475569',
        marginTop: 15,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        marginHorizontal: 40,
        marginTop: 5,
    },
    clearSearchButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
    },
    clearSearchText: {
        color: '#3B82F6',
        fontWeight: '700',
    },
});