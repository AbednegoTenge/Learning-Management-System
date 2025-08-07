import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';
import StudentCourse from './studentCourseModels.js';

class Course extends Model {}

Course.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Courses',
    tableName: 'courses'
});

Course.hasMany(StudentCourse, {
    foreignKey: 'courseId',
});

StudentCourse.belongsTo(Course, {
    foreignKey: 'courseId',
});


export default Course;