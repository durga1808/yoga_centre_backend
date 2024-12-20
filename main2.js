var express = require("express");
const req = require("express/lib/request");
const { status } = require("express/lib/response");
var mysql = require("mysql");
var app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
var AppName = "/YogaApp";

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'yogacentredb',
    dialectOptions: { decimalNumbers: true },
    supportBigNumbers: true
});


app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected!!');
    }
});

app.get(AppName + '/', (req, res) => {
    res.send('Server is Working fine');
});


app.post(AppName+"/getuserlogin", (req, res) => {
    const username = req.body.username;
    const userpassword = req.body.userpassword;

    con.query("SELECT * FROM `usermaster` WHERE `username`= ? and `userpassword`= ? and `status`= 0 ", [username, userpassword], (err, result) => {
        // console.log(!result.length);
        if (err) {
            return res.status(200).json({
                status: false,
                message: err
            });
        } else if (!result.length) {
            return res.status(200).json({
                status: false,
                message: "Invalid username and password!"
            });
        }

        return res.status(200).json({
            status: true,
            message: result
        });
    });
});



//Usermaster header

app.post(AppName+"/addusermasterheader", (req, res) => {
    var jsondata = req.body;
    con.query("INSERT INTO usermaster SET ? ", jsondata, (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err
            });
        } else {
            res.status(200).json({
                status: true,
                resultid: result.insertId,
                message: 'Insert Successfully!'
            });
        }
    });
});



// Route to add a video without fromdate and todate
app.post(AppName + '/addVideoWithoutDate', (req, res) => {
    const { id, content, youtubelink, active, coursename } = req.body;

    if (!id || !content || !youtubelink || !active || !coursename) {
        return res.status(400).json({
            status: false,
            message: 'All fields (id, content, youtubelink, active, coursename) are required',
        });
    }

    const query = 'INSERT INTO youtubelink (id, content, youtubelink, active, coursename) VALUES (?, ?, ?, ?, ?)';
    const values = [id, content, youtubelink, active, coursename];

    con.query(query, values, (err, results) => {
        if (err) {
            console.error('Database insert failed:', err); 
            return res.status(500).json({
                status: false,
                message: `Database insert failed: ${err.message}`, 
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Video added successfully',
        });
    });
});

// Route to fetch videos
app.get(AppName+'/getVideos', (req, res) => {
    const query = 'SELECT * FROM youtubelink WHERE active = "yes"';

    con.query(query, (err, results) => {  
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({
                status: false,
                message: 'Database query failed',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Videos fetched successfully',
            data: results
        });
    });
});

// Endpoint to enroll in a course
app.post(AppName+'/enroll', (req, res) => {
    const { courseId, courseName, createdBy, } = req.body; 
    const createdDateTime = new Date(); 

    con.query('SELECT count(*)as count FROM `enrollmaster` WHERE `courseid`= ? and `createdby`= ?',[courseId,createdBy],(err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err.message
            });
        } else if(result[0].count > 0) {
            res.status(200).json({
                status: false,
                message: "Already Enrolled This Course!" 
            });
        }else{
            const query = 'INSERT INTO enrollmaster (courseid, coursename, createdby, createddatetime) VALUES (?, ?, ?, ?)';
            con.query(query, [courseId, courseName, createdBy, createdDateTime], (err, results) => {
                if (err) {
                   
                    return res.status(500).json({
                        status: false,
                        message: err,
                    });
                }
        
                return res.status(200).json({
                    status: true,
                    message: 'Course Enrolled successfully!',
                });
            });
        }
    });
   
});




//Course master

app.get(AppName+'/getcoursemaster', (req, res) => {
    con.query('Select * from coursemaster where `status`= 0', (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err
            });
        } else {
            res.status(200).json({
                status: true,
                message: result
            });
        }
    });
});

/*

app.post(AppName + '/storeenroll', (req, res) => {
    // const { id, coursename } = req.body; 
    const { coursename } = req.body;

    con.query('SELECT * FROM `enrollmaster` WHERE `courseid`= ? and `createdby`= ?',[],(err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err.message // Send back the error message
            });
        } else {
            res.status(200).json({
                status: true,
                message: 'Enrollment successful!'
            });
        }
    });
    con.query('INSERT INTO enroll (`coursename`) VALUES ( ?)', [ coursename], (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err.message // Send back the error message
            });
        } else {
            res.status(200).json({
                status: true,
                message: 'Enrollment successful!'
            });
        }
    });
});
*/
app.post(AppName + '/addmyscore', (req, res) => {
    console.log('Request body:', req.body); 
    const { date, coursename, occurance, remarks, createdBy, courseid } = req.body; 
    if (!courseid) {
        return res.status(400).json({
            status: false,
            message: 'courseid is required.'
        });
    }

    con.query('INSERT INTO myscore(`date`, `courseid`, `coursename`, `occurance`, `remarks`, `createdby`) VALUES (?, ?, ?, ?, ?, ?)', 
    [date, courseid, coursename, occurance, remarks, createdBy], 
    (err, result) => {
        if (err) {
            console.error('Database error:', err); 
            res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: err.message, 
            });
        } else {
            res.status(200).json({
                status: true,
                message: 'Data inserted successfully!',
                result: result
            });
        }
    });
});

app.post(AppName + '/myscore', (req, res) => {
    //console.log("Received request for /myscore");
    con.query("SELECT DATE_FORMAT(date, '%d-%m-%Y')as'date',SUM(occurance)as'occurance' FROM `myscore` where createdby=? and courseid=? and MONTH(DATE) IN (?) GROUP BY date",[req.body.createdBy,req.body.courseId,req.body.date], (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err.message
            });
        } else {
            res.status(200).json({
                status: true,
                message: result
            });
        }
    });
});
