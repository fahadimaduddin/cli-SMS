#! /usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
class Student {
    static idCounter = 10000;
    id;
    name;
    courses;
    balance;
    constructor(name) {
        this.id = Student.idCounter++;
        this.name = name;
        this.courses = [];
        this.balance = 0;
    }
    enroll(course) {
        if (!this.courses.find(c => c.name === course.name)) {
            this.courses.push(course);
            this.balance += course.cost;
            course.students.push(this.name); // Add student's name to the course
            console.log(chalk.green(`${this.name} enrolled in ${course.name} successfully!`));
        }
        else {
            console.log(chalk.red(`${this.name} is already enrolled in ${course.name}.`));
        }
    }
    viewBalance() {
        console.log(chalk.blue(`Balance for ${this.name}: $${this.balance}`));
    }
    payTuition(amount) {
        if (amount <= this.balance) {
            this.balance -= amount;
            console.log(chalk.green(`Thank you for your payment of $${amount}. Remaining balance: $${this.balance}`));
        }
        else {
            console.log(chalk.red(`Payment failed. Insufficient balance. Current balance: $${this.balance}`));
        }
    }
    showStatus() {
        console.log(chalk.yellow(`Student Name: ${this.name}`));
        console.log(chalk.yellow(`Student ID: ${this.id}`));
        console.log(chalk.yellow(`Courses Enrolled:`));
        this.courses.forEach(course => {
            console.log(chalk.yellow(`- ${course.name}`));
        });
        console.log(chalk.yellow(`Balance: $${this.balance}`));
    }
}
const courses = [
    { name: 'Math', cost: 200, students: [] },
    { name: 'Science', cost: 250, students: [] },
    { name: 'History', cost: 150, students: [] }
];
const students = [];
async function main() {
    const options = {
        ViewAllStudents: 'View All Students',
        SearchStudentByID: 'Search Student by ID',
        AddNewStudent: 'Add New Student',
        RemoveStudent: 'Remove Student',
        ViewAllCourses: 'View All Courses',
        PayTuition: 'Pay Tuition',
        Quit: 'Quit'
    };
    let continueApp = true;
    while (continueApp) {
        const choice = await inquirer.prompt({
            type: 'list',
            name: 'option',
            message: 'Choose an option:',
            choices: Object.values(options)
        });
        switch (choice.option) {
            case options.ViewAllStudents:
                viewAllStudents();
                break;
            case options.SearchStudentByID:
                await searchStudentByID();
                break;
            case options.AddNewStudent:
                await addNewStudent();
                break;
            case options.RemoveStudent:
                await removeStudent();
                break;
            case options.ViewAllCourses:
                viewAllCourses();
                break;
            case options.PayTuition:
                await payTuition();
                break;
            case options.Quit:
                continueApp = false;
                console.log(chalk.yellow('Exiting...'));
                break;
        }
    }
}
function viewAllStudents() {
    console.log(chalk.blue('All Enrolled Students:'));
    students.forEach(student => {
        console.log(chalk.yellow(`ID: ${student.id} | Name: ${student.name} | Balance: $${student.balance}`));
    });
}
async function searchStudentByID() {
    const { id } = await inquirer.prompt({
        type: 'input',
        name: 'id',
        message: 'Enter student ID to search:'
    });
    const student = students.find(s => s.id === parseInt(id));
    if (student) {
        console.log(chalk.blue('Student found:'));
        student.showStatus();
    }
    else {
        console.log(chalk.red('Student not found.'));
    }
}
async function addNewStudent() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter student name:'
    });
    const newStudent = new Student(name);
    // Prompt the user to select courses for the new student
    const selectedCourseNames = await inquirer.prompt({
        type: 'checkbox',
        name: 'courses',
        message: 'Select courses for the new student:',
        choices: courses.map(course => course.name)
    });
    // Enroll the new student in selected courses
    selectedCourseNames.courses.forEach((courseName) => {
        const course = courses.find(course => course.name === courseName);
        if (course) {
            newStudent.enroll(course);
        }
    });
    students.push(newStudent);
    console.log(chalk.green(`${newStudent.name} added successfully!`));
}
async function removeStudent() {
    const { id } = await inquirer.prompt({
        type: 'input',
        name: 'id',
        message: 'Enter student ID to remove:'
    });
    const index = students.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
        const removedStudent = students.splice(index, 1)[0];
        console.log(chalk.green(`${removedStudent.name} removed successfully!`));
    }
    else {
        console.log(chalk.red('Student not found.'));
    }
}
function viewAllCourses() {
    console.log(chalk.blue('Available Courses:'));
    courses.forEach(course => {
        console.log(chalk.yellow(`Name: ${course.name} | Cost: $${course.cost}`));
    });
}
async function payTuition() {
    const { id } = await inquirer.prompt({
        type: 'input',
        name: 'id',
        message: 'Enter student ID to pay tuition:'
    });
    const student = students.find(s => s.id === parseInt(id));
    if (student) {
        if (student.balance === 0) {
            console.log(chalk.yellow(`No outstanding balance for ${student.name}. No payment required.`));
        }
        else {
            console.log(chalk.yellow(`Outstanding balance for ${student.name}: $${student.balance}`));
            const { payment } = await inquirer.prompt({
                type: 'input',
                name: 'payment',
                message: 'Enter payment amount:'
            });
            const paymentAmount = parseFloat(payment);
            if (!isNaN(paymentAmount) && paymentAmount > 0) {
                if (paymentAmount <= student.balance) {
                    student.payTuition(paymentAmount);
                    console.log(chalk.green(`Payment of $${paymentAmount} received. Remaining balance: $${student.balance}`));
                }
                else {
                    console.log(chalk.red('Payment failed. Entered amount exceeds the outstanding balance.'));
                }
            }
            else {
                console.log(chalk.red('Invalid payment amount. Please enter a valid numeric value.'));
            }
        }
    }
    else {
        console.log(chalk.red('Student not found.'));
    }
}
main();
