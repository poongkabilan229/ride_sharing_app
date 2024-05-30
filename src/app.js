
class User {
    constructor(user_detail) {
        this.name = user_detail.name;
        this.age = user_detail.age;
        this.gender = user_detail.gender;
        this.vehicles = [];
        this.offeredRides = [];
        this.takenRides = [];
    }

    addVehicle(vehicle) {
        this.vehicles.push(vehicle);
    }

    offerRide(ride) {
        this.offeredRides.push(ride);
    }

    takeRide(ride) {
        this.takenRides.push(ride);
    }
}

class Vehicle {
    constructor(user, details) {
        this.owner = user;
        this.details = details;
    }
}

class Ride {
    constructor(driver, origin, destination, available_seats, vehicle_number, vehicle_model) {
        this.driver = driver;
        this.origin = origin;
        this.destination = destination;
        this.available_seats = available_seats;
        this.status = 'active'; // ['active', 'full', 'completed']
        this.vehicle_number = vehicle_number
        this.vehicle_model = vehicle_model
    }

    

    updateRide(status) {
        this.status = status;
    }
}

class RideSharingApp {
    constructor() {
        this.users = [];
        this.rides = [];
    }

    addUser(userDetail) {
        const user = new User(userDetail);
        this.users.push(user);
        return user;
    }

    addVehicle(user, vehicleDetail) {
        const vehicle = new Vehicle(user, vehicleDetail);
        user.addVehicle(vehicle);
    }

    offerRide(user, rideDetail) {
        // console.log('user vehicles---',user)
        let vehicle_number_detail = user.vehicles.find(v => v.details.vehicle_number === rideDetail.vehicle_number);
        // console.log('vehicle---',vehicle_number_detail)
        if (!vehicle_number_detail) return new Error('vehicle_number not found');

        let offer_ride_check = user.offeredRides.find(r => r.vehicle_number === rideDetail.vehicle_number && (r.status === 'active' || r.status === 'full'));
        if(offer_ride_check) return new Error('Vehicle ride already offered')
        const ride = new Ride(user, rideDetail.origin, rideDetail.destination, rideDetail.available_seats, rideDetail.vehicle_number, rideDetail.vehicle_model);
        user.offerRide(ride);
        this.rides.push(ride);
        // console.log('Ride offered successfully', this.rides);

    }

    selectRide(user, {origin, destination, available_seats, preferred_vehicle=null, vacant_mode=null}) {
        let availableRides = this.rides.filter(ride => ride.origin === origin && ride.destination === destination && ride.available_seats >= available_seats && ride.status==='active');

        if(preferred_vehicle) availableRides = availableRides.filter(ride => ride.vehicle_model === preferred_vehicle);

        if(vacant_mode="Most Vacant") availableRides.sort((a, b) => b.available_seats - a.available_seats);

        if (availableRides.length === 0) {
            // No direct rides available, search for multiple rides
            const multiRidePath = this.findMultiRidePath(origin, destination, available_seats, preferred_vehicle);
            // console.log('multiRidePath', multiRidePath);
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
                    vehicleNumber: ride.vehicleNumber,
                    origin: ride.origin,
                    destination: ride.destination
                }));
            }
            return 'No rides found';
        }

        const selectedRide = availableRides[0];
        selectedRide.available_seats -= available_seats;
        if (selectedRide.available_seats === 0) {
            selectedRide.updateRide('full');
        }
        user.takeRide(selectedRide);
        return selectedRide;
    }

    findMultiRidePath(origin, destination, seats, preferred_vehicle) {
        const graph = this.buildGraph(seats, preferred_vehicle);
        // console.log('graph', graph);
        const visited = new Set();
        const path = [];

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

        if (dfs(origin, destination)) {
            return path;
        }

        return null;
    }

    buildGraph(seats,preferred_vehicle) {
        const graph = {};

        this.rides.forEach(ride => {
            if (ride.available_seats >= seats && ride.status === 'active' && preferred_vehicle?ride.vehicle_model===preferred_vehicle:true) {
                if (!graph[ride.origin]) {
                    graph[ride.origin] = [];
                }
                graph[ride.origin].push(ride);
            }
        });

        return graph;
    }

    endRide(rideDetails) {
        const ride = this.rides.find(r => r.origin === rideDetails.origin && r.destination === rideDetails.destination && r.vehicle_number === rideDetails.vehicle_number && r.status!='completed');

        if (ride) {
            ride.updateRide('completed');
            return ride
        }
        else throw new Error('Ride not found or already ended')
        
    }

    printRideStats() {
        // this.users.forEach(user => {
        //     console.log(`${user.name}: ${user.takenRides.length} Taken, ${user.offeredRides.length} Offered`);
        // });
        return this.users.map(user => {
            console.log(`${user.name}: ${user.takenRides.length} Taken, ${user.offeredRides.length} Offered`);
            return `${user.name}: ${user.takenRides.length} Taken, ${user.offeredRides.length} Offered`;
        })
    }
}

export default RideSharingApp;
