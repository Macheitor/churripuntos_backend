const request = require('supertest')
const baseURL = "http://localhost:8080";

let jwt1, jwt2;
let userId1, userId2;

// Register users test1 & test2
beforeAll(async () => {

  let res;
  res = await request(baseURL)
                        .post("/register")
                        .send({
                          username: `test1`,
                          email: `test1`,
                          password: `test1`
                        })
  expect(res.status).toEqual(201);

  res = await request(baseURL)
                        .post("/register")
                        .send({
                          username: `test2`,
                          email: `test2`,
                          password: `test2`
                        })
  expect(res.status).toEqual(201);

  res = await request(baseURL)
  .post('/login')
  .set('Content-type', 'application/json')
  .send({
    username: `test1`,
    password: `test1`
  });

  expect(res.status).toEqual(200);

  jwt1 = res.body.accessToken;
  userId1 = res.body.user._id;

  res = await request(baseURL)
  .post('/login')
  .set('Content-type', 'application/json')
  .send({
    username: `test2`,
    password: `test2`
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

describe('Space CRUD', function() {

    it('GC: login using username', async function() {
      const res = await request(baseURL)
        .post('/login')
        .set('Content-type', 'application/json')
        .send({username: "test1", password: "test1"})

        expect(res.status).toEqual(200);
        expect(res.body.status).toEqual('success');
        expect(res.body.user.username).toEqual("test1");
        expect(res.body.user._id).toBeDefined();
        expect(res.body.accessToken).toBeDefined();
    });

  });

/*

// Space CRUD
router.route( '/:spaceId')
.delete(spacesController.deleteSpace);

// Users CRUD
router.route( '/:spaceId/users')
.put(spacesController.joinSpace)
.delete(spacesController.leaveSpace);

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