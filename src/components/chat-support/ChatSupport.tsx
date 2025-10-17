import React, { useMemo, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChatSidebar } from "./ChatSidebar";
import { ChatBox } from "./ChatBox";
import { useChatSupport } from "./useChatSupport";
import { useAuth } from "@/hooks/useAuth";
import { getProviderProfileById } from "@/apis/providerProfile.api";
import type { Conversation } from "@/apis/conversation.api";
import { toast } from "sonner";

export const ChatSupport: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const providerIdFromUrl = searchParams.get("provider");
  const [newProviderProfile, setNewProviderProfile] = useState<{
    id: number;
    company_name: string;
    avatar: string;
  } | null>(null);
  const [isLoadingNewProvider, setIsLoadingNewProvider] = useState(false);

  const actor: "user" | "provider" =
    user?.role === "provider" ? "provider" : "user";

  const getPeerDisplay = useMemo(() => {
    if (actor === "user") {
      return (conv: Conversation) => {
        const providerProfile = conv.provider;
        return {
          name: providerProfile?.company_name || "",
          avatar: providerProfile?.avatar || "",
        };
      };
    } else {
      return (conv: Conversation) => {
        const userProfile = conv.user;
        const fullName = userProfile
          ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
          : "";
        return {
          name: fullName,
          avatar: userProfile?.avatar || "",
        };
      };
    }
  }, [actor]);

  const {
    conversations,
    filteredConversations,
    selectedConversation,
    selectedConversationId,
    messages,
    messageInput,
    searchQuery,
    isSearchMode,
    isFiltering,
    isConversationsLoading,
    isMessagesLoading,
    isLoadingMore,
    isSending,
    isPeerTyping,
    peerTypingText,
    setMessageInput,
    setSearchQuery,
    handleConversationSelect,
    handleSendMessage,
    handleMessagesScroll,
    refreshConversations,
    setSelectedConversationId,
    actor: hookActor,
    searchConversations,
    setSearchQuery: setHookSearchQuery,
  } = useChatSupport(actor, getPeerDisplay);

  // Wrapper to pass newProviderId when sending message
  const handleSendMessageWithProvider = (imageFile?: File) => {
    handleSendMessage(imageFile, newProviderProfile?.id);
  };

  // Handle provider parameter from URL
  useEffect(() => {
    const handleProviderParam = async () => {
      if (!providerIdFromUrl || isConversationsLoading) {
        return;
      }

      const targetProviderId = parseInt(providerIdFromUrl);

      // Find conversation with the specified provider
      const conversationWithProvider = conversations.find(
        (conv) => conv.provider_id === targetProviderId
      );

      if (conversationWithProvider) {
        // Conversation exists, select it
        setNewProviderProfile(null); // Clear new provider profile
        if (selectedConversationId !== conversationWithProvider.id) {
          handleConversationSelect(conversationWithProvider.id);
        }
      } else {
        // Conversation doesn't exist - fetch provider profile to display
        console.log("No conversation found with provider:", targetProviderId);

        if (actor !== "user") {
          toast.error("Chỉ khách hàng mới có thể tạo cuộc trò chuyện mới");
          setNewProviderProfile(null);
          if (setSelectedConversationId) {
            setSelectedConversationId(null);
          }
          return;
        }

        try {
          setIsLoadingNewProvider(true);
          if (setSelectedConversationId) {
            setSelectedConversationId(null); // Clear selected conversation
          }

          // Fetch provider profile to get name and avatar
          const providerResponse = await getProviderProfileById(
            targetProviderId
          );
          const providerData = providerResponse.data || providerResponse;

          console.log("Provider profile fetched:", providerData);

          // Set the new provider profile to display in ChatBox
          setNewProviderProfile({
            id: targetProviderId,
            company_name: providerData.company_name,
            avatar: providerData.avatar || "",
          });
        } catch (error: any) {
          console.error("Error fetching provider profile:", error);
          toast.error("Không thể tải thông tin nhà cung cấp");
          setNewProviderProfile(null);
          navigate("/chat", { replace: true });
        } finally {
          setIsLoadingNewProvider(false);
        }
      }
    };

    handleProviderParam();
  }, [providerIdFromUrl, conversations, isConversationsLoading, actor]);

  // Handle conversation selection with URL update
  const handleConversationSelectWithUrl = (
    conversationId: number,
    providerId: number
  ) => {
    // Clear new provider profile when selecting existing conversation
    setNewProviderProfile(null);

    // Update URL with provider parameter
    navigate(`/chat?provider=${providerId}`, { replace: true });

    // Select conversation (this will fetch messages)
    handleConversationSelect(conversationId);
  };

  // Prepare conversation data for ChatBox (either selected or new)
  const displayConversation = newProviderProfile
    ? {
        id: 0,
        user_id: user?.id || 0,
        provider_id: newProviderProfile.id,
        name: newProviderProfile.company_name,
        avatar: newProviderProfile.avatar,
        lastMessage: "",
        time: "",
        unread: 0,
        status: "online" as const,
      }
    : selectedConversation;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] min-h-[600px] max-h-[900px] flex max-w-7xl mx-auto mb-1 bg-gradient-to-br border border-orange-200 rounded shadow-lg">
          <ChatSidebar
            conversations={isSearchMode ? filteredConversations : conversations}
            selectedConversationId={selectedConversationId}
            searchQuery={searchQuery}
            onSearchChange={setHookSearchQuery}
            onSearchEnter={(q) => searchConversations(q)}
            onExitSearch={() => {
              setHookSearchQuery("");
              searchConversations("");
            }}
            isSearchMode={isSearchMode}
            onConversationSelect={handleConversationSelectWithUrl}
            isLoading={
              (isSearchMode ? isFiltering : isConversationsLoading) ||
              isLoadingNewProvider
            }
          />

          <ChatBox
            conversation={displayConversation}
            messages={newProviderProfile ? [] : messages}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessageWithProvider}
            onScroll={handleMessagesScroll}
            isSending={isSending}
            isLoading={isMessagesLoading || isLoadingNewProvider}
            isLoadingMore={isLoadingMore}
            actor={actor}
            newProviderId={newProviderProfile?.id}
            isPeerTyping={isPeerTyping}
            peerTypingText={peerTypingText}
          />
        </div>
      </div>
    </div>
  );
};
