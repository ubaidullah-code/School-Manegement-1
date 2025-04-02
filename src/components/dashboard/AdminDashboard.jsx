import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Users, UserPlus, BookOpen, Calendar, 
  ClipboardCheck, BarChart2, LogOut, 
  PlusCircle, Edit, Trash2, Search,
  School, // Add this line
  XCircle
} from 'lucide-react';


// import { TextField, Button, Box, Typography } from "@mui/material";

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';
import StatCard from './StatCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
// import AddQuestionPage from './AddQuizzes';
import ComingSoon from './ComingSoon';
import Swal from 'sweetalert2';



// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [quizData, setQuizData] = useState({
      title: '',
      description: '',
      class: '',
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
   

  const dashboardRef = useRef(null);
  const { user, signOut } = useAuthStore();
  console.log("quizzes", )
  // GSAP animations
  useEffect(() => {
    if (dashboardRef.current) {
      gsap.fromTo(
        '.stat-card',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "power2.out" 
        }
      );
    }
    (activeTab !== "quizzes")? setTrueCheck(false): setTrueCheck(true)
  }, [activeTab]);
  
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.email) return;

      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const teacherList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // setTeacherData(teacherList);
          // console.log("Teacher Data:", teacherList);
        } else {
          console.log("No teacher found with the given email.");
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };

    fetchTeacherData();
  }, [user]);
  // Fetch data from Firestore
  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      query(collection(db, "users"), where("role", "==", "student"), orderBy("class")),
      (snapshot) => {
        setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching students:", error)
    );
  
    const unsubscribeTeachers = onSnapshot(
      query(collection(db, "users"), where("role", "==", "teacher")),
      (snapshot) => {
        setTeachers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching teachers:", error)
    );
  
    const unsubscribeAdmins = onSnapshot(
      query(collection(db, "users"), where("role", "==", "admin")),
      (snapshot) => {
        (snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching admins:", error)
    );
  
    const unsubscribeClasses = onSnapshot(
      collection(db, "classes"),
      (snapshot) => {
        setClasses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching classes:", error)
    );
  
    const unsubscribeQuizzes = onSnapshot(
      collection(db, "quizzes"),
      (snapshot) => {
        setQuizzes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching quizzes:", error)
    );
  
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      unsubscribeStudents();
      unsubscribeTeachers();
      unsubscribeAdmins();
      unsubscribeClasses();
      unsubscribeQuizzes();
    };
  }, []);
  
 
let presentArr = [];
let lateArr = [];
let absentArr = [];

students.forEach(student => {
  let attendance = student.attendance ?? {}; // ✅ Get the attendance object safely

  Object.entries(attendance).forEach(([date, status]) => {
    if (status === "present") {
      presentArr.push(date);
    } else if (status === "late") {
      lateArr.push(date);
    } else if (status === "absent") {
      absentArr.push(date);
    }
  });
});

// console.log("Present Dates:", presentArr.length);
// console.log("Late Dates:", lateArr);
// console.log("Absent Dates:", absentArr);



  let numericResultsArray = [];

  students.forEach(student => {
      let lastOne = student.class?.split("") ?? [];  // Split class name into an array
      let result = lastOne.at(-1) ?? "No class available";  // Get last character or fallback
  
      // Convert result to number only if it's a valid digit
      let numericResult = !isNaN(result) && !isNaN(Number(result)) ? Number(result) : 0;
  
      numericResultsArray.push(numericResult);
  });
  
  let countMap = {};
  
  numericResultsArray.forEach(num => {
      countMap[num] = (countMap[num] || 0) + 1;
  });
  
  // console.log("countMap:", countMap);
  // console.log("Type of countMap[0]:",  countMap[1]);  // Will return "number" if key 0 exists
  // console.log("Last numericResult:", numericResultsArray[numericResultsArray.length - 1]);  // Last calculated value
  

  
// console.log("quizDataEdit.id", quizDataEdit.id)
  
  const handleAddNew = (type) => {
    setModalType(type);
    setFormData({});
    setEditingId(null);
    setShowAddModal(true);
  };
  
  const handleEdit = (type, item) => {
    setModalType(type);
    setFormData({ ...item });
    setEditingId(item.id);
    setShowAddModal(true);
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
  
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      let collectionName;
      switch (type) {
        case 'student':
        case 'teacher':
          collectionName = 'users';
          break;
        case 'class':
          collectionName = 'classes';
          break;
        case 'quiz':
          collectionName = 'quizzes';
          break;
        default:
          return;
      }
      
      await deleteDoc(doc(db, collectionName, id));
      
      // Update state
      switch (type) {
        case 'student':
          setStudents(students.filter(student => student.id !== id));
          break;
        case 'teacher':
          setTeachers(teachers.filter(teacher => teacher.id !== id));
          break;
        case 'class':
          setClasses(classes.filter(cls => cls.id !== id));
          break;
        case 'quiz':
          setQuizzes(quizzes.filter(quiz => quiz.id !== id));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let collectionName;
      switch (modalType) {
        case 'student':
        case 'teacher':
          collectionName = 'users';
          break;
        case 'class':
          collectionName = 'classes';
          break;
        case 'quiz':
          collectionName = 'quizzes';
          break;
        default:
          return;
      }
      
      if (editingId) {
        // Update existing document
        await updateDoc(doc(db, collectionName, editingId), formData);
        
        // Update state
        switch (modalType) {
          case 'student':
            setStudents(students.map(student => 
              student.id === editingId ? { ...student, ...formData } : student
            ));
            break;
          case 'teacher':
            setTeachers(teachers.map(teacher => 
              teacher.id === editingId ? { ...teacher, ...formData } : teacher
            ));
            break;
          case 'class':
            setClasses(classes.map(cls => 
              cls.id === editingId ? { ...cls, ...formData } : cls
            ));
            break;
          case 'quiz':
            setQuizzes(quizzes.map(quiz => 
              quiz.id === editingId ? { ...quiz, ...formData } : quiz
            ));
            break;
          default:
            break;
        }
      } else {
        // Add new document
        const newDoc = await addDoc(collection(db, collectionName), {
          ...formData,
          createdAt: new Date().toISOString(),
          ...(modalType === 'student' || modalType === 'teacher' ? { role: modalType } : {})
        });
        
        const newItem = {
          id: newDoc.id,
          ...formData,
          createdAt: new Date().toISOString(),
          ...(modalType === 'student' || modalType === 'teacher' ? { role: modalType } : {})
        };
        
        // Update state
        switch (modalType) {
          case 'student':
            setStudents([...students, newItem]);
            break;
          case 'teacher':
            setTeachers([...teachers, newItem]);
            break;
          case 'class':
            setClasses([...classes, newItem]);
            break;
          case 'quiz':
            setQuizzes([...quizzes, newItem]);
            break;
          default:
            break;
        }
      }
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Chart data
  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [presentArr.length, absentArr.length, lateArr.length],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
        borderWidth: 0,
      },
    ],
  };
  //graph data
  const performanceData = {
    labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', "Class 8", 'Class 9', 'Class 10'],
    datasets: [
      {
        label: 'Average Score',
        data: [countMap[1],countMap[2] , countMap[3],countMap[4], countMap[5], countMap[6],countMap[7], countMap[8], countMap[9], countMap[0]],  // ✅ Corrected
        backgroundColor: '#3B82F6',
      },
    ],
};
  
  

  const [errors, setErrors] = useState({});
  const [trueCheck, setTrueCheck] = useState(true);
  const [quizzCheck, setQuizzCheck] = useState("");
  const [classCheck, setClassCheck] = useState('');


  

  const validate = () => {
    let tempErrors = {};
    tempErrors.name =  quizzCheck ? "" : "Name is required";
    tempErrors.class = classCheck ? "" : "Please enter the class name";

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // console.log("Form Submitted", formDataform);
      // Reset form
      setClassCheck("")
      setQuizzCheck("")
      let classOne = classCheck.toLocaleUpperCase
      localStorage.setItem("quizz", JSON.stringify({classOne, quizzCheck}))
      console.log(classCheck, quizzCheck)
      setTrueCheck(false);
      setErrors({});
    }
  };


  
  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div ref={dashboardRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Students" 
              value={students.length} 
              icon={<Users className="h-8 w-8 text-blue-500" />} 
              className="stat-card"
            />
            <StatCard 
              title="Total Teachers" 
              value={teachers.length} 
              icon={<BookOpen className="h-8 w-8 text-green-500" />} 
              className="stat-card"
            />
            <StatCard 
              title="Total Classes" 
              value={classes.length} 
              icon={<Calendar className="h-8 w-8 text-purple-500" />} 
              className="stat-card"
            />
            <StatCard 
              title="Total Quizzes" 
              value={quizzes.length} 
              icon={<ClipboardCheck className="h-8 w-8 text-orange-500" />} 
              className="stat-card"
            />
            
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6 stat-card">
              <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
              <div className="h-64">
                <Pie data={attendanceData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6 stat-card">
              <h3 className="text-lg font-semibold mb-4">Performance by Class</h3>
              <div className="h-64">
                <Bar 
                  data={performanceData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        );
        
      case 'students':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manage Students</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={() => handleAddNew('student')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Student
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.class || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit('student', student)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete('student', student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'teachers':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manage Teachers</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={() => handleAddNew('teacher')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Teacher
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{teacher.subject || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit('teacher', teacher)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete('teacher', teacher.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        case 'quizzes':   
          return (
            <div className="content-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Quizzes</h2>
          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center px-4 py-2 bg-[#c31432] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Create Quiz
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {quizzes.map((quiz) => {
   

    const handleDelete = async (quiz) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });
  
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "quizzes", quiz.id));
          console.log("Deleted Quiz:", quiz.id);
          // You might want to update state here to remove the deleted quiz from UI
        } catch (error) {
          console.error("Error deleting quiz:", error);
        }
      }
    };
  

    return (
      <div
        key={quiz.id}
        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">{quiz.title}</h3>
          <div className="flex gap-2">
            
            <button onClick={() => handleDelete(quiz)} className="bg-red-500 text-white px-2 py-1 rounded">
              Delete
            </button>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{quiz.questions?.length || 0} Questions</span>
          <span className="text-gray-500">Class: {quiz.class || 'All'}</span>
        </div>
      </div>
    );
  })}

  {quizzes.length === 0 && (
    <div className="col-span-full text-center py-8 text-gray-500">
      <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
      <p>No quizzes created yet. Create your first quiz!</p>
    </div>
  )}
</div>

        
        {/* Create Quiz Modal */}
        {showQuizModal && (
          <div className="absolute top-12 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                  <input
                    type="text"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Which kind of quiz do you create?)</label>
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
                    // value={}
                    onChange={(e) => setQuizData({ ...quizData, class: e.target.value.toLowerCase() })}
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
          
      
      
        
      default:
        return (
        
          <ComingSoon/>
          // <QuizManager/>
          
          );

    }
  };
  
  const renderFormFields = () => {
    switch (modalType) {
      case 'student':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                name="class"
                value={formData.class || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Class</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                  <option key={cls} value={`Class ${cls}`}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
        
      case 'teacher':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 ">
     <div className="min-h-screen bg-gray-100 flex">
  {/* Sidebar (Fixed) */}
  <div className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-indigo-900 p-4 ">
    <div className="flex items-center justify-center mb-8">
      <School className="h-8 w-8 text-white mr-2" />
      <h1 className="text-white text-xl font-bold">School Admin</h1>
    </div>
    
    <nav className="space-y-2">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'dashboard' 
            ? 'bg-indigo-700 text-white' 
            : 'hover:bg-gradient-to-b from-gray-800 to-indigo-800'
        }`}
      >
        <BarChart2 className="h-5 w-5 mr-3" />
        Dashboard
      </button>

      <button
        onClick={() => setActiveTab('students')}
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'students' 
            ? 'bg-indigo-700 text-white' 
            : 'hover:bg-gradient-to-b from-gray-800 to-indigo-800'
        }`}
      >
        <Users className="h-5 w-5 mr-3" />
        Students
      </button>

      <button
        onClick={() => setActiveTab('teachers')}
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'teachers' 
            ? 'bg-indigo-700 text-white' 
            : 'hover:bg-gradient-to-b from-gray-800 to-indigo-800'
        }`}
      >
        <BookOpen className="h-5 w-5 mr-3" />
        Teachers
      </button>

      <button
        onClick={() => setActiveTab('classes')}
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'classes' 
            ? 'bg-indigo-700 text-white' 
            : 'hover:bg-gradient-to-b from-gray-800 to-indigo-800'
        }`}
      >
        <Calendar className="h-5 w-5 mr-3" />
        Classes
      </button>

      <button
        onClick={() => setActiveTab('quizzes')}
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'quizzes' 
            ? 'bg-indigo-700 text-white' 
            : 'hover:bg-gradient-to-b from-gray-800 to-indigo-800'
        }`}
      >
        <ClipboardCheck className="h-5 w-5 mr-3" />
        Quizzes
      </button>
    </nav>

    <div className="absolute bottom-4 left-4 right-4">
      <button
        onClick={signOut}
        className="flex items-center w-full px-4 py-3 hover:bg-gradient-to-b from-gray-800 to-indigo-800 rounded-lg transition-colors"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sign Out
      </button>
    </div>
  </div>

  {/* Main Content (Moves Right) */}
  <div className="flex-1 ml-64 p-8 ">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-800">
        {activeTab === 'dashboard' && 'Dashboard Overview'}
        {activeTab === 'students' && 'Student Management'}
        {activeTab === 'teachers' && 'Teacher Management'}
        {activeTab === 'classes' && 'Class Management'}
        {activeTab === 'quizzes' && 'Quiz Management'}
      </h1>

      <div className="flex items-center">
        <div className="mr-4 text-right">
          <p className="text-sm text-gray-600">Welcome,</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
          {user?.email?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
    </div>

    {renderDashboardContent()}
  </div>
</div>

      
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? `Edit ${modalType}` : `Add New ${modalType}`}
            </h2>
            
            <form onSubmit={handleFormSubmit}>
              {renderFormFields()}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;