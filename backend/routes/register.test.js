const request = require('supertest')
const baseURL = "http://localhost:8080";

const username = "register_test"
const email = "register_test@register_test.com"
const password = "register_test"

// Delete registered user
afterAll(async () => {
  let res, jwt, userId;
  
  res = await request(baseURL)
                .post('/login')
                .set('Content-type', 'application/json')
                .send({
                  username,
                  password
                });

  expect(res.status).toEqual(200);
  expect(res.body.user.username).toEqual(username);
  expect(res.body.user._id).toBeDefined();
  expect(res.body.user.accessToken).toBeDefined();

  jwt = res.body.user.accessToken;
  userId = res.body.user._id;

  res = await request(baseURL)
                .delete(`/users/${userId}`)
                .send()
                .set('Authorization', `Bearer ${jwt}`)

  expect(res.status).toEqual(204);
});

describe('POST /register (GC)', function() {

  it('GC: register', async function() {
    const res = await request(baseURL)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({username, email, password})

    expect(res.status).toEqual(201);
  });
});

describe('POST /register (BC)', function() {

  it('BC: user already registered', async function() {
    const res = await request(baseURL)
                        .post('/register')
                        .set('Content-type', 'application/json')
                        .send({username, email, password})

    expect(res.status).toEqual(400);
  });

  it('BC: register missing username', async function() {
    const res = await request(baseURL)
                        .post('/register')
                        .set('Content-type', 'application/json')
                        .send({ email, password})

    expect(res.status).toEqual(400);
  });


  it('BC: register missing email', async function() {
    const res = await request(baseURL)
                        .post('/register')
                        .set('Content-type', 'application/json')
                        .send({username, password})

    expect(res.status).toEqual(400);

  });

  it('BC: register missing password', async function() {
    const res = await request(baseURL)
                        .post('/register')
                        .set('Content-type', 'application/json')
                        .send({username, email})

    expect(res.status).toEqual(400);
  });
});
