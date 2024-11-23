"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";
import Button from "@/app/components/common/Button";

function LoadingPage() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push("/eventcreate-page");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white px-[14.17px]">
      {/* 상단 여백 */}
      <div className="mt-[32px]"></div>

      {/* 위 선 */}
      <div className="w-full h-[0px] border-t-[1px] border-white mb-[16px]"></div>

      {/* 로고 */}
      <div className="w-full flex">
        <Image
          src="/svg/logo.svg"
          alt="Moping Logo"
          width={170}
          height={24}
          className="h-auto"
        />
      </div>

      {/* 아래 선 */}
      <div className="w-full h-[0px] border-t-[1px] border-white mt-[16px] mb-[32px]"></div>

      {/* 아이콘들 */}
      <div className="grid grid-cols-2 gap-y-[28.69px] gap-x-[28.69px] mb-auto">
        <div className="flex items-center justify-center">
          <Image
            src="/svg/loding1.svg"
            alt="Loading Icon 1"
            width={169}
            height={169}
            className="h-auto"
          />
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/svg/loding2.svg"
            alt="Loading Icon 2"
            width={169}
            height={169}
            className="h-auto"
          />
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/svg/loding3.svg"
            alt="Loading Icon 3"
            width={169}
            height={169}
            className="h-auto"
          />
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/svg/loding4.svg"
            alt="Loading Icon 4"
            width={169}
            height={169}
            className="h-auto"
          />
        </div>
      </div>

      {/* 모핑 시작하기 버튼 */}
      <div className="fixed bottom-[45px] w-full flex justify-center px-4">
        <Button
          label="모핑 시작하기"
          onClick={handleStartClick}
          type="start"
          className="w-full max-w-[328px] h-[60px] py-[17px] rounded-lg bg-[#F73A2C] text-white"
        />
      </div>
    </div>
  );
}

export default LoadingPage;
