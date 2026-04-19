/**
 * Color Tokens
 *
 * Semantic color roles for consistent theming
 * Never use hex codes directly - always reference roles
 */

export interface ColorTokens {
  background: string;
  foreground: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  borderLight: string;
}

/**
 * Default color tokens (light theme)
 */
export const colors: ColorTokens = {
  background: "FFFFFF",
  foreground: "F9FAFB",
  text: "111827",
  textMuted: "6B7280",
  primary: "2563EB",
  primaryLight: "DBEAFE",
  accent: "F59E0B",
  accentLight: "FEF3C7",
  success: "10B981",
  warning: "F59E0B",
  error: "EF4444",
  border: "E5E7EB",
  borderLight: "F3F4F6",
};

/**
 * Dark theme colors
 */
export const darkColors: ColorTokens = {
  background: "111827",
  foreground: "1F2937",
  text: "F9FAFB",
  textMuted: "9CA3AF",
  primary: "3B82F6",
  primaryLight: "1E3A8A",
  accent: "FBBF24",
  accentLight: "78350F",
  success: "34D399",
  warning: "FBBF24",
  error: "F87171",
  border: "374151",
  borderLight: "1F2937",
};
