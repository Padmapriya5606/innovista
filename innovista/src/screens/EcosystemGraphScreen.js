import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../theme';
import { ArrowLeft, Layers } from 'lucide-react-native';

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.26.0/cytoscape.min.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #000000; }
    #cy { width: 100vw; height: 100vh; display: block; }
    #overlay { position: absolute; top: 20px; right: 20px; background: rgba(15, 15, 15, 0.8); padding: 15px; border-radius: 12px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: white; border: 1px solid #27272A; pointer-events: none; }
    .legend-item { display: flex; align-items: center; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #A1A1AA; }
    .color-box { width: 12px; height: 12px; border-radius: 6px; margin-right: 8px; border: 1px solid rgba(255,255,255,0.2); }
  </style>
</head>
<body>
  <div id="cy"></div>
  <div id="overlay">
    <div style="font-weight: 900; margin-bottom: 12px; font-size: 14px; color: #FFFFFF; letter-spacing: 1px; text-transform: uppercase;">Ecosystem Nodes</div>
    <div class="legend-item"><div class="color-box" style="background: #3B82F6"></div> Students</div>
    <div class="legend-item"><div class="color-box" style="background: #10B981"></div> Mentors</div>
    <div class="legend-item"><div class="color-box" style="background: #F97316"></div> Startups</div>
    <div class="legend-item"><div class="color-box" style="background: #A855F7"></div> Investors</div>
    <div class="legend-item"><div class="color-box" style="background: #06B6D4"></div> Alumni</div>
  </div>
  <script>
    var cy = cytoscape({
      container: document.getElementById('cy'),
      elements: [
        { data: { id: 's1', label: 'Student A', type: 'student' } },
        { data: { id: 's2', label: 'Student B', type: 'student' } },
        { data: { id: 'm1', label: 'Mentor X', type: 'mentor' } },
        { data: { id: 'st1', label: 'Startup Alpha', type: 'startup' } },
        { data: { id: 'i1', label: 'VC Fund', type: 'investor' } },
        { data: { id: 'a1', label: 'Alum Dev', type: 'alumni' } },
        { data: { id: 's3', label: 'Student C', type: 'student' } },
        { data: { id: 'm2', label: 'Mentor Y', type: 'mentor' } },
        { data: { id: 'e1', source: 's1', target: 'st1' } },
        { data: { id: 'e2', source: 's2', target: 'st1' } },
        { data: { id: 'e3', source: 'm1', target: 'st1' } },
        { data: { id: 'e4', source: 'i1', target: 'st1' } },
        { data: { id: 'e5', source: 'a1', target: 'm1' } },
        { data: { id: 'e6', source: 's3', target: 'm2' } },
        { data: { id: 'e7', source: 'm2', target: 'i1' } }
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': function(ele){
              const types = { 'student': '#3B82F6', 'mentor': '#10B981', 'startup': '#F97316', 'investor': '#A855F7', 'alumni': '#06B6D4' };
              return types[ele.data('type')] || '#ccc';
            },
            'label': 'data(label)',
            'color': '#FFFFFF',
            'text-outline-color': '#000',
            'text-outline-width': 2,
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'width': function(ele) { return ele.data('type') === 'startup' || ele.data('type') === 'investor' ? 35 : 20; },
            'height': function(ele) { return ele.data('type') === 'startup' || ele.data('type') === 'investor' ? 35 : 20; },
            'border-width': 2,
            'border-color': 'rgba(255,255,255,0.5)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#27272A',
            'curve-style': 'bezier',
            'opacity': 0.8
          }
        }
      ],
      layout: {
        name: 'cose',
        padding: 50,
        nodeRepulsion: 4000000,
        idealEdgeLength: 100
      }
    });

    cy.on('tap', 'node', function(evt){
      var node = evt.target;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'node_click', data: node.data() }));
    });
  </script>
</body>
</html>
`;

export default function EcosystemGraphScreen({ navigation }) {
  const webviewRef = useRef(null);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'node_click') {
        console.log('Node clicked:', data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Layers color={theme.colors.primary} size={20} />
            <Text style={styles.headerTitle}>Network Graph</Text>
          </View>
        </View>

        <WebView
          ref={webviewRef}
          source={{ html: HTML_CONTENT }}
          style={styles.webview}
          onMessage={handleMessage}
          bounces={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
