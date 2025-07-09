import React, { useState } from 'react';

const CommentForm: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', comment: '' });

  return (
    <form className="bg-gray-50 rounded-2xl p-8 max-w-7xl w-full mx-auto mt-10">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">1. Nhập họ tên</label>
          <input className="w-full rounded-lg border px-4 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="*" />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">2. Nhập email</label>
          <input className="w-full rounded-lg border px-4 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="*" />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">3. Nhập số điện thoại</label>
          <input className="w-full rounded-lg border px-4 py-2" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="*" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">4. Viết nhận xét của bạn vào bên dưới</label>
        <textarea className="w-full rounded-lg border px-4 py-2 min-h-[100px]" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="*" />
      </div>
      <button type="button" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-3 rounded-full mt-2">GỬI NGAY</button>
    </form>
  );
};

export default CommentForm; 