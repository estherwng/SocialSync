import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

// Event object
const Event = new mongoose.Schema({
  eventName: {type: String, required: true},
  startDate:{type: Date, required: true},
  endDate: {type: Date, required: false},
  startTime: {type: String, required: true}, 
  endTime: {type: String, required: true}, 
  location: {type: String, required: true},
  cost: {type: Number, required: true}, 
  description: {type: String, required: true},
  organizer: {type: Array, required: true},
  attendees: {type: Array, required: true},
  createdAt: {type: Date, required: true},
});

// Person object
const Person = new mongoose.Schema({
  username: {type: String, required: true},
  passwordHash: {type: String, required: true},
  salt: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  contact: {type: String, required: true},
  organizerStatus: {type: Boolean, required: false},
  currentEvents: {type: Array, required: false},
});

Person.plugin(passportLocalMongoose);

mongoose.model('Event', Event);
mongoose.model('Person', Person);
// mongoose.model('Attendee', Attendee);

const mongooseOpts = {};

// Uncomment following line to debug value of database connection string
// console.log(process.env.DSN)
mongoose.connect(process.env.DSN, mongooseOpts)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });