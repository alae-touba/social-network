-- Demo data imported from the original MongoDB export (database/*.json).
-- Runs once per database; deleting demo rows later is never undone.

INSERT INTO "users" ("id","firstName","lastName","email","password","imageName","registrationDate","role") VALUES ('5efda15c462a3025d11069f6', 'alae', 'touba', 'alae@gmail.com', '$2b$10$v5XO6AFjcpuFBticmclhzueptqRj58c4JUnJFLW1.XY38lMSqbs.2', 'image-1593680220764.jpg', '2020-07-02T08:57:00.833Z', 'USER');
INSERT INTO "users" ("id","firstName","lastName","email","password","imageName","registrationDate","role") VALUES ('5efda187462a3025d11069f7', 'hamza', 'jebbar', 'hamza@gmail.com', '$2b$10$4.GKB6fcdHVtii5AjoDwtOQIqVPGhFWL9/V9triyahd3ZdaRv6SsG', 'image-1593680262984.jpg', '2020-07-02T08:57:43.047Z', 'USER');
INSERT INTO "users" ("id","firstName","lastName","email","password","imageName","registrationDate","role") VALUES ('5efda1a2462a3025d11069f8', 'farid', 'qourebchi', 'farid@gmail.com', '$2b$10$vJn17x0TniEHUuvw5JcLvekRMiaqCVXBd6sJkDXW6FXMemUEYnSWW', 'image-1593680290286.jpg', '2020-07-02T08:58:10.356Z', 'USER');

INSERT INTO "topics" ("id","name","description","imageName","creationDate","userId") VALUES ('5efda1ff462a3025d11069f9', 'java', 'Java is a general-purpose programming language that is class-based, object-oriented, and designed to have as few implementation dependencies as possible. It is intended to let application developers write once, run anywhere (WORA).', 'image-1593680383311.png', '2020-07-02T08:59:43.314Z', '5efda1a2462a3025d11069f8');
INSERT INTO "topics" ("id","name","description","imageName","creationDate","userId") VALUES ('5efda21f462a3025d11069fa', 'Database design', 'Database design is the organization of data according to a logical structure of a database. So the goal is to determine in which manner data can be stored, organized and manipulated. Database design involves classifying data and identifying relationships.', 'image-1593680415229.png', '2020-07-02T09:00:15.236Z', '5efda1a2462a3025d11069f8');
INSERT INTO "topics" ("id","name","description","imageName","creationDate","userId") VALUES ('5efda246462a3025d11069fb', 'algorithms', 'In mathematics and computer science, an algorithm is a finite sequence of well-defined instructions, typically to solve a class of problems such as doing some calculations, data processing, automated reasoning, and other tasks.', 'image-1593680454047.png', '2020-07-02T09:00:54.053Z', '5efda187462a3025d11069f7');
INSERT INTO "topics" ("id","name","description","imageName","creationDate","userId") VALUES ('5efda274462a3025d11069fc', 'data structures', 'A data structure is a data organization, management, and storage format that enables efficient access and modification. More precisely, a DS is a collection of data values, the relationships among them, and the operations that can be applied to the data. ', 'image-1593680500501.png', '2020-07-02T09:01:40.504Z', '5efda187462a3025d11069f7');
INSERT INTO "topics" ("id","name","description","imageName","creationDate","userId") VALUES ('5efda2b1462a3025d11069fd', 'programming', 'Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++.
', 'image-1593680561250.jpeg', '2020-07-02T09:02:41.263Z', '5efda15c462a3025d11069f6');
INSERT INTO "topics" ("id","name","description","imageName","creationDate","userId") VALUES ('5efda2d3462a3025d11069fe', 'javascript', 'JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions. While it is most well-known as the scripting language for Web pages, many non-browser environments also use it, such as Node.js.', 'image-1593680595679.jpg', '2020-07-02T09:03:15.681Z', '5efda15c462a3025d11069f6');

INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efda32e462a3025d11069ff', 'whats the difference between programming and coding?', '2020-07-02T09:04:46.142Z', '5efda1a2462a3025d11069f8', '5efda2b1462a3025d11069fd');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efda33d462a3025d1106a00', 'where is JS mainly used?', '2020-07-02T09:05:01.123Z', '5efda1a2462a3025d11069f8', '5efda2d3462a3025d11069fe');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efda360462a3025d1106a01', 'how do you model a many to many relationship in a relational database management system such as MySql?', '2020-07-02T09:05:36.902Z', '5efda1a2462a3025d11069f8', '5efda21f462a3025d11069fa');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efda39b462a3025d1106a02', 'Can you name the best two programming languages for every area?', '2020-07-02T09:06:35.495Z', '5efda187462a3025d11069f7', '5efda2b1462a3025d11069fd');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efda3c5462a3025d1106a03', 'whats the complexity of a linear search?', '2020-07-02T09:07:17.387Z', '5efda187462a3025d11069f7', '5efda246462a3025d11069fb');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efda3f5462a3025d1106a04', 'is Js class based OO or prototype based OO?', '2020-07-02T09:08:05.827Z', '5efda15c462a3025d11069f6', '5efda2d3462a3025d11069fe');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efdb99cdf11cc35eb769995', 'What are linear and non linear data structures?', '2020-07-02T10:40:28.036Z', '5efda15c462a3025d11069f6', '5efda274462a3025d11069fc');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5efdde63b51dff37e50f4d01', 'What are the various types of relationships in Database? Define them.', '2020-07-02T13:17:23.881Z', '5efda15c462a3025d11069f6', '5efda21f462a3025d11069fa');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5f96dcf1926f3f435fdba312', 'what is some important feature f java 10?', '2020-10-26T14:28:01.821Z', '5efda15c462a3025d11069f6', '5efda1ff462a3025d11069f9');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5f98a3e2ba1ca64512914db7', 'can you explain hashing?', '2020-10-27T22:49:06.935Z', '5efda15c462a3025d11069f6', '5efda246462a3025d11069fb');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5fa748dc6c91e48bae820f2a', 'what is a no sql database?', '2020-11-08T01:24:44.088Z', '5efda15c462a3025d11069f6', '5efda21f462a3025d11069fa');
INSERT INTO "questions" ("id","content","creationDate","userId","topicId") VALUES ('5fa7530f6c91e48bae820f2b', 'comment fonctionne le mot clé this?', '2020-11-08T02:08:15.663Z', '5efda15c462a3025d11069f6', '5efda2d3462a3025d11069fe');

INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efda552462a3025d1106a05', '<p>I will choose:</p>
<p>for <em><strong>front end engineering</strong></em>: JavaScript/TypeScript (i know, they are just one)</p>
<p>for <em><strong>back end engineering</strong></em>: OH, here you are, choose the two that suit you: Java/Python/Php/Node.js(runtime environment)/C#/Ruby/Go</p>
<p>for <em><strong>native android apps</strong></em>: Java/Kotlin</p>
<p>for <em><strong>native ios apps</strong></em>: swift/Objective-C</p>
<p>for <em><strong>cross platform mobile apps</strong></em>: react native/Dart</p>
<p>for <em><strong>data science/machine learning</strong></em>: Python/R</p>
<p>for <em><strong>scripting</strong></em>: Python/Bash</p>
<p>for <em><strong>desktop apps</strong></em>: C++/Java (can we put C# also?)</p>
<p>for <em><strong>s</strong><strong>ystem programming</strong></em>: C/C++</p>
<p>for <em><strong>game programming</strong></em>: C++/C#</p>', '2020-07-02T09:13:54.778Z', '5efda15c462a3025d11069f6', '5efda39b462a3025d1106a02');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efda603462a3025d1106a06', '<p>Here is how:</p> <p> suppose you have two entities: <span style="color: #169179;"><strong>Student</strong></span> and <strong><span style="color: #169179;">Subject.</span></strong> a student can study <strong>many</strong> subjects. And a subject can hav <strong>many</strong> student subscribed to it&nbsp; . </p>    <p> This is a <span style="text-decoration: underline;"><em><strong><span style="color: #e03e2d; text-decoration: underline;">many to many</span></strong></em></span> relationship </p>  <p> we will have an array named students that have for example: student_id, student_name, student_age. and an array named subjects: subject_id, subject_title, subject_hours. </p>    <p>to model the ManyToMany relationship we will have an additional array named <strong>students_subjects </strong>which will have two fields: <strong><em>student_id</em></strong> and <strong><em>subject_id.</em></strong></p><p>a record 1, 2 in this array means that the student with id 1 is subscribed to the subject with id 2.</p>', '2020-07-02T09:16:51.896Z', '5efda15c462a3025d11069f6', '5efda360462a3025d1106a01');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efda696462a3025d1106a07', '<h2><em><strong>O(n) </strong></em></h2>
<p>(where n is the length of the data structure in which you want to search for an element) because at <em>worst</em> you will have to navigate throuh the whole DS to find (or not) your element.</p>', '2020-07-02T09:19:18.814Z', '5efda187462a3025d11069f7', '5efda3c5462a3025d1106a03');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efda715462a3025d1106a08', '<p>At a basic level, <strong>programming</strong> is the process of<em> <span style="color: #000000;">thinking of a solution to a problem </span></em>or <em>finding the right architecture/design for a software</em>&nbsp; or <em>writing the steps of an algorithm in pseudo code</em>, whereas <strong>coding</strong> is <em>just about writing code</em>. meaning translating what you have in mind (the solution to your problem for example) to some lines of code in a programming language.</p>', '2020-07-02T09:21:25.314Z', '5efda15c462a3025d11069f6', '5efda32e462a3025d11069ff');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efda83c462a3025d1106a09', '<p>prototype based object oriented!</p>', '2020-07-02T09:26:20.608Z', '5efda1a2462a3025d11069f8', '5efda3f5462a3025d1106a04');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efda8b8462a3025d1106a0a', '<p><span style="font-family: ''andale mono'', monospace;">It is mainly used to<strong><span style="color: #3598db;"> create dynamic/interactive web apps</span></strong> (front end engineering), but nowadays it is also used extensively for the <strong><span style="color: #e03e2d;">back end with node.js</span></strong> and some framewoks such as express.</span></p>
<p><span style="font-family: ''andale mono'', monospace;">it also used to create <span style="color: #e03e2d;"><strong>cross platfrom mobile apps</strong></span> with react native, desktop apps with electron .. it has also many <span style="color: #3598db;"><strong>machine learning</strong></span> libraries.</span></p>', '2020-07-02T09:28:24.963Z', '5efda187462a3025d11069f7', '5efda33d462a3025d1106a00');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5efdba4cdf11cc35eb769996', '<p>front end.</p>', '2020-07-02T10:43:24.694Z', '5efda15c462a3025d11069f6', '5efda33d462a3025d1106a00');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5f96dd21926f3f435fdba313', '<p>local variable type inference (the var keyword)</p>', '2020-10-26T14:28:49.701Z', '5efda15c462a3025d11069f6', '5f96dcf1926f3f435fdba312');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5f96e46c926f3f435fdba314', '<p>test</p>', '2020-10-26T14:59:56.365Z', '5efda15c462a3025d11069f6', '5efda360462a3025d1106a01');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5f98a3b4ba1ca64512914db6', '<p><span style="color: #169179;"><em><strong>this is a test</strong></em></span></p>', '2020-10-27T22:48:20.906Z', '5efda15c462a3025d11069f6', '5efda32e462a3025d11069ff');
INSERT INTO "answers" ("id","content","creationDate","userId","questionId") VALUES ('5fa7533a6c91e48bae820f2c', '<p><span style="color: #169179;"><em><strong>testing</strong></em></span></p>', '2020-11-08T02:08:58.436Z', '5efda15c462a3025d11069f6', '5efda39b462a3025d1106a02');

INSERT INTO "follows" ("userId","topicId") VALUES ('5efda15c462a3025d11069f6', '5efda21f462a3025d11069fa');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda15c462a3025d11069f6', '5efda2b1462a3025d11069fd');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda15c462a3025d11069f6', '5efda2d3462a3025d11069fe');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda187462a3025d11069f7', '5efda1ff462a3025d11069f9');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda187462a3025d11069f7', '5efda21f462a3025d11069fa');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda187462a3025d11069f7', '5efda274462a3025d11069fc');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda187462a3025d11069f7', '5efda2d3462a3025d11069fe');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda187462a3025d11069f7', '5efda2b1462a3025d11069fd');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda1a2462a3025d11069f8', '5efda1ff462a3025d11069f9');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda1a2462a3025d11069f8', '5efda246462a3025d11069fb');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda1a2462a3025d11069f8', '5efda2b1462a3025d11069fd');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda1a2462a3025d11069f8', '5efda2d3462a3025d11069fe');
INSERT INTO "follows" ("userId","topicId") VALUES ('5efda1a2462a3025d11069f8', '5efda21f462a3025d11069fa');

INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5efda715462a3025d1106a08');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5efda552462a3025d1106a05');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5efda8b8462a3025d1106a0a');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5efda83c462a3025d1106a09');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5efda696462a3025d1106a07');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5efda603462a3025d1106a06');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda15c462a3025d11069f6', '5fa7533a6c91e48bae820f2c');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda187462a3025d11069f7', '5efda8b8462a3025d1106a0a');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda187462a3025d11069f7', '5efda83c462a3025d1106a09');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda187462a3025d11069f7', '5efda603462a3025d1106a06');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda187462a3025d11069f7', '5efda715462a3025d1106a08');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda187462a3025d11069f7', '5efda552462a3025d1106a05');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda1a2462a3025d11069f8', '5efda603462a3025d1106a06');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda1a2462a3025d11069f8', '5efda715462a3025d1106a08');
INSERT INTO "likes" ("userId","answerId") VALUES ('5efda1a2462a3025d11069f8', '5efda552462a3025d1106a05');
