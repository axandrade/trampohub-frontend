import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const TrampohubPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      sm: '6px',
      md: '10px',
      lg: '16px',
    },
  },
  semantic: {
    primary: {
      50: '#f4f8fc',
      100: '#e8eef5',
      200: '#c3d4e5',
      300: '#8fa9c7',
      400: '#5b85b3',
      500: '#2e639a',
      600: '#204d7a',
      700: '#163a5f',
      800: '#0f2942',
      900: '#0a1929',
      950: '#061019',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#fafbfc',
          100: '#f4f5f7',
          200: '#e2e5e9',
          300: '#c7ccd1',
          400: '#98a0aa',
          500: '#6e7681',
          600: '#575e66',
          700: '#464c53',
          800: '#2f333a',
          900: '#1c1f23',
          950: '#101215',
        },
      },
    },
  },
});
