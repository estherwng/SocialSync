import './config.mjs';
import './db.mjs';

import mongoose from 'mongoose';
const Event = mongoose.model('Event');
const Person = mongoose.model('Person');

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import crypto from 'crypto';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: false }));

const sessionOptions = { 
	secret: 'AITfall2023', 
	saveUninitialized: true, 
	resave: true, 
};

app.use(session(sessionOptions));

app.get('/map', (req, res) => {
	let map;

	async function initMap() {
	const { Map } = await google.maps.importLibrary("maps");

	map = new Map(document.getElementById("map"), {
		center: { lat: 40.7128, lng: 74.0060 },
		zoom: 8,
	});
	}

	initMap();
	res.render('map');
});

passport.use(new LocalStrategy(
    function(username, password, cb) {
        Person.findOne({ username: username })
            .then((user) => {

                if (!user) { return cb(null, false) }
                
                // Function defined at bottom of app.js
                const isValid = validPassword(password, user.hash, user.salt);
                
                if (isValid) {
                    return cb(null, user);
                } else {
                    return cb(null, false);
                }
            })
            .catch((err) => {   
                cb(err);
            });
}));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    Person.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
})

app.use(passport.initialize());
app.use(passport.session());


app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res, next) => {
    
    const saltHash = genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newPerson = new Person({
        username: req.body.username,
        passwordHash: hash,
        salt: salt,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		contact: req.body.contact,
		organizerStatus: false,
		hostedEvents: [],
		currentEvents: [],
		pastEvents: [],
    });

    newPerson.save()
        .then((person) => {
            console.log(person);
        });

    res.redirect('/login');

});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/login');
});


app.get('/', (req, res) => {
	const {eventName, startDate, endDate, startTime, endTime, location, cost, description, organizer, attendees, createAt} = req.query;

	Event.find({})
    .then(searchEvents => {
		const filtered = searchEvents.filter(event => {
			return (
				(!eventName || event.eventName === eventName) &&
				(!startDate || event.startDate === startDate) &&
				(!location || event.location === location) &&
				(!organizer || event.organizer.includes(organizer)) &&
				(!attendees || event.attendees.includes(attendees))
			);
		});
      res.render('event', {user: req.user, events: filtered});
    })
    .catch(err => console.log(err));
});

app.get('/event-create', (req, res) => {
	res.render('create', {layout: 'layout'});
});

app.post('/event-create', (req, res) => {

	const organizers = req.body.organizer;
	const attendeeList = req.body.attendees;
	
	const event = new Event({
		eventName: req.body.eventName,
		startDate: req.body.startDate,
		endDate: req.body.endDate,
		startTime: req.body.startTime,
		endTime: req.body.endTime,
		location: req.body.location,
		cost: req.body.cost,
		description: req.body.description,
		organizer: organizers ? organizers.split(', ').map(organizers => organizers.trim()) : [],
		attendees: attendeeList ? attendeeList.split(', ').map(attendeeList => attendeeList.trim()) : [],
		createdAt: new Date(),
	});

	event.save()
		.then(() => res.redirect('/'))
		.catch(err => {
			console.error(err);
			res.status(500).send('Internal Server Error');
		});
});

app.get('/edit-event', (req, res)=> {
	res.render('edit', {layout: 'layout'});
})

app.post('/edit-event', async (req, res) => {
	try {
	  const eventName = req.body.eventName;
	  let attendees = req.body.attendees;
  
	  if (!eventName || !attendees) {
		return res.status(400).json({ error: 'Event name and attendee name are required.' });
	  }
  
	  const event = await Event.findOne({ eventName });
  
	  if (!event) {
		return res.status(404).json({ error: 'Event not found.' });
	  }
  
	  if (attendees.includes(',')) {
		attendees = attendees.split(',').map(attendee => attendee.trim());
	  } else {
		attendees = [attendees.trim()];
	  }
  
	  event.attendees.push(...attendees);
	  await event.save();
  
	  return res.status(200).json({ message: 'Attendees added successfully.' });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  });
  

app.get('/profile', (req, res) => {
	res.render('profile', {layout: 'layout'});
});

app.listen(process.env.PORT || 3000);

function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

export default app;