export const money = i => (Math.round(i * 100) / 100).toFixed(2)

export const title = s => s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())