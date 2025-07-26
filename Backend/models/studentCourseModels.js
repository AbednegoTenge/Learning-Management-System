import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize'; 

class StudentCourse extends Model {}

StudentCourse.init({
  studentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Students',
      key: 'id',
    },
    allowNull: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Courses',
      key: 'id',
    },
    allowNull: false,
  },
  electives: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'StudentCourse',
  timestamps: false,
});

export default StudentCourse;
