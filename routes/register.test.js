const request = require('supertest')
const baseURL = "http://localhost:8080";

describe('POST /register', function() {

  afterAll(async () => {
    let res, jwt, userId;
    
    res = await request(baseURL)
                  .post('/login')
                  .set('Content-type', 'application/json')
                  .send({
                    username: "test",
                    password: "test"
                  });

    expect(res.status).toEqual(200);
    expect(res.body.user.username).toEqual("test");
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


  it('GC: register', async function() {
    const res = await request(baseURL)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({username: "test", email: "test@test.com", password: "test"})

    expect(res.status).toEqual(201);
  });

  it('BC: user already registered', async function() {
    const res = await request(baseURL)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({username: "test", email: "test@test.com", password: "test"})

    expect(res.status).toEqual(400);
  });

  it('BC: register missing username', async function() {
    const res = await request(baseURL)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({ email: "test@test.com", password: "test"})

    expect(res.status).toEqual(400);
  });


  it('BC: register missing email', async function() {
    const res = await request(baseURL)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({username: "test", password: "test"})

    expect(res.status).toEqual(400);

  });

  it('BC: register missing password', async function() {
    const res = await request(baseURL)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({username: "test", email: "test@test.com", password: "test"})

    expect(res.status).toEqual(400);
  });
});
