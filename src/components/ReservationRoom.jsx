import React, { useState } from "react";
import api from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function ReservationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    checkin: "",
    checkout: "",
    guest_name: "",
    guest_email: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to validate dates
  const validateDates = () => {
    if (!formData.checkin || !formData.checkout) {
      return "Please select both check-in and check-out dates";
    }

    const checkinDate = new Date(formData.checkin);
    const checkoutDate = new Date(formData.checkout);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form data
    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    if (!formData.guest_name.trim()) {
      setError("Guest name is required");
      return;
    }

    if (!formData.guest_email.trim()) {
      setError("Guest email is required");
      return;
    }

    if (!validateEmail(formData.guest_email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the payload
      const payload = {
        room_type_id: parseInt(id),
        guest_name: formData.guest_name.trim(),
        guest_email: formData.guest_email.trim(),
        checkin_date: formData.checkin,
        checkout_date: formData.checkout,
      };

      await api.post("/reservations", payload);

      navigate("/my-bookings");
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat();
          setError(errorMessages.join(", "));
        } else {
          setError(err.response.data.message || "Validation failed");
        }
      } else if (err.response?.status === 401) {
        setError("Please log in to make a booking");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Booking failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6">Book Room</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Guest Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Guest Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="guest_name"
            value={formData.guest_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter full name"
            required
          />
        </div>

        {/* Guest Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Guest Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="guest_email"
            value={formData.guest_email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter email address"
            required
          />
        </div>

        {/* Check-in Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Check-in Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="checkin"
            value={formData.checkin}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Check-out Date */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Check-out Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="checkout"
            value={formData.checkout}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
            min={formData.checkin || new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white py-3 rounded font-medium transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {isSubmitting ? "Processing Booking..." : "Confirm Booking"}
        </button>
      </form>

      {/* Optional: Show booking summary */}
      {formData.checkin && formData.checkout && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700 mb-2">Booking Summary</h3>
          <p className="text-sm text-gray-600">
            <strong>Guest:</strong> {formData.guest_name || "Not specified"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {formData.guest_email || "Not specified"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Check-in:</strong>{" "}
            {formData.checkin
              ? new Date(formData.checkin).toLocaleDateString()
              : "Not selected"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Check-out:</strong>{" "}
            {formData.checkout
              ? new Date(formData.checkout).toLocaleDateString()
              : "Not selected"}
          </p>
          {formData.checkin && formData.checkout && (
            <p className="text-sm text-gray-600">
              <strong>Duration:</strong>{" "}
              {Math.ceil(
                (new Date(formData.checkout) - new Date(formData.checkin)) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              night(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
