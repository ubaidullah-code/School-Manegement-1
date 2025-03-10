import React, { useState } from "react";
import { Button, TextField, Modal, Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const AddQuestionPage = () => {
    const [questionsList, setQuestionsList] = useState([
        { question: "", options: ["", "", "", ""], correctAnswer: 0 }, // Store index instead of text
    ]);
    const [handleDescription, setHandleDescription] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const db = getFirestore();
    const localData = JSON.parse(localStorage.getItem("quizz"));

    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...questionsList];
        updatedQuestions[index].question = value;
        setQuestionsList(updatedQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...questionsList];
        updatedQuestions[qIndex].options[oIndex] = value;
        setQuestionsList(updatedQuestions);
    };

    const handleAnswerChange = (qIndex, selectedIndex) => {
        const updatedQuestions = [...questionsList];
        updatedQuestions[qIndex].correctAnswer = selectedIndex; // Store selected option index
        setQuestionsList(updatedQuestions);
    };

    const addNewQuestion = () => {
        setQuestionsList([...questionsList, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    };

    const questionAdd = async (e) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, "quizzes"), {
                questions: questionsList.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer, // Store index of correct answer
                })),
                class: localData?.classCheck?.toLowerCase() || "",
                title: localData?.quizzCheck,
                description: handleDescription,
                createdAt: new Date().toISOString(),
            });

            console.log("Quiz added successfully!");
            setQuestionsList([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
            setModalOpen(false);
            localStorage.removeItem("quizz");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <>
            <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
                Add Quiz
            </Button>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
                        Add Questions
                    </Typography>
                    
                    <TextField
                        fullWidth
                        label="Description"
                        type="text"
                        variant="outlined"
                        value={handleDescription}
                        onChange={(e) => setHandleDescription(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <form onSubmit={questionAdd}>
                        {questionsList.map((q, qIndex) => (
                            <Box key={qIndex} sx={{ mb: 3, borderBottom: "1px solid #ddd", pb: 2 }}>
                                <TextField
                                    fullWidth
                                    label={`Question ${qIndex + 1}`}
                                    type="text"
                                    variant="outlined"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Select Correct Answer:
                                </Typography>

                                <RadioGroup
                                    value={q.correctAnswer}
                                    onChange={(e) => handleAnswerChange(qIndex, parseInt(e.target.value))}
                                >
                                    {q.options.map((opt, oIndex) => (
                                        <Box key={oIndex} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            <FormControlLabel
                                                value={oIndex}
                                                control={<Radio />}
                                                label={
                                                    <TextField
                                                        fullWidth
                                                        label={`Option ${oIndex + 1}`}
                                                        type="text"
                                                        variant="outlined"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    />
                                                }
                                            />
                                        </Box>
                                    ))}
                                </RadioGroup>
                            </Box>
                        ))}

                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={addNewQuestion}
                            sx={{ mb: 2 }}
                        >
                            + Add Another Question
                        </Button>

                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Button variant="outlined" color="secondary" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" color="primary">
                                Submit Questions
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
        </>
    );
};

export default AddQuestionPage;
