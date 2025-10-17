// backend/routes/rooms.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

/**
 * Room Management Routes
 * REST endpoints for creating and managing study rooms
 */

/**
 * Create a new study room
 * POST /api/rooms/create
 */
router.post('/create', async (req, res) => {
  try {
    const { title, memberIds = [], concepts = [], maxMembers = 6 } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Room title is required' });
    }

    const room = {
      id: `room:${uuidv4()}`,
      title: title.trim(),
      members: memberIds,
      concepts,
      maxMembers,
      createdAt: new Date().toISOString(),
      currentPath: [],
      status: 'active'
    };

    // Store in database
    await req.db.read();
    if (!req.db.data.rooms) {
      req.db.data.rooms = [];
    }
    req.db.data.rooms.push(room);
    await req.db.write();

    res.json({
      ok: true,
      room,
      message: 'Room created successfully'
    });

  } catch (error) {
    console.error('❌ Create room error:', error);
    res.status(500).json({
      error: 'Failed to create room',
      message: error.message
    });
  }
});

/**
 * Get room by ID
 * GET /api/rooms/:id
 */
router.get('/:id', async (req, res) => {
  try {
    await req.db.read();
    const room = req.db.data.rooms?.find(r => r.id === req.params.id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);

  } catch (error) {
    console.error('❌ Get room error:', error);
    res.status(500).json({
      error: 'Failed to get room',
      message: error.message
    });
  }
});

/**
 * List all active rooms
 * GET /api/rooms
 */
router.get('/', async (req, res) => {
  try {
    await req.db.read();
    const rooms = req.db.data.rooms || [];

    // Filter by status if provided
    const { status = 'active' } = req.query;
    const filteredRooms = rooms.filter(r => r.status === status);

    res.json({
      ok: true,
      rooms: filteredRooms,
      count: filteredRooms.length
    });

  } catch (error) {
    console.error('❌ List rooms error:', error);
    res.status(500).json({
      error: 'Failed to list rooms',
      message: error.message
    });
  }
});

/**
 * Update room
 * PATCH /api/rooms/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await req.db.read();
    const roomIndex = req.db.data.rooms?.findIndex(r => r.id === id);

    if (roomIndex === -1 || roomIndex === undefined) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Apply updates
    req.db.data.rooms[roomIndex] = {
      ...req.db.data.rooms[roomIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await req.db.write();

    res.json({
      ok: true,
      room: req.db.data.rooms[roomIndex],
      message: 'Room updated successfully'
    });

  } catch (error) {
    console.error('❌ Update room error:', error);
    res.status(500).json({
      error: 'Failed to update room',
      message: error.message
    });
  }
});

/**
 * Delete/close room
 * DELETE /api/rooms/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await req.db.read();
    const roomIndex = req.db.data.rooms?.findIndex(r => r.id === id);

    if (roomIndex === -1 || roomIndex === undefined) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Mark as closed instead of deleting
    req.db.data.rooms[roomIndex].status = 'closed';
    req.db.data.rooms[roomIndex].closedAt = new Date().toISOString();

    await req.db.write();

    res.json({
      ok: true,
      message: 'Room closed successfully'
    });

  } catch (error) {
    console.error('❌ Delete room error:', error);
    res.status(500).json({
      error: 'Failed to close room',
      message: error.message
    });
  }
});

/**
 * Join room (add member)
 * POST /api/rooms/:id/join
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await req.db.read();
    const room = req.db.data.rooms?.find(r => r.id === id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'active') {
      return res.status(400).json({ error: 'Room is not active' });
    }

    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({ error: 'Room is full' });
    }

    if (room.members.includes(userId)) {
      return res.status(400).json({ error: 'User already in room' });
    }

    room.members.push(userId);
    room.updatedAt = new Date().toISOString();

    await req.db.write();

    res.json({
      ok: true,
      room,
      message: 'Joined room successfully'
    });

  } catch (error) {
    console.error('❌ Join room error:', error);
    res.status(500).json({
      error: 'Failed to join room',
      message: error.message
    });
  }
});

/**
 * Leave room (remove member)
 * POST /api/rooms/:id/leave
 */
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await req.db.read();
    const room = req.db.data.rooms?.find(r => r.id === id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.members = room.members.filter(id => id !== userId);
    room.updatedAt = new Date().toISOString();

    await req.db.write();

    res.json({
      ok: true,
      room,
      message: 'Left room successfully'
    });

  } catch (error) {
    console.error('❌ Leave room error:', error);
    res.status(500).json({
      error: 'Failed to leave room',
      message: error.message
    });
  }
});

module.exports = router;

