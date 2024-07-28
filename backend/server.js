const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const Dish = require('./models/Dish');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/dishes', { useNewUrlParser: true, useUnifiedTopology: true });

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001", // Allow requests from frontend
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/dishes', async (req, res) => {
  const dishes = await Dish.find();
  res.json(dishes);
});

app.post('/dishes/toggle', async (req, res) => {
  const { dishId } = req.body;
  const dish = await Dish.findOne({ dishId });
  if (dish) {
    dish.isPublished = !dish.isPublished;
    await dish.save();
    io.emit('update', dish);
    res.json(dish);
  } else {
    res.status(404).json({ message: 'Dish not found' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize database with provided data
const initialDishes = [
  {
    dishName: "Jeera Rice",
    dishId: "1",
    imageUrl: "https://nosh-assignment.s3.ap-south-1.amazonaws.com/jeera-rice.jpg",
    isPublished: true
  },
  {
    dishName: "Paneer Tikka",
    dishId: "2",
    imageUrl: "https://nosh-assignment.s3.ap-south-1.amazonaws.com/paneer-tikka.jpg",
    isPublished: true
  },
  {
    dishName: "Rabdi",
    dishId: "3",
    imageUrl: "https://nosh-assignment.s3.ap-south-1.amazonaws.com/rabdi.jpg",
    isPublished: true
  },
  {
    dishName: "Chicken Biryani",
    dishId: "4",
    imageUrl: "https://nosh-assignment.s3.ap-south-1.amazonaws.com/chicken-biryani.jpg",
    isPublished: true
  },
  {
    dishName: "Alfredo Pasta",
    dishId: "5",
    imageUrl: "https://nosh-assignment.s3.ap-south-1.amazonaws.com/alfredo-pasta.jpg",
    isPublished: true
  }
];

Dish.insertMany(initialDishes)
  .then(() => {
    console.log('Database initialized with dishes');
  })
  .catch(err => {
    console.error('Error initializing database:', err);
  });
