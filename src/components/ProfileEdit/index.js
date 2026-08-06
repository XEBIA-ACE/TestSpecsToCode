/**
 * index.js — barrel export for the ProfileEdit feature module.
 * Import the component from here to keep import paths stable.
 *
 * Usage:
 *   import ProfileEditForm from 'components/ProfileEdit';
 */
export { default } from './ProfileEditForm';
export {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './ProfileEditForm';
