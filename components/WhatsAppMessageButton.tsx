"use client";

import React from "react";

interface WhatsAppMessageButtonProps {
  productName: string;
  variant?: string;
  quantity?: number;
  productUrl?: string;
  className?: string;
}

const WhatsAppMessageButton: React.FC<WhatsAppMessageButtonProps> = ({
  productName,
  variant,
  quantity = 1,
  productUrl,
  className,
}) => {
  // Fixed WhatsApp number (no "+" or spaces)
  const yourPhoneNumber = "254799964428";

  let message = `Hello! I'm interested in your product: ${productName}`;
  if (variant) message += ` (Variant: ${variant})`;
  message += `, Quantity: ${quantity}.`;
  if (productUrl) message += `\nCheck it out here: ${productUrl}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${yourPhoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp about ${productName}`}
      className={className}
      role="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="#25D366"
        viewBox="0 0 24 24"
      >
        <path d="M20.52 3.48A11.883 11.883 0 0012 0C5.372 0 0 5.373 0 12a11.95 11.95 0 001.656 6.022L0 24l6.178-1.617A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12 0-3.194-1.245-6.193-3.48-8.52zM12 21.625a9.55 9.55 0 01-4.849-1.4l-.347-.205-3.662.958.978-3.57-.225-.36a9.508 9.508 0 01-1.456-5.09c0-5.246 4.262-9.507 9.508-9.507 2.54 0 4.927.99 6.72 2.783a9.44 9.44 0 012.79 6.724c-.002 5.246-4.264 9.508-9.51 9.508zm5.236-7.197c-.288-.144-1.7-.84-1.963-.937-.263-.1-.456-.144-.648.144-.19.287-.736.936-.9 1.129-.164.19-.327.215-.615.072-.288-.143-1.213-.446-2.312-1.43-.855-.761-1.432-1.7-1.6-1.987-.166-.287-.018-.442.126-.586.13-.129.288-.336.432-.504.144-.168.192-.287.288-.48.096-.19.048-.36-.024-.504-.072-.144-.648-1.56-.89-2.13-.234-.555-.472-.48-.648-.488l-.554-.01c-.19 0-.5.072-.762.36-.263.287-1 1.028-1 2.5 0 1.47 1.025 2.89 1.168 3.093.143.19 2.016 3.07 4.888 4.3.683.296 1.215.473 1.63.605.683.217 1.306.186 1.8.113.55-.084 1.7-.694 1.94-1.36.24-.664.24-1.23.168-1.36-.072-.13-.263-.19-.55-.336z" />
      </svg>
    </a>
  );
};

export default WhatsAppMessageButton;
