const inquirer = require("inquirer");
const mysql = require("mysql2");
var finishOrNot = false;
const con = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password
        password: '1234',
        database: 'company_db'
    }
);
const initQuestion = [
    {
        type: "input",
        name: "fisrt",
        message: "Welcome to use the Employee Tracker Management System (Press Enter to Continue)",
    }
]

const viewOptions = [
    {
        type:"list",
        name:"actionSQL",
        message:"What action would you like to perform?",
        choices: ["View all departments","View all roles","View all employees","Add a department","Add a role","Add an employee","Update an employee role"],
    }
]

const departmentQuestion = [
    {
        type: "input",
        name: "department",
        message: "What is the name of the department?",
    }
]

const roleQuestion = [
    {
        type: "input",
        name: "role",
        message: "What is the title of the role?",
    },
    {
        type: "input",
        name: "salary",
        message: "What is the salary of the role?",
    }
]

const getAllEmployeeInfo = async () => {
    await con.promise().query(`SELECT employee.id AS employee_id, 
                        first_name, 
                        last_name, 
                        role.title, 
                        role.salary, 
                        role.department_name, 
                        manager_id AS manager_id_number, 
                        (SELECT first_name FROM employee WHERE  manager_id = manager_id_number ) AS 'manager_firstname',
                        (SELECT last_name FROM employee WHERE  manager_id = manager_id_number ) AS 'manager_lastname' 
                        FROM employee 
                        JOIN (SELECT company_role.id AS role_id, title, salary, department_name  FROM company_role JOIN department ON company_role.department_id = department.id) AS role 
                        ON employee.role_id = role.role_id ORDER BY employee.id`)
    .then( ([result,col]) =>{
        console.table(result);
    });
}

const getAllRoleInfo = async () => {
    await con.promise().query(`SELECT company_role.id AS role_id, title, salary, department_name  FROM company_role JOIN department ON company_role.department_id = department.id ORDER BY role_id`)
    .then( ([result,col]) =>{
        console.table(result);
    });
}

const getAllDepartmentInfo = async () => {
    await con.promise().query(`SELECT * FROM department`)
    .then( ([result,col]) =>{
        console.table(result);
    });
}

const createDepartment =  (departmentName) => {
    const {department} =  departmentName;
    con.promise().query(`INSERT INTO department (department_name) VALUES ('${department}');`)
    .then( (result) =>{
        console.log(result);
    });
}

const createRole = async (RoleName) => {
    var result_obj = new Array();
    var department_question_array = new Array();
    const {role, salary} = RoleName;
    await con.promise().query(`SELECT id,department_name FROM department`)
    .then(([result,col]) =>{
        result_obj = result;
    });
    for(var item in result_obj){
        if (result_obj.hasOwnProperty(item)) {
          department_question_array.push(result_obj[item].department_name);
        }
      }
    const quests = {
        type: 'list',
        name: 'department_name',
        message: 'Which department is role this assigned to?',
        choices: department_question_array,
    };
    const response = await startPrompt(quests);
    const department_id = quests.choices.indexOf(response.department_name) + 1;
    await con.promise().query(`INSERT INTO company_role (title, salary, department_id) VALUES ('${role}','${salary}', '${department_id}');`)
    .then( (result) =>{
        console.log(result);
    });
}


const  startPrompt = async (questionSet) => {
    const answer = await inquirer.prompt(questionSet);
    return answer;
}

const init = async () => {
    await startPrompt(initQuestion);
    while(finishOrNot != true){
        const actionResult = await startPrompt(viewOptions);
        const {actionSQL} = actionResult;
        switch (actionSQL) {
            case "View all departments":
                await getAllDepartmentInfo();
                break;
            case "View all roles":
                await getAllRoleInfo();
                break; 
            case "View all employees":
                await getAllEmployeeInfo();
                break;
            case "Add a department":
                const departmentName = await startPrompt(departmentQuestion);
                createDepartment(departmentName);
                break;
            case "Add a role":
                const roleName = await startPrompt(roleQuestion);
                await createRole(roleName);
                break;
            case "Add an employee":
                break;    
            case "update an employee role":

                break;     

        }
        
    }
}

init();

