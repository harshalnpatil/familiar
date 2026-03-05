export function cn(...inputs) {
  const flattened = inputs.flat(Infinity)
  return flattened
    .filter((entry) => typeof entry === 'string' && entry.length > 0)
    .join(' ')
}
