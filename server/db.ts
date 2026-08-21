import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MenuItem, DailyMenu, Order, User, AppNotification, CanteenSettings, DashboardStats } from '../src/types';
import { INITIAL_MENU_ITEMS, INITIAL_SETTINGS } from './initialData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'canteen_db.json');

export interface StoredUser extends User {
  passwordHash: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  menuItems: MenuItem[];
  dailyMenus: DailyMenu[];
  orders: Order[];
  notifications: AppNotification[];
  settings: CanteenSettings;
  lastTokenNumber: { date: string; token: number };
}

// Simple deterministic hash for demo passwords
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'srm_kdfc_secret_salt').digest('hex');
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getInitialDatabase(): DatabaseSchema {
  const today = getTodayString();
  const allItemIds = INITIAL_MENU_ITEMS.map((item) => item.id);
  const specialIds = INITIAL_MENU_ITEMS.filter((item) => item.isSpecial).map((item) => item.id);

  // Initial Admin & Student
  const adminUser: StoredUser = {
    id: 'usr-admin-1',
    name: 'Canteen Chief Manager',
    email: 'admin@srmmcet.edu.in',
    username: 'admin',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    phone: '9876543210',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const studentUser: StoredUser = {
    id: 'usr-student-1',
    name: 'S. Prajith',
    studentId: 'SRM2026CS104',
    email: 'sprajith56@srmmcet.edu.in',
    username: 'prajith',
    passwordHash: hashPassword('password123'),
    role: 'student',
    phone: '9443211234',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const initialDailyMenu: DailyMenu = {
    id: `dm-${today}`,
    date: today,
    itemIds: allItemIds,
    specialItemIds: specialIds,
    notes: 'Standard SRM MCET KDFC full menu served today with special Biryani & Dosa tiffin.',
    isPublished: true,
    updatedAt: new Date().toISOString()
  };

  // Seed two realistic recent orders
  const sampleOrder1: Order = {
    id: 'KDFC-1001',
    tokenNumber: 1,
    studentId: studentUser.id,
    studentName: studentUser.name,
    studentCollegeId: studentUser.studentId || 'SRM2026CS104',
    studentEmail: studentUser.email,
    studentPhone: studentUser.phone,
    items: [
      {
        itemId: 'item-36',
        nameTamil: 'சிக்கன் பிரியாணி',
        nameEnglish: 'Chicken Biryani',
        category: 'Biryani & Fast Food',
        price: 100,
        quantity: 1,
        subtotal: 100,
        isVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemId: 'item-48',
        nameTamil: 'வாட்டர் மிலன் ஜூஸ்',
        nameEnglish: 'Watermelon Juice',
        category: 'Fresh Juices & Coolers',
        price: 30,
        quantity: 1,
        subtotal: 30,
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80'
      }
    ],
    totalAmount: 130,
    paymentMethod: 'UPI_DEMO',
    paymentStatus: 'PAID',
    orderStatus: 'PREPARING',
    orderDate: today,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estimatedTimeMinutes: 10,
    statusHistory: [
      { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), note: 'Order received via online portal' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), note: 'Payment verified & order accepted' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'Chef is plating Chicken Biryani' }
    ]
  };

  const sampleOrder2: Order = {
    id: 'KDFC-1002',
    tokenNumber: 2,
    studentId: studentUser.id,
    studentName: studentUser.name,
    studentCollegeId: studentUser.studentId || 'SRM2026CS104',
    studentEmail: studentUser.email,
    studentPhone: studentUser.phone,
    items: [
      {
        itemId: 'item-2',
        nameTamil: 'கிளாஸ் (காபி)',
        nameEnglish: 'Glass Coffee',
        category: 'Beverages / Hot Drinks',
        price: 15,
        quantity: 2,
        subtotal: 30,
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemId: 'item-10',
        nameTamil: 'வெஜ் பப்ஸ்',
        nameEnglish: 'Veg Puff',
        category: 'Snacks & Evening Bites',
        price: 15,
        quantity: 2,
        subtotal: 30,
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
      }
    ],
    totalAmount: 60,
    paymentMethod: 'CASH_COUNTER',
    paymentStatus: 'PAID',
    orderStatus: 'COMPLETED',
    orderDate: today,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    estimatedTimeMinutes: 5,
    statusHistory: [
      { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 88 * 60 * 1000).toISOString() },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString() },
      { status: 'READY', timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString() },
      { status: 'COMPLETED', timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(), note: 'Collected at counter 1' }
    ]
  };

  const initialNotifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: studentUser.id,
      title: 'Welcome to SRM KDFC Canteen Portal!',
      message: 'Explore today’s menu, order hot food directly to avoid counter rush, and track your token live.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      userId: 'admin',
      title: 'KDFC Canteen System Active',
      message: 'Menu synchronized with official 57 items from price board.',
      type: 'success',
      isRead: true,
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users: [adminUser, studentUser],
    menuItems: INITIAL_MENU_ITEMS,
    dailyMenus: [initialDailyMenu],
    orders: [sampleOrder1, sampleOrder2],
    notifications: initialNotifications,
    settings: INITIAL_SETTINGS,
    lastTokenNumber: { date: today, token: 2 }
  };
}

class CanteenDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure default properties exist
        if (!parsed.menuItems || parsed.menuItems.length === 0) {
          parsed.menuItems = INITIAL_MENU_ITEMS;
        }
        if (!parsed.settings) {
          parsed.settings = INITIAL_SETTINGS;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading canteen database, re-seeding...', e);
    }
    const initial = getInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(state: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  // ================= USERS =================
  public getUsers(): StoredUser[] {
    return this.data.users;
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByUsernameOrEmail(identifier: string): StoredUser | undefined {
    const term = identifier.toLowerCase().trim();
    return this.data.users.find(
      (u) => u.username.toLowerCase() === term || u.email.toLowerCase() === term
    );
  }

  public addUser(user: StoredUser): StoredUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, patch: Partial<StoredUser>): StoredUser | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...patch };
    this.save();
    return this.data.users[idx];
  }

  // ================= MENU ITEMS =================
  public getMenuItems(): MenuItem[] {
    return this.data.menuItems;
  }

  public getMenuItemById(id: string): MenuItem | undefined {
    return this.data.menuItems.find((item) => item.id === id);
  }

  public addMenuItem(item: MenuItem): MenuItem {
    this.data.menuItems.push(item);
    this.save();
    return item;
  }

  public updateMenuItem(id: string, patch: Partial<MenuItem>): MenuItem | null {
    const idx = this.data.menuItems.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    this.data.menuItems[idx] = { ...this.data.menuItems[idx], ...patch };
    this.save();
    return this.data.menuItems[idx];
  }

  public deleteMenuItem(id: string): boolean {
    const before = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter((item) => item.id !== id);
    if (this.data.menuItems.length !== before) {
      // Also remove from daily menus
      this.data.dailyMenus.forEach((dm) => {
        dm.itemIds = dm.itemIds.filter((itemId) => itemId !== id);
        if (dm.specialItemIds) {
          dm.specialItemIds = dm.specialItemIds.filter((itemId) => itemId !== id);
        }
      });
      this.save();
      return true;
    }
    return false;
  }

  // ================= DAILY MENUS =================
  public getDailyMenu(date: string): DailyMenu {
    const existing = this.data.dailyMenus.find((dm) => dm.date === date);
    if (existing) return existing;

    // Fallback: If not configured, auto-generate from available items
    const availableItemIds = this.data.menuItems.filter((i) => i.isAvailable).map((i) => i.id);
    const specialIds = this.data.menuItems.filter((i) => i.isSpecial && i.isAvailable).map((i) => i.id);
    const newDaily: DailyMenu = {
      id: `dm-${date}`,
      date,
      itemIds: availableItemIds,
      specialItemIds: specialIds,
      notes: `Standard full menu for ${date}`,
      isPublished: true,
      updatedAt: new Date().toISOString()
    };
    this.data.dailyMenus.push(newDaily);
    this.save();
    return newDaily;
  }

  public saveDailyMenu(date: string, itemIds: string[], specialItemIds: string[] = [], notes: string = ''): DailyMenu {
    const idx = this.data.dailyMenus.findIndex((dm) => dm.date === date);
    const updated: DailyMenu = {
      id: `dm-${date}`,
      date,
      itemIds,
      specialItemIds,
      notes,
      isPublished: true,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      this.data.dailyMenus[idx] = updated;
    } else {
      this.data.dailyMenus.push(updated);
    }
    this.save();
    return updated;
  }

  public getDailyMenuItemsForDate(date: string): MenuItem[] {
    const dailyMenu = this.getDailyMenu(date);
    const activeSet = new Set(dailyMenu.itemIds);
    const specialSet = new Set(dailyMenu.specialItemIds || []);

    return this.data.menuItems
      .filter((item) => activeSet.has(item.id))
      .map((item) => ({
        ...item,
        isSpecial: specialSet.has(item.id) || item.isSpecial
      }));
  }

  // ================= ORDERS =================
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public getOrdersByStudentId(studentId: string): Order[] {
    return this.data.orders.filter((o) => o.studentId === studentId);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'tokenNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    const today = getTodayString();
    if (!this.data.lastTokenNumber || this.data.lastTokenNumber.date !== today) {
      this.data.lastTokenNumber = { date: today, token: 1 };
    } else {
      this.data.lastTokenNumber.token += 1;
    }

    const tokenNumber = this.data.lastTokenNumber.token;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `KDFC-${randomCode}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      tokenNumber,
      orderDate: today,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: orderData.orderStatus || 'ORDER_PLACED',
          timestamp: now,
          note: 'Order placed by student'
        }
      ]
    };

    this.data.orders.unshift(newOrder);

    // Update item order counts
    newOrder.items.forEach((oi) => {
      const item = this.data.menuItems.find((m) => m.id === oi.itemId);
      if (item) {
        item.orderCount = (item.orderCount || 0) + oi.quantity;
      }
    });

    // Notify Student
    this.addNotification({
      id: `notif-${Date.now()}-student`,
      userId: newOrder.studentId,
      title: `Order Placed: Token #${newOrder.tokenNumber}`,
      message: `Your order ${newOrder.id} of ₹${newOrder.totalAmount} has been placed. Counter token is #${newOrder.tokenNumber}.`,
      type: 'success',
      isRead: false,
      createdAt: now,
      link: `/orders?id=${newOrder.id}`
    });

    // Notify Admin
    this.addNotification({
      id: `notif-${Date.now()}-admin`,
      userId: 'admin',
      title: `New Order: Token #${newOrder.tokenNumber} (${newOrder.studentName})`,
      message: `${newOrder.items.length} items (₹${newOrder.totalAmount}) via ${newOrder.paymentMethod}.`,
      type: 'info',
      isRead: false,
      createdAt: now,
      link: `/admin/orders?id=${newOrder.id}`
    });

    this.save();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['orderStatus'], note?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const now = new Date().toISOString();
    order.orderStatus = status;
    order.updatedAt = now;
    order.statusHistory.push({
      status,
      timestamp: now,
      note: note || `Order status updated to ${status}`
    });

    if (status === 'COMPLETED') {
      order.paymentStatus = 'PAID';
    }

    // Notify Student on status update
    const statusMessages: Record<string, string> = {
      CONFIRMED: `Your order ${order.id} (Token #${order.tokenNumber}) has been accepted by the kitchen.`,
      PREPARING: `Chef is currently preparing your order (Token #${order.tokenNumber}).`,
      READY: `🔔 TOKEN #${order.tokenNumber} IS READY! Please collect your food at Canteen Counter 1 & 2.`,
      COMPLETED: `Order ${order.id} has been delivered. Enjoy your meal at SRM MCET!`,
      CANCELLED: `Order ${order.id} was cancelled. ${note || ''}`
    };

    if (statusMessages[status]) {
      this.addNotification({
        id: `notif-${Date.now()}-status`,
        userId: order.studentId,
        title: `Order Update: Token #${order.tokenNumber} is ${status}`,
        message: statusMessages[status],
        type: status === 'CANCELLED' ? 'warning' : 'info',
        isRead: false,
        createdAt: now,
        link: `/orders?id=${order.id}`
      });
    }

    this.save();
    return order;
  }

  public updateOrderPayment(orderId: string, paymentStatus: Order['paymentStatus']): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // ================= NOTIFICATIONS =================
  public getNotifications(userId?: string): AppNotification[] {
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter(
      (n) => n.userId === 'all' || n.userId === userId || (userId === 'admin' && n.userId === 'admin')
    );
  }

  public addNotification(notification: AppNotification): AppNotification {
    this.data.notifications.unshift(notification);
    if (this.data.notifications.length > 200) {
      this.data.notifications = this.data.notifications.slice(0, 200);
    }
    this.save();
    return notification;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === 'all') {
        n.isRead = true;
      }
    });
    this.save();
  }

  // ================= SETTINGS =================
  public getSettings(): CanteenSettings {
    return this.data.settings;
  }

  public updateSettings(patch: Partial<CanteenSettings>): CanteenSettings {
    this.data.settings = { ...this.data.settings, ...patch };
    this.save();
    return this.data.settings;
  }

  // ================= ANALYTICS =================
  public getAnalytics(): any {
    const today = getTodayString();
    const todayOrders = this.data.orders.filter((o) => o.orderDate === today);

    const pendingOrdersCount = this.data.orders.filter((o) => o.orderStatus === 'ORDER_PLACED' || o.orderStatus === 'CONFIRMED').length;
    const preparingOrdersCount = this.data.orders.filter((o) => o.orderStatus === 'PREPARING').length;
    const readyOrdersCount = this.data.orders.filter((o) => o.orderStatus === 'READY').length;
    const completedOrdersCount = this.data.orders.filter((o) => o.orderStatus === 'COMPLETED').length;
    const cancelledOrdersCount = this.data.orders.filter((o) => o.orderStatus === 'CANCELLED').length;

    const todayRevenue = todayOrders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalRevenue = this.data.orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const studentsCount = this.data.users.filter((u) => u.role === 'student').length;
    const menuItemsCount = this.data.menuItems.length;

    const ordersByStatus = [
      { name: 'Pending', value: pendingOrdersCount, color: '#f59e0b' },
      { name: 'Preparing', value: preparingOrdersCount, color: '#3b82f6' },
      { name: 'Ready', value: readyOrdersCount, color: '#10b981' },
      { name: 'Completed', value: completedOrdersCount, color: '#6366f1' },
      { name: 'Cancelled', value: cancelledOrdersCount, color: '#ef4444' }
    ];

    // Revenue by last 7 days
    const revenueByDayMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      revenueByDayMap.set(dateStr, { revenue: 0, orders: 0 });
    }

    this.data.orders.forEach((o) => {
      if (revenueByDayMap.has(o.orderDate) && o.orderStatus !== 'CANCELLED') {
        const current = revenueByDayMap.get(o.orderDate)!;
        current.revenue += o.totalAmount;
        current.orders += 1;
      }
    });

    const revenueByDay = Array.from(revenueByDayMap.entries()).map(([date, data]) => {
      const parts = date.split('-');
      const formatted = `${parts[2]}/${parts[1]}`;
      return {
        date: formatted,
        revenue: data.revenue,
        orders: data.orders
      };
    });

    // Top selling items & sales by category
    const itemSalesMap = new Map<string, { id: string; name: string; price: number; count: number; revenue: number }>();
    const categorySalesMap = new Map<string, { category: string; count: number; revenue: number }>();

    // Initialize all categories
    const allCategories = [
      'Beverages / Hot Drinks',
      'Snacks & Evening Bites',
      'Chaat & Street Food',
      'Tiffin & Breakfast',
      'Variety Rice & Meals',
      'Biryani & Fast Food',
      'Parotta & Sides',
      'Fresh Juices & Coolers'
    ];
    allCategories.forEach((cat) => {
      categorySalesMap.set(cat, { category: cat, count: 0, revenue: 0 });
    });

    this.data.orders.forEach((o) => {
      if (o.orderStatus !== 'CANCELLED') {
        o.items.forEach((oi) => {
          const key = oi.nameEnglish || oi.itemId;
          const current = itemSalesMap.get(key) || {
            id: oi.itemId,
            name: oi.nameEnglish,
            price: oi.price,
            count: 0,
            revenue: 0
          };
          current.count += oi.quantity;
          current.revenue += oi.subtotal;
          itemSalesMap.set(key, current);

          // Find category
          const dbItem = this.data.menuItems.find((mi) => mi.id === oi.itemId);
          const cat = dbItem ? dbItem.category : 'Snacks & Evening Bites';
          const catStat = categorySalesMap.get(cat) || { category: cat, count: 0, revenue: 0 };
          catStat.count += oi.quantity;
          catStat.revenue += oi.subtotal;
          categorySalesMap.set(cat, catStat);
        });
      }
    });

    const topSellingItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const salesByCategory = Array.from(categorySalesMap.values());

    return {
      todayRevenue,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayOrdersCount: todayOrders.length,
      totalOrders: this.data.orders.length,
      activeOrders: pendingOrdersCount + preparingOrdersCount + readyOrdersCount,
      completedOrders: completedOrdersCount,
      pendingOrdersCount,
      preparingOrdersCount,
      readyOrdersCount,
      completedOrdersCount,
      cancelledOrdersCount,
      totalStudentsCount: studentsCount,
      totalMenuItemsCount: menuItemsCount,
      ordersByStatus,
      revenueByDay,
      salesByCategory,
      topSellingItems
    };
  }
}

export const db = new CanteenDB();
