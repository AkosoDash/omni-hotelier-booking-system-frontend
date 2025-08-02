import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ReservationList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/reservations");
      setBookings(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/reservations/${id}/status`, { status });
      // Update local state to reflect the change
      setBookings(
        bookings.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking:", error);
      alert(error.response?.data?.message || "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reservation List</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {booking.room_type?.room_name} - {booking.guest_name}
                  </h2>
                  <p className="text-gray-600">
                    {new Date(booking.checkin_date).toLocaleDateString()} -
                    {new Date(booking.checkout_date).toLocaleDateString()}
                  </p>
                  <p
                    className={`font-medium ${
                      booking.status === "confirmed"
                        ? "text-green-600"
                        : booking.status === "canceled"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Status: {booking.status}
                  </p>
                </div>

                {booking.status === "pending" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        updateBookingStatus(booking.id, "confirmed")
                      }
                      disabled={updatingId === booking.id}
                      className={`px-3 py-1 rounded text-white ${
                        updatingId === booking.id
                          ? "bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updatingId === booking.id ? "Processing..." : "Confirm"}
                    </button>
                    <button
                      onClick={() =>
                        updateBookingStatus(booking.id, "canceled")
                      }
                      disabled={updatingId === booking.id}
                      className={`px-3 py-1 rounded text-white ${
                        updatingId === booking.id
                          ? "bg-gray-400"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {updatingId === booking.id ? "Processing..." : "Cancel"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
