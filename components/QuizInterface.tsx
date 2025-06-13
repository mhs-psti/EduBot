import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../utils/app';
import { generateQuizQuestions, QuizQuestion } from '../utils/openai';

interface QuizInterfaceProps {
  visible: boolean;
  onClose: () => void;
  bookName?: string;
  documentIds: string[]; // Array of document IDs for generating questions from multiple summaries
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  visible,
  onClose,
  bookName = "Book",
  documentIds
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Load quiz questions when component becomes visible
  useEffect(() => {
    if (visible && documentIds.length > 0) {
      loadQuizQuestions();
    }
  }, [visible, documentIds]);

  const loadQuizQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    setQuestions([]);

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('questions')
        .eq('document_id', documentIds[0])
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === '406') {
          // Not found, allow generation
          setQuestionsError('No quiz questions found. You can generate them.');
        } else {
          setQuestionsError('Failed to load quiz questions');
        }
        setQuestions([]);
      } else {
        const loadedQuestions = data?.questions || [];
        setQuestions(loadedQuestions);
        setQuestionsError(null);
      }
    } catch (e) {
      console.error('Error loading quiz questions:', e);
      setQuestionsError('Failed to load quiz questions');
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (documentIds.length === 0) {
      setQuestionsError('Missing document IDs');
      return;
    }

    setGenerateLoading(true);
    setQuestionsError(null);

    try {
      // 1. Fetch document summaries from summaries table for all documents
      const { data, error } = await supabase
        .from('summaries')
        .select('summary')
        .in('document_id', documentIds);

      if (error || !data || data.length === 0) {
        setQuestionsError(error?.code === 'PGRST116' || error?.code === '406' 
          ? "No document summaries found. Please generate summaries first." 
          : "Failed to fetch document summaries");
        return;
      }

      // Combine all summaries
      const combinedSummary = data.map(d => d.summary).join('\n\n');

      // 2. Generate quiz questions from combined summary using OpenAI
      const generatedQuestions = await generateQuizQuestions(combinedSummary);

      // 3. Save questions to Supabase using the first document ID as reference
      const { error: saveError } = await supabase
        .from("quiz_questions")
        .insert([{ document_id: documentIds[0], questions: generatedQuestions }]);

      if (saveError) {
        setQuestionsError("Failed to save quiz questions");
        return;
      }

      setQuestions(generatedQuestions);
      setQuestionsError(null);
    } catch (e: any) {
      setQuestionsError(e.message || "Failed to generate quiz questions");
    } finally {
      setGenerateLoading(false);
    }
  };

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

        {questionsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading quiz questions...</Text>
          </View>
        ) : questionsError && (questionsError.includes('generate them') || questionsError.includes('summary found')) ? (
          <View style={styles.generateContainer}>
            <Text style={styles.generateText}>{questionsError}</Text>
            {questionsError.includes('summary found') ? (
              <Text style={styles.instructionText}>
                Please go to the document preview and generate a summary first, then come back to create quiz questions.
              </Text>
            ) : (
              <TouchableOpacity 
                onPress={handleGenerateQuestions} 
                disabled={generateLoading} 
                style={[styles.generateBtn, generateLoading && { opacity: 0.6 }]}
              >
                <Text style={styles.generateBtnText}>
                  {generateLoading ? 'Generating Questions...' : 'Generate Quiz Questions'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : questionsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{questionsError}</Text>
            <TouchableOpacity onPress={loadQuizQuestions} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quiz questions available</Text>
          </View>
        ) : !quizCompleted ? (
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
              {questions[currentQuestionIndex].options.map((option: string, index: number) => (
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
  // Loading, error, and generation states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#757575',
    textAlign: 'center',
  },
  generateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  generateText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  generateBtn: {
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#757575',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#757575',
    textAlign: 'center',
  },
}); 