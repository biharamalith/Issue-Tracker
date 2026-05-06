export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validateIssueForm = (data: {
  title: string;
  description: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.title.trim()) errors.title = 'Title is required';
  else if (data.title.trim().length < 5) errors.title = 'Title must be at least 5 characters';
  if (!data.description.trim()) errors.description = 'Description is required';
  else if (data.description.trim().length < 10)
    errors.description = 'Description must be at least 10 characters';
  return errors;
};
