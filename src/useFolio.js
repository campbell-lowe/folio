import { useContext } from 'react';
import { FolioContext } from './folioContext.js';

export function useFolio() {
  const context = useContext(FolioContext);
  if (!context) {
    throw new Error('useFolio must be used inside a FolioProvider.');
  }
  return context;
}
