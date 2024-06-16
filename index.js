// index.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong, random secret

app.use(express.json());

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Hash the password before storing in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user by ID
app.put('/api/users/:id', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/branches', async (req, res) => {
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
      res.status(500).json({ error: 'Failed to create branch' });
    }
  });
  
  // Get all branches
  app.get('/api/branches', async (req, res) => {
    try {
      const branches = await prisma.branch.findMany();
      res.json(branches);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch branches' });
    }
  });
  
  // Add branch to user
  app.put('/api/users/:userId/add-branch/:branchId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const branchId = parseInt(req.params.branchId);
  
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const branch = await prisma.branch.findUnique({
        where: {
          id: branchId,
        },
      });
  
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
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
      res.status(500).json({ error: 'Failed to add branch to user' });
    }
  });
  
  // Remove branch from user
  app.put('/api/users/:userId/remove-branch/:branchId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const branchId = parseInt(req.params.branchId);
  
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
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
      res.status(500).json({ error: 'Failed to remove branch from user' });
    }
  });



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
