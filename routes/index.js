var express = require('express');
var passport = require('passport');
var Login_info = require('../models/login');
var student_record = require('../models/student_record');
var courses_completed = require('../models/courses_completed');
var course = require('../models/course');
var courseprereq = require('../models/courseprereq')
var prereq = require('../models/prerequisite');
var router = express.Router();


router.get('/', function (req, res) {
        //find record of the student
        student_record.findOne({ id : req.session.passport.user}).exec(function (err, student){   
            //find courses completed        
            courses_completed.find({ student_id : req.session.passport.user }).exec(function (err, user){
              //Check if user is an admin
              if (req.session.passport.user == "12345678") {
                  course.find({}).exec(function(err, courses) {
                      res.render('admin', {
                          user: req.user,
                          course: courses
                      });
                  })
              } else {
                courseprereq.find({}).sort({order: 1}).exec(function(err, coursep) {
                    res.render('index', {
                        user: req.user,
                        name: student,
                        student_info: user,
                        courseprereq_info: coursep
                    });
                });
              }
            });
    })
});

router.get('/courses',function (req,res){

    course.find({ }, function (err, courses){

        res.json(courses);

    });
});

router.get('/courses/:courseid',function (req,res){

    var courseID = req.params.courseid;
    var fragment1 = courseID.substring(0,4).toUpperCase();
    var fragment2 = courseID.substring(4,7);
    var newString = fragment1 + " " + fragment2;
    course.find({course_name : newString}, function (err, courses){

        res.json(courses);

    });
});

router.get('/courses/fall/:courseid',function (req,res){

    var courseID = req.params.courseid;
    var fragment1 = courseID.substring(0,4).toUpperCase();
    var fragment2 = courseID.substring(4,7);
    var newString = fragment1 + " " + fragment2;
    course.find({course_name : newString, semester: "fall"}, function (err, courses){

        res.json(courses);

    });
});

router.get('/courses/winter/:courseid',function (req,res){

    var courseID = req.params.courseid;
    var fragment1 = courseID.substring(0,4).toUpperCase();
    var fragment2 = courseID.substring(4,7);
    var newString = fragment1 + " " + fragment2;
    course.find({course_name : newString, semester: "winter"}, function (err, courses){

        res.json(courses);

    });
});

router.get('/courses_completed/:studentid',function (req,res){

    courses_completed.find({ student_id: req.params.studentid }, function (err, courses){

        res.json(courses);

    });
});

router.post('/courses_completed',function (req, res) {
        var course = new courses_completed();
        course.course_id = req.body.course_id;
        course.student_id = req.body.student_id;
        course.course_name = req.body.course_name;
        course.credits = req.body.credits;

        course.save(function(err) {
            if(err)
                res.send(err);
            res.json({message: 'course completed added for the student'});
        });
});

router.put('/student_record/first_name/:studentid', function (req, res) {
    student_record.findOne(req.params.studentid, function(err, student) {

      if(err)
        res.send(err);

      student.first_name = req.body.first_name;

      student.save(function (err) {
        if(err)
          res.send(err);

        res.json({ message: 'student record updated!'});
      });

    });
});

router.put('/student_record/last_name/:studentid', function (req, res) {
    student_record.findOne(req.params.studentid, function(err, student) {

      if(err)
        res.send(err);

      student.last_name = req.body.last_name;

      student.save(function (err) {
        if(err)
          res.send(err);

        res.json({ message: 'student record updated!'});
      });

    });
});


router.get('/prereq', function (req, res){
    prereq.find({}).exec(function (err, prereqs){
         res.json(prereqs);
     });
 });

router.get('/sequence', function (req, res) {
    courseprereq.find({}).exec(function (err, coursep) {
      res.json(coursep); 
    })
})

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.get('/setting', function(req, res) {
    res.render('setting', { });
});
router.post('/register', function(req, res, next) {
    Login_info.register(new Login_info({ username : req.body.username }), req.body.password, function(err, login) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});


router.get('/login', function(req, res) {
    res.render('login', { user : req.user, message : req.flash('error')});
});

router.get('/failedLogin', function(req,res) {
    res.render('failedLogin', { user : req.user, message : req.flash('error')});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/failedLogin', failureFlash: true }), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/student_record', function(req, res) {
    student_record.find({}, function (err, docs) {
        res.json(docs);
    });
});


router.post('/addCourse', function(req, res) {
    var newCourse = new course({
   course_name: req.body.course_name,
   type: req.body.course_type,
   Tut:req.body.course_section,
   days: req.body.course_days,
   start: req.body.course_start_time,
   end: req.body.course_end_time,
   room: req.body.course_room,
   semester:req.body.course_semester
});
    newCourse.save(function (err, course) {
        if (err) {
        return err;
  }
  else {
    console.log("Post saved, added :" + course.course_name);
  }
    });
    res.redirect('/');
});

router.post('/removeCourse', function(req, res) {
/*  
  var newCourse = new course({
   course_name: req.body.course_name,
   type: req.body.course_type,
   Tut: req.body.course_section,
   days: req.body.course_days,
   start: req.body.course_start_time,
   end: req.body.course_end_time,
   room: req.body.course_room,
   semester:req.body.course_semester
});
*/
var query = {
	course_name : req.body.course_name,
	type : req.body.course_type,
	Tut : req.body.course_section,
	days: req.body.course_days,
	start: req.body.course_start_time,
	end: req.body.course_end_time,
	room: req.body.course_room,
	semester:req.body.course_semester
}
  course.remove(query ,function (err, res) {
  if (err) {
    return err;
  }
    });
    res.redirect('/');
});


 router.get('/courses',function (req,res){

    course.find({course_name : "COMP 248"}, function (err, courses){

        res.render('courses', {course: courses});

    });
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
