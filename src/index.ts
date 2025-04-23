// Importing necessary modules and functions
import inquirer from 'inquirer';
import logo from 'asciiart-logo';
import Db from './config/index.js'; // ✅ Matches output location
const db = new Db();

console.log(
  logo({ name: 'Employee Tracker' }).render()
);

mainMenu();

function mainMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'View All Departments', value: 'VIEW_DEPARTMENTS' },
          { name: 'View All Roles', value: 'VIEW_ROLES' },
          { name: 'View All Employees', value: 'VIEW_EMPLOYEES' },
          { name: 'Add Department', value: 'ADD_DEPARTMENT' },
          { name: 'Add Role', value: 'ADD_ROLE' },
          { name: 'Add Employee', value: 'ADD_EMPLOYEE' },
          { name: 'Update Employee Role', value: 'UPDATE_EMPLOYEE_ROLE' },
          { name: 'Delete Employee', value: 'DELETE_EMPLOYEE' },
          { name: 'Delete Role', value: 'DELETE_ROLE' },
          { name: 'Delete Department', value: 'DELETE_DEPARTMENT' },
          { name: 'Quit', value: 'QUIT' }
        ]
      }
    ])
    .then((res) => {
      let choice = res.action;
      switch (choice) {
        case 'VIEW_DEPARTMENTS':
          viewDepartments();
          break;
        case 'VIEW_ROLES':
          viewRoles();
          break;
        case 'VIEW_EMPLOYEES':
          viewEmployees();
          break;
        case 'ADD_DEPARTMENT':
          addDepartment();
          break;
        case 'ADD_ROLE':
          addRole();
          break;
        case 'ADD_EMPLOYEE':
          addEmployee();
          break;
        case 'UPDATE_EMPLOYEE_ROLE':
          updateEmployeeRole();
          break;
        case 'DELETE_EMPLOYEE':
          deleteEmployee();
          break;
        case 'DELETE_DEPARTMENT':
          deleteDepartment();
          break;
        case 'DELETE_ROLE':
          deleteRole();
          break;
        default:
          quit();
      }
    });
}

function viewDepartments() {
  db.findAllDepartments()
    .then((result) => {
      const rows = result.rows;
      console.table(rows);
    })
    .then(() => mainMenu());
}

function viewRoles() {
  db.findAllRoles()
    .then((result) => {
      const rows = result.rows;
      console.table(rows);
    })
    .then(() => mainMenu());
}

function viewEmployees() {
  db.findAllEmployees()
    .then((result) => {
      const rows = result.rows;
      console.table(rows);
    })
    .then(() => mainMenu());
}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: 'name',
        message: 'What is the name of the department?'
      }
    ])
    .then((res) => {
      let name = res;
      db.createDepartment(name)
        .then(() => console.log(`Added ${name.name} to the database`))
        .then(() => mainMenu());
    });
}

function addRole() {
  db.findAllDepartments()
    .then((result) => {
      const departments = result.rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      inquirer
        .prompt([
          {
            name: 'title',
            message: 'What is the name of the role?'
          },
          {
            name: 'salary',
            message: 'What is the salary of the role?'
          },
          {
            type: 'list',
            name: 'department_id',
            message: 'Which department does the role belong to?',
            choices: departmentChoices
          }
        ])
        .then((role) => {
          db.createRole(role)
            .then(() => console.log(`Added ${role.title} to the database`))
            .then(() => mainMenu());
        });
    });
}

function addEmployee() {
  inquirer
    .prompt([
      {
        name: 'first_name',
        message: "What is the employee's first name?"
      },
      {
        name: 'last_name',
        message: "What is the employee's last name?"
      }
    ])
    .then((res) => {
      let firstName = res.first_name;
      let lastName = res.last_name;

      db.findAllRoles()
        .then((result) => {
          const roles = result.rows;
          const roleChoices = roles.map(({ id, title }) => ({
            name: title,
            value: id
          }));

          inquirer
            .prompt({
              type: 'list',
              name: 'roleId',
              message: "What is the employee's role?",
              choices: roleChoices
            })
            .then((res) => {
              let roleId = res.roleId;

              db.findAllEmployees()
                .then((result) => {
                  const employees = result.rows;
                  const managerChoices = employees.map(({ id, first_name, last_name }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                  }));

                  managerChoices.unshift({ name: 'None', value: null as number | null });

                  inquirer
                    .prompt({
                      type: 'list',
                      name: 'managerId',
                      message: "Who is the employee's manager?",
                      choices: managerChoices
                    })
                    .then((res) => {
                      let employee = {
                        manager_id: res.managerId,
                        role_id: roleId,
                        first_name: firstName,
                        last_name: lastName
                      };

                      db.createEmployee(employee);
                    })
                    .then(() => console.log(`Added ${firstName} ${lastName} to the database`))
                    .then(() => mainMenu());
                });
            });
        });
    });
}

function updateEmployeeRole() {
  db.findAllEmployees()
    .then((result) => {
      const employees = result.rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'employeeId',
            message: 'Which employee do you want to update?',
            choices: employeeChoices
          }
        ])
        .then((res) => {
          let employeeId = res.employeeId;
          db.findAllRoles()
            .then((result) => {
              const roles = result.rows;
              const roleChoices = roles.map(({ id, title }) => ({
                name: title,
                value: id
              }));

              inquirer
                .prompt([
                  {
                    type: 'list',
                    name: 'roleId',
                    message: 'What is the new role of the employee?',
                    choices: roleChoices
                  }
                ])
                .then((res) => db.updateEmployeeRole(employeeId, res.roleId))
                .then(() => console.log("Updated employee's role"))
                .then(() => mainMenu());
            });
        });
    });
}

function deleteEmployee() {
  db.findAllEmployees()
    .then((result) => {
      const employees = result.rows;
      const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
      }));

      inquirer
        .prompt({
          type: 'list',
          name: 'employeeId',
          message: 'Which employee do you want to delete?',
          choices: employeeChoices
        })
        .then((res) => db.deleteEmployee(res.employeeId))
        .then(() => console.log('Deleted employee from the database'))
        .then(() => mainMenu());
    });
}

function deleteRole() {
  db.findAllRoles()
    .then((result) => {
      const roles = result.rows;
      const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
      }));

      inquirer
        .prompt({
          type: 'list',
          name: 'roleId',
          message: 'Which role do you want to delete? (Warning: This will also delete employees)',
          choices: roleChoices
        })
        .then((res) => db.deleteRole(res.roleId))
        .then(() => console.log('Deleted role from the database'))
        .then(() => mainMenu());
    });
}

function deleteDepartment() {
  db.findAllDepartments()
    .then((result) => {
      const departments = result.rows;
      const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
      }));

      inquirer
        .prompt({
          type: 'list',
          name: 'departmentId',
          message: 'Which department would you like to delete? (Warning: This will also delete associated roles and employees)',
          choices: departmentChoices
        })
        .then((res) => db.deleteDepartment(res.departmentId))
        .then(() => console.log(`Deleted department from the database`))
        .then(() => mainMenu());
    });
}

function quit() {
  console.log('Goodbye!');
  process.exit();
}
