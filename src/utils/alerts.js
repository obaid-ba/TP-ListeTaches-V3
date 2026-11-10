import { Alert } from 'react-native';

export function showError(error) {
  Alert.alert('Erreur', error.message);
}

export function confirmDelete(onConfirm) {
  Alert.alert(
    'Supprimer la tâche',
    'Cette action est définitive. Voulez-vous continuer ?',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
    ]
  );
}
