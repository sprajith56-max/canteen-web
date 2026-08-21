export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  username: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export type FoodCategory =
  | 'Beverages / Hot Drinks'
  | 'Snacks & Evening Bites'
  | 'Chaat & Street Food'
  | 'Tiffin & Breakfast'
  | 'Variety Rice & Meals'
  | 'Biryani & Fast Food'
  | 'Parotta & Sides'
  | 'Fresh Juices & Coolers';

export interface MenuItem {
  id: string;
  code: string;
  nameTamil: string;
  nameEnglish: string;
  category: FoodCategory;
  price: number;
  isVeg: boolean;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  isSpecial?: boolean;
  preparationTimeMinutes: number;
  tags?: string[];
  rating?: number;
  orderCount?: number;
}

export interface DailyMenu {
  id: string;
  date: string; // YYYY-MM-DD
  itemIds: string[]; // Active item IDs for this date
  specialItemIds?: string[];
  notes?: string;
  isPublished: boolean;
  updatedAt: string;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH_COUNTER' | 'UPI_DEMO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface OrderItem {
  itemId: string;
  nameTamil: string;
  nameEnglish: string;
  category: FoodCategory;
  price: number;
  quantity: number;
  subtotal: number;
  isVeg: boolean;
  imageUrl: string;
}

export interface Order {
  id: string; // e.g. KDFC-4821
  tokenNumber: number; // Daily token e.g. #24
  studentId: string;
  studentName: string;
  studentCollegeId: string;
  studentEmail: string;
  studentPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderDate: string; // YYYY-MM-DD
  createdAt: string; // ISO String
  updatedAt: string;
  estimatedTimeMinutes: number;
  pickupTime?: string;
  cancellationReason?: string;
  notes?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' | 'admin' | specific student ID
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'status';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface CanteenSettings {
  isCanteenOpen: boolean;
  bannerNotice: string;
  workingHours: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  upiId: string;
  defaultPrepTimeMinutes: number;
  allowAdvanceOrders: boolean;
  canteenStatus?: 'OPEN' | 'CLOSED';
  openTime?: string;
  closeTime?: string;
  canteenNotice?: string;
}

export interface DashboardStats {
  todayOrdersCount: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  readyOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  todayRevenue: number;
  totalRevenue: number;
  totalStudentsCount: number;
  totalMenuItemsCount: number;
  ordersByStatus: { name: string; value: number; color: string }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topSellingItems: { name: string; count: number; revenue: number }[];
}

export interface AnalyticsSummary {
  todayRevenue: number;
  totalRevenue: number;
  todayOrders: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  salesByCategory: { category: string; count: number; revenue: number }[];
  topSellingItems: { id: string; name: string; price: number; count: number; revenue: number }[];
}

