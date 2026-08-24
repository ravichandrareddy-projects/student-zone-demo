// Global client-side memory cache to prevent 0-state flash when switching admin pages

let cachedAdminOrders: any[] = [];

export function getCachedAdminOrders() {
  return cachedAdminOrders;
}

export function setCachedAdminOrders(orders: any[]) {
  if (Array.isArray(orders) && orders.length > 0) {
    cachedAdminOrders = orders;
  }
}
