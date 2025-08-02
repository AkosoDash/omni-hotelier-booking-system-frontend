import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoomList from "./components/RoomList";
import RoomDetail from "./components/RoomDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import ReservationList from "./components/ReservationList";
import BookRoom from "./components/ReservationRoom";
import ReservationRoom from "./components/ReservationRoom";

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
          <Route path="/reservation-list" element={<ReservationList />} />
          <Route path="/reservation-room/:id" element={<ReservationRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
