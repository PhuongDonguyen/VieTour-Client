import React, { useState, useEffect } from "react";
import { fetchGeneralQuestions } from "@/services/generalQuestion.service";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import type { GeneralQuestion } from "@/apis/generalQuestion.api";

interface TabFAQProps {
  tourId: number;
}

export const TabFAQ: React.FC<TabFAQProps> = ({ tourId }) => {
  const [faqs, setFaqs] = useState<GeneralQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadFAQs = async () => {
      if (!tourId) return;
      
      try {
        setLoading(true);
        const res = await fetchGeneralQuestions({
          tour_id: tourId,
          limit: 50,
          sortBy: "id",
          sortOrder: "ASC"
        });
        console.log("FAQ loaded:", res.data.length);

        setFaqs(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading FAQ:", error);
        setError("Không thể tải câu hỏi thường gặp");
        setLoading(false);
      }
    };

    loadFAQs();
  }, [tourId]);

  const toggleExpanded = (faqId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Câu hỏi thường gặp
          </h2>
        </div>
        
        {/* Skeleton loading */}
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Có lỗi xảy ra
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có câu hỏi thường gặp
        </h3>
        <p className="text-gray-600">
          Chúng tôi sẽ cập nhật câu hỏi thường gặp cho tour này sớm nhất!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Câu hỏi thường gặp ({faqs.length})
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isExpanded = expandedItems.has(faq.id);

          return (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleExpanded(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Answer Content */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 