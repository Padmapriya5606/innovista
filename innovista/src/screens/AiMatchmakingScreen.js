import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Search, ChevronRight, Briefcase, BrainCircuit } from 'lucide-react-native';
import { theme } from '../theme';
import Header from '../components/layout/Header';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const MatchCard = ({ match, type }) => {
    return (
        <View style={[styles.matchCard, { borderTopColor: type === 'mentor' ? theme.colors.accent : theme.colors.warning }]}>
            <View style={styles.matchHeader}>
                <View style={styles.matchInfo}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: type === 'mentor' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]} />
                    <View>
                        <Text style={styles.matchName}>{match.name}</Text>
                        <Text style={styles.matchRole}>{match.role}</Text>
                    </View>
                </View>
                <View style={[styles.scoreBadge, { borderColor: type === 'mentor' ? theme.colors.accent : theme.colors.warning }]}>
                    <Text style={[styles.scoreText, { color: type === 'mentor' ? theme.colors.accent : theme.colors.warning }]}>{match.score}% Score</Text>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                {match.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.matchReason}>{match.reason}</Text>

            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>
                    {type === 'mentor' ? 'Request Introduction' : 'View Profile'}
                </Text>
                <ChevronRight color={theme.colors.background} size={16} />
            </TouchableOpacity>
        </View>
    );
};

export default function AiMatchmakingScreen({ navigation }) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [matches, setMatches] = useState({ mentors: [], investors: [] });
    const [fadeAnim] = useState(new Animated.Value(0));

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setShowResults(false);
        fadeAnim.setValue(0);

        try {
            const response = await api.post('/matchmaking/search', {
                query: query,
                limit: 5
            });

            // The backend returns a list of "matches". We parse them into mentors and investors.
            const allMatches = response.data.matches;

            const fetchedMentors = allMatches.filter(m => m.role === 'Mentor' || m.role === 'Alumni' || m.role === 'Student');
            const fetchedInvestors = allMatches.filter(m => m.role === 'Investor' || m.role === 'Startup');

            setMatches({
                mentors: fetchedMentors,
                investors: fetchedInvestors
            });

            setIsSearching(false);
            setShowResults(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

        } catch (error) {
            console.error("Matchmaking Search failed:", error);
            setIsSearching(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header role="Student" navigation={navigation} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <LinearGradient
                    colors={['#0F0F0F', '#000000']}
                    style={styles.heroSection}
                >
                    <Text style={styles.heroTitle}>Matchmaking Engine</Text>
                    <Text style={styles.heroSubtitle}>
                        Our AI analyzes your idea and connects you with the exact mentors and investors you need.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe your startup idea in plain English..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={query}
                            onChangeText={setQuery}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={!query.trim() || isSearching}
                    >
                        {isSearching ? (
                            <ActivityIndicator color={theme.colors.text} />
                        ) : (
                            <>
                                <Search color={theme.colors.background} size={20} />
                                <Text style={styles.searchButtonText}>Initialize Search</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </LinearGradient>

                {showResults && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <View style={styles.resultsSection}>
                            <View style={styles.sectionHeader}>
                                <BrainCircuit color={theme.colors.accent} size={24} />
                                <Text style={styles.sectionTitle}>Top Mentor Matches</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                {matches.mentors.map((match, idx) => (
                                    <View key={idx} style={{ width: 320, marginRight: theme.spacing.md }}>
                                        <MatchCard match={match} type="mentor" />
                                    </View>
                                ))}
                                {matches.mentors.length === 0 && (
                                    <Text style={{ color: theme.colors.textSecondary }}>No mentor matches found.</Text>
                                )}
                            </ScrollView>
                        </View>

                        <View style={styles.resultsSection}>
                            <View style={styles.sectionHeader}>
                                <Briefcase color={theme.colors.warning} size={24} />
                                <Text style={styles.sectionTitle}>Top Investor Matches</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                                {matches.investors.map((match, idx) => (
                                    <View key={idx} style={{ width: 320, marginRight: theme.spacing.md }}>
                                        <MatchCard match={match} type="investor" />
                                    </View>
                                ))}
                                {matches.investors.length === 0 && (
                                    <Text style={{ color: theme.colors.textSecondary }}>No investor matches found.</Text>
                                )}
                            </ScrollView>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: theme.spacing.xxl },
    heroSection: {
        padding: theme.spacing.xl,
        paddingBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#E0E7FF',
        marginBottom: theme.spacing.sm,
        letterSpacing: 1,
    },
    heroSubtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.lg,
        lineHeight: 24,
    },
    inputContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
        elevation: 4,
    },
    textInput: {
        fontSize: 16,
        color: theme.colors.text,
        minHeight: 120,
        backgroundColor: 'transparent',
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    searchButtonDisabled: {
        backgroundColor: theme.colors.border,
        opacity: 0.5,
    },
    searchButtonText: {
        color: theme.colors.background, // bold contrast for black mode primary buttons
        fontSize: 16,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    resultsSection: {
        marginTop: theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    horizontalScroll: {
        paddingHorizontal: theme.spacing.lg,
    },
    matchCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderTopWidth: 4,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
    },
    matchInfo: {
        flexDirection: 'row',
        flex: 1,
        paddingRight: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    matchName: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 4,
    },
    matchRole: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    scoreBadge: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
    },
    scoreText: {
        fontWeight: '800',
        fontSize: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.md,
    },
    tag: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tagText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    matchReason: {
        fontSize: 14,
        color: '#D4D4D8',
        lineHeight: 22,
        marginBottom: theme.spacing.lg,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.text,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.xs,
    },
    actionButtonText: {
        color: theme.colors.background,
        fontWeight: '800',
        fontSize: 14,
    },
});
