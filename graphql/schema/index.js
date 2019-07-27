const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type Admin {
    _id: ID!
    name: String!
    password: String
    date: String!
    myTeachers: [Teacher!]
    myStudents: [Student!]
}
type Teacher {
    _id: ID!
    name: String!
    password: String
    status: Boolean
    deptCode: String!
    myAdmin: Admin
    myExams: [Exam!]
    myStudents: [Student!]
    date: String!
}
type Student {
    _id: ID!
    name: String
    password: String
    studentID: String
    status: Boolean
    myExams: [Exam!]
    myAnswers: [Answer!]
    myResults: [Result!]
    myTeacher: Teacher
    date: String!
}
type Exam {
    _id: ID
    title: String
    code: String
    password: String
    totalMarks: Int
    examDate: String
    totalTimeInMin: Int
    status: Boolean
    course: Course
    question: Question
    students: [Student!]
    teacher: Teacher!
    result: Result
    date: String
}
type Course {
    title: String
    code: String
}
type option {
    id: Int!
    text: String!
    answer: Boolean
}
type SingleQuestion {
    id: Int!
    text: String!
    mark: Int!
    options: [option!]
}

type Question {
    _id: ID!
    exam: Exam!
    questions: [SingleQuestion!]
    date: String!
}
type Answer {
    _id: ID!
    student: Student
    question: Question
    exam: Exam
    answers: [Boolean]
    date: String!
}
type Result {
    _id: ID!
    student: Student
    exam: Exam
    myResult: String
    date: String
}
type authData {
    token: String!
}

input AdminInput {
    name: String!
    password: String!
}
input TeacherInput {
    name: String!
    password: String!
    status: Boolean
    deptCode: String!
    adminID: String!
}
input TeacherUpdateInput {
    _id: ID!
    name: String!
    prevPassword: String
    newPassword: String
    status: Boolean!
    deptCode: String!
    adminID: String!
}
input StudentUpdateInput {
    _id: ID!
    name: String!
    status: Boolean!
    prevPassword: String
    newPassword: String
    studentID: String!
    teacherID: String!
}
input StudentInput {
    name: String!
    password: String!
    status: Boolean!
    studentID: String!
    teacherID: String!
}
input OptionsInput {
    text: String!
    answer: Boolean!
    id: Int!
}
input SingleQuestionInput {
    id: Int!
    text: String!
    mark: Int!
    options: [OptionsInput!]!
}
input QuestionInput {
    exam : String!
    questions: [SingleQuestionInput!]!
}
input CourseInput {
    title: String
    code: String
}

input ExamInput {
    title: String!
    code: String!
    password: String!
    totalMarks: Int
    examDate: String
    totalTimeInMin: Int
    status: Boolean
    course: CourseInput
    teacher: String!
}
input ExamUpdateInput {
    _id: ID!
    title: String!
    code: String!
    prevPassword: String
    newPassword: String
    totalMarks: Int
    examDate: String
    totalTimeInMin: Int
    status: Boolean
    course: CourseInput
    teacherID: String!
}

type RootQuery {
    get_all_admins: [Admin!]!
    get_all_teachers (adminID: String!): [Teacher!]!
    get_all_students (teacherID: String!): [Student!]!
    get_all_questions: [Question!]! 
    get_all_exams (teacherID: String!): [Exam!]!
    assign_students_to_exam: [Exam!]!
    adminLogin (name: String!, password: String!) : authData!
    teacherLogin (name: String!, password: String!) : authData!
}
type RootMutation {
    addAdmin(adminInput: AdminInput): Admin!
    changeAdminPassword(prevPassword: String!, newPassword: String!, adminID: String!): Admin!
    changeTeacherPassword(prevPassword: String!, newPassword: String!, teacherID: String!): Teacher!
    addTeacher(teacherInput: TeacherInput): Teacher!
    removeTeacher (teacherID: String!, adminID: String) : Teacher!
    updateTeacher (teacherUpdateInput: TeacherUpdateInput) : Teacher!
    addStudent(studentInput: StudentInput): Student!
    removeStudent (studentID: String!, teacherID: String!) : Student!
    updateStudent (studentUpdateInput: StudentUpdateInput) : Student!
    updateExam (examUpdateInput: ExamUpdateInput) : Exam!
    addExam(examInput: ExamInput): Exam!
    removeExam(examID: String!, teacherID: String!): Exam!
    addQuestion(questionInput: QuestionInput): Question!
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);
