const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  color_theme?: string;
  item_count?: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  unit?: string;
  discount_price?: number;
  discount_percentage?: number;
  is_new?: boolean;
  is_quick_pick?: boolean;
  quick_pick_order?: number;
  active_time?: number;
  total_time?: number;
  servings?: number;
  calories?: number;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_lkr: number;
  sort_order?: number;
  weight_label?: string;
  is_default?: boolean;
}

export interface Store {
  id: string;
  name: string;
  icon_url?: string;
  delivery_time?: string;
  distance?: string;
  tags?: string[];
  created_at?: string;
}

export async function fetchProducts(params?: {
  category_id?: string;
  search?: string;
  quick_pick?: boolean;
}): Promise<Product[]> {
  let queryStr = "";
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.category_id) searchParams.append("category", params.category_id);
    if (params.search) searchParams.append("search", params.search);
    if (params.quick_pick) searchParams.append("quick_pick", "true");
    const qs = searchParams.toString();
    if (qs) queryStr = `?${qs}`;
  }
  
  const res = await fetch(`${API_URL}/products${queryStr}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.map((d: any) => ({ ...d, id: d._id || d.id }));
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch product");
  }
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.map((d: any) => ({ ...d, id: d._id || d.id }));
}

export async function fetchStores(): Promise<Store[]> {
  const res = await fetch(`${API_URL}/stores`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  const data = await res.json();
  return data.map((d: any) => ({ ...d, id: d._id || d.id }));
}

export async function fetchVariants(productId: string): Promise<ProductVariant[]> {
  const res = await fetch(`${API_URL}/products/${productId}/variants`);
  if (!res.ok) throw new Error("Failed to fetch variants");
  const data = await res.json();
  return data.map((d: any) => ({ ...d, id: d._id || d.id }));
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const res = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function placeOrder(orderData: any, token: string) { const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(orderData) }); if (!res.ok) throw new Error('Failed to place order'); return res.json(); }

export async function sendOtp(phone: string) { const res = await fetch(`${API_URL}/auth/otp/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) }); if (!res.ok) throw new Error('Failed to send OTP'); return res.json(); }
export async function verifyOtp(phone: string, code: string) { const res = await fetch(`${API_URL}/auth/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code }) }); if (!res.ok) throw new Error('Invalid OTP'); return res.json(); }

export async function getOrders(token: string) { const res = await fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!res.ok) throw new Error('Failed to fetch orders'); return res.json(); }

export async function syncCartBackend(cart: any[], token: string) { const res = await fetch(`${API_URL}/cart/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ cart }) }); if (!res.ok) throw new Error('Failed to sync cart'); return res.json(); }
export async function fetchCartBackend(token: string) { const res = await fetch(`${API_URL}/cart`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!res.ok) throw new Error('Failed to fetch cart'); return res.json(); }

export async function updatePushToken(token: string, pushToken: string) {
  const res = await fetch(`${API_URL}/auth/push-token`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ pushToken })
  });
  if (!res.ok) throw new Error('Failed to update push token');
  return res.json();
}

export async function calculateDeliveryFee(lat: number, lng: number, token: string) {
  const res = await fetch(`${API_URL}/orders/calculate-delivery-fee?lat=${lat}&lng=${lng}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to calculate delivery fee');
  return res.json();
}

export async function getOrderById(id: string, token: string) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

