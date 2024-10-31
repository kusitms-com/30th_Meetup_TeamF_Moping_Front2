"use client";

import React, { useState, useEffect, FormEvent } from "react";
import LinkField from "./LinkField";
import { useUserDataStore } from "../../stores/useUserDataStore";
import { useRouter, useParams } from "next/navigation";

interface FormProps {
  userName: string;
}

export default function Form({ userName }: FormProps) {
  const { userData } = useUserDataStore(); // Access userData from zustand
  const [mapLinks, setMapLinks] = useState<string[]>([]);
  const [storeLinks, setStoreLinks] = useState<string[]>([]);
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const router = useRouter();
  const { id } = useParams(); // Retrieve `id` from the route parameters

  // Load mapLinks and storeLinks from the store when the component mounts
  useEffect(() => {
    if (userData) {
      setMapLinks(
        userData.bookmarkUrls?.filter((link) => link.trim() !== "") || []
      );
      setStoreLinks(
        userData.storeUrls?.filter((link) => link.trim() !== "") || []
      );
    }
  }, [userData]);

  // Check if form is complete whenever mapLinks or storeLinks change
  useEffect(() => {
    setIsFormComplete(
      mapLinks.length > 0 && storeLinks.length > 0 // Check for non-empty lists
    );
  }, [mapLinks, storeLinks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Filter out any empty strings just before submitting
    const filteredMapLinks = mapLinks.filter((link) => link.trim() !== "");
    const filteredStoreLinks = storeLinks.filter((link) => link.trim() !== "");

    const formData = {
      nonMemberId: userData?.nonMemberId, // Assuming nonMemberId is available in userData
      bookmarkUrls: filteredMapLinks,
      storeUrls: filteredStoreLinks,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/nonmembers/pings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        console.log("데이터가 성공적으로 전송되었습니다.");
        router.push(`/event-maps/${id}`); // Redirect to the specified route on success
      } else {
        console.error("데이터 전송 실패:", response.status);
      }
    } catch (error) {
      console.error("서버 오류 발생:", error);
    }
  };

  return (
    <div className="px-4">
      <form onSubmit={handleSubmit}>
        <LinkField
          label="맵핀 모음 링크"
          placeholder="링크 붙여넣기"
          value={mapLinks}
          onChange={(links) =>
            setMapLinks(links.filter((link) => link.trim() !== ""))
          }
          showTooltip={isTooltipVisible}
          onInfoClick={() => setIsTooltipVisible(true)}
        />

        <LinkField
          label="가게 정보 링크"
          placeholder="링크 붙여넣기"
          value={storeLinks}
          onChange={(links) =>
            setStoreLinks(links.filter((link) => link.trim() !== ""))
          }
        />

        <button
          className={`w-full flex items-center text-lg font-200 justify-center h-[60px] rounded-small ${
            isFormComplete
              ? "bg-grayscale-90 text-white"
              : "bg-grayscale-20 text-mediumGray"
          }`}
          type="submit"
          disabled={!isFormComplete}
        >
          확인
        </button>
      </form>
    </div>
  );
}
