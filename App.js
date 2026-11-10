import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskProvider } from './src/context/TaskContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </TaskProvider>
    </SafeAreaProvider>
  );
}
