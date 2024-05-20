function callapi(method,url,jsondata,origin){
          var result=""

          const xhttpr = new XMLHttpRequest();
          xhttpr.open(method,url, true);

          if(method=="GET"){
            xhttpr.send();
          }else{
            xhttpr.setRequestHeader("Content-Type", "application/json");

            xhttpr.send(jsondata);
          }

          xhttpr.onreadystatechange = () => {
            if(xhttpr.status===200 && xhttpr.readyState === XMLHttpRequest.DONE){
              if(origin=='owner'){
                  result=xhttpr.response
                  console.log(result)
                  window.location.href='/owner'
              }else if(origin=='register'){
                    window.location.href='/'
              }else if(origin=='login'){
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        json.forEach(function (item){
                            const uid=item.user_id;
                            const category=item.category;
                            var path='/patient-home/'+uid.toString();
                            if(category=='patient'){
                                window.location.href=path;
                            }else if(category=='admin'){
                                path='/admin-home/'
                                window.location.href=path;
                            }else if(category=='lab'){
                                path='/lab-home/'
                                window.location.href=path;
                            }
                           
                            
                        });
                    }catch(exceptionvar){
                        document.getElementById('userlog').innerHTML="Incorrect Credentials. Retry!";
                        document.getElementById('userlog').style.color="red"
                    }    
              }else if(origin=='all-doctors'){
                    var option = document.createElement("option");
                    option.text = "Select Doctor";
                    option.value = "";
                    document.getElementById('doctors').add(option)
                    
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        json.forEach(function (item){
                            var option = document.createElement("option");
                            option.text = item.employee_name
                            option.value = item.employee_id;
                             document.getElementById('doctors').add(option)
                        });
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='all-appointmentdetails'){                    
                    result=xhttpr.response
                    console.log(result)
                    var tr="";

                    try{
                        const json = JSON.parse(result);

                        json.forEach(function (item){
                            tr+=`
                            <tr>
                                <td>${item.appointment_id}</td>
                                <td>${item.patient_name}</td>
                                <td>${item.employee_name}</td>
                                <td>${item.date}</td>
                                <td>${item.status}</td>
                                <td><button type="button" class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#calendar-add_edit_event" onclick="fetch(${item.patient_id})">
                                Update Results
                                </button></td>
                                <td><button type="button" class="btn btn-danger">Delete</button></td>
                            </tr>
                            `
                        });

                        document.getElementById('appointmentdetails').innerHTML=tr;
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='book'){
                    document.getElementById('userlog').innerHTML="Appointment Added Succesfully";
                    document.getElementById('userlog').style.color="green"
                    document.getElementById('user_id').value="";
                    document.getElementById('date').value="";
                    document.getElementById('time').value="";
                    document.getElementById('doctors').value="";
              }else if(origin=='patientappointment'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            var d=new Date(item.date);
                            d=d.toLocaleDateString("en-US")
                            tr+=`
                            <tr>
                                <td>${item.appointment_id}</td>
                                <td>${d}</td>
                                <td>${item.time}</td>
                                <td>${item.status}</td>
                                <td>${item.employee_name}</td>
                                <td><button type="button" class="btn btn-primary" onclick="patientappointmentbyid(${item.appointment_id})">Update</button></td>
                                <td><button type="button" class="btn btn-danger">Delete</button></td>
                            </tr>
                            `
                            document.getElementById('appointmenttable').innerHTML=tr;
                        });
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='patientinfo'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            if(item.info_sharing==1){
                                document.getElementById('info').checked=true;
                            }else{
                                document.getElementById('info').checked=false;
                            }

                            if(item.tests_sharing==1){
                                document.getElementById('test').checked=true;
                            }else{
                                document.getElementById('test').checked=false;
                            }
                            
                        });
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='patientappointmentsbyid'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            var d=new Date(item.date);
                            // d=d.getFullYear().toString()+"-"+d.getDate().toString()+"-"+getMonth().toString()
                            document.getElementById('appointmentid').value=item.appointment_id;
                            document.getElementById('date').value=d;
                            document.getElementById('time').value=item.time;
                            document.getElementById('status').value=item.status;
                            document.getElementById('doctors').value=item.employee_id;
                        });
                        document.getElementById('ecomtab-tab-2').click()
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='updateappointmentbyid'){
                    document.getElementById('userlog').innerHTML="Appointment Updated Succesfully";
                    document.getElementById('userlog').style.color="green"
                    document.getElementById('appointmentid').value="";
                    document.getElementById('date').value="";
                    document.getElementById('time').value="";
                    document.getElementById('status').value="";
                    document.getElementById('doctors').value="";
              }else if(origin=='optin'){
                    document.getElementById('userlog').innerHTML="Data Sharing Optin status changed";
                    document.getElementById('userlog').style.color="green"
              }else if(origin=='all-patients'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            document.getElementById('totalpatients').innerHTML=item.total;
                        });
                        document.getElementById('ecomtab-tab-2').click()
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='all-employees'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            document.getElementById('totalemployees').innerHTML=item.total;
                        });
                        document.getElementById('ecomtab-tab-2').click()
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='all-appointments'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            document.getElementById('totalappointments').innerHTML=item.total;
                        });
                        document.getElementById('ecomtab-tab-2').click()
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='all-tests'){ 
                    result=xhttpr.response
                    console.log(result)
                    try{
                        const json = JSON.parse(result);
                        var tr=""
                        json.forEach(function (item){
                            if(item.tests_sharing==1){
                                tr+=`
                                <tr>
                                    <td>${item.patient_age}</td>
                                    <td>${item.patient_gender}</td>
                                    <td>${item.chest_pain_type}</td>
                                    <td>${item.resting_blood_pressure}</td>
                                    <td>${item.serum_cholestrol}</td>
                                    <td>${item.fasting_blood_sugar}</td>
                                    <td>${item.resting_electrocardiographic_results}</td>
                                    <td>${item.max_heart_rate}</td>
                                    <td>${item.exercise_induced_angina}</td>
                                    <td>${item.st_depression_induced_by_exercise}</td>
                                    <td>${item.st_segment_slope}</td>
                                    <td>${item.colored_major_vessels}</td>
                                    <td>${item.thalassemia}</td>
                                    <td>${item.presence}</td>
                                </tr>
                                `
                            }
                            document.getElementById('dataset').innerHTML=tr;
                        });
                        
                    }catch(exceptionvar){
                       
                    }
                }else if(origin=='testbyid'){                    
                    result=xhttpr.response
                    console.log(result)
                    var tr="";

                    try{
                        const json = JSON.parse(result);

                        json.forEach(function (item){
                           document.getElementById('testid').value=item.id;
                           document.getElementById('chest_pain_type').value=item.chest_pain_type;
                           document.getElementById('resting_blood_pressure').value=item.resting_blood_pressure;
                           document.getElementById('serum_cholestrol').value=item.serum_cholestrol;
                           document.getElementById('fasting_blood_sugar').value=item.fasting_blood_sugar;
                           document.getElementById('resting_electrocardiagraphic_result').value=item.resting_electrocardiographic_results;
                           document.getElementById('max_heart_rate').value=item.max_heart_rate;
                           document.getElementById('exercise_induced_angina').value=item.exercise_induced_angina;
                           document.getElementById('st_depression_exercise').value=item.st_depression_induced_by_exercise;
                           document.getElementById('slope').value=item.st_segment_slope;
                           document.getElementById('vessels').value=item.colored_major_vessels;
                           document.getElementById('thal').value=item.thalassemia;
                           document.getElementById('presence').value=item.presence;
                        });

                        
                        
                    }catch(exceptionvar){
                       
                    }  
              }else if(origin=='updatetests'){
                    document.getElementById('userlog').innerHTML="Tests Updated Succesfully";
                    document.getElementById('userlog').style.color="green"
              }
            }
          }

          return result
}

function register(){
    //capture the username and password
    var first_name=document.getElementById('first_name').value;
    var last_name=document.getElementById('last_name').value;
    var patient_name=first_name+" "+last_name;
    var patient_age=document.getElementById('age').value;
    var patient_location=document.getElementById('location').value;
    var patient_gender=document.getElementById('gender').value;
    var patient_email=document.getElementById('email').value;
    var password=document.getElementById('password').value;
    var confirm=document.getElementById('confirm').value;
    

    if(password==confirm){
        var jsondata={
        'patient_name': patient_name,
        'patient_age': patient_age,
        'patient_gender': patient_gender,
        'patient_location': patient_location,
        'gender': gender,
        'patient_email': patient_email,
        'password': password
        }

        jsondata=JSON.stringify(jsondata)

        //call the login endpoints
        callapi('POST','http://127.0.0.1:3000/register',jsondata,'register')

    }else{
        document.getElementById('userlog').innerHTML="Password do not match. Re-enter";
        document.getElementById('userlog').style.color="red"
        document.getElementById('password').value=""
        document.getElementById('confirm').value=""
    }
}

function login(){
    //capture the username and password
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;


    var jsondata={
        'username': username,
        'password': password
    }

    jsondata=JSON.stringify(jsondata)
    //call the login endpoints   
     callapi('POST','http://127.0.0.1:3000/login',jsondata,'login')
}

function book(){
    //capture the username and password
    var user_id=document.getElementById('user_id').value;
    var date=document.getElementById('date').value;
    var time=document.getElementById('time').value;
    var employee_id=document.getElementById('doctors').value;
   

    var jsondata={
        'user_id': user_id,
        'date': date,
        'time': time,
        'employee_id': employee_id
    }

        jsondata=JSON.stringify(jsondata)
        //call the login endpoints   
         callapi('POST','http://127.0.0.1:3000/book',jsondata,'book')
}

function patientappointment(){
    //capture the username and password
    var user_id=document.getElementById('user_id').value;

    var jsondata={
        'user_id': user_id,
    }

    jsondata=JSON.stringify(jsondata)
    //call the login endpoints   
    callapi('POST','http://127.0.0.1:3000/patientappointments',jsondata,'patientappointment')
}

function patientappointmentbyid(id){
    var jsondata={
        'appointment_id': id
    }

    jsondata=JSON.stringify(jsondata)
    //call the login endpoints   
    callapi('POST','http://127.0.0.1:3000/patientappointmentsbyid',jsondata,'patientappointmentsbyid')
}

function updateappointmentbyid(){
    var jsondata={
        'appointment_id': document.getElementById('appointmentid').value,
        'date': document.getElementById('date').value,
        'time': document.getElementById('time').value,
        'status': document.getElementById('status').value,
        'employee_id': document.getElementById('doctors').value
    }

    jsondata=JSON.stringify(jsondata)
    //call the login endpoints   
    callapi('PUT','http://127.0.0.1:3000/updateappointmentbyid',jsondata,'updateappointmentbyid')
}

function updateinfooptin(){
    var check=document.getElementById("info").checked
    var optin=0;

    if(check){
        optin=1;
    }

    
    var jsondata={
        'optin': optin,
        'user_id': document.getElementById('user_id').value,
    }

    jsondata=JSON.stringify(jsondata)
    //call the login endpoints   
    callapi('PUT','http://127.0.0.1:3000/updateinfooptin',jsondata,'optin')
}

function updatetestoptin(){
    var check=document.getElementById("test").checked
    var optin=0;

    if(check){
        optin=1;
    }

    
    var jsondata={
        'optin': optin,
        'user_id': document.getElementById('user_id').value,
    }

    jsondata=JSON.stringify(jsondata)
    //call the login endpoints   
    callapi('PUT','http://127.0.0.1:3000/updatetestoptin',jsondata,'optin')
}

function patientinfo(){
    var user_id=document.getElementById('user_id').value
    
    callapi('GET',`http://127.0.0.1:3000/patientbyid?user_id=${user_id}`,'','patientinfo');
}


function fetch(user_id){
    callapi('GET',`http://127.0.0.1:3000/testbyid?user_id=${user_id}`,'','testbyid');
}

function updatetests(){
    var jsondata={
        "id":document.getElementById('testid').value,
        "chest_pain_type":document.getElementById('chest_pain_type').value,
        "resting_blood_pressure":document.getElementById('resting_blood_pressure').value,
        "serum_cholestrol":document.getElementById('serum_cholestrol').value,
        "fasting_blood_sugar":document.getElementById('fasting_blood_sugar').value,
        "resting_electrocardiographic_results":document.getElementById('resting_electrocardiagraphic_result').value,
        "max_heart_rate":document.getElementById('max_heart_rate').value,
        "exercise_induced_angina":document.getElementById('exercise_induced_angina').value,
        "st_depression_induced_by_exercise":document.getElementById('st_depression_exercise').value,
        "st_segment_slope":document.getElementById('slope').value,
        "colored_major_vessels":document.getElementById('vessels').value,
        "thalassemia":document.getElementById('thal').value,
        "presence":document.getElementById('presence').value
    }

    callapi('PUT','http://127.0.0.1:3000/updatetestresults',jsondata,'updatetests');
}

