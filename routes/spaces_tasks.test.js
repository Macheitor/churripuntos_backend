const request = require('supertest')
const baseURL = "http://localhost:8080";

let jwt1, userId1, taskId1, spaceId1;
const username1 = "space_tasks_1";
const email1 = "space_tasks_1@space_tasks_1.com";
const password1 = "space_tasks_1";
const spacename1 = "space_tasks_1";
const color1 = "space_tasks_1";
const taskname1 = "space_tasks_1";
const taskname1updated = "space_tasks_1_updated";
const points1 = 1;
const points1updated = 11;

let jwt2, userId2, taskId2, spaceId2;
const username2 = "space_tasks_2";
const email2 = "space_tasks_2@space_tasks_2.com";
const password2 = "space_tasks_2";
const spacename2 = "space_tasks_2";
const color2 = "space_tasks_2";
const taskname2 = "space_tasks_2";
const taskname2updated = "space_tasks_2_updated";
const points2 = 2;
const points2updated = 22;

const inventedMongoDbObjectId = "000000000000000000000000";

// Register userId1 & userId2 
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

// Get sure space tasks are empty before each test
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

describe('Spaces task CRUD (GC)', function() {

  it ('GC: Get/Create/Delete task - 2 spaces with 0 task', async function () {

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
  })

  it ('GC: Get/Create/Delete task - 2 spaces 1 task each', async function () {

    let res;

    // Create task1 in spaceId1 by userId1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Create task1 in spaceId2 by userId1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Check tasks of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId2 = res.body.tasks[0]._id;
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Delete taskId1 from spaceId2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId2 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });

  it ('GC: Get/Create/Delete task - 1 space with 2 tasks (different roles)', async function () {
    
    let res;

    // Create task1 in spaceId2 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Create task2 in spaceId2 by user2
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskname: taskname2,
                      points: points2
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname2);
      expect(res.body.task.points).toEqual(points2);
    }
  
    // Check tasks of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(2);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toEqual(taskId1);
      expect(res.body.tasks[1].taskname).toEqual(taskname2);
      expect(res.body.tasks[1].points).toEqual(points2);
      expect(res.body.tasks[1]._id).toBeDefined();
      taskId2 = res.body.tasks[1]._id;
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  
    // Check tasks of spaceId1 by user1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname2);
      expect(res.body.tasks[0].points).toEqual(points2);
      expect(res.body.tasks[0]._id).toEqual(taskId2);
    }

    // Delete taskId1 from spaceId1 by user2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskId: taskId2 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(0);
    }
  });

  it ('GC: Update task - 1 space with 1 task gets updated', async function () {

    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: points1updated
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1updated);
      expect(res.body.task.points).toEqual(points1updated);
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1updated);
      expect(res.body.tasks[0].points).toEqual(points1updated);
      expect(res.body.tasks[0]._id).toEqual(taskId1);
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });

  it ('GC: Update task - 1 space with 2 tasks both updated', async function () {
    
    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Create task2 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname2,
                      points: points2
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname2);
      expect(res.body.task.points).toEqual(points2);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(2);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
      expect(res.body.tasks[1].taskname).toEqual(taskname2);
      expect(res.body.tasks[1].points).toEqual(points2);
      expect(res.body.tasks[1]._id).toBeDefined();
      taskId2 = res.body.tasks[1]._id;
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: points1updated
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1updated);
      expect(res.body.task.points).toEqual(points1updated);
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(2);
      expect(res.body.tasks[0].taskname).toEqual(taskname1updated);
      expect(res.body.tasks[0].points).toEqual(points1updated);
      expect(res.body.tasks[0]._id).toEqual(taskId1);
      expect(res.body.tasks[1].taskname).toEqual(taskname2);
      expect(res.body.tasks[1].points).toEqual(points2);
      expect(res.body.tasks[1]._id).toEqual(taskId2)
    }

    // Update task2 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId2,
                      taskname: taskname2updated,
                      points: points2updated
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname2updated);
      expect(res.body.task.points).toEqual(points2updated);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(2);
      expect(res.body.tasks[0].taskname).toEqual(taskname1updated);
      expect(res.body.tasks[0].points).toEqual(points1updated);
      expect(res.body.tasks[0]._id).toEqual(taskId1);
      expect(res.body.tasks[1].taskname).toEqual(taskname2updated);
      expect(res.body.tasks[1].points).toEqual(points2updated);
      expect(res.body.tasks[1]._id).toEqual(taskId2)
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Delete taskId2 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId2 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });

  it ('GC: Update task - 2 spaces with 1 tasks each all updated by different user roles (1 admin - 1 user)', async function () {
    
    let res;
  
    // Create task1 in spaceId1 by user1 (admin role)
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Create task2 in spaceId2 by user1 (user role)
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname2,
                      points: points2
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname2);
      expect(res.body.task.points).toEqual(points2);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Check tasks of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname2);
      expect(res.body.tasks[0].points).toEqual(points2);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId2 = res.body.tasks[0]._id;
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: points1updated
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1updated);
      expect(res.body.task.points).toEqual(points1updated);
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1updated);
      expect(res.body.tasks[0].points).toEqual(points1updated);
      expect(res.body.tasks[0]._id).toEqual(taskId1);
    }

    // Update task2 in spaceId2 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId2,
                      taskname: taskname2updated,
                      points: points2updated
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname2updated);
      expect(res.body.task.points).toEqual(points2updated);
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname2updated);
      expect(res.body.tasks[0].points).toEqual(points2updated);
      expect(res.body.tasks[0]._id).toEqual(taskId2);
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Delete taskId2 from spaceId2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId2 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });

});

describe('Spaces get task (BC)', function() {
  it ('BC: Get task - spaceId does not exists', async function () {

    let res;

    // Check tasks of invented space
    {
      res = await request(baseURL)
                    .get(`/spaces/${inventedMongoDbObjectId}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.tasks).not.toBeDefined();
    }
  });
 
  it ('BC: Get task - user does not exist', async function () {
    
    let res;
    
    // Check tasks of spaceId1 with by jwt2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.tasks).not.toBeDefined();
    }
  });
});

describe('Spaces create task (BC)', function() {

  it ('BC: Create task - spaceId does not exists', async function () {
    let res;

    // Create task1 in invented spaceId by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${inventedMongoDbObjectId}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create task - user does not exist', async function () {

    let res;

    // Create task2 in spaceId1 by user2
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskname: taskname2,
                      points: points2
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create task - taskname not provided', async function () {
    
    let res;
    
    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      points: points1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create task - points not provided', async function () {
    
    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create task - invalid taskname value', async function () {

    let res;
    
    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: "  ",
                      points: points1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });
  
  it ('BC: Create task - invalid points values', async function () {

    let res;
    
    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: spacename1,
                      points: 1.1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: spacename1,
                      points: -10
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: spacename1,
                      points: "10"
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create task - task already exist', async function () {
    
    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  
    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });
});

describe('Spaces update task (BC)', function() {

  it ('BC: Update task - spaceId does not exists', async function () {

    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${inventedMongoDbObjectId}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }    
  });
  
  it ('BC: Update task - user does not exist', async function () {

    let res;

    // Update task1 in spaceId1 by user3
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: points1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Update task - taskname not provided', async function () {
    
    let res;

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      points: points1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Update task - points not provided', async function () {
    
    let res;

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Update task - taskId not provided', async function () {

    let res;

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1updated,
                      points: points1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

  });

  it ('BC: Update task - invalid taskname value', async function () {
    
    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: "  ",
                      points: points1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }


    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });

  it ('BC: Update task - invalid points value', async function () {

    let res;

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: -1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: 3.2
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1updated,
                      points: "10"
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Update task - taskId does not exist', async function () {
    
    let res;

    // Update with a taskId that does not exist
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: inventedMongoDbObjectId,
                      taskname: taskname1updated,
                      points: points1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Update task - taskname already exist', async function () {

    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Update task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .put(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1,
                      taskname: taskname1,
                      points: points1updated
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });
});

describe('Spaces delete task (BC)', function() {

  it ('BC: Delete task - spaceId does not exists', async function () {

    let res;

    // Create task1 in spaceId1 by user1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${inventedMongoDbObjectId}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }    
  });

  it ('BC: Delete task - taskId not provided', async function () {
    let res;

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({});
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }  

  });

  it ('BC: Delete task - taskId does not exist', async function () {
    let res;

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: inventedMongoDbObjectId 
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Delete task - user does not belong to space', async function () {

    let res;

    // Create task1 in spaceId1 by userId1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskname: taskname1,
                      points: points1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.task.taskname).toEqual(taskname1);
      expect(res.body.task.points).toEqual(points1);
    }

    // Check tasks of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.tasks.length).toEqual(1);
      expect(res.body.tasks[0].taskname).toEqual(taskname1);
      expect(res.body.tasks[0].points).toEqual(points1);
      expect(res.body.tasks[0]._id).toBeDefined();
      taskId1 = res.body.tasks[0]._id;
    }

    // Delete taskId1 from spaceId1 by userId2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

    // Delete taskId1 from spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/tasks`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId1 
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }
  });
});