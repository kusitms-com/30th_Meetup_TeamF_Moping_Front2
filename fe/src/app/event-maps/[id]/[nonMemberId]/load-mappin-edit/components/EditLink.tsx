"use client";

import React, { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import Image from "next/image";

interface LinkFieldEditProps {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
}

interface InputField {
  id: string;
  text: string;
  error: string;
  isValid: boolean;
  isTyping: boolean;
}

// 전체 코드에 에러가 발생할 가능성이 있는 부분 수정
export default function LinkFieldEdit({
  label,
  placeholder,
  value,
  onChange,
}: LinkFieldEditProps) {
  const [inputFields, setInputFields] = useState<InputField[]>(
    value.length > 0
      ? value.map((val) => ({
          id: nanoid(),
          text: val,
          error: "",
          isValid: true,
          isTyping: false,
        }))
      : [
          {
            id: nanoid(),
            text: "",
            error: "",
            isValid: false,
            isTyping: false,
          },
        ]
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 업데이트된 유효 링크 관리
  useEffect(() => {
    const validLinks = inputFields
      .filter((field) => field.isValid)
      .map((field) => field.text);
    onChange(validLinks);
  }, [inputFields, onChange]);

  const validateLink = async (fieldId: string, url: string, type: string) => {
    const endpoint =
      type === "북마크 공유 링크" ? "/pings/bookmark" : "/pings/store";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (response.ok) {
        setInputFields((prevFields) =>
          prevFields.map((fieldItem) =>
            fieldItem.id === fieldId
              ? { ...fieldItem, error: "", isValid: true }
              : fieldItem
          )
        );
      } else {
        const errorResponse = await response.json();
        const errorMessage =
          errorResponse?.message || "링크가 유효하지 않아요.";
        setInputFields((prevFields) =>
          prevFields.map((fieldItem) =>
            fieldItem.id === fieldId
              ? { ...fieldItem, error: errorMessage, isValid: false }
              : fieldItem
          )
        );
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      setInputFields((prevFields) =>
        prevFields.map((fieldItem) =>
          fieldItem.id === fieldId
            ? {
                ...fieldItem,
                error: "URL 검증에 실패했습니다.",
                isValid: false,
              }
            : fieldItem
        )
      );
    }
  };

  const handleInputChange = (fieldId: string, inputValue: string) => {
    setInputFields((prevFields) =>
      prevFields.map((fieldItem) =>
        fieldItem.id === fieldId
          ? { ...fieldItem, text: inputValue, isValid: false, isTyping: true }
          : fieldItem
      )
    );
  };

  const handlePaste = (fieldId: string, event: React.ClipboardEvent) => {
    const pastedText = event.clipboardData.getData("Text").trim();

    if (pastedText) {
      setInputFields((prevFields) =>
        prevFields.map((fieldItem) =>
          fieldItem.id === fieldId
            ? { ...fieldItem, text: pastedText, isValid: false, isTyping: true }
            : fieldItem
        )
      );
      validateLink(fieldId, pastedText, label);
    }
  };

  const handleBlur = (fieldId: string) => {
    const field = inputFields.find((fieldItem) => fieldItem.id === fieldId);
    if (field && field.text) {
      validateLink(fieldId, field.text, label);
    }

    setInputFields((prevFields) =>
      prevFields.map((fieldItem) =>
        fieldItem.id === fieldId ? { ...fieldItem, isTyping: false } : fieldItem
      )
    );
  };

  const addInputField = () => {
    setInputFields((prevFields) => [
      ...prevFields,
      {
        id: nanoid(),
        text: "",
        error: "",
        isValid: false,
        isTyping: false,
      },
    ]);
  };

  const clearInput = (fieldId: string) => {
    setInputFields((prevFields) =>
      prevFields.map((fieldItem) =>
        fieldItem.id === fieldId
          ? { ...fieldItem, text: "", error: "", isValid: false }
          : fieldItem
      )
    );
  };

  const getClassNames = (item: InputField): string => {
    if (item.error && !item.isTyping) {
      return "border-2 border-[#f73a2c] bg-[#F8F8F8]";
    }
    if (item.isValid) {
      return "bg-[#EBF4FD] text-[#3a91ea]";
    }
    if (item.isTyping) {
      return "border-2 border-[#555555] bg-[#F8F8F8]";
    }
    return "bg-[#F8F8F8]";
  };

  return (
    <div className="mb-[48px] relative">
      <label className="text-[#2c2c2c] font-300 text-lg mb-[8px] flex items-center">
        {label}
      </label>
      <div className="flex flex-col items-center border-[#F0F0F0] border p-[16px] rounded-xl w-[328px]">
        {inputFields.map((item, index) => (
          <div
            key={item.id}
            className={`relative w-full ${
              index === inputFields.length - 1 ? "" : "mb-[16px]"
            }`}
          >
            <div
              className={`w-[296px] h-[52px] px-4 py-3.5 pr-[40px] rounded-md inline-flex relative ${getClassNames(
                item
              )}`}
              style={{
                boxSizing: "border-box",
              }}
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={item.text}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                onPaste={(e) => handlePaste(item.id, e)}
                onBlur={() => handleBlur(item.id)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none placeholder:text-[#8e8e8e] text-sm font-medium font-['Pretendard']"
              />
              {item.text && (
                <button
                  type="button"
                  onClick={() => clearInput(item.id)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-[3px]"
                >
                  <Image
                    src={
                      item.isValid ? "/svg/bluecheck.svg" : "/svg/delete.svg"
                    }
                    alt={item.isValid ? "check" : "delete"}
                    width={16}
                    height={16}
                  />
                </button>
              )}
            </div>
            {!item.isTyping && item.error && (
              <div className="text-sm font-medium font-['Pretendard'] text-[#f73a2c] mt-[4px]">
                {item.error}
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addInputField}
          className="mx-auto mt-[16px]"
        >
          <Image src="/svg/linkAdd.svg" alt="linkAdd" width={28} height={28} />
        </button>
      </div>
    </div>
  );
}