import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { pgs, rooms } from "@/lib/data"
import { Search } from "lucide-react"

export default function BedsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bed Availability</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bed Availability Tracker</CardTitle>
            <CardDescription>Real-time status of beds across all properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search rooms..." className="pl-8" />
              </div>
              <select className="border rounded-md h-10 px-3 py-2">
                <option value="">All Properties</option>
                {pgs.map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.name}
                  </option>
                ))}
              </select>
              <select className="border rounded-md h-10 px-3 py-2">
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pgs.map((property) => {
                const propertyRooms = rooms.filter((room) => room.pg_id === property.id)

                return (
                  <Card key={property.id} className="overflow-hidden">
                    <CardHeader className="bg-secondary p-4">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <CardDescription>
                        {property.available_beds} beds available out of{" "}
                        {propertyRooms.reduce((sum, room) => sum + room.total_beds, 0)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {propertyRooms.map((room) => (
                          <div key={room.id} className="border rounded-md p-3">
                            <div className="font-medium">Room {room.room_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {room.available_beds} of {room.total_beds} beds available
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-1">
                              {Array.from({ length: room.total_beds }).map((_, index) => {
                                const isOccupied = index >= room.available_beds
                                return (
                                  <div
                                    key={index}
                                    className={`h-6 rounded-sm ${isOccupied ? "bg-primary" : "bg-muted"}`}
                                    title={`Bed ${index + 1}: ${isOccupied ? "Occupied" : "Available"}`}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
