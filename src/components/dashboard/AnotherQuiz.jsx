import React, { useState } from 'react'

const AnotherQuiz = () => {
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizzes, setQuizzes] = useState([]);
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        class: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      });
    const handleAddQuestion = () => {
        setQuizData({
          ...quizData,
          questions: [
            ...quizData.questions,
            { question: '', options: ['', '', '', ''], correctAnswer: 0 }
          ]
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
  return (
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
  )
}

export default AnotherQuiz
