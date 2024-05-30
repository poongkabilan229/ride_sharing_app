// User class to manage user details and their rides
class User {
    constructor(user_detail) {
        this.name = user_detail.name;
        this.age = user_detail.age;
        this.gender = user_detail.gender;
        this.vehicles = [];
        this.offeredRides = [];
        this.takenRides = [];
    }

    // Method to add a vehicle to the user's vehicle list
    addVehicle(vehicle) {
        this.vehicles.push(vehicle);
    }

    // Method to add an offered ride to the user's offered rides list
    offerRide(ride) {
        this.offeredRides.push(ride);
    }

    // Method to add a taken ride to the user's taken rides list
    takeRide(ride) {
        this.takenRides.push(ride);
    }
}

// Vehicle class to manage vehicle details
class Vehicle {
    constructor(user, details) {
        this.owner = user;
        this.details = details;
    }
}

// Ride class to manage ride details and status
class Ride {
    constructor(driver, origin, destination, available_seats, vehicle_number, vehicle_model) {
        this.driver = driver;
        this.origin = origin;
        this.destination = destination;
        this.available_seats = available_seats;
        this.status = 'active'; // Ride status can be 'active', 'full', or 'completed'
        this.vehicle_number = vehicle_number;
        this.vehicle_model = vehicle_model;
    }

    // Method to update the status of the ride
    updateRide(status) {
        this.status = status;
    }
}

// RideSharingApp class to manage the overall application logic
class RideSharingApp {
    constructor() {
        this.users = [];
        this.rides = [];
    }

    // Method to add a new user to the application
    addUser(userDetail) {
        const user = new User(userDetail);
        this.users.push(user);
        return user;
    }

    // Method to add a vehicle for a user
    addVehicle(user, vehicleDetail) {
        const vehicle = new Vehicle(user, vehicleDetail);
        user.addVehicle(vehicle);
    }

    // Method to allow a user to offer a ride
    offerRide(user, rideDetail) {
        // Check if the vehicle belongs to the user
        let vehicle_number_detail = user.vehicles.find(v => v.details.vehicle_number === rideDetail.vehicle_number);
        if (!vehicle_number_detail) return new Error('vehicle_number not found');

        // Check if a ride with the same vehicle is already offered and active or full
        let offer_ride_check = user.offeredRides.find(r => r.vehicle_number === rideDetail.vehicle_number && (r.status === 'active' || r.status === 'full'));
        if (offer_ride_check) return new Error('Vehicle ride already offered');

        // Create and add the new ride
        const ride = new Ride(user, rideDetail.origin, rideDetail.destination, rideDetail.available_seats, rideDetail.vehicle_number, rideDetail.vehicle_model);
        user.offerRide(ride);
        this.rides.push(ride);
    }

    // Method to allow a user to select a ride
    selectRide(user, {origin, destination, available_seats, preferred_vehicle = null, vacant_mode = null}) {
        // Find available rides that match the criteria
        let availableRides = this.rides.filter(ride => ride.origin === origin && ride.destination === destination && ride.available_seats >= available_seats && ride.status === 'active');
        
        // Filter by preferred vehicle if specified
        if (preferred_vehicle) availableRides = availableRides.filter(ride => ride.vehicle_model === preferred_vehicle);
        
        // Sort by most vacant if specified
        if (vacant_mode === "Most Vacant") availableRides.sort((a, b) => b.available_seats - a.available_seats);

        // If no direct rides are available, search for multiple rides
        if (availableRides.length === 0) {
            const multiRidePath = this.findMultiRidePath(origin, destination, available_seats, preferred_vehicle);
            if (multiRidePath) {
                multiRidePath.forEach(ride => {
                    ride.available_seats -= available_seats;
                    if (ride.available_seats === 0) {
                        ride.updateRide('full');
                    }
                    user.takeRide(ride);
                });
                return multiRidePath.map(ride => ({
                    driver: ride.driver.name,
                    vehicleNumber: ride.vehicle_number,
                    origin: ride.origin,
                    destination: ride.destination
                }));
            }
            return 'No rides found';
        }

        // Select the most suitable ride
        const selectedRide = availableRides[0];
        selectedRide.available_seats -= available_seats;
        if (selectedRide.available_seats === 0) {
            selectedRide.updateRide('full');
        }
        user.takeRide(selectedRide);
        return selectedRide;
    }

    // Method to find a path using multiple rides if no direct ride is available
    findMultiRidePath(origin, destination, seats, preferred_vehicle) {
        const graph = this.buildGraph(seats, preferred_vehicle);
        const visited = new Set();
        const path = [];

        // Depth-First Search (DFS) implementation
        const dfs = (current, destination) => {
            if (current === destination) {
                return true;
            }
            visited.add(current);

            for (const next of graph[current] || []) {
                if (!visited.has(next.destination)) {
                    path.push(next);
                    if (dfs(next.destination, destination)) {
                        return true;
                    }
                    path.pop();
                }
            }

            return false;
        };

        // Start DFS from the origin
        if (dfs(origin, destination)) {
            return path;
        }

        return null;
    }

    // Method to build a graph of rides based on available seats and preferred vehicle
    buildGraph(seats, preferred_vehicle) {
        const graph = {};

        this.rides.forEach(ride => {
            if (ride.available_seats >= seats && ride.status === 'active' && (preferred_vehicle ? ride.vehicle_model === preferred_vehicle : true)) {
                if (!graph[ride.origin]) {
                    graph[ride.origin] = [];
                }
                graph[ride.origin].push(ride);
            }
        });

        return graph;
    }

    // Method to mark a ride as completed
    endRide(rideDetails) {
        const ride = this.rides.find(r => r.origin === rideDetails.origin && r.destination === rideDetails.destination && r.vehicle_number === rideDetails.vehicle_number && r.status !== 'completed');

        if (ride) {
            ride.updateRide('completed');
            return ride;
        } else throw new Error('Ride not found or already ended');
    }

    // Method to print statistics about rides taken and offered by users
    printRideStats() {
        return this.users.map(user => {
            console.log(`${user.name}: ${user.takenRides.length} Taken, ${user.offeredRides.length} Offered`);
            return `${user.name}: ${user.takenRides.length} Taken, ${user.offeredRides.length} Offered`;
        })
    }
}

export default RideSharingApp;
