// src/__tests__/validation.test.ts
import { validateEmail, validateIssueForm } from '../utils/formatDate';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('first.last@domain.co.uk')).toBe(true);
    expect(validateEmail('test+tag@mail.io')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('missing@tld')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });
});

describe('validateIssueForm', () => {
  it('returns no errors for valid data', () => {
    const errors = validateIssueForm({
      title: 'Login crashes on iOS 17',
      description: 'Reproducible steps: open app, tap login, observe crash.',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('requires a title', () => {
    const errors = validateIssueForm({ title: '', description: 'Some valid description here.' });
    expect(errors.title).toBeDefined();
  });

  it('requires title to be at least 5 characters', () => {
    const errors = validateIssueForm({ title: 'Bug', description: 'Some valid description here.' });
    expect(errors.title).toMatch(/5 characters/i);
  });

  it('requires a description', () => {
    const errors = validateIssueForm({ title: 'Valid title here', description: '' });
    expect(errors.description).toBeDefined();
  });

  it('requires description to be at least 10 characters', () => {
    const errors = validateIssueForm({ title: 'Valid title here', description: 'Short' });
    expect(errors.description).toMatch(/10 characters/i);
  });

  it('returns both errors when both fields are empty', () => {
    const errors = validateIssueForm({ title: '', description: '' });
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
  });
});
