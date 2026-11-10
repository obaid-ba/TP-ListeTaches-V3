import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import { useTasks } from '../context/TaskContext';
import ErrorScreen from '../screens/ErrorScreen';
import HomeScreen from '../screens/HomeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import TaskListScreen from '../screens/TaskListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home',
  Tasks: 'checkbox',
  Add: 'add-circle-outline',
  Profile: 'person',
};

// L'onglet « Ajouter » ouvre le formulaire : il n'affiche rien lui-même.
function EmptyScreen() {
  return null;
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{ title: 'Tâches' }}
      />
      <Tab.Screen
        name="Add"
        component={EmptyScreen}
        options={{ title: 'Ajouter' }}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate('TaskForm');
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, loaded, error, retry } = useTasks();

  if (loading) return <LoadingScreen />;
  if (!loaded) return <ErrorScreen message={error} onRetry={retry} />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsScreen}
          options={{ title: 'Détails de la tâche' }}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            title: route.params?.taskId
              ? 'Modifier une tâche'
              : 'Ajouter une tâche',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
