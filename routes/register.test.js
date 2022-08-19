const request = require('supertest')
const baseURL = "http://localhost:8080";

describe('POST /register', function() {

  afterAll(async () => {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({
                          username: "test",
                          password: "test"
                        });

    expect(res.status).toEqual(200);
    expect(res.body.user.username).toEqual("test");
    expect(res.body.user._id).toBeDefined();
    expect(res.body.accessToken).toBeDefined();

    const jwt = res.body.accessToken;
    const userId = res.body.user._id;

    await request(baseURL)
            .delete(`/users/${userId}`)
            .send()
            .set('Authorization', `Bearer ${jwt}`)
            .expect(204);
  })


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
