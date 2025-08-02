import { useState, useEffect } from "react";
import API from "../services/api";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get("/room-types");
        console.log(response.data);
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={room.image_url}
              alt={room.room_name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{room.room_name}</h2>
              <p className="text-gray-600 mt-2 mb-4">
                Rp {room.rates.toLocaleString()}/night
              </p>
              <div className="flex items-center justify-between gap-x-4">
                <a
                  href={`/room/${room.id}`}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                >
                  See Room Detail
                </a>
                <a
                  href={`/reservation/${room.id}`}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
