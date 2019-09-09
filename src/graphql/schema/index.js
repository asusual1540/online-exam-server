module.exports = `
type Admin {
    _id: ID!
    name: String!
    password: String
    myTeachers: [Teacher!]
    date: String
}
type Teacher {
    _id: ID!
    name: String!
    password: String
    status: Boolean
    deptCode: String
    myAdmin: Admin
    myExams: [Exam!]
    myStudents: [Student!]
    date: String
}
type Student {
    _id: ID!
    name: String!
    password: String
    studentID: String!
    status: Boolean!
    submitStatus: Boolean!
    myExams: [Exam!]
    myAnswers: [Answer!]
    myResults: [Result!]
    myTeacher: Teacher
    date: String
}
type Exam {
    _id: ID!
    title: String!
    code: String!
    totalMarks: Int
    password: String
    examDate: String
    totalTimeInMin: Int
    status: Boolean
    course: Course
    question: Question
    students: [Student!]
    teacher: Teacher!
    result: Result
    semester: String
    year: Int
    chats:[Chat]
    loggedInStudents: [Student]
    restrictedStudents: [Student]
    temporaryRestrictedStudents: [Student]
    restrictAndSubmitStudentByID: [Student]
    permanentRestrictStudentByID: [Student]
    submittedStudents: [Student]
    date: String
}
type Chat {
    from: String!
    message: String
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
    image: String
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
    answers: [StdAns]
    myMarks : Int
    date: String
}
type StdAns {
    questionIndex : Int
    studentAnswer : Int
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

type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
    encoding: String!
  }

scalar Upload

input AdminInput {
    name: String!
    password: String!
    secret: String!
}
input TeacherInput {
    name: String!
    password: String!
    status: Boolean
    deptCode: String!
    adminID: String!
}
input MultipleTeacherField {
    name: String!
    password: String!
    status: Boolean
    deptCode: String!
}
input MultipleTeacherInput {
    name: String!
    password: String!
    status: Boolean
    deptCode: String!
}
input MultipleStudentInput {
    name: String!
    studentID: String!
    status: Boolean
    password: String! 
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
    semester: String!
    year: Int!
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
    semester: String
    year: String
    course: CourseInput
    teacherID: String!
}
input FileInput {
    name: String!
}

input AssignInput {
    examID: String!
    teacherID: String!
    studentIDs: [String]!
}

input UploadFileInput {
    files: Upload
    name: String
  }

type Query {
    get_all_admins: [Admin!]!
    get_all_teachers (adminID: String!): [Teacher!]!
    get_all_students (teacherID: String!): [Student!]!
    get_assigned_student (teacherID: String!, examID: String!): [Student!]!
    get_question_by_exam(examID : String!): Question
    get_all_exams (teacherID: String!): [Exam!]!
    get_exam_by_id (examID: String!) : Exam!
    get_teacher_by_id (teacherID: String!) : Teacher!
    get_student_by_id (studentID: String!) : Student!
    get_logged_in_students (examID: String!) : [Student]
    get_answer_by_students (studentIDs: [String!]!) : [Answer]
    adminLogin (name: String!, password: String!) : authData!
    teacherLogin (name: String!, password: String!) : authData!
    studentLogin (examCode: String!, examPassword: String!, studentID: String!, studentPassword: String!) : authData!
    logoutStudent(studentID: String!, examID: String!) : Boolean!
    quitExam(studentID: String!, examID: String!) : Boolean!
}
type Mutation {
    addAdmin(adminInput: AdminInput): Admin!
    changeAdminPassword(prevPassword: String!, newPassword: String!, adminID: String!): Admin!
    changeTeacherPassword(prevPassword: String!, newPassword: String!, teacherID: String!): Teacher!
    addTeacher(teacherInput: TeacherInput): Teacher!
    addMultipleTeacher(multipleTeacherInput: [MultipleTeacherInput]!, adminID: String!): [Teacher!]
    addMultipleStudent(multipleStudentInput: [MultipleStudentInput]!, teacherID: String!, examID: String!): [Student!]
    removeTeacher (teacherID: String!, adminID: String) : Teacher!
    updateTeacher (teacherUpdateInput: TeacherUpdateInput) : Teacher!
    updateTeacherStatus (status: Boolean!, teacherID: String!) : Boolean!
    addStudent(studentInput: StudentInput): Student!
    removeStudent (studentID: String!, teacherID: String!) : Student!
    updateStudent (studentUpdateInput: StudentUpdateInput) : Student!
    assign_students_to_exam (assignInput: AssignInput): Boolean!
    restrictStudentByID(studentID: String!, teacherID: String!, examID: String!) : Boolean!
    temporaryRestrictStudentByID(studentID: String!, teacherID: String!, examID: String!) : Boolean!
    permanentRestrictStudentByID(studentID: String!, teacherID: String!, examID: String!) : Boolean!
    restrictAndSubmitStudentByID(studentID: String!, teacherID: String!, examID: String!) : Boolean!
    permitStudentByID(studentID: String!, teacherID: String!, examID: String!) : Boolean!
    updateExam (examUpdateInput: ExamUpdateInput) : Exam!
    changeExamStatus (status: Boolean!, examID: String!) : Boolean
    addExam(examInput: ExamInput): Exam!
    removeExam(examID: String!, teacherID: String!): Exam!
    stopExam(examID: String!, teacherID: String!): Boolean!
    addQuestion(questionInput: QuestionInput!): Question!
    uploadFile(input: UploadFileInput!): Boolean!
    writeAnswer(studentID: String!, examID: String!, question_index: Int!, question_answer: Int!): Boolean!
    getAnswer(studentID: String!, examID: String!): Answer!
}
type Subscription {
    count: Int
    onExamStop (exam_id : String!) : Boolean
    studentLoggedIn(exam_id: String!) : Student
    studentLoggedOut(exam_id: String!) : Student
    studentQuitWithoutSubmit(exam_id: String!) : Student
    permanentStudentRestrict(exam_id: String!, studentID: String!) : Student
    temporaryStudentRestrict(exam_id: String!, studentID: String!) : Student
}
`
