import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import Header from '../components/layout/Header';
import { Activity, AlertOctagon, TrendingUp, Users, Presentation, Layers } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import api from '../services/api';

const screenWidth = Dimensions.get('window').width;

const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>{title}</Text>
            <Icon color={theme.colors.primary} size={20} />
        </View>
        <View style={styles.metricValueContainer}>
            <Text style={styles.metricValue}>{value}</Text>
            {trend && (
                <Text style={[styles.metricTrend, { color: trend > 0 ? theme.colors.accent : theme.colors.alert }]}>
                    {trend > 0 ? '+' : ''}{trend}%
                </Text>
            )}
        </View>
    </View>
);

const AlertCard = ({ title, description, level }) => (
    <View style={[styles.alertCard, { borderLeftColor: level === 'critical' ? theme.colors.alert : theme.colors.warning }]}>
        <AlertOctagon color={level === 'critical' ? theme.colors.alert : theme.colors.warning} size={20} />
        <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertDesc}>{description}</Text>
        </View>
        <TouchableOpacity style={styles.alertAction}>
            <Text style={styles.alertActionText}>Resolve</Text>
        </TouchableOpacity>
    </View>
);

export default function AdminDashboardScreen({ navigation }) {
    const [stats, setStats] = useState({
        total_members: 0,
        active_startups: 0,
        matches_made: 0,
        total_funding_cr: 0
    });
    const [chartData, setChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ data: [20, 45, 28, 80, 99, 43] }]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/analytics/milestones');
                const mData = response.data;

                setStats({
                    total_members: mData.total_members,
                    active_startups: mData.active_startups,
                    matches_made: mData.matches_made,
                    total_funding_cr: 45 // Dummy for MVP
                });

                if (mData.growth_trend && mData.growth_trend.length > 0) {
                    setChartData({
                        labels: mData.growth_trend.slice(-6).map(d => d.month),
                        datasets: [{
                            data: mData.growth_trend.slice(-6).map(d => d.students + d.startups)
                        }]
                    });
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const chartConfig = {
        backgroundGradientFrom: theme.colors.surface,
        backgroundGradientTo: theme.colors.surface,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(161, 161, 170, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: theme.colors.primary
        }
    };

    return (
        <View style={styles.container}>
            <Header role="Admin" navigation={navigation} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Key Metrics Strip */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ecosystem Metrics</Text>
                    <View style={styles.metricsGrid}>
                        <MetricCard title="Active Members" value={stats.total_members.toLocaleString()} icon={Users} trend={12} />
                        <MetricCard title="Total Startups" value={stats.active_startups.toLocaleString()} icon={Presentation} trend={8} />
                        <MetricCard title="Matches Made" value={stats.matches_made.toLocaleString()} icon={TrendingUp} trend={34} />
                        <MetricCard title="Funding Raised" value={`₹${stats.total_funding_cr}Cr`} icon={Activity} trend={0} />
                    </View>
                </View>

                {/* Charts Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Department Activity</Text>
                    </View>
                    <View style={styles.chartCard}>
                        <LineChart
                            data={chartData}
                            width={screenWidth - theme.spacing.lg * 2 - theme.spacing.md * 2}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{ borderRadius: theme.borderRadius.md }}
                            withInnerLines={false}
                            withOuterLines={false}
                        />
                    </View>
                </View>

                {/* Alerts Feed */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Decision Triggers</Text>
                    <View style={styles.alertsContainer}>
                        <AlertCard title="Unassigned Startups" description="4 startups have no assigned mentor." level="warning" />
                        <AlertCard title="Activity Drop" description="Engineering department down 40% vs last month." level="critical" />
                        <AlertCard title="Dormant Investors" description="3 investors inactive for 90+ days." level="warning" />
                    </View>
                </View>

                {/* Action Button for Graph */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.graphTriggerBtn}
                        onPress={() => navigation.navigate('EcosystemGraph')}
                    >
                        <View style={styles.graphIconWrapper}>
                            <Layers color={theme.colors.text} size={24} />
                        </View>
                        <View>
                            <Text style={styles.graphBtnTitle}>View Ecosystem Graph</Text>
                            <Text style={styles.graphBtnDesc}>Interactive live network visualization</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
    section: { marginBottom: theme.spacing.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.md, letterSpacing: 0.5 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, justifyContent: 'space-between' },
    metricCard: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.md,
    },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    metricTitle: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
    metricValueContainer: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xs },
    metricValue: { fontSize: 28, fontWeight: '900', color: theme.colors.text },
    metricTrend: { fontSize: 13, fontWeight: '800' },
    chartCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    alertsContainer: { gap: theme.spacing.md },
    alertCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceElevated, padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md, borderLeftWidth: 4, borderWidth: 1, borderColor: theme.colors.border
    },
    alertTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
    alertDesc: { fontSize: 13, color: theme.colors.textSecondary },
    alertAction: { backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border },
    alertActionText: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
    graphTriggerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
        gap: theme.spacing.md,
    },
    graphIconWrapper: { backgroundColor: 'rgba(0,0,0,0.3)', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md },
    graphBtnTitle: { color: theme.colors.background, fontSize: 18, fontWeight: '900', marginBottom: 2, letterSpacing: 1 },
    graphBtnDesc: { color: 'rgba(0,0,0,0.7)', fontSize: 14, fontWeight: '600' },
});
