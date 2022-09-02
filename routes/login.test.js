const request = require('supertest')
const baseURL = "http://localhost:8080";

describe('POST /login', function() {

  beforeAll(async () => {
    let res = await request(baseURL)
                      .post("/register")
                      .send({
                        username: "test",
                        email: "test@test.com",
                        password: "test"
                      });
    expect(res.status).toEqual(201);
  });


  afterAll(async () => {
    let res = await request(baseURL)
                      .post('/login')
                      .set('Content-type', 'application/json')
                      .send({
                        username: "test",
                        password: "test"
                      });
    expect(res.status).toEqual(200);

    const jwt = res.body.user.accessToken;
    const userId = res.body.user._id;

    res = await request(baseURL)
                  .delete(`/users/${userId}`)
                  .send()
                  .set('Authorization', `Bearer ${jwt}`);
    expect(res.status).toEqual(204);
  });


  it('GC: login using username', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username: "test", password: "test"});
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual("test");
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });

  it('GC: login using email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({email: "test@test.com", password: "test"})

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual("test");
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });

  it('GC: login using username and email', async function() {
    const res = await request(baseURL)
      .post('/login')
      .set('Content-type', 'application/json')
      .send({username: "test", email: "test@test.com", password: "test"})

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.user.username).toEqual("test");
    expect(res.body.user._id).toBeDefined();
    expect(res.body.user.accessToken).toBeDefined();
  });

  it('BC: login using wrong username', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username: "x", password: "test"})

    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });

  it('BC: login using wrong email', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({email: "x", password: "test"})

    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });

  it('BC: login using wrong password', async function() {
    const res = await request(baseURL)
                        .post('/login')
                        .set('Content-type', 'application/json')
                        .send({username: "test", password: "x"})

    expect(res.status).toEqual(400);
    expect(res.body.status).toEqual('fail');
  });
});
