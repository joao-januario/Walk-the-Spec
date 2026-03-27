import React from 'react';
import { useTheme } from '../hooks/useTheme.js';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps): React.ReactElement {
  return <button onClick={onClick}>{label}</button>;
}

export default function App(): React.ReactElement {
  return <div>App</div>;
}
