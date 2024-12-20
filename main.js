var express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
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
    database: 'yogadb',
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


app.post(AppName + "/getuserlogin", (req, res) => {
    const username = req.body.username;
    const userpassword = req.body.userpassword;


    con.query("SELECT * FROM `usermaster` WHERE `username`= ? and `userpassword`= ? and status = 0 ", [username, userpassword], (err, result) => {
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

app.post(AppName + "/addusermasterheader", (req, res) => {
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



// user dashboard video shoewed
app.post(AppName + '/addVideoDashboard', (req, res) => {
    const { content, youtubelink, coursename, date } = req.body;


    if (!content || !youtubelink || !coursename || !date) {
        return res.status(400).json({
            status: false,
            message: 'All fields (content, youtubelink, coursename,date) are required.',
        });
    }

    const query = `
        INSERT INTO youtubelink (content, youtubelink, coursename,date)
        VALUES ( ?, ?, ?,?)
    `;
    const values = [content, youtubelink, coursename, date];

    con.query(query, values, (err, results) => {
        if (err) {
            console.error('Database insert failed:', err.message);
            return res.status(500).json({
                status: false,
                message: `Database insert failed: ${err.message}`,
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Video added successfully!',
        });
    });
});


// Route to fetch videos
app.get(AppName + '/getVideos', (req, res) => {
    const query = 'SELECT * FROM youtubelink WHERE active = "yes" AND status=0';

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


app.post(AppName + '/getVideos', (req, res) => {
    const query = 'SELECT * FROM youtubelink ';

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
app.post(AppName + '/addenroll', (req, res) => {
    const { courseId, courseName, createdBy, } = req.body;
    const createdDateTime = new Date();

    con.query('SELECT count(*)as count FROM `enroll` WHERE `courseid`= ? and `createdby`= ?', [courseId, createdBy], (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err.message
            });
        } else if (result[0].count > 0) {
            res.status(200).json({
                status: false,
                message: "Already Enrolled This Course!" // Send back the error message
            });
        } else {
            const query = 'INSERT INTO enroll (courseid, coursename, createdby,createddatetime) VALUES (?, ?, ?, ?)';
            con.query(query, [courseId, courseName, createdBy, createdDateTime,], (err, results) => {
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

app.post(AppName + '/getenroll', (req, res) => {
    con.query('SELECT * FROM `enroll` WHERE  `createdby`= ?', [req.body.createdBy], (err, result) => {
        console.log(req.body.createdBy);
        if (err) {
            res.status(200).json({
                status: false,
                message: err.message // Send back the error message
            });
        } else {
            res.status(200).json({
                status: true,
                message: result

            });
        }
    });
});

//Course master
app.post(AppName + "/addcoursemaster", (req, res) => {

    const coursename = req.body.coursename;


    con.query('INSERT INTO coursemaster (`coursename`) VALUES ( ?)', [coursename], (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: err
            });
        } else {
            res.status(200).json({
                status: true,
                message: 'Course Created Successfully!'
            });
        }
    });
});

app.post(AppName + '/getcoursemaster', (req, res) => {
    con.query('Select id,coursename,status from `coursemaster`', (err, result) => {
        // where `status`= 0
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
app.delete(AppName + '/deleteCourseMasterId', (req, res) => {
    const { id, coursename } = req.body;

    con.query('DELETE FROM `coursemaster` WHERE id =? AND coursename =?', [id, coursename], (err, result) => {
        if (err) {
            return res.status(400).json({
                status: false,
                message: err.message
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Course Deleted Successfully'
            });
        }
    });
});

app.delete(AppName + '/deleteUserMasterId', (req,res) => {
    const {id, username} = req.body;

    con.query('DELETE FROM `usermaster` WHERE id=? AND username= ?',[id,username], (err,result) => {
        if(err){
            return res.status(400).json({
                status: false,
                message: err.message
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Username Deleted Successfully'
            });
        }
    });
});


app.delete(AppName + '/deleteVideoMasterId', (req,res) =>{
    const {id,coursename} = req.body;

    con.query('DELETE FROM `youtubelink` WHERE id =? AND coursename =?',[id,coursename], (err,result) =>{
        if(err){
            return res.status(400).json({
                status: false,
                message: err.message
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Video deleted successfully"
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

//Myscore
app.post(AppName + '/addmyscore', (req, res) => {
    const { courseId, coursename, occurance, remarks, createdBy, date } = req.body;

    const createdDateTime = new Date();

    con.query('SELECT count(*)as count,docno FROM myscore WHERE courseid=? and createdby=? and date=? ', [courseId, createdBy, date], (err, result) => {
        console.log(result)

        if (err) {
            res.status(200).json({
                status: false,
                message: err.message // Send back the error message
            });
        } else if (result[0].count == 0) {

            con.query('INSERT INTO myscore (date,courseid, coursename,occurance,remarks,createdby) VALUES (?,?,?,?,?,?)', [date, courseId, coursename, occurance, remarks, createdBy,], (err, results) => {
                if (err) {

                    return res.status(500).json({
                        status: false,
                        message: err,
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: 'My Score submitted successfully!',
                });
            });
        } else {
            console.log(result[0].docno);
            con.query('UPDATE myscore SET occurance= ?,remarks= ? WHERE docno= ?', [occurance, remarks, result[0].docno], (err, results) => {
                if (err) {

                    return res.status(500).json({
                        status: false,
                        message: err,
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: 'My Score updated successfully!',
                });
            });

        }
    });
});

//MonthWiseReport(Myscore)
app.post(AppName + '/monthWiseReport', (req, res) => {
    const { year, month, createdBy } = req.body;

    console.log("Received year:", year);
    console.log("Received month:", month);
    console.log("Received createdBy:", createdBy);
    con.query(
        "SELECT count(*) as count FROM `myscore` WHERE YEAR(DATE) = ? AND MONTH(DATE) = ? AND createdBy = ?  ",
        [year, month, createdBy],
        (err, result) => {
            if (err) {
                return res.status(500).json({ status: false, message: err.message });
            }

            console.log("Count result:", result[0].count);

            if (result[0].count > 0) {
                con.query(
                    "SELECT SUM(occurance) as occurance, coursename, remarks, DATE_FORMAT(date, '%d/%m/%Y') as 'date' " +
                    "FROM `myscore` WHERE YEAR(DATE) = ? AND MONTH(DATE) = ?  AND createdBy = ? " +
                    "GROUP BY coursename, date, remarks",
                    [year, month, createdBy],
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({ status: false, message: err.message });
                        }
                        console.log("Query result:", result);
                        return res.status(200).json({ status: true, message: result });
                    }
                );
            } else {
                return res.status(200).json({ status: false, message: "No Data" });
            }
        }
    );
});


//DateWiseReport(MyScore)
app.post(AppName + '/dateWiseReport', (req, res) => {

    con.query("SELECT count(*)as count FROM `myscore` where  DATE IN (?) AND createdBy = ?", [req.body.date, req.body.createdBy], (err, result) => {

        if (err) {
            res.status(200).json({
                status: false,
                message: err.message
            });
        } else if (result[0].count > 0) {
            con.query("SELECT SUM(occurance)as occurance,remarks,coursename,DATE_FORMAT(date,'%d/%m/%Y') as 'Currentdate' FROM `myscore` where  DATE IN (?) AND createdBy = ? GROUP by coursename,date,remarks", [req.body.date, req.body.createdBy], (err, result) => {
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

        } else {
            res.status(200).json({
                status: false,
                message: "No Data"
            });
        }
        //console.log(result)
    });

});

// //CourseNameWiseReport(MyScore)
app.post(AppName + '/courseNameWiseReport', (req, res) => {
    con.query("SELECT count(*) as count FROM `myscore` where createdby=? and coursename=?",
        [req.body.createdBy, req.body.coursename], (err, result) => {

            if (err) {
                return res.status(200).json({
                    status: false,
                    message: err.message
                });
            }
            if (result[0].count > 0) {
                con.query("SELECT SUM(occurance) as occurance, remarks, coursename, DATE_FORMAT(date, '%d/%m/%Y') as 'Currentdate' FROM `myscore` where createdby=?  and coursename=? GROUP BY coursename, date, remarks",
                    [req.body.createdBy, req.body.coursename], (err, result) => {
                        if (err) {
                            return res.status(200).json({
                                status: false,
                                message: err.message
                            });
                        }
                        return res.status(200).json({
                            status: true,
                            message: result
                        });
                    });
            } else {
                return res.status(200).json({
                    status: false,
                    message: "No Data"
                });
            }
        });
});


//superuser coursenamewise(newdashboard)
// app.post(AppName + '/courseWiseReport', (req, res) => {
//     con.query(
//         "SELECT count(*) as count FROM `myscore` m INNER JOIN `usermaster` u ON m.createdby = u.id WHERE m.createdby = ? AND m.coursename = ? AND u.username = ?",
//         [req.body.createdBy, req.body.coursename, req.body.username],
//         (err, result) => {
//             if (err) {
//                 return res.status(200).json({
//                     status: false,
//                     message: err.message
//                 });
//             }
//             if (result[0].count > 0) {
//                 con.query(
//                     "SELECT SUM(m.occurance) as occurance, m.remarks, m.coursename, DATE_FORMAT(m.date, '%d/%m/%Y') as 'Currentdate' FROM `myscore` m INNER JOIN `usermaster` u ON m.createdby = u.id WHERE m.createdby = ? AND m.coursename = ? AND u.username = ? GROUP BY m.coursename, m.date, m.remarks",
//                     [req.body.createdBy, req.body.coursename, req.body.username],
//                     (err, result) => {
//                         if (err) {
//                             return res.status(200).json({
//                                 status: false,
//                                 message: err.message
//                             });
//                         }
//                         return res.status(200).json({
//                             status: true,
//                             message: result
//                         });
//                     }
//                 );
//             } else {
//                 return res.status(200).json({
//                     status: false,
//                     message: "No Data"
//                 });
//             }
//         }
//     );
// });

app.post(AppName + '/courseWiseReport', (req, res) => {
    const { coursename, username } = req.body;


    const query = `
        SELECT 
        m.occurance, m.remarks, m.coursename, DATE_FORMAT(m.date, '%d/%m/%Y') as 'Currentdate'
        
        FROM myscore m
        INNER JOIN coursemaster c ON m.coursename = c.coursename
        INNER JOIN usermaster u ON m.createdby = u.id
        WHERE m.coursename = ? 
          AND u.username = ?;
    `;

    con.query(query, [coursename, username], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Server error: ${err.message}`,
            });
        }

        if (result.length > 0) {
            return res.status(200).json({
                status: true,
                message: result,
            });
        } else {
            return res.status(404).json({
                status: false,
                message: "No Data",
            });
        }
    });
});

//monthwise report super user
app.post(AppName + '/monthWiseReportuser', (req, res) => {
    const { username, month, year } = req.body;


    if (!username || !month || !year) {
        return res.status(400).json({
            status: false,
            message: "Invalid or missing parameters",
        });
    }

    const dataQuery = `
        SELECT 
            SUM(m.occurance) AS occurance, 
            m.remarks, 
            m.coursename, 
            DATE_FORMAT(m.date, '%d/%m/%Y') AS 'date'
        FROM myscore m
        INNER JOIN coursemaster c ON m.coursename = c.coursename
        INNER JOIN usermaster u ON m.createdby = u.id 
        WHERE m.createdby = (SELECT id FROM usermaster WHERE username = ?)
        AND YEAR(m.date) = ?
        AND MONTH(m.date) = ?
        GROUP BY m.coursename, m.date, m.remarks;
    `;


    con.query(dataQuery, [username, year, month], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Database error: ${err.message}`,
            });
        }


        if (result.length === 0) {
            return res.status(200).json({
                status: false,
                message: "No data found for the given parameters",
            });
        }


        return res.status(200).json({
            status: true,
            message: result,
        });
    });
});


//AllUserWiseReport

app.post(AppName + '/allUserWiseReport', (req, res) => {
    const { month, year } = req.body;

    if (!month || !year) {
        return res.status(400).json({
            status: false,
            message: "Invalid or missing parameters",
        });
    }

    const dataQuery = `
        SELECT 
            u.username,
            SUM(m.occurance) AS occurance, 
            m.remarks, 
            m.coursename, 
            DATE_FORMAT(m.date, '%d/%m/%Y') AS 'date'
        FROM myscore m
        INNER JOIN coursemaster c ON m.coursename = c.coursename
        INNER JOIN usermaster u ON m.createdby = u.id 
        WHERE YEAR(m.date) = ?
        AND MONTH(m.date) = ?
        GROUP BY u.username, m.coursename, m.date, m.remarks;
    `;

    con.query(dataQuery, [year, month], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Database error: ${err.message}`,
            });
        }

        if (result.length === 0) {
            return res.status(200).json({
                status: false,
                message: "No data found for the given parameters",
            });
        }

        return res.status(200).json({
            status: true,
            message: result,
        });
    });
});


//upload video

// app.post(AppName + '/addUploadvideos', (req, res) => {
//     const { courseId, courseName, createdBy, date, videoUrl, description } = req.body;


//     const query = 'INSERT INTO `youtubelink` (courseid, coursename, createdby, date, videourl, description) VALUES (?, ?, ?, ?, ?, ?)';

//     con.query(query, [courseId, courseName, createdBy, date, videoUrl, description], (err, results) => {
//         if (err) {
//             return res.status(500).json({
//                 status: false,
//                 message: err.message || 'An error occurred while uploading the video',
//             });
//         }

//         return res.status(200).json({
//             status: true,
//             message: 'Video submitted successfully!',
//         });
//     });
// });


//     });

// });

// get uploaded videos
app.post(AppName + '/getuploadvideo', (req, res) => {
    const coursename = req.body.coursename;
    const createdBy = req.body.createdBy;

    if (!coursename) {
        return res.status(400).json({
            status: false,
            message: "coursename is required"
        });
    }

    con.query(
        "SELECT COUNT(*) as count FROM `videos` WHERE coursename = ? AND createdBy = ?",
        [coursename, createdBy],
        (err, result) => {
            if (err) {
                res.status(200).json({
                    status: false,
                    message: err.message
                });
            } else if (result[0].count > 0) {
                con.query(
                    "SELECT videourl, description, date, coursename FROM `videos` WHERE coursename = ? AND createdBy = ? GROUP BY videourl, description ORDER BY docno ASC",
                    [coursename, createdBy],
                    (err, result) => {
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
                    }
                );
            } else {
                res.status(200).json({
                    status: false,
                    message: "No Data"
                });
            }
        }
    );
});


// usermaster
app.post(AppName + '/getusermaster', (req, res) => {
    con.query('SELECT * FROM `usermaster` ', (err, result) => {

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

//videoMaster
app.post(AppName + '/getvideomaster', (req, res) => {
    con.query('SELECT * FROM `videos` ', (err, result) => {

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


//active inactive for status useramster
app.post(AppName + '/getupdateuserstatus', (req, res) => {

    console.log(req.body);

    const { userId, status } = req.body;

    if (!userId || !status) {
        return res.status(400).json({
            status: false,
            message: 'UserId or Status not provided',
        });
    }

    con.query(
        'UPDATE `usermaster` SET `status` = ? WHERE `id` = ?',
        [status, userId],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).json({
                    status: false,
                    message: err.message,
                });
            } else {
                console.log('Query result:', result);
                return res.status(200).json({
                    status: true,
                    message: 'Status updated successfully',
                });
            }
        }
    );
});



//active inactive for status videomaster
app.post(AppName + '/getupadtevideostatus', (req, res) => {

    console.log(req.body);

    const { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({
            status: false,
            message: 'id or Status not provided',
        });
    }

    con.query(
        'UPDATE `youtubelink` SET `status` = ? WHERE `id` = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).json({
                    status: false,
                    message: err.message,
                });
            } else {
                console.log('Query result:', result);
                return res.status(200).json({
                    status: true,
                    message: 'Status updated successfully',
                });
            }
        }
    );
});



//active inactive for status coursemaster
app.post(AppName + '/getupadtecoursestatus', (req, res) => {

    console.log(req.body);

    const { id, status } = req.body;

    if (!id || !status) {
        return res.status(400).json({
            status: false,
            message: 'id or Status not provided',
        });
    }

    con.query(
        'UPDATE `coursemaster` SET `status` = ? WHERE `id` = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).json({
                    status: false,
                    message: err.message,
                });
            } else {
                console.log('Query result:', result);
                return res.status(200).json({
                    status: true,
                    message: 'Status updated successfully',
                });
            }
        }
    );
});



// usermaster superuser report page
app.post(AppName + '/getusermasterreport', (req, res) => {
    // const id = req.body.id;

    con.query('SELECT id, username,status FROM `usermaster`', (err, result) => {
        if (err) {

            res.status(500).json({
                status: false,
                message: 'Database error: ' + err.message
            });
        } else {

            res.status(200).json({
                status: true,
                message: result
            });
        }
    });
});



//addNewUser
app.post(AppName + '/addNewUser', (req, res) => {
    const firstname = req.body.firstname;
    const username = req.body.username;
    const userpassword = req.body.userpassword;
    const mailid = req.body.mailid;
    const issuperuser = req.body.issuperuser;
    const phoneno = req.body.phoneno;
    const countrycode = req.body.countrycode;


    con.query(
        "INSERT INTO usermaster(firstname, username, userpassword, mailid, issuperuser,phoneno,countrycode) VALUES (?,?,?,?,?,?,?)",
        [firstname, username, userpassword, mailid, issuperuser,phoneno,countrycode],
        (err, result) => {
            if (err) {
                res.status(200).json({
                    status: false,
                    message: err.message,
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: "User Added Successfully!",
                });
            }
        }
    );
});
