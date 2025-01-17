"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navigation from "@/app/components/common/Navigation";
import Button from "@/app/components/common/Button";
import CheckBox from "../../load-mappin/forms/links/components/CheckBox";
import LinkFieldEdit from "./components/EditLink";
import ExitModal from "./components/ExitModal";
import { useUserDataStore } from "../stores/useUserDataStore";

export default function LinkEditPage() {
  const { userData, setUserData } = useUserDataStore();
  const [mapLinks, setMapLinks] = useState<string[]>([]);
  const [storeLinks, setStoreLinks] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [isChecked, setIsChecked] = useState(true);
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { id, nonMemberId } = useParams();

  useEffect(() => {
    if (!id || !nonMemberId) {
      console.error("누락된 라우트 매개변수:", { id, nonMemberId });
      router.push("/error");
      return;
    }

    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData.nonMemberId === Number(nonMemberId)) {
        setMapLinks(
          parsedData.bookmarkUrls.length ? parsedData.bookmarkUrls : [""]
        );
        setStoreLinks(
          parsedData.storeUrls.length ? parsedData.storeUrls : [""]
        );
        setUserName(parsedData.name || "");
        setUserData(parsedData);
      } else {
        console.warn("비회원 ID가 일치하지 않습니다.");
      }
    } else {
      setMapLinks(userData.bookmarkUrls.length ? userData.bookmarkUrls : [""]);
      setStoreLinks(userData.storeUrls.length ? userData.storeUrls : [""]);
      setUserName(userData.name || "");
    }

    setIsLoading(false);
  }, [id, nonMemberId, setUserData, userData, router]);

  useEffect(() => {
    const allMapLinksValid = mapLinks.every((link) => link.trim() !== "");
    const allStoreLinksValid = storeLinks.every((link) => link.trim() !== "");
    const isComplete = (allMapLinksValid || allStoreLinksValid) && isChecked;
    setIsSaveButtonEnabled(isComplete);
  }, [mapLinks, storeLinks, isChecked]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const filteredMapLinks = mapLinks.filter((link) => link.trim() !== "");
    const filteredStoreLinks = storeLinks.filter((link) => link.trim() !== "");

    const updatedData = {
      nonMemberId: userData.nonMemberId || Number(nonMemberId),
      name: userName,
      bookmarkUrls: filteredMapLinks,
      storeUrls: filteredStoreLinks,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/pings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("비회원 핑 업데이트 실패");
      }

      setUserData(updatedData);
      localStorage.setItem("userData", JSON.stringify(updatedData));
      router.push(`/event-maps/${id}`);
    } catch (error) {
      console.error("API 호출 오류:", error);
    }
  };

  const handleBack = () => {
    setShowExitModal(true); // ExitModal을 표시
  };

  const handleExitConfirm = () => {
    // 데이터 삭제 후 뒤로가기
    localStorage.removeItem("userData");
    localStorage.removeItem("formData");
    router.push(`/event-maps/${id}`);
  };

  const handleCancel = () => {
    setShowExitModal(false);
  };

  if (isLoading) {
    return <div />;
  }

  return (
    <div className="w-[360px] h-screen bg-white mx-auto flex flex-col">
      <Navigation onBack={handleBack} />

      <div
        className="flex-1 px-4 mt-[75px] overflow-y-auto"
        style={{
          maxHeight: "calc(100vh - 60px)",
          paddingBottom: "120px",
        }}
      >
        {userName && (
          <div className="text-darkGray text-title-md">
            {userName}님의 맵핀 모음이에요
          </div>
        )}
        <div className="text-[#555555] text-base font-medium leading-relaxed mb-[24px]">
          불러온 북마크를 자유롭게 편집할 수 있어요
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <LinkFieldEdit
            label="북마크 공유 링크"
            placeholder="네이버지도 저장 리스트 붙여넣기"
            value={mapLinks}
            onChange={setMapLinks}
          />
          <LinkFieldEdit
            label="가게 정보 링크"
            placeholder="마음에 쏙 든 가게 하나만 공유하기"
            value={storeLinks}
            onChange={setStoreLinks}
          />
          <div className="flex items-center mb-[20px] w-full">
            <CheckBox
              isChecked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <span className="ml-2 text-[#8e8e8e] text-xs font-medium font-['Pretendard'] leading-none">
              내 공간 정보를 모핑에서 활용하는 것에 동의합니다
            </span>
          </div>
        </form>
      </div>

      <div
        className="w-full px-[16px] bg-white fixed bottom-0 left-0 border-t border-[#f0f0f0]"
        style={{ zIndex: 50 }}
      >
        <Button
          label="저장"
          className={`w-[328px] h-[60px] py-[17px] rounded-lg text-lg font-['Pretendard'] font-medium bg-[#F73A2C] text-white ${
            isSaveButtonEnabled
              ? "bg-black"
              : "bg-[#e0e0e0] pointer-events-none"
          }`}
          onClick={handleSubmit}
          disabled={!isSaveButtonEnabled}
        />
      </div>
      {showExitModal && (
        <ExitModal onCancel={handleCancel} onExit={handleExitConfirm} />
      )}
    </div>
  );
}
