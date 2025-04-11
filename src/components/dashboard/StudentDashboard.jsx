import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  BookOpen, Calendar, ClipboardCheck, 
  LogOut, CheckCircle, Clock, Award,
  User, BookOpenCheck, BarChart2
} from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  
  const contentRef = useRef(null);
  const { user, signOut } = useAuthStore();
// console.log("q", studentData.quizResults.quizzDate)
  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    const attendance = studentData?.attendance || {};
    const attendanceDays = Object.keys(attendance).sort();
    const totalDays = attendanceDays.length || 1; // Avoid division by zero
    const presentDays = attendanceDays.filter(day => attendance[day] === 'present').length;
    const lateDays = attendanceDays.filter(day => attendance[day] === 'late').length;
    const absentDays = attendanceDays.filter(day => attendance[day] === 'absent').length;
    
    return {
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      attendancePercentage: Math.round((presentDays / totalDays) * 100)
    };
  };
  
  // GSAP animations
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        '.content-container',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeTab]);
  
  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      
      try {
        // Get student data
        const studentDoc = await getDocs(query(
          collection(db, 'users'),
          where('email', '==', user.email)
        ));
        
        if (!studentDoc.empty) {
          const student = {
            id: studentDoc.docs[0].id,
            ...studentDoc.docs[0].data()
          };
          setStudentData(student);
          
          if (student.classId) {
            const classDoc = await getDoc(doc(db, 'classes', student.classId));
            if (classDoc.exists()) {
              setClassData({
                id: classDoc.id,
                ...classDoc.data()
              });
            }
          }
          
          const quizzesSnapshot = await getDocs(query(
            collection(db, 'quizzes'),
            where('class', 'in', [studentData.class.toLowerCase(), ''])
          ));
          
          const quizzesData = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setQuizzes(quizzesData);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
    
    fetchStudentData();
  }, [user, studentData, selectedQuiz]);

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
  };
  
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: optionIndex
    });
  };
  const handleSubmitQuiz = async () => {
    const results = {
      totalQuestions: selectedQuiz.questions.length,
      correctAnswers: 0,
      score: 0,
      answers: {},
      quizName: selectedQuiz?.title,
    };
    const quizzDateCheck = {
      quizzDate: selectedQuiz?.createdAt, // Store quiz creation date

    }
    
  
    selectedQuiz.questions.forEach((question, index) => {
      const userAnswer = quizAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
  
      results.answers[index] = {
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
  
      if (isCorrect) {
        results.correctAnswers += 1;
      }
    });
  
    results.score = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  
    // Update Firestore before setting the state
    await updateQuizResult(results.score, results.quizName, quizzDateCheck.quizzDate);
  
    setQuizResults(results);
  };
  
  const updateQuizResult = async (score, quizName, quizzDate) => {
    try {
      const studentRef = doc(db, 'users', studentData?.id);
  
      // Get today's date
      const todayDate = new Date().toISOString();
  
      let updateData = {
        quizResults: arrayUnion({
          score,
          quizName,
          date: todayDate,  // When the student took the quiz
          lastAttemptDate: todayDate, // Store today's date separately
        }),
        quizzDate: arrayUnion(...[quizzDate]) // ✅ Correct
 // ✅ Correct
, // ✅ Store the quiz creation date inside quizResults
      };
  
      // Store `quizzDate` separately as well (only if it's defined)
      
  
      // Update Firestore
      await updateDoc(studentRef, updateData);
  
      // console.log('Quiz results, quiz date, and attempt date updated successfully');
    } catch (error) {
      console.error('Error updating quiz results:', error);
    }
  };
  
  
  
  
  
  
  const renderScheduleTab = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const subjects = classData?.subjects || [
      { name: 'Mathematics', teacher: 'Mr. Johnson', time: '9:00 AM - 10:30 AM' },
      { name: 'Science', teacher: 'Mrs. Smith', time: '11:00 AM - 12:30 PM' },
      { name: 'English', teacher: 'Ms. Davis', time: '1:30 PM - 3:00 PM' }     
    ];
    
    return (
      <div className="content-container">
        <h2 className="text-xl font-semibold mb-6">Class Schedule</h2>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-5 bg-blue-50">
            {weekdays.map((day) => (
              <div key={day} className="px-4 py-3 text-center font-medium text-blue-800 border-r border-blue-100">
                {day}
              </div>
            ))}
          </div>
          
          <div className="divide-y divide-gray-200">
            {subjects.map((subject, index) => (
              <div key={index} className="grid grid-cols-5">
                {weekdays.map((day, dayIndex) => {
                  const hasClass = (index + dayIndex) % 3 === 0;
                  
                  return (
                    <div 
                      key={day} 
                      className={`p-4 border-r ${hasClass ? 'bg-blue-50' : ''}`}
                    >
                      {hasClass && (
                        <div>
                          <p className="font-medium text-gray-800">{subject.name}</p>
                          <p className="text-sm text-gray-600">{subject.teacher}</p>
                          <p className="text-xs text-gray-500 mt-1">{subject.time}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
          
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-start p-3 border-b">
              <div className="bg-blue-100 p-2 rounded-lg mr-4">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Mid-Term Examination</p>
                <p className="text-sm text-gray-600">Next Monday - Friday</p>
              </div>
            </div>
            
            <div className="flex items-start p-3">
              <div className="bg-green-100 p-2 rounded-lg mr-4">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Science Fair</p>
                <p className="text-sm text-gray-600">October 15, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderQuizzesTab = () => {
    return (
      <div className="content-container">
        <h2 className="text-xl font-semibold mb-6">Quizzes</h2>
        
        {selectedQuiz ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">{selectedQuiz.title}</h3>
              {Object.keys(quizResults).length > 0 ? (
                <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">
                  Score: {quizResults.score}%
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {selectedQuiz.questions.length} Questions
                </div>
              )}
            </div>
            
            {Object.keys(quizResults).length > 0 ? (
              // Quiz Results
              <div>
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
                    <span className="text-2xl font-bold text-blue-800">{quizResults.score}%</span>
                  </div>
                  <p className="text-gray-600">
                    You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correct.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {selectedQuiz.questions.map((question, qIndex) => {
                    const result = quizResults.answers[qIndex];
                    
                    return (
                      <div key={qIndex} className="border rounded-md p-4">
                        <p className="font-medium mb-3">{qIndex + 1}. {question.question}</p>
                        
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className={`p-2 rounded-md ${
                                result.correctAnswer === oIndex
                                  ? 'bg-green-100 border border-green-300'
                                  : result.userAnswer === oIndex && !result.isCorrect
                                    ? 'bg-red-100 border border-red-300'
                                    : 'bg-gray-50'
                              }`}
                            >
                              {option}
                              {result.correctAnswer === oIndex && (
                                <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedQuiz(null);
                      setQuizResults({});
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-[#17b3a1]"
                  >
                    Back to Quizzes
                  </button>
                </div>
              </div>
            ) : (
              // Quiz Questions
              <div>
                <div className="space-y-6 mb-8">
                  {selectedQuiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border rounded-md p-4">
                      <p className="font-medium mb-3">{qIndex + 1}. {question.question}</p>
                      
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            className={`p-2 rounded-md cursor-pointer ${
                              quizAnswers[qIndex] === oIndex
                                ? 'bg-blue-100 border border-blue-300'
                                : 'bg-gray-50 hover:bg-[#17b3a1]'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedQuiz(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-[#17b3a1]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-[#17b3a1]"
                    disabled={Object.keys(quizAnswers).length !== selectedQuiz.questions.length}
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {("stud", studentData.quizzDate)}
            {quizzes.map((quiz, id) => {
  const isDisabled = studentData?.quizzDate?.includes(quiz?.createdAt);

  return (
    <div 
      key={quiz.id || id} 
      className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition duration-300 
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg "}`}
      onClick={!isDisabled ? () => handleStartQuiz(quiz) : undefined}
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
        {!isDisabled && (
          <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-800">
            Take Quiz
          </span>
        )}
      </div>
    </div>
  );
})}

            
            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No quizzes available for your class yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderAttendanceTab = () => {
    const { totalDays, presentDays, lateDays, absentDays, attendancePercentage } = calculateAttendanceStats();
    const attendance = studentData?.attendance || {};
    const attendanceDays = Object.keys(attendance).sort();
    
    return (
      <div className="content-container">
        <h2 className="text-xl font-semibold mb-6">Attendance Record</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold">{attendancePercentage}%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Present Days</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold">{presentDays}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Absent/Late</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold">{absentDays + lateDays}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceDays.length > 0 ? (
                attendanceDays.map((day) => {
                  const status = attendance[day];
                  
                  return (
                    <tr key={day} className="hover:bg-[#17b3a1]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(day).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
 
  const renderPerformanceTab = () => {
    const { attendancePercentage } = calculateAttendanceStats();
    
    // Sample performance data
    const subjects = [
      { name: 'Mathematics', score: 85, grade: 'A' },
      { name: 'Science', score: 92, grade: 'A+' },
      { name: 'English', score: 78, grade: 'B+' },
      { name: 'History', score: 88, grade: 'A' },
      { name: 'Geography', score: 75, grade: 'B' }
    ];
    
    
    
    return (
      <div className="content-container">
        <h2 className="text-xl font-semibold mb-6">Performance Report</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Subject Performance</h3>
            
            <div className="space-y-4 check">
              {subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{subject.name}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{subject.score}%</span>
                      <span  className={`px-2 py-1 rounded-full text-xs font-semibold  ${
                        subject.grade.startsWith('A') 
                          ? 'bg-green-100 text-green-800' 
                          : subject.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subject.grade}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        subject.score >= 90 
                          ? 'bg-green-500' 
                          : subject.score >= 80
                            ? 'bg-blue-500'
                            : subject.score >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Recent Quiz Results</h3>
            
            <div className="space-y-4">
              {("quizzResults", studentData.quizResults)}
              {studentData?.quizResults?.map((quiz) => (
                <div key={quiz.quizzName} className="flex items-center p-3 border rounded-md">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4">
                    <ClipboardCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{quiz.quizName}  ({quiz.lastAttemptDate.split('T')[0]}) </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          quiz.score >= 90 
                            ? 'bg-green-500' 
                            : quiz.score >= 80
                              ? 'bg-blue-500'
                              : quiz.score >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${quiz.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-lg font-bold">{quiz.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Overall Performance</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center mb-6 md:mb-0">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <svg className="h-32 w-32" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeDasharray="85, 100"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 mt-2">Average Score</p>
            </div>
            
            <div className="space-y-4 flex-1 max-w-md">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Academic Performance</span>
                  <span className="text-sm font-medium">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '88%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Attendance</span>
                  <span className="text-sm font-medium">{attendancePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${attendancePercentage}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Participation</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return renderScheduleTab();
      case 'quizzes':
        return renderQuizzesTab();
      case 'attendance':
        return renderAttendanceTab();
      case 'performance':
        return renderPerformanceTab();
      default:
        return <div>Select a tab</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 pl-64">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed top-0 left-0 w-64 bg-[#11998e] h-full p-4">
          <div className="flex items-center justify-center mb-8">
            <BookOpenCheck className="h-8 w-8 text-white mr-2" />
            <h1 className="text-white text-xl font-bold">Student Portal</h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'schedule' 
                  ? 'bg-[#17b3a1] text-white' 
                  : 'text-blue-100 hover:bg-[#17b3a1]'
              }`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Class Schedule
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'quizzes' 
                  ? 'bg-[#17b3a1] text-white' 
                  : 'text-blue-100 hover:bg-[#17b3a1]'
              }`}
            >
              <ClipboardCheck className="h-5 w-5 mr-3" />
              Quizzes
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'attendance' 
                  ? 'bg-[#17b3a1] text-white' 
                  : 'text-blue-100 hover:bg-[#17b3a1]'
              }`}
            >
              <CheckCircle className="h-5 w-5 mr-3" />
              Attendance
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'performance' 
                  ? 'bg-[#17b3a1] text-white' 
                  : 'text-blue-100 hover:bg-[#17b3a1]'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Performance
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-[#17b3a1] rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto h-screen" ref={contentRef}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'schedule' && 'Class Schedule'}
              {activeTab === 'quizzes' && 'Take Quizzes'}
              {activeTab === 'attendance' && 'Attendance Record'}
              {activeTab === 'performance' && 'Performance Report'}
            </h1>

            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="text-sm font-medium">{studentData?.name || user?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#17b3a1] flex items-center justify-center text-white font-medium">
                {studentData?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S'}
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;