/**
 * Utilitaire pour la gestion des connexions WebSocket
 */

// Obtient l'URL WebSocket correcte basée sur l'environnement actuel
export function getWebSocketUrl(path: string = '/ws'): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host // Contient toujours [hostname]:[port]
  const url = `${protocol}//${host}${path}`
  console.log(`WebSocket URL: ${url}`)
  return url
}