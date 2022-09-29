const request = require('supertest')
const baseURL = "http://localhost:8080";


let jwt1, userId1, taskId11, taskId12, spaceId1, activityId11;
const username1 = "spaces_activities_1";
const email1 = "spaces_activities_1@spaces_activities_1.com";
const password1 = "spaces_activities_1";
const spacename1 = "spaces_activities_1";
const color1 = "spaces_activities_1";
const taskname11 = "spaces_activities_11";
const points11 = 1;
const taskname12 = "spaces_activities_12";
const points12 = 12;

let jwt2, userId2, taskId21, taskId22, spaceId2, activityId21, activityId22;
const username2 = "spaces_activities_2";
const email2 = "spaces_activities_2@spaces_activities_2.com";
const password2 = "spaces_activities_2";
const spacename2 = "spaces_activities_2";
const color2 = "spaces_activities_2";
const taskname21 = "spaces_activities_21";
const points21 = 2;
const taskname22 = "spaces_activities_22";
const points22 = 22;

const inventedMongoDbObjectId = "000000000000000000000000";

/* 
 * Register userId1 & userId2
 * 
 * Create space1
 *          - users 
 *              - user1 (admin)
 *          - tasks
 *              - task11
 *              - task12
 * 
 * Create space2
 *          - users 
 *              - user2 (admin)
 *              - user1 (user)  
 *          - tasks
 *              - task21
 *              - task22
*/
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

  // Create activity11 in spaceId1 by userId1
  {
    res = await request(baseURL)
                  .post(`/spaces/${spaceId1}/tasks`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send({
                    taskname: taskname11,
                    points: points11
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.task.taskname).toEqual(taskname11);
    expect(res.body.task.points).toEqual(points11);
  }

  // Create task12 in spaceId1 by userId1
  {
    res = await request(baseURL)
                  .post(`/spaces/${spaceId1}/tasks`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send({
                    taskname: taskname12,
                    points: points12
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.task.taskname).toEqual(taskname12);
    expect(res.body.task.points).toEqual(points12);
  }

  // Check taskId11 & taskId12 of spaceId1
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId1}/tasks`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.tasks.length).toEqual(2);
    expect(res.body.tasks[0].taskname).toEqual(taskname11);
    expect(res.body.tasks[0].points).toEqual(points11);
    expect(res.body.tasks[0]._id).toBeDefined();
    taskId11 = res.body.tasks[0]._id;
    expect(res.body.tasks[1].taskname).toEqual(taskname12);
    expect(res.body.tasks[1].points).toEqual(points12);
    expect(res.body.tasks[1]._id).toBeDefined();
    taskId12 = res.body.tasks[1]._id;
  }

  // Create task21 in spaceId2 by userId2
  {
    res = await request(baseURL)
                  .post(`/spaces/${spaceId2}/tasks`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send({
                    taskname: taskname21,
                    points: points21
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.task.taskname).toEqual(taskname21);
    expect(res.body.task.points).toEqual(points21);
  }

  // Create task22 in spaceId2 by userId2
  {
    res = await request(baseURL)
                  .post(`/spaces/${spaceId2}/tasks`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send({
                    taskname: taskname22,
                    points: points22
                  });
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.task.taskname).toEqual(taskname22);
    expect(res.body.task.points).toEqual(points22);
  }

  // Check taskId21 & taskId22 of spaceId2
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId2}/tasks`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.tasks.length).toEqual(2);
    expect(res.body.tasks[0].taskname).toEqual(taskname21);
    expect(res.body.tasks[0].points).toEqual(points21);
    expect(res.body.tasks[0]._id).toBeDefined();
    taskId21 = res.body.tasks[0]._id;
    expect(res.body.tasks[1].taskname).toEqual(taskname22);
    expect(res.body.tasks[1].points).toEqual(points22);
    expect(res.body.tasks[1]._id).toBeDefined();
    taskId22 = res.body.tasks[1]._id;
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

// Get sure space activities are empty before each test
beforeEach(async() => {
    
  let res; 

  // Check taskId11 & taskId12 of spaceId1
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId1}/tasks`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.tasks.length).toEqual(2);
    expect(res.body.tasks[0].taskname).toEqual(taskname11);
    expect(res.body.tasks[0].points).toEqual(points11);
    expect(res.body.tasks[0]._id).toBeDefined();
    taskId11 = res.body.tasks[0]._id;
    expect(res.body.tasks[1].taskname).toEqual(taskname12);
    expect(res.body.tasks[1].points).toEqual(points12);
    expect(res.body.tasks[1]._id).toBeDefined();
    taskId12 = res.body.tasks[1]._id;
  }

  // Check activities of spaceId1
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId1}/activities`)
                  .set('Authorization', `Bearer ${jwt1}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.activities.length).toEqual(0);
  }

  // Check taskId21 & taskId22 of spaceId2
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId2}/tasks`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.tasks.length).toEqual(2);
    expect(res.body.tasks[0].taskname).toEqual(taskname21);
    expect(res.body.tasks[0].points).toEqual(points21);
    expect(res.body.tasks[0]._id).toBeDefined();
    taskId21 = res.body.tasks[0]._id;
    expect(res.body.tasks[1].taskname).toEqual(taskname22);
    expect(res.body.tasks[1].points).toEqual(points22);
    expect(res.body.tasks[1]._id).toBeDefined();
    taskId22 = res.body.tasks[1]._id;
  }

  // Check activities of spaceId2
  {
    res = await request(baseURL)
                  .get(`/spaces/${spaceId2}/activities`)
                  .set('Authorization', `Bearer ${jwt2}`)
                  .send();
    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.activities.length).toEqual(0);
  }
});

describe('Spaces activities CRUD (GC)', function() {

  it ('GC: Get/Create/Delete activity - 2 spaces with 0 activities', async function () {
    
    let res; 

    // Check activities of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(0);
    }
  
    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(0);
    }
  })

  it ('GC: Get/Create/Delete activity - 2 spaces 1 activity each', async function () {

    let res;

    // Create activityId11 in spaceId1 by userId1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId11,
                      userId: userId1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activity.username).toEqual(username1);
      expect(res.body.activity.userId).toEqual(userId1);
      expect(res.body.activity.color).toEqual(color1);
      expect(res.body.activity.taskId).toEqual(taskId11);
      expect(res.body.activity.points).toEqual(points11);
      expect(res.body.activity.date).toBeDefined();
    }

    // Create activityId21 in spaceId2 by userId2
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskId: taskId21,
                      userId: userId2
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activity.username).toEqual(username2);
      expect(res.body.activity.userId).toEqual(userId2);
      expect(res.body.activity.color).toEqual(color2);
      expect(res.body.activity.taskId).toEqual(taskId21);
      expect(res.body.activity.points).toEqual(points21);
      expect(res.body.activity.date).toBeDefined();
    }

    // Check activities of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(1);
      expect(res.body.activities[0].username).toEqual(username1);
      expect(res.body.activities[0].userId).toEqual(userId1);
      expect(res.body.activities[0].color).toEqual(color1);
      expect(res.body.activities[0].taskId).toEqual(taskId11);
      expect(res.body.activities[0].points).toEqual(points11);
      expect(res.body.activities[0].date).toBeDefined();
      expect(res.body.activities[0]._id).toBeDefined();
      activityId11 = res.body.activities[0]._id;
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(1);
      expect(res.body.activities[0].username).toEqual(username2);
      expect(res.body.activities[0].userId).toEqual(userId2);
      expect(res.body.activities[0].color).toEqual(color2);
      expect(res.body.activities[0].taskId).toEqual(taskId21);
      expect(res.body.activities[0].points).toEqual(points21);
      expect(res.body.activities[0].date).toBeDefined();
      expect(res.body.activities[0]._id).toBeDefined();
      activityId21 = res.body.activities[0]._id;
    }

    // Delete activityId11 of spaceId1
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      activityId: activityId11
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Check activities of spaceId1
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(0);
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(1);
      expect(res.body.activities[0].username).toEqual(username2);
      expect(res.body.activities[0].userId).toEqual(userId2);
      expect(res.body.activities[0].color).toEqual(color2);
      expect(res.body.activities[0].taskId).toEqual(taskId21);
      expect(res.body.activities[0].points).toEqual(points21);
      expect(res.body.activities[0].date).toBeDefined();
      expect(res.body.activities[0]._id).toBeDefined();
      activityId21 = res.body.activities[0]._id;
    }

    // Delete activityId21 of spaceId2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      activityId: activityId21
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(0);
    }
  });

  it ('GC: Get/Create/Delete activity - 1 space 2 activities (different roles)', async function () {

    let res;

    // Create activityId21 in spaceId2 by userId2
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      taskId: taskId21,
                      userId: userId1
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activity.username).toEqual(username1);
      expect(res.body.activity.userId).toEqual(userId1);
      expect(res.body.activity.color).toEqual(color1);
      expect(res.body.activity.taskId).toEqual(taskId21);
      expect(res.body.activity.points).toEqual(points21);
      expect(res.body.activity.date).toBeDefined();
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(1);
      expect(res.body.activities[0].username).toEqual(username1);
      expect(res.body.activities[0].userId).toEqual(userId1);
      expect(res.body.activities[0].color).toEqual(color1);
      expect(res.body.activities[0].taskId).toEqual(taskId21);
      expect(res.body.activities[0].points).toEqual(points21);
      expect(res.body.activities[0].date).toBeDefined();
      expect(res.body.activities[0]._id).toBeDefined();
      activityId21 = res.body.activities[0]._id;
    }

    // Create activityId22 in spaceId2 by userId1
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId22,
                      userId: userId2
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activity.username).toEqual(username2);
      expect(res.body.activity.userId).toEqual(userId2);
      expect(res.body.activity.color).toEqual(color2);
      expect(res.body.activity.taskId).toEqual(taskId22);
      expect(res.body.activity.points).toEqual(points22);
      expect(res.body.activity.date).toBeDefined();
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(2);
      expect(res.body.activities[0].username).toEqual(username1);
      expect(res.body.activities[0].userId).toEqual(userId1);
      expect(res.body.activities[0].color).toEqual(color1);
      expect(res.body.activities[0].taskId).toEqual(taskId21);
      expect(res.body.activities[0].points).toEqual(points21);
      expect(res.body.activities[0].date).toBeDefined();
      expect(res.body.activities[0]._id).toEqual(activityId21)
      expect(res.body.activities[1].username).toEqual(username2);
      expect(res.body.activities[1].userId).toEqual(userId2);
      expect(res.body.activities[1].color).toEqual(color2);
      expect(res.body.activities[1].taskId).toEqual(taskId22);
      expect(res.body.activities[1].points).toEqual(points22);
      expect(res.body.activities[1].date).toBeDefined();
      expect(res.body.activities[1]._id).toBeDefined();
      activityId22 = res.body.activities[1]._id;
    }

    // Delete activityId21 of spaceId2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      activityId: activityId21
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(1);
      expect(res.body.activities[0].username).toEqual(username2);
      expect(res.body.activities[0].userId).toEqual(userId2);
      expect(res.body.activities[0].color).toEqual(color2);
      expect(res.body.activities[0].taskId).toEqual(taskId22);
      expect(res.body.activities[0].points).toEqual(points22);
      expect(res.body.activities[0].date).toBeDefined();
      expect(res.body.activities[0]._id).toEqual(activityId22);
    }

    // Delete activityId22 of spaceId2
    {
      res = await request(baseURL)
                    .delete(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send({
                      activityId: activityId22
                    });
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
    }

    // Check activities of spaceId2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId2}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.activities.length).toEqual(0);
    }
  });
});

describe('Spaces get activity (BC)', function() {

  it ('BC: Get activity - spaceId does not exists', async function () {

    let res;

    // Check activities of invented space
    {
      res = await request(baseURL)
                    .get(`/spaces/${inventedMongoDbObjectId}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send();
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.activities).not.toBeDefined();
    }
  });
 
  it ('BC: Get activity - user does not exist', async function () {
    
    let res;
    
    // Check activities of spaceId1 with by jwt2
    {
      res = await request(baseURL)
                    .get(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt2}`)
                    .send();
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
      expect(res.body.activities).not.toBeDefined();
    }
  });
});

describe('Spaces create activity (BC)', function() {

  it ('BC: Create activity - spaceId does not exists', async function () {
    let res;

    // Create activity in invented spaceId by user1
    {
      res = await request(baseURL)
                    .post(`/spaces/${inventedMongoDbObjectId}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId11,
                      userId: userId1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }

  });

  it ('BC: Create activity - user who create does not exist', async function () {

    let res;

    // Create activity in invented space
    {
      res = await request(baseURL)
                    .post(`/spaces/${inventedMongoDbObjectId}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId11,
                      userId: userId1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create activity - taskId not provided', async function () {
    
    let res;
    
    // Create activity in spaceId1 by user2 without taskId
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      userId: userId1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create activity - userId not provided', async function () {
    
    let res;

    // Create activity in spaceId1 by user2 without userId
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId11
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create activity - user who performs does not exist', async function () {
    
    let res;

    // Create activity in spaceId1 by user2 without userId
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId11,
                      userId: userId2
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });

  it ('BC: Create activity - taskId does not exist', async function () {
    
    let res;

    // Create activity in spaceId1 by user2 without userId
    {
      res = await request(baseURL)
                    .post(`/spaces/${spaceId1}/activities`)
                    .set('Authorization', `Bearer ${jwt1}`)
                    .send({
                      taskId: taskId21,
                      userId: userId1
                    });
      expect(res.status).toEqual(400);
      expect(res.body.status).toEqual('fail');
    }
  });
});