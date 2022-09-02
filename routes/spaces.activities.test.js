const request = require('supertest')
const baseURL = "http://localhost:8080";

let jwt1, userId1, taskId1, spaceId1;
const username1 = "user1";
const email1 = "email1";
const password1 = "pass1";
const password1updated = "pass1updated";
const spacename1 = "space1";
const spacename1updated = "space1updated";
const color1 = "0xFF0000";
const color1updated = "0xFFFF00";
const taskname1 = "task1";
const taskname1updated = "task1updated";
const points1 = 1;
const points1updated = 11;

let jwt2, userId2, taskId2, spaceId2;
const username2 = "user2";
const email2 = "email2";
const password2 = "pass2";
const password2updated = "pass2updated";
const spacename2 = "space2";
const spacename2updated = "space2updated";
const color2 = "0x00FF00";
const color2updated = "0x00FFFF";
const taskname2 = "task2";
const taskname2updated = "task2updated";
const points2 = 2;
const points2updated = 22;

const inventedMongoDbObjectId = "000000000000000000000000";
const wrongMongoDbObjectId = "0";

// Register userId1 & userId2 & userId3
beforeAll(async () => {

  let res;
  
  // Register userId1
  res = await request(baseURL)
                .post("/register")
                .send({
                  username: username1,
                  email: email1,
                  password: password1
                });
  expect(res.status).toEqual(201);

  // Register userId2
  res = await request(baseURL)
                .post("/register")
                .send({
                  username: username2,
                  email: email2,
                  password: password2
                });
  expect(res.status).toEqual(201);

  // Login userId1
  res = await request(baseURL)
                .post('/login')
                .set('Content-type', 'application/json')
                .send({
                  username: username1,
                  password: password1
                });
  expect(res.status).toEqual(200);

  // Get userId1 credentials
  jwt1 = res.body.user.accessToken;
  userId1 = res.body.user._id;

  // Login userId2
  res = await request(baseURL)
                .post('/login')
                .set('Content-type', 'application/json')
                .send({
                  username: username2,
                  password: password2
                });
  expect(res.status).toEqual(200);

  // Get userId2 credentials
  jwt2 = res.body.user.accessToken;
  userId2 = res.body.user._id;

  // Create space1 by user1 (admin role)
  {
    res = await request(baseURL)
                  .post(`/users/${userId1}`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send({
                    spacename: spacename1,
                    color: color1
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.space.spacename).toEqual(spacename1);
    expect(res.body.space.spaceId).toBeDefined();
    spaceId1 = res.body.space.spaceId;
  }

  // Create space2 by user2 (admin role)
  {
    res = await request(baseURL)
                  .post(`/users/${userId2}`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send({
                    spacename: spacename2,
                    color: color2
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.space.spacename).toEqual(spacename2);
    expect(res.body.space.spaceId).toBeDefined();
    spaceId2 = res.body.space.spaceId;
  }

  // User1 joins the spaceId2 (user role)
  {
    res = await request(baseURL)
                  .put(`/spaces/${spaceId2}/users`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send({
                    username: username1,
                    _id: userId1,
                    color: color1
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
  }
});

// Delete created users & spaces
afterAll(async () => {

  let res; 

  // Delete spaceId1 
  {
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId1}`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
  }

  // Delete spaceId2
  {
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId2}`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
  }

  // Delete userId1
  res = await request(baseURL)
                .delete(`/users/${userId1}`)
                .set('Authorization', `Bearer ${jwt1}`)
                .send();
  expect(res.status).toEqual(204);

  // Delete userId2
  res = await request(baseURL)
                .delete(`/users/${userId2}`)
                .set('Authorization', `Bearer ${jwt2}`)
                .send();
  expect(res.status).toEqual(204);
});

// Get sure spaces are empty before each test
beforeEach(async() => {
    
  let res; 

  // Check tasks of spaceId1
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId1}/tasks`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.tasks.length).toEqual(0);
  }

  // Check tasks of spaceId2
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId2}/tasks`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.tasks.length).toEqual(0);
  }
});

describe('Spaces activities CRUD', function() {

  it ('GC: Get/Create/Delete task - 2 spaces with 0 task', async function () {
  })
});