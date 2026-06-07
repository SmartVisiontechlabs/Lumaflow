/**
 * Sanitizes input strings by stripping all HTML tags and characters between angle brackets.
 * This is a lightweight, regex-free implementation.
 */
export function sanitizeInput(val: any): string {
  if (typeof val !== 'string') {
    return typeof val === 'number' || typeof val === 'boolean' ? String(val) : '';
  }
  
  let result = '';
  let insideTag = false;
  
  for (let i = 0; i < val.length; i++) {
    const char = val[i];
    if (char === '<') {
      insideTag = true;
    } else if (char === '>') {
      insideTag = false;
    } else if (!insideTag) {
      result += char;
    }
  }
  
  return result.trim();
}
