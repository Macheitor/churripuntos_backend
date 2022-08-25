const request = require('supertest')
const baseURL = "http://localhost:8080";

let jwt1, userId1;
const username1 = "test1";
const email1 = "test1";
const password1 = "test1";
const spacename1 = "test1";
const color1 = "0xFF0000";

let jwt2, userId2;
const username2 = "test2";
const email2 = "test2";
const password2 = "test2";
const spacename2 = "test2";
const color2 = "0x00FF00";

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

  jwt1 = res.body.accessToken;
  userId1 = res.body.user._id;

  res = await request(baseURL)
                .post('/login')
                .set('Content-type', 'application/json')
                .send({
                  username: username2,
                  password: password2
                });
  expect(res.status).toEqual(200);

  jwt2 = res.body.accessToken;
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

describe('Spaces users CRUD', function() {

  // NOTE: "GC:Delete space" already tested in user.test.js when testing Create Space

  it('GC: Join space', async function() {
    let res;
    let spaceId1, spaceId2;

    // Create space1 by user1
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

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Usernames).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);

    // User2 joins the spaceId1
    res = await request(baseURL)
                  .put(`/spaces/${spaceId1}/users`)
                  .send({
                    username: username2,
                    _id: userId2,
                    color: color2
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Create space2 by user2
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

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check users of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Usernames = res.body.users.map(u => u.username);
      expect(spaceId2Usernames).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Usernames).toEqual(expect.not.arrayContaining([username1]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(2);

    // User1 joins the spaceId2
    res = await request(baseURL)
                  .put(`/spaces/${spaceId2}/users`)
                  .send({
                    username: username1,
                    _id: userId1,
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check users of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Usernames = res.body.users.map(u => u.username);
      expect(spaceId2Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(2);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(2);

    // Delete spaceId1 
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check users of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Usernames = res.body.users.map(u => u.username);
      expect(spaceId2Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Delete spaceId2
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);
  });


  it('GC: Leave space', async function() {

    let res;
    let spaceId1, spaceId2;

    // Create space1 by user1
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

    // User2 joins the spaceId1
    res = await request(baseURL)
                  .put(`/spaces/${spaceId1}/users`)
                  .send({
                    username: username2,
                    _id: userId2,
                    color: color2
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Create space2 by user2
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

    // User1 joins the spaceId2
    res = await request(baseURL)
                  .put(`/spaces/${spaceId2}/users`)
                  .send({
                    username: username1,
                    _id: userId1,
                    color: color1
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check users of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Usernames = res.body.users.map(u => u.username);
      expect(spaceId2Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(2);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(2);

    // User2 leaves the spaceId1
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId1}/users`)
                  .send({
                    username: username2,
                    _id: userId2,
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Usernames).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check users of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Usernames = res.body.users.map(u => u.username);
      expect(spaceId2Usernames).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(2);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // User1 leaves the spaceId2
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId2}/users`)
                  .send({
                    username: username1,
                    _id: userId1,
                  })
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check users of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/users`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Usernames = res.body.users.map(u => u.username);
      expect(spaceId1Usernames).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Usernames).toEqual(expect.not.arrayContaining([username2]));
    }
    
    // Check users of spaceId2
    {
      res = await request(baseURL)
      .get(`/spaces/${spaceId2}/users`)
      .send()
      .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      
      // Get only the usernames
      const spaceId2Usernames = res.body.users.map(u => u.username);
      expect(spaceId2Usernames).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Usernames).toEqual(expect.not.arrayContaining([username1]));
    }

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(1);

    // Delete spaceId1 
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Delete spaceId2
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // Check spaces for userId1
    res = await request(baseURL)
                  .get(`/users/${userId1}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);

    // Check spaces for userId2
    res = await request(baseURL)
                  .get(`/users/${userId2}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt2}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.spaces.length).toEqual(0);
  });
});

/*


// Admins CRUD
router.route('/:spaceId/admins')
    .post(spacesController.createAdmin)
    .delete(spacesController.deleteAdmin);

// Tasks CRUD
router.route('/:spaceId/tasks')
    .get(spacesController.getTasks)
    .post(spacesController.createTask)
    .put(spacesController.updateTask)
    .delete(spacesController.deleteTask);

// Activities CRUD
router.route('/:spaceId/activities')
    .get(spacesController.getActivities)
    .post(spacesController.createActivity)
    .delete(spacesController.deleteActivity);
    */