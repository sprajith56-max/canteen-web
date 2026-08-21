import { Router, Request, Response } from 'express';
import { db, hashPassword } from './db';
import { UserRole } from '../src/types';

export const apiRouter = Router();

// ================= AUTHENTICATION =================
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, studentId, email, username, password, phone } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'Name, email, username, and password are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    const existingUser = db.findUserByUsernameOrEmail(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const existingEmail = db.findUserByUsernameOrEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      studentId: studentId ? studentId.trim().toUpperCase() : `SRM${Math.floor(1000 + Math.random() * 9000)}`,
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role: 'student' as UserRole,
      phone: phone ? phone.trim() : '',
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Student registered successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required' });
    }

    const user = db.findUserByUsernameOrEmail(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const hashed = hashPassword(password);
    if (user.passwordHash !== hashed) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by administration.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Access denied. Account does not have ${role} privileges.`
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Login successful',
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

apiRouter.post('/auth/quick-login', (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const targetRole = type === 'admin' ? 'admin' : 'student';
    const users = db.getUsers();
    const user = users.find((u) => u.role === targetRole);
    if (!user) {
      return res.status(404).json({ error: 'User role not found' });
    }
    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Quick login successful',
      user: safeUser
    });
  } catch (error) {
    console.error('Quick login error:', error);
    return res.status(500).json({ error: 'Internal server error during quick login' });
  }
});

apiRouter.get('/auth/user/:id', (req: Request, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json(safeUser);
});

apiRouter.put('/auth/user/:id', (req: Request, res: Response) => {
  const { name, phone, email } = req.body;
  const updated = db.updateUser(req.params.id, { name, phone, email });
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = updated;
  return res.json(safeUser);
});

// ================= MENU MANAGEMENT =================
const getMenuHandler = (req: Request, res: Response) => {
  const items = db.getMenuItems();
  return res.json(items);
};
apiRouter.get('/menu', getMenuHandler);
apiRouter.get('/menu/items', getMenuHandler);

apiRouter.get('/menu/today', (req: Request, res: Response) => {
  const dateQuery = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const items = db.getDailyMenuItemsForDate(dateQuery);
  const dailyMeta = db.getDailyMenu(dateQuery);
  return res.json({
    date: dateQuery,
    items,
    notes: dailyMeta.notes || '',
    isPublished: dailyMeta.isPublished
  });
});

const postMenuHandler = (req: Request, res: Response) => {
  try {
    const {
      nameTamil,
      nameEnglish,
      category,
      price,
      isVeg,
      description,
      imageUrl,
      isAvailable,
      isSpecial,
      preparationTimeMinutes,
      tags
    } = req.body;

    if (!nameTamil || !nameEnglish || !category || price === undefined) {
      return res.status(400).json({ error: 'Food name, category, and price are required' });
    }

    const newItem = {
      id: `item-${Date.now()}`,
      code: `KDFC-${Math.floor(100 + Math.random() * 900)}`,
      nameTamil: nameTamil.trim(),
      nameEnglish: nameEnglish.trim(),
      category,
      price: Number(price),
      isVeg: isVeg === undefined ? true : Boolean(isVeg),
      description: description ? description.trim() : '',
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
      isSpecial: Boolean(isSpecial),
      preparationTimeMinutes: Number(preparationTimeMinutes) || 5,
      tags: Array.isArray(tags) ? tags : [],
      orderCount: 0
    };

    const saved = db.addMenuItem(newItem);
    return res.status(201).json(saved);
  } catch (error) {
    console.error('Add menu item error:', error);
    return res.status(500).json({ error: 'Failed to add menu item' });
  }
};
apiRouter.post('/menu', postMenuHandler);
apiRouter.post('/menu/items', postMenuHandler);

const putMenuHandler = (req: Request, res: Response) => {
  const updated = db.updateMenuItem(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  return res.json(updated);
};
apiRouter.put('/menu/:id', putMenuHandler);
apiRouter.put('/menu/items/:id', putMenuHandler);

const deleteMenuHandler = (req: Request, res: Response) => {
  const success = db.deleteMenuItem(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  return res.json({ message: 'Menu item deleted successfully' });
};
apiRouter.delete('/menu/:id', deleteMenuHandler);
apiRouter.delete('/menu/items/:id', deleteMenuHandler);

apiRouter.patch('/menu/:id/availability', (req: Request, res: Response) => {
  const { isAvailable } = req.body;
  const updated = db.updateMenuItem(req.params.id, { isAvailable: Boolean(isAvailable) });
  if (!updated) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  return res.json(updated);
});
apiRouter.patch('/menu/items/:id/availability', (req: Request, res: Response) => {
  const { isAvailable } = req.body;
  const updated = db.updateMenuItem(req.params.id, { isAvailable: Boolean(isAvailable) });
  if (!updated) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  return res.json(updated);
});

apiRouter.patch('/menu/:id/special', (req: Request, res: Response) => {
  const { isSpecial } = req.body;
  const updated = db.updateMenuItem(req.params.id, { isSpecial: Boolean(isSpecial) });
  if (!updated) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  return res.json(updated);
});
apiRouter.patch('/menu/items/:id/special', (req: Request, res: Response) => {
  const { isSpecial } = req.body;
  const updated = db.updateMenuItem(req.params.id, { isSpecial: Boolean(isSpecial) });
  if (!updated) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  return res.json(updated);
});

// ================= DAILY MENU CALENDAR =================
const getDailyMenuHandler = (req: Request, res: Response) => {
  const dateQuery = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const daily = db.getDailyMenu(dateQuery);
  return res.json(daily);
};
apiRouter.get('/daily-menu', getDailyMenuHandler);
apiRouter.get('/admin/daily-menu', getDailyMenuHandler);

const postDailyMenuHandler = (req: Request, res: Response) => {
  const { date, itemIds, specialItemIds, notes } = req.body;
  if (!date || !Array.isArray(itemIds)) {
    return res.status(400).json({ error: 'Date and itemIds array are required' });
  }
  const saved = db.saveDailyMenu(date, itemIds, specialItemIds || [], notes || '');
  return res.json(saved);
};
apiRouter.post('/daily-menu', postDailyMenuHandler);
apiRouter.post('/admin/daily-menu', postDailyMenuHandler);

apiRouter.post('/daily-menu/copy-previous', (req: Request, res: Response) => {
  const { targetDate, sourceDate } = req.body;
  if (!targetDate || !sourceDate) {
    return res.status(400).json({ error: 'Target and Source dates are required' });
  }
  const source = db.getDailyMenu(sourceDate);
  const copied = db.saveDailyMenu(targetDate, source.itemIds, source.specialItemIds, `Copied from ${sourceDate}`);
  return res.json(copied);
});

// ================= ORDERS =================
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      studentId,
      studentName,
      studentCollegeId,
      studentEmail,
      studentPhone,
      items,
      paymentMethod,
      notes
    } = req.body;

    if (!studentId || !studentName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing student details or empty items in order' });
    }

    // Verify all items are available
    for (const oi of items) {
      const dbItem = db.getMenuItemById(oi.itemId);
      if (!dbItem) {
        return res.status(400).json({ error: `Item ${oi.nameEnglish || oi.itemId} is no longer valid.` });
      }
      if (!dbItem.isAvailable) {
        return res.status(400).json({ error: `Sorry, "${dbItem.nameEnglish}" is currently out of stock.` });
      }
    }

    const totalAmount = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
    const maxPrepTime = Math.max(...items.map((it: any) => it.preparationTimeMinutes || 5), 5);

    const newOrder = db.createOrder({
      studentId,
      studentName,
      studentCollegeId: studentCollegeId || 'SRM2026',
      studentEmail: studentEmail || 'student@srmmcet.edu.in',
      studentPhone: studentPhone || '',
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'CASH_COUNTER',
      paymentStatus: paymentMethod === 'UPI_DEMO' ? 'PAID' : 'PENDING',
      orderStatus: 'ORDER_PLACED',
      orderDate: new Date().toISOString().split('T')[0],
      estimatedTimeMinutes: maxPrepTime + 2,
      notes: notes || ''
    });

    return res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  if (studentId) {
    const studentOrders = db.getOrdersByStudentId(studentId);
    return res.json(studentOrders);
  }
  // Admin sees all orders
  const allOrders = db.getOrders();
  return res.json(allOrders);
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(order);
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  const updated = db.updateOrderStatus(req.params.id, status, note);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(updated);
});

apiRouter.patch('/orders/:id/payment', (req: Request, res: Response) => {
  const { paymentStatus } = req.body;
  if (!paymentStatus) {
    return res.status(400).json({ error: 'paymentStatus is required' });
  }
  const updated = db.updateOrderPayment(req.params.id, paymentStatus);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(updated);
});

apiRouter.post('/orders/:id/cancel', (req: Request, res: Response) => {
  const { reason } = req.body;
  const updated = db.updateOrderStatus(req.params.id, 'CANCELLED', reason || 'Cancelled by user');
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(updated);
});

// ================= STUDENTS (ADMIN) =================
const getStudentsHandler = (req: Request, res: Response) => {
  const users = db.getUsers().filter((u) => u.role === 'student');
  const orders = db.getOrders();

  const studentList = users.map((u) => {
    const studentOrders = orders.filter((o) => o.studentId === u.id);
    const totalSpent = studentOrders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const lastOrder = studentOrders.length > 0 ? studentOrders[0].createdAt : null;

    const { passwordHash: _, ...safeUser } = u;
    return {
      ...safeUser,
      totalOrders: studentOrders.length,
      totalSpent,
      lastOrder
    };
  });

  return res.json(studentList);
};
apiRouter.get('/students', getStudentsHandler);
apiRouter.get('/admin/students', getStudentsHandler);

const patchStudentStatusHandler = (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = db.updateUser(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const { passwordHash: _, ...safeUser } = updated;
  return res.json(safeUser);
};
apiRouter.patch('/students/:id/status', patchStudentStatusHandler);
apiRouter.patch('/admin/students/:id/status', patchStudentStatusHandler);

// ================= ANALYTICS =================
const getAnalyticsHandler = (req: Request, res: Response) => {
  const stats = db.getAnalytics();
  return res.json(stats);
};
apiRouter.get('/analytics', getAnalyticsHandler);
apiRouter.get('/admin/analytics', getAnalyticsHandler);

// ================= NOTIFICATIONS =================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const notifs = db.getNotifications(userId);
  return res.json(notifs);
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id);
  return res.json({ success });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (userId) {
    db.markAllNotificationsAsRead(userId);
  }
  return res.json({ success: true });
});

// ================= SETTINGS =================
apiRouter.get('/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  return res.json(settings);
});

apiRouter.post('/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// Fallback for unmatched /api routes
apiRouter.all('*', (req: Request, res: Response) => {
  return res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});
