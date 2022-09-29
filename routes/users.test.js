const request = require('supertest')
const baseURL = "http://localhost:8080";

let jwt1, userId1;
const username1 = "users_test_1";
const email1 = "users_test_1@users_test_1.com";
const password1 = "users_test_1";
const spacename1 = "users_test_1";
const color1 = "users_test_1";

let jwt2, userId2;
const username2 = "users_test_2";
const email2 = "users_test_2@users_test_2.com";
const password2 = "users_test_2";
const spacename2 = "users_test_2";
const color2 = "users_test_2";

// Register users test1 & test2
beforeAll(async () => {

  let res;
  
  res = await request(baseURL)
                .post("/register")
                .send({
                  username: username1,
                  email: email1,
                  password: password1
                });
  expect(res.status).toEqual(201);

  res = await request(baseURL)
                .post("/register")
                .send({
                  username: username2,
                  email: email2,
                  password: password2
                });
  expect(res.status).toEqual(201);

  res = await request(baseURL)
                .post('/login')
                .set('Content-type', 'application/json')
                .send({
                  username: username1,
                  password: password1
                });
  expect(res.status).toEqual(200);

  jwt1 = res.body.user.accessToken;
  userId1 = res.body.user._id;

  res = await request(baseURL)
                .post('/login')
                .set('Content-type', 'application/json')
                .send({
                  username: username2,
                  password: password2
                });
  expect(res.status).toEqual(200);

  jwt2 = res.body.user.accessToken;
  userId2 = res.body.user._id;
});


// Delete user test1 & test2
afterAll(async () => {

  let res; 

  res = await request(baseURL)
                .delete(`/users/${userId1}`)
                .send()
                .set('Authorization', `Bearer ${jwt1}`)
  expect(res.status).toEqual(204);

  res = await request(baseURL)
                .delete(`/users/${userId2}`)
                .send()
                .set('Authorization', `Bearer ${jwt2}`)
  expect(res.status).toEqual(204);

})

describe('Users CRUD', function() {

  it('GC: Get users - check users test1 & test2 are in db', async function() {

    let res; 

    res = await request(baseURL)
                  .get(`/users`)
                  .send({search: ""})
                  .set('Authorization', `Bearer ${jwt1}`);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.users).toEqual(expect.arrayContaining([username1, username2]));
  });

  it('GC: Get spaces - check users do not have any spaces yet ', async function() {

    let res;

    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);

    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);
  });

  it('GC: Create space + Get space + Delete space', async function() {

    let res;
    let spaceId1, spaceId2;

    // Create space1 for user1
    res = await request(baseURL)
                  .post(`/users/${userId1}`)
                  .send({
                    spacename: spacename1,
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.space.spacename).toEqual(spacename1);
    expect(res.body.space.spaceId).toBeDefined();
    spaceId1 = res.body.space.spaceId;

    // Check spaces for user1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);
    expect(res.body.spaces[0]._id).toEqual(spaceId1);
    expect(res.body.spaces[0].spacename).toEqual(spacename1);

    // Check spaces for user2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);

    // Create space2 for user2
    res = await request(baseURL)
                  .post(`/users/${userId2}`)
                  .send({
                    spacename: spacename2,
                    color: color2
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.space.spacename).toEqual(spacename2);
    expect(res.body.space.spaceId).toBeDefined();
    spaceId2 = res.body.space.spaceId;

    // Check spaces for user1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);
    expect(res.body.spaces[0]._id).toEqual(spaceId1);
    expect(res.body.spaces[0].spacename).toEqual(spacename1);

    // Check spaces for user2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);
    expect(res.body.spaces[0]._id).toEqual(spaceId2);
    expect(res.body.spaces[0].spacename).toEqual(spacename2);

    // Delete space for test1 
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
  
    // Delete space for test2
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check spaces for user1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);

    // Check spaces for user2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);
  });

  it('BC: Create space - spacename not provided', async function() {

    let res;

    // Create space1 for user1
    res = await request(baseURL)
                  .post(`/users/${userId1}`)
                  .send({
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(400);
  });

  it('BC: Create space - color not provided', async function() {

    let res;

    // Create space1 for user1
    res = await request(baseURL)
                  .post(`/users/${userId1}`)
                  .send({
                    spacename: spacename1
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(400);
  });

  it('BC: Get spaces - different jwt and userId', async function() {

    let res;

    // Get user1 spaces
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send({
                    spacename: spacename1,
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(400);
  });
  
  it('BC: Create space - different jwt and userId', async function() {

    let res;

    // Create space1 for user1
    res = await request(baseURL)
                  .post(`/users/${userId1}`)
                  .send({
                    spacename: spacename1,
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(400);
  });

  it('BC: Delete space - different jwt and userId', async function() {

    let res;

    // Delete space1 for user1
    res = await request(baseURL)
                  .delete(`/users/${userId1}`)
                  .send({
                    spacename: spacename1,
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(400);
  });
});
