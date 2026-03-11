import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Bell, User, Menu } from 'lucide-react-native';
import { theme } from '../../theme';

export default function Header({ role = 'Guest', title = 'Innovista', navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    <TouchableOpacity onPress={() => navigation.toggleDrawer?.()} style={styles.iconButton}>
                        <Menu color={theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{title}</Text>
                </View>

                <View style={styles.rightSection}>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{role}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <Bell color={theme.colors.text} size={20} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarButton}>
                        <User color={theme.colors.text} size={18} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: theme.colors.background, // Match dark background
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#E0E7FF', // Bright white/blue tint for title
        marginLeft: theme.spacing.xs,
        letterSpacing: 0.5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    roleBadge: {
        backgroundColor: theme.colors.surfaceElevated,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconButton: {
        padding: theme.spacing.xs,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.alert,
        borderWidth: 1,
        borderColor: theme.colors.background,
    },
    avatarButton: {
        backgroundColor: theme.colors.surfaceElevated,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
        marginLeft: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
});
