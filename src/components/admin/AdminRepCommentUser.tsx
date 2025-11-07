import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MessageCircle, Send, ChevronRight, User, MapPin, Clock } from 'lucide-react';
import { fetchQuestionsByTourIdOfProvider, fetchToursQuestionByProviderId } from '../../services/question.service';
import { createCommentSocketManager, CommentSocketManager } from '../../services/commentSocket.service';
import { sendQuestion } from '../../services/question.service';
import { fetchTouridsByProviderId } from '../../services/tour.service';
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

const AdminRepCommentUser = () => {
  const [selectedTour, setSelectedTour] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [loadingTours, setLoadingTours] = useState<boolean>(true);
  const [allTourIds, setAllTourIds] = useState<number[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const loadedToursRef = useRef<Set<number>>(new Set());
  const commentSocketManagerRef = useRef<CommentSocketManager>(createCommentSocketManager());
  const questionsScrollRef = useRef<HTMLDivElement>(null);

  // Dữ liệu tour từ API
  const [toursData, setToursData] = useState<ToursData[]>([
      // {
      //   id: 2,
      //   title: "TOUR MIỀN TÂY TẾT DƯƠNG LỊCH 3N2Đ",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1762020102/vietour/xwkjobvezn6arydms5lo.jpg",
      //   duration: "3 ngày 2 đêm",
      //   location: "Hồ Chí Minh",
      //   price: 3200000,
      //   unread: 2
      // },
      // {
      //   id: 5,
      //   title: "Tour Hà Giang - Sông Nho Quế hùng vĩ 3 ngày 2 đêm từ Hà Nội",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1762235832/vietour/cs0ptozspacxi582ss4z.webp",
      //   duration: "3 ngày 2 đêm",
      //   location: "Hồ Chí Minh",
      //   price: 2800000,
      //   unread: 1
      // },
      // {
      //   id: 6,
      //   title: "Tour du lịch Team building, hội thảo, nghỉ dưỡng tại V Resort Hòa Bình 2 ngày 1 đêm",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1762236595/vietour/oorpxiylfyfisgdtsbs1.webp",
      //   duration: "2 ngày 1 đêm",
      //   location: "Hà Nội",
      //   price: 1980000,
      //   unread: 0
      // },
      // {
      //   id: 4,
      //   title: "Tour Tứ Tỉnh Miền Tây 3 ngày 2 đêm từ TP.HCM",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1762192931/vietour/ok7l34bxr2w5a78vhduq.webp",
      //   duration: "3 ngày 2 đêm",
      //   location: "Hồ Chí Minh",
      //   price: 3180000,
      //   unread: 0
      // },
      // {
      //   id: 1,
      //   title: "MỸ THO - CẦN THƠ - CHÂU ĐỐC",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1761976218/vietour/ggjvjrzvrwwy12hr1upy.webp",
      //   duration: "3 ngày 2 đêm",
      //   location: "Hồ Chí Minh",
      //   price: 3000000,
      //   unread: 1
      // },
      // {
      //   id: 3,
      //   title: "Tour Đà Nẵng | Hội An | Quảng Bình | Huế",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1762162437/vietour/sodpkyhlvlv2axcaicwm.png",
      //   duration: "3 ngày 2 đêm",
      //   location: "Hồ Chí Minh",
      //   price: 2800000,
      //   unread: 0
      // },
      // {
      //   id: 7,
      //   title: "Tour Tứ tỉnh miền Tây: Tiền Giang - Bến Tre - An Giang - Đồng Tháp 3 ngày 2 đêm từ TP.HCM - Tết Dương Lịch 2026",
      //   poster_url: "https://res.cloudinary.com/dxiuxuivf/image/upload/v1762236928/vietour/rzrj1zymdjiyfswlrfzw.webp",
      //   duration: "3 ngày 2 đêm",
      //   location: "Hồ Chí Minh",
      //   price: 3680000,
      //   unread: 0
      // }
  ]);

  // Dữ liệu câu hỏi mẫu
  const [questionsData, setQuestionsData] = useState<QuestionsData>({
    // 2: [
    //   {
    //     id: 12,
    //     user_id: 3,
    //     tour_id: 2,
    //     parent_question_id: null,
    //     text: 'Tôi muốn biết thêm thông tin về tour',
    //     created_at: '2025-11-04T11:22:08.887Z',
    //     reported: false,
    //     user: {
    //       id: 3,
    //       first_name: 'Dương',
    //       last_name: 'Phi 2',
    //       avatar: null
    //     },
    //     questions: [
    //       {
    //         id: 13,
    //         user_id: 3,
    //         tour_id: 2,
    //         parent_question_id: 12,
    //         text: 'xin chào',
    //         created_at: '2025-11-04T11:22:25.162Z',
    //         reported: false,
    //         user: {
    //           id: 3,
    //           first_name: 'Dương',
    //           last_name: 'Phi 2',
    //           avatar: null
    //         },
    //         questions: []
    //       }
    //     ]
    //   },
    //   {
    //     id: 10,
    //     user_id: 2,
    //     tour_id: 2,
    //     parent_question_id: null,
    //     text: 'hello',
    //     created_at: '2025-11-04T11:11:59.347Z',
    //     reported: false,
    //     user: {
    //       id: 2,
    //       first_name: 'Dương',
    //       last_name: 'Phi 1',
    //       avatar: null
    //     },
    //     questions: []
    //   }
    // ],
    // 5: [
    //   {
    //     id: 14,
    //     user_id: 4,
    //     tour_id: 5,
    //     parent_question_id: null,
    //     text: 'Tour có đi vào mùa hoa tam giác mạch không?',
    //     created_at: '2025-11-03T10:15:00.000Z',
    //     reported: false,
    //     user: {
    //       id: 4,
    //       first_name: 'Minh',
    //       last_name: 'Nguyễn',
    //       avatar: null
    //     },
    //     questions: []
    //   }
    // ],
    // 1: [
    //   {
    //     id: 15,
    //     user_id: 5,
    //     tour_id: 1,
    //     parent_question_id: null,
    //     text: 'Khách sạn có gần chợ nổi không?',
    //     created_at: '2025-11-02T14:30:00.000Z',
    //     reported: false,
    //     user: {
    //       id: 5,
    //       first_name: 'Hương',
    //       last_name: 'Trần',
    //       avatar: null
    //     },
    //     questions: []
    //   }
    // ]
  });

  useEffect(() => {
    console.log("questionsData", questionsData);
  }, [selectedTour]);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoadingTours(true);
        const res = await fetchToursQuestionByProviderId();
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
      } catch (error) {
        console.error("Error loading tours:", error);
      } finally {
        setLoadingTours(false);
      }
    };
    loadTours();
  }, []);

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
    const handleReceiveComment = (data: { id: number; user: any; text: string; tour_id: number; created_at: string; parent_question_id: number | null; reported: boolean; is_replied: boolean; }) => {
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
          // Nếu là reply, đưa cả question cha lên đầu
          updated = findAndMoveParentToTop(current, newItem.parent_question_id, newItem);
        }
        
        return { ...prev, [tId]: updated };
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
        // Kiểm tra hasMore dựa trên số lượng questions hiện có
        const currentQuestions = questionsData[selectedTour] || [];
        setHasMore(currentQuestions.length % 10 === 0 && currentQuestions.length > 0);
        // Estimate current page dựa trên số lượng questions
        setCurrentPage(Math.ceil(currentQuestions.length / 10) || 1);
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
  const loadMoreQuestions = useCallback(async () => {
    if (!selectedTour || loadingMore || !hasMore) return;
    
    // Lấy số lượng questions hiện tại
    const currentQuestions = questionsData[selectedTour] || [];
    const actualPage = Math.floor(currentQuestions.length / 10);
    const remainder = currentQuestions.length % 10;
    
    // Nếu không phải bội số của 10, cắt khúc để đảm bảo số lượng là bội số của 10
    if (remainder !== 0) {
      const targetLength = actualPage * 10;
      const trimmedQuestions = currentQuestions.slice(0, targetLength);
      
      // Update questionsData và currentPage
      setQuestionsData(prev => ({
        ...prev,
        [selectedTour]: trimmedQuestions
      }));
      setCurrentPage(actualPage);
      
      // Sau khi cắt khúc, user có thể scroll lại để load more
      return;
    }
    
    // Nếu đã là bội số của 10, tiếp tục load more
    try {
      setLoadingMore(true);
      const nextPage = actualPage + 1;
      const res = await fetchQuestionsByTourIdOfProvider(selectedTour, nextPage, 10);
      console.log("res more questions", res.data);
      
      const newQuestions = res.data || [];
      
      // Append questions mới vào danh sách hiện tại
      setQuestionsData(prev => {
        const current = prev[selectedTour] || [];
        // Đảm bảo chỉ append khi số lượng hiện tại là bội số của 10
        const trimmedCurrent = current.slice(0, actualPage * 10);
        return {
          ...prev,
          [selectedTour]: [...trimmedCurrent, ...newQuestions]
        };
      });
      
      // Update page và hasMore
      setCurrentPage(nextPage);
      setHasMore(newQuestions.length === 10);
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
            <button
              onClick={() => setReplyTo(question.id)}
              className="block text-xs text-gray-500 hover:text-gray-700 mt-2 font-medium"
            >
            Trả lời
          </button>
          
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
        <div className="flex-1 overflow-y-auto">
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
            toursData.map(tour => (
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
            ))
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