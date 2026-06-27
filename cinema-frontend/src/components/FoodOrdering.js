import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'https://cinema-backend-h2dshubncabkcdfp.centralindia-01.azurewebsites.net';

function FoodOrdering() {
  const [foodItems, setFoodItems] = useState([]);
  const [foodSizes, setFoodSizes] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [myOrders, setMyOrders] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const [itemsRes, sizesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/fooditems`),
          axios.get(`${API_BASE_URL}/fooditemsizes`)
        ]);
        setFoodItems(itemsRes.data);
        setFoodSizes(sizesRes.data);
      } catch (err) {
        setError('Failed to load food menu.');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
    if (user) fetchMyOrders();
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/food/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyOrders(res.data);
    } catch (err) {
      console.error('Could not fetch orders', err);
    }
  };

  const addToCart = (itemId, sizeId, sizeName, rate) => {
    const item = foodItems.find(f => f.item_id === itemId);
    setCart([...cart, {
      item_id: itemId,
      name: item.name,
      size_id: sizeId,
      size_name: sizeName,
      rate: rate,
      quantity: 1
    }]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.rate, 0);

  const placeOrder = async () => {
    if (!user) {
      setOrderMessage('Please login to place an order.');
      return;
    }
    if (cart.length === 0) {
      setOrderMessage('Your cart is empty.');
      return;
    }
    const orderItems = cart.map(item => ({
      food_item_id: item.item_id,
      size_id: item.size_id,
      quantity: item.quantity
    }));
    try {
      const res = await axios.post(`${API_BASE_URL}/food/order`, { items: orderItems }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderMessage(`✅ Order placed! Order ID: ${res.data.order_id}, Total: ₹${res.data.total}`);
      setCart([]);
      fetchMyOrders();
      setTimeout(() => setOrderMessage(''), 5000);
    } catch (err) {
      setOrderMessage('❌ Failed to place order. ' + (err.response?.data?.detail || ''));
    }
  };

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>🍿 Food Menu</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {foodItems.map(item => (
          <div key={item.item_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><strong>Combo:</strong> {item.is_combo === 'TRUE' ? '✅ Yes' : '❌ No'}</p>
            <h4>Sizes:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {foodSizes.filter(s => s.item_id === item.item_id).map(size => (
                <li key={size.size_id} style={{ marginBottom: '8px' }}>
                  <strong>{size.size_name}</strong> – ₹{size.rate}
                  <button onClick={() => addToCart(item.item_id, size.size_id, size.size_name, size.rate)}
                          style={{ marginLeft: '10px', padding: '4px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
        <h2>🛒 Your Cart</h2>
        {cart.length === 0 ? <p>Cart is empty.</p> : (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cart.map((item, index) => (
                <li key={index} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {item.name} ({item.size_name}) – ₹{item.rate}
                  <button onClick={() => removeFromCart(index)}
                          style={{ marginLeft: '10px', padding: '2px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <h3>Total: ₹{getTotal()}</h3>
            {user ? (
              <button onClick={placeOrder}
                      style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                Place Order
              </button>
            ) : (
              <p style={{ color: 'red' }}>Please login to place an order.</p>
            )}
            {orderMessage && <p style={{ marginTop: '10px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>{orderMessage}</p>}
          </>
        )}
      </div>

      {user && (
        <div style={{ marginTop: '30px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
          <h2>📦 My Orders</h2>
          {myOrders.length === 0 ? <p>No orders yet.</p> : (
            <ul>
              {myOrders.map(order => (
                <li key={order.order_id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                  <strong>Order #{order.order_id}</strong> – ₹{order.total_amount} – {order.status} – {new Date(order.order_datetime).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default FoodOrdering;