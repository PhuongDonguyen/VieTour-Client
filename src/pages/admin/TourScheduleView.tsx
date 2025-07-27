import React from "react";
import { useParams } from "react-router-dom";
import TourScheduleViewContent from "@/components/admin/tour-schedule/TourScheduleViewContent";

const TourScheduleView: React.FC = () => {
  const { id } = useParams();
  if (!id) return <div>Không tìm thấy lịch trình</div>;
  return <TourScheduleViewContent scheduleId={id} />;
};

export default TourScheduleView;
