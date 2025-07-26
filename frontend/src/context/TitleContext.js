// context/TitleContext.jsx
import { createContext, useContext, useState } from 'react';

export const TitleContext = createContext({
  setTitle: () => {},
  title: '',
});

export const usePageTitle = () => useContext(TitleContext);
