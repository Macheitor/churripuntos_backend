const request = require('supertest')
const baseURL = "http://localhost:8080";

let jwt1, userId1;
const username1 = "spaces_admins_1";
const email1 = "spaces_admins_1@spaces_admins_1.com";
const password1 = "spaces_admins_1";
const spacename1 = "spaces_admins_1";
const color1 = "spaces_admins_1";

let jwt2, userId2;
const username2 = "spaces_admins_2";
const email2 = "spaces_admins_2@spaces_admins_2.com";
const password2 = "spaces_admins_2";
const spacename2 = "spaces_admins_2";
const color2 = "spaces_admins_2";

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

describe('Spaces admins CRUD', function() {
  
  it('GC: Get admins', async function() {
  
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Admins).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Admins).toEqual(expect.not.arrayContaining([username1]));
    }

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

  it('GC: Create admin', async function() {
  
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Admins).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Admins).toEqual(expect.not.arrayContaining([username1]));
    }

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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Admins).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Admins).toEqual(expect.not.arrayContaining([username1]));
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

    // userId2 becomes admin of spaceId1
    res = await request(baseURL)
                  .post(`/spaces/${spaceId1}/admins`)
                  .send({
                    username: username2,
                    _id: userId2
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Admins).toEqual(expect.not.arrayContaining([username1]));
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

    // userId1 becomes admin of spaceId2
    res = await request(baseURL)
                  .post(`/spaces/${spaceId2}/admins`)
                  .send({
                    username: username1,
                    _id: userId1
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username1, username2]));
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

  it('GC: Delete admin', async function() {
  
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

    // userId2 becomes admin of spaceId1
    res = await request(baseURL)
                  .post(`/spaces/${spaceId1}/admins`)
                  .send({
                    username: username2,
                    _id: userId2
                  })
                  .set('Authorization', `Bearer ${jwt1}`);
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');

    // userId1 becomes admin of spaceId2
    res = await request(baseURL)
                  .post(`/spaces/${spaceId2}/admins`)
                  .send({
                    username: username1,
                    _id: userId1
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1, username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username1, username2]));
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

    // userId2 downgrades in spaceId1 by userId1
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId1}/admins`)
                  .send({
                    username: username2,
                    _id: userId2
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Admins).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username1, username2]));
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

    // userId1 downgrades in spaceId2 by userId1 (itself)
    res = await request(baseURL)
                  .delete(`/spaces/${spaceId2}/admins`)
                  .send({
                    username: username1,
                    _id: userId1
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

    // Check admins of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt1}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId1Admins = res.body.admins.map(a => a.username);
      expect(spaceId1Admins).toEqual(expect.arrayContaining([username1]));
      expect(spaceId1Admins).toEqual(expect.not.arrayContaining([username2]));
    }

    // Check admins of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/admins`)
                    .send()
                    .set('Authorization', `Bearer ${jwt2}`);
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');

      // Get only the usernames
      const spaceId2Admins = res.body.admins.map(a => a.username);
      expect(spaceId2Admins).toEqual(expect.arrayContaining([username2]));
      expect(spaceId2Admins).toEqual(expect.not.arrayContaining([username1]));
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