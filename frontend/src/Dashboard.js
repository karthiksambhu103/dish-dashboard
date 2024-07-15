import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const Dashboard = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetchDishes();
    socket.on('update', (updatedDish) => {
      setDishes(prevDishes =>
        prevDishes.map(dish => dish.dishId === updatedDish.dishId ? updatedDish : dish)
      );
    });
    return () => {
      socket.off('update');
    };
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/dishes');
      setDishes(response.data);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };

  const togglePublish = async (dishId) => {
    try {
      await axios.post('http://localhost:3000/dishes/toggle', { dishId });
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  return (
    <div>
      {dishes.map(dish => (
        <div key={dish.dishId}>
          <img src={dish.imageUrl} alt={dish.dishName} style={{ width: '100px', height: '100px' }} />
          <h3>{dish.dishName}</h3>
          <p>{dish.isPublished ? 'Published' : 'Unpublished'}</p>
          <button onClick={() => togglePublish(dish.dishId)}>Toggle Publish</button>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
