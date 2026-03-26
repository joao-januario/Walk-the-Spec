import { createContext, useContext } from 'react';

const GlossaryContext = createContext<Record<string, string>>({});

export const useGlossary = (): Record<string, string> => useContext(GlossaryContext);

export const GlossaryProvider = GlossaryContext.Provider;
