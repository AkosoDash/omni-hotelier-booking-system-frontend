import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState({
    checkin: "",
    checkout: "",
    guest_name: "",
    guest_email: "",
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/room-types/${id}`);
        console.log(response.data.data);
        setRoom(response.data.data);
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, navigate]);

  // Helper function to validate dates
  const validateDates = () => {
    if (!bookingData.checkin || !bookingData.checkout) {
      return "Please select both check-in and check-out dates";
    }

    const checkinDate = new Date(bookingData.checkin);
    const checkoutDate = new Date(bookingData.checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkinDate < today) {
      return "Check-in date cannot be in the past";
    }

    if (checkoutDate <= checkinDate) {
      return "Check-out date must be after check-in date";
    }

    return null;
  };

  // Helper function to validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Calculate number of nights and total price
  const calculateBookingDetails = () => {
    if (!bookingData.checkin || !bookingData.checkout || !room) {
      return { nights: 0, totalPrice: 0 };
    }

    const checkinDate = new Date(bookingData.checkin);
    const checkoutDate = new Date(bookingData.checkout);
    const nights = Math.ceil(
      (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * room.rates;

    return { nights, totalPrice };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleBooking = async () => {
    setError("");

    // Validate form data
    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    if (!bookingData.guest_name.trim()) {
      setError("Guest name is required");
      return;
    }

    if (!bookingData.guest_email.trim()) {
      setError("Guest email is required");
      return;
    }

    if (!validateEmail(bookingData.guest_email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        room_type_id: parseInt(id),
        guest_name: bookingData.guest_name.trim(),
        guest_email: bookingData.guest_email.trim(),
        checkin_date: bookingData.checkin,
        checkout_date: bookingData.checkout,
      };

      const response = await api.post("/reservations", payload);

      navigate("/my-bookings");
    } catch (error) {
      console.error("Booking error:", error);

      // Handle different types of errors
      if (error.response?.status === 422) {
        // Validation errors from Laravel
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat();
          setError(errorMessages.join(", "));
        } else {
          setError(error.response.data.message || "Validation failed");
        }
      } else if (error.response?.status === 401) {
        setError("Please log in to make a booking");
        navigate("/login");
      } else {
        setError(
          error.response?.data?.message || "Booking failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const { nights, totalPrice } = calculateBookingDetails();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading room details...</span>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">Room not found</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Room Details Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {room.image_url && (
            <img
              src={room.image_url}
              alt={room.room_name}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {room.room_name}
                </h1>
                <p className="text-2xl text-blue-600 font-semibold mt-2">
                  Rp {room.rates?.toLocaleString()}/night
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Rooms
              </button>
            </div>

            {/* Room Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {room.capacity && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Capacity:</span>
                  <span className="ml-2">{room.capacity} guests</span>
                </div>
              )}
              {room.bed_type && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Bed Type:</span>
                  <span className="ml-2">{room.bed_type}</span>
                </div>
              )}
              {room.size && (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Size:</span>
                  <span className="ml-2">{room.size} m²</span>
                </div>
              )}
            </div>

            {room.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {room.description}
                </p>
              </div>
            )}

            {room.amenities && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Amenities
                </h3>
                <p className="text-gray-600">{room.amenities}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Book This Room
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-4">
              {/* Guest Information */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Guest Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="guest_name"
                  value={bookingData.guest_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Guest Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="guest_email"
                  value={bookingData.guest_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Check-in Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkin"
                    value={bookingData.checkin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Check-out Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkout"
                    value={bookingData.checkout}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                    min={
                      bookingData.checkin ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{room.room_name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Guest:</span>
                  <span className="font-medium">
                    {bookingData.guest_name || "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-sm">
                    {bookingData.guest_email || "Not specified"}
                  </span>
                </div>

                {bookingData.checkin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {new Date(bookingData.checkin).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {bookingData.checkout && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {new Date(bookingData.checkout).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {nights > 0 && (
                  <>
                    <hr className="my-3" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate per night:</span>
                      <span className="font-medium">
                        Rp {room.rates?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                      <span>Total Price:</span>
                      <span>Rp {totalPrice.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={
                  isSubmitting ||
                  !bookingData.checkin ||
                  !bookingData.checkout ||
                  !bookingData.guest_name ||
                  !bookingData.guest_email
                }
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting ||
                  !bookingData.checkin ||
                  !bookingData.checkout ||
                  !bookingData.guest_name ||
                  !bookingData.guest_email
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                }`}
              >
                {isSubmitting ? "Processing Booking..." : "Confirm Booking"}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                By confirming this booking, you agree to our terms and
                conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Room Information */}
        {(room.policies || room.facilities) && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {room.policies && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Policies
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {room.policies}
                  </p>
                </div>
              )}

              {room.facilities && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Facilities
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {room.facilities}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
