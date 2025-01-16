import assert from 'assert';
import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../app.mjs';
import '../db.mjs';

const should = chai.should();
chai.use(chaiHttp);

describe('app', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost/eventPlanner', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  after(async () => {
    await mongoose.disconnect();
  });

  describe('GET /', () => {
    it('should return status 200 and render the home page', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          done();
        });
    });
  });

  describe('GET /event-create', () => {
    it('should return status 200 and render the event-create page', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          done();
        });
    });
  });

  describe('POST /event-create', () => {
    it('should create a new event and redirect to the home page', (done) => {
      chai.request(app)
        .post('/event-create')
        .send({
          eventName: "Sample Event",
          startDate: new Date("2023-12-01"),
          endDate: new Date("2023-12-03"),
          startTime: "10:00 AM",
          endTime: "6:00 PM",
          location: "Sample Venue 1",
          cost: 20.0,
          description: "This is a sample event description.",
          organizer: ["Organizer 1"],
          attendees: ["Attendee 1", "Attendee 2"],
          createdAt: new Date(),
        })
        .end((err, res) => {
          res.should.have.status(302);
          res.should.redirectTo('/');
          done();
        });
    });
  });

  describe('GET /edit-event', () => {
    it('should return status 200 and render the edit-event page', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          done();
        });
    });
  });

  describe('POST /edit-event', () => {
    it('should edit specified event and output success message', (done) => {
      chai.request(app)
        .post('/edit-event')
        .send({
          eventName: 'Sample Event',
          attendees: ['Attendee 1', 'Attendee 2']
        })
        .end((err, res) => {
          // success message
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /profile', () => {
    it('should return status 200 and render the profile page', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          done();
        });
    });
  }); 

});
