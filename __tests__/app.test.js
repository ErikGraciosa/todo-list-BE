require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('Testing /GET for /todos, must return current todo list', async() => {

      const expectation = [
        {
          id: 1,
          todo: 'Mail Letter',
          completed: false,
          owner_id: 1
        },
        {
          id: 2,
          todo: 'Wash Car',
          completed: false,
          owner_id: 1
        },
        {
          id: 3,
          todo: 'Rake Leaves',
          completed: false,
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('Testing /POST for /api/todos, must post to the db and verify data saved', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'Feed Garfield',
          completed: false,
          owner_id: 2
        },
      ];

      const data = await fakeRequest(app)
        .post('/api/todos')
        .set({ Authorization: token })
        .send({
          todo: 'Feed Garfield',
          completed: false,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });




    test('Testing /GET for /api/todos, must return current todo list for user', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'Feed Garfield',
          completed: false,
          owner_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set({ Authorization: token })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(expectation);
    });


    test('Testing /PUT for /api/todos/:id, will return single item and flip \'completed\' to true', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'Feed Garfield',
          completed: true,
          owner_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set({ Authorization: token })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(expectation);
    });
  });
});
