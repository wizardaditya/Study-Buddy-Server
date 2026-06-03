require('dotenv').config();
const mongoose = require('mongoose');

const url = 'mongodb+srv://adityaamishra25_db_user:hXigEmqoGWQ5zNhy@cluster0.dazflmy.mongodb.net/studybuddy?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(url).then(async () => {
  const db = mongoose.connection.db;
  console.log('Connected to MongoDB\n');

  // Delete demo_student and sb_admin users only
  const users = await db.collection('users').deleteMany({ 
    username: { $in: ['demo_student', 'sb_admin'] } 
  });
  console.log('Dummy users deleted  :', users.deletedCount);

  // Delete ALL content (posts, doubts, projects etc)
  const posts         = await db.collection('posts').deleteMany({});
  const doubts        = await db.collection('doubts').deleteMany({});
  const projects      = await db.collection('projects').deleteMany({});
  const comments      = await db.collection('comments').deleteMany({});
  const likes         = await db.collection('likes').deleteMany({});
  const mocktests     = await db.collection('mocktests').deleteMany({});
  const hiringposts   = await db.collection('hiringposts').deleteMany({});
  const topics        = await db.collection('topics').deleteMany({});
  const notifications = await db.collection('notifications').deleteMany({});
  const follows       = await db.collection('follows').deleteMany({});
  const messages      = await db.collection('messages').deleteMany({});
  const rooms         = await db.collection('studyrooms').deleteMany({});
  const aurasessions  = await db.collection('aurasessions').deleteMany({});
  const auramemories  = await db.collection('auramemories').deleteMany({});
  const streaks       = await db.collection('streaks').deleteMany({});
  const testattempts  = await db.collection('testattempts').deleteMany({});
  const subscriptions = await db.collection('subscriptions').deleteMany({});
  const answers       = await db.collection('answers').deleteMany({});
  const mentors       = await db.collection('mentors').deleteMany({});

  console.log('Posts deleted        :', posts.deletedCount);
  console.log('Doubts deleted       :', doubts.deletedCount);
  console.log('Projects deleted     :', projects.deletedCount);
  console.log('Comments deleted     :', comments.deletedCount);
  console.log('Likes deleted        :', likes.deletedCount);
  console.log('MockTests deleted    :', mocktests.deletedCount);
  console.log('HiringPosts deleted  :', hiringposts.deletedCount);
  console.log('Topics deleted       :', topics.deletedCount);
  console.log('Notifications deleted:', notifications.deletedCount);
  console.log('Follows deleted      :', follows.deletedCount);
  console.log('Messages deleted     :', messages.deletedCount);
  console.log('StudyRooms deleted   :', rooms.deletedCount);
  console.log('AuraSessions deleted :', aurasessions.deletedCount);
  console.log('AuraMemories deleted :', auramemories.deletedCount);
  console.log('Streaks deleted      :', streaks.deletedCount);
  console.log('TestAttempts deleted :', testattempts.deletedCount);
  console.log('Subscriptions deleted:', subscriptions.deletedCount);
  console.log('Answers deleted      :', answers.deletedCount);
  console.log('Mentors deleted      :', mentors.deletedCount);

  // Check remaining users
  const remaining = await db.collection('users').find({}).toArray();
  console.log('\nRemaining users:', remaining.map(u => u.username + ' (' + u.role + ')'));
  console.log('\nDB is clean!');

  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
