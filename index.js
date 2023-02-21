const inquirer = require("inquirer");
const mysql = require('mysql2');
const read = require('readline');
const { resolve } = require("path");
const { write } = require("fs");


// Connect to mysql

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employee_db"
},
    console.log("Connected to Employee Database...")
);

db.connect(function (err) {
    if (err) throw err
    console.log("MySQL Server Connected")
    mainMenu();
});

// Make sure mysql is running
// Log into SQL 
// mysql -u -p
// Create Database & Tables: 'source db/schema.sql'
// Seed db: 'source db/seed.sql' 

const mainMenu = () => {
    console.log("");
    console.log("");


    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Exit"],
                name: "choice"
            }
        ])
        .then((response) => {

            switch (response.choice) {
                case "View All Employees":
                    viewAllEmployees();
                    break;
                case "Add Employee":
                    newEmployeeSetup(createNewEmployee);
                    break;
                case "Update Employee Role":
                    updateEmployeeSetup(uptEmployeeSetup);
                    break;
                case "View All Roles":
                    viewAllRoles();
                    break;
                case "Add Role":
                    newRoleSetup(createNewRole);
                    break;
                case "View All Departments":
                    viewAllDepartments();
                    break;
                case "Add Department":
                    createNewDeparment();
                    break;
                default:
                    exitProgram()
                    break;
            }
        })
};

function viewAllEmployees() {
    console.log("All Employees:")
    let q = `SELECT * FROM employee`
    dbQuery(q);


}

 function createNewEmployee(data) {
    console.log("Creating New Employee...");

    console.log("roles:");
    console.log(data);

    let roles = [];

    data.forEach(role => { roles.push(role.title)});

// Question for new Employee
    inquirer
    .prompt([
        {
            type: "input",
            message: "What is the Employee's First Name?",
            name: "first_name"
        },
        {
            type: "input",
            message: "What is the Employee's Last Name?",
            name: "last_name"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            choices: roles,
            name: "role"
        },
        {
            type: "confirm",
            name:"haveManager",
            message: "Does the Employee have a manger?"
        }

    ])
    .then((response) => {
        let newEmployee;

        if(response.haveManager){
        inquirer.prompt([
            {
                type: 'input',
                name: 'manager_id',
                message: 'What is your manager ID#?',
                validate(value) {
                  const valid = !isNaN(parseFloat(value));
                  return valid || 'Please enter a number';
                },
                filter: Number,
              }
        ]).then( man => {

            newEmployee = {
                first_name: response.first_name,
                last_name: response.last_name,
                role_id: roles.indexOf(response.role),
                manager_id: man.manager_id
            }
            writeEmployee(newEmployee)
        } )

        } else {
            newEmployee = {
                first_name: response.first_name,
                last_name: response.last_name,
                role_id: roles.indexOf(response.role),
                manager_id: null
            }
            writeEmployee(newEmployee)
        }

        function writeEmployee(emp){
            console.log("New Employee Details:");
        console.log(emp);
        dbWrite(emp, "employee")
        }
    })
};

function updateEmployeeRole(emp_id, role_id) {
    console.log("Updating Employee Role...")

    

    db.query(q,params, (err, rows) => { 
        console.log(rows)
    })



// const sql = `UPDATE candidates SET party_id = ? 
// WHERE id = ?`;
// const params = [req.body.party_id, req.params.id];
}


 function viewAllRoles() {
    console.log("All Roles:");
    let q = `SELECT * FROM role`;
    let results = dbQuery(q);

    return results;
}

function createNewRole(data) {

    console.log("Creating New Role...");

    console.log("depts:");
    console.log(data);

    let depts = [];

    data.forEach(dept => { depts.push(dept.name)});

// Question for new Role
    inquirer
    .prompt([
        {
            type: "list",
            message: "What Department is this role in?",
            choices: depts,
            name: "department"
        },
        {
            type: "input",
            message: "What is the name for this new role?",
            name: "title"
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary for this role?',
            validate(value) {
              const valid = !isNaN(parseFloat(value));
              return valid || 'Please enter a number';
            },
            filter: Number,
          }
    ])
    .then((response) => {
        let newRole;

        
            newRole = {
                title: response.title,
                salary: response.salary,
                department_id: depts.indexOf(response.department)+1
            }

            writeRole(newRole)

        function writeRole(title){
            console.log("New Role Details:");
        console.log(title);
        dbWrite(title, "role")
        }
    })
};

function viewAllDepartments() {
    console.log("All Departments:")
    let q = `SELECT * FROM department`
    dbQuery(q);
}

function createNewDeparment() {
    console.log("Creating New Department...")

// Question for new Department
    inquirer
    .prompt([
        {
            type: "input",
            message: "What is the name for this new department?",
            name: "name"
        }
    ])
    .then((response) => {
        let newDept;

        
            newDept = {
                name: response.name
            }

            writeDept(newDept)

        function writeDept(name){
            console.log("New Role Details:");
        console.log(name);
        dbWrite(name, "department")
        }
    })
};

function exitProgram() {
    console.log("Program Exited, Thank You.");
    process.exit();
}


// Funciton to Handle db Queries and View Table
function dbQuery(query) {
    let results;

    db.query(query, (err, rows) => {
        //ct.getTable(rows);
        if (rows !== undefined){
            sudoWait(console.table(rows));
        } else {
            console.log("Data Not Found in Database...");
            mainMenu();
        }
        return results = rows
    })
    return results
}

// Create Function to Write Ojbect to mySql Table
function dbWrite(arr, table){
    let columns = getColumns(arr);
    let params = getValues(arr)

    console.log({
        columns: columns,
        params: params
    })

    let columnCount = params.length;
    function qCount(num){
        let param = "?";
        let more = "?,";

        let output;
        

        if(num <= 1){ 
            output = param;
        } else {
            num--;
            output = `${more.repeat(num)}${param}`
        }

        return output
    }
    let paramCount = qCount(columnCount);

    q = `INSERT INTO ${table} (${columns})
    VALUES (${paramCount})`;

        db.query(q, params, (err, rows) => { 
            if(err){
                console.log(err);
            } else {
                console.log(`New ${table} added!`) 
                // console.log("Results:");
                // console.log(rows);
            }
            });
            mainMenu();
}

// Functions to parse Table Columns and Input Values from SQL Queries
function getColumns(arr){
    let columns = Object.keys(arr);
    return columns.toString();
}
function getValues(arr){
    let values = Object.values(arr);
    return values;
}

// Function to wait for user input from View quires to move back to Main Menu
function sudoWait(output){
const rl = read.createInterface({
    input: process.stdin,
    output: process.stdout,
});
console.log("Press Key to Return to Main Menu...")
return new Promise(resolve => rl.question(output, ans => {
    rl.close();
    resolve(ans);
    mainMenu();
}))
}


// Function to Get All Roles Currently in Database then Start Creating New Employee
function newEmployeeSetup(newEmp){
    let q = `SELECT * FROM role`;
    db.query(q, (err, rows) => { newEmp(rows) });
}

function newRoleSetup(newRole){
    let q = `SELECT * FROM department`;
    db.query(q, (err, rows) => { newRole(rows) });
}

function updateEmployeeSetup(uptEmp){
    let q = `SELECT id,CONCAT(first_name," ",last_name) AS name FROM employee`;
    db.query(q, (err, rows) => { uptEmp(rows) });
}

function uptEmployeeSetup(data){
    let employeeList = [];
    console.log(data);
    console.log(getValues(data));

    data.forEach(emp => employeeList.push(emp.name));
    console.log(employeeList);

    inquirer
    .prompt([
        {
            type: "list",
            message: "Which Employee Do You Want to Update?",
            choices: employeeList,
            name: "employee"
        }
    ])
    .then((response) => {
        return emp_id = employeeList.indexOf(response.employee);
        }).then( (empid) => {
            let roles = [];
            let q = `SELECT * FROM role`;
            db.query(q, (err, rows) => { 
            
                rows.forEach(role => roles.push(role.title));
        
            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which role would you like?",
                        choices: roles,
                        name: "role"
                    }
            ]).then( answers => {

                let query = `Update employee SET role_id = ? WHERE id = ?`;
                let selRole = (roles.indexOf(answers.role)) + 1;
                let params2 = [selRole,empid]
             
                db.query(query, params2, (err, rows) => { 
                    if(err){
                        console.log(err)
                    }else {
                    console.log(rows)
                    }
                    mainMenu();
                })
            }
            )
            })
        })
    }