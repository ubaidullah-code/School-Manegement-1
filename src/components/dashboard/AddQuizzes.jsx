import React, { useState } from "react";
import { Button, TextField, Modal, Box, Typography } from "@mui/material";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const AddQuestionPage = () => {
    const [questionsList, setQuestionsList] = useState([
        { question: "", options: ["", "", "", ""], answer: "" },
    ]);
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

    const handleAnswerChange = (index, value) => {
        const updatedQuestions = [...questionsList];
        updatedQuestions[index].answer = value;
        setQuestionsList(updatedQuestions);
    };

    const addNewQuestion = () => {
        setQuestionsList([...questionsList, { question: "", options: ["", "", "", ""], answer: "" }]);
    };

    const questionAdd = async (e) => {
        e.preventDefault();
        //quizzes
        try {
            for (const q of questionsList) {
                await addDoc(collection(db, "quizzes"), {
                    question: q.question,
                    options: q.options,
                    answer: q.answer,
                    class: localData?.classCheck,
                    quizz: localData?.quizzCheck,
                });
            }
            console.log("All questions added successfully!");
        } catch (e) {
            console.error("Error adding document: ", e);
        }

        setQuestionsList([{ question: "", options: ["", "", "", ""], answer: "" }]);
        setModalOpen(false);
        localStorage.removeItem("quizz");
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

                                {q.options.map((opt, oIndex) => (
                                    <TextField
                                        key={oIndex}
                                        fullWidth
                                        label={`Option ${oIndex + 1}`}
                                        type="text"
                                        variant="outlined"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                ))}

                                <TextField
                                    fullWidth
                                    label="Answer"
                                    type="text"
                                    variant="outlined"
                                    value={q.answer}
                                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                    sx={{ mb: 2 }}
                                />
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
