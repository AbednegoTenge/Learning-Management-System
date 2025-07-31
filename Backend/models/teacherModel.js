import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Teacher extends Model {}

Teacher.init({
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
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'teacher' // Default role is 'teacher'
    },
    hireDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize, 
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: true,
})

export default Teacher;