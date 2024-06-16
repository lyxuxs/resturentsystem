// index.js
const cors = require('cors');
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = "your_jwt_secret"; // Replace with a strong, random secret

app.use(cors());

app.use(express.json());

// Create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, role, password,branches } = req.body;

    // Hash the password before storing in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        branches
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user by ID
app.put("/api/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, role, password } = req.body;

  try {
    // Hash the new password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        role,
        password: hashedPassword || undefined, // Update password only if provided
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user by ID
app.delete("/api/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/branches", async (req, res) => {
  try {
    const { name } = req.body;

    const newBranch = await prisma.branch.create({
      data: {
        name,
      },
    });

    res.status(201).json(newBranch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create branch" });
  }
});

// Get all branches
app.get("/api/branches", async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

// Add branch to user
app.put("/api/users/:userId/add-branch/:branchId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const branchId = parseInt(req.params.branchId);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const branch = await prisma.branch.findUnique({
      where: {
        id: branchId,
      },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Add branch to user
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        branches: {
          connect: {
            id: branchId,
          },
        },
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add branch to user" });
  }
});

// Remove branch from user
app.put("/api/users/:userId/remove-branch/:branchId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const branchId = parseInt(req.params.branchId);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove branch from user
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        branches: {
          disconnect: {
            id: branchId,
          },
        },
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove branch from user" });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const { name, description, qty, unitPrice } = req.body;

    const newInventoryItem = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        qty,
        unitPrice,
      },
    });

    res.status(201).json(newInventoryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create inventory item" });
  }
});

// Get all inventory items
app.get("/api/inventory", async (req, res) => {
  try {
    const inventoryItems = await prisma.inventoryItem.findMany();
    res.json(inventoryItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch inventory items" });
  }
});

// Get inventory item by ID
app.get("/api/inventory/:id", async (req, res) => {
  const inventoryItemId = parseInt(req.params.id);

  try {
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: inventoryItemId,
      },
    });

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
});

// Update inventory item by ID
app.put("/api/inventory/:id", async (req, res) => {
  const inventoryItemId = parseInt(req.params.id);
  const { name, description, qty, unitPrice } = req.body;

  try {
    const updatedInventoryItem = await prisma.inventoryItem.update({
      where: {
        id: inventoryItemId,
      },
      data: {
        name,
        description,
        qty,
        unitPrice,
      },
    });

    res.json(updatedInventoryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

// Delete inventory item by ID
app.delete("/api/inventory/:id", async (req, res) => {
  const inventoryItemId = parseInt(req.params.id);

  try {
    await prisma.inventoryItem.delete({
      where: {
        id: inventoryItemId,
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

// Create a new menu item
app.post("/api/menu-items", async (req, res) => {
  try {
    const { name, description, price, review, userCount } = req.body;

    const newMenuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        review,
        userCount,
      },
    });

    res.status(201).json(newMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

// Get all menu items
app.get("/api/menu-items", async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany();
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// Get menu item by ID
app.get("/api/menu-items/:id", async (req, res) => {
  const menuItemId = parseInt(req.params.id);

  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: menuItemId,
      },
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
});

// Update menu item by ID
app.put("/api/menu-items/:id", async (req, res) => {
  const menuItemId = parseInt(req.params.id);
  const { name, description, price, review, userCount } = req.body;

  try {
    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: menuItemId,
      },
      data: {
        name,
        description,
        price,
        review,
        userCount,
      },
    });

    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

// Delete menu item by ID
app.delete("/api/menu-items/:id", async (req, res) => {
  const menuItemId = parseInt(req.params.id);

  try {
    await prisma.menuItem.delete({
      where: {
        id: menuItemId,
      },
    });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

app.post('/api/orders', async (req, res) => {
    try {
      const { userId, items } = req.body;
  
      // Calculate total price based on items
      let totalPrice = 0;
      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: {
            id: item.menuItemId,
          },
        });
  
        if (!menuItem) {
          return res.status(400).json({ error: `Menu item with ID ${item.menuItemId} not found` });
        }
  
        totalPrice += menuItem.price * item.quantity;
      }
  
      const newOrder = await prisma.order.create({
        data: {
          datetime: new Date(),
          orderNumber: generateOrderNumber(), // You can implement your own order number generation function
          total: totalPrice,
          userId,
          items: {
            create: items.map(item => ({
              quantity: item.quantity,
              menuItemId: item.menuItemId,
            })),
          },
        },
        include: {
          items: true,
        },
      });
  
      res.status(201).json(newOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });
  
// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get order by ID
app.get("/api/orders/:id", async (req, res) => {
  const orderId = parseInt(req.params.id);

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Function to generate unique order number (example implementation)
function generateOrderNumber() {
  return "ORD" + Math.floor(100000 + Math.random() * 900000);
}

app.post("/api/reviews", async (req, res) => {
  try {
    const { userId, menuItemId, rating, comment } = req.body;

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        menuItemId,
      },
    });

    // Update menu item average review and user count
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: menuItemId,
      },
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const totalReviews = menuItem.userCount * menuItem.review + rating;
    menuItem.userCount += 1;
    menuItem.review = totalReviews / menuItem.userCount;

    await prisma.menuItem.update({
      where: {
        id: menuItemId,
      },
      data: {
        review: menuItem.review,
        userCount: menuItem.userCount,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Get all reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Get reviews for a specific menu item
app.get("/api/menu-items/:menuItemId/reviews", async(req, res) => {
  const menuItemId = parseInt(req.params.menuItemId);

  try {
    const reviews = await prisma.review.findMany({
      where: {
        menuItemId,
      },
      include: {
        user: true,
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews for menu item" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
