import React, { useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Modal, View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import BudgetScreen from '../screens/BudgetScreen';
import DebtPlannerScreen from '../screens/DebtPlannerScreen';
import InvestmentScreen from '../screens/InvestmentScreen';
import TaxPlannerScreen from '../screens/TaxPlannerScreen';
import ChatScreen from '../screens/ChatScreen';
import FloatingChatButton from '../components/FloatingChatButton';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Budget: { active: 'wallet', inactive: 'wallet-outline' },
  Debt: { active: 'trending-down', inactive: 'trending-down-outline' },
  Portfolio: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Tax: { active: 'document-text', inactive: 'document-text-outline' },
};

export default function AppNavigator() {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.tabBarInactive,
            tabBarLabelStyle: styles.tabLabel,
            tabBarIcon: ({ focused, color, size }) => {
              const icons = TAB_ICONS[route.name];
              const iconName = focused ? icons.active : icons.inactive;
              return <Ionicons name={iconName} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
          <Tab.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
          <Tab.Screen name="Debt" component={DebtPlannerScreen} options={{ title: 'Debt Plan' }} />
          <Tab.Screen name="Portfolio" component={InvestmentScreen} options={{ title: 'Portfolio' }} />
          <Tab.Screen name="Tax" component={TaxPlannerScreen} options={{ title: 'Tax Plan' }} />
        </Tab.Navigator>
      </NavigationContainer>

      {/* Floating CA Sharma chat button */}
      <FloatingChatButton onPress={() => setChatVisible(true)} />

      {/* Full-screen chat modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.modalClose}>
          <Ionicons
            name="chevron-down"
            size={28}
            color={Colors.textSecondary}
            onPress={() => setChatVisible(false)}
            style={styles.closeIcon}
          />
        </View>
        <ChatScreen />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 6,
    height: 68,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  modalClose: {
    backgroundColor: Colors.card,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeIcon: { padding: 4 },
});
