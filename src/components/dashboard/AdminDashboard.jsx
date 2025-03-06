import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Users, UserPlus, BookOpen, Calendar, 
  ClipboardCheck, BarChart2, LogOut, 
  PlusCircle, Edit, Trash2, Search,
  School // Add this line
} from 'lucide-react';


import { TextField, Button, Box, Typography } from "@mui/material";

import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import useAuthStore from '../../store/authStore';
import StatCard from './StatCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import AddQuestionPage from './AddQuizzes';
import ComingSoon from './ComingSoon';



// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const dashboardRef = useRef(null);
  const { user, signOut } = useAuthStore();
  
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
  }, [activeTab]);
  // const[numericResult1,setNumericResult1]=useState([])
  
  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [studentsSnapshot, teachersSnapshot, classesSnapshot, quizzesSnapshot] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "student"))),
          getDocs(query(collection(db, "users"), where("role", "==", "teacher"))),
          getDocs(collection(db, "classes")),
          
          getDocs( collection(db, "quizzes", ))
        ]);

        // Process documents
        const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const quizzesData = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // console.log("Quizzes:", quizzesData);

        // Update state once
       
        
        setTeachers(teachersData);
        setClasses(classesData);
        setStudents(studentsData);
        setQuizzes(quizzesData);
        // console.log("quiz", quizzes)
        
      
      
        

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);
  
 
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
  
  console.log("countMap:", countMap);
  // console.log("Type of countMap[0]:",  countMap[1]);  // Will return "number" if key 0 exists
  // console.log("Last numericResult:", numericResultsArray[numericResultsArray.length - 1]);  // Last calculated value
  

  

  
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
        data: [85, 10, 5],
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
      localStorage.setItem("quizz", JSON.stringify({classCheck, quizzCheck}))
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
         return(
          <>
          {(trueCheck)?
          <div className="w-[calc(100%-18rem)]">
          <div style={{transform: "translate(-50%, -50%)", top: "50%", left: "60%", position:"absolute", }}>
          <Box
          sx={{
            maxWidth: 400,
            mx: "auto",
            mt: 5,
            p: 3,
            bgcolor: "white",
            boxShadow: 3,
            borderRadius: 2,
            textAlign: "center",
            
          }}
          
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Add Quizz
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Quizz"
              name="name"
              value={quizzCheck}
              onChange={(e)=>{setQuizzCheck(e.target.value)}}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Class Name"
              name="name"
              type="name"
              value={classCheck}
              onChange={(e)=>{setClassCheck(e.target.value)}}
              error={!!errors.class}
              helperText={errors.class}
              sx={{ mb: 2 }}
            />
            
            <Button variant="contained" type="submit" color="primary" fullWidth >
              Submit
            </Button>
          </form>
        </Box>
        </div>
        </div>
          :
            <AddQuestionPage  />
          }
          </>
            
          
          )
      
      
        
      default:
        return (
        
          <ComingSoon/>
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
  <div className="fixed top-0 left-0 h-full w-64 bg-indigo-800 p-4">
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
            : 'text-indigo-100 hover:bg-indigo-700'
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
            : 'text-indigo-100 hover:bg-indigo-700'
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
            : 'text-indigo-100 hover:bg-indigo-700'
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
            : 'text-indigo-100 hover:bg-indigo-700'
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
            : 'text-indigo-100 hover:bg-indigo-700'
        }`}
      >
        <ClipboardCheck className="h-5 w-5 mr-3" />
        Quizzes
      </button>
    </nav>

    <div className="absolute bottom-4 left-4 right-4">
      <button
        onClick={signOut}
        className="flex items-center w-full px-4 py-3 text-indigo-100 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sign Out
      </button>
    </div>
  </div>

  {/* Main Content (Moves Right) */}
  <div className="flex-1 ml-64 p-8">
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