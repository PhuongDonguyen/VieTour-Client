import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, Users, Clock, Send } from 'lucide-react';

const AdminChatSupportDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hỗ trợ khách hàng
        </h1>
        <p className="text-gray-600">
          Quản lý và hỗ trợ khách hàng qua hệ thống chat
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-blue-500 mb-2" />
            <CardTitle className="text-lg">Cuộc trò chuyện</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Xem danh sách tất cả cuộc trò chuyện với khách hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <CardTitle className="text-lg">Tin nhắn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Đọc và trả lời tin nhắn từ khách hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Send className="h-12 w-12 mx-auto text-purple-500 mb-2" />
            <CardTitle className="text-lg">Gửi tin nhắn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Gửi tin nhắn hỗ trợ cho khách hàng
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tính năng chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Quản lý cuộc trò chuyện</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Xem danh sách cuộc trò chuyện</li>
                <li>• Hiển thị tin nhắn cuối cùng</li>
                <li>• Đếm số tin nhắn chưa đọc</li>
                <li>• Thời gian tin nhắn cuối</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Gửi và nhận tin nhắn</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gửi tin nhắn văn bản</li>
                <li>• Hỗ trợ hình ảnh</li>
                <li>• Giao diện chat trực quan</li>
                <li>• Tự động cuộn xuống cuối</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatSupportDemo;

