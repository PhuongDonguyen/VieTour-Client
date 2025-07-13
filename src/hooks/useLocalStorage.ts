import { useState } from 'react';

export const useLocalStorage = <T>() => {
  const [value, setValue] = useState<T | null>(null);

  const setItem = (key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    setValue(value);
  };

  const getItem = (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  const removeItem = (key: string) => {
    localStorage.removeItem(key);
    setValue(null);
  };

  return { value, setItem, getItem, removeItem };
}; 