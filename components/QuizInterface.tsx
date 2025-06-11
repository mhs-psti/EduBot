import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

// Sample quiz questions - in a real app, these would be generated from the book content or passed as props
const quizQuestions = [
  {
    question: "Apa yang dimaksud dengan Pancasila?",
    options: [
      "Lima dasar negara Indonesia",
      "Empat pilar bangsa",
      "Tiga prinsip utama",
      "Enam nilai luhur"
    ],
    correctAnswer: 0
  },
  {
    question: "Sila pertama Pancasila adalah?",
    options: [
      "Kemanusiaan yang adil dan beradab",
      "Ketuhanan Yang Maha Esa",
      "Persatuan Indonesia",
      "Kerakyatan yang dipimpin oleh hikmat"
    ],
    correctAnswer: 1
  },
  {
    question: "Lambang sila kedua Pancasila adalah?",
    options: [
      "Bintang",
      "Rantai",
      "Pohon beringin",
      "Kepala banteng"
    ],
    correctAnswer: 1
  },
  {
    question: "Apa makna dari sila ketiga Pancasila?",
    options: [
      "Persatuan dan kesatuan bangsa",
      "Keadilan sosial",
      "Demokrasi",
      "Toleransi beragama"
    ],
    correctAnswer: 0
  },
  {
    question: "Pancasila ditetapkan sebagai dasar negara pada tanggal?",
    options: [
      "17 Agustus 1945",
      "18 Agustus 1945",
      "1 Juni 1945",
      "22 Juni 1945"
    ],
    correctAnswer: 1
  }
];

interface QuizInterfaceProps {
  visible: boolean;
  onClose: () => void;
  bookName?: string;
  questions?: typeof quizQuestions; // Allow custom questions to be passed
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  visible,
  onClose,
  bookName = "Book",
  questions = quizQuestions
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score and complete quiz
      let score = 0;
      selectedAnswers.forEach((answer, index) => {
        if (answer === questions[index].correctAnswer) {
          score++;
        }
      });
      setQuizScore(score);
      setQuizCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizCompleted(false);
    setQuizScore(0);
  };

  const handleClose = () => {
    // Reset quiz state when closing
    resetQuiz();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={handleClose}>
            <ArrowLeft size={24} color="#212121" />
          </TouchableOpacity>
          <Text style={styles.quizTitle}>Quiz: {bookName}</Text>
        </View>

        {!quizCompleted ? (
          <ScrollView style={styles.quizContent}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <Text style={styles.questionText}>
              {questions[currentQuestionIndex].question}
            </Text>

            <View style={styles.optionsContainer}>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
                  ]}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navigationButtons}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePreviousQuestion}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.nextButton,
                  selectedAnswers[currentQuestionIndex] === undefined && styles.disabledButton
                ]}
                onPress={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
              >
                <Text style={styles.navButtonText}>
                  {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Quiz Complete!</Text>
            <Text style={styles.scoreText}>
              Your Score: {quizScore}/{questions.length}
            </Text>
            <Text style={styles.percentageText}>
              {Math.round((quizScore / questions.length) * 100)}%
            </Text>
            <View style={styles.resultButtons}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetQuiz}
              >
                <Text style={styles.retryButtonText}>Retry Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  quizContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
    color: '#212121',
    marginLeft: 16,
  },
  quizContent: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#757575',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#3F51B5',
    borderRadius: 2,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#212121',
    marginBottom: 24,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#3F51B5',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#212121',
  },
  selectedOptionText: {
    color: '#3F51B5',
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: '#3F51B5',
    minWidth: 100,
  },
  nextButton: {
    marginLeft: 'auto',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  resultsTitle: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#212121',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 48,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 32,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: '#3F51B5',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: '#757575',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '600',
  },
}); 