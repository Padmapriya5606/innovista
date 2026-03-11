import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { GraduationCap, BrainCircuit, Rocket, Briefcase, GraduationCap as Alumni, Building2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const roles = [
    { id: 'student', title: 'Student', icon: GraduationCap, color: '#3B82F6', iconBg: 'rgba(59, 130, 246, 0.15)', description: 'Join project teams and find mentors' },
    { id: 'mentor', title: 'Mentor', icon: BrainCircuit, color: '#10B981', iconBg: 'rgba(16, 185, 129, 0.15)', description: 'Guide startups and students' },
    { id: 'startup', title: 'Startup', icon: Rocket, color: '#F97316', iconBg: 'rgba(249, 115, 22, 0.15)', description: 'Find team members and funding' },
    { id: 'investor', title: 'Investor', icon: Briefcase, color: '#A855F7', iconBg: 'rgba(168, 85, 247, 0.15)', description: 'Discover high-potential ideas' },
    { id: 'alumni', title: 'Alumni', icon: Alumni, color: '#06B6D4', iconBg: 'rgba(6, 182, 212, 0.15)', description: 'Give back to the ecosystem' },
];

const RoleCard = ({ role, onPress }) => {
    const Icon = role.icon;
    const [scale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={[styles.card, { borderColor: role.color }]}
            >
                <View style={[styles.iconContainer, { backgroundColor: role.iconBg, borderColor: role.color }]}>
                    <Icon color={role.color} size={32} />
                </View>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardDesc}>{role.description}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function RoleSelectionScreen({ navigation }) {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleRoleSelect = async (roleId) => {
        setIsAuthenticating(true);

        // Generate a random email for this mobile device session to ensure testing isolation
        const deviceEmail = `mobile_${Math.floor(Math.random() * 10000)}@innovista.app`;
        const testPassword = "mobiletestpass";

        try {
            // 1. Register a silent guest account
            await api.post('/auth/register', {
                email: deviceEmail,
                password: testPassword,
                role: roleId.charAt(0).toUpperCase() + roleId.slice(1) // uppercase first letter
            });

            // 2. Login immediately to get the JWT Token
            const formData = new URLSearchParams();
            formData.append('username', deviceEmail);
            formData.append('password', testPassword);

            const loginRes = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // 3. Save token to AsyncStorage so all subsequent requests are authenticated
            await AsyncStorage.setItem('innovista_token', loginRes.data.access_token);

            // 4. Navigate to standard flow
            navigation.navigate('AiMatchmaking');

        } catch (error) {
            console.error("Silent Auth Failed:", error.response?.data || error.message);
            // Fallback: still navigate so UI isn't stuck for demo purposes
            navigation.navigate('AiMatchmaking');
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>INNOVISTA</Text>
                <Text style={styles.subtitle}>Choose your path to get started in the ecosystem.</Text>
            </View>

            {isAuthenticating && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Initializing {`\n`}Ecosystem Access...</Text>
                </View>
            )}

            <View style={[styles.grid, isAuthenticating && { opacity: 0.3 }]}>
                {roles.map((role) => (
                    <RoleCard key={role.id} role={role} onPress={() => handleRoleSelect(role.id)} />
                ))}
            </View>

            <TouchableOpacity style={styles.adminLink} onPress={() => navigation.navigate('AdminDashboard')}>
                <View style={styles.adminBadge}>
                    <Building2 color={theme.colors.textSecondary} size={16} />
                    <Text style={styles.adminText}>Institutional Login for University Admin</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl, paddingTop: theme.spacing.xxl },
    header: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl, alignItems: 'center' },
    title: { fontSize: 36, fontWeight: '900', color: theme.colors.text, marginBottom: theme.spacing.sm, textAlign: 'center', letterSpacing: 2 },
    subtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: '85%', lineHeight: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: theme.spacing.md },
    cardWrapper: { width: '48%', marginBottom: theme.spacing.md },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        height: 190,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
    },
    cardTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.xs },
    cardDesc: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 18, fontWeight: '500' },
    adminLink: { alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.xl },
    adminBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceElevated, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.full, gap: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
    adminText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(7, 11, 20, 0.8)',
        zIndex: 10,
        borderRadius: theme.borderRadius.xl,
    },
    loadingText: {
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    }
});
