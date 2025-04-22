
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateForm = (values: Record<string, any>, rules: Record<string, (value: any) => boolean>) => {
  const errors: Record<string, string> = {};
  
  Object.entries(rules).forEach(([field, validator]) => {
    if (!validator(values[field])) {
      errors[field] = `Invalid ${field}`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
