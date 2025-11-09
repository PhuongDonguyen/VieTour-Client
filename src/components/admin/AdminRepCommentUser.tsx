import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MessageCircle, Send, ChevronRight, User, MapPin, Clock, Trash2 } from 'lucide-react';
import { fetchQuestionsByTourIdOfProvider, fetchToursQuestionByProviderId, delQuestion, fetchQuestionsTree } from '../../services/question.service';
import { createCommentSocketManager, CommentSocketManager } from '../../services/commentSocket.service';
import { sendQuestion } from '../../services/question.service';
import { fetchTouridsByProviderId, fetchTourById } from '../../services/tour.service';
// Interfaces
interface QuestionUser {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

interface Question {
  id: number;
  user_id: number;
  tour_id: number;
  parent_question_id: number | null;
  text: string;
  created_at: string;
  reported: boolean;
  user: QuestionUser | null;
  questions: Question[];
  is_replied: boolean;
}

interface ToursData {
  id: number;
  title: string;
  poster_url: string;
  duration: string;
  location: string;
  price: number;
  unread: number;
}

interface QuestionsData {
  [tourId: number]: Question[];
}

const PAGE_LIMIT = 10;

const AdminRepCommentUser = () => {
  const [selectedTour, setSelectedTour] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [loadingTours, setLoadingTours] = useState<boolean>(true);
  const [allTourIds, setAllTourIds] = useState<number[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Pagination cho tours
  const [currentTourPage, setCurrentTourPage] = useState<number>(1);
  const [hasMoreTours, setHasMoreTours] = useState<boolean>(true);
  const [loadingMoreTours, setLoadingMoreTours] = useState<boolean>(false);
  const loadedToursRef = useRef<Set<number>>(new Set());
  const commentSocketManagerRef = useRef<CommentSocketManager>(createCommentSocketManager());
  const questionsScrollRef = useRef<HTMLDivElement>(null);
  const toursScrollRef = useRef<HTMLDivElement>(null);

  // Dữ liệu tour từ API
  const [toursData, setToursData] = useState<ToursData[]>([]);

  // Dữ liệu câu hỏi mẫu
  const [questionsData, setQuestionsData] = useState<QuestionsData>({});

  useEffect(() => {
    console.log("questionsData", questionsData);
  }, [selectedTour]);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoadingTours(true);
        setCurrentTourPage(1);
        setHasMoreTours(true);
        const res = await fetchToursQuestionByProviderId(1, PAGE_LIMIT);
        console.log("res tour", res.data);
        
        // Map response data vào ToursData format
        const mappedTours: ToursData[] = res.data.map((tour: any) => ({
          id: tour.id,
          title: tour.title,
          poster_url: tour.poster_url,
          duration: tour.duration,
          location: tour.location?.trim() || '',
          price: tour.tour_prices?.[0]?.adult_price || 0,
          unread: 0 // Sẽ tính từ questions data sau
        }));
        
        setToursData(mappedTours);
        // Kiểm tra xem còn data để load không
        setHasMoreTours(mappedTours.length === PAGE_LIMIT);
      } catch (error) {
        console.error("Error loading tours:", error);
      } finally {
        setLoadingTours(false);
      }
    };
    loadTours();
  }, []);

  // Load more tours khi scroll đến bottom
  // Công thức tính page:
  // - actualPage = Math.floor(currentTours.length / pageLimit)
  // - remainder = currentTours.length % pageLimit
  // - Nếu remainder !== 0: cắt bỏ phần dư để đảm bảo số lượng là bội số của pageLimit
  // - Nếu remainder === 0: load page tiếp theo (actualPage + 1)
  const loadMoreTours = useCallback(async () => {
    if (loadingMoreTours || !hasMoreTours) return;
    
    // Lấy số lượng tours hiện tại
    const currentTours = toursData;
    
    // Tính page và remainder dựa trên số lượng tours hiện có
    // Công thức: actualPage = Math.floor(currentTours.length / pageLimit)
    const actualPage = Math.floor(currentTours.length / PAGE_LIMIT);
    const remainder = currentTours.length % PAGE_LIMIT;
    
    // Nếu không phải bội số của PAGE_LIMIT, cắt khúc để đảm bảo số lượng là bội số của PAGE_LIMIT
    if (remainder !== 0) {
      const targetLength = actualPage * PAGE_LIMIT;
      const trimmedTours = currentTours.slice(0, targetLength);
      
      // Update toursData và currentTourPage
      setToursData(trimmedTours);
      setCurrentTourPage(actualPage);
      // Sau khi cắt, có thể còn more nếu actualPage > 0
      setHasMoreTours(actualPage > 0);
      
      // Sau khi cắt khúc, user có thể scroll lại để load more
      return;
    }
    
    // Nếu đã là bội số của PAGE_LIMIT, tiếp tục load more
    try {
      setLoadingMoreTours(true);
      const nextPage = actualPage + 1;
      const res = await fetchToursQuestionByProviderId(nextPage, PAGE_LIMIT);
      console.log("res more tours", res.data);
      
      const newTours = res.data.map((tour: any) => ({
        id: tour.id,
        title: tour.title,
        poster_url: tour.poster_url,
        duration: tour.duration,
        location: tour.location?.trim() || '',
        price: tour.tour_prices?.[0]?.adult_price || 0,
        unread: 0,
      }));
      
      if (newTours.length > 0) {
        // Append tours mới vào danh sách hiện tại
        // Đảm bảo chỉ append khi số lượng hiện tại là bội số của PAGE_LIMIT
        const trimmedCurrent = currentTours.slice(0, actualPage * PAGE_LIMIT);
        setToursData([...trimmedCurrent, ...newTours]);
        
        // Update page và hasMore
        setCurrentTourPage(nextPage);
        setHasMoreTours(newTours.length === PAGE_LIMIT);
      } else {
        // Không còn data để load
        setHasMoreTours(false);
      }
    } catch (error) {
      console.error("Error loading more tours:", error);
    } finally {
      setLoadingMoreTours(false);
    }
  }, [loadingMoreTours, hasMoreTours, toursData]);

  // Handle scroll event cho tour list
  useEffect(() => {
    const scrollContainer = toursScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Khi scroll đến gần bottom (còn 100px)
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMoreTours();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreTours]);

  // Connect socket on mount/unmount
  useEffect(() => {
    commentSocketManagerRef.current.connect();
    return () => {
      commentSocketManagerRef.current.disconnect();
    };
  }, []);

  // Load all tour IDs and join rooms
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    const loadTourIdsAndJoin = async () => {
      try {
        const res = await fetchTouridsByProviderId();
        console.log("res tour ids", res.data);
        // res.data might be { success: true, data: number[] } or just number[]
        const tourIds = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setAllTourIds(tourIds);

        const manager = commentSocketManagerRef.current;
        const joinAllRooms = () => {
          tourIds.forEach((tourId) => {
            manager.joinTour(tourId);
          });
        };

        if (manager.isConnected()) {
          joinAllRooms();
        } else {
          const socket = manager.getSocket();
          const handleConnect = () => joinAllRooms();
          socket.on('connect', handleConnect);
          cleanup = () => { socket.off('connect', handleConnect); };
        }
      } catch (error) {
        console.error("Error loading tour ids:", error);
      }
    };
    loadTourIdsAndJoin();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Helpers to mutate question list
  const appendReplyToTree = (list: Question[], parentId: number, reply: Question): Question[] => {
    return list.map((q) => {
      if (q.id === parentId) {
        return { ...q, questions: [ ...(q.questions || []), reply ] };
      }
      if (q.questions && q.questions.length) {
        return { ...q, questions: appendReplyToTree(q.questions, parentId, reply) };
      }
      return q;
    });
  };
  const removeFromTree = (list: Question[], id: number): Question[] => {
    return list
      .filter((q) => q.id !== id)
      .map((q) => ({ ...q, questions: q.questions ? removeFromTree(q.questions, id) : [] }));
  };
  const updateParentIsReplied = (list: Question[], parentId: number): Question[] => {
    return list.map((q) => {
      if (q.id === parentId) {
        return { ...q, is_replied: true };
      }
      if (q.questions && q.questions.length) {
        return { ...q, questions: updateParentIsReplied(q.questions, parentId) };
      }
      return q;
    });
  };
  const findAndMoveParentToTop = (list: Question[], parentId: number, reply: Question): Question[] => {
    // Tìm question cha trong danh sách
    let parentQuestion: Question | null = null;
    const findParent = (questions: Question[]): Question | null => {
      for (const q of questions) {
        if (q.id === parentId) {
          return q;
        }
        if (q.questions && q.questions.length) {
          const found = findParent(q.questions);
          if (found) return found;
        }
      }
      return null;
    };
    parentQuestion = findParent(list);
    
    if (!parentQuestion) {
      // Nếu không tìm thấy parent, chỉ thêm reply vào tree
      return appendReplyToTree(list, parentId, reply);
    }
    
    // Clone parent và thêm reply vào
    const updatedParent: Question = {
      ...parentQuestion,
      questions: [...(parentQuestion.questions || []), reply],
      is_replied: reply.is_replied ? true : parentQuestion.is_replied,
    };
    
    // Remove parent cũ khỏi danh sách
    const withoutParent = list.filter((q) => q.id !== parentId);
    
    // Đưa parent mới (đã có reply) lên đầu
    return [updatedParent, ...withoutParent];
  };

  // Socket listeners -> update questionsData for current tour
  useEffect(() => {
    const manager = commentSocketManagerRef.current;
    const handleReceiveComment = async (data: { id: number; user: any; text: string; tour_id: number; created_at: string; parent_question_id: number | null; reported: boolean; is_replied: boolean; }) => {
      const tId = data.tour_id;
      const newItem: Question = {
        id: data.id,
        user_id: (data.user && Number(data.user.id)) || 0,
        tour_id: tId,
        parent_question_id: data.parent_question_id,
        text: data.text,
        created_at: data.created_at,
        reported: data.reported,
        user: data.user || { id: 0, first_name: 'Admin', last_name: '', avatar: '/admin-avatar.png' },
        questions: [],
        is_replied: data.is_replied,
      };
      console.log("newItem", newItem);
      
      setQuestionsData((prev) => {
        const current = prev[tId] || [];
        let updated: Question[];
        
        if (newItem.parent_question_id == null) {
          // Nếu là question gốc, đưa lên đầu
          updated = [newItem, ...current];
        } else {
          // Nếu là reply, tìm question cha
          const findParent = (questions: Question[]): Question | null => {
            for (const q of questions) {
              if (q.id === newItem.parent_question_id) {
                return q;
              }
              if (q.questions && q.questions.length) {
                const found = findParent(q.questions);
                if (found) return found;
              }
            }
            return null;
          };
          
          const parentQuestion = findParent(current);
          
          if (!parentQuestion) {
            // Nếu không tìm thấy parent, fetch question tree và thêm vào đầu
            fetchQuestionsTree(newItem.parent_question_id)
              .then((res) => {
                const questionTree = res.data;
                if (questionTree) {
                  setQuestionsData((prevState) => {
                    const currentState = prevState[tId] || [];
                    // Kiểm tra xem question tree đã có trong danh sách chưa
                    const exists = currentState.some((q) => q.id === questionTree.id);
                    if (!exists) {
                      // Thêm question tree vào đầu danh sách
                      return { ...prevState, [tId]: [questionTree, ...currentState] };
                    }
                    return prevState;
                  });
                }
              })
              .catch((error) => {
                console.error("Error fetching question tree:", error);
              });
            // Trả về state hiện tại trong khi đang fetch
            return prev;
          } else {
            // Nếu tìm thấy parent, đưa cả question cha lên đầu
            updated = findAndMoveParentToTop(current, newItem.parent_question_id, newItem);
          }
        }
        
        return { ...prev, [tId]: updated };
      });

      // Cập nhật toursData: chuyển tour lên đầu hoặc fetch nếu chưa có
      setToursData((prevTours) => {
        const existingTourIndex = prevTours.findIndex((tour) => tour.id === tId);
        
        if (existingTourIndex !== -1) {
          // Nếu tour đã có, chuyển lên đầu
          const updatedTours = [...prevTours];
          const [tourToMove] = updatedTours.splice(existingTourIndex, 1);
          return [tourToMove, ...updatedTours];
        } else {
          // Nếu tour chưa có, fetch và thêm vào đầu
          fetchTourById(tId)
            .then((tourData: any) => {
              const newTour: ToursData = {
                id: tourData.id,
                title: tourData.title,
                poster_url: tourData.poster_url,
                duration: typeof tourData.duration === 'number' ? `${tourData.duration} ngày` : (tourData.duration || ''),
                location: tourData.location?.trim() || '',
                price: tourData.tour_prices?.[0]?.adult_price || tourData.price || 0,
                unread: 0,
              };
              setToursData((prevState) => [newTour, ...prevState]);
            })
            .catch((error) => {
              console.error("Error fetching tour:", error);
            });
          // Trả về state hiện tại trong khi đang fetch
          return prevTours;
        }
      });
    };
    const handleReceiveDelete = (id: number) => {
      setQuestionsData((prev) => {
        const updated: QuestionsData = {};
        // Remove question from all tours
        Object.keys(prev).forEach((tourIdStr) => {
          const tourId = Number(tourIdStr);
          const current = prev[tourId] || [];
          const updatedList = removeFromTree(current, id);
          if (updatedList.length > 0 || prev[tourId]) {
            updated[tourId] = updatedList;
          }
        });
        return updated;
      });
    };
    manager.onReceiveComment(handleReceiveComment);
    manager.onReceiveDelete(handleReceiveDelete);
    return () => {
      manager.offReceiveComment(handleReceiveComment);
      manager.offReceiveDelete(handleReceiveDelete);
    };
  }, [selectedTour]);
  
  useEffect(() => {
    console.log("questionsData", questionsData);
  }, [questionsData]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedTour) return;
      
      // Nếu đã load data của tour này rồi thì không load lại
      if (loadedToursRef.current.has(selectedTour)) {
        // Tính page dựa trên số lượng questions hiện có
        // Công thức: actualPage = Math.floor(currentQuestions.length / pageLimit)
        const currentQuestions = questionsData[selectedTour] || [];
        const actualPage = Math.floor(currentQuestions.length / 10);
        const remainder = currentQuestions.length % 10;
        
        // Kiểm tra hasMore: chỉ có more nếu số lượng là bội số của 10 và > 0
        // Nếu có remainder, không thể có more vì đã bị lệch pagination
        setHasMore(remainder === 0 && currentQuestions.length > 0);
        setCurrentPage(actualPage || 1);
        return;
      }
      
      // Reset pagination khi load tour mới lần đầu
      setCurrentPage(1);
      setHasMore(true);
      
      try {
        const res = await fetchQuestionsByTourIdOfProvider(selectedTour, 1, 10);
        console.log("res questions", res.data);
        
        // Chỉ update questions của tour được chọn, không overwrite toàn bộ
        setQuestionsData(prev => ({
          ...prev,
          [selectedTour]: res.data || []
        }));
        
        // Kiểm tra xem còn data để load không
        setHasMore((res.data || []).length === 10);
        
        // Đánh dấu tour này đã được load
        loadedToursRef.current.add(selectedTour);
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };
    loadQuestions();
  }, [selectedTour]);

  // Load more questions khi scroll đến bottom
  // Công thức tính page:
  // - actualPage = Math.floor(currentQuestions.length / pageLimit)
  // - remainder = currentQuestions.length % pageLimit
  // - Nếu remainder !== 0: cắt bỏ phần dư để đảm bảo số lượng là bội số của pageLimit
  // - Nếu remainder === 0: load page tiếp theo (actualPage + 1)
  const loadMoreQuestions = useCallback(async () => {
    if (!selectedTour || loadingMore || !hasMore) return;
    
    // Lấy số lượng questions hiện tại
    const currentQuestions = questionsData[selectedTour] || [];
    
    // Tính page và remainder dựa trên số lượng questions hiện có
    // Công thức: actualPage = Math.floor(currentQuestions.length / pageLimit)
    const pageLimit = 10;
    const actualPage = Math.floor(currentQuestions.length / pageLimit);
    const remainder = currentQuestions.length % pageLimit;
    
    // Nếu không phải bội số của pageLimit, cắt khúc để đảm bảo số lượng là bội số của pageLimit
    if (remainder !== 0) {
      const targetLength = actualPage * pageLimit;
      const trimmedQuestions = currentQuestions.slice(0, targetLength);
      
      // Update questionsData và currentPage
      setQuestionsData(prev => ({
        ...prev,
        [selectedTour]: trimmedQuestions
      }));
      setCurrentPage(actualPage);
      // Sau khi cắt, có thể còn more nếu actualPage > 0
      setHasMore(actualPage > 0);
      
      // Sau khi cắt khúc, user có thể scroll lại để load more
      return;
    }
    
    // Nếu đã là bội số của pageLimit, tiếp tục load more
    try {
      setLoadingMore(true);
      const nextPage = actualPage + 1;
      const res = await fetchQuestionsByTourIdOfProvider(selectedTour, nextPage, pageLimit);
      console.log("res more questions", res.data);
      
      const newQuestions = res.data || [];
      
      if (newQuestions.length > 0) {
        // Append questions mới vào danh sách hiện tại
        // Đảm bảo chỉ append khi số lượng hiện tại là bội số của pageLimit
        const trimmedCurrent = currentQuestions.slice(0, actualPage * pageLimit);
        setQuestionsData(prev => ({
          ...prev,
          [selectedTour]: [...trimmedCurrent, ...newQuestions]
        }));
        
        // Update page và hasMore
        setCurrentPage(nextPage);
        setHasMore(newQuestions.length === pageLimit);
      } else {
        // Không còn data để load
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more questions:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedTour, loadingMore, hasMore, questionsData]);

  // Handle scroll event
  useEffect(() => {
    const scrollContainer = questionsScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Khi scroll đến gần bottom (còn 100px)
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMoreQuestions();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreQuestions]);

  const formatTime = (dateString: string): string => {
    return new Date(dateString)
      .toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false,
      })
      .replace(",", " -");
  };



  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleReply = async (questionId: number): Promise<void> => {
    if (!selectedTour) return;
    if (replyText.trim()) {
      console.log('Reply to question:', questionId, 'Text:', replyText);
      const res = await sendQuestion(null, selectedTour, questionId, replyText, false);
      console.log("res reply", res.data);
      
      // Emit socket event for reply
      commentSocketManagerRef.current.emitSendComment({
        id: res.data.id,
        user: null, // Admin reply, user is null
        tour_id: selectedTour,
        text: replyText,
        parent_question_id: questionId,
        reported: false,
        is_replied: true,
      });
      
      setReplyText('');
      setReplyTo(null);
    }
  };

  const handleDeleteQuestion = async (questionId: number, tourId: number): Promise<void> => {
    if (!selectedTour) return;
    
    // Tìm question trong state để kiểm tra user
    const findQuestion = (questions: Question[], id: number): Question | null => {
      for (const q of questions) {
        if (q.id === id) return q;
        if (q.questions && q.questions.length > 0) {
          const found = findQuestion(q.questions, id);
          if (found) return found;
        }
      }
      return null;
    };

    const currentQuestions = questionsData[tourId] || [];
    const questionToDelete = findQuestion(currentQuestions, questionId);
    
    // Chỉ cho phép xóa nếu question là của admin/provider (user === null hoặc user.id === 0)
    if (questionToDelete && questionToDelete.user && questionToDelete.user.id !== 0) {
      alert('Bạn không thể xóa câu hỏi của người dùng khác.');
      return;
    }
    
    // Xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }

    try {
      // Gọi API xóa question
      await delQuestion(questionId);
      console.log("Deleted question:", questionId);
      
      // Emit socket event để thông báo xóa
      commentSocketManagerRef.current.emitSendDelete({
        id: questionId,
        tour_id: tourId,
      });
      
      // Cập nhật state để xóa question khỏi UI
      setQuestionsData((prev) => {
        const updated: QuestionsData = {};
        Object.keys(prev).forEach((tourIdStr) => {
          const tId = Number(tourIdStr);
          const current = prev[tId] || [];
          const updatedList = removeFromTree(current, questionId);
          if (updatedList.length > 0 || prev[tId]) {
            updated[tId] = updatedList;
          }
        });
        return updated;
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      alert('Không thể xóa câu hỏi. Vui lòng thử lại.');
    }
  };

  const renderQuestion = (question: Question, level = 0) => (
    <div
      key={question.id}
      className={`${level > 0 ? 'ml-12 mt-4' : 'mb-6'} ${!question.is_replied ? 'bg-gray-100' : ''} rounded-md px-2 py-1`}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          {!question.user ? (
            <img src="/admin-avatar.png" alt="Admin" className="w-full h-full rounded-full object-cover" />
          ) : question.user.avatar ? (
            <img src={question.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <div className={`inline-block w-fit min-w-[250px] ${question.is_replied ? 'bg-gray-50' : 'bg-gray-100'} rounded-lg p-4 border border-gray-200 whitespace-pre-wrap break-words`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">
                {!question.user || question.user.id === 0 
                  ? 'Admin' 
                  : `${question.user.last_name} ${question.user.first_name}`.trim() || 'Admin'}
              </span>
              <span className="text-xs text-gray-500">{formatTime(question.created_at)}</span>
            </div>
            <p className="text-sm text-gray-700">{question.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setReplyTo(question.id)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Trả lời
            </button>
            {/* Chỉ hiển thị nút xóa nếu question là của admin/provider (user === null hoặc user.id === 0) */}
            {(!question.user || question.user.id === 0) && (
              <button
                onClick={() => handleDeleteQuestion(question.id, question.tour_id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                title="Xóa câu hỏi"
              >
                <Trash2 className="w-3 h-3" />
                Xóa
              </button>
            )}
          </div>
          
          {replyTo === question.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleReply(question.id)}
                autoFocus
              />
              <button
                onClick={() => handleReply(question.id)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
          {/* removed gray divider for unread messages */}
        </div>
      </div>
      
      {question.questions && question.questions.length > 0 && (
        <div className="mt-2">
          {question.questions.map(reply => renderQuestion(reply, level + 1))}
        </div>
      )}
    </div>
  );

  const selectedTourData = selectedTour ? toursData.find(t => t.id === selectedTour) : undefined;
  const currentQuestions = selectedTour ? (questionsData[selectedTour] || []) : [];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Tour List */}
      <div className="w-96 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold">Danh sách tour</h2>
          <p className="text-sm text-gray-500 mt-1">Chọn tour để xem câu hỏi</p>
        </div>
        <div 
          ref={toursScrollRef}
          className="flex-1 overflow-y-auto"
        >
          {loadingTours ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full p-4 border-b border-gray-200 bg-white animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : toursData.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Chưa có tour nào</p>
              </div>
            </div>
          ) : (
            <>
              {toursData.map(tour => (
                <button
                  key={tour.id}
                  onClick={() => setSelectedTour(tour.id)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-white transition-colors text-left ${
                    selectedTour === tour.id ? 'bg-white border-l-4 border-l-black' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <img 
                      src={tour.poster_url} 
                      alt={tour.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2 mb-2">{tour.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{tour.location.trim()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900">{formatPrice(tour.price)}</span>
                        {tour.unread > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white">
                            {tour.unread} mới
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {loadingMoreTours && (
                <div className="flex justify-center items-center py-4">
                  <div className="text-sm text-gray-500">Đang tải thêm...</div>
                </div>
              )}
              {!hasMoreTours && toursData.length > 0 && (
                <div className="flex justify-center items-center py-4">
                  <div className="text-sm text-gray-500">Đã hiển thị tất cả tour</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content - Questions */}
      <div className="flex-1 flex flex-col">
        {selectedTour && selectedTourData ? (
          <>
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start gap-4">
                <img 
                  src={selectedTourData.poster_url} 
                  alt={selectedTourData.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{selectedTourData.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTourData.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedTourData.location.trim()}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(selectedTourData.price)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {currentQuestions.length > 0 
                      ? `${currentQuestions.length} câu hỏi • Quản lý và trả lời câu hỏi của khách hàng`
                      : 'Chưa có câu hỏi nào'}
                  </p>
                </div>
              </div>
            </div>
            <div 
              ref={questionsScrollRef}
              className="flex-1 overflow-y-auto p-6"
            >
              {currentQuestions.length > 0 ? (
                <>
                  {currentQuestions.map(question => renderQuestion(question))}
                  {loadingMore && (
                    <div className="flex justify-center items-center py-4">
                      <div className="text-sm text-gray-500">Đang tải thêm...</div>
                    </div>
                  )}
                  {!hasMore && currentQuestions.length > 0 && (
                    <div className="flex justify-center items-center py-4">
                      <div className="text-sm text-gray-500">Đã hiển thị tất cả câu hỏi</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">Chưa có câu hỏi</h3>
                    <p className="text-sm text-gray-500">
                      Khách hàng sẽ có thể đặt câu hỏi về tour này
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa chọn tour</h3>
              <p className="text-sm text-gray-500">
                Chọn một tour từ danh sách bên trái để xem và trả lời câu hỏi
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRepCommentUser;