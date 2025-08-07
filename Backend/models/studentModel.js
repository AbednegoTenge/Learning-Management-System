import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';
import studentCourse from './studentCourseModels.js';

class Student extends Model {}

Student.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100] // Password must be between 6 and 100 characters
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true // Validate that the email is in a correct format
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'student' // Default role is 'student'
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize, 
    modelName: 'Students',
    tableName: 'students',
    timestamps: true,
});


// Relationships
Student.hasOne(studentCourse, {
    foreignKey: 'studentId',
});

studentCourse.belongsTo(Student, {
    foreignKey: 'studentId',
});


export default Student;