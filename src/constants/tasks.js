import { colors } from './theme';

export const PRIORITIES = {
  faible: {
    label: 'Faible',
    color: colors.success,
    background: colors.successLight,
  },
  moyenne: {
    label: 'Moyenne',
    color: colors.warning,
    background: colors.warningLight,
  },
  elevee: {
    label: 'Élevée',
    color: colors.danger,
    background: colors.dangerLight,
  },
};

export const STATUSES = {
  a_faire: {
    label: 'À faire',
    color: colors.primary,
    background: colors.primaryLight,
  },
  terminee: {
    label: 'Terminée',
    color: colors.success,
    background: colors.successLight,
  },
};

export const FILTERS = {
  all: { label: 'Toutes' },
  a_faire: { label: 'À faire' },
  terminee: { label: 'Terminées' },
};
