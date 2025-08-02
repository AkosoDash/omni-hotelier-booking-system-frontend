import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoomList from "./components/RoomList";
import RoomDetail from "./components/RoomDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import UserBooking from "./components/UserBooking";
import BookRoom from "./components/BookRoom";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<RoomList />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<UserBooking />} />
          <Route path="/book-room/:id" element={<BookRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
