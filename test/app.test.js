import { expect } from 'chai';
import RideSharingApp from '../src/app.js';

describe('RideSharingApp', function() {
    let app;
    let user1, user2, user3, user4, user5, user6;

    it('initialise app and add users', function() {
        app = new RideSharingApp();
        user1 = app.addUser({ name: 'Rohan', gender: 'M', age: 36 });
        user2 = app.addUser({ name: 'Shashank', gender: 'M', age: 29 });
        user3 = app.addUser({ name: 'Nandhini', gender: 'F', age: 29 });
        user4 = app.addUser({ name: 'Shipra', gender: 'F', age: 27 });
        user5 = app.addUser({ name: 'Gaurav', gender: 'M', age: 29 });
        user6 = app.addUser({ name: 'Rahul', gender: 'M', age: 35 });
    })

    it('should add users correctly', function() {
        expect(app.users).to.have.lengthOf(6);
        expect(app.users[0].name).to.equal('Rohan');
        expect(app.users[1].name).to.equal('Shashank');
        expect(app.users[2].name).to.equal('Nandhini');
        expect(app.users[3].name).to.equal('Shipra');
        expect(app.users[4].name).to.equal('Gaurav');
        expect(app.users[5].name).to.equal('Rahul');
    });

    it('should add vehicles for users', function() {
        app.addVehicle(user1, { model: 'Swift', vehicle_number: 'KA-01-12345' });
        expect(user1.vehicles).to.have.lengthOf(1);
        expect(user1.vehicles[0].details.model).to.equal('Swift');

        app.addVehicle(user2, { model: 'Baleno', vehicle_number: 'TS-05-62395' });
        expect(user2.vehicles).to.have.lengthOf(1);
        expect(user2.vehicles[0].details.model).to.equal('Baleno');

        app.addVehicle(user4, { model: 'Polo', vehicle_number: 'KA-05-41491' });
        app.addVehicle(user4, { model: 'Activa', vehicle_number: 'KA-12-12332' });
        app.addVehicle(user6, { model: 'XUV', vehicle_number: 'KA-01-1234' });
        app.addVehicle(user6, { model: 'Safari', vehicle_number: 'KA-12-1233' });
        expect(user4.vehicles).to.have.lengthOf(2);
        expect(user6.vehicles).to.have.lengthOf(2);
        expect(user3.vehicles).to.have.lengthOf(0);
        expect(user5.vehicles).to.have.lengthOf(0);
    });

    it('should allow users to offer rides', function() {
        app.offerRide(user1, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 1,vehicle_model: 'Swift', vehicle_number:'KA-01-12345' });
        expect(user1.offeredRides).to.have.lengthOf(1);
        expect(app.rides).to.have.lengthOf(1);

        app.offerRide(user4, { origin: 'Bangalore', destination: 'Mysore', available_seats: 1, vehicle_model: 'Activa', vehicle_number:'KA-12-12332' });
        expect(user4.offeredRides).to.have.lengthOf(1);
        expect(app.rides).to.have.lengthOf(2);

        app.offerRide(user4, { origin: 'Bangalore', destination: 'Mysore', available_seats: 2, vehicle_number:'KA-05-41491', vehicle_model: 'Polo' });
        expect(user4.offeredRides).to.have.lengthOf(2);
        expect(app.rides).to.have.lengthOf(3);

        app.offerRide(user2, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 2, vehicle_number:'TS-05-62395', vehicle_model: 'Baleno' });
        expect(user2.offeredRides).to.have.lengthOf(1);
        expect(app.rides).to.have.lengthOf(4);

        // app.offerRide(user6, { origin: 'Hyderabad', destination: 'Chennai', available_seats: 2, vehicle_number:'KA-01-1234', vehicle_model: 'XUV' });
        // expect(app.rides).to.have.lengthOf(5);

        // app.offerRide(user6, { origin: 'Chennai', destination: 'Mysore', available_seats: 2, vehicle_number:'KA-12-1233', vehicle_model: 'Safari' });
        // expect(app.rides).to.have.lengthOf(6);
        // app.offerRide(user6, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 5, vehicle_number:'KA-01-1234', vehicle_model: 'XUV' });
        // expect(user6.offeredRides).to.have.lengthOf(1);
        // expect(app.rides).to.have.lengthOf(5);
    });

    it('should fail since a ride has already been offered by this user for this vehicle', function() {
        app.offerRide(user1, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 3, vehicle_number:'KA-01-12345' });
        expect(user1.offeredRides).to.have.lengthOf(1);
        expect(app.rides).to.have.lengthOf(4);
    });

    it('should allow users to select rides', function() {

        // select_ride("Nandini, Origin=Bangalore, Destination=Mysore, Seats=1, Most Vacant") (2(c) is the desired output)
        app.selectRide(user3, { origin: 'Bangalore', destination: 'Mysore', available_seats: 1, vacant_mode: 'Most Vacant' });
        expect(user3.takenRides).to.have.lengthOf(1);

        // select_ride("Gaurav, Origin=Bangalore, Destination=Mysore, Seats=1, Preferred Vehicle=Activa") (2(b) is the desired output)
        app.selectRide(user5, { origin: 'Bangalore', destination: 'Mysore', available_seats: 1, preferred_vehicle: 'Activa' });
        expect(user5.takenRides).to.have.lengthOf(1);

        // select_ride("Shashank, Origin=Mumbai, Destination=Bangalore, Seats=1, Most Vacant") (No rides found)
        app.selectRide(user2, { origin: 'Mumbai', destination: 'Bangalore', available_seats: 1, vacant_mode: 'Most Vacant' });
        expect(user2.takenRides).to.have.lengthOf(0);

        // select_ride("Rohan, Origin=Hyderabad, Destination=Bangalore, Seats=1, Preferred Vehicle=Baleno") (2(d) is the desired output)
        app.selectRide(user1, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 1, preferred_vehicle: 'Baleno' });
        expect(user1.takenRides).to.have.lengthOf(1);

        // select_ride("Shashank, Origin=Hyderabad, Destination=Bangalore, Seats=1, Preferred Vehicle=Polo") (No rides found)
        app.selectRide(user2, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 1, preferred_vehicle: 'Polo' });
        expect(user2.takenRides).to.have.lengthOf(0);

        // app.selectRide(user2, { origin: 'Hyderabad', destination: 'Mysore', available_seats: 1 });
        // expect(user2.takenRides).to.have.lengthOf(0);

        // select ride for already rides taken user and check the total ride count
        // app.selectRide(user3, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 5, preferred_vehicle: 'XUV' });
        // expect(user3.takenRides).to.have.lengthOf(2);

        // select ride for unavailable seats ride and it should fail
        // app.selectRide(user3, { origin: 'Hyderabad', destination: 'Bangalore', available_seats: 1, preferred_vehicle: 'XUV' });
        // expect(user3.takenRides).to.have.lengthOf(2);
    }
        )

    it('should end rides correctly', function() {
        const ride = app.endRide({ origin: 'Bangalore', destination: 'Mysore', vehicle_number: 'KA-05-41491' });
        expect(ride.status).to.equal('completed');
        // app.offerRide(user4, { origin: 'Bangalore', destination: 'Mysore', available_seats: 5, vehicle_number:'KA-05-41491', vehicle_model: 'Polo' });
        // expect(user4.offeredRides).to.have.lengthOf(3);
    });

    it('should print ride stats', function() {
        const ride_stats = app.printRideStats();
        expect(ride_stats).includes.members([
            'Rohan: 1 Taken, 1 Offered',
            'Shashank: 0 Taken, 1 Offered',
            'Nandhini: 1 Taken, 0 Offered',
            'Shipra: 0 Taken, 2 Offered',
            'Gaurav: 1 Taken, 0 Offered',
            'Rahul: 0 Taken, 0 Offered'
        ])
    });
});
