const request = require('supertest')
const baseURL = "http://localhost:8080";

// Constants & variables
const username = "login_test"
const email = "login_test@login_test.com"
const password = "login_test"


// Register user
beforeAll(async () => {
  let res;

  res = await request(baseURL)
                .post("/register")
                .send({ username, email, password });
  expect(res.status).toEqual(201);
});


// Delete user
afterAll(async () => {
  let res;

  res = await request(baseURL)
                    .post('/login')
                    .set('Content-type', 'application/json')
                    .send({ username, password });
  expect(res.status).toEqual(200);
  
  const jwt = res.body.user.accessToken;
  const userId = res.body.user._id;
  
  res = await request(baseURL)
  .delete(`/users/${userId}`)
  .send()
  .set('Authorization', `Bearer ${jwt}`);
  expect(res.status).toEqual(204);
});


describe('POST /login', function() {

  it('GC: login using username', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username, password});

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual(username);
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });
                    
  it('GC: login using email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({email, password})
    
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual(username);
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });
  
  it('GC: login using username and email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username, email, password})

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual(username);
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });

  it('GC: login using good username and bad email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username, email: "x", password})

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual(username);
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });

  it('GC: login using bad username and good email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username: "x", email, password})

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual(username);
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });

  it('BC: login using wrong username', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username: "x", password})

    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });

  it('BC: login using wrong email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({email: "x", password})

    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });

  it('BC: login using wrong password', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username, password: "x"})

    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });
});
