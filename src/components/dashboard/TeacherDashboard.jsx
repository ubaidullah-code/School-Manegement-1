import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Users, BookOpen, Calendar, ClipboardCheck, 
  LogOut, CheckCircle, XCircle, Edit, Search
} from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import {  InputLabel, MenuItem, Select } from "@mui/material";
import { db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    class: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  
  const { user, signOut } = useAuthStore();
  
  // Fetch teacher's classes and students
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;
      
      try {
        // Get teacher data
        const teacherDoc = await getDocs(query(
          collection(db, 'users'),
          where('email', '==', user.email)
        ));
        
        if (!teacherDoc.empty) {
          const teacherData = teacherDoc.docs[0].data();
          
          // Get assigned classes
          const classesSnapshot = await getDocs(query(
            collection(db, 'classes'),
            where('teacherId', '==', teacherDoc.docs[0].id)
          ));
          
          const classesData = classesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setClasses(classesData);
          
          // Get students from those classes
          // if (classesData.length > 0) {
            // const classIds = classesData.map(cls => cls.id);
            
            const studentsSnapshot = await getDocs(query(
              collection(db, 'users'),
              where('role', '==', 'student'),
              where('class', '==', selectedValue)
            ));
            console.log("class", selectedValue)
            const studentsData = studentsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              attendance: doc.data().attendance || {}
            }));
            setStudents(studentsData);
            
          // }
          
          // Get quizzes created by this teacher
          const quizzesSnapshot = await getDocs(query(
            collection(db, 'quizzes'),
            where('teacherId', '==', teacherDoc.docs[0].id)
          ));
          
          const quizzesData = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setQuizzes(quizzesData);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };
    
    fetchTeacherData();
  }, [user, selectedValue]);
  
  // GSAP animations for tab changes
  useEffect(() => {
    gsap.fromTo(
      '.content-container',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeTab]);
  
  const handleAttendanceChange = async (studentId, date, status) => {
    try {
      const studentRef = doc(db, 'users', studentId);
      const studentDoc = students.find(s => s.id === studentId);
      
      if (!studentDoc) return;
      
      const updatedAttendance = {
        ...studentDoc.attendance,
        [date]: status
      };
      
      // Update in Firestore
      await updateDoc(studentRef, {
        attendance: updatedAttendance
      });
      
      // Update local state
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, attendance: updatedAttendance } 
          : student
      ));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };
  
  const handleAddQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    });
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions];
    
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = parseInt(value);
    }
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };
  
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const teacherDoc = await getDocs(query(
        collection(db, 'users'),
        where('email', '==', user.email)
      ));
      
      if (teacherDoc.empty) return;
      
      const newQuiz = {
        ...quizData,
        teacherId: teacherDoc.docs[0].id,
        createdAt: new Date().toISOString()
      };
      
      const quizRef = await addDoc(collection(db, 'quizzes'), newQuiz);
      
      setQuizzes([...quizzes, { id: quizRef.id, ...newQuiz }]);
      setShowQuizModal(false);
      setQuizData({
        title: '',
        description: '',
        class: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };
  
  const renderClassesTab = () => {
    return (
      <div className="content-container">
        <h2 className="text-xl font-semibold mb-6">Your Classes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div 
              key={cls.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedClass(cls)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{cls.name}</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-600 mb-4">{cls.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{cls.studentCount || 0} Students</span>
              </div>
            </div>
          ))}
          
          {classes.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No classes assigned yet.</p>
            </div>
          )}
        </div>
        
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedClass.name} Details</h2>
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600">{selectedClass.description}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Schedule</h3>
                <p className="text-gray-600">{selectedClass.schedule || 'No schedule set'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Students</h3>
                <div className="max-h-64 overflow-y-auto">
                  {students.filter(s => s.classId === selectedClass.id).map(student => (
                    <div key={student.id} className="flex items-center justify-between py-2 border-b">
                      <span>{student.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Attendance: {Object.values(student.attendance || {}).filter(v => v === 'present').length} days
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {students.filter(s => s.classId === selectedClass.id).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No students in this class</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderAttendanceTab = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return (
      <div className="content-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Attendance</h2>
          <div className="flex items-center space-x-2">
          <InputLabel>Select the Class </InputLabel>
      <Select value={selectedValue} onChange={handleChange} label="Select an option">
        <MenuItem value="Class 1">Class 1</MenuItem>
        <MenuItem value="Class 2">Class 2</MenuItem>
        <MenuItem value="Class 3">Class 3</MenuItem>
        <MenuItem value="Class 4">Class 4</MenuItem>
        <MenuItem value="Class 5">Class 5</MenuItem>
        <MenuItem value="Class 6">Class 6</MenuItem>
        <MenuItem value="Class 7">Class 7</MenuItem>
        <MenuItem value="Class 8">Class 8</MenuItem>
        <MenuItem value="Class 9">Class 9</MenuItem>
        <MenuItem value="Class 10">Class 10</MenuItem>
      </Select>
            <span className="text-sm text-gray-600">Date:</span>
            <input
              type="date"
              value={today}
              className="border rounded-md px-3 py-1"
              readOnly
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => {
                const attendanceStatus = student.attendance?.[today] || 'absent';
                // const studentClass = student[index]?.class || 'Not assigned';
          // console.log(studentClass);  
                console.log(student)
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.class || 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendanceStatus === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : attendanceStatus === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, today, 'present')}
                          className={`p-1 rounded-full ${
                            attendanceStatus === 'present' 
                              ? 'bg-green-100 text-green-600' 
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, today, 'late')}
                          className={`p-1 rounded-full ${
                            attendanceStatus === 'late' 
                              ? 'bg-yellow-100 text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-600'
                          }`}
                        >
                          <Calendar className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, today, 'absent')}
                          className={`p-1 rounded-full ${
                            attendanceStatus === 'absent' 
                              ? 'bg-red-100 text-red-600' 
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderQuizzesTab = () => {
    return (
      <div className="content-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Quizzes</h2>
          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Create Quiz
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{quiz.title}</h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <ClipboardCheck className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {quiz.questions?.length || 0} Questions
                </span>
                <span className="text-gray-500">
                  Class: {quiz.class || 'All'}
                </span>
              </div>
            </div>
          ))}
          
          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No quizzes created yet. Create your first quiz!</p>
            </div>
          )}
        </div>
        
        {/* Create Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Quiz</h2>
                <button 
                  onClick={() => setShowQuizModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateQuiz}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={quizData.description}
                    onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="2"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={quizData.class}
                    onChange={(e) => setQuizData({ ...quizData, class: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="All Classes">All Classes</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Questions</label>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  {quizData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border rounded-md p-4 mb-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question {qIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options
                        </label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center mb-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                              className="mr-2"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleQuestionChange(qIndex, `option-${oIndex}`, e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuizModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Quiz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return renderClassesTab();
      case 'attendance':
        return renderAttendanceTab();
      case 'quizzes':
        return renderQuizzesTab();
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    // <div className="min-h-screen bg-gray-100">
    //   <div className="flex">
    //     {/* Sidebar */}
    //     <div className="w-64 bg-green-800 min-h-screen p-4">
    //       <div className="flex items-center justify-center mb-8">
    //         <BookOpen className="h-8 w-8 text-white mr-2" />
    //         <h1 className="text-white text-xl font-bold">Teacher Portal</h1>
    //       </div>
          
    //       <nav className="space-y-2">
    //         <button
    //           onClick={() => setActiveTab('classes')}
    //           className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
    //             activeTab === 'classes' 
    //               ? 'bg-green-700 text-white' 
    //               : 'text-green-100 hover:bg-green-700'
    //           }`}
    //         >
    //           <Calendar className="h-5 w-5 mr-3" />
    //           My Classes
    //         </button>
            
    //         <button
    //           onClick={() => setActiveTab('attendance')}
    //           className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
    //             activeTab === 'attendance' 
    //               ? 'bg-green-700 text-white' 
    //               : 'text-green-100 hover:bg-green-700'
    //           }`}
    //         >
    //           <CheckCircle className="h-5 w-5 mr-3" />
    //           Attendance
    //         </button>
            
    //         <button
    //           onClick={() => setActiveTab('quizzes')}
    //           className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
    //             activeTab === 'quizzes' 
    //               ? 'bg-green-700 text-white' 
    //               : 'text-green-100 hover:bg-green-700'
    //           }`}
    //         >
    //           <ClipboardCheck className="h-5 w-5 mr-3" />
    //           Quizzes
    //         </button>
    //       </nav>
          
    //       <div className="absolute bottom-4 left-4 right-4">
    //         <button
    //           onClick={signOut}
    //           className="flex items-center w-full px-4 py-3 text-green-100 hover:bg-green-700 rounded-lg transition-colors"
    //         >
    //           <LogOut className="h-5 w-5 mr-3" />
    //           Sign Out
    //         </button>
    //       </div>
    //     </div>
        
    //     {/* Main content */}
    //     <div className="flex-1 p-8">
    //       <div className="flex justify-between items-center mb-8">
    //         <h1 className="text-2xl font-bold text-gray-800">
    //           {activeTab === 'classes' && 'My Classes'}
    //           {activeTab === 'attendance' && 'Mark Attendance'}
    //           {activeTab === 'quizzes' && 'Manage Quizzes'}
    //         </h1>
            
    //         <div className="flex items-center">
    //           <div className="mr-4 text-right">
    //             <p className="text-sm text-gray-600">Welcome,</p>
    //             <p className="text-sm font-medium">{user?.email}</p>
    //           </div>
    //           <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
    //             {user?.email?.charAt(0).toUpperCase() || 'T'}
    //           </div>
    //         </div>
    //       </div>
          
    //       {renderContent()}
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen bg-gray-100 pl-64"> {/* Add padding-left to avoid content overlap */}
  <div className="flex">
    {/* Sidebar */}
    <div className="fixed top-0 left-0 w-64 bg-green-800 h-full p-4">
      <div className="flex items-center justify-center mb-8">
        <BookOpen className="h-8 w-8 text-white mr-2" />
        <h1 className="text-white text-xl font-bold">Teacher Portal</h1>
      </div>
      
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'classes' 
              ? 'bg-green-700 text-white' 
              : 'text-green-100 hover:bg-green-700'
          }`}
        >
          <Calendar className="h-5 w-5 mr-3" />
          My Classes
        </button>
        
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'attendance' 
              ? 'bg-green-700 text-white' 
              : 'text-green-100 hover:bg-green-700'
          }`}
        >
          <CheckCircle className="h-5 w-5 mr-3" />
          Attendance
        </button>
        
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'quizzes' 
              ? 'bg-green-700 text-white' 
              : 'text-green-100 hover:bg-green-700'
          }`}
        >
          <ClipboardCheck className="h-5 w-5 mr-3" />
          Quizzes
        </button>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={signOut}
          className="flex items-center w-full px-4 py-3 text-green-100 hover:bg-green-700 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
    
    {/* Main content */}
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {activeTab === 'classes' && 'My Classes'}
          {activeTab === 'attendance' && 'Mark Attendance'}
          {activeTab === 'quizzes' && 'Manage Quizzes'}
        </h1>
        
        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p className="text-sm text-gray-600">Welcome,</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
            {user?.email?.charAt(0).toUpperCase() || 'T'}
          </div>
        </div>
      </div>
      
      {renderContent()}
    </div>
  </div>
</div>

  );
};

export default TeacherDashboard;