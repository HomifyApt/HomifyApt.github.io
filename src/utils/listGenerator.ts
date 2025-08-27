const adjectives = [
  'happy', 'sunny', 'bright', 'cozy', 'warm', 'soft', 'smooth', 'calm', 'fresh', 'clean',
  'modern', 'vintage', 'rustic', 'elegant', 'stylish', 'comfy', 'plush', 'sleek', 'chic', 'trendy',
  'purple', 'blue', 'green', 'red', 'yellow', 'orange', 'pink', 'brown', 'gray', 'white',
  'large', 'small', 'tiny', 'huge', 'mini', 'grand', 'little', 'big', 'long', 'short'
];

const colors = [
  'crimson', 'azure', 'emerald', 'golden', 'silver', 'coral', 'turquoise', 'lavender', 'ivory', 'amber',
  'sage', 'rose', 'pearl', 'bronze', 'ruby', 'sapphire', 'mint', 'cream', 'charcoal', 'copper'
];

const furniture = [
  'sofa', 'chair', 'table', 'desk', 'bed', 'lamp', 'shelf', 'cabinet', 'dresser', 'bench',
  'ottoman', 'bookcase', 'wardrobe', 'nightstand', 'mirror', 'rug', 'cushion', 'stool', 'armchair', 'loveseat',
  'sectional', 'recliner', 'futon', 'daybed', 'vanity', 'hutch', 'credenza', 'console', 'sideboard', 'trunk'
];

export function generateListId(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const furnitureItem = furniture[Math.floor(Math.random() * furniture.length)];
  
  return `${adjective}-${color}-${furnitureItem}`;
}