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

const setUpdateEmployeeQuestion = async (employees,roles) => {
    return [
        {
            type: "list",
            name: "employee",
            message: "Which employee you would like to choose?",
            choices: employees,
        },
        {
            type: "list",
            name: "role",
            message: "Which role would you like to reassign to the employee?",
            choices: roles,
        },
    ]
}

const setEmployeeQuestion = (question) => {
    return [
        {
            type: "input",
            name: "firstname",
            message: "What is the first name of the employee?",
        },
        {
            type: "input",
            name: "lastname",
            message: "What is the last name of the employee?",
        },
        {
            type: "list",
            name: "role",
            message: "What is the role of the employee?",
            choices: question,
        },
        {
            type: "list",
            name: "hasManager",
            message: "Do the employee has a manager?",
            choices: ["Yes","No"],
        },
    ]

}

const exitOrNotQuestions = [
    {
        type: "list",
        name: "exitOrNot",
        message: "Are you finished with the application?",
        choices: ["Yes","No"],
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
                        (SELECT first_name FROM employee WHERE id = manager_id_number LIMIT 1) AS 'manager_firstname',
                        (SELECT last_name FROM employee WHERE id = manager_id_number LIMIT 1) AS 'manager_lastname' 
                        FROM employee 
                        JOIN (SELECT company_role.id AS role_id, title, salary, department_name  FROM company_role JOIN department ON company_role.department_id = department.id) AS role 
                        ON employee.role_id = role.role_id ORDER BY employee.id;`)
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

const createDepartment = async (departmentName) => {
    const {department} =  departmentName;
    await con.promise().query(`INSERT INTO department (department_name) VALUES ('${department}');`)
    .then( (result) =>{
        console.clear();
        console.log("Department has been created.");
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
        console.clear();
        console.log("Company role has been created.");
    });
}

const createEmployee = async () => {
    var manager_id = null;
    var result_obj = new Array();
    var role_question = new Array();
    const manager_array = new Array();
    setEmployeeQuestion();
    await con.promise().query(`SELECT title FROM company_role ORDER BY id;`)
    .then(([result,col]) =>{
        result_obj = result;
    });
    result_obj.forEach(item => {
        role_question.push(item.title);
    });
    const quests = [
        {
            type: "input",
            name: "firstname",
            message: "What is the first name of the employee?",
        },
        {
            type: "input",
            name: "lastname",
            message: "What is the last name of the employee?",
        },
        {
            type: "list",
            name: "role",
            message: "What is the role of the employee?",
            choices: role_question,
        },
        {
            type: "list",
            name: "hasManager",
            message: "Does the employee have a manager?",
            choices: ["Yes","No"],
        },
    ];
    const response = await startPrompt(quests);
    if(response.hasManager == "Yes"){
        await con.promise().query(`SELECT first_name, last_name, company_role.title FROM employee JOIN company_role ON role_id = company_role.id where company_role.title LIKE '%Manager%' ORDER BY employee.id; `)
        .then(([result,col]) => {
                result.forEach(manager => {
                    let manager_str = JSON.stringify(manager);
                    manager_array.push(manager_str.substring(1,manager_str.length-1));
                });
        });
        const manager_response = await startPrompt(
                {
                    type: "list",
                    name: "manager",
                    message: "Select the manager for the employee:",
                    choices: manager_array,
                }
            );
        manager_id = `'` + manager_array.indexOf(manager_response.manager) + 1 +`'`;
    }
    const role_id = role_question.indexOf(response.role) + 1;
    await con.promise().query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ('${response.firstname}','${response.lastname}', '${role_id}', ${manager_id});`)
    .then( (result) =>{
        console.clear();
        console.log("Employee has been created.")
    });
}

const updateEmployeeRole = async () => {
    const employees_array = new Array();
    const roles_array = new Array();
    await con.promise().query(`SELECT employee.id, first_name, last_name, title FROM employee JOIN company_role ON role_id = company_role.id ORDER BY employee.id;`)
    .then(([result,col]) => {
        result.forEach(employee => {
            const current_role = `Full Name: ${employee.first_name} ${employee.last_name} | Title: ${employee.title}`;
            employees_array.push(current_role);
        });
    })
    await con.promise().query(`SELECT title FROM company_role;`)
    .then(([result,col]) => {
        result.forEach(role => {
            const current_role = `Job Title: ${role.title}`;
            roles_array.push(current_role);
        });
    })
    const employee_question = await setUpdateEmployeeQuestion(employees_array,roles_array);
    const response = await startPrompt(employee_question);
    const role_id = roles_array.indexOf(response.role) + 1;
    const employee_id = employees_array.indexOf(response.employee) + 1;
    await con.promise().query(`UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id}`)
    .then((result) => {
        console.clear();
        console.log(`Employee's role has been updated.`);
    });

};


const startPrompt = async (questionSet) => {
    const answer = await inquirer.prompt(questionSet);
    return answer;
}

const init = async () => {
    console.clear();
    await startPrompt(initQuestion);
    while(!finishOrNot){
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
                await createDepartment(departmentName);
                break;
            case "Add a role":
                const roleName = await startPrompt(roleQuestion);
                await createRole(roleName);
                break;
            case "Add an employee":
                await createEmployee();
                break;    
            case "Update an employee role":
                await updateEmployeeRole();
                break;     

        }
        const answer = await startPrompt(exitOrNotQuestions);
        finishOrNot = answer.exitOrNot == "Yes"? true: false;
    }
    con.end();
}

init();

