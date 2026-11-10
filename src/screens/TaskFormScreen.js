import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import OptionGroup from '../components/OptionGroup';
import { PRIORITIES, STATUSES } from '../constants/tasks';
import { colors } from '../constants/theme';
import { useTasks } from '../context/TaskContext';
import { confirmDelete, showError } from '../utils/alerts';

const TITLE_MAX_LENGTH = 100;

export default function TaskFormScreen({ navigation, route }) {
  const { tasks, addTask, editTask, removeTask } = useTasks();
  const task = tasks.find((item) => item.id === route.params?.taskId);
  const isEditing = route.params?.taskId !== undefined;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'moyenne');
  const [status, setStatus] = useState(task?.status ?? 'a_faire');
  const [titleError, setTitleError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const cleanTitle = title.trim();

    if (cleanTitle.length < 3) {
      setTitleError('Le titre doit contenir au moins 3 caractères.');
      return;
    }
    setTitleError(null);

    const values = {
      title: cleanTitle,
      description: description.trim(),
      priority,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await editTask(route.params.taskId, { ...values, status });
      } else {
        await addTask(values);
      }
      navigation.goBack();
    } catch (e) {
      showError(e);
      setSaving(false);
    }
  }

  function handleDelete() {
    confirmDelete(async () => {
      setSaving(true);
      try {
        await removeTask(route.params.taskId);
        navigation.popToTop();
      } catch (e) {
        showError(e);
        setSaving(false);
      }
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'android' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.field}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex. Préparer la présentation"
            placeholderTextColor={colors.textMuted}
            maxLength={TITLE_MAX_LENGTH}
            style={[styles.input, titleError && styles.inputError]}
          />
          {titleError && <Text style={styles.error}>{titleError}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Détails de la tâche..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Priorité</Text>
          <OptionGroup
            options={PRIORITIES}
            value={priority}
            onChange={setPriority}
          />
        </View>

        {isEditing && (
          <View style={styles.field}>
            <Text style={styles.label}>Statut</Text>
            <OptionGroup
              options={STATUSES}
              value={status}
              onChange={setStatus}
            />
          </View>
        )}

        <View style={styles.actions}>
          <AppButton
            title="Enregistrer"
            loading={saving}
            onPress={handleSubmit}
          />
          {isEditing && (
            <AppButton
              title="Supprimer"
              color={colors.danger}
              disabled={saving}
              onPress={handleDelete}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    padding: 12,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 110,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
