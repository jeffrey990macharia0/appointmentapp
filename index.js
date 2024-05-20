/**
 * Copyright 2024 HRMIS
 * All rights reserved.
 *
 */

var bodyParser = require('body-parser');
var XM = require('xhr2');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var mysql = require('mysql');
var util = require('util');
var cors=require('cors')
var session=require('express-session')
var path = require('path')
const CsvParser = require("json2csv").Parser;

//Setup the database credentials
const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "appointments"
});

app.use(session({
    secret:"appointment",
    resave: false,
    saveUninitialized: false
}))

app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(cors())

var received_updates = [];
const port = 3000

app.get('/', async (req, res, next) => {
    res.sendFile(__dirname + '/views/auth/login.html');
});

app.get('/admin-home', async (req, res, next) => {
    res.sendFile(__dirname + `/views/admin/home.html`);
});

app.get('/register', async (req, res, next) => {
    res.sendFile(__dirname + `/views/auth/register.html`);
});

app.get('/users', async (req, res, next) => {
    res.sendFile(__dirname + `/views/admin/adduser.html`);
});

app.get('/patients', async (req, res, next) => {
    res.sendFile(__dirname + `/views/admin/addpatient.html`);
});

app.get('/employees', async (req, res, next) => {
    res.sendFile(__dirname + `/views/admin/addemployee.html`);
});

app.get('/appointments', async (req, res, next) => {
    res.sendFile(__dirname + `/views/admin/appointments.html`);
});



// Patients Functions
app.get('/patient-home/:uid', async (req, res, next) => {
    const uid = req.params.uid;
    res.render(__dirname + `/views/patient/home.html`,{uid:uid});
});
app.get('/appointmenthistory/:uid', async (req, res, next) => {
    const uid = req.params.uid;
    res.render(__dirname + `/views/patient/addappointment.html`,{uid:uid});
});

app.get('/datasharing/:uid', async (req, res, next) => {
    const uid = req.params.uid;
    res.render(__dirname + `/views/patient/optin.html`,{uid:uid});
});
// Patients Functions

app.get('/lab-home', async (req, res, next) => {
    res.sendFile(__dirname + `/views/labspecialist/home.html`);
});

app.get('/doctor-home', async (req, res, next) => {
    res.sendFile(__dirname + `/views/doctor/home.html`);
});



let redirect=""

//1. POST endpoint for login 
app.post('/login', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            
            var query="SELECT * FROM users WHERE email=? and password=?"
      

            connection.query(query,[req.body.username,req.body.password],(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }
               

                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.get('/all-appointmentdetails', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            
            var query="SELECT * FROM appointment left join employee on employee.employee_id=appointment.employee_id left join patient on patient.patient_id=appointment.patient_id "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }
               

                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.get('/all-doctors', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            
            var query="SELECT * FROM employee where employee_category=? "
      

            connection.query(query,['doctor'],(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }
               

                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.get('/all-employees', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT COUNT(*) as total FROM employee "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});
app.get('/all-patients', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT COUNT(*) as total FROM patient "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

app.get('/all-appointments', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT COUNT(*) as total FROM appointment "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

app.post('/patientappointments', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            var user_id=req.body.user_id;
            var get_patient_id="SELECT * FROM users left join patient on users.email=patient.patient_email where user_id=?";

            var query="SELECT * FROM appointment left join employee on appointment.employee_id=employee.employee_id where patient_id=? "
      

            connection.query(get_patient_id,[user_id],(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }
               

                if(data.length>0){
                    var patient_id="";

                    data.forEach(function (item){
                        patient_id=item.patient_id
                    });
                    connection.query(query,[patient_id],(err, data) => {
                        if(err) {
                            console.error(err);
                            return;
                        }
                        if(data.length>0){
                            res.send(data)
                         }else{
                            redirect="-1"
                            res.send(redirect)
                        }

                       
                    });
                     

                }else{
                    redirect="-1"
                    
                }
                

                
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.get('/all-tests', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT * FROM heart_clinical_tests left join users on heart_clinical_tests.user_id=users.user_id left join patient on patient.patient_email=users.email "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

app.get('/testbyid', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT * FROM heart_clinical_tests left join users on heart_clinical_tests.user_id=users.user_id left join patient on patient.patient_email=users.email where heart_clinical_tests.user_id=? "
      
            connection.query(query,[req.query.user_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    redirect=data
                }else{
                    redirect="-1"
                }
                

                res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//


app.get('/download', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT * FROM heart_clinical_tests left join users on heart_clinical_tests.user_id=users.user_id left join patient on patient.patient_email=users.email "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    redirect=data
                    var rows=[]

                    const csvFields = ["Age","Sex","Chest_Pain_Type","Resting_Blood_Pressure","Serum_Cholestrol","Fasting_Blood_Sugar","Resting_Electrocardiographic_Results","Max_Heart_Rate","Exercise_Induced_Angina","ST_Depression_Induced_By_Exercise","ST_Segment_Slope","Colored_Major_Vessels","Thalesamia","Heart_disease_presence"]
                    data.forEach((item) => {
                      const { patient_age,patient_gender,chest_pain_type,resting_blood_pressure,serum_cholestrol,fasting_blood_sugar,resting_electrocardiographic_results,max_heart_rate,exercise_induced_angina,st_depression_induced_by_exercise,st_segment_slope,colored_major_vessels,thalassemia,presence } = item;
                      rows.push({patient_age,patient_gender,chest_pain_type,resting_blood_pressure,serum_cholestrol,fasting_blood_sugar,resting_electrocardiographic_results,max_heart_rate,exercise_induced_angina,st_depression_induced_by_exercise,st_segment_slope,colored_major_vessels,thalassemia,presence})
                    });

                    const csvParser = new CsvParser({ csvFields });
                    const csvData = csvParser.parse(rows);

                    res.setHeader("Content-Type", "text/csv");
                    res.setHeader("Content-Disposition", "attachment; filename=heart_disease_dataset.csv");

                    res.status(200).end(csvData);

                }else{
                    redirect="-1"
                }
                

                // res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

app.get('/downloadjson', async (req, res, next) => {
    let redirect="";

     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT patient_age,patient_gender,chest_pain_type,resting_blood_pressure,serum_cholestrol,fasting_blood_sugar,resting_electrocardiographic_results,max_heart_rate,exercise_induced_angina,st_depression_induced_by_exercise,st_segment_slope,colored_major_vessels,thalassemia,presence FROM heart_clinical_tests left join users on heart_clinical_tests.user_id=users.user_id left join patient on patient.patient_email=users.email "
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    res.setHeader("Content-Type", "application/json");
                    res.setHeader("Content-Disposition", "attachment; filename=heart_disease_dataset.json");

                    res.status(200).end(JSON.stringify(data));

                }else{
                    redirect="-1"
                }
                

                // res.send(redirect)
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

app.get('/viewusers', async (req, res, next) => {
    let redirect="";
    
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            var query="SELECT * from users"
      
            connection.query(query,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    res.send(data)
                }else{
                    redirect="-1"
                }
                

                
            }); 
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});


app.post('/patientappointmentsbyid', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            var appointment_id=req.body.appointment_id;
            var query="SELECT * FROM appointment left join employee on appointment.employee_id=employee.employee_id where appointment_id=? "

            connection.query(query,[appointment_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                if(data.length>0){
                    res.send(data)
                }else{
                    redirect="-1"
                    res.send(redirect)
                }         
            });
                     
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.put('/updateappointmentbyid', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

        
            var appointment_id=req.body.appointment_id;
            var date=req.body.date;
            var time=req.body.time;
            var status=req.body.status;
            var employee_id=req.body.employee_id;
            

            var query="UPDATE appointment SET date=?,time=?,status=?,employee_id=? WHERE appointment_id=?"

            connection.query(query,[date,time,status,employee_id,appointment_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
                res.send("1")      
            });
                     
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.put('/updateinfooptin', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

        
            var user_id=req.body.user_id;
            var optin=req.body.optin;

            var get_patient_id="SELECT * FROM users left join patient on users.email=patient.patient_email where user_id=?";

            connection.query(get_patient_id,[user_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }

                if(data.length>0){
                    var patient_id="";

                    data.forEach(function (item){
                        patient_id=item.patient_id
                    });
                   var query="UPDATE patient SET info_sharing=? where patient_id=?"

                    connection.query(query,[optin,patient_id],(err, data) => {
                            if(err) {
                                console.error(err);
                                return;
                            }
                        res.send("1")
                    });
                }
            }); 
                     
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});


app.put('/updatetestoptin', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

        
            var user_id=req.body.user_id;
            var optin=req.body.optin;

            var get_patient_id="SELECT * FROM users left join patient on users.email=patient.patient_email where user_id=?";

            connection.query(get_patient_id,[user_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }

                if(data.length>0){
                    var patient_id="";

                    data.forEach(function (item){
                        patient_id=item.patient_id
                    });
                   var query="UPDATE patient SET tests_sharing=? where patient_id=?"

                    connection.query(query,[optin,patient_id],(err, data) => {
                            if(err) {
                                console.error(err);
                                return;
                            }
                        res.send("1")
                    });
                }
            }); 
                     
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.get('/patientbyid', async (req, res, next) => {
    let redirect="";

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

        
            var user_id=req.query.user_id;
            
            var get_patient_id="SELECT * FROM users left join patient on users.email=patient.patient_email where user_id=?";

            connection.query(get_patient_id,[user_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }

                if(data.length>0){
                    res.send(data)
                }else{
                    res.send('-1')
                }
            }); 
                     
            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});

app.put('/updatetestresults', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE heart_clinical_tests SET chest_pain_type=?,resting_blood_pressure=?,serum_cholestrol=?,fasting_blood_sugar=?,resting_electrocardiographic_results=?,max_heart_rate=?,exercise_induced_angina=?,st_depression_induced_by_exercise=?,st_segment_slope=?,colored_major_vessels=?,thalassemia=?,presence=? where id=?";
                                    
            connection.query(cont,[req.body.chest_pain_type,req.body.resting_blood_pressure,req.body.serum_cholestrol,req.body.fasting_blood_sugar,req.body.resting_electrocardiographic_results,req.body.max_heart_rate,req.body.exercise_induced_angina,req.body.st_depression_induced_by_exercise,req.body.st_segment_slope,req.body.colored_major_vessels,req.body.thalassemia,req.body.presence,req.body.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });
    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});


//2. Post Endpoint for departments table
app.post('/book', async (req, res, next) => {
     try {
        var data=req.body;
       
        var user_id=data.user_id
        var date=data.date
        var time=data.time
        var status='active'
        var employee_id=data.employee_id


        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var get_patient_id="SELECT * FROM users left join patient on users.email=patient.patient_email where user_id=?";
           
        
            connection.query(get_patient_id,[user_id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }

                if(data.length>0){
                    var patient_id="";

                    data.forEach(function (item){
                        patient_id=item.patient_id
                    });
                    var booker="INSERT INTO appointment (date,time,status,patient_id,employee_id) VALUES('"+date+"','"+time+"','"+status+"','"+patient_id+"','"+employee_id+"')";                  
            
                    connection.query(booker,(err, data) => {
                            if(err) {
                                console.error(err);
                                return;
                            }
                        });
                }
            }); 

           


            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//2. Post Endpoint for departments table
app.post('/register', async (req, res, next) => {
     try {
        var data=req.body;
       
        var patient_name=data.patient_name
        var patient_age=data.patient_age
        var patient_gender=data.patient_gender
        var patient_location=data.patient_location
        var patient_email=data.patient_email

        var password=data.password
        var category="patient"




        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var register="INSERT INTO  patient (patient_name,patient_age,patient_gender,patient_location,patient_email) VALUES('"+patient_name+"','"+patient_age+"','"+patient_gender+"','"+patient_location+"','"+patient_email+"')";
            var account="INSERT INTO  users (email,password,category) VALUES('"+patient_email+"','"+password+"','"+category+"')";                  
            
            connection.query(register,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            });


            connection.query(account,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for departments table
app.get('/department', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM departments WHERE department_id=?"
                param=req.query.id
            }
            else if(req.query.total){
                query="SELECT COUNT(*) as total FROM departments"
                param=req.query.id
            }else{
                query="SELECT * FROM departments "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for departments table
app.put('/department', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE departments SET department_name=?, employees_required=?,current_employees=? WHERE department_id=?";
                                    
            connection.query(cont,[req.body.department_name,req.body.employees_required,req.body.current_employees,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for departments table
app.delete('/department', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM departments WHERE department_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//3. Post Endpoint for jobs table
app.post('/jobposition', async (req, res, next) => {
     try {
        var data=req.body;
       
        var job_name=data.job_name
        var job_description=data.job_description
        var salary=data.salary
        var department_id=data.department_id
        var qualification_details=data.qualification_details


        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  jobs (job_name,job_description,salary,department_id,qualification_details) VALUES('"+job_name+"','"+job_description+"','"+salary+"','"+department_id+"','"+qualification_details+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for jobs table
app.get('/jobposition', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM jobs WHERE job_id=?"
                param=req.query.id
            }else if(req.query.total){
                query="SELECT COUNT(*) as total FROM jobs"
            }else{
                query="SELECT * FROM jobs "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for jobs table
app.put('/jobposition', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE jobs SET job_name=?,job_description=?,salary=?,department_id=?,qualification_details=? WHERE job_id=?";
                                    
            connection.query(cont,[req.body.job_name,req.body.job_description,req.body.salary,req.body.department_id,req.body.qualification_details,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for jobs table
app.delete('/jobposition', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM jobs WHERE job_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//4. Post Endpoint for trainings table
app.post('/training', async (req, res, next) => {
     try {
        var data=req.body;
       
        var department_id=data.department_id
        var certification_type=data.certification_type
        var provider=data.provider
        var provider_link=data.provider_link
        var description=data.description


        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  trainings (department_id,certification_type,provider,provider_link,description) VALUES('"+department_id+"','"+certification_type+"','"+provider+"','"+provider_link+"','"+description+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for trainings table
app.get('/training', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }


            if(req.query.id){
                query="SELECT * FROM trainings WHERE id=?"
                param=req.query.id
            }else if(req.query.department_id){
                query="SELECT * FROM trainings WHERE department_id=?"
                param=req.query.department_id
            }else if(req.query.total){
                query="SELECT COUNT(*) as total FROM trainings"
                param=req.query.id
            }else{
                query="SELECT * FROM trainings "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for trainings table
app.put('/training', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE trainings SET department_id=?,certification_type=?,provider=?,provider_link=?,description=? WHERE id=?";
                                    
            connection.query(cont,[req.body.department_id,req.body.certification_type,req.body.provider,req.body.provider_link,req.body.description,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for trainings table
app.delete('/training', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM trainings WHERE id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//5. Post Endpoint for vacancies table
app.post('/jobopening', async (req, res, next) => {
     try {
        var data=req.body;
       
        var job_id=data.job_id
        var applicants_required=data.applicants_required
        var application_deadline=data.application_deadline
        


        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  vacancies (job_id,applicants_required,application_deadline) VALUES('"+job_id+"','"+applicants_required+"','"+application_deadline+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for vacancies table
app.get('/jobopening', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM vacancies WHERE id=?"
                param=req.query.id
            }else if(req.query.total){
                query="SELECT COUNT(*) as total FROM vacancies"
                param=req.query.id
            }else{
                query="SELECT * FROM vacancies "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for vacancies table
app.put('/jobopening', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE vacancies SET job_id=?,applicants_required=?,application_deadline=? WHERE id=?";
                                    
            connection.query(cont,[req.body.job_id,req.body.applicants_required,req.body.application_deadline,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for vacancies table
app.delete('/jobopening', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM vacancies WHERE id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});


//6. Post Endpoint for employees table
app.post('/employee', async (req, res, next) => {
     try {
        var data=req.body;
       
        var job_id=data.job_id
        var first_name=data.first_name
        var last_name=data.last_name
        var email_address=data.email_address
        var city=data.city
        var state=data.state
        var address=data.address
        var phone_contact=data.phone_contact
        var date_of_joining=data.date_of_joining
        var date_of_birth=data.date_of_birth
       
        
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  employees (job_id,first_name,last_name,email_address,city,state,address,phone_contact,date_of_joining,date_of_birth) VALUES('"+job_id+"','"+first_name+"','"+last_name+"','"+email_address+"','"+city+"','"+state+"','"+address+"','"+phone_contact+"','"+date_of_joining+"','"+date_of_birth+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for employees table
app.get('/employee', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM employees WHERE employee_id=?"
                param=req.query.id
            }else if(req.query.total){
                query="SELECT COUNT(*) as total FROM employees"
            }else{
                query="SELECT * FROM employees "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for employees table
app.put('/employee', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE employees SET job_id=?,first_name=?,last_name=?,email_address=?,city=?,state=?,address=?,phone_contact=?,date_of_joining=?,date_of_birth=? WHERE employee_id=?";
                                    
            connection.query(cont,[req.body.job_id,req.body.first_name,req.body.last_name,req.body.email_address,req.body.city,req.body.state,req.body.address,req.body.phone_contact,req.body.date_of_joining,req.body.date_of_birth,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for employees table
app.delete('/employee', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM employees WHERE employee_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//7. Post Endpoint for leaves table
app.post('/leave', async (req, res, next) => {
     try {
        var data=req.body;
       
        var employee_id=data.employee_id
        var leave_type=data.leave_type
        var leave_days=data.leave_days
        var leave_start=data.leave_start
        var leave_start_date=new Date(leave_start)
        var leave_end=leave_start_date.setDate(leave_start_date.getDate()+parseInt(leave_days))
        leave_end=new Date(leave_end)
        leave_end=`${leave_end.getFullYear()}-${leave_end.getMonth()+1}-${leave_end.getDate()}`

        var status="Pending"
      
        
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  leaves (employee_id,leave_type,leave_days,leave_start,leave_end,status) VALUES('"+employee_id+"','"+leave_type+"','"+leave_days+"','"+leave_start+"','"+leave_end+"','"+status+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for leaves table
app.get('/leave', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM leaves WHERE leave_id=?"
                param=req.query.id
            }else if(req.query.employee_id){
                query="SELECT * FROM leaves WHERE employee_id=?"
                param=req.query.employee_id
            }else{
                query="SELECT * FROM leaves "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for leaves table
app.put('/leave', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE leaves SET employee_id=?,leave_type=?,leave_days=?,leave_start=?,leave_end=?,status=? WHERE leave_id=?";
            
            var leave_days=req.body.leave_days
            var leave_start_date=new Date(req.body.leave_start)
            var leave_end=leave_start_date.setDate(leave_start_date.getDate()+parseInt(leave_days))
            leave_end=new Date(leave_end)
            leave_end=`${leave_end.getFullYear()}-${leave_end.getMonth()+1}-${leave_end.getDate()}`

            connection.query(cont,[req.body.employee_id,req.body.leave_type,req.body.leave_days,req.body.leave_start,leave_end,req.body.status,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for leaves table
app.delete('/leave', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM leaves WHERE leave_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//8. Post Endpoint for attendance table
app.post('/attendance', async (req, res, next) => {
     try {
        var data=req.body;
       
        var employee_id=data.employee_id
        var attendance_date=data.attendance_date
        var clock_in_time=data.clock_in_time

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  attendance (employee_id,attendance_date,clock_in_time) VALUES('"+employee_id+"','"+attendance_date+"','"+clock_in_time+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for attendance table
app.get('/attendance', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM attendance WHERE attendance_id=?"
                param=req.query.id
            }else if(req.query.employee_id){
                query="SELECT * FROM attendance WHERE employee_id=?"
                param=req.query.employee_id
            }else{
                query="SELECT * FROM attendance "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for attendance table
app.put('/attendance', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE attendance SET clock_out_time=? WHERE attendance_id=?";
            

            connection.query(cont,[req.body.clock_out_time,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for attendance table
app.delete('/attendance', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM attendance WHERE attendance_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//9. Post Endpoint for users table
app.post('/user', async (req, res, next) => {
     try {
        var data=req.body;
       
        var employee_id=data.employee_id
        var username=data.username
        var password=data.password
        var role    =data.role
      
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  users (employee_id,username,password,role) VALUES('"+employee_id+"','"+username+"','"+password+"','"+role+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for users table
app.get('/user', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

           

            if(req.query.id){
                query="SELECT * FROM users WHERE user_id=?"
                param=req.query.id
            }else if(req.query.employee_id){
                query="SELECT * FROM users WHERE employee_id=?"
                param=req.query.employee_id
            }else{
                query="SELECT * FROM users "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for users table
app.put('/user', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE users SET employee_id=?,username=?,password=?,role=? WHERE user_id=?";
            

            connection.query(cont,[req.body.employee_id,req.body.username,req.body.password,req.body.role,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for users table
app.delete('/user', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM users WHERE user_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});


//10.Post Endpoint for payroll table
app.post('/payroll', async (req, res, next) => {
     try {
        var data=req.body;
       
        var employee_id=data.employee_id
        var basic_salary=data.basic_salary
        var project_bonus=data.project_bonus
        var attendance_bonus=data.attendance_bonus
        var tax_deductions=data.tax_deductions
        
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="INSERT INTO  payroll (employee_id,basic_salary,project_bonus,attendance_bonus,tax_deductions) VALUES('"+employee_id+"','"+basic_salary+"','"+project_bonus+"','"+attendance_bonus+"','"+tax_deductions+"')";
                                    
            connection.query(cont,(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//GET Endpoint for payroll table
app.get('/payroll', async (req, res, next) => {
    let query=""
    let param=""

     try {

        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            if(req.query.id){
                query="SELECT * FROM payroll WHERE payroll_id=?"
                param=req.query.id
            }else if(req.query.employee_id){
                query="SELECT * FROM payroll WHERE employee_id=?"
                param=req.query.employee_id
            }else{
                query="SELECT * FROM payroll "
            }

            connection.query(query,param,(err, data) => {
                if(err) {
                    console.error(err);
                    
                    return;
                }

                res.send(data)
            }); 

           

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
});

//PUT Endpoint for payroll table
app.put('/payroll', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="UPDATE payroll SET basic_salary=?,project_bonus=?,attendance_bonus=?,tax_deductions=? WHERE payroll_id=?";
            

            connection.query(cont,[req.body.basic_salary,req.body.project_bonus,req.body.attendance_bonus,req.body.tax_deductions,req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });




    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});

//DELETE Endpoint for payroll table
app.delete('/payroll', async (req, res, next) => {
     try {
        const connection=await pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }

            var cont="DELETE FROM payroll WHERE payroll_id=?";
                                    
            connection.query(cont,[req.query.id],(err, data) => {
                if(err) {
                    console.error(err);
                    return;
                }
            }); 

            connection.release(); 
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

    res.sendStatus(200)
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

